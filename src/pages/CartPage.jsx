import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "../context/CartContext";
import { CartItem } from "../components/cart/CartItem";

export function CartPage() {
  const { items, itemCount, subtotal, delivery } = useCart();
  const total = subtotal + delivery;

  if (!items.length) return <div className="empty-page"><span>🛒</span><h2>Your cart is empty</h2><p>Looks like you haven't added anything yet.</p><Link className="primary-button" to="/">Start Shopping</Link></div>;

  return (
    <div className="cart-page">
      <div className="page-heading"><div><span className="eyebrow">Bcomkart</span><h1>Your Cart</h1><p>{itemCount} {itemCount === 1 ? "item" : "items"} ready for checkout.</p></div></div>
      <div className="cart-layout">
        <div className="cart-items">{items.map((item) => <CartItem key={item.product.id} item={item}/>)}</div>
        <aside className="cart-summary">
          <h2>Price Details</h2>
          <div className="summary-lines"><div><span>Price ({itemCount} items)</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div><div><span>Delivery</span><span>{delivery ? `₹${delivery}` : "FREE"}</span></div></div>
          <div className="summary-total"><span>Total Amount</span><strong>₹{total.toLocaleString("en-IN")}</strong></div>
          <Link to="/checkout" className="primary-button full">Proceed to Checkout <ArrowRight size={17}/></Link>
          <div className="mini-benefits"><span><ShieldCheck size={17}/> Secure checkout</span><span><Truck size={17}/> Free delivery over ₹2,499</span></div>
        </aside>
      </div>
    </div>
  );
}
