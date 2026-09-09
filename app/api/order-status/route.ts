import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const MAX_DOWNLOADS = 3;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizeOrderNumber(value: string) {
  return value.trim().toUpperCase();
}

function requirementsButtonLabel(status: string) {
  if (status === "NEED_MORE_INFO") return "Update Requirements →";

  if (status === "IN_PROGRESS" || status === "NOT_STARTED") {
    return status === "NOT_STARTED"
      ? "Complete Requirements →"
      : "Continue Requirements →";
  }

  if (
    status === "SUBMITTED" ||
    status === "RESUBMITTED" ||
    status === "APPROVED"
  ) {
    return "View Requirements →";
  }

  return "View Requirements →";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      orderNumber?: string;
      email?: string;
    };

    const orderNumber = normalizeOrderNumber(body.orderNumber || "");
    const email = normalizeEmail(body.email || "");

    if (!orderNumber || !email) {
      return NextResponse.json(
        {
          ok: false,
          error: "Please enter your order number and purchase email.",
        },
        {
          status: 400,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    const supabase = createAdminSupabaseClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        "id,order_number,customer_name,customer_email,product_id,product_name,base_price,processing_fee_percent,processing_fee,total_amount,currency,payment_provider,payment_status,order_status,refund_status,refunded_amount,delivery_status,paid_at,delivered_at,created_at,receipt_token,download_access_expires_at",
      )
      .eq("order_number", orderNumber)
      .maybeSingle();

    if (orderError) {
      console.error("Order status lookup error:", orderError);

      return NextResponse.json(
        {
          ok: false,
          error: "Unable to check this order right now. Please try again.",
        },
        {
          status: 500,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    if (
      !order ||
      normalizeEmail(order.customer_email || "") !== email
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "We couldn't find an order matching that order number and purchase email.",
        },
        {
          status: 404,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    let product: {
      slug: string | null;
      category: string | null;
      product_type: string | null;
      post_purchase_instructions: string | null;
      delivery_method: string | null;
    } | null = null;

    if (order.product_id) {
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select(
          "slug,category,product_type,post_purchase_instructions,delivery_method",
        )
        .eq("id", order.product_id)
        .maybeSingle();

      if (productError) {
        console.error("Order status product load error:", productError);
      } else {
        product = productData;
      }
    }

    const { data: projectData, error: projectError } = await supabase
      .from("project_requirements")
      .select(
        "secure_token,requirements_status,project_status,customer_update_note,submitted_at,approved_at,completed_at",
      )
      .eq("order_id", order.id)
      .maybeSingle();

    if (projectError) {
      console.error("Order status project load error:", projectError);
    }

    let files: Array<{
      id: string;
      name: string;
      downloadCount: number;
      remainingDownloads: number;
    }> = [];

    if (order.product_id) {
      const { data: fileRows, error: filesError } = await supabase
        .from("product_files")
        .select("id,display_name,display_order")
        .eq("product_id", order.product_id)
        .eq("is_active", true)
        .order("display_order")
        .order("display_name");

      if (filesError) {
        console.error("Order status files load error:", filesError);
      }

      if (fileRows && fileRows.length > 0) {
        const { data: counters, error: counterError } = await supabase
          .from("order_downloads")
          .select("product_file_id,download_count")
          .eq("order_id", order.id);

        if (counterError) {
          console.error("Order status download counters error:", counterError);
        }

        const countMap = new Map(
          (counters ?? []).map((item: any) => [
            item.product_file_id,
            Number(item.download_count ?? 0),
          ]),
        );

        files = fileRows.map((file: any) => {
          const downloadCount = countMap.get(file.id) ?? 0;

          return {
            id: file.id,
            name: file.display_name,
            downloadCount,
            remainingDownloads: Math.max(
              0,
              MAX_DOWNLOADS - downloadCount,
            ),
          };
        });
      }
    }

    const accessExpiresAt = order.download_access_expires_at || null;
    const accessActive =
      Boolean(accessExpiresAt) &&
      Date.now() < new Date(accessExpiresAt).getTime() &&
      order.order_status !== "CANCELLED";

    const receiptUrl =
      order.payment_status === "COMPLETED" && order.receipt_token
        ? `/checkout/success?receipt=${encodeURIComponent(
            order.receipt_token,
          )}`
        : null;

    const project = projectData
      ? {
          requirementsStatus: projectData.requirements_status,
          projectStatus: projectData.project_status,
          submittedAt: projectData.submitted_at,
          approvedAt: projectData.approved_at,
          completedAt: projectData.completed_at,
          customerUpdateNote:
            projectData.requirements_status === "NEED_MORE_INFO"
              ? projectData.customer_update_note || null
              : null,
          requirementsUrl: `/project-requirements/${encodeURIComponent(
            projectData.secure_token,
          )}`,
          requirementsButtonLabel: requirementsButtonLabel(
            projectData.requirements_status,
          ),
        }
      : null;

    return NextResponse.json(
      {
        ok: true,
        data: {
          order: {
            orderNumber: order.order_number,
            customerName: order.customer_name,
            customerEmail: order.customer_email,
            productName: order.product_name,
            productSlug: product?.slug ?? null,
            productCategory: product?.category ?? null,
            productType: product?.product_type ?? null,
            createdAt: order.created_at,
            paidAt: order.paid_at,
            totalAmount: Number(order.total_amount ?? 0),
            basePrice: Number(order.base_price ?? 0),
            processingFee: Number(order.processing_fee ?? 0),
            processingFeePercent: Number(
              order.processing_fee_percent ?? 0,
            ),
            currency: order.currency || "PHP",
            paymentProvider: order.payment_provider,
            paymentStatus: order.payment_status,
            orderStatus: order.order_status,
            deliveryStatus: order.delivery_status,
            deliveredAt: order.delivered_at,
            refundStatus: order.refund_status,
            refundedAmount: Number(order.refunded_amount ?? 0),
            downloadAccessExpiresAt: accessExpiresAt,
          },
          project,
          digitalAccess: {
            hasFiles: files.length > 0,
            accessActive,
            accessExpiresAt,
            maxDownloadsPerFile: MAX_DOWNLOADS,
            files,
          },
          product: product
            ? {
                postPurchaseInstructions:
                  product.post_purchase_instructions,
                deliveryMethod: product.delivery_method,
              }
            : null,
          actions: {
            receiptUrl,
            supportUrl: "https://t.me/tclsystemsanddigitalsph",
          },
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("Order status API error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to check your order right now. Please try again.",
      },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
