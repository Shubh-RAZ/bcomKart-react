import React from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { ProductCard } from "../components/product/ProductCard";
import { useProducts } from "../context/ProductsContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { LoadingScreen } from "../components/common/LoadingScreen";

export function WishlistPage() {
  const { user } = useAuth();
  const { products, isLoading: productsLoading } = useProducts();
  const { wishlist, loading: wishlistLoading } = useWishlist();

  if (!user) return <Navigate to="/login" replace />;
  if (productsLoading || wishlistLoading) return <LoadingScreen label="Loading your wishlist" />;

  const wishlistProducts = products.filter((product) => wishlist.includes(product.id || product.productId));

  return (
    <div className="wishlist-page">
      <div className="page-heading">
        <p className="eyebrow"><Heart size={14} /> Saved for later</p>
        <h1>Your wishlist</h1>
        <p>Keep the products you love close by.</p>
      </div>
      {wishlistProducts.length ? (
        <div className="wishlist-grid">
          {wishlistProducts.map((product) => <ProductCard key={product.id || product.productId} product={product} />)}
        </div>
      ) : (
        <div className="empty-page wishlist-empty">
          <Heart size={30} />
          <h2>Your wishlist is empty</h2>
          <p>Tap the heart on a product to save it here.</p>
          <Link to="/" className="primary-button"><ShoppingBag size={16} /> Explore products</Link>
        </div>
      )}
    </div>
  );
}
