import React from "react";
import { Home, LayoutGrid, Heart, ShoppingCart, UserRound, LogOut, Coins } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

export function MobileBottomNav() {
  const { itemCount } = useCart();
  const { user, signOut } = useAuth();
  return (
    <nav className="mobile-bottom-nav">
      <NavLink to="/"><Home size={19}/><span>Home</span></NavLink>
      <Link to={user ? "/wishlist" : "/login"}><Heart size={19}/><span>Wishlist</span></Link>
      <NavLink to={user ? "/coins" : "/login"}><Coins size={19}/><span>Coins</span></NavLink>
      <NavLink to="/cart"><span className="bottom-cart"><ShoppingCart size={19}/><b>{itemCount}</b></span><span>Cart</span></NavLink>
      {user ? (
        <button onClick={signOut} aria-label="Sign out"><LogOut size={19}/><span>Sign out</span></button>
      ) : (
        <NavLink to="/login"><UserRound size={19}/><span>Account</span></NavLink>
      )}
    </nav>
  );
}
