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
        .shop-tech-page {
          --shop-ink: #1d181b;
          --shop-ink-2: #30262b;
          --shop-pink: #c87998;
          --shop-pink-bright: #df8eae;
          --shop-paper: #fffafb;
          --shop-line: rgba(79, 55, 65, .14);
          --shop-muted: #786970;
          overflow: hidden;
          background: #fffdfd;
          color: var(--shop-ink);
        }

        .shop-tech-page .container {
          width: min(1180px, calc(100% - 48px));
          margin: 0 auto;
        }

        .shop-tech-hero {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          min-height: 650px;
          padding: 0;
          background:
            radial-gradient(circle at 76% 42%, rgba(215, 130, 164, .19), transparent 22rem),
            linear-gradient(125deg, #fffdfd 0%, #fff7fa 55%, #f2e9ee 100%);
        }

        .shop-tech-grid {
          position: absolute;
          inset: 0;
          z-index: -2;
          background-image:
            linear-gradient(rgba(87, 61, 72, .055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(87, 61, 72, .055) 1px, transparent 1px);
          background-size: 58px 58px;
          mask-image: linear-gradient(to bottom, #000 0%, rgba(0,0,0,.8) 72%, transparent 100%);
        }

        .shop-tech-glow {
          position: absolute;
          z-index: -1;
          width: 510px;
          height: 510px;
          right: -120px;
          top: -110px;
          border: 1px solid rgba(200,121,152,.14);
          border-radius: 50%;
          box-shadow: 0 0 0 70px rgba(200,121,152,.025), 0 0 0 140px rgba(200,121,152,.015);
        }

        .shop-tech-shell {
          min-height: 650px;
          display: flex;
          flex-direction: column;
          padding: 22px 0 18px;
        }

        .shop-tech-systemline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--shop-line);
          color: #8e737e;
          font-size: 6px;
          font-weight: 900;
          letter-spacing: .17em;
        }

        .shop-tech-systemline span:first-child {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #a46c82;
        }

        .shop-tech-systemline i {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--shop-pink);
          box-shadow: 0 0 0 4px rgba(200,121,152,.1);
        }

        .shop-tech-hero-layout {
          flex: 1;
          display: grid;
          grid-template-columns: minmax(0, 1.06fr) minmax(390px, .94fr);
          align-items: center;
          gap: 40px;
          padding: 36px 0 28px;
        }

        .shop-tech-hero-copy { position: relative; z-index: 3; }

        .shop-tech-hero .section-kicker {
          display: block;
          margin-bottom: 17px;
          color: #b2768d;
          font-size: 7px;
          font-weight: 950;
          letter-spacing: .2em;
          text-transform: uppercase;
        }

        .shop-tech-hero-copy h1 {
          width: max-content;
          max-width: 100%;
          margin: 0;
          font-size: clamp(70px, 7.7vw, 116px);
          font-weight: 950;
          line-height: .77;
          letter-spacing: -.075em;
        }

        .shop-tech-hero-copy h1 > span,
        .shop-tech-hero-copy h1 > em {
          display: block;
          white-space: nowrap;
        }

        .shop-tech-hero-copy h1 > span {
          color: var(--shop-pink);
        }

        .shop-tech-hero-copy h1 > em {
          color: transparent;
          font-style: normal;
          -webkit-text-stroke: 1.35px #665159;
        }

        .shop-tech-hero-copy > p {
          max-width: 520px;
          margin: 30px 0 0 42px;
          color: #675860;
          font-size: 12px;
          line-height: 1.75;
        }

        .shop-tech-hero-system {
          position: relative;
          width: min(100%, 470px);
          aspect-ratio: 1;
          justify-self: end;
          display: grid;
          place-items: center;
        }

        .shop-tech-orbit {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(85, 60, 70, .18);
        }

        .shop-tech-orbit-one {
          inset: 3%;
          border-style: dashed;
          animation: shopSpin 28s linear infinite;
        }

        .shop-tech-orbit-two {
          inset: 22%;
          border-color: rgba(200,121,152,.32);
          animation: shopSpin 18s linear infinite reverse;
        }

        .shop-tech-core {
          width: 112px;
          height: 112px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transform: rotate(45deg);
          background: linear-gradient(145deg,#2d2428,#171316);
          box-shadow: 0 26px 65px rgba(68,42,53,.25), 0 0 45px rgba(200,121,152,.15);
          color: #fff;
        }

        .shop-tech-core > * { transform: rotate(-45deg); }
        .shop-tech-core small { color: #96848c; font-size: 6px; font-weight: 900; letter-spacing: .16em; }
        .shop-tech-core strong { margin: 5px 0; color: #efa9c3; font-size: 17px; letter-spacing: .04em; }
        .shop-tech-core span { color: #75666c; font-size: 5px; font-weight: 900; letter-spacing: .18em; }

        .shop-tech-node {
          position: absolute;
          width: 84px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px;
          border: 1px solid rgba(86,60,70,.16);
          background: rgba(255,251,252,.84);
          box-shadow: 0 12px 28px rgba(76,48,59,.07);
          backdrop-filter: blur(10px);
        }

        .shop-tech-node b { font-size: 8px; letter-spacing: .06em; }
        .shop-tech-node span { color: #bb7891; font-size: 5px; font-weight: 900; }
        .shop-tech-node-a { left: 0; top: 20%; }
        .shop-tech-node-b { right: 0; top: 20%; }
        .shop-tech-node-c { left: 0; bottom: 20%; }
        .shop-tech-node-d { right: 0; bottom: 20%; }

        .shop-tech-rail {
          display: flex;
          align-items: center;
          gap: 11px;
          padding-top: 14px;
          border-top: 1px solid var(--shop-line);
          color: #75636b;
          font-size: 6px;
          font-weight: 900;
          letter-spacing: .14em;
        }

        .shop-tech-rail i {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: var(--shop-pink);
        }

        .shop-tech-rail b {
          margin-left: auto;
          color: #a56d83;
          font-size: 5px;
          letter-spacing: .15em;
        }

        .shop-tech-content {
          position: relative;
          padding: 72px 0 100px;
          background:
            linear-gradient(rgba(81,58,67,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(81,58,67,.035) 1px, transparent 1px),
            #fffdfd;
          background-size: 72px 72px;
        }

        .shop-toolbar {
          display: grid;
          grid-template-columns: minmax(0,1fr) 260px;
          gap: 24px;
          align-items: start;
          margin-bottom: 48px;
          padding-bottom: 25px;
          border-bottom: 1px solid var(--shop-line);
        }

        .shop-categories {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .shop-category-button {
          min-height: 37px;
          padding: 0 14px;
          border: 1px solid rgba(79,55,65,.16);
          border-radius: 0;
          background: rgba(255,255,255,.72);
          color: #746169;
          cursor: pointer;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .1em;
          text-transform: uppercase;
          transition: .2s ease;
        }

        .shop-category-button:hover,
        .shop-category-button.active {
          border-color: var(--shop-ink);
          background: var(--shop-ink);
          color: #fff;
        }

        .shop-search {
          display: grid;
          grid-template-columns: 34px 1fr;
          align-items: center;
          min-height: 42px;
          border-bottom: 1px solid #7d6972;
          background: transparent;
        }

        .shop-search span {
          color: var(--shop-pink);
          font-size: 18px;
        }

        .shop-search input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: var(--shop-ink);
          font: inherit;
          font-size: 11px;
        }

        .shop-heading-row {
          display: grid;
          grid-template-columns: minmax(0,1fr) auto;
          gap: 30px;
          align-items: end;
          margin-bottom: 32px;
        }

        .shop-count {
          display: block;
          margin-bottom: 9px;
          color: var(--shop-pink);
          font-size: 6px;
          font-weight: 950;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        .shop-heading-row h2 {
          margin: 0;
          color: var(--shop-ink);
          font-size: clamp(38px, 5vw, 66px);
          line-height: .9;
          letter-spacing: -.055em;
          text-transform: uppercase;
        }

        .shop-category-description {
          max-width: 650px;
          margin: 13px 0 0;
          color: var(--shop-muted);
          font-size: 10px;
          line-height: 1.7;
        }

        .shop-sort {
          min-width: 180px;
          height: 42px;
          padding: 0 34px 0 13px;
          border: 1px solid var(--shop-line);
          border-radius: 0;
          background: rgba(255,255,255,.82);
          color: #5f4d55;
          font-size: 8px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .shop-product-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0,1fr));
          gap: 12px !important;
          align-items: stretch !important;
        }

        .shop-product-card {
          position: relative;
          display: flex !important;
          min-height: 355px;
          height: 100% !important;
          overflow: hidden;
          border: 1px solid rgba(79,55,65,.14);
          border-radius: 0 !important;
          background: rgba(255,255,255,.86) !important;
          box-shadow: none !important;
          transition: transform .22s ease, border-color .22s ease, box-shadow .22s ease;
        }

        .shop-product-card::before {
          content: "";
          position: absolute;
          inset: 0 auto 0 0;
          width: 2px;
          height: auto;
          background: var(--shop-pink);
          transform: scaleY(0);
          transform-origin: bottom;
          transition: transform .25s ease;
        }

        .shop-product-card::after {
          content: "+";
          position: absolute;
          top: 10px;
          right: 12px;
          color: rgba(97,68,80,.24);
          font: 400 14px/1 ui-monospace, monospace;
        }

        .shop-product-card:hover {
          transform: translateY(-5px);
          border-color: rgba(200,121,152,.42);
          box-shadow: 0 22px 55px rgba(72,43,55,.09) !important;
        }

        .shop-product-card:hover::before { transform: scaleY(1); }

        .shop-product-body {
          display: flex !important;
          flex: 1 1 auto !important;
          min-height: 0 !important;
          height: 100% !important;
          flex-direction: column !important;
          padding: 27px !important;
        }

        .shop-product-card-top {
          display: flex;
          min-height: 28px;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 26px;
          padding-right: 15px;
        }

        .shop-product-badge {
          position: static !important;
          display: inline-flex !important;
          min-height: 25px !important;
          align-items: center !important;
          padding: 0 9px !important;
          border: 1px solid rgba(200,121,152,.24) !important;
          border-radius: 0 !important;
          background: rgba(200,121,152,.08) !important;
          color: #a8617c !important;
          font-size: 6px !important;
          font-weight: 950 !important;
          letter-spacing: .11em !important;
          text-transform: uppercase !important;
          box-shadow: none !important;
        }

        .shop-product-badge-muted {
          background: transparent !important;
          color: #927d85 !important;
        }

        .shop-product-type {
          color: #95838a;
          font-size: 6px;
          font-weight: 900;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .shop-product-meta { margin-bottom: 8px !important; }
        .shop-product-meta span {
          color: var(--shop-pink);
          font-size: 6px;
          font-weight: 950;
          letter-spacing: .14em;
          text-transform: uppercase;
        }

        .shop-product-body h3 {
          max-width: 280px;
          margin: 0 0 12px !important;
          color: var(--shop-ink) !important;
          font-size: 24px !important;
          line-height: 1.02 !important;
          letter-spacing: -.045em;
        }

        .shop-product-body > p {
          margin: 0 !important;
          color: var(--shop-muted) !important;
          font-size: 10px !important;
          line-height: 1.7 !important;
        }

        .shop-product-bottom {
          display: grid !important;
          grid-template-columns: 1fr auto !important;
          align-items: end !important;
          gap: 15px !important;
          margin-top: auto !important;
          padding-top: 25px !important;
          border-top: 1px solid rgba(79,55,65,.11);
        }

        .shop-product-bottom > div:first-child {
          display: flex;
          min-height: 48px;
          flex-direction: column;
          justify-content: flex-end;
        }

        .shop-product-bottom small {
          color: #9a858d;
          font-size: 6px !important;
          font-weight: 900;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .shop-product-bottom strong {
          margin-top: 4px;
          color: var(--shop-ink) !important;
          font-size: 18px !important;
          line-height: 1;
          letter-spacing: -.03em;
        }

        .shop-product-bottom del {
          margin-bottom: 2px;
          font-size: 9px !important;
          color: #9d8c93;
        }

        .shop-view-button {
          display: inline-flex !important;
          min-height: 39px !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px;
          padding: 0 13px !important;
          border: 1px solid var(--shop-ink) !important;
          border-radius: 0 !important;
          background: var(--shop-ink) !important;
          color: #fff !important;
          font-size: 7px !important;
          font-weight: 900 !important;
          letter-spacing: .04em;
          text-decoration: none;
          white-space: nowrap;
          transition: .2s ease;
        }

        .shop-view-button:hover {
          border-color: var(--shop-pink) !important;
          background: var(--shop-pink) !important;
        }

        .shop-tech-error {
          max-width: 620px;
          margin: 0 auto;
          padding: 70px 30px;
          border: 1px solid var(--shop-line);
          background: #fff;
          text-align: center;
        }

        .shop-tech-error > span {
          color: var(--shop-pink);
          font-size: 7px;
          font-weight: 950;
          letter-spacing: .15em;
        }

        .shop-tech-error h2 {
          margin: 14px 0 10px;
          font-size: clamp(30px,4vw,50px);
          letter-spacing: -.04em;
        }

        .shop-tech-error p { margin: 0 0 22px; color: var(--shop-muted); }

        @keyframes shopSpin { to { transform: rotate(360deg); } }

        @media (max-width: 900px) {
          .shop-tech-hero-layout {
            grid-template-columns: minmax(0,1fr) minmax(320px,.8fr);
          }
          .shop-product-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
        }

        @media (max-width: 760px) {
          .shop-tech-page .container {
            width: min(100% - 32px, 1180px);
          }

          .shop-tech-hero { min-height: auto; }
          .shop-tech-shell { min-height: auto; padding-top: 17px; }

          .shop-tech-systemline span:last-child { display: none; }

          .shop-tech-hero-layout {
            display: flex;
            flex-direction: column;
            gap: 28px;
            padding: 27px 0 25px;
          }

          .shop-tech-hero-system {
            order: 1;
            width: min(330px, 90vw);
            align-self: center;
          }

          .shop-tech-hero-copy {
            order: 2;
            width: 100%;
          }

          .shop-tech-hero-copy h1 {
            width: 100%;
            font-size: clamp(49px, 14.1vw, 76px);
            line-height: .79;
            letter-spacing: -.07em;
          }

          .shop-tech-hero-copy h1 > span,
          .shop-tech-hero-copy h1 > em {
            white-space: nowrap;
          }

          .shop-tech-hero-copy > p {
            max-width: none;
            margin: 24px 0 0;
            font-size: 10px;
          }

          .shop-tech-core { width: 78px; height: 78px; }
          .shop-tech-core strong { font-size: 11px; }
          .shop-tech-core small, .shop-tech-core span { font-size: 4px; }

          .shop-tech-node {
            width: 62px;
            height: 43px;
            padding: 7px;
          }
          .shop-tech-node b { font-size: 5.5px; }
          .shop-tech-node span { font-size: 4px; }

          .shop-tech-rail {
            flex-wrap: wrap;
            justify-content: center;
            text-align: center;
            gap: 8px;
            padding-bottom: 4px;
            font-size: 4.5px;
          }
          .shop-tech-rail b {
            width: 100%;
            margin: 3px 0 0;
            text-align: center;
          }

          .shop-tech-content { padding: 50px 0 72px; }

          .shop-toolbar {
            grid-template-columns: 1fr;
            gap: 18px;
            margin-bottom: 36px;
          }

          .shop-categories {
            flex-wrap: nowrap;
            width: calc(100vw - 16px);
            margin-right: -16px;
            overflow-x: auto;
            padding-right: 16px;
            scrollbar-width: none;
          }
          .shop-categories::-webkit-scrollbar { display: none; }
          .shop-category-button { flex: 0 0 auto; }

          .shop-search { width: 100%; }

          .shop-heading-row {
            grid-template-columns: 1fr;
            gap: 17px;
            align-items: start;
          }

          .shop-sort { width: 100%; }

          .shop-product-grid {
            grid-template-columns: repeat(2, minmax(0,1fr)) !important;
            gap: 8px !important;
          }

          .shop-product-card {
            min-height: 285px !important;
          }

          .shop-product-body {
            min-height: 285px !important;
            padding: 13px !important;
          }

          .shop-product-card-top {
            min-height: 22px;
            gap: 4px;
            margin-bottom: 15px;
            padding-right: 7px;
          }

          .shop-product-badge {
            min-height: 20px !important;
            max-width: 100%;
            padding: 0 6px !important;
            font-size: 5px !important;
            white-space: normal;
          }

          .shop-product-type { font-size: 5px; white-space: nowrap; }
          .shop-product-meta span { font-size: 5.2px; }

          .shop-product-body h3 {
            font-size: 14px !important;
            line-height: 1.12 !important;
          }

          .shop-product-body > p {
            display: -webkit-box;
            overflow: hidden;
            font-size: 7.5px !important;
            line-height: 1.5 !important;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 5;
          }

          .shop-product-bottom {
            grid-template-columns: 1fr !important;
            gap: 9px !important;
            padding-top: 14px !important;
          }

          .shop-product-bottom > div:first-child { min-height: 39px; }
          .shop-product-bottom small { font-size: 5px !important; }
          .shop-product-bottom strong { font-size: 13px !important; }
          .shop-product-bottom del { font-size: 7px !important; }

          .shop-view-button {
            width: 100% !important;
            min-width: 0 !important;
            min-height: 32px !important;
            padding: 0 6px !important;
            font-size: 6px !important;
          }
        }

        @media (max-width: 430px) {
          .shop-tech-hero-copy h1 {
            width: 100%;
            max-width: 100%;
            font-size: clamp(38px, 11.2vw, 50px);
            line-height: .8;
            letter-spacing: -.075em;
          }

          .shop-tech-hero-copy h1 > span,
          .shop-tech-hero-copy h1 > em {
            max-width: 100%;
            white-space: nowrap;
          }

          .shop-tech-hero-copy h1 > em {
            font-size: .78em;
            letter-spacing: -.09em;
          }

          .shop-product-card,
          .shop-product-body { min-height: 275px !important; }
          .shop-product-body { padding: 11px !important; }
          .shop-product-body h3 { font-size: 12.5px !important; }
          .shop-product-body > p { font-size: 7px !important; }
        }

        /* Final mobile hero safeguard: keep READY TO WORK fully inside viewport. */
        @media (max-width: 760px) {
          .shop-tech-hero-copy {
            min-width: 0 !important;
            max-width: 100% !important;
            overflow: visible !important;
          }

          .shop-tech-hero-copy h1 {
            width: 100% !important;
            max-width: 100% !important;
            overflow: visible !important;
          }

          .shop-tech-hero-copy h1 > em {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            font-size: 8.8vw !important;
            line-height: .95 !important;
            letter-spacing: -.075em !important;
            white-space: nowrap !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .shop-tech-orbit { animation: none !important; }
          .shop-product-card { transition: none !important; }
        }
      `}</style>
    </>
  );
}
