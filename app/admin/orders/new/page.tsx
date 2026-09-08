import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createManualOrder } from "./actions";
import AdminNav from "@/app/admin/AdminNav";
import styles from "./new-order.module.css";

export default async function NewManualOrderPage() {
  const authSupabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const adminSupabase = createAdminSupabaseClient();
  const { data: products, error } = await adminSupabase
    .from("products")
    .select("id,name,price,sale_price,processing_fee_percent")
    .order("name", { ascending: true });

  if (error) console.error("Unable to load products:", error);

  return (
    <main className="store-admin-dashboard">
      <div className="store-admin-dashboard-shell">
        <AdminNav active="orders" email={user.email} />

        <section className="store-admin-main">
          <header className={styles.topbar}>
            <div>
              <span className="store-admin-eyebrow">MANUAL SALES</span>
              <h1>Add Manual Order</h1>
              <p>
                Log an outside sale, or create a private checkout link for a
                customer who still needs to pay.
              </p>
            </div>
            <a href="/admin/orders">← Orders</a>
          </header>

          <form action={createManualOrder} className={styles.form}>
            <section className={styles.card}>
              <div className={styles.cardHeading}>
                <span>01</span>
                <div>
                  <h2>Customer</h2>
                  <p>Who is this order for?</p>
                </div>
              </div>

              <div className={styles.grid}>
                <label>
                  <span>Customer name *</span>
                  <input name="customer_name" required />
                </label>

                <label>
                  <span>Customer email *</span>
                  <input name="customer_email" type="email" required />
                </label>
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeading}>
                <span>02</span>
                <div>
                  <h2>Order</h2>
                  <p>Choose a store product or enter a custom sale.</p>
                </div>
              </div>

              <div className={styles.grid}>
                <label className={styles.full}>
                  <span>Store product</span>
                  <select name="product_id" defaultValue="">
                    <option value="">Custom / off-platform item</option>
                    {(products ?? []).map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  <small>
                    Optional. Linking a product keeps the order connected to
                    your product catalog.
                  </small>
                </label>

                <label>
                  <span>Order / product title *</span>
                  <input
                    name="product_name"
                    placeholder="e.g. Customized Booking System"
                    required
                  />
                </label>

                <label>
                  <span>Order source *</span>
                  <select name="order_source" defaultValue="MANUAL">
                    <option value="MANUAL">Manual / Direct</option>
                    <option value="FACEBOOK">Facebook</option>
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="TELEGRAM">Telegram</option>
                    <option value="ETSY">Etsy</option>
                    <option value="RAKET.PH">Raket.ph</option>
                    <option value="OTHER">Other</option>
                  </select>
                </label>

                <label className={styles.full}>
                  <span>Description</span>
                  <textarea
                    name="custom_description"
                    rows={4}
                    placeholder="Package, scope, inclusions, agreed custom work, or other useful details."
                  />
                </label>

                <label>
                  <span>External reference</span>
                  <input
                    name="external_reference"
                    placeholder="Optional receipt / transaction / platform order ID"
                  />
                </label>

                <label>
                  <span>Internal note</span>
                  <input
                    name="notes"
                    placeholder="Optional seller-only note"
                  />
                </label>
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeading}>
                <span>03</span>
                <div>
                  <h2>Payment</h2>
                  <p>Enter the agreed total and choose how this order should work.</p>
                </div>
              </div>

              <div className={styles.grid}>
                <label>
                  <span>Base price (PHP) *</span>
                  <input
                    name="base_price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    defaultValue="0.00"
                    required
                  />
                </label>

                <label>
                  <span>Processing fee (PHP)</span>
                  <input
                    name="processing_fee"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue="0.00"
                  />
                </label>

                <label>
                  <span>Payment status *</span>
                  <select name="payment_status" defaultValue="COMPLETED">
                    <option value="COMPLETED">Completed / Paid</option>
                    <option value="PENDING">Pending</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="FAILED">Failed</option>
                  </select>
                  <small>
                    Ignored when “Generate private payment checkout” is enabled.
                  </small>
                </label>

                <label>
                  <span>Payment method / provider</span>
                  <select name="payment_provider" defaultValue="MANUAL">
                    <option value="MANUAL">Manual / Other</option>
                    <option value="GCASH">GCash</option>
                    <option value="MAYA">Maya</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="PAYPAL">PayPal</option>
                    <option value="PAYMONGO">PayMongo</option>
                    <option value="CASH">Cash</option>
                    <option value="ETSY">Etsy</option>
                    <option value="RAKET.PH">Raket.ph</option>
                  </select>
                </label>

                <label>
                  <span>Delivery status</span>
                  <select name="delivery_status" defaultValue="NOT_STARTED">
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </label>
              </div>

              <label className={styles.checkoutOption}>
                <input
                  type="checkbox"
                  name="generate_checkout"
                  value="1"
                />
                <span>
                  <strong>Generate private payment checkout</strong>
                  <small>
                    Use this when the customer has not paid yet. The order will
                    be saved as Pending and you’ll get a private TCL checkout
                    link that charges this exact order total through PayPal.
                  </small>
                </span>
              </label>

              <div className={styles.totalNote}>
                Total amount = <strong>base price + processing fee</strong>.
                The private checkout amount is always loaded from the saved
                order on the server, not from the URL.
              </div>
            </section>

            <div className={styles.actions}>
              <a href="/admin/orders">Cancel</a>
              <button type="submit">Save Order</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
