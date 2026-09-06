import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth, apiRequest } from "./AuthContext";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Fetch wishlist from DB when user logs in
  useEffect(() => {
    if (!user) {
      setWishlist([]);
      return;
    }

    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const result = await apiRequest("/users/wishlist");
        setWishlist(result?.wishlist || []);
      } catch (error) {
        console.error("Failed to fetch wishlist from server:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const addToWishlist = async (productId) => {
    if (!user) {
      console.error("User must be logged in to add to wishlist");
      return;
    }

    if (wishlist.includes(productId)) {
      return; // Already in wishlist
    }

    try {
      const result = await apiRequest(`/users/wishlist/${productId}`, {
        method: "POST"
      });
      setWishlist(result?.wishlist || []);
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user) {
      console.error("User must be logged in to remove from wishlist");
      return;
    }

    try {
      const result = await apiRequest(`/users/wishlist/${productId}`, {
        method: "DELETE"
      });
      setWishlist(result?.wishlist || []);
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
    }
  };

  const toggleWishlist = async (productId) => {
    if (!user) {
      console.error("User must be logged in");
      return;
    }

    if (wishlist.includes(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  const value = useMemo(
    () => ({
      wishlist,
      loading,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
    }),
    [wishlist, loading]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }

  return context;
}
