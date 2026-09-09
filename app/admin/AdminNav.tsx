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
      <aside className={styles.desktopNav}>
        <div className={styles.desktopInner}>
          <div className={styles.brand}>
            <div className={styles.logo}>TCL</div>
            <div className={styles.brandText}>
              <strong>TCL Systems</strong>
              <span>&amp; Digitals PH</span>
            </div>
          </div>

          <div className={styles.sectionLabel}>
            <span className={styles.sectionLabelFull}>STORE ADMIN</span>
            <span className={styles.sectionLabelDot}>•</span>
          </div>

          <nav className={styles.desktopLinks}>
            {links.map((item) => (
              <a
                className={item.key === active ? styles.desktopActive : undefined}
                href={item.href}
                key={item.key}
                title={item.label}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
                {item.key === active ? (
                  <span className={styles.activeDot} aria-hidden="true" />
                ) : null}
              </a>
            ))}
          </nav>

          <div className={styles.desktopBottom}>
            <a className={styles.storeLink} href="/" title="View Store">
              <span className={styles.navIcon}>🛒</span>
              <span className={styles.navLabel}>View Store</span>
            </a>

            <form action={signOut}>
              <button className={styles.desktopSignOut} type="submit" title="Sign Out">
                <span className={styles.signOutIcon}>🔒</span>
                <span className={styles.navLabel}>Sign Out</span>
              </button>
            </form>

            <div className={styles.user}>
              <div className={styles.avatar} aria-hidden="true">
                ♙
              </div>

              <span className={styles.userText}>
                <small>Signed in as</small>
                <strong>{email || "Admin"}</strong>
              </span>
            </div>
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
