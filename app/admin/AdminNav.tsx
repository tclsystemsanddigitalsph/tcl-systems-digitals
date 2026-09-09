import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import styles from "./AdminNav.module.css";

const links = [
  { href: "/admin", label: "Dashboard", icon: "⌂", key: "dashboard" },
  { href: "/admin/products", label: "Products", icon: "◇", key: "products" },
  { href: "/admin/orders", label: "Orders", icon: "▣", key: "orders" },
  {
    href: "/admin/quotation-requests",
    label: "Quotations",
    icon: "✦",
    key: "quotations",
  },
  {
    href: "/admin/project-requirements",
    label: "Project Requirements",
    icon: "◈",
    key: "requirements",
  },
  {
    href: "/admin/deliveries",
    label: "Deliveries",
    icon: "↗",
    key: "deliveries",
  },
  { href: "/admin/customers", label: "Customers", icon: "♡", key: "customers" },
  { href: "/admin/reviews", label: "Reviews", icon: "☆", key: "reviews" },
  { href: "/admin/settings", label: "Settings", icon: "⚙", key: "settings" },
];

async function signOut() {
  "use server";
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export default function AdminNav({
  active,
  email,
}: {
  active: string;
  email?: string | null;
}) {
  const current = links.find((item) => item.key === active) ?? links[0];

  return (
    <>
      <aside className={`store-admin-sidebar ${styles.desktopNav}`}>
        <div className="store-admin-sidebar-brand">
          <div className="store-admin-sidebar-logo">TCL</div>
          <div>
            <strong>TCL Systems</strong>
            <span>&amp; Digitals PH</span>
          </div>
        </div>

        <div className="store-admin-sidebar-label">STORE ADMIN</div>

        <nav className="store-admin-nav">
          {links.map((item) => (
            <a
              className={item.key === active ? "active" : undefined}
              href={item.href}
              key={item.key}
            >
              <span>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="store-admin-sidebar-bottom">
          <a href="/">
            <span>←</span>
            View Store
          </a>

          <form action={signOut}>
            <button className={styles.desktopSignOut} type="submit">
              Sign Out
            </button>
          </form>

          <div className="store-admin-user">
            <div>{email?.charAt(0).toUpperCase() || "T"}</div>
            <span>
              <small>Signed in as</small>
              <strong>{email}</strong>
            </span>
          </div>
        </div>
      </aside>

      <div className={styles.mobileWrap}>
        <details className={styles.mobileMenu}>
          <summary>
            <span className={styles.mobileBrand}>
              <b>TCL</b>
              <span>
                <strong>TCL Admin</strong>
                <small>{current.label}</small>
              </span>
            </span>

            <span className={styles.menuButton}>
              Menu <b>⌄</b>
            </span>
          </summary>

          <div className={styles.menuPanel}>
            <nav>
              {links.map((item) => (
                <a
                  className={item.key === active ? styles.active : undefined}
                  href={item.href}
                  key={item.key}
                >
                  <span>{item.icon}</span>
                  <strong>{item.label}</strong>
                  {item.key === active ? <small>Current</small> : null}
                </a>
              ))}
            </nav>

            <div className={styles.mobileFooter}>
              <a href="/">← View Store</a>
              <form action={signOut}>
                <button type="submit">Sign Out</button>
              </form>
            </div>

            <small className={styles.email}>{email}</small>
          </div>
        </details>
      </div>
    </>
  );
}
