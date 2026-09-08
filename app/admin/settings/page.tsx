import { getSiteSettings } from "@/lib/site-settings";
import { saveSiteSettings } from "./actions";
import styles from "./settings.module.css";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ saved }, settings] = await Promise.all([
    searchParams,
    getSiteSettings(),
  ]);

  const paypalConfigured = Boolean(
    process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET,
  );
  const paymongoConfigured = Boolean(process.env.PAYMONGO_SECRET_KEY);
  const siteUrlConfigured = Boolean(process.env.NEXT_PUBLIC_SITE_URL);

  return (
    <main className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <span className={styles.kicker}>ADMIN SETTINGS</span>
          <h1>Settings</h1>
          <p>
            Update your business details, storefront defaults, payments, delivery,
            and notification preferences.
          </p>
        </div>

        <div className={styles.updatedBadge}>
          Updated{" "}
          {new Intl.DateTimeFormat("en-PH", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(settings.updated_at))}
        </div>
      </div>

      {saved === "1" ? (
        <div className={styles.successBanner}>
          Settings saved successfully.
        </div>
      ) : null}

      <form action={saveSiteSettings} className={styles.settingsForm}>
        <div className={styles.settingsLayout}>
          <aside className={styles.settingsNav}>
            <a href="#business">Business</a>
            <a href="#store">Store</a>
            <a href="#payments">Payments</a>
            <a href="#delivery">Delivery</a>
            <a href="#email">Email</a>
          </aside>

          <div className={styles.settingsContent}>
            <section id="business" className={styles.section}>
              <div className={styles.sectionHeader}>
                <div>
                  <span>BUSINESS</span>
                  <h2>Business Information</h2>
                </div>
                <p>Public-facing details used across your TCL storefront.</p>
              </div>

              <div className={styles.fieldGrid}>
                <label className={styles.field}>
                  <span>Business name</span>
                  <input
                    name="business_name"
                    defaultValue={settings.business_name}
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span>Support email</span>
                  <input
                    name="support_email"
                    type="email"
                    defaultValue={settings.support_email ?? ""}
                    placeholder="support@example.com"
                  />
                </label>

                <label className={styles.field}>
                  <span>Telegram username</span>
                  <div className={styles.telegramField}>
                    <b>@</b>
                    <input
                      name="telegram_username"
                      defaultValue={settings.telegram_username}
                      required
                    />
                  </div>
                </label>
              </div>
            </section>

            <section id="store" className={styles.section}>
              <div className={styles.sectionHeader}>
                <div>
                  <span>STORE</span>
                  <h2>Store Defaults</h2>
                </div>
                <p>Default values used when creating and processing orders.</p>
              </div>

              <div className={styles.fieldGrid}>
                <label className={styles.field}>
                  <span>Currency</span>
                  <input
                    name="currency"
                    defaultValue={settings.currency}
                    maxLength={3}
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span>Processing fee (%)</span>
                  <input
                    name="default_processing_fee_percent"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    defaultValue={settings.default_processing_fee_percent}
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span>Order prefix</span>
                  <input
                    name="order_number_prefix"
                    defaultValue={settings.order_number_prefix}
                    maxLength={12}
                    required
                  />
                </label>
              </div>

              <div className={styles.toggleList}>
                <label className={styles.toggleRow}>
                  <div>
                    <strong>Store enabled</strong>
                    <small>Allow customers to browse and purchase products.</small>
                  </div>
                  <input
                    name="store_enabled"
                    type="checkbox"
                    defaultChecked={settings.store_enabled}
                  />
                </label>

                <label className={styles.toggleRow}>
                  <div>
                    <strong>Maintenance mode</strong>
                    <small>Reserved for a future maintenance screen.</small>
                  </div>
                  <input
                    name="maintenance_mode"
                    type="checkbox"
                    defaultChecked={settings.maintenance_mode}
                  />
                </label>
              </div>
            </section>

            <section id="payments" className={styles.section}>
              <div className={styles.sectionHeader}>
                <div>
                  <span>PAYMENTS</span>
                  <h2>Payment Providers</h2>
                </div>
                <p>Provider status only. Secret keys remain in Vercel.</p>
              </div>

              <div className={styles.statusList}>
                <div className={styles.statusRow}>
                  <div>
                    <strong>PayPal</strong>
                    <small>PAYPAL_CLIENT_ID + PAYPAL_CLIENT_SECRET</small>
                  </div>
                  <span className={paypalConfigured ? styles.statusGood : styles.statusBad}>
                    {paypalConfigured ? "Configured" : "Missing"}
                  </span>
                </div>

                <div className={styles.statusRow}>
                  <div>
                    <strong>PayMongo</strong>
                    <small>PAYMONGO_SECRET_KEY</small>
                  </div>
                  <span className={paymongoConfigured ? styles.statusGood : styles.statusBad}>
                    {paymongoConfigured ? "Configured" : "Missing"}
                  </span>
                </div>

                <div className={styles.statusRow}>
                  <div>
                    <strong>Site URL</strong>
                    <small>NEXT_PUBLIC_SITE_URL</small>
                  </div>
                  <span className={siteUrlConfigured ? styles.statusGood : styles.statusBad}>
                    {siteUrlConfigured ? "Configured" : "Missing"}
                  </span>
                </div>
              </div>

              <div className={styles.toggleList}>
                <label className={styles.toggleRow}>
                  <div>
                    <strong>Enable PayPal</strong>
                    <small>Allow PayPal as a checkout option.</small>
                  </div>
                  <input
                    name="paypal_enabled"
                    type="checkbox"
                    defaultChecked={settings.paypal_enabled}
                  />
                </label>

                <label className={styles.toggleRow}>
                  <div>
                    <strong>Enable PayMongo</strong>
                    <small>Allow PayMongo as a checkout option.</small>
                  </div>
                  <input
                    name="paymongo_enabled"
                    type="checkbox"
                    defaultChecked={settings.paymongo_enabled}
                  />
                </label>
              </div>

              <div className={styles.inlineNotice}>
                These toggles are saved now. We can connect them to checkout after
                the Settings UI is finalized.
              </div>
            </section>

            <section id="delivery" className={styles.section}>
              <div className={styles.sectionHeader}>
                <div>
                  <span>DELIVERY</span>
                  <h2>Digital Delivery</h2>
                </div>
                <p>Defaults for secure product access after payment.</p>
              </div>

              <div className={styles.fieldGridSingle}>
                <label className={styles.field}>
                  <span>Download link expiry (minutes)</span>
                  <input
                    name="download_link_expiry_minutes"
                    type="number"
                    min="1"
                    max="10080"
                    step="1"
                    defaultValue={settings.download_link_expiry_minutes}
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span>Default delivery message</span>
                  <textarea
                    name="default_delivery_message"
                    rows={5}
                    defaultValue={settings.default_delivery_message ?? ""}
                    placeholder="Thank you for your purchase. Your files and instructions are available below."
                  />
                </label>
              </div>
            </section>

            <section id="email" className={styles.section}>
              <div className={styles.sectionHeader}>
                <div>
                  <span>EMAIL</span>
                  <h2>Email Preferences</h2>
                </div>
                <p>Prepared for your customer receipt and admin alert system.</p>
              </div>

              <div className={styles.fieldGrid}>
                <label className={styles.field}>
                  <span>Sender name</span>
                  <input
                    name="email_sender_name"
                    defaultValue={settings.email_sender_name}
                  />
                </label>

                <label className={styles.field}>
                  <span>Reply-to email</span>
                  <input
                    name="email_reply_to"
                    type="email"
                    defaultValue={settings.email_reply_to ?? ""}
                  />
                </label>

                <label className={styles.field}>
                  <span>Admin notification email</span>
                  <input
                    name="admin_notification_email"
                    type="email"
                    defaultValue={settings.admin_notification_email ?? ""}
                  />
                </label>
              </div>

              <div className={styles.toggleList}>
                <label className={styles.toggleRow}>
                  <div>
                    <strong>Customer payment emails</strong>
                    <small>Use for automated payment confirmation emails.</small>
                  </div>
                  <input
                    name="customer_payment_email_enabled"
                    type="checkbox"
                    defaultChecked={settings.customer_payment_email_enabled}
                  />
                </label>

                <label className={styles.toggleRow}>
                  <div>
                    <strong>Admin order notifications</strong>
                    <small>Use for new paid-order alerts.</small>
                  </div>
                  <input
                    name="admin_order_email_enabled"
                    type="checkbox"
                    defaultChecked={settings.admin_order_email_enabled}
                  />
                </label>
              </div>
            </section>
          </div>
        </div>

        <div className={styles.saveBar}>
          <div>
            <strong>Save changes</strong>
            <span>Settings are stored privately in Supabase.</span>
          </div>
          <button type="submit">Save Settings</button>
        </div>
      </form>
    </main>
  );
}
