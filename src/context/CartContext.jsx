import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth, apiRequest } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const { user } = useAuth();

  // Fetch cart from DB when user logs in
  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    const fetchCart = async () => {
      try {
        const result = await apiRequest("/users/profile/cart-wishlist");
        if (result?.cart && Array.isArray(result.cart) && result.cart.length > 0) {
          // For now, just store the product IDs - actual implementation would fetch full product details
          // This maintains backward compatibility with local storage
        }
      } catch (error) {
        console.error("Failed to fetch cart from server:", error);
      }
    };

    fetchCart();
  }, [user]);

  const addToCart = (product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find(
        (item) => item.product.productId === product.productId || item.product.id === product.id
      );

      if (existing) {
        return current.map((item) =>
          (item.product.productId === product.productId || item.product.id === product.id)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...current, { product, quantity }];
    });

    // Sync to server if user is logged in
    if (user) {
      syncCartToServer(items);
    }
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setItems((current) =>
        current.filter((item) => (item.product.productId || item.product.id) !== productId)
      );
      return;
    }

    setItems((current) =>
      current.map((item) =>
        (item.product.productId || item.product.id) === productId
          ? { ...item, quantity }
          : item
      )
    );

    if (user) {
      syncCartToServer(items);
    }
  };

  const removeFromCart = (productId) => {
    setItems((current) =>
      current.filter((item) => (item.product.productId || item.product.id) !== productId)
    );

    if (user) {
      syncCartToServer(items);
    }
  };

  const clearCart = () => setItems([]);

  const syncCartToServer = async (currentItems) => {
    if (!user) return;
    try {
      const cartIds = currentItems.map(item => item.product.productId || item.product.id);
      await apiRequest("/cart", {
        method: "PATCH",
        body: JSON.stringify({ carts: cartIds })
      });
    } catch (error) {
      console.error("Failed to sync cart to server:", error);
    }
  };

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