import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_DOWNLOADS = 3;
const PRODUCT_FILES_BUCKET = "product-files";
const SIMPLE_WEBSITE_SLUG = "simple-business-website-template";

function makeAttachmentHeaders(filename: string) {
  const fallbackFilename =
    filename
      .normalize("NFKD")
      .replace(/[^\x20-\x7E]/g, "")
      .replace(/["\\]/g, "_")
      .trim() || "TCL-Website-Package.zip";

  return {
    "Content-Type": "application/zip",
    "Content-Disposition": `attachment; filename="${fallbackFilename}"; filename*=UTF-8''${encodeURIComponent(
      filename,
    )}`,
    "Cache-Control": "private, no-store, max-age=0",
    Pragma: "no-cache",
    Expires: "0",
    "X-Content-Type-Options": "nosniff",
  };
}

function redirectToOrderStatus(
  request: Request,
  status:
    | "unavailable"
    | "expired"
    | "limit"
    | "error",
) {
  const url = new URL("/order-status", request.url);

  url.searchParams.set(
    "download",
    status,
  );

  return NextResponse.redirect(url);
}

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      receipt: string;
      fileId: string;
    }>;
  },
) {
  const { receipt, fileId } = await params;

  const receiptToken = receipt.trim();
  const orderFileId = fileId.trim();

  if (!receiptToken || !orderFileId) {
    return redirectToOrderStatus(
      request,
      "unavailable",
    );
  }

  const admin = createAdminSupabaseClient();

  /*
   * 1. Verify the receipt belongs to a completed order.
   */
  const {
    data: order,
    error: orderError,
  } = await admin
    .from("orders")
    .select(
      "id,product_id,payment_status,order_status,download_access_expires_at",
    )
    .eq("receipt_token", receiptToken)
    .eq("payment_status", "COMPLETED")
    .maybeSingle();

  if (orderError) {
    console.error(
      "Unable to load personalized website order:",
      orderError,
    );

    return redirectToOrderStatus(
      request,
      "error",
    );
  }

  if (
    !order ||
    !order.product_id ||
    order.order_status === "CANCELLED"
  ) {
    return redirectToOrderStatus(
      request,
      "unavailable",
    );
  }

  /*
   * 2. Make sure this order is specifically for the
   * Simple Business Website Template.
   */
  const {
    data: product,
    error: productError,
  } = await admin
    .from("products")
    .select("id,slug")
    .eq("id", order.product_id)
    .maybeSingle();

  if (productError) {
    console.error(
      "Unable to verify personalized website product:",
      productError,
    );

    return redirectToOrderStatus(
      request,
      "error",
    );
  }

  if (
    !product ||
    product.slug !== SIMPLE_WEBSITE_SLUG
  ) {
    return redirectToOrderStatus(
      request,
      "unavailable",
    );
  }

  /*
   * 3. Load the personalized ZIP belonging to this exact
   * customer order.
   *
   * order_files is a newly created table, so use a small
   * local typing bypass without changing the rest of your
   * Supabase typings.
   */
  const orderFilesDb = admin as any;

  const {
    data: file,
    error: fileError,
  } = await orderFilesDb
    .from("order_files")
    .select(
      "id,order_id,display_name,storage_path,download_count,last_downloaded_at,is_active",
    )
    .eq("id", orderFileId)
    .eq("order_id", order.id)
    .eq("is_active", true)
    .maybeSingle();

  if (fileError) {
    console.error(
      "Unable to load personalized website file:",
      fileError,
    );

    return redirectToOrderStatus(
      request,
      "error",
    );
  }

  if (!file) {
    return redirectToOrderStatus(
      request,
      "unavailable",
    );
  }

  /*
   * 4. Check the 7-day access window.
   *
   * Unlike your normal digital-product route, we DO NOT
   * create the expiry here.
   *
   * The expiry begins when you upload/deliver the customer's
   * personalized ZIP from Admin.
   */
  const accessExpiresAt =
    order.download_access_expires_at as string | null;

  if (!accessExpiresAt) {
    return redirectToOrderStatus(
      request,
      "unavailable",
    );
  }

  const expiryTime =
    new Date(accessExpiresAt).getTime();

  if (
    !Number.isFinite(expiryTime) ||
    Date.now() >= expiryTime
  ) {
    return redirectToOrderStatus(
      request,
      "expired",
    );
  }

  /*
   * 5. Check the customer's remaining downloads.
   */
  const currentDownloadCount = Math.max(
    0,
    Number(file.download_count ?? 0),
  );

  if (
    currentDownloadCount >= MAX_DOWNLOADS
  ) {
    return redirectToOrderStatus(
      request,
      "limit",
    );
  }

  /*
   * 6. Retrieve the ZIP BEFORE consuming a download.
   *
   * If Supabase Storage fails, the customer does not lose
   * one of their three attempts.
   */
  const {
    data: storageFile,
    error: storageError,
  } = await admin.storage
    .from(PRODUCT_FILES_BUCKET)
    .download(file.storage_path);

  if (storageError || !storageFile) {
    console.error(
      "Unable to retrieve personalized website ZIP:",
      storageError,
    );

    return redirectToOrderStatus(
      request,
      "error",
    );
  }

  /*
   * 7. Claim one download.
   *
   * We require the current count to still match what we read.
   * This prevents two simultaneous requests from both using
   * the same download slot.
   */
  const nextDownloadCount =
    currentDownloadCount + 1;

  const now =
    new Date().toISOString();

  const {
    data: updatedRows,
    error: updateError,
  } = await orderFilesDb
    .from("order_files")
    .update({
      download_count:
        nextDownloadCount,

      last_downloaded_at:
        now,

      updated_at:
        now,
    })
    .eq("id", file.id)
    .eq("order_id", order.id)
    .eq("is_active", true)
    .eq(
      "download_count",
      currentDownloadCount,
    )
    .select("id,download_count");

  if (updateError) {
    console.error(
      "Unable to claim personalized website download:",
      updateError,
    );

    return redirectToOrderStatus(
      request,
      "error",
    );
  }

  if (
    !updatedRows ||
    updatedRows.length === 0
  ) {
    /*
     * Another download may have happened at the same time.
     * Recheck the latest count instead of accidentally giving
     * an extra download.
     */
    const {
      data: latestFile,
      error: latestError,
    } = await orderFilesDb
      .from("order_files")
      .select(
        "download_count,is_active",
      )
      .eq("id", file.id)
      .eq("order_id", order.id)
      .maybeSingle();

    if (latestError) {
      console.error(
        "Unable to recheck personalized website download count:",
        latestError,
      );

      return redirectToOrderStatus(
        request,
        "error",
      );
    }

    if (
      !latestFile?.is_active ||
      Number(
        latestFile.download_count ?? 0,
      ) >= MAX_DOWNLOADS
    ) {
      return redirectToOrderStatus(
        request,
        "limit",
      );
    }

    return redirectToOrderStatus(
      request,
      "error",
    );
  }

  /*
   * 8. Return the private ZIP directly.
   *
   * The customer never receives the Supabase storage path,
   * service-role key, or public bucket URL.
   */
  const bytes =
    await storageFile.arrayBuffer();

  return new NextResponse(
    Buffer.from(bytes),
    {
      status: 200,
      headers: makeAttachmentHeaders(
        file.display_name,
      ),
    },
  );
}