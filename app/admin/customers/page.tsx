import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import styles from "./customers.module.css";
import { orderNetRevenue } from "@/lib/revenue";
import AdminNav from "@/app/admin/AdminNav";

type CustomersPageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
};

type OrderRow = {
  id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  payment_status: string;
  created_at: string;
  refund_status: string | null;
  refunded_amount: number;
};

type CustomerRow = {
  name: string;
  email: string;
  totalOrders: number;
  completedOrders: number;
  totalSpent: number;
  latestOrderAt: string;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function CustomersPage({
  searchParams,
}: CustomersPageProps) {
  const authSupabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const search = (params.q ?? "").trim().toLowerCase();
  const requestedPage = Math.max(
    1,
    Number.parseInt(params.page ?? "1", 10) || 1,
  );

  const adminSupabase = createAdminSupabaseClient();

  const { data, error } = await adminSupabase
    .from("orders")
    .select(
      "id,customer_name,customer_email,total_amount,payment_status,created_at,refund_status,refunded_amount",
    )
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    console.error("Admin customers load error:", error);
  }

  const orders = (data ?? []) as OrderRow[];

  const customerMap = new Map<string, CustomerRow>();

  for (const order of orders) {
    const email = (order.customer_email || "").trim().toLowerCase();

    if (!email) continue;

    const current = customerMap.get(email);

    if (!current) {
      customerMap.set(email, {
        name: order.customer_name || "Customer",
        email: order.customer_email,
        totalOrders: 1,
        completedOrders:
          order.payment_status === "COMPLETED" ? 1 : 0,
        totalSpent: orderNetRevenue(order),
        latestOrderAt: order.created_at,
      });

      continue;
    }

    current.totalOrders += 1;

    if (order.payment_status === "COMPLETED") {
      current.completedOrders += 1;
    }

    current.totalSpent += orderNetRevenue(order);

    if (
      new Date(order.created_at).getTime() >
      new Date(current.latestOrderAt).getTime()
    ) {
      current.latestOrderAt = order.created_at;
      current.name = order.customer_name || current.name;
      current.email = order.customer_email || current.email;
    }
  }

  const customers = Array.from(customerMap.values()).sort(
    (a, b) =>
      new Date(b.latestOrderAt).getTime() -
      new Date(a.latestOrderAt).getTime(),
  );

  const filteredCustomers = search
    ? customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(search) ||
          customer.email.toLowerCase().includes(search),
      )
    : customers;

  const pageSize = 10;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / pageSize),
  );
  const currentPage = Math.min(requestedPage, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pagedCustomers = filteredCustomers.slice(
    start,
    start + pageSize,
  );

  const totalRevenue = customers.reduce(
    (sum, customer) => sum + customer.totalSpent,
    0,
  );

  const repeatCustomers = customers.filter(
    (customer) => customer.completedOrders > 1,
  ).length;

  const buildPageUrl = (page: number) => {
    const query = new URLSearchParams();

    if (search) query.set("q", search);
    if (page > 1) query.set("page", String(page));

    const queryString = query.toString();

    return queryString
      ? `/admin/customers?${queryString}`
      : "/admin/customers";
  };

  return (
    <main className="store-admin-dashboard">
      <div className="store-admin-dashboard-shell">
        <AdminNav active="customers" email={user.email} />

        <section className="store-admin-main">
          <div className={styles.page}>
            <header className={styles.topbar}>
              <div>
                <span className="store-admin-eyebrow">CUSTOMER DIRECTORY</span>
                <h1>Customers</h1>
                <p>Customer history generated automatically from your orders.</p>
              </div>
            </header>

            <section className={styles.stats}>
              <div>
                <span>TOTAL CUSTOMERS</span>
                <strong>{customers.length}</strong>
              </div>
              <div>
                <span>REPEAT CUSTOMERS</span>
                <strong>{repeatCustomers}</strong>
              </div>
              <div>
                <span>NET REVENUE</span>
                <strong>{formatMoney(totalRevenue)}</strong>
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <span>CUSTOMERS</span>
                  <h2>Customer history</h2>
                </div>

                <form className={styles.searchForm}>
                  <input
                    type="search"
                    name="q"
                    defaultValue={params.q ?? ""}
                    placeholder="Search name or email"
                  />
                  <button type="submit">Search</button>
                  {search ? <a href="/admin/customers">Clear</a> : null}
                </form>
              </div>

              {pagedCustomers.length > 0 ? (
                <>
                  <div className={styles.tableWrap}>
                    <table>
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Orders</th>
                          <th>Completed</th>
                          <th>Net Spent</th>
                          <th>Latest Order</th>
                          <th aria-label="Actions" />
                        </tr>
                      </thead>

                      <tbody>
                        {pagedCustomers.map((customer) => (
                          <tr key={customer.email.toLowerCase()}>
                            <td>
                              <div className={styles.customerCell}>
                                <strong>{customer.name}</strong>
                                <small>{customer.email}</small>
                              </div>
                            </td>
                            <td className={styles.numberCell}>
                              {customer.totalOrders}
                            </td>
                            <td className={styles.numberCell}>
                              {customer.completedOrders}
                            </td>
                            <td>
                              <strong className={styles.money}>
                                {formatMoney(customer.totalSpent)}
                              </strong>
                            </td>
                            <td>
                              <span className={styles.date}>
                                {formatDate(customer.latestOrderAt)}
                              </span>
                            </td>
                            <td className={styles.actionCell}>
                              <a
                                className={styles.viewButton}
                                href={`/admin/orders?q=${encodeURIComponent(
                                  customer.email,
                                )}`}
                              >
                                Orders →
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className={styles.footer}>
                    <span>
                      Showing{" "}
                      {filteredCustomers.length === 0 ? 0 : start + 1}–
                      {Math.min(start + pageSize, filteredCustomers.length)} of{" "}
                      {filteredCustomers.length}
                    </span>

                    {totalPages > 1 ? (
                      <nav
                        className={styles.pagination}
                        aria-label="Customers pagination"
                      >
                        <a
                          className={
                            currentPage === 1
                              ? styles.pageDisabled
                              : styles.pageButton
                          }
                          href={buildPageUrl(Math.max(1, currentPage - 1))}
                          aria-disabled={currentPage === 1}
                        >
                          ←
                        </a>

                        {Array.from(
                          { length: totalPages },
                          (_, index) => index + 1,
                        ).map((page) => (
                          <a
                            key={page}
                            href={buildPageUrl(page)}
                            className={
                              page === currentPage
                                ? styles.pageActive
                                : styles.pageButton
                            }
                            aria-current={
                              page === currentPage ? "page" : undefined
                            }
                          >
                            {page}
                          </a>
                        ))}

                        <a
                          className={
                            currentPage === totalPages
                              ? styles.pageDisabled
                              : styles.pageButton
                          }
                          href={buildPageUrl(
                            Math.min(totalPages, currentPage + 1),
                          )}
                          aria-disabled={currentPage === totalPages}
                        >
                          →
                        </a>
                      </nav>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className={styles.empty}>
                  <strong>No customers found</strong>
                  <p>Customers will appear automatically after orders are created.</p>
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
