import React from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { Rating } from "../common/Rating";

export function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-image-wrap">
        <img src={product.image} alt={product.name} loading="lazy" />
        <span className="discount-badge">{product.discount}% OFF</span>
        <button className="heart-badge" onClick={(e) => e.preventDefault()} aria-label="Add to wishlist">
          <Heart size={17} />
        </button>
      </Link>

      <div className="product-card-content">
        <span className="product-category">{product.category}</span>
        <Link to={`/product/${product.id}`} className="product-name">{product.name}</Link>
        <p>{product.description}</p>
        <Rating value={product.rating} />
        <div className="price-row">
          <strong>₹{product.price.toLocaleString("en-IN")}</strong>
          <del>₹{product.originalPrice.toLocaleString("en-IN")}</del>
        </div>
        <button className="add-cart-button" onClick={() => addToCart(product)}>
          <ShoppingCart size={17} /> Add to Cart
        </button>
      </div>
    </article>
  );
}
