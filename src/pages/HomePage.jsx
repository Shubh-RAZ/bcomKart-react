import React from "react";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { Store, ShoppingBag, Wrench } from "lucide-react";
import { HeroBanner } from "../components/home/HeroBanner";
import { TrustFeatures } from "../components/home/TrustFeatures";
import { ProductCarousel } from "../components/product/ProductCarousel";
import { SectionHeader } from "../components/common/SectionHeader";
import { useProducts } from "../context/ProductsContext";
import { apiRequest, useAuth } from "../context/AuthContext";
import { useState } from "react";
import { LoadingScreen } from "../components/common/LoadingScreen";

export function HomePage() {
  const [params] = useSearchParams();
  const { products, requestedProducts, categories: remoteCategories, isLoading, error } = useProducts();
  const { user } = useAuth();
  const [requestDetails, setRequestDetails] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [requesting, setRequesting] = useState(false);
  const selectedService = params.get("service") || "Bcomkart";
  const selectedCategory = params.get("category") || "All";
  const search = (params.get("search") || "").toLowerCase();
  const requestName = params.get("search") || "";
  const serviceTabs = [
    { label: "Bcomkart", icon: Store },
    { label: "Groceries", icon: ShoppingBag },
    { label: "Services", icon: Wrench },
  ];
  const categories = ["All", ...(remoteCategories.length ? remoteCategories : [...new Set(products.map((product) => product.category || "Electronics"))])];

  if (isLoading) return <LoadingScreen label="Loading products" />;
  if (error) return <div className="empty-page"><h2>Could not load products</h2><p>{error}</p></div>;

  if (selectedService !== "Bcomkart") {
    return (
      <>
        <div className="service-tabs">
          {serviceTabs.map(({ label, icon: Icon }) => (
            <Link
              key={label}
              to={label === "Bcomkart" ? "/" : `/?service=${encodeURIComponent(label)}`}
              className={selectedService === label ? "service-tab active" : "service-tab"}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          ))}
        </div>
        <div className="coming-soon-card">
          <span className="coming-soon-icon">{selectedService === "Groceries" ? "🛒" : "🛠️"}</span>
          <h2>{selectedService} is coming soon</h2>
          <p>We’re building this storefront experience next. Once live, it will open with its own product catalog and service flow.</p>
        </div>
      </>
    );
  }

  const genderProducts = user?.gender
    ? products.filter((product) => !product.gender || product.gender === "All" || product.gender === user.gender)
    : products;
  const filtered = genderProducts.filter((product) => {
    const categoryMatch = selectedCategory === "All" || (product.category || "Electronics") === selectedCategory;
    const productName = product.name || product.productName || "";
    const productDesc = product.description || product.productDescription || "";
    const searchMatch = !search || `${productName} ${productDesc}`.toLowerCase().includes(search);
    return categoryMatch && searchMatch;
  });

  const trendingDeals = [...genderProducts].sort((a, b) => (b.discount || 0) - (a.discount || 0));

  const sections = selectedCategory === "All" && !search
    ? [
        ["🔥 Trending Deals", trendingDeals],
        ["🛍️ Browse all products", genderProducts]
      ]
    : [[search ? `Search results for "${search}"` : selectedCategory, filtered]];

  const submitRequest = async (event) => {
    event.preventDefault();
    setRequesting(true);
    try {
      await apiRequest("/products/requests", { method: "POST", body: JSON.stringify({ productName: requestName, description: requestDetails }) });
      setRequestMessage("Your request has been sent to our team.");
      setRequestDetails("");
    } catch (requestError) { setRequestMessage(requestError.message); } finally { setRequesting(false); }
  };

  return (
    <>
      <div className="service-tabs">
        {serviceTabs.map(({ label, icon: Icon }) => (
          <Link
            key={label}
            to={label === "Bcomkart" ? "/" : `/?service=${encodeURIComponent(label)}`}
            className={selectedService === label ? "service-tab active" : "service-tab"}
          >
            <Icon size={16} />
            <span>{label}</span>
          </Link>
        ))}
      </div>
      <HeroBanner />
      <div className="category-pills">
        {categories.map((category) => (
          <Link to={category === "All" ? "/" : `/?category=${encodeURIComponent(category)}`} className={selectedCategory === category ? "active" : ""} key={category}>{category}</Link>
        ))}
      </div>
      {filtered.length === 0 ? <div className="empty-page"><span>🔎</span><h2>No products found</h2><p>Try another search or category.</p>{user && requestName ? <form className="request-product-form" onSubmit={submitRequest}><h3>Tell us what you were looking for</h3><textarea value={requestDetails} onChange={(event) => setRequestDetails(event.target.value)} placeholder="Brand, size, colour or any useful detail" /><button className="primary-button" disabled={requesting}>{requesting ? "Sending..." : "Request product"}</button>{requestMessage && <small>{requestMessage}</small>}</form> : <p><a href={user ? "/" : "/login"} className="view-all">{user ? "Search for a product to request it" : "Sign in to request this product"}</a></p>}</div> :
        sections.map(([title, sectionProducts]) => (
          <section className="product-section" key={title}>
            <SectionHeader title={title} action={<a href="/?category=All" className="view-all">View All →</a>} />
            <ProductCarousel products={sectionProducts} slideshow={title.includes("Trending Deals")} />
          </section>
        ))
      }
      {requestedProducts.length > 0 && <section className="product-section requested-section"><SectionHeader title="Requested by our customers" action={<span className="requested-label">REQUESTED</span>} /><div className="requested-product-list">{requestedProducts.map((request) => <article className="requested-product" key={request.requestId}><span className="requested-label">REQUESTED</span><h3>{request.productName}</h3><p>{request.description || "Our team is reviewing this product request."}</p></article>)}</div></section>}
      <TrustFeatures />
    </>
  );
}
