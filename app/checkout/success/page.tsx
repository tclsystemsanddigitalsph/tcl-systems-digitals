import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CopyReceiptLinkButton from "@/components/CopyReceiptLinkButton";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { getSiteSettings } from "@/lib/site-settings";
import styles from "../checkout.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment Successful | TCL Systems & Digitals PH",
  robots: { index: false, follow: false },
};

const MAX_DOWNLOADS = 3;
const ACCESS_DAYS = 7;

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency }).format(amount);
}
function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium", timeStyle: "short",
  }).format(new Date(value));
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ receipt?: string | string[]; download?: string | string[] }>;
}) {
  const params = await searchParams;
  const receiptToken = typeof params.receipt === "string" ? params.receipt.trim() : "";
  const downloadMessage = typeof params.download === "string" ? params.download : "";

  let order: any = null;
  let product: any = null;
  let files: Array<{ id: string; displayName: string; count: number }> = [];
  let downloadExpiryMinutes = 30;
  let accessExpiresAt: string | null = null;

  try {
    const settings = await getSiteSettings();
    downloadExpiryMinutes = settings.download_link_expiry_minutes;
  } catch (error) {
    console.error("Unable to load download expiry setting:", error);
  }

  if (receiptToken) {
    const supabase = createAdminSupabaseClient();
    const { data: orderData, error } = await supabase
      .from("orders")
      .select("id,order_number,customer_name,product_id,product_name,total_amount,currency,payment_status,order_status,paypal_order_id,paid_at,created_at,download_access_expires_at")
      .eq("receipt_token", receiptToken)
      .eq("payment_status", "COMPLETED")
      .maybeSingle();

    if (error) console.error("Unable to load completed order:", error);

    if (orderData) {
      order = { ...orderData, total_amount: Number(orderData.total_amount) };

      if (!orderData.download_access_expires_at) {
        const base = new Date(orderData.paid_at || orderData.created_at);
        const expires = new Date(base.getTime() + ACCESS_DAYS * 86400000).toISOString();
        const { data: updated } = await supabase
          .from("orders")
          .update({ download_access_expires_at: expires, updated_at: new Date().toISOString() })
          .eq("id", orderData.id)
          .is("download_access_expires_at", null)
          .select("download_access_expires_at")
          .maybeSingle();
        accessExpiresAt = updated?.download_access_expires_at || expires;
      } else {
        accessExpiresAt = orderData.download_access_expires_at;
      }

      if (orderData.product_id) {
        const { data: productData } = await supabase
          .from("products")
          .select("name,slug,post_purchase_instructions,delivery_method")
          .eq("id", orderData.product_id).maybeSingle();
        product = productData;

        const { data: fileRows } = await supabase
          .from("product_files")
          .select("id,display_name,display_order")
          .eq("product_id", orderData.product_id).eq("is_active", true)
          .order("display_order").order("display_name");

        const { data: counters } = await supabase
          .from("order_downloads")
          .select("product_file_id,download_count")
          .eq("order_id", orderData.id);

        const countMap = new Map(
          (counters ?? []).map((x: any) => [x.product_file_id, Number(x.download_count ?? 0)]),
        );
        files = (fileRows ?? []).map((file: any) => ({
          id: file.id, displayName: file.display_name, count: countMap.get(file.id) ?? 0,
        }));
      }
    }
  }

  const validReceipt = Boolean(order) && order?.payment_status === "COMPLETED";
  const accessActive =
    Boolean(accessExpiresAt) &&
    Date.now() < new Date(accessExpiresAt as string).getTime() &&
    order?.order_status !== "CANCELLED";

  return (
    <>
      <SiteHeader />
      <main className={styles.page} style={{ minHeight: "calc(100vh - 160px)" }}>
        <div className="container">
          <nav aria-label="Page navigation" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 28 }}>
            <Link href="/" className={styles.back} style={{ minHeight: 44, display: "inline-flex", alignItems: "center" }}>
              Return Home →
            </Link>
          </nav>

          {!validReceipt ? (
            <section style={{ maxWidth: 720, margin: "0 auto", padding: "clamp(34px,6vw,58px)", background: "#fff", border: "1px solid var(--border)", borderRadius: 24, textAlign: "center" }}>
              <span className="section-kicker">Order verification</span>
              <h1>We couldn&apos;t verify this receipt.</h1>
              <p style={{ color: "var(--text-soft)", lineHeight: 1.7 }}>
                Purchase instructions and files are only available after a verified completed payment.
              </p>
              <Link href="/shop" className="button button-primary">Back to Shop</Link>
            </section>
          ) : (
            <section style={{ width: "100%", maxWidth: 860, margin: "0 auto", padding: "clamp(34px,6vw,64px)", background: "#fff", border: "1px solid var(--border)", borderRadius: 24, boxShadow: "0 18px 50px rgba(49,37,41,.08)" }}>
              <div style={{ textAlign: "center" }}>
                <div aria-hidden="true" style={{ width: 72, height: 72, margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "rgba(217,86,139,.12)", fontSize: 32 }}>✓</div>
                <span className="section-kicker">Payment received</span>
                <h1 style={{ margin: "14px 0", fontSize: "clamp(2rem,5vw,3rem)" }}>
                  Thank you{order.customer_name ? `, ${order.customer_name}` : ""}!
                </h1>
                <p style={{ color: "var(--text-soft)", lineHeight: 1.7 }}>
                  Your payment for <strong>{product?.name ?? order.product_name}</strong> was completed successfully.
                </p>
              </div>

              <div style={{ marginTop: 32, padding: 20, border: "1px solid var(--border)", borderRadius: 16, display: "grid", gap: 14 }}>
                <div><small>ORDER NUMBER</small><br/><strong>{order.order_number}</strong></div>
                <div><small>AMOUNT PAID</small><br/><strong>{formatAmount(order.total_amount, order.currency)}</strong></div>
                {order.paypal_order_id ? <div><small>PAYPAL REFERENCE</small><br/><strong>{order.paypal_order_id}</strong></div> : null}
              </div>

              <section style={{ marginTop: 30, padding: "clamp(22px,4vw,30px)", border: "1px solid var(--border)", borderRadius: 18, background: "rgba(217,86,139,.055)" }}>
                <span className="section-kicker">Your instructions</span>
                <h2>Instructions for {product?.name ?? order.product_name}</h2>
                <div style={{ color: "var(--text-soft)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                  {product?.post_purchase_instructions?.trim() || "Your payment has been confirmed. TCL Systems & Digitals PH will contact you with the next steps for this purchase."}
                </div>
              </section>

              {files.length > 0 ? (
                <section style={{ marginTop: 24, padding: "clamp(22px,4vw,30px)", border: "1px solid var(--border)", borderRadius: 18 }}>
                  <span className="section-kicker">Your files</span>
                  <h2>Download your purchase</h2>

                  {downloadMessage ? (
                    <div style={{ marginBottom: 16, padding: 12, borderRadius: 12, background: "#fff4f6", color: "#8d4051" }}>
                      {downloadMessage === "expired" ? "Your 7-day download access has expired. Please contact TCL if you need access restored." :
                       downloadMessage === "limit" ? "The 3-download limit for this file has been reached. Please contact TCL if you need access restored." :
                       downloadMessage === "error" ? "We could not prepare this download. Please try again or contact TCL." :
                       "This file is currently unavailable."}
                    </div>
                  ) : null}

                  <div style={{ marginBottom: 20, padding: "14px 16px", border: "1px solid rgba(217,86,139,.18)", borderRadius: 14, background: "rgba(217,86,139,.06)" }}>
                    <strong style={{ display: "block", marginBottom: 6 }}>Important Download Information</strong>
                    <p style={{ margin: 0, color: "var(--text-soft)", lineHeight: 1.65 }}>
                      Your files are available for <strong>7 days</strong> after purchase, with up to <strong>3 downloads per file</strong>.
                      Each secure file link is temporary and expires after <strong>{downloadExpiryMinutes} minutes</strong>.
                      Please save your files to your device and keep this private receipt link secure. If your access period or download
                      limit is reached, contact TCL Systems &amp; Digitals PH for assistance.
                    </p>
                    {accessExpiresAt ? (
                      <p style={{ margin: "10px 0 0", fontWeight: 700 }}>
                        Access expires: {formatDateTime(accessExpiresAt)}
                      </p>
                    ) : null}
                  </div>

                  <div style={{ display: "grid", gap: 12 }}>
                    {files.map((file) => {
                      const remaining = Math.max(0, MAX_DOWNLOADS - file.count);
                      const enabled = accessActive && remaining > 0;
                      return enabled ? (
                        <a
                          key={file.id}
                          href={`/api/download/${encodeURIComponent(receiptToken)}/${encodeURIComponent(file.id)}`}
                          className="button button-primary"
                          style={{ width: "100%", minHeight: 50, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}
                        >
                          <span>{file.displayName}</span>
                          <span>{remaining} of {MAX_DOWNLOADS} remaining ↓</span>
                        </a>
                      ) : (
                        <div key={file.id} style={{ padding: 14, border: "1px solid var(--border)", borderRadius: 12, opacity: .65 }}>
                          <strong>{file.displayName}</strong>
                          <div>{remaining > 0 ? "Access expired" : "Download limit reached"}</div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
                <CopyReceiptLinkButton />
                <Link href="/shop" className="button button-primary">Back to Shop</Link>
                {product?.slug ? <Link href={`/shop/${encodeURIComponent(product.slug)}`} className={styles.back}>View Product →</Link> : null}
              </div>
            </section>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
