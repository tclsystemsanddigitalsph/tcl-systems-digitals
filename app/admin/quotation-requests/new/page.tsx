import Link from "next/link";
import { redirect } from "next/navigation";
import AdminNav from "@/app/admin/AdminNav";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import ManualQuotationItemsEditor from "./ManualQuotationItemsEditor";
import { createManualQuotation } from "./actions";
import "./manual-quotation.css";

export const dynamic = "force-dynamic";

export default async function NewManualQuotationPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  return (
    <main className="store-admin-dashboard">
      <div className="store-admin-dashboard-shell">
        <AdminNav active="quotations" email={user.email} />

        <section className="store-admin-main">
          <div className="manual-quote-page">
            <header className="manual-quote-top">
              <div className="manual-quote-heading">
                <span className="manual-quote-eyebrow">NEW QUOTATION</span>
                <h1>Create Manual Quotation</h1>
                <p>
                  Create a quotation directly for a client, even if they did not
                  submit a quotation request through the website.
                </p>
              </div>

              <Link
                className="manual-quote-back"
                href="/admin/quotation-requests"
              >
                ← Back to Quotations
              </Link>
            </header>

            <form action={createManualQuotation} className="manual-quote-form">
              <section className="manual-quote-card">
                <div className="manual-quote-card-head">
                  <span>01 · CLIENT DETAILS</span>
                  <h2>Client & Project Information</h2>
                  <p>
                    Only the client name is needed to save. You can complete the
                    rest of the details later.
                  </p>
                </div>

                <div className="manual-quote-grid">
                  <label>
                    <span>Client name *</span>
                    <input
                      name="full_name"
                      required
                      placeholder="Full name"
                    />
                  </label>

                  <label>
                    <span>Email address</span>
                    <input
                      name="email"
                      type="email"
                      placeholder="client@email.com"
                    />
                  </label>

                  <label>
                    <span>Contact number / Telegram</span>
                    <input
                      name="contact_number"
                      placeholder="Mobile number or Telegram username"
                    />
                  </label>

                  <label>
                    <span>Business / project name</span>
                    <input
                      name="business_name"
                      placeholder="Business name or project title"
                    />
                  </label>

                  <label>
                    <span>Project type</span>
                    <input
                      name="business_type"
                      placeholder="e.g. Quiz / Reviewer System"
                    />
                  </label>

                  <label>
                    <span>Service / quotation type</span>
                    <input
                      name="product_name"
                      defaultValue="Custom Project"
                      placeholder="e.g. Custom Website"
                    />
                  </label>
                </div>

                <div className="manual-quote-full-grid">
                  <label>
                    <span>Project description</span>
                    <textarea
                      name="offerings"
                      rows={4}
                      placeholder="Briefly describe what the client needs, what the project is for, or the main requested functionality."
                    />
                  </label>

                  <label>
                    <span>Main goal</span>
                    <textarea
                      name="main_goal"
                      rows={4}
                      placeholder="What should this project help the client accomplish?"
                    />
                  </label>
                </div>
              </section>

              <section className="manual-quote-card">
                <div className="manual-quote-card-head">
                  <span>02 · SCOPE & PRICING</span>
                  <h2>Quotation Items</h2>
                  <p>
                    Add features, services, or pricing now, or leave this section
                    empty and complete it later.
                  </p>
                </div>

                <ManualQuotationItemsEditor />
              </section>

              <section className="manual-quote-card">
                <div className="manual-quote-card-head">
                  <span>03 · QUOTATION SETTINGS</span>
                  <h2>Status, Payment & Client Notes</h2>
                  <p>
                    These settings are optional. You can save the quotation first
                    and update them anytime.
                  </p>
                </div>

                <div className="manual-quote-grid">
                  <label>
                    <span>Quotation status</span>
                    <select name="status" defaultValue="NEW">
                      <option value="NEW">New</option>
                      <option value="REVIEWING">Reviewing</option>
                      <option value="QUOTED">
                        Quoted — ready for client review
                      </option>
                      <option value="DECLINED">Declined</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                    <small>
                      “Accepted” is added automatically when the client accepts
                      the quotation.
                    </small>
                  </label>

                  <label>
                    <span>Payment terms</span>
                    <select name="payment_terms" defaultValue="">
                      <option value="">Not set yet</option>
                      <option value="FULL">Full Payment</option>
                      <option value="DEPOSIT_50">
                        50% Deposit + Remaining Balance
                      </option>
                    </select>
                  </label>
                </div>

                <label className="manual-quote-notes">
                  <span>Quotation / scope notes</span>
                  <textarea
                    name="admin_notes"
                    rows={7}
                    placeholder="Add inclusions, exclusions, special agreements, limitations, timelines, or anything the client should review before accepting."
                  />
                </label>
              </section>

              <div className="manual-quote-actions">
                <Link
                  className="manual-quote-cancel"
                  href="/admin/quotation-requests"
                >
                  Cancel
                </Link>

                <button type="submit">Save Quotation</button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
