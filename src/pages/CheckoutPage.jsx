import React, { useEffect, useState } from "react";
import { CheckCircle2, Coins, LockKeyhole, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth, apiRequest } from "../context/AuthContext";
import { DeliveryForm } from "../components/checkout/DeliveryForm";
import { CouponBox } from "../components/checkout/CouponBox";
import { OrderSummary } from "../components/checkout/OrderSummary";

export function CheckoutPage() {
  const { items, subtotal, delivery, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [form, setForm] = useState({ 
    fullName: user?.name || "", 
    phone: "", 
    address: "", 
    landmark: "", 
    city: "", 
    state: "", 
    pincode: "" 
  });
  const [placed, setPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [bcomCoins, setBcomCoins] = useState(0);
  const [coinsUsed, setCoinsUsed] = useState(0);
  const beforeCoins = Math.max(0, subtotal - discount);
  const total = Math.max(0, beforeCoins - coinsUsed + delivery);

  useEffect(() => {
    if (!user) return;
    apiRequest("/users/me").then((account) => setBcomCoins(account.bcomCoins || 0)).catch(() => setBcomCoins(0));
  }, [user]);

  useEffect(() => {
    setCoinsUsed((current) => Math.min(current, bcomCoins, beforeCoins));
  }, [bcomCoins, beforeCoins]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fields
    if (!form.fullName || !form.fullName.trim()) {
      newErrors.fullName = "Name is required";
    }
    
    if (!form.phone || !form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Phone number must be 10 digits";
    }
    
    if (!form.address || !form.address.trim()) {
      newErrors.address = "Address is required";
    }
    
    if (!form.city || !form.city.trim()) {
      newErrors.city = "City is required";
    }
    
    if (!form.state || !form.state.trim()) {
      newErrors.state = "State is required";
    }
    
    if (!form.pincode || !form.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    
    if (!items.length) {
      setApiError("No items in cart");
      return;
    }

    if (!user) {
      setApiError("You must be logged in to place an order");
      return;
    }

    if (!validateForm()) {
      setApiError("Please fill all required fields correctly");
      return;
    }

    try {
      setLoading(true);
      setApiError("");

      // Create order payload
      const orderPayload = {
        products: items.map(item => ({
          productId: item.product.productId || item.product.id,
          name: item.product.name || item.product.productName,
          quantity: item.quantity,
          price: item.product.price
        })),
        userName: form.fullName,
        phone: form.phone,
        address_line_1: form.address,
        address_line_2: form.landmark || "",
        city: form.city,
        state: form.state,
        postalCode: form.pincode,
        coupons: couponCode ? [couponCode] : [],
        totalAmount: beforeCoins - coinsUsed,
        bcomCoinsUsed: coinsUsed,
        paymentMethod: "COD"
      };

      // Make API request
      const result = await apiRequest("/orders", {
        method: "POST",
        body: JSON.stringify(orderPayload)
      });

      // Success
      setOrderId(result.orderId);
      setPlaced(true);
      clearCart();
    } catch (error) {
      console.error("Order placement error:", error);
      setApiError(error.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (placed) {
    return (
      <div className="success-page">
        <CheckCircle2 size={64}/>
        <span className="eyebrow">Order confirmed</span>
        <h1>Thanks, {form.fullName}! 🎉</h1>
        <p>Your Bcomkart order has been placed successfully.</p>
        <p style={{ fontSize: "14px", color: "#666" }}>Order ID: <strong>{orderId}</strong></p>
        <p>A confirmation email has been sent to {user?.email}</p>
        <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to={`/order-status/${orderId}`} className="primary-button">Track Order</Link>
          <Link to="/" className="primary-button" style={{ backgroundColor: "#f0f0f0", color: "#333" }}>Continue Shopping</Link>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="empty-page">
        <span>🧾</span>
        <h2>No items to checkout</h2>
        <p>Add a product to your cart first.</p>
        <Link to="/" className="primary-button">Shop Now</Link>
      </div>
    );
  }

  return (
    <form className="checkout-page" onSubmit={placeOrder}>
      <div className="checkout-progress">
        <div className="active"><b>1</b><span>Delivery</span></div>
        <i></i>
        <div className="active"><b>2</b><span>Payment</span></div>
        <i></i>
        <div><b>3</b><span>Confirmed</span></div>
      </div>
      
      <div className="checkout-layout">
        <div className="checkout-main">
          <DeliveryForm form={form} onChange={handleChange} errors={errors}/>
          
          <div className="payment-box" style={{ backgroundColor: "#f0f9ff", borderLeft: "4px solid #0070f3" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ fontSize: "24px" }}>💵</div>
              <div>
                <h3>Payment Method</h3>
                <p><strong>Cash on Delivery (COD)</strong></p>
                <p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>Pay when you receive your order</p>
              </div>
            </div>
            <span style={{ backgroundColor: "#0070f3", color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}>Only Option</span>
          </div>

          <CouponBox subtotal={subtotal} onDiscount={setDiscount} onCoupon={setCouponCode}/>
          <div className="coins-checkout-box">
            <div className="coins-checkout-heading"><span className="coins-icon"><Coins size={19} /></span><div><strong>Use BcomCoins</strong><small>{bcomCoins} coins available · 1 coin = ₹1</small></div></div>
            <label className="coins-toggle"><input type="checkbox" checked={coinsUsed > 0} onChange={(event) => setCoinsUsed(event.target.checked ? Math.min(bcomCoins, beforeCoins) : 0)} disabled={!bcomCoins || !beforeCoins} /><span>Apply available coins</span></label>
            {coinsUsed > 0 && <div className="coins-range"><input type="range" min="0" max={Math.min(bcomCoins, beforeCoins)} value={coinsUsed} onChange={(event) => setCoinsUsed(Number(event.target.value))} /><strong>{coinsUsed} coins = ₹{coinsUsed} off</strong></div>}
          </div>
          
          {apiError && (
            <div style={{ 
              backgroundColor: "#fee", 
              color: "#c33", 
              padding: "12px", 
              borderRadius: "4px", 
              display: "flex", 
              gap: "8px",
              marginBottom: "16px"
            }}>
              <AlertCircle size={20} />
              <div>
                <strong>Error</strong>
                <p>{apiError}</p>
              </div>
            </div>
          )}
        </div>
        
        <aside className="checkout-side">
          <OrderSummary items={items} subtotal={subtotal} discount={discount} delivery={delivery} total={total}/>
          <button 
            type="submit" 
            className="primary-button full" 
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Processing..." : "Place Order (COD)"} <LockKeyhole size={16}/>
          </button>
          <small className="secure-note">🔒 Your information is secure. No payment is taken now.</small>
        </aside>
      </div>
    </form>
  );
}
