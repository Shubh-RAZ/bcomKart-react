import React, { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "./AuthContext";
import { products as dummyProducts } from "../data/products";

const ProductsContext = createContext(null);
const useDummyProducts = import.meta.env.VITE_USE_DUMMY_PRODUCTS !== "false";

function normalizeProduct(product) {
  const discount = Number(product.discount || 0);
  const price = Number(product.price || 0);

  return {
    id: product.productId || product.id,
    name: product.productName || product.name,
    description: product.productDescription || product.description || "",
    category: product.category || "Other",
    price,
    originalPrice: Number(product.originalPrice || (discount > 0 && discount < 100 ? price / (1 - discount / 100) : price)),
    rating: Number(product.rating || 0),
    reviews: Number(product.reviews || 0),
    discount,
    image: product.image,
    images: product.images?.length ? product.images : [product.image],
    highlights: product.highlights || [],
    colors: product.colors || []
  };
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(useDummyProducts ? dummyProducts : []);
  const [isLoading, setIsLoading] = useState(!useDummyProducts);
  const [error, setError] = useState("");

  useEffect(() => {
    if (useDummyProducts) return;

    apiRequest("/products")
      .then((items) => setProducts(items.map(normalizeProduct)))
      .catch((requestError) => setError(requestError.message || "Unable to load products."))
      .finally(() => setIsLoading(false));
  }, []);

  return <ProductsContext.Provider value={{ products, isLoading, error, useDummyProducts }}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) throw new Error("useProducts must be used inside ProductsProvider");
  return context;
}