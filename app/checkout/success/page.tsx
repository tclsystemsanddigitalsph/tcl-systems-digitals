import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import styles from "../checkout.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment Successful | TCL Systems & Digitals PH",
  robots: { index: false, follow: false },
};

type CompletedOrder = {
  order_number: string;
  customer_name: string;
  product_id: string | null;
  product_name: string;
  total_amount: number;
  currency: string;
  payment_status: string;
  paypal_order_id: string | null;
};

type PurchasedProduct = {
  name: string;
  slug: string;
  post_purchase_instructions: string | null;
  delivery_method: string;
};

type ProductFileRecord = {
  id: string;
  display_name: string;
  storage_path: string;
  display_order: number;
};

type DownloadFile = {
  id: string;
  displayName: string;
  signedUrl: string;
};

function formatAmount(
  amount: number,
  currency: string,
) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
  }).format(amount);
}

export default async function CheckoutSuccessPage({
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

  let order: CompletedOrder | null = null;
  let product: PurchasedProduct | null = null;
  let downloads: DownloadFile[] = [];

  if (receiptToken) {
    const supabase = createAdminSupabaseClient();

    const { data: orderData, error: orderError } =
      await supabase
        .from("orders")
        .select(
          "order_number,customer_name,product_id,product_name,total_amount,currency,payment_status,paypal_order_id",
        )
        .eq("receipt_token", receiptToken)
        .eq("payment_status", "COMPLETED")
        .maybeSingle();

    if (orderError) {
      console.error(
        "Unable to load completed order:",
        orderError,
      );
    }

    if (orderData) {
      order = {
        ...orderData,
        total_amount: Number(orderData.total_amount),
      } as CompletedOrder;

      if (orderData.product_id) {
        const {
          data: productData,
          error: productError,
        } = await supabase
          .from("products")
          .select(
            "name,slug,post_purchase_instructions,delivery_method",
          )
          .eq("id", orderData.product_id)
          .maybeSingle();

        if (productError) {
          console.error(
            "Unable to load purchased product:",
            productError,
          );
        }

        if (productData) {
          product =
            productData as PurchasedProduct;

          const {
            data: fileRows,
            error: filesError,
          } = await supabase
            .from("product_files")
            .select(
              "id,display_name,storage_path,display_order",
            )
            .eq("product_id", orderData.product_id)
            .eq("is_active", true)
            .order("display_order", {
              ascending: true,
            })
            .order("display_name", {
              ascending: true,
            });

          if (filesError) {
            console.error(
              "Unable to load purchased product files:",
              filesError,
            );
          }

          const records =
            (fileRows ?? []) as ProductFileRecord[];

          const signedFiles = await Promise.all(
            records.map(async (file) => {
              const {
                data: signedData,
                error: signedError,
              } = await supabase.storage
                .from("product-files")
                .createSignedUrl(
                  file.storage_path,
                  60 * 30,
                );

              if (
                signedError ||
                !signedData?.signedUrl
              ) {
                console.error(
                  "Unable to create signed product download:",
                  file.storage_path,
                  signedError,
                );

                return null;
              }

              return {
                id: file.id,
                displayName: file.display_name,
                signedUrl: signedData.signedUrl,
              } satisfies DownloadFile;
            }),
          );

          downloads = signedFiles.filter(
            (
              file,
            ): file is DownloadFile =>
              file !== null,
          );
        }
      }
    }
  }

  const validReceipt =
    Boolean(order) &&
    order?.payment_status === "COMPLETED";

  return (
    <>
      <SiteHeader />

      <main
        className={styles.page}
        style={{
          minHeight: "calc(100vh - 160px)",
        }}
      >
        <div className="container">
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
              className={styles.back}
              style={{
                minHeight: 44,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Return Home →
            </Link>
          </nav>

          {!validReceipt ? (
            <section
              style={{
                width: "100%",
                maxWidth: 720,
                margin: "0 auto",
                padding: "clamp(34px, 6vw, 58px)",
                background: "var(--surface, #fff)",
                border: "1px solid var(--border)",
                borderRadius: 24,
                boxShadow:
                  "0 18px 50px rgba(49, 37, 41, 0.08)",
                textAlign: "center",
              }}
            >
              <span className="section-kicker">
                Order verification
              </span>

              <h1
                style={{
                  marginTop: 14,
                  marginBottom: 16,
                  fontSize:
                    "clamp(2rem, 5vw, 2.7rem)",
                  lineHeight: 1.1,
                }}
              >
                We couldn&apos;t verify this receipt.
              </h1>

              <p
                style={{
                  maxWidth: 560,
                  margin: "0 auto",
                  color: "var(--text-soft)",
                  lineHeight: 1.7,
                }}
              >
                Purchase instructions and files are
                only available after a verified
                completed payment.
              </p>

              <div
                style={{
                  marginTop: 30,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Link
                  href="/shop"
                  className="button button-primary"
                  style={{
                    minHeight: 48,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Back to Shop
                </Link>
              </div>
            </section>
          ) : (
            <section
              aria-labelledby="payment-success-heading"
              style={{
                width: "100%",
                maxWidth: 860,
                margin: "0 auto",
                padding:
                  "clamp(34px, 6vw, 64px)",
                background: "var(--surface, #fff)",
                border: "1px solid var(--border)",
                borderRadius: 24,
                boxShadow:
                  "0 18px 50px rgba(49, 37, 41, 0.08)",
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
                    background:
                      "rgba(217, 86, 139, 0.12)",
                    border:
                      "1px solid rgba(217, 86, 139, 0.18)",
                    fontSize: 32,
                    lineHeight: 1,
                  }}
                >
                  ✓
                </div>

                <span className="section-kicker">
                  Payment received
                </span>

                <h1
                  id="payment-success-heading"
                  style={{
                    marginTop: 14,
                    marginBottom: 14,
                    fontSize:
                      "clamp(2rem, 5vw, 3rem)",
                    lineHeight: 1.08,
                  }}
                >
                  Thank you
                  {order?.customer_name
                    ? `, ${order.customer_name}`
                    : ""}
                  !
                </h1>

                <p
                  style={{
                    maxWidth: 620,
                    margin: "0 auto",
                    color: "var(--text-soft)",
                    fontSize:
                      "clamp(1rem, 2vw, 1.08rem)",
                    lineHeight: 1.7,
                  }}
                >
                  Your payment for{" "}
                  <strong>
                    {product?.name ??
                      order!.product_name}
                  </strong>{" "}
                  was completed successfully.
                </p>
              </div>

              <div
                style={{
                  marginTop: 32,
                  padding: 20,
                  border:
                    "1px solid var(--border)",
                  borderRadius: 16,
                  background:
                    "rgba(255, 255, 255, 0.68)",
                  display: "grid",
                  gap: 14,
                }}
              >
                <div>
                  <small
                    style={{
                      display: "block",
                      marginBottom: 5,
                      color: "var(--text-soft)",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    Order number
                  </small>
                  <strong>
                    {order!.order_number}
                  </strong>
                </div>

                <div>
                  <small
                    style={{
                      display: "block",
                      marginBottom: 5,
                      color: "var(--text-soft)",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    Amount paid
                  </small>
                  <strong>
                    {formatAmount(
                      order!.total_amount,
                      order!.currency,
                    )}
                  </strong>
                </div>

                {order!.paypal_order_id && (
                  <div>
                    <small
                      style={{
                        display: "block",
                        marginBottom: 5,
                        color: "var(--text-soft)",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform:
                          "uppercase",
                      }}
                    >
                      PayPal reference
                    </small>

                    <strong
                      style={{
                        display: "block",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {order!.paypal_order_id}
                    </strong>
                  </div>
                )}
              </div>

              <section
                aria-labelledby="next-steps-heading"
                style={{
                  marginTop: 30,
                  padding:
                    "clamp(22px, 4vw, 30px)",
                  border:
                    "1px solid var(--border)",
                  borderRadius: 18,
                  background:
                    "rgba(217, 86, 139, 0.055)",
                }}
              >
                <span className="section-kicker">
                  Your instructions
                </span>

                <h2
                  id="next-steps-heading"
                  style={{
                    marginTop: 10,
                    marginBottom: 16,
                    fontSize:
                      "clamp(1.35rem, 4vw, 1.8rem)",
                  }}
                >
                  Instructions for{" "}
                  {product?.name ??
                    order!.product_name}
                </h2>

                <div
                  style={{
                    color: "var(--text-soft)",
                    fontSize: "1rem",
                    lineHeight: 1.8,
                    whiteSpace: "pre-wrap",
                    overflowWrap: "anywhere",
                  }}
                >
                  {product?.post_purchase_instructions?.trim() ||
                    "Your payment has been confirmed. TCL Systems & Digitals PH will contact you with the next steps for this purchase."}
                </div>
              </section>

              <section
                aria-labelledby="downloads-heading"
                style={{
                  marginTop: 24,
                  padding:
                    "clamp(22px, 4vw, 30px)",
                  border:
                    "1px solid var(--border)",
                  borderRadius: 18,
                  background:
                    "rgba(255, 255, 255, 0.72)",
                }}
              >
                <span className="section-kicker">
                  Your files
                </span>

                <h2
                  id="downloads-heading"
                  style={{
                    marginTop: 10,
                    marginBottom: 10,
                    fontSize:
                      "clamp(1.35rem, 4vw, 1.8rem)",
                  }}
                >
                  Download your purchase
                </h2>

                {downloads.length > 0 ? (
                  <>
                    <p
                      style={{
                        marginTop: 0,
                        marginBottom: 20,
                        color: "var(--text-soft)",
                        lineHeight: 1.7,
                      }}
                    >
                      These download links are private
                      and temporary. If a link expires,
                      reopen this verified receipt page
                      to generate a new one.
                    </p>

                    <div
                      style={{
                        display: "grid",
                        gap: 12,
                      }}
                    >
                      {downloads.map((file) => (
                        <a
                          key={file.id}
                          href={file.signedUrl}
                          className="button button-primary"
                          style={{
                            width: "100%",
                            minHeight: 50,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent:
                              "space-between",
                            gap: 16,
                            textAlign: "left",
                          }}
                        >
                          <span>
                            {file.displayName}
                          </span>

                          <span aria-hidden="true">
                            Download ↓
                          </span>
                        </a>
                      ))}
                    </div>
                  </>
                ) : (
                  <p
                    style={{
                      margin: 0,
                      color: "var(--text-soft)",
                      lineHeight: 1.7,
                    }}
                  >
                    No automatic download files are
                    attached to this product yet.
                    {product?.delivery_method ===
                    "MANUAL"
                      ? " This item is currently set for manual delivery."
                      : ""}
                  </p>
                )}
              </section>

              <div
                style={{
                  marginTop: 32,
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                <Link
                  href="/shop"
                  className="button button-primary"
                  style={{
                    minWidth: 150,
                    minHeight: 48,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Back to Shop
                </Link>

                {product?.slug && (
                  <Link
                    href={`/shop/${encodeURIComponent(
                      product.slug,
                    )}`}
                    className={styles.back}
                    style={{
                      minHeight: 48,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingInline: 14,
                    }}
                  >
                    View Product →
                  </Link>
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
