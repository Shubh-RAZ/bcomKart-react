import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth, apiRequest } from "./AuthContext";
import { useProducts } from "./ProductsContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydratedUserId, setHydratedUserId] = useState(null);
  const { user } = useAuth();
  const { products, isLoading: productsLoading } = useProducts();

  // Rebuild the local cart from the product IDs stored for this user.
  useEffect(() => {
    if (!user) {
      setItems([]);
      setHydratedUserId(null);
      return;
    }
    if (productsLoading) return;

    let cancelled = false;
    setItems([]);
    setHydratedUserId(null);

    const fetchCart = async () => {
      try {
        const result = await apiRequest("/users/profile/cart-wishlist");
        if (cancelled) return;
        const savedIds = Array.isArray(result?.cart) ? result.cart : [];
        const productById = new Map(products.map((product) => [product.id || product.productId, product]));
        const savedQuantities = savedIds.reduce((quantities, productId) => {
          quantities.set(productId, (quantities.get(productId) || 0) + 1);
          return quantities;
        }, new Map());
        const restoredItems = [...savedQuantities.entries()]
          .map(([productId, quantity]) => ({ product: productById.get(productId), quantity }))
          .filter((item) => item.product);
        setItems(restoredItems);
        setHydratedUserId(user.userId);
      } catch (error) {
        if (!cancelled) {
          setHydratedUserId(user.userId);
          console.error("Failed to fetch cart from server:", error);
        }
      }
    };

    fetchCart();
    return () => {
      cancelled = true;
    };
  }, [user, products, productsLoading]);

  // Sync only after the server cart has been loaded, using the latest items.
  useEffect(() => {
    if (!user || hydratedUserId !== user.userId) return;
    const syncCart = async () => {
      try {
        const cartIds = items.flatMap((item) => Array.from(
          { length: item.quantity },
          () => item.product.productId || item.product.id
        ));
        await apiRequest("/cart", {
          method: "PATCH",
          body: JSON.stringify({ carts: cartIds })
        });
      } catch (error) {
        console.error("Failed to sync cart to server:", error);
      }
    };
    syncCart();
  }, [items, user, hydratedUserId]);

  const addToCart = (product, quantity = 1) => {
    setItems((current) => {
      const productId = product.productId || product.id;
      const existing = current.find((item) => (item.product.productId || item.product.id) === productId);

      if (existing) {
        return current.map((item) =>
          (item.product.productId || item.product.id) === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...current, { product, quantity }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    setItems((current) => {
      if (quantity <= 0) {
        return current.filter((item) => (item.product.productId || item.product.id) !== productId);
      }
      return current.map((item) =>
        (item.product.productId || item.product.id) === productId ? { ...item, quantity } : item
      );
    });
  };

  const removeFromCart = (productId) => {
    setItems((current) => current.filter((item) => (item.product.productId || item.product.id) !== productId));
  };

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