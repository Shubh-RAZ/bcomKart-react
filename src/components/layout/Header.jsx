import React from "react";
import { Search, Heart, ShoppingCart, UserRound, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../../context/CartContext";

export function Header() {
  const { itemCount } = useCart();
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
          <Link to="/">Home</Link>
          <Link to="/?category=Electronics">Electronics</Link>
          <Link to="/?category=Fashion">Fashion</Link>
          <Link to="/?category=Home%20%26%20Kitchen">Home & Kitchen</Link>
          <Link to="/?category=Sports">Sports</Link>
        </nav>

        <div className="header-actions">
          <button className="action-button hide-mobile" aria-label="Wishlist"><Heart size={19} /><span>Wishlist</span></button>
          <Link to="/cart" className="action-button cart-action" aria-label="Cart">
            <span className="cart-icon"><ShoppingCart size={20} /><b>{itemCount}</b></span>
            <span className="hide-mobile">Cart</span>
          </Link>
          <button className="profile-button" aria-label="Profile">SR</button>
        </div>
      </div>
    </header>
  );
}
