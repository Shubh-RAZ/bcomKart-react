import React from "react";
import { useState } from "react";
import { CheckCircle2, CreditCard, LockKeyhole } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { DeliveryForm } from "../components/checkout/DeliveryForm";
import { CouponBox } from "../components/checkout/CouponBox";
import { OrderSummary } from "../components/checkout/OrderSummary";

export function CheckoutPage() {
  const { items, subtotal, delivery, clearCart } = useCart();
  const navigate = useNavigate();
  const [discount, setDiscount] = useState(0);
  const [form, setForm] = useState({ fullName: "Shubham Raj", phone: "", address: "", landmark: "", city: "Bangalore", state: "Karnataka", pincode: "" });
  const [placed, setPlaced] = useState(false);

  const total = Math.max(0, subtotal - discount + delivery);

  const handleChange = (e) => setForm((current) => ({ ...current, [e.target.name]: e.target.value }));

  const placeOrder = (e) => {
    e.preventDefault();
    if (!items.length) return;
    setPlaced(true);
    clearCart();
  };

  if (placed) return <div className="success-page"><CheckCircle2 size={64}/><span className="eyebrow">Order confirmed</span><h1>Thanks, Shubham! 🎉</h1><p>Your bcom.kart order has been placed successfully. A confirmation will be sent to your phone.</p><Link to="/" className="primary-button">Continue Shopping</Link></div>;

  if (!items.length) return <div className="empty-page"><span>🧾</span><h2>No items to checkout</h2><p>Add a product to your cart first.</p><Link to="/" className="primary-button">Shop Now</Link></div>;

  return (
    <form className="checkout-page" onSubmit={placeOrder}>
      <div className="checkout-progress"><div className="active"><b>1</b><span>Delivery</span></div><i></i><div><b>2</b><span>Payment</span></div><i></i><div><b>3</b><span>Confirmed</span></div></div>
      <div className="checkout-layout">
        <div className="checkout-main">
          <DeliveryForm form={form} onChange={handleChange}/>
          <CouponBox subtotal={subtotal} onDiscount={setDiscount}/>
          <div className="payment-box"><div><CreditCard size={21}/><div><h3>Payment</h3><p>UPI, cards, net banking and more</p></div></div><span>Secure</span></div>
        </div>
        <aside className="checkout-side"><OrderSummary items={items} subtotal={subtotal} discount={discount} delivery={delivery} total={total}/><button type="submit" className="primary-button full">Proceed to Payment <LockKeyhole size={16}/></button><small className="secure-note">🔒 Your payment information is protected.</small></aside>
      </div>
    </form>
  );
}
