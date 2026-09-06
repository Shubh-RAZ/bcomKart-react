import React from "react";
import { useSearchParams } from "react-router-dom";
import { HeroBanner } from "../components/home/HeroBanner";
import { TrustFeatures } from "../components/home/TrustFeatures";
import { ProductCarousel } from "../components/product/ProductCarousel";
import { SectionHeader } from "../components/common/SectionHeader";
import { useProducts } from "../context/ProductsContext";

export function HomePage() {
  const [params] = useSearchParams();
  const { products, isLoading, error } = useProducts();
  const selectedCategory = params.get("category") || "All";
  const search = (params.get("search") || "").toLowerCase();
  const categories = ["All", ...new Set(products.map((product) => product.category || "Electronics"))];

  if (isLoading) return <div className="empty-page"><h2>Loading products...</h2></div>;
  if (error) return <div className="empty-page"><h2>Could not load products</h2><p>{error}</p></div>;

  const filtered = products.filter((product) => {
    const categoryMatch = selectedCategory === "All" || (product.category || "Electronics") === selectedCategory;
    const productName = product.name || product.productName || "";
    const productDesc = product.description || product.productDescription || "";
    const searchMatch = !search || `${productName} ${productDesc}`.toLowerCase().includes(search);
    return categoryMatch && searchMatch;
  });

  // Sort by discount descending for trending deals
  const trendingDeals = [...products].sort((a, b) => (b.discount || 0) - (a.discount || 0));

  const sections = selectedCategory === "All" && !search
    ? [
        ["🔥 Trending Deals", trendingDeals],
        ["⚡ Electronics", products.filter((p) => (p.category || "Electronics") === "Electronics")],
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
