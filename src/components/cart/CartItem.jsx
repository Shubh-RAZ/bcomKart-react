import React from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../../context/CartContext";

export function CartItem({ item }) {
  const { product, quantity } = item;
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="cart-item">
      <img src={product.image} alt={product.name}/>
      <div className="cart-item-details">
        <span className="product-category">{product.category}</span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="price-row"><strong>₹{product.price.toLocaleString("en-IN")}</strong><del>₹{product.originalPrice.toLocaleString("en-IN")}</del></div>
      </div>
      <div className="cart-item-actions">
        <div className="qty-control"><button onClick={() => updateQuantity(product.id, quantity - 1)}><Minus size={14}/></button><b>{quantity}</b><button onClick={() => updateQuantity(product.id, quantity + 1)}><Plus size={14}/></button></div>
        <button className="remove-button" onClick={() => removeFromCart(product.id)}><Trash2 size={17}/> Remove</button>
      </div>
    </div>
  );
}
