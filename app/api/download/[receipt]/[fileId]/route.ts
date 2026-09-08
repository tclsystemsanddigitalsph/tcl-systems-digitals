import { isIP } from "node:net";
import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

const MAX_DOWNLOADS = 3;
const ACCESS_DAYS = 7;

type DownloadResult =
  | "SUCCESS"
  | "LIMIT_REACHED"
  | "EXPIRED"
  | "UNAVAILABLE"
  | "ERROR";

function normalizeIp(value: string | null) {
  if (!value) return null;

  let candidate = value.split(",")[0]?.trim() || "";
  if (!candidate) return null;

  if (candidate.startsWith("[") && candidate.includes("]")) {
    candidate = candidate.slice(1, candidate.indexOf("]"));
  } else if (
    candidate.includes(".") &&
    candidate.lastIndexOf(":") > candidate.lastIndexOf(".")
  ) {
    const possibleIp = candidate.slice(0, candidate.lastIndexOf(":"));
    if (isIP(possibleIp)) candidate = possibleIp;
  }

  return isIP(candidate) ? candidate : null;
}

function getClientIp(request: Request) {
  return (
    normalizeIp(request.headers.get("x-forwarded-for")) ||
    normalizeIp(request.headers.get("x-real-ip")) ||
    normalizeIp(request.headers.get("cf-connecting-ip")) ||
    null
  );
}

function parseUserAgent(userAgent: string | null) {
  const ua = userAgent ?? "";

  let deviceType = "Desktop";
  if (/ipad|tablet|playbook|silk/i.test(ua)) {
    deviceType = "Tablet";
  } else if (/mobi|iphone|ipod|android.*mobile|windows phone/i.test(ua)) {
    deviceType = "Mobile";
  }

  let browser = "Unknown";
  if (/edg\//i.test(ua)) {
    browser = "Edge";
  } else if (/opr\/|opera/i.test(ua)) {
    browser = "Opera";
  } else if (/firefox\/|fxios\//i.test(ua)) {
    browser = "Firefox";
  } else if (/crios\//i.test(ua)) {
    browser = "Chrome";
  } else if (/chrome\/|chromium\//i.test(ua)) {
    browser = "Chrome";
  } else if (/safari\//i.test(ua) && /version\//i.test(ua)) {
    browser = "Safari";
  }

  let operatingSystem = "Unknown";
  if (/iphone|ipad|ipod/i.test(ua)) {
    operatingSystem = "iOS/iPadOS";
  } else if (/android/i.test(ua)) {
    operatingSystem = "Android";
  } else if (/windows nt/i.test(ua)) {
    operatingSystem = "Windows";
  } else if (/macintosh|mac os x/i.test(ua)) {
    operatingSystem = "macOS";
  } else if (/cros/i.test(ua)) {
    operatingSystem = "ChromeOS";
  } else if (/linux/i.test(ua)) {
    operatingSystem = "Linux";
  }

  return { deviceType, browser, operatingSystem };
}

async function writeDownloadLog({
  admin,
  orderId,
  productFileId,
  request,
  result,
}: {
  admin: ReturnType<typeof createAdminSupabaseClient>;
  orderId: string;
  productFileId: string;
  request: Request;
  result: DownloadResult;
}) {
  const userAgent = request.headers.get("user-agent");
  const { deviceType, browser, operatingSystem } = parseUserAgent(userAgent);
  const ipAddress = getClientIp(request);

  const payload = {
    order_id: orderId,
    product_file_id: productFileId,
    ip_address: ipAddress,
    user_agent: userAgent,
    device_type: deviceType,
    browser,
    operating_system: operatingSystem,
    result,
  };

  const { error } = await admin.from("download_logs").insert(payload);

  if (!error) return;

  console.error("Unable to write download audit log:", {
    result,
    orderId,
    productFileId,
    ipAddress,
    error,
  });

  if (ipAddress) {
    const { error: retryError } = await admin.from("download_logs").insert({
      ...payload,
      ip_address: null,
    });

    if (retryError) {
      console.error("Unable to write download audit log without IP:", {
        result,
        orderId,
        productFileId,
        error: retryError,
      });
    }
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ receipt: string; fileId: string }> },
) {
  const { receipt, fileId } = await params;
  const receiptToken = receipt.trim();
  const productFileId = fileId.trim();

  const fallback = new URL(
    `/checkout/success?receipt=${encodeURIComponent(receiptToken)}`,
    request.url,
  );

  if (!receiptToken || !productFileId) {
    fallback.searchParams.set("download", "unavailable");
    return NextResponse.redirect(fallback);
  }

  const admin = createAdminSupabaseClient();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select(
      "id,product_id,payment_status,order_status,paid_at,created_at,download_access_expires_at",
    )
    .eq("receipt_token", receiptToken)
    .eq("payment_status", "COMPLETED")
    .maybeSingle();

  if (orderError) {
    console.error("Unable to load order for protected download:", orderError);
    fallback.searchParams.set("download", "error");
    return NextResponse.redirect(fallback);
  }

  if (!order || !order.product_id || order.order_status === "CANCELLED") {
    fallback.searchParams.set("download", "unavailable");
    return NextResponse.redirect(fallback);
  }

  const { data: file, error: fileError } = await admin
    .from("product_files")
    .select("id,product_id,storage_path,is_active")
    .eq("id", productFileId)
    .eq("product_id", order.product_id)
    .eq("is_active", true)
    .maybeSingle();

  if (fileError) {
    console.error("Unable to load protected product file:", fileError);
    fallback.searchParams.set("download", "error");
    return NextResponse.redirect(fallback);
  }

  if (!file) {
    fallback.searchParams.set("download", "unavailable");
    return NextResponse.redirect(fallback);
  }

  let accessExpiresAt = order.download_access_expires_at as string | null;

  if (!accessExpiresAt) {
    const base = new Date(order.paid_at || order.created_at || Date.now());
    const expires = new Date(
      base.getTime() + ACCESS_DAYS * 24 * 60 * 60 * 1000,
    );
    accessExpiresAt = expires.toISOString();

    const { error: expiryError } = await admin
      .from("orders")
      .update({
        download_access_expires_at: accessExpiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .is("download_access_expires_at", null);

    if (expiryError) {
      console.error("Unable to set download access expiry:", expiryError);
    }
  }

  const expiryTime = new Date(accessExpiresAt).getTime();

  if (!Number.isFinite(expiryTime) || Date.now() >= expiryTime) {
    await writeDownloadLog({
      admin,
      orderId: order.id,
      productFileId: file.id,
      request,
      result: "EXPIRED",
    });

    fallback.searchParams.set("download", "expired");
    return NextResponse.redirect(fallback);
  }

  let expiryMinutes = 30;

  try {
    const settings = await getSiteSettings();
    expiryMinutes = Math.max(
      1,
      Number(settings.download_link_expiry_minutes) || 30,
    );
  } catch (error) {
    console.error("Unable to load signed URL expiry setting:", error);
  }

  const { data: signed, error: signedError } = await admin.storage
    .from("product-files")
    .createSignedUrl(file.storage_path, expiryMinutes * 60);

  if (signedError || !signed?.signedUrl) {
    console.error("Unable to create protected download URL:", signedError);

    await writeDownloadLog({
      admin,
      orderId: order.id,
      productFileId: file.id,
      request,
      result: "ERROR",
    });

    fallback.searchParams.set("download", "error");
    return NextResponse.redirect(fallback);
  }

  const { data: claimRows, error: claimError } = await admin.rpc(
    "claim_product_download",
    {
      p_order_id: order.id,
      p_product_file_id: file.id,
      p_max_downloads: MAX_DOWNLOADS,
    },
  );

  if (claimError) {
    console.error("Unable to claim protected download:", claimError);

    await writeDownloadLog({
      admin,
      orderId: order.id,
      productFileId: file.id,
      request,
      result: "ERROR",
    });

    fallback.searchParams.set("download", "error");
    return NextResponse.redirect(fallback);
  }

  const claim = Array.isArray(claimRows) ? claimRows[0] : claimRows;

  if (!claim?.allowed) {
    await writeDownloadLog({
      admin,
      orderId: order.id,
      productFileId: file.id,
      request,
      result: "LIMIT_REACHED",
    });

    fallback.searchParams.set("download", "limit");
    return NextResponse.redirect(fallback);
  }

  await writeDownloadLog({
    admin,
    orderId: order.id,
    productFileId: file.id,
    request,
    result: "SUCCESS",
  });

  return NextResponse.redirect(signed.signedUrl);
}
