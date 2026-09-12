import React, { useEffect, useState } from "react";
import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { MobileBottomNav } from "./components/layout/MobileBottomNav";
import { CartDrawer } from "./components/cart/CartDrawer";
import { HomePage } from "./pages/HomePage";
import { ProductPage } from "./pages/ProductPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrdersPage } from "./pages/OrdersPage";
import { OrderStatusPage } from "./pages/OrderStatusPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { LoginPage } from "./pages/LoginPage";
import { AdminPage } from "./pages/AdminPage";
import { AccountPage } from "./pages/AccountPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { WishlistPage } from "./pages/WishlistPage";
import { CoinsPage } from "./pages/CoinsPage";
import { LoadingScreen } from "./components/common/LoadingScreen";
import { useProducts } from "./context/ProductsContext";
import { apiRequest } from "./context/AuthContext";
import { UnderConstructionPage } from "./pages/UnderConstructionPage";
import { KillSwitchPage } from "./pages/KillSwitchPage";

const killSwitchPath = import.meta.env.VITE_KILL_SWITCH_PATH || "/ops-console-7f3a9c51";

export default function App() {
  const location = useLocation();
  const { isLoading } = useProducts();
  const [killSwitchActive, setKillSwitchActive] = useState(import.meta.env.VITE_KILL_SWITCH === "true");
  const [maintenanceLoading, setMaintenanceLoading] = useState(true);

  useEffect(() => {
    const checkMaintenance = () => apiRequest("/maintenance")
      .then(({ active }) => setKillSwitchActive(active))
      .catch(() => {})
      .finally(() => setMaintenanceLoading(false));

    checkMaintenance();
    const interval = window.setInterval(checkMaintenance, 15000);
    return () => window.clearInterval(interval);
  }, []);

  if (maintenanceLoading) {
    return <LoadingScreen label="Loading Bcomkart" />;
  }

  if (killSwitchActive && location.pathname !== killSwitchPath) {
    return <UnderConstructionPage />;
  }

  return (
    <div className="app-shell">
      <Header />
      <main className="page-container">
        {isLoading ? <LoadingScreen label="Loading Bcomkart" /> : <div key={`${location.pathname}${location.search}`} className="page-transition">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:productId" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/order-status/:orderId" element={<OrderStatusPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/profile" element={<AccountPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/coins" element={<CoinsPage />} />
            <Route path="/under-construction" element={<Navigate to="/" replace />} />
            <Route path={killSwitchPath} element={<KillSwitchPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>}
      </main>
      <MobileBottomNav />
      <CartDrawer />
    </div>
  );
}
