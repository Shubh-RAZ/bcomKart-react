import React from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { Rating } from "../common/Rating";

export function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  const productId = product.productId || product.id;
  const inWishlist = isInWishlist(productId);
  
  // Calculate original price based on discount
  const discountPercent = product.discount || 0;
  const currentPrice = product.price || 0;
  const originalPrice = discountPercent > 0 
    ? Math.round(currentPrice / (1 - discountPercent / 100))
    : currentPrice;

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart({
      ...product,
      productId: productId,
      id: productId,
      name: product.name || product.productName,
    });
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert("Please login to add items to wishlist");
      return;
    }
    
    await toggleWishlist(productId);
  };

  return (
    <article className="product-card">
      <Link to={`/product/${productId}`} className="product-image-wrap">
        <img src={product.image} alt={product.name || product.productName} loading="lazy" />
        {discountPercent > 0 && <span className="discount-badge">{discountPercent}% OFF</span>}
        <button 
          className={`heart-badge ${inWishlist ? 'active' : ''}`} 
          onClick={handleWishlistToggle}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={17} fill={inWishlist ? "currentColor" : "none"} />
        </button>
      </Link>

      <div className="product-card-content">
        <span className="product-category">{product.category || 'Electronics'}</span>
        <Link to={`/product/${productId}`} className="product-name">
          {product.name || product.productName}
        </Link>
        <p>{product.description || product.productDescription}</p>
        <Rating value={product.rating} />
        <div className="price-row">
          <strong>₹{currentPrice.toLocaleString("en-IN")}</strong>
          {originalPrice > currentPrice && (
            <del>₹{originalPrice.toLocaleString("en-IN")}</del>
          )}
        </div>
        <button className="add-cart-button" onClick={handleAddToCart}>
          <ShoppingCart size={17} /> Add to Cart
        </button>
      </div>
    </article>
  );
}

