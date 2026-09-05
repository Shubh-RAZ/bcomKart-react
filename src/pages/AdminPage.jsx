import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiRequest, useAuth } from "../context/AuthContext";

const emptyProduct = { productName: "", productDescription: "", price: "", discount: 0, image: null };
const emptyCoupon = { discountPrice: "", expiryDate: "" };

export function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [product, setProduct] = useState(emptyProduct);
  const [coupon, setCoupon] = useState(emptyCoupon);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [message, setMessage] = useState("");

  const loadData = async () => {
    const [userData, productData, couponData] = await Promise.all([apiRequest("/users"), apiRequest("/products"), apiRequest("/coupons")]);
    setUsers(userData); setProducts(productData); setCoupons(couponData);
  };
  useEffect(() => { if (user?.role === "ADMIN") loadData().catch((error) => setMessage(error.message)); }, [user]);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/" replace />;

  const saveProduct = async (event) => {
    event.preventDefault();
    const path = editingProductId ? `/products/${editingProductId}` : "/products";
    const formData = new FormData();
    formData.append("productName", product.productName);
    formData.append("productDescription", product.productDescription);
    formData.append("price", String(Number(product.price)));
    formData.append("discount", String(Number(product.discount)));
    if (product.image instanceof File) formData.append("image", product.image);
    await apiRequest(path, { method: editingProductId ? "PATCH" : "POST", body: formData });
    setProduct(emptyProduct); setEditingProductId(null); setMessage("Product saved."); await loadData();
  };
  const saveCoupon = async (event) => {
    event.preventDefault();
    const path = editingCouponId ? `/coupons/${editingCouponId}` : "/coupons";
    await apiRequest(path, { method: editingCouponId ? "PATCH" : "POST", body: JSON.stringify({ ...coupon, discountPrice: Number(coupon.discountPrice) }) });
    setCoupon(emptyCoupon); setEditingCouponId(null); setMessage("Coupon saved."); await loadData();
  };
  const remove = async (path) => { await apiRequest(path, { method: "DELETE" }); await loadData(); setMessage("Deleted."); };

  return <div className="admin-page">
    <div className="admin-heading"><div><p className="eyebrow">Operations</p><h1>Admin control room</h1><p>Manage the catalog, customers, and promotions.</p></div><span className="admin-badge">ADMIN</span></div>
    {message && <p className="admin-message">{message}</p>}
    <section className="admin-section"><div className="section-header"><div><h2>Users</h2><p>Assign access roles to registered customers.</p></div></div><div className="admin-table">{users.map((item) => <div className="admin-row" key={item.userId}><div><strong>{item.name}</strong><small>{item.email}</small></div><select value={item.role} onChange={async (event) => { await apiRequest(`/users/${item.userId}/role`, { method: "PATCH", body: JSON.stringify({ role: event.target.value }) }); await loadData(); }}><option>USER</option><option>ADMIN</option></select></div>)}</div></section>
    <section className="admin-section"><div className="section-header"><div><h2>Products</h2><p>Add new stock or refine an existing listing.</p></div></div><form className="admin-form" onSubmit={saveProduct}>{["productName", "productDescription", "price", "discount"].map((field) => <input key={field} required={field !== "discount"} type={field === "price" || field === "discount" ? "number" : "text"} min={field === "discount" ? 0 : undefined} max={field === "discount" ? 100 : undefined} step={field === "discount" ? 1 : undefined} placeholder={field === "discount" ? "discount (%)" : field} value={product[field]} onChange={(event) => setProduct({ ...product, [field]: event.target.value })} />)}<input required={!editingProductId} type="file" accept="image/*" onChange={(event) => setProduct({ ...product, image: event.target.files[0] || null })} /><button className="primary-button" type="submit">{editingProductId ? "Update product" : "Add product"}</button></form><div className="admin-table">{products.map((item) => <div className="admin-row" key={item.productId}><div><strong>{item.productName}</strong><small>₹{item.price} · {item.discount}% off</small></div><div className="admin-row-actions"><button onClick={() => { setProduct({ ...item, image: null }); setEditingProductId(item.productId); }}>Edit</button><button onClick={() => remove(`/products/${item.productId}`)}>Delete</button></div></div>)}</div></section>
    <section className="admin-section"><div className="section-header"><div><h2>Coupons</h2><p>Keep promotional codes current and accurate.</p></div></div><form className="admin-form" onSubmit={saveCoupon}><input required type="number" placeholder="discountPrice" value={coupon.discountPrice} onChange={(event) => setCoupon({ ...coupon, discountPrice: event.target.value })} /><input required type="date" value={coupon.expiryDate} onChange={(event) => setCoupon({ ...coupon, expiryDate: event.target.value })} /><button className="primary-button" type="submit">{editingCouponId ? "Update coupon" : "Add coupon"}</button></form><div className="admin-table">{coupons.map((item) => <div className="admin-row" key={item.couponId}><div><strong>{item.couponId}</strong><small>₹{item.discountPrice} · expires {new Date(item.expiryDate).toLocaleDateString()}</small></div><div className="admin-row-actions"><button onClick={() => { setCoupon({ discountPrice: item.discountPrice, expiryDate: item.expiryDate.slice(0, 10) }); setEditingCouponId(item.couponId); }}>Edit</button><button onClick={() => remove(`/coupons/${item.couponId}`)}>Delete</button></div></div>)}</div></section>
  </div>;
}
