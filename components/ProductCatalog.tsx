"use client";

import { useState } from "react";
import Link from "next/link";
import {
  type Product,
  formatPrice,
  productPrice,
} from "@/lib/products";

function isQuotationProduct(product: Product) {
  return (
    product.product_type === "SERVICE" &&
    Number(productPrice(product)) === 0
  );
}

const categoryDescriptions: Record<string, string> = {
  "Customized Websites":
    "Done-for-you website services prepared by TCL based on your business, branding, content, and selected service.",
  "DIY Templates":
    "Ready-made website and system templates for business owners who want an affordable option they can personalize themselves.",
  "Booking Systems":
    "Appointment and booking solutions designed to help businesses manage services, schedules, and customer bookings.",
  "Digital Products":
    "Downloadable and ready-to-use digital resources created to support your business and everyday workflow.",
};

function getCategoryDescription(category: string) {
  if (!category) {
    return "Browse all TCL products, from done-for-you website services to DIY templates, booking systems, and digital business resources.";
  }

  return (
    categoryDescriptions[category] ??
    `Browse available ${category.toLowerCase()} products and services from TCL Systems & Digitals PH.`
  );
}

export default function ProductCatalog({
  products,
}: {
  products: Product[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("featured");

  const categories = Array.from(
    new Set(products.map((product) => product.category)),
  ).sort();

  const visible = products
    .filter(
      (product) =>
        (!category || product.category === category) &&
        `${product.name} ${product.short_description ?? ""} ${product.category}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    )
    .sort((a, b) =>
      sort === "price-low"
        ? productPrice(a) - productPrice(b)
        : sort === "price-high"
          ? productPrice(b) - productPrice(a)
          : sort === "newest"
            ? Date.parse(b.created_at) - Date.parse(a.created_at)
            : Number(b.is_featured) - Number(a.is_featured) ||
              a.display_order - b.display_order ||
              a.name.localeCompare(b.name),
    );

  return (
    <>
      <div className="shop-toolbar">
        <div className="shop-categories">
          {["", ...categories].map((item) => (
            <button
              key={item}
              type="button"
              className={`shop-category-button ${
                category === item ? "active" : ""
              }`}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >
              {item || "All Products"}
            </button>
          ))}
        </div>

        <div className="shop-search">
          <span>⌕</span>
          <input
            type="search"
            aria-label="Search products"
            placeholder="Search products"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="shop-heading-row">
        <div>
          <span className="shop-count" aria-live="polite">
            {visible.length} {visible.length === 1 ? "product" : "products"}
          </span>

          <h2>{category || "All Products"}</h2>
          <p className="shop-category-description">
            {getCategoryDescription(category)}
          </p>
        </div>

        <select
          className="shop-sort"
          aria-label="Sort products"
          value={sort}
          onChange={(event) => setSort(event.target.value)}
        >
          <option value="featured">Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {!visible.length ? (
        <div style={{ padding: "40px 20px", textAlign: "center" }}>
          <h3>
            {products.length
              ? "No matching products"
              : "New products are on the way"}
          </h3>

          <p>
            {products.length
              ? "Try another search or category."
              : "Check back soon to explore our latest products."}
          </p>

          {products.length > 0 ? (
            <button
              className="shop-category-button"
              onClick={() => {
                setCategory("");
                setQuery("");
              }}
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="shop-product-grid">
        {visible.map((product) => {
          const quotationOnly = isQuotationProduct(product);
          const hasSale =
            !quotationOnly &&
            product.sale_price !== null &&
            product.sale_price < product.price;

          return (
            <article className="shop-product-card" key={product.id}>
              <div className="shop-product-body">
                <div className="shop-product-card-top">
                  {product.badge ? (
                    <span className="shop-product-badge">
                      {product.badge}
                    </span>
                  ) : (
                    <span className="shop-product-badge shop-product-badge-muted">
                      TCL PRODUCT
                    </span>
                  )}

                  <span className="shop-product-type">
                    {product.product_type === "SERVICE" ? "Service" : "Digital"}
                  </span>
                </div>
                <div className="shop-product-meta">
                  <span>{product.category}</span>
                </div>

                <h3>{product.name}</h3>
                <p>{product.short_description}</p>

                <div className="shop-product-bottom">
                  <div>
                    <small>
                      {quotationOnly ? "Pricing" : "Price"}
                    </small>

                    {quotationOnly ? (
                      <strong>For Quotation</strong>
                    ) : (
                      <>
                        {hasSale ? (
                          <del
                            style={{
                              display: "block",
                              fontSize: 14,
                              opacity: 0.65,
                            }}
                          >
                            {formatPrice(product.price)}
                          </del>
                        ) : null}

                        <strong>
                          {formatPrice(productPrice(product))}
                        </strong>
                      </>
                    )}
                  </div>

                  <Link
                    href={`/shop/${encodeURIComponent(product.slug)}`}
                    className="shop-view-button"
                    aria-label={`View ${product.name}`}
                  >
                    {quotationOnly ? "View Details" : "View Product"}{" "}
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <style jsx global>{`
        .shop-category-description {
          max-width: 720px;
          margin: 8px 0 0;
          color: var(--text-soft);
          font-size: 0.82rem;
          line-height: 1.6;
        }


        /* Redesigned product cards — text-only, no mockup/image area */
        .shop-product-grid {
          align-items: stretch !important;
          gap: 20px !important;
        }

        .shop-product-card {
          position: relative;
          display: flex !important;
          height: 100% !important;
          min-height: 300px;
          overflow: hidden;
          flex-direction: column !important;
          border: 1px solid #eadde2;
          border-radius: 22px;
          background:
            linear-gradient(180deg, rgba(252, 241, 246, 0.62) 0, #ffffff 110px);
          box-shadow: 0 12px 32px rgba(76, 48, 59, 0.06);
          transition:
            transform 160ms ease,
            border-color 160ms ease,
            box-shadow 160ms ease;
        }

        .shop-product-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #a95f79, #d79aae, #efc9d6);
        }

        .shop-product-card:hover {
          transform: translateY(-4px);
          border-color: #d8b8c4;
          box-shadow: 0 18px 42px rgba(76, 48, 59, 0.1);
        }

        .shop-product-body {
          display: flex !important;
          flex: 1 1 auto !important;
          min-height: 0 !important;
          height: 100% !important;
          flex-direction: column !important;
          padding: 26px !important;
        }

        .shop-product-card-top {
          display: flex;
          min-height: 30px;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 20px;
        }

        .shop-product-badge {
          position: static !important;
          top: auto !important;
          left: auto !important;
          display: inline-flex !important;
          min-height: 28px !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 0 11px !important;
          border: 0 !important;
          border-radius: 999px !important;
          background: #a95f79 !important;
          color: #fff !important;
          font-size: 8px !important;
          font-weight: 900 !important;
          line-height: 1 !important;
          letter-spacing: 0.07em !important;
          text-transform: uppercase !important;
          white-space: nowrap !important;
          box-shadow: none !important;
        }

        .shop-product-badge-muted {
          background: #f3e6eb !important;
          color: #8e566a !important;
        }

        .shop-product-type {
          flex-shrink: 0;
          color: #8d7f85;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .shop-product-meta {
          margin-bottom: 8px !important;
        }

        .shop-product-meta span {
          color: #aa657e;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .shop-product-body h3 {
          margin: 0 0 10px !important;
          color: var(--text);
          font-size: 21px !important;
          line-height: 1.16 !important;
          letter-spacing: -0.035em;
        }

        .shop-product-body > p {
          margin: 0 !important;
          color: var(--text-soft);
          font-size: 11px !important;
          line-height: 1.68 !important;
        }

        /*
         * This is what keeps every price/button block aligned:
         * the card fills the grid row, body fills the card,
         * then this section is pushed to the very bottom.
         */
        .shop-product-bottom {
          display: grid !important;
          grid-template-columns: 1fr auto !important;
          align-items: end !important;
          gap: 18px !important;
          margin-top: auto !important;
          padding-top: 26px !important;
          border-top: 1px solid #f0e5e9;
        }

        .shop-product-bottom > div:first-child {
          display: flex;
          min-height: 50px;
          flex-direction: column;
          justify-content: flex-end;
        }

        .shop-product-bottom small {
          color: #9b8b91;
          font-size: 8px !important;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .shop-product-bottom strong {
          margin-top: 2px;
          color: var(--text);
          font-size: 17px !important;
          line-height: 1.1;
        }

        .shop-product-bottom del {
          margin-bottom: 1px;
          font-size: 10px !important;
          line-height: 1.1;
        }

        .shop-view-button {
          display: inline-flex !important;
          min-height: 40px !important;
          flex-shrink: 0;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px;
          padding: 0 15px !important;
          border: 1px solid #2f272a !important;
          border-radius: 999px !important;
          background: #2f272a !important;
          color: #fff !important;
          font-size: 9px !important;
          font-weight: 850 !important;
          line-height: 1 !important;
          text-align: center;
          text-decoration: none;
          white-space: nowrap;
        }

        .shop-view-button:hover {
          background: #4a3b41 !important;
          border-color: #4a3b41 !important;
        }

        @media (max-width: 760px) {
          .shop-product-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            align-items: stretch !important;
            gap: 10px !important;
          }

          .shop-product-card {
            display: flex !important;
            height: 100% !important;
            min-height: 270px !important;
            border-radius: 16px !important;
          }

          .shop-product-body {
            width: 100% !important;
            height: 100% !important;
            min-height: 270px !important;
            padding: 13px !important;
          }

          .shop-product-card-top {
            min-height: 24px;
            gap: 5px;
            margin-bottom: 14px;
          }

          .shop-product-badge {
            min-height: 22px !important;
            max-width: 100%;
            padding: 0 7px !important;
            font-size: 5.8px !important;
            letter-spacing: 0.04em !important;
            line-height: 1.1 !important;
            white-space: normal !important;
          }

          .shop-product-type {
            font-size: 5.8px;
            white-space: nowrap;
          }

          .shop-product-meta {
            margin-bottom: 6px !important;
          }

          .shop-product-meta span {
            font-size: 6px;
            line-height: 1.3;
          }

          .shop-product-body h3 {
            margin-bottom: 7px !important;
            font-size: 13px !important;
            line-height: 1.2 !important;
          }

          .shop-product-body > p {
            display: -webkit-box;
            margin-bottom: 0 !important;
            overflow: hidden;
            font-size: 8px !important;
            line-height: 1.5 !important;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 5;
          }

          .shop-product-bottom {
            grid-template-columns: 1fr !important;
            gap: 9px !important;
            margin-top: auto !important;
            padding-top: 16px !important;
          }

          .shop-product-bottom > div:first-child {
            min-height: 42px;
          }

          .shop-product-bottom small {
            font-size: 6px !important;
          }

          .shop-product-bottom strong {
            font-size: 13px !important;
          }

          .shop-product-bottom del {
            font-size: 8px !important;
          }

          .shop-view-button {
            width: 100% !important;
            min-width: 0 !important;
            min-height: 34px !important;
            padding: 0 7px !important;
            font-size: 7px !important;
          }
        }

        @media (max-width: 430px) {
          .shop-product-grid {
            gap: 8px !important;
          }

          .shop-product-card,
          .shop-product-body {
            min-height: 260px !important;
          }

          .shop-product-body {
            padding: 11px !important;
          }

          .shop-product-badge {
            min-height: 20px !important;
            padding: 0 6px !important;
            font-size: 5.2px !important;
          }

          .shop-product-type {
            font-size: 5.2px !important;
          }

          .shop-product-body h3 {
            font-size: 12px !important;
          }

          .shop-product-body > p {
            font-size: 7.5px !important;
          }

          .shop-product-bottom {
            padding-top: 14px !important;
          }

          .shop-product-bottom strong {
            font-size: 12px !important;
          }

          .shop-view-button {
            min-height: 32px !important;
            font-size: 6.5px !important;
          }
        }

        @media (max-width: 760px) {
          .shop-category-description {
            max-width: 100%;
            margin-top: 6px;
            font-size: 0.72rem;
            line-height: 1.5;
          }
        }
      `}</style>
    </>
  );
}
