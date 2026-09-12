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
                <span>MANUAL QUOTATION</span>
                <h1>Create quotation</h1>
                <p>
                  Create a quotation for a client who did not submit the website
                  quotation form.
                </p>
              </div>

              <Link href="/admin/quotation-requests">← All Quotations</Link>
            </header>

            <form action={createManualQuotation} className="manual-quote-form">
              <section className="manual-quote-card">
                <div className="manual-quote-card-head">
                  <span>CUSTOMER</span>
                  <h2>Customer & project</h2>
                </div>

                <div className="manual-quote-grid">
                  <label>
                    Full name *
                    <input name="full_name" required />
                  </label>

                  <label>
                    Email *
                    <input name="email" type="email" required />
                  </label>

                  <label>
                    Mobile / Telegram
                    <input name="contact_number" />
                  </label>

                  <label>
                    Business / project name
                    <input name="business_name" />
                  </label>

                  <label>
                    Project type
                    <input name="business_type" placeholder="e.g. Quiz / Reviewer System" />
                  </label>

                  <label>
                    Product / service
                    <input
                      name="product_name"
                      defaultValue="Custom Business Website"
                    />
                  </label>
                </div>

                <label>
                  Products / services / project description
                  <textarea name="offerings" rows={4} />
                </label>

                <label>
                  Main project goal
                  <textarea name="main_goal" rows={4} />
                </label>
              </section>

              <section className="manual-quote-card">
                <div className="manual-quote-card-head">
                  <span>QUOTATION</span>
                  <h2>Items & pricing</h2>
                  <p>
                    Add the exact features or scope being quoted. The total is
                    calculated automatically.
                  </p>
                </div>

                <ManualQuotationItemsEditor />
              </section>

              <section className="manual-quote-card">
                <div className="manual-quote-card-head">
                  <span>QUOTATION SETTINGS</span>
                  <h2>Status & client notes</h2>
                  <p>
                    Payment option is selected by the client from the private quotation link.
                  </p>
                </div>

                <div className="manual-quote-grid">
                  <label>
                    Status
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

                </div>

                <label>
                  Quotation / scope notes
                  <textarea
                    name="admin_notes"
                    rows={7}
                    placeholder="Scope, inclusions, exclusions, special agreements, or anything the client should see..."
                  />
                </label>
              </section>

              <div className="manual-quote-actions">
                <Link href="/admin/quotation-requests">Cancel</Link>
                <button type="submit">Create Quotation</button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
