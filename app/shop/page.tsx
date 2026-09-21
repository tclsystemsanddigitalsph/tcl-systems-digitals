import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import ProductCatalog from "@/components/ProductCatalog";
import { getCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const { products, failed } = await getCatalog();

  return (
    <>
      <SiteHeader />

      <main className="shop-page shop-tech-page">
        <section className="shop-hero shop-tech-hero">
          <div className="shop-tech-grid" aria-hidden="true" />
          <div className="shop-tech-glow" aria-hidden="true" />

          <div className="container shop-tech-shell">
            <div className="shop-tech-systemline">
              <span><i /> TCL / DIGITAL SOLUTIONS</span>
              <span>SELECT / CONFIGURE / LAUNCH</span>
            </div>

            <div className="shop-tech-hero-layout">
              <div className="shop-tech-hero-copy">
                <span className="section-kicker">TCL Shop / 01</span>
                <h1>
                  DIGITAL
                  <span>SOLUTIONS.</span>
                  <em>READY TO WORK.</em>
                </h1>
                <p>
                  Websites, online shops, booking systems, and practical digital
                  products built around real business needs.
                </p>
              </div>

              <div className="shop-tech-hero-system" aria-hidden="true">
                <div className="shop-tech-orbit shop-tech-orbit-one" />
                <div className="shop-tech-orbit shop-tech-orbit-two" />
                <div className="shop-tech-core">
                  <small>TCL</small>
                  <strong>SHOP</strong>
                  <span>SYSTEM</span>
                </div>
                <div className="shop-tech-node shop-tech-node-a"><b>WEB</b><span>01</span></div>
                <div className="shop-tech-node shop-tech-node-b"><b>BOOK</b><span>02</span></div>
                <div className="shop-tech-node shop-tech-node-c"><b>SHOP</b><span>03</span></div>
                <div className="shop-tech-node shop-tech-node-d"><b>CUSTOM</b><span>04</span></div>
              </div>
            </div>

            <div className="shop-tech-rail">
              <span>WEBSITES</span><i />
              <span>BOOKING</span><i />
              <span>COMMERCE</span><i />
              <span>DIGITAL PRODUCTS</span>
              <b>BUILT FROM THE PHILIPPINES</b>
            </div>
          </div>
        </section>

        <section className="shop-content shop-tech-content">
          <div className="container">
            {failed ? (
              <div className="shop-tech-error" role="alert">
                <span>CATALOG / OFFLINE</span>
                <h2>Products are temporarily unavailable</h2>
                <p>Please try again in a moment.</p>
                <Link href="/shop" prefetch={false} className="shop-view-button">
                  Try again
                </Link>
              </div>
            ) : (
              <ProductCatalog products={products} />
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
