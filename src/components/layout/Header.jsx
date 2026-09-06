import React from "react";
import { Search, Heart, ShoppingCart, Package, LogOut, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

export function Header() {
  const { itemCount } = useCart();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (event) => {
    if (event.key === "Enter" && event.target.value.trim()) {
      navigate(`/?search=${encodeURIComponent(event.target.value.trim())}`);
    }
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <button className="icon-button mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
          {mobileOpen ? <X size={21} /> : <Menu size={21} />}
        </button>

        <Link to="/" className="brand">bcom<span>.kart</span></Link>

        <div className="search-box">
          <Search size={18} />
          <input placeholder="Search for products..." onKeyDown={handleSearch} />
        </div>

        <nav className={`header-nav ${mobileOpen ? "is-open" : ""}`}>
          {user && <Link to="/orders">My Orders</Link>}
        </nav>

        <div className="header-actions">
          <button className="action-button hide-mobile" aria-label="Wishlist"><Heart size={19} /><span>Wishlist</span></button>
          {user && <Link to="/orders" className="action-button hide-mobile" aria-label="Orders"><Package size={19} /><span>Orders</span></Link>}
          <Link to="/cart" className="action-button cart-action" aria-label="Cart">
            <span className="cart-icon"><ShoppingCart size={20} /><b>{itemCount}</b></span>
            <span className="hide-mobile">Cart</span>
          </Link>
          {user && <button className="action-button hide-mobile" onClick={signOut} aria-label="Sign out"><LogOut size={19} /><span>Sign out</span></button>}
          <Link to={user?.role === "ADMIN" ? "/admin" : "/login"} className="profile-button" aria-label={user ? "Open account" : "Sign in"}>{user ? user.name.slice(0, 2).toUpperCase() : "SR"}</Link>
        </div>
      </div>
    </header>
  );
}
