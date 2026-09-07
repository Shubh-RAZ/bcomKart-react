import React, { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { Bell, ChevronRight } from "lucide-react";
import { apiRequest, useAuth } from "../context/AuthContext";
import { LoadingScreen } from "../components/common/LoadingScreen";

export function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    apiRequest("/notifications").then(setNotifications).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;
  if (loading) return <LoadingScreen label="Loading notifications" />;

  return <div className="notifications-page">
    <div className="page-heading"><p className="eyebrow"><Bell size={14} /> Notification center</p><h1>Updates that matter</h1><p>Stay current on your orders and delivery progress.</p></div>
    {error && <p className="admin-message">{error}</p>}
    <section className="notification-list">{notifications.length ? notifications.map((notification) => <article className="notification-item" key={notification.id}><span className="notification-icon"><Bell size={17} /></span><div><strong>{notification.title}</strong><p>{notification.message}</p><small>{new Date(notification.createdAt).toLocaleString()}</small></div>{notification.orderId && <Link to={`/order-status/${notification.orderId}`} aria-label="Open order"><ChevronRight size={17} /></Link>}</article>) : <div className="empty-page"><Bell size={25} /><h2>No notifications yet</h2><p>Order updates will appear here.</p></div>}</section>
  </div>;
}
