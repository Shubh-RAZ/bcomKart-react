import React from "react";
import { useEffect, useState } from "react";
import { apiRequest } from "../../context/AuthContext";

export function CouponBox({ subtotal, onDiscount, onCoupon }) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiRequest("/coupons/available")
      .then(setAvailableCoupons)
      .catch(() => setAvailableCoupons([]));
  }, []);

  const applyCoupon = async () => {
    setLoading(true);
    try {
      const result = await apiRequest("/coupons/apply", {
        method: "POST",
        body: JSON.stringify({ code, subtotal })
      });
      onDiscount(result.discount);
      onCoupon(result.code);
      setMessage(`✓ Coupon applied! You saved ₹${result.discount.toLocaleString("en-IN")}.`);
    } catch (error) {
      setMessage(error.message || "This coupon is not available for your account.");
      onDiscount(0);
      onCoupon("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="coupon-box">
      <h3>Apply Coupon</h3>
      <div className="coupon-input"><input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter coupon code"/><button type="button" onClick={applyCoupon} disabled={loading}>{loading ? "..." : "Apply"}</button></div>
      {availableCoupons.length > 0 && <small className="available-coupons">Available for you: {availableCoupons.map((coupon) => coupon.code).join(", ")}</small>}
      {message && <div className={`coupon-message ${message.startsWith("✓") ? "success" : "error"}`}>{message}</div>}
    </div>
  );
}
