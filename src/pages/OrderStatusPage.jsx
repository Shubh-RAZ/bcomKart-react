import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Package, CheckCircle2, Truck, Home } from "lucide-react";
import { apiRequest } from "../context/AuthContext";
import "./OrderStatusPage.css";
import { LoadingScreen } from "../components/common/LoadingScreen";

export function OrderStatusPage() {
  const { orderId } = useParams();
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrderStatus = async () => {
      try {
        setLoading(true);
        const result = await apiRequest(`/orders/${orderId}/status`);
        setOrderStatus(result);
        setError("");
      } catch (err) {
        console.error("Error fetching order status:", err);
        setError(err.message || "Failed to load order status");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderStatus();
    }
  }, [orderId]);

  if (loading) {
    return <LoadingScreen label="Loading order status" />;
  }

  if (error) {
    return (
      <div className="empty-page">
        <span>❌</span>
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/" className="primary-button">Back to Home</Link>
      </div>
    );
  }

  if (!orderStatus) {
    return (
      <div className="empty-page">
        <span>🔍</span>
        <h2>Order not found</h2>
        <p>We couldn't find an order with ID: {orderId}</p>
        <Link to="/" className="primary-button">Back to Home</Link>
      </div>
    );
  }

  const statusSteps = [
    { key: "PENDING", label: "Order Placed", icon: Package },
    { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle2 },
    { key: "SHIPPED", label: "Shipped", icon: Truck },
    { key: "DELIVERED", label: "Delivered", icon: Home }
  ];

  const currentStatusIndex = statusSteps.findIndex(s => s.key === orderStatus.status);
  const isDelivered = orderStatus.status === "DELIVERED";
  const isCancelled = orderStatus.status === "CANCELLED";

  return (
    <div className="order-status-page">
      <div className="order-status-container">
        <div className="order-header">
          <h1>Order Tracking</h1>
          <div className="order-id-badge">
            <span>Order ID:</span>
            <strong>{orderStatus.orderId}</strong>
          </div>
        </div>

        {isCancelled && (
          <div className="status-alert cancelled">
            <span>⚠️</span>
            <div>
              <strong>Order Cancelled</strong>
              <p>This order has been cancelled.</p>
            </div>
          </div>
        )}

        {isDelivered && (
          <div className="status-alert delivered">
            <span>✅</span>
            <div>
              <strong>Delivered!</strong>
              <p>Your order has been successfully delivered.</p>
            </div>
          </div>
        )}

        {!isCancelled && !isDelivered && (
          <div className="status-alert processing">
            <span>📦</span>
            <div>
              <strong>Order Status: {orderStatus.status}</strong>
              <p>
                {orderStatus.status === "PENDING" && "Your order is being prepared for shipment."}
                {orderStatus.status === "CONFIRMED" && "Your order has been confirmed and will be shipped soon."}
                {orderStatus.status === "SHIPPED" && `Your order is on the way! ${orderStatus.trackingNumber ? `Tracking: ${orderStatus.trackingNumber}` : ""}`}
              </p>
            </div>
          </div>
        )}

        <div className="status-timeline">
          {statusSteps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentStatusIndex;
            const isActive = index === currentStatusIndex;

            return (
              <div key={step.key} className={`timeline-step ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}>
                <div className="step-icon">
                  <Icon size={24} />
                </div>
                <div className="step-content">
                  <div className="step-label">{step.label}</div>
                  {isCompleted && orderStatus.statusUpdates && (
                    <div className="step-date">
                      {orderStatus.statusUpdates.find(u => u.status === step.key)?.timestamp && (
                        new Date(orderStatus.statusUpdates.find(u => u.status === step.key).timestamp).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      )}
                    </div>
                  )}
                </div>
                {index < statusSteps.length - 1 && (
                  <div className={`step-connector ${isCompleted ? "completed" : ""}`}></div>
                )}
              </div>
            );
          })}
        </div>

        {orderStatus.estimatedDelivery && !isDelivered && (
          <div className="estimated-delivery">
            <span>📅</span>
            <div>
              <strong>Estimated Delivery</strong>
              <p>{new Date(orderStatus.estimatedDelivery).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
            </div>
          </div>
        )}

        <div className="status-updates">
          <h3>Order Updates</h3>
          <div className="updates-list">
            {orderStatus.statusUpdates && orderStatus.statusUpdates.map((update, index) => (
              <div key={index} className="update-item">
                <div className="update-status">{update.status}</div>
                <div className="update-details">
                  <p className="update-message">{update.message}</p>
                  <p className="update-time">
                    {new Date(update.timestamp).toLocaleDateString('en-IN')} • {new Date(update.timestamp).toLocaleTimeString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="actions">
          <Link to="/" className="primary-button">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
