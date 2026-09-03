import React, { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addToCart = (product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find(
        (item) => item.product.id === product.id
      );

      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...current, { product, quantity }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setItems((current) =>
        current.filter((item) => item.product.id !== productId)
      );
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId) =>
    setItems((current) =>
      current.filter((item) => item.product.id !== productId)
    );

  const clearCart = () => setItems([]);

  const itemCount = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const delivery =
    subtotal === 0 || subtotal >= 2499 ? 0 : 49;

  const value = useMemo(
    () => ({
      items,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      itemCount,
      subtotal,
      delivery,
    }),
    [items, itemCount, subtotal, delivery]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}