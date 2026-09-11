import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CopyOrderNumberButton from "@/components/CopyOrderNumberButton";
import CopyReceiptLinkButton from "@/components/CopyReceiptLinkButton";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Received | TCL Systems & Digitals PH",
  robots: { index: false, follow: false },
};

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: currency || "PHP",
  }).format(amount);
}

function formatStatus(value: string | null | undefined) {
  if (!value) return "Processing";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function SimpleBusinessWebsiteSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    receipt?: string | string[];
  }>;
}) {
  const params = await searchParams;

  const receiptToken =
    typeof params.receipt === "string" ? params.receipt.trim() : "";

  if (!receiptToken) {
    redirect("/order-status");
  }

  const supabase = createAdminSupabaseClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      customer_name,
      customer_email,
      product_id,
      product_name,
      selected_design_slug,
      selected_design_name,
      total_amount,
      currency,
      payment_status,
      order_status,
      delivery_status,
      receipt_token,
      paid_at,
      created_at
      `,
    )
    .eq("receipt_token", receiptToken)
    .eq("payment_status", "COMPLETED")
    .maybeSingle();

  if (orderError) {
    console.error(
      "Simple website success order load error:",
      orderError,
    );
  }

  if (!order) {
    return (
      <>
        <SiteHeader />

        <main
          style={{
            minHeight: "calc(100vh - 160px)",
            padding: "48px 20px 80px",
            background:
              "linear-gradient(180deg, #fffdfd 0%, #fff8fa 100%)",
          }}
        >
          <section
            style={{
              width: "100%",
              maxWidth: 720,
              margin: "0 auto",
              padding: "clamp(32px,6vw,58px)",
              background: "#fff",
              border: "1px solid var(--border)",
              borderRadius: 24,
              textAlign: "center",
              boxShadow: "0 18px 50px rgba(49,37,41,.06)",
            }}
          >
            <span className="section-kicker">Order verification</span>

            <h1
              style={{
                margin: "14px 0",
                fontSize: "clamp(2rem,5vw,2.8rem)",
              }}
            >
              We couldn&apos;t verify this order.
            </h1>

            <p
              style={{
                margin: "0 auto 24px",
                maxWidth: 560,
                color: "var(--text-soft)",
                lineHeight: 1.7,
              }}
            >
              Please use your order number and checkout email to check your
              purchase status.
            </p>

            <Link href="/order-status" className="button button-primary">
              Check Order Status →
            </Link>
          </section>
        </main>

        <SiteFooter />
      </>
    );
  }

  const { data: product, error: productError } = order.product_id
    ? await supabase
        .from("products")
        .select("id,name,slug")
        .eq("id", order.product_id)
        .maybeSingle()
    : { data: null, error: null };

  if (productError) {
    console.error(
      "Simple website success product load error:",
      productError,
    );
  }

  if (
    product?.slug &&
    product.slug !== "simple-business-website-template"
  ) {
    redirect(
      `/checkout/success?receipt=${encodeURIComponent(receiptToken)}`,
    );
  }

  const deliveryStatus = String(order.delivery_status ?? "").toUpperCase();

  const isReady =
    deliveryStatus === "DELIVERED" ||
    deliveryStatus === "READY" ||
    deliveryStatus === "READY_FOR_DOWNLOAD" ||
    deliveryStatus === "COMPLETED";

  const statusLabel = isReady
    ? "Ready for Download"
    : formatStatus(order.delivery_status) === "Pending"
      ? "Processing"
      : formatStatus(order.delivery_status);

  return (
    <>
      <SiteHeader />

      <main
        style={{
          minHeight: "calc(100vh - 160px)",
          padding: "32px 20px 80px",
          background:
            "linear-gradient(180deg, #fffdfd 0%, #fff8fa 100%)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 860,
            margin: "0 auto",
          }}
        >
          <nav
            aria-label="Page navigation"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 28,
            }}
          >
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: 44,
                color: "var(--text-soft)",
                fontSize: ".78rem",
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              Return Home →
            </Link>
          </nav>

          <section
            style={{
              width: "100%",
              padding: "clamp(30px,6vw,62px)",
              background: "#fff",
              border: "1px solid var(--border)",
              borderRadius: 24,
              boxShadow: "0 18px 50px rgba(49,37,41,.08)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                aria-hidden="true"
                style={{
                  width: 72,
                  height: 72,
                  margin: "0 auto 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  background: "rgba(217,86,139,.12)",
                  color: "#a84369",
                  fontSize: 32,
                  fontWeight: 900,
                }}
              >
                ✓
              </div>

              <span className="section-kicker">Payment received</span>

              <h1
                style={{
                  margin: "14px 0",
                  fontSize: "clamp(2rem,5vw,3rem)",
                }}
              >
                Thank you
                {order.customer_name ? `, ${order.customer_name}` : ""}!
              </h1>

              <p
                style={{
                  maxWidth: 620,
                  margin: "0 auto",
                  color: "var(--text-soft)",
                  lineHeight: 1.75,
                }}
              >
                Your payment for{" "}
                <strong>{product?.name ?? order.product_name}</strong> has been
                completed successfully.
              </p>
            </div>

            <section
              style={{
                marginTop: 32,
                padding: "20px",
                border: "1px solid var(--border)",
                borderRadius: 16,
                display: "grid",
                gap: 16,
              }}
            >
              <div>
                <small
                  style={{
                    display: "block",
                    marginBottom: 5,
                    color: "var(--text-light)",
                    fontWeight: 800,
                    letterSpacing: ".05em",
                  }}
                >
                  ORDER NUMBER
                </small>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <strong>{order.order_number}</strong>
                  <CopyOrderNumberButton
                    orderNumber={order.order_number}
                  />
                </span>
              </div>

              <div>
                <small
                  style={{
                    display: "block",
                    marginBottom: 5,
                    color: "var(--text-light)",
                    fontWeight: 800,
                    letterSpacing: ".05em",
                  }}
                >
                  AMOUNT PAID
                </small>

                <strong>
                  {formatAmount(
                    Number(order.total_amount ?? 0),
                    order.currency || "PHP",
                  )}
                </strong>
              </div>

              {order.selected_design_name ? (
                <div
                  style={{
                    padding: "14px 16px",
                    border: "1px solid rgba(217,86,139,.18)",
                    borderRadius: 12,
                    background: "rgba(217,86,139,.055)",
                  }}
                >
                  <small
                    style={{
                      display: "block",
                      marginBottom: 5,
                      color: "var(--text-light)",
                      fontWeight: 800,
                      letterSpacing: ".05em",
                    }}
                  >
                    SELECTED DESIGN
                  </small>

                  <strong>{order.selected_design_name}</strong>
                </div>
              ) : null}
            </section>

            <section
              style={{
                marginTop: 24,
                padding: "clamp(24px,4vw,32px)",
                border: "1px solid rgba(217,86,139,.22)",
                borderRadius: 18,
                background:
                  "linear-gradient(145deg, rgba(217,86,139,.08), rgba(255,255,255,.96))",
              }}
            >
              <span className="section-kicker">
                Website package preparation
              </span>

              <h2
                style={{
                  margin: "10px 0",
                  fontSize: "clamp(1.45rem,4vw,2rem)",
                }}
              >
                {isReady
                  ? "Your website package is ready"
                  : "Your website package is being prepared"}
              </h2>

              {!isReady ? (
                <>
                  <p
                    style={{
                      margin: 0,
                      color: "var(--text-soft)",
                      lineHeight: 1.75,
                    }}
                  >
                    TCL Systems &amp; Digitals PH is preparing your website
                    package specifically for this order and your selected
                    design.
                  </p>

                  <div
                    style={{
                      marginTop: 18,
                      padding: "16px",
                      borderRadius: 13,
                      background: "#fff",
                      border: "1px solid rgba(217,86,139,.18)",
                    }}
                  >
                    <small
                      style={{
                        display: "block",
                        marginBottom: 5,
                        color: "var(--text-light)",
                        fontWeight: 800,
                        letterSpacing: ".05em",
                      }}
                    >
                      CURRENT STATUS
                    </small>

                    <strong
                      style={{
                        color: "#9d4567",
                        fontSize: "1.05rem",
                      }}
                    >
                      Processing
                    </strong>
                  </div>

                  <p
                    style={{
                      margin: "18px 0 0",
                      color: "var(--text-soft)",
                      lineHeight: 1.7,
                    }}
                  >
                    Please allow <strong>up to 24 hours</strong> for your
                    package to be prepared. You do not need to stay on this
                    page.
                  </p>

                  <p
                    style={{
                      margin: "10px 0 0",
                      color: "var(--text-soft)",
                      lineHeight: 1.7,
                    }}
                  >
                    Once your files are ready, they will appear through your
                    Order Status page.
                  </p>
                </>
              ) : (
                <>
                  <p
                    style={{
                      margin: 0,
                      color: "var(--text-soft)",
                      lineHeight: 1.75,
                    }}
                  >
                    Your prepared website package is ready. Open your Order
                    Status page to access your delivery and download
                    information.
                  </p>

                  <div
                    style={{
                      marginTop: 18,
                      padding: "16px",
                      borderRadius: 13,
                      background: "#fff",
                      border: "1px solid rgba(217,86,139,.18)",
                    }}
                  >
                    <small
                      style={{
                        display: "block",
                        marginBottom: 5,
                        color: "var(--text-light)",
                        fontWeight: 800,
                        letterSpacing: ".05em",
                      }}
                    >
                      CURRENT STATUS
                    </small>

                    <strong
                      style={{
                        color: "#9d4567",
                        fontSize: "1.05rem",
                      }}
                    >
                      {statusLabel}
                    </strong>
                  </div>
                </>
              )}
            </section>

            <section
              style={{
                marginTop: 24,
                padding: "clamp(22px,4vw,28px)",
                border: "1px solid rgba(217,86,139,.2)",
                borderRadius: 18,
                background:
                  "linear-gradient(145deg, rgba(217,86,139,.07), rgba(255,255,255,.98))",
                textAlign: "center",
              }}
            >
              <span className="section-kicker">
                Keep track of your purchase
              </span>

              <h2
                style={{
                  margin: "10px 0",
                  fontSize: "clamp(1.35rem,4vw,1.75rem)",
                }}
              >
                Check your order status anytime
              </h2>

              <p
                style={{
                  maxWidth: 620,
                  margin: "0 auto",
                  color: "var(--text-soft)",
                  lineHeight: 1.7,
                }}
              >
                Use your order number{" "}
                <strong>{order.order_number}</strong> and the same email
                address you used at checkout.
              </p>

              <Link
                href="/order-status"
                className="button button-primary"
                style={{
                  width: "100%",
                  maxWidth: 360,
                  minHeight: 52,
                  marginTop: 20,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                Track Order Status →
              </Link>
            </section>

            <div
              style={{
                marginTop: 26,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <CopyReceiptLinkButton />

              <Link
                href="/"
                className="button button-primary"
                style={{
                  minWidth: 150,
                  minHeight: 48,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Return Home →
              </Link>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}