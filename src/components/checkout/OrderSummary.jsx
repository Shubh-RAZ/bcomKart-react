import React from "react";
export function OrderSummary({ items, subtotal, discount, delivery, total }) {
  return (
    <div className="order-summary">
      <h3>Order Summary</h3>
      <div className="summary-products">
        {items.map(({ product, quantity }) => (
          <div className="summary-product" key={product.id}>
            <img src={product.image} alt={product.name}/>
            <div><strong>{product.name}</strong><span>Qty: {quantity}</span></div>
            <b>₹{(product.price * quantity).toLocaleString("en-IN")}</b>
          </div>
        ))}
      </div>
      <div className="summary-lines">
        <div><span>Price ({items.reduce((s, i) => s + i.quantity, 0)} items)</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
        <div className="discount-line"><span>Discount</span><span>-₹{discount.toLocaleString("en-IN")}</span></div>
        <div><span>Delivery Charges</span><span>{delivery === 0 ? "FREE" : `₹${delivery}`}</span></div>
      </div>
      <div className="summary-total"><span>Total Amount</span><strong>₹{total.toLocaleString("en-IN")}</strong></div>
      <small className="tax-note">Inclusive of all applicable taxes</small>
    </div>
  );
}
