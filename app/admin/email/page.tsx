import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import AdminNav from "@/app/admin/AdminNav";
import EmailCenter from "./EmailCenter";
import styles from "./email.module.css";

export const dynamic = "force-dynamic";

export type EmailRecord = {
  key: string;
  type: "ORDER" | "QUOTATION";
  id: string;
  name: string;
  email: string;
  title: string;
  reference: string;
  status: string;
  ctaUrl: string;
};

export type EmailHistoryRow = {
  id: string;
  recipient_email: string;
  recipient_name: string | null;
  subject: string;
  message: string;
  template_type: string;
  button_label: string | null;
  button_url: string | null;
  related_type: string | null;
  related_id: string | null;
  related_reference: string | null;
  send_status: string;
  resend_email_id: string | null;
  error_message: string | null;
  sent_at: string;
};

export default async function AdminEmailPage() {
  const authSupabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const admin = createAdminSupabaseClient();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.tclsystemsph.com").replace(/\/$/, "");

  const [{ data: orders }, { data: quotations }, { data: history }] =
    await Promise.all([
      admin
        .from("orders")
        .select("id,order_number,customer_name,customer_email,product_name,payment_status,order_status,created_at")
        .order("created_at", { ascending: false })
        .limit(500),
      admin
        .from("quotation_requests")
        .select("id,secure_token,product_name,business_name,full_name,email,status,created_at")
        .order("created_at", { ascending: false })
        .limit(500),
      admin
        .from("email_history")
        .select("id,recipient_email,recipient_name,subject,message,template_type,button_label,button_url,related_type,related_id,related_reference,send_status,resend_email_id,error_message,sent_at")
        .order("sent_at", { ascending: false })
        .limit(100),
    ]);

  const records: EmailRecord[] = [];

  for (const order of orders ?? []) {
    const email = String(order.customer_email ?? "").trim();
    if (!email) continue;

    records.push({
      key: `ORDER:${order.id}`,
      type: "ORDER",
      id: String(order.id),
      name: String(order.customer_name || "Customer"),
      email,
      title: String(order.product_name || "Order"),
      reference: String(order.order_number || ""),
      status: String(order.order_status || order.payment_status || "PENDING"),
      ctaUrl: `${siteUrl}/order-status`,
    });
  }

  for (const quotation of quotations ?? []) {
    const email = String(quotation.email ?? "").trim();
    const token = String(quotation.secure_token ?? "").trim();
    if (!email) continue;

    records.push({
      key: `QUOTATION:${quotation.id}`,
      type: "QUOTATION",
      id: String(quotation.id),
      name: String(quotation.full_name || quotation.business_name || "Client"),
      email,
      title: String(
        quotation.business_name ||
          quotation.product_name ||
          "Custom Project",
      ),
      reference: String(quotation.id).slice(0, 8).toUpperCase(),
      status: String(quotation.status || "NEW"),
      ctaUrl: token ? `${siteUrl}/quotation/${token}` : "",
    });
  }

  return (
    <main className="store-admin-dashboard">
      <div className="store-admin-dashboard-shell">
        <AdminNav active="email" email={user.email} />

        <section className="store-admin-main">
          <div className={styles.page}>
            <header className={styles.topbar}>
              <div>
                <span className="store-admin-eyebrow">COMMUNICATION CENTER</span>
                <h1>Email</h1>
                <p>Compose branded messages and review your sent history.</p>
              </div>

              <div className={styles.sender}>
                <span>FROM</span>
                <strong>notifications@tclsystemsph.com</strong>
              </div>
            </header>

            <EmailCenter
              records={records}
              initialHistory={(history ?? []) as EmailHistoryRow[]}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
