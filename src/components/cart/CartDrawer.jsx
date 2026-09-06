import React from "react";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { Link } from "react-router-dom";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const { items, itemCount, subtotal, updateQuantity, removeFromCart } = useCart();

  return (
    <>
      <button className="floating-cart" onClick={() => setOpen(true)} aria-label="Open cart">
        🛒 <b>{itemCount}</b>
      </button>
      {open && (
        <div className="drawer-overlay" onClick={() => setOpen(false)}>
          <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header"><div><h3>Your Cart</h3><span>{itemCount} items</span></div><button onClick={() => setOpen(false)}><X/></button></div>
            <div className="drawer-items">
              {items.length === 0 ? <div className="empty-state"><span>🛍️</span><h3>Your cart is empty</h3><p>Add something you love.</p></div> :
                items.map(({ product, quantity }) => {
                  const productId = product.productId || product.id;
                  return (
                    <div className="drawer-item" key={productId}>
                      <img src={product.image} alt={product.name}/>
                      <div className="drawer-item-info"><strong>{product.name}</strong><span>₹{product.price.toLocaleString("en-IN")}</span>
                        <div className="qty-control"><button onClick={() => updateQuantity(productId, quantity - 1)}><Minus size={13}/></button><b>{quantity}</b><button onClick={() => updateQuantity(productId, quantity + 1)}><Plus size={13}/></button></div>
                      </div>
                      <button className="remove-button" onClick={() => removeFromCart(productId)}><Trash2 size={16}/></button>
                    </div>
                  );
                })
              }
            </div>
            {items.length > 0 && <div className="drawer-footer"><div><span>Subtotal</span><strong>₹{subtotal.toLocaleString("en-IN")}</strong></div><Link to="/cart" className="primary-button full" onClick={() => setOpen(false)}>View Cart & Checkout</Link></div>}
          </aside>
        </div>
      )}
    </>
  );
}
