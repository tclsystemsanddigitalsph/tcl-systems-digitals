import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CopyOrderNumberButton from "@/components/CopyOrderNumberButton";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import styles from "../checkout.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment Successful | TCL Systems & Digitals PH",
  robots: {
    index: false,
    follow: false,
  },
};

const SIMPLE_WEBSITE_SLUG =
  "simple-business-website-template";

function formatAmount(
  amount: number,
  currency: string,
) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: currency || "PHP",
  }).format(amount);
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
    typeof params.receipt === "string"
      ? params.receipt.trim()
      : "";

  const supabase =
    createAdminSupabaseClient();

  let order: {
    order_number: string;
    customer_name: string | null;
    product_name: string;
    product_id: string | null;
    selected_design_name: string | null;
    total_amount: number;
    currency: string;
    payment_status: string;
    order_status: string | null;
  } | null = null;

  let validProduct = false;

  if (receiptToken) {
    const {
      data: orderData,
      error: orderError,
    } = await supabase
      .from("orders")
      .select(
        "order_number,customer_name,product_name,product_id,selected_design_name,total_amount,currency,payment_status,order_status",
      )
      .eq("receipt_token", receiptToken)
      .eq("payment_status", "COMPLETED")
      .maybeSingle();

    if (orderError) {
      console.error(
        "Unable to load Simple Business Website order:",
        orderError,
      );
    }

    if (orderData) {
      order = {
        ...orderData,
        total_amount: Number(
          orderData.total_amount ?? 0,
        ),
      };

      if (orderData.product_id) {
        const {
          data: product,
          error: productError,
        } = await supabase
          .from("products")
          .select("slug")
          .eq(
            "id",
            orderData.product_id,
          )
          .maybeSingle();

        if (productError) {
          console.error(
            "Unable to verify Simple Business Website product:",
            productError,
          );
        }

        validProduct =
          product?.slug ===
          SIMPLE_WEBSITE_SLUG;
      }
    }
  }

  const validReceipt =
    Boolean(order) &&
    validProduct &&
    order?.payment_status ===
      "COMPLETED";

  return (
    <>
      <SiteHeader />

      <main
        className={styles.page}
        style={{
          minHeight:
            "calc(100vh - 160px)",
        }}
      >
        <div className="container">
          <nav
            aria-label="Page navigation"
            style={{
              display: "flex",
              justifyContent:
                "flex-end",
              marginBottom: 28,
            }}
          >
            <Link
              href="/"
              className={styles.back}
              style={{
                minHeight: 44,
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Return Home →
            </Link>
          </nav>

          {!validReceipt ||
          !order ? (
            <section
              style={{
                maxWidth: 720,
                margin: "0 auto",
                padding:
                  "clamp(34px,6vw,58px)",
                background: "#fff",
                border:
                  "1px solid var(--border)",
                borderRadius: 24,
                textAlign: "center",
              }}
            >
              <span className="section-kicker">
                Order verification
              </span>

              <h1>
                We couldn&apos;t verify
                this receipt.
              </h1>

              <p
                style={{
                  color:
                    "var(--text-soft)",
                  lineHeight: 1.7,
                }}
              >
                This page is only
                available for a verified
                Simple Business Website
                Template purchase.
              </p>

              <Link
                href="/shop"
                className="button button-primary"
                style={{
                  minWidth: 150,
                  minHeight: 48,
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                }}
              >
                Back to Shop
              </Link>
            </section>
          ) : (
            <section
              style={{
                width: "100%",
                maxWidth: 820,
                margin: "0 auto",
                padding:
                  "clamp(34px,6vw,64px)",
                background: "#fff",
                border:
                  "1px solid var(--border)",
                borderRadius: 24,
                boxShadow:
                  "0 18px 50px rgba(49,37,41,.08)",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: 72,
                    height: 72,
                    margin:
                      "0 auto 24px",
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    borderRadius:
                      "50%",
                    background:
                      "rgba(217,86,139,.12)",
                    fontSize: 32,
                  }}
                >
                  ✓
                </div>

                <span className="section-kicker">
                  Payment successful
                </span>

                <h1
                  style={{
                    margin:
                      "14px 0",
                    fontSize:
                      "clamp(2rem,5vw,3rem)",
                  }}
                >
                  Thank you
                  {order.customer_name
                    ? `, ${order.customer_name}`
                    : ""}
                  !
                </h1>

                <p
                  style={{
                    maxWidth: 620,
                    margin:
                      "0 auto",
                    color:
                      "var(--text-soft)",
                    lineHeight: 1.75,
                  }}
                >
                  Your payment has been
                  confirmed. We&apos;ll
                  now prepare your
                  personalized website
                  package for your
                  selected design.
                </p>
              </div>

              <div
                style={{
                  marginTop: 32,
                  padding: 20,
                  border:
                    "1px solid var(--border)",
                  borderRadius: 16,
                  display: "grid",
                  gap: 16,
                }}
              >
                <div>
                  <small>
                    ORDER NUMBER
                  </small>

                  <br />

                  <span
                    style={{
                      display:
                        "inline-flex",
                      alignItems:
                        "center",
                      gap: 8,
                      marginTop: 4,
                      flexWrap: "wrap",
                    }}
                  >
                    <strong>
                      {
                        order.order_number
                      }
                    </strong>

                    <CopyOrderNumberButton
                      orderNumber={
                        order.order_number
                      }
                    />
                  </span>
                </div>

                <div>
                  <small>
                    PRODUCT
                  </small>

                  <br />

                  <strong
                    style={{
                      display:
                        "inline-block",
                      marginTop: 4,
                    }}
                  >
                    {order.product_name}
                  </strong>
                </div>

                <div
                  style={{
                    padding:
                      "14px 16px",
                    border:
                      "1px solid rgba(217,86,139,.18)",
                    borderRadius: 12,
                    background:
                      "rgba(217,86,139,.055)",
                  }}
                >
                  <small>
                    SELECTED DESIGN
                  </small>

                  <br />

                  <strong
                    style={{
                      display:
                        "inline-block",
                      marginTop: 4,
                    }}
                  >
                    {order.selected_design_name ||
                      "Selected design"}
                  </strong>
                </div>

                <div>
                  <small>
                    AMOUNT PAID
                  </small>

                  <br />

                  <strong
                    style={{
                      display:
                        "inline-block",
                      marginTop: 4,
                    }}
                  >
                    {formatAmount(
                      order.total_amount,
                      order.currency,
                    )}
                  </strong>
                </div>
              </div>

              <section
                style={{
                  marginTop: 26,
                  padding:
                    "clamp(24px,4vw,32px)",
                  border:
                    "1px solid rgba(217,86,139,.22)",
                  borderRadius: 18,
                  background:
                    "linear-gradient(145deg, rgba(217,86,139,.08), rgba(255,255,255,.98))",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems:
                      "flex-start",
                    gap: 16,
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      width: 48,
                      height: 48,
                      flex:
                        "0 0 48px",
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      borderRadius:
                        "50%",
                      background:
                        "#fff",
                      border:
                        "1px solid rgba(217,86,139,.2)",
                      fontSize: 22,
                    }}
                  >
                    ⏳
                  </div>

                  <div>
                    <span className="section-kicker">
                      Status: Processing
                    </span>

                    <h2
                      style={{
                        margin:
                          "10px 0 8px",
                      }}
                    >
                      Your website package
                      is being prepared.
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        color:
                          "var(--text-soft)",
                        lineHeight: 1.75,
                      }}
                    >
                      Please allow up to{" "}
                      <strong>
                        24 hours
                      </strong>{" "}
                      for TCL Systems
                      &amp; Digitals PH to
                      prepare your
                      personalized website
                      package.
                    </p>

                    <p
                      style={{
                        margin:
                          "12px 0 0",
                        color:
                          "var(--text-soft)",
                        lineHeight: 1.75,
                      }}
                    >
                      Once your package is
                      ready, you&apos;ll
                      be able to download
                      it through the Order
                      Status page.
                    </p>
                  </div>
                </div>
              </section>

              <section
                style={{
                  marginTop: 24,
                  padding:
                    "clamp(22px,4vw,28px)",
                  border:
                    "1px solid var(--border)",
                  borderRadius: 18,
                  textAlign: "center",
                }}
              >
                <span className="section-kicker">
                  Keep track of your order
                </span>

                <h2
                  style={{
                    margin:
                      "10px 0",
                  }}
                >
                  Check your order status
                  anytime
                </h2>

                <p
                  style={{
                    maxWidth: 620,
                    margin:
                      "0 auto",
                    color:
                      "var(--text-soft)",
                    lineHeight: 1.7,
                  }}
                >
                  Use your order number
                  and the same email
                  address used at checkout
                  to check when your
                  website package is
                  ready.
                </p>

                <Link
                  href="/order-status"
                  className="button button-primary"
                  style={{
                    width: "100%",
                    maxWidth: 360,
                    minHeight: 52,
                    marginTop: 20,
                    display:
                      "inline-flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    textAlign:
                      "center",
                  }}
                >
                  Check Order Status →
                </Link>
              </section>

              <div
                style={{
                  marginTop: 24,
                  paddingTop: 20,
                  borderTop:
                    "1px solid var(--border)",
                  display: "flex",
                  justifyContent:
                    "flex-end",
                }}
              >
                <Link
                  href="/"
                  className="button button-secondary"
                  style={{
                    minWidth: 160,
                    minHeight: 48,
                    display:
                      "inline-flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                  }}
                >
                  Return Home
                </Link>
              </div>
            </section>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}