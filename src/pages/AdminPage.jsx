import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Check, ChevronRight, Package, Percent, Search, Shield, Ticket, Truck, Users } from "lucide-react";
import { apiRequest, useAuth } from "../context/AuthContext";

const emptyProduct = { productName: "", productDescription: "", price: "", discount: 0, image: null };
const emptyCoupon = { code: "", discountPrice: "", expiryDate: "", audience: "ALL", eligibleUserIds: [] };
const tabs = [
  { key: "users", label: "Users", icon: Users },
  { key: "products", label: "Products", icon: Package },
  { key: "coupons", label: "Coupons", icon: Ticket },
  { key: "orders", label: "Orders", icon: Truck }
];

export function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [product, setProduct] = useState(emptyProduct);
  const [coupon, setCoupon] = useState(emptyCoupon);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    const [userData, productData, couponData, orderData] = await Promise.all([
      apiRequest("/users"), apiRequest("/products"), apiRequest("/coupons"), apiRequest("/admin/orders")
    ]);
    setUsers(userData); setProducts(productData); setCoupons(couponData); setOrders(orderData);
    setSelectedUser((current) => current ? userData.find((item) => item.userId === current.userId) || null : userData[0] || null);
    setSelectedProduct((current) => current ? productData.find((item) => item.productId === current.productId) || null : productData[0] || null);
    setSelectedCoupon((current) => current ? couponData.find((item) => item.couponId === current.couponId) || null : couponData[0] || null);
    setSelectedOrder((current) => current ? orderData.find((item) => item.orderId === current.orderId) || null : orderData[0] || null);
  };

  useEffect(() => {
    if (user?.role === "ADMIN") loadData().catch((error) => setMessage(error.message));
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/" replace />;

  const visibleItems = (activeTab === "users" ? users : activeTab === "products" ? products : activeTab === "coupons" ? coupons : orders).filter((item) => {
    const text = activeTab === "users" ? `${item.name} ${item.email}` : activeTab === "products" ? `${item.productName} ${item.productDescription}` : activeTab === "coupons" ? `${item.code || item.couponId} ${item.audience}` : `${item.orderId} ${item.customer?.name} ${item.customer?.email} ${item.delivery?.status}`;
    return text.toLowerCase().includes(search.toLowerCase());
  });

  const saveProduct = async (event) => {
    event.preventDefault(); setLoading(true);
    try {
      const path = editingProductId ? `/products/${editingProductId}` : "/products";
      const formData = new FormData();
      formData.append("productName", product.productName); formData.append("productDescription", product.productDescription);
      formData.append("price", String(Number(product.price))); formData.append("discount", String(Number(product.discount)));
      if (product.image instanceof File) formData.append("image", product.image);
      await apiRequest(path, { method: editingProductId ? "PATCH" : "POST", body: formData });
      setProduct(emptyProduct); setEditingProductId(null); setMessage("Product saved."); await loadData();
    } catch (error) { setMessage(error.message); } finally { setLoading(false); }
  };

  const saveCoupon = async (event) => {
    event.preventDefault(); setLoading(true);
    try {
      const path = editingCouponId ? `/coupons/${editingCouponId}` : "/coupons";
      await apiRequest(path, { method: editingCouponId ? "PATCH" : "POST", body: JSON.stringify({ ...coupon, discountPrice: Number(coupon.discountPrice) }) });
      setCoupon(emptyCoupon); setEditingCouponId(null); setMessage("Coupon saved."); await loadData();
    } catch (error) { setMessage(error.message); } finally { setLoading(false); }
  };

  const remove = async (path) => {
    try { await apiRequest(path, { method: "DELETE" }); await loadData(); setMessage("Deleted."); }
    catch (error) { setMessage(error.message); }
  };

  const updateRole = async (item, role) => {
    await apiRequest(`/users/${item.userId}/role`, { method: "PATCH", body: JSON.stringify({ role }) });
    await loadData(); setMessage("User role updated.");
  };

  const updateOrder = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(event.currentTarget);
      await apiRequest(`/orders/${selectedOrder.orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: form.get("status"),
          trackingNumber: form.get("trackingNumber"),
          estimatedDelivery: form.get("estimatedDelivery"),
          message: form.get("message")
        })
      });
      setMessage("Order delivery details updated.");
      await loadData();
    } catch (error) { setMessage(error.message); } finally { setLoading(false); }
  };

  const renderUserDetails = () => selectedUser ? <div className="admin-detail-card">
    <div className="detail-avatar">{selectedUser.name?.slice(0, 2).toUpperCase()}</div><p className="eyebrow">User profile</p><h2>{selectedUser.name}</h2><p className="detail-email">{selectedUser.email}</p>
    <div className="detail-stats"><span><strong>{selectedUser.carts?.length || 0}</strong> cart items</span><span><strong>{selectedUser.wishlist?.length || 0}</strong> wishlist items</span></div>
    <label className="detail-field"><span>Access role</span><select value={selectedUser.role} onChange={(event) => updateRole(selectedUser, event.target.value)}><option>USER</option><option>ADMIN</option></select></label>
    <small>Joined {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "-"}</small>
  </div> : <div className="admin-detail-empty">Select a user to see their details.</div>;

  const renderProductDetails = () => selectedProduct ? <div className="admin-detail-card">
    <img className="detail-product-image" src={selectedProduct.image} alt={selectedProduct.productName} /><p className="eyebrow">Catalog item</p><h2>{selectedProduct.productName}</h2><p className="detail-description">{selectedProduct.productDescription}</p>
    <div className="product-detail-price"><strong>₹{Number(selectedProduct.price).toLocaleString("en-IN")}</strong><span>{selectedProduct.discount || 0}% discount</span></div>
    <button className="secondary-button full" onClick={() => { setProduct({ ...selectedProduct, image: null }); setEditingProductId(selectedProduct.productId); }}>Edit product</button><button className="danger-button full" onClick={() => remove(`/products/${selectedProduct.productId}`)}>Delete product</button>
  </div> : <div className="admin-detail-empty">Select a product to see its details.</div>;

  const renderCouponDetails = () => selectedCoupon ? <div className="admin-detail-card">
    <div className="coupon-mark"><Percent size={22} /></div><p className="eyebrow">Promotion</p><h2>{selectedCoupon.code || selectedCoupon.couponId}</h2>
    <div className="product-detail-price"><strong>₹{selectedCoupon.discountPrice}</strong><span>{selectedCoupon.audience === "ALL" ? "All users" : `${selectedCoupon.eligibleUserIds?.length || 0} selected users`}</span></div><p className="detail-email">Expires {new Date(selectedCoupon.expiryDate).toLocaleDateString()}</p>
    <button className="secondary-button full" onClick={() => { setCoupon({ code: selectedCoupon.code || "", discountPrice: selectedCoupon.discountPrice, expiryDate: selectedCoupon.expiryDate.slice(0, 10), audience: selectedCoupon.audience || "ALL", eligibleUserIds: selectedCoupon.eligibleUserIds || [] }); setEditingCouponId(selectedCoupon.couponId); }}>Edit coupon</button><button className="danger-button full" onClick={() => remove(`/coupons/${selectedCoupon.couponId}`)}>Delete coupon</button>
  </div> : <div className="admin-detail-empty">Select a coupon to see its audience and expiry.</div>;

  const renderOrderDetails = () => selectedOrder ? <div className="admin-detail-card">
    <p className="eyebrow">Order delivery</p><h2>#{selectedOrder.orderId.slice(0, 8)}</h2>
    <p className="detail-email"><strong>{selectedOrder.customer?.name}</strong> · {selectedOrder.customer?.email || "Customer email unavailable"}</p>
    <div className="order-detail-summary"><span><strong>₹{Number(selectedOrder.totalAmount || 0).toLocaleString("en-IN")}</strong>Total value</span><span><strong>{selectedOrder.products?.reduce((sum, item) => sum + item.quantity, 0) || 0}</strong>Items</span></div>
    <form key={selectedOrder.orderId} className="order-update-form" onSubmit={updateOrder}>
      <label className="detail-field"><span>Order status</span><select name="status" defaultValue={selectedOrder.delivery?.status || selectedOrder.orderStatus || "PENDING"}><option>PENDING</option><option>CONFIRMED</option><option>SHIPPED</option><option>DELIVERED</option><option>CANCELLED</option></select></label>
      <label className="detail-field"><span>Tracking number</span><input name="trackingNumber" defaultValue={selectedOrder.delivery?.trackingNumber || ""} placeholder="e.g. BCOM123456" /></label>
      <label className="detail-field"><span>Estimated delivery</span><input name="estimatedDelivery" type="date" defaultValue={selectedOrder.delivery?.estimatedDelivery ? new Date(selectedOrder.delivery.estimatedDelivery).toISOString().slice(0, 10) : ""} /></label>
      <label className="detail-field"><span>Update message</span><textarea name="message" placeholder="Message shown in the tracking timeline" defaultValue="" /></label>
      <button className="primary-button full" disabled={loading}>{loading ? "Updating..." : "Save delivery update"}</button>
    </form>
  </div> : <div className="admin-detail-empty">Select an order to update its delivery details.</div>;

  return <div className="admin-page">
    <div className="admin-heading"><div><p className="eyebrow">Operations / Admin</p><h1>Control room</h1><p>Manage customers, catalog, and targeted promotions from one workspace.</p></div><span className="admin-badge"><Shield size={13} /> ADMIN</span></div>
    {message && <p className="admin-message">{message}</p>}
    <div className="admin-tabs" role="tablist">{tabs.map(({ key, label, icon: Icon }) => <button key={key} className={activeTab === key ? "active" : ""} onClick={() => { setActiveTab(key); setSearch(""); }}><Icon size={17} />{label}<span>{key === "users" ? users.length : key === "products" ? products.length : key === "coupons" ? coupons.length : orders.length}</span></button>)}</div>
    <div className="admin-toolbar"><div><p className="eyebrow">{activeTab}</p><h2>{activeTab === "users" ? "Customer directory" : activeTab === "products" ? "Product catalog" : activeTab === "coupons" ? "Promotion studio" : "Order fulfillment"}</h2></div><label className="admin-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${activeTab}...`} /></label></div>
    <div className="admin-workspace"><div className="admin-list-panel"><div className="list-panel-heading"><span>{visibleItems.length} records</span>{activeTab === "products" && <button onClick={() => { setProduct(emptyProduct); setEditingProductId(""); }}>+ New product</button>}{activeTab === "coupons" && <button onClick={() => { setCoupon(emptyCoupon); setEditingCouponId(""); }}>+ New coupon</button>}</div>
      {visibleItems.map((item) => <button className="admin-list-item" key={item.userId || item.productId || item.couponId || item.orderId} onClick={() => activeTab === "users" ? setSelectedUser(item) : activeTab === "products" ? setSelectedProduct(item) : activeTab === "coupons" ? setSelectedCoupon(item) : setSelectedOrder(item)}><span className="list-item-icon">{activeTab === "users" ? <Users size={16} /> : activeTab === "products" ? <Package size={16} /> : activeTab === "coupons" ? <Ticket size={16} /> : <Truck size={16} />}</span><span><strong>{activeTab === "users" ? item.name : activeTab === "products" ? item.productName : activeTab === "coupons" ? item.code || item.couponId : `#${item.orderId.slice(0, 8)}`}</strong><small>{activeTab === "users" ? item.email : activeTab === "products" ? `₹${item.price} · ${item.discount || 0}% off` : activeTab === "coupons" ? `${item.audience === "ALL" ? "All users" : `${item.eligibleUserIds?.length || 0} users`} · expires ${new Date(item.expiryDate).toLocaleDateString()}` : `${item.customer?.name || "Customer"} · ${item.delivery?.status || item.orderStatus || "PENDING"} · ₹${item.totalAmount || 0}`}</small></span><ChevronRight size={16} /></button>)}
      {!visibleItems.length && <div className="admin-detail-empty">No matching records.</div>}</div><div className="admin-detail-panel">{activeTab === "users" ? renderUserDetails() : activeTab === "products" ? renderProductDetails() : activeTab === "coupons" ? renderCouponDetails() : renderOrderDetails()}</div></div>
    {activeTab === "products" && editingProductId !== null && <form className="admin-editor" onSubmit={saveProduct}><h3>{editingProductId ? "Edit product" : "New product"}</h3><div className="admin-form-grid"><input required placeholder="Product name" value={product.productName} onChange={(event) => setProduct({ ...product, productName: event.target.value })} /><textarea required placeholder="Description" value={product.productDescription} onChange={(event) => setProduct({ ...product, productDescription: event.target.value })} /><input required type="number" placeholder="Price" value={product.price} onChange={(event) => setProduct({ ...product, price: event.target.value })} /><input type="number" min="0" max="100" placeholder="Discount (%)" value={product.discount} onChange={(event) => setProduct({ ...product, discount: event.target.value })} /><input required={!editingProductId} type="file" accept="image/*" onChange={(event) => setProduct({ ...product, image: event.target.files[0] || null })} /></div><button className="primary-button" disabled={loading}>{loading ? "Saving..." : "Save product"}</button></form>}
    {activeTab === "coupons" && editingCouponId !== null && <form className="admin-editor" onSubmit={saveCoupon}><h3>{editingCouponId ? "Edit coupon" : "New coupon"}</h3><div className="admin-form-grid"><input required placeholder="Coupon code" value={coupon.code} onChange={(event) => setCoupon({ ...coupon, code: event.target.value.toUpperCase() })} /><input required type="number" min="0" placeholder="Discount amount (₹)" value={coupon.discountPrice} onChange={(event) => setCoupon({ ...coupon, discountPrice: event.target.value })} /><input required type="date" value={coupon.expiryDate} onChange={(event) => setCoupon({ ...coupon, expiryDate: event.target.value })} /><select value={coupon.audience} onChange={(event) => setCoupon({ ...coupon, audience: event.target.value, eligibleUserIds: event.target.value === "ALL" ? [] : coupon.eligibleUserIds })}><option value="ALL">All users</option><option value="SPECIFIC_USERS">One specific user</option><option value="MULTIPLE_USERS">Multiple users</option></select></div>{coupon.audience !== "ALL" && <div className="user-picker"><p>Select eligible users</p>{users.map((item) => <label key={item.userId}><input type="checkbox" checked={coupon.eligibleUserIds.includes(item.userId)} onChange={(event) => setCoupon({ ...coupon, eligibleUserIds: event.target.checked ? coupon.audience === "SPECIFIC_USERS" ? [item.userId] : [...coupon.eligibleUserIds, item.userId] : coupon.eligibleUserIds.filter((id) => id !== item.userId) })} /><span>{item.name} <small>{item.email}</small></span>{coupon.eligibleUserIds.includes(item.userId) && <Check size={15} />}</label>)}</div>}<button className="primary-button" disabled={loading}>{loading ? "Saving..." : "Save coupon"}</button></form>}
  </div>;
}
