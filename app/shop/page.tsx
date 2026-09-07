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

      <main className="shop-page">
        <section className="shop-hero">
          <div className="container">
            <div className="shop-hero-inner">
              <span className="section-kicker">TCL Shop</span>
              <h1>Digital products made for real businesses.</h1>
              <p>
                Browse booking systems, websites, digital products, and
                practical business resources created to make running your
                business easier.
              </p>
            </div>
          </div>
        </section>

        <section className="shop-content">
          <div className="container">
            {failed ? (
              <div
                role="alert"
                style={{ padding: "40px 20px", textAlign: "center" }}
              >
                <h2>Products are temporarily unavailable</h2>
                <p style={{ margin: "12px 0 20px" }}>
                  Please try again in a moment.
                </p>
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
