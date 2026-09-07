import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { CalendarDays, ChevronRight, Package, Truck } from "lucide-react";
import { apiRequest, useAuth } from "../context/AuthContext";
import "./OrdersPage.css";
import { LoadingScreen } from "../components/common/LoadingScreen";

const statusLabels = {
  PENDING: "Order placed",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled"
};

export function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    apiRequest("/orders")
      .then(setOrders)
      .catch((requestError) => setError(requestError.message || "Unable to load your orders."))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;
  if (loading) return <LoadingScreen label="Loading your orders" />;
  if (error) return <div className="empty-page"><span>!</span><h2>Orders unavailable</h2><p>{error}</p><Link to="/" className="primary-button">Continue Shopping</Link></div>;

  return <div className="orders-page">
    <div className="orders-page-heading">
      <div><p className="eyebrow">Your account</p><h1>My orders</h1><p>Review your purchases and follow every delivery.</p></div>
      <span className="orders-count">{orders.length} {orders.length === 1 ? "order" : "orders"}</span>
    </div>
    {!orders.length ? <div className="orders-empty"><Package size={32} /><h2>No orders yet</h2><p>Your completed purchases will appear here.</p><Link to="/" className="primary-button">Start Shopping</Link></div> :
      <div className="orders-list">{orders.map((order) => {
        const status = order.delivery?.status || order.orderStatus || "PENDING";
        const products = order.productDetails || order.products || [];
        return <article className="order-card" key={order.orderId}>
          <div className="order-card-header"><div><p className="order-number">Order #{order.orderId}</p><span className="order-date"><CalendarDays size={13} /> {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></div><span className={`order-status status-${status.toLowerCase()}`}><span />{statusLabels[status] || status}</span></div>
          <div className="order-card-body"><div className="order-products">{products.map((item) => <div className="order-product" key={item.productId}><div className="order-product-image">{item.product?.image ? <img src={item.product.image} alt={item.product.productName} /> : <Package size={20} />}</div><div><strong>{item.product?.productName || `Product ${item.productId}`}</strong><small>Quantity: {item.quantity}</small></div></div>)}</div><div className="order-total"><small>Total amount</small><strong>₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}</strong><small>{order.paymentMethod || "COD"}</small></div></div>
          <div className="order-card-footer"><div>{order.delivery?.estimatedDelivery && status !== "DELIVERED" && <span className="delivery-estimate"><Truck size={14} /> Estimated {new Date(order.delivery.estimatedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}{order.delivery?.trackingNumber && <small>Tracking: {order.delivery.trackingNumber}</small>}</div><Link to={`/order-status/${order.orderId}`} className="order-track-link">View details <ChevronRight size={15} /></Link></div>
        </article>;
      })}</div>}
  </div>;
}
