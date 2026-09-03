import React from "react";
import { Routes, Route } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { MobileBottomNav } from "./components/layout/MobileBottomNav";
import { CartDrawer } from "./components/cart/CartDrawer";
import { HomePage } from "./pages/HomePage";
import { ProductPage } from "./pages/ProductPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="page-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:productId" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <MobileBottomNav />
      <CartDrawer />
    </div>
  );
}
