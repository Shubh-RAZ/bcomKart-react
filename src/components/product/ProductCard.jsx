import React, { useEffect, useRef, useState } from "react";
import { Check, Heart, ShoppingCart, Zap } from "lucide-react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { Rating } from "../common/Rating";

export function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartFeedback, setCartFeedback] = useState(false);
  const [cartFlight, setCartFlight] = useState(null);
  const imageRef = useRef(null);

  const productId = product.productId || product.id;
  const inWishlist = isInWishlist(productId);

  useEffect(() => {
    if (!cartFeedback) return undefined;
    const timeout = window.setTimeout(() => setCartFeedback(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [cartFeedback]);
  
  // Calculate original price based on discount
  const discountPercent = product.discount || 0;
  const currentPrice = product.price || 0;
  const originalPrice = discountPercent > 0 
    ? Math.round(currentPrice / (1 - discountPercent / 100))
    : currentPrice;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      ...product,
      productId: productId,
      id: productId,
      name: product.name || product.productName,
    });
    setCartFeedback(true);
    const cartTarget = document.querySelector(".floating-cart");
    const source = imageRef.current;
    if (source && cartTarget) {
      const sourceRect = source.getBoundingClientRect();
      const targetRect = cartTarget.getBoundingClientRect();
      setCartFlight({
        image: product.image,
        x: sourceRect.left + sourceRect.width / 2 - 25,
        y: sourceRect.top + sourceRect.height / 2 - 25,
        toX: targetRect.left + targetRect.width / 2 - (sourceRect.left + sourceRect.width / 2),
        toY: targetRect.top + targetRect.height / 2 - (sourceRect.top + sourceRect.height / 2),
      });
    }
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      ...product,
      productId: productId,
      id: productId,
      name: product.name || product.productName,
    });
    navigate("/checkout");
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
        <img ref={imageRef} src={product.image} alt={product.name || product.productName} loading="lazy" />
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
        <div className="product-card-actions">
          <button className={`add-cart-button ${cartFeedback ? "is-added" : ""}`} onClick={handleAddToCart}>
            {cartFeedback ? <Check size={17} className="cart-check" /> : <ShoppingCart size={17} />}
            {cartFeedback ? "Added" : "Add to Cart"}
          </button>
          <button className="buy-now-button" onClick={handleBuyNow}>
            <Zap size={15} fill="currentColor" /> Buy Now
          </button>
        </div>
        {cartFeedback && (
          <div className="cart-feedback" role="status" aria-live="polite">
            <Check size={14} /> Added to cart
          </div>
        )}
      </div>
      {cartFlight && createPortal(
        <div
          className="cart-flight"
          style={{ "--flight-x": `${cartFlight.toX}px`, "--flight-y": `${cartFlight.toY}px`, left: `${cartFlight.x}px`, top: `${cartFlight.y}px` }}
          onAnimationEnd={() => setCartFlight(null)}
          aria-hidden="true"
        >
          <img src={cartFlight.image} alt="" />
        </div>,
        document.body
      )}
    </article>
  );
}

