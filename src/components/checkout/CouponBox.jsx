import React from "react";
import { useState } from "react";

const COUPONS = {
  SAVE10: { type: "percent", value: 10, label: "10% off" },
  WELCOME500: { type: "fixed", value: 500, label: "₹500 off" },
  BCOM20: { type: "percent", value: 20, cap: 750, label: "20% off up to ₹750" }
};

export function CouponBox({ subtotal, onDiscount }) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const applyCoupon = () => {
    const coupon = COUPONS[code.trim().toUpperCase()];
    if (!coupon) {
      setMessage("Invalid coupon code. Try SAVE10, WELCOME500 or BCOM20.");
      onDiscount(0);
      return;
    }
    const raw = coupon.type === "percent" ? subtotal * coupon.value / 100 : coupon.value;
    const discount = Math.min(Math.round(raw), coupon.cap ?? raw, subtotal);
    onDiscount(discount);
    setMessage(`✓ Coupon applied! You saved ₹${discount.toLocaleString("en-IN")}.`);
  };

  return (
    <div className="coupon-box">
      <h3>Apply Coupon</h3>
      <div className="coupon-input"><input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter coupon code"/><button onClick={applyCoupon}>Apply</button></div>
      {message && <div className={`coupon-message ${message.startsWith("✓") ? "success" : "error"}`}>{message}</div>}
    </div>
  );
}
