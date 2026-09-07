import React from "react";
import { useEffect, useState } from "react";
import { apiRequest } from "../../context/AuthContext";
import { useAuth } from "../../context/AuthContext";

export function CouponBox({ subtotal, onDiscount, onCoupon }) {
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setAvailableCoupons([]);
      return undefined;
    }
    apiRequest("/coupons/available")
      .then(setAvailableCoupons)
      .catch(() => setAvailableCoupons([]));
    return undefined;
  }, [user]);

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

  const chooseCoupon = (couponCode) => {
    setCode(couponCode);
    setMessage("");
  };

  return (
    <div className="coupon-box">
      <h3>Apply Coupon</h3>
      <div className="coupon-input"><input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter coupon code"/><button type="button" onClick={applyCoupon} disabled={loading}>{loading ? "..." : "Apply"}</button></div>
      {availableCoupons.length > 0 && <div className="available-coupon-list"><span>Coupons available for you</span><div>{availableCoupons.map((coupon) => <button type="button" className={code === coupon.code ? "selected" : ""} key={coupon.code} onClick={() => chooseCoupon(coupon.code)}>{coupon.code}<small>Save up to ₹{Number(coupon.discountPrice).toLocaleString("en-IN")}</small></button>)}</div></div>}
      {message && <div className={`coupon-message ${message.startsWith("✓") ? "success" : "error"}`}>{message}</div>}
    </div>
  );
}
