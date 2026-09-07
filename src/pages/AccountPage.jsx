import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Coins, Mail, Package, ShieldCheck, UserRound, LogIn } from "lucide-react";
import { apiRequest, useAuth } from "../context/AuthContext";
import { LoadingScreen } from "../components/common/LoadingScreen";

export function AccountPage() {
  const { user } = useAuth();
  const [account, setAccount] = useState(user);
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    apiRequest("/users/me").then(setAccount).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  }, [user]);

  if (!user) return <div className="account-page">
    <div className="page-heading"><p className="eyebrow"><UserRound size={14} /> Profile</p><h1>Your profile</h1><p>Sign in to view your account details, orders, and shopping activity.</p></div>
    <section className="account-card profile-signin-card"><div className="account-avatar"><UserRound size={25} /></div><h2>Welcome to Bcomkart</h2><Link to="/login" className="primary-button"><LogIn size={16} /> Sign in to your profile</Link></section>
  </div>;
  if (loading) return <LoadingScreen label="Loading your profile" />;

  return <div className="account-page">
    <div className="page-heading"><p className="eyebrow"><UserRound size={14} /> Profile</p><h1>Account details</h1><p>Keep your profile and shopping activity close at hand.</p></div>
    {error && <p className="admin-message">{error}</p>}
    <div className="account-layout">
      <section className="account-card account-profile-card"><div className="account-avatar"><UserRound size={25} /></div><p className="eyebrow">Profile</p><h2>{account?.name}</h2><div className="account-detail"><Mail size={16} /><span>{account?.email}</span></div><div className="account-detail"><ShieldCheck size={16} /><span>{account?.role === "ADMIN" ? "Administrator" : "Customer"}</span></div><small>Member since {account?.createdAt ? new Date(account.createdAt).toLocaleDateString() : "-"}</small></section>
      <section className="account-card"><p className="eyebrow">Shopping activity</p><div className="account-stat"><Package size={19} /><div><strong>{account?.carts?.length || 0}</strong><span>items saved in cart</span></div></div><div className="account-links"><a href="/orders">View my orders</a><a href="/cart">Open cart</a></div></section>
      <section className="account-card coins-card"><div className="coins-heading"><span className="coins-icon"><Coins size={21} /></span><div><p className="eyebrow">Rewards wallet</p><h2>BcomCoins</h2></div></div><strong className="coins-balance">{account?.bcomCoins || 0}</strong><p className="coins-note">Use 1 BcomCoin for ₹1 off your next purchase.</p></section>
    </div>
  </div>;
}
