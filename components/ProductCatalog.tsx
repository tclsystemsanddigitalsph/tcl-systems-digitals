"use client";
import { useState } from "react";
import Link from "next/link";
import { type Product, formatPrice, productPrice, safeWebUrl } from "@/lib/products";
type ProductPreview = "system" | "starter" | "pack" | "business";
function ProductPreview({
  preview,
}: {
  preview: ProductPreview;
}) {
  if (preview === "system") {
    return (
      <div className="shop-system-window">
        <div className="shop-system-window-bar">
          <span />
          <span />
          <span />
        </div>

        <div className="shop-system-window-body">
          <div className="shop-system-sidebar">
            <div />
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="shop-system-main">
            <div className="shop-system-title" />

            <div className="shop-system-stats">
              <span />
              <span />
              <span />
            </div>

            <div className="shop-system-chart" />
          </div>
        </div>
      </div>
    );
  }

  if (preview === "starter") {
    return (
      <div className="shop-digital-stack">
        <div className="shop-digital-sheet back">
          <span />
          <span />
          <span />
        </div>

        <div className="shop-digital-sheet front">
          <small>BUSINESS</small>
          <strong>Starter Kit</strong>
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  if (preview === "pack") {
    return (
      <div className="shop-resource-preview">
        <div className="shop-resource-card">
          <small>CLIENT</small>
          <strong>Management</strong>

          <div className="shop-resource-lines">
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-website-window">
      <div className="shop-website-top">
        <strong>TCL</strong>

        <div>
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="shop-website-body">
        <small>YOUR BUSINESS</small>
        <strong>Build a stronger online presence.</strong>
        <span />
        <span />
        <button type="button" tabIndex={-1} aria-hidden="true">Explore</button>
      </div>
    </div>
  );
}

function getProductImageClass(preview: ProductPreview) {
  switch (preview) {
    case "system":
      return "shop-product-image-1";

    case "starter":
      return "shop-product-image-3";

    case "pack":
      return "shop-product-image-4";

    case "business":
      return "shop-product-image-2";
  }
}


export default function ProductCatalog({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("featured");
  const categories = Array.from(new Set(products.map(p => p.category))).sort();
  const visible = products.filter(p => (!category || p.category === category) &&
    `${p.name} ${p.short_description ?? ""} ${p.category}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => sort === "price-low" ? productPrice(a) - productPrice(b) :
      sort === "price-high" ? productPrice(b) - productPrice(a) :
      sort === "newest" ? Date.parse(b.created_at) - Date.parse(a.created_at) :
      Number(b.is_featured) - Number(a.is_featured) || a.display_order - b.display_order || a.name.localeCompare(b.name));
  return <>
    <div className="shop-toolbar">
      <div className="shop-categories">{["", ...categories].map(c =>
        <button key={c} type="button" className={`shop-category-button ${category === c ? "active" : ""}`}
          aria-pressed={category === c} onClick={() => setCategory(c)}>{c || "All Products"}</button>)}</div>
      <div className="shop-search"><span>⌕</span><input type="search" aria-label="Search products"
        placeholder="Search products" value={query} onChange={e => setQuery(e.target.value)} /></div>
    </div>
    <div className="shop-heading-row"><div><span className="shop-count" aria-live="polite">{visible.length} {visible.length === 1 ? "product" : "products"}</span>
      <h2>{category || "All Products"}</h2></div>
      <select className="shop-sort" aria-label="Sort products" value={sort} onChange={e => setSort(e.target.value)}>
        <option value="featured">Featured</option><option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option><option value="newest">Newest</option>
      </select></div>
    {!visible.length && <div style={{ padding: "40px 20px", textAlign: "center" }}><h3>{products.length ? "No matching products" : "New products are on the way"}</h3>
      <p>{products.length ? "Try another search or category." : "Check back soon to explore our latest products."}</p>
      {products.length > 0 && <button className="shop-category-button" onClick={() => { setCategory(""); setQuery(""); }}>Clear filters</button>}</div>}
    <div className="shop-product-grid">{visible.map(product => {
      const preview: ProductPreview = product.category.toLowerCase().includes("booking") ? "system"
        : product.slug === "business-starter-kit" ? "starter"
        : product.category.toLowerCase().includes("website") || product.product_type === "SERVICE" ? "business" : "pack";
      const image = safeWebUrl(product.image_url);
      return <article className="shop-product-card" key={product.id}>
        <div className={`shop-product-image ${getProductImageClass(preview)}`}>
          {product.badge && <span className="shop-product-badge">{product.badge}</span>}
          <div className="shop-product-preview">{image ?
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={product.name} style={{ width: "100%", height: "100%", maxHeight: 280, objectFit: "contain", borderRadius: 16 }} /> : <ProductPreview preview={preview} />}</div>
        </div>
        <div className="shop-product-body"><div className="shop-product-meta"><span>{product.category}</span><small>{product.product_type === "SERVICE" ? "Service" : "Digital"}</small></div>
          <h3>{product.name}</h3><p>{product.short_description}</p>
          <div className="shop-product-bottom"><div><small>Price</small>
            {product.sale_price !== null && product.sale_price < product.price && <del style={{ display: "block", fontSize: 14, opacity: 0.65 }}>{formatPrice(product.price)}</del>}
            <strong>{formatPrice(productPrice(product))}</strong></div>
            <Link href={`/shop/${encodeURIComponent(product.slug)}`} className="shop-view-button" aria-label={`View ${product.name}`}>View Product <span>→</span></Link>
          </div></div></article>;
    })}</div>
  </>;
}
