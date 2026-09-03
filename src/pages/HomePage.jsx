import React from "react";
import { useSearchParams } from "react-router-dom";
import { HeroBanner } from "../components/home/HeroBanner";
import { TrustFeatures } from "../components/home/TrustFeatures";
import { ProductCarousel } from "../components/product/ProductCarousel";
import { SectionHeader } from "../components/common/SectionHeader";
import { categories, products } from "../data/products";

export function HomePage() {
  const [params] = useSearchParams();
  const selectedCategory = params.get("category") || "All";
  const search = (params.get("search") || "").toLowerCase();

  const filtered = products.filter((product) => {
    const categoryMatch = selectedCategory === "All" || product.category === selectedCategory;
    const searchMatch = !search || `${product.name} ${product.description}`.toLowerCase().includes(search);
    return categoryMatch && searchMatch;
  });

  const sections = selectedCategory === "All" && !search
    ? [
        ["🔥 Trending Deals", products],
        ["⚡ Electronics", products.filter((p) => p.category === "Electronics")],
        ["✨ Recommended For You", products.slice().reverse()]
      ]
    : [[search ? `Search results for "${search}"` : selectedCategory, filtered]];

  return (
    <>
      <HeroBanner />
      <div className="category-pills">
        {categories.map((category) => (
          <a href={category === "All" ? "/" : `/?category=${encodeURIComponent(category)}`} className={selectedCategory === category ? "active" : ""} key={category}>{category}</a>
        ))}
      </div>
      {filtered.length === 0 ? <div className="empty-page"><span>🔎</span><h2>No products found</h2><p>Try another search or category.</p></div> :
        sections.map(([title, sectionProducts]) => (
          <section className="product-section" key={title}>
            <SectionHeader title={title} action={<a href="/?category=All" className="view-all">View All →</a>} />
            <ProductCarousel products={sectionProducts} />
          </section>
        ))
      }
      <TrustFeatures />
    </>
  );
}
