import React from "react";
import { Search, Heart, Package, Bell, LogOut, Menu, Shield, X, UserRound, Coins } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export function Header() {
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

        <Link to="/" className="brand">Bcom<span>kart</span></Link>

        <div className="search-box">
          <Search size={18} />
          <input placeholder="Search for products..." onKeyDown={handleSearch} />
        </div>

        <nav className={`header-nav ${mobileOpen ? "is-open" : ""}`}>
          {user?.role === "ADMIN" && <Link to="/admin" onClick={() => setMobileOpen(false)}><Shield size={16} /> Admin panel</Link>}
          {user && <button className="mobile-signout" onClick={() => { signOut(); setMobileOpen(false); }}><LogOut size={16} /> Sign out</button>}
        </nav>

        <div className="header-actions">
          <Link to={user ? "/wishlist" : "/login"} className="action-button hide-mobile" aria-label="Wishlist"><Heart size={19} /><span>Wishlist</span></Link>
          <Link to={user ? "/coins" : "/login"} className="action-button" aria-label="Coins"><Coins size={19} /><span className="hide-mobile">Coins</span></Link>
          {user && <Link to="/orders" className="action-button hide-mobile" aria-label="My Orders"><Package size={19} /><span>My Orders</span></Link>}
          {user?.role === "ADMIN" && <Link to="/admin" className="action-button hide-mobile" aria-label="Admin panel"><Shield size={19} /><span>Admin</span></Link>}
          <Link to={user ? "/notifications" : "/login"} className="action-button" aria-label="Notifications"><Bell size={20} /><span className="hide-mobile">Notifications</span></Link>
          {user && <button className="action-button hide-mobile" onClick={signOut} aria-label="Sign out"><LogOut size={19} /><span>Sign out</span></button>}
          <Link to="/profile" className="profile-button" aria-label="Open profile"><UserRound size={18} /></Link>
        </div>
      </div>
    </header>
  );
}
