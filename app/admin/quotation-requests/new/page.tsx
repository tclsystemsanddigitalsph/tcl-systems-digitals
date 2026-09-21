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
              <div>
                <span className="manual-quote-eyebrow">MANUAL QUOTATION</span>
                <h1>Create quotation</h1>
                <p>Create a quotation directly for a client.</p>
              </div>

              <Link
                className="manual-quote-back"
                href="/admin/quotation-requests"
              >
                ← All Quotations
              </Link>
            </header>

            <form action={createManualQuotation} className="manual-quote-form">
              <section className="manual-quote-card">
                <div className="manual-quote-card-head">
                  <div>
                    <span>CUSTOMER & PROJECT</span>
                    <h2>Quotation details</h2>
                  </div>
                  <small>* Required fields</small>
                </div>

                <div className="manual-quote-grid">
                  <label>
                    <span>Full name *</span>
                    <input name="full_name" required />
                  </label>

                  <label>
                    <span>Email *</span>
                    <input name="email" type="email" required />
                  </label>

                  <label>
                    <span>Mobile / Telegram</span>
                    <input name="contact_number" />
                  </label>

                  <label>
                    <span>Business / project name</span>
                    <input name="business_name" />
                  </label>

                  <label>
                    <span>Project type</span>
                    <input
                      name="business_type"
                      placeholder="e.g. Quiz / Reviewer System"
                    />
                  </label>

                  <label>
                    <span>Product / service</span>
                    <input
                      name="product_name"
                      defaultValue="Custom Business Website"
                    />
                  </label>
                </div>

                <div className="manual-quote-text-grid">
                  <label>
                    <span>Products / services / project description</span>
                    <textarea
                      name="offerings"
                      rows={3}
                      placeholder="Brief project description or scope..."
                    />
                  </label>

                  <label>
                    <span>Main project goal</span>
                    <textarea
                      name="main_goal"
                      rows={3}
                      placeholder="What should this project achieve?"
                    />
                  </label>
                </div>
              </section>

              <section className="manual-quote-card">
                <div className="manual-quote-card-head">
                  <div>
                    <span>QUOTATION</span>
                    <h2>Items & pricing</h2>
                  </div>
                  <small>Total is calculated automatically.</small>
                </div>

                <ManualQuotationItemsEditor />
              </section>

              <section className="manual-quote-card">
                <div className="manual-quote-card-head">
                  <div>
                    <span>SETTINGS</span>
                    <h2>Status & client notes</h2>
                  </div>
                  <small>Payment option is selected by the client.</small>
                </div>

                <div className="manual-quote-settings">
                  <label>
                    <span>Status</span>
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
                      Accepted is client-controlled after the quotation is sent.
                    </small>
                  </label>

                  <label className="manual-quote-notes">
                    <span>Quotation / scope notes</span>
                    <textarea
                      name="admin_notes"
                      rows={4}
                      placeholder="Inclusions, exclusions, special agreements, timeline notes, or anything the client should see..."
                    />
                  </label>
                </div>
              </section>

              <div className="manual-quote-actions">
                <Link
                  className="manual-quote-cancel"
                  href="/admin/quotation-requests"
                >
                  Cancel
                </Link>
                <button type="submit">Create Quotation</button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
