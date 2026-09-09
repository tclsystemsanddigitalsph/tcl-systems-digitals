import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OrderStatusLookup from "./OrderStatusLookup";
import styles from "./order-status.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Check Order Status | TCL Systems & Digitals PH",
  description:
    "Check your TCL Systems & Digitals PH order, payment, project, requirements, delivery, and download status.",
  robots: { index: false, follow: false },
};

export default function OrderStatusPage() {
  return (
    <>
      <SiteHeader />

      <main className={styles.page}>
        <div className="container">
          <section className={styles.hero}>
            <span className="section-kicker">Order tracker</span>
            <h1>Check your order status.</h1>
            <p>
              Enter the order number and email address used for your purchase to
              securely view your payment, project, requirements, delivery, and
              digital-access details.
            </p>
          </section>

          <OrderStatusLookup />
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
