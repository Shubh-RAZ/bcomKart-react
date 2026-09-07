import React, { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "./AuthContext";
import { products as dummyProducts } from "../data/products";

const ProductsContext = createContext(null);
const useDummyProducts = import.meta.env.VITE_USE_DUMMY_PRODUCTS !== "false";

function normalizeProduct(product) {
  const discount = Number(product.discount || 0);
  const price = Number(product.price || 0);
  const image = product.image?.replace(/^http:\/\//, "https://");
  const images = product.images?.length ? product.images : [image];

  return {
    id: product.productId || product.id,
    name: product.productName || product.name,
    description: product.productDescription || product.description || "",
    category: product.category || "Other",
    gender: product.gender || "All",
    price,
    originalPrice: Number(product.originalPrice || (discount > 0 && discount < 100 ? price / (1 - discount / 100) : price)),
    rating: Number(product.rating || 0),
    reviews: Number(product.reviews || 0),
    discount,
    image,
    images: images.map((item) => item?.replace(/^http:\/\//, "https://")),
    highlights: product.highlights || [],
    colors: product.colors || []
  };
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(useDummyProducts ? dummyProducts : []);
  const [requestedProducts, setRequestedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(!useDummyProducts);
  const [error, setError] = useState("");

  useEffect(() => {
    const productRequest = useDummyProducts ? Promise.resolve(dummyProducts) : apiRequest("/products");
    const categoryRequest = useDummyProducts
      ? Promise.resolve([])
      : apiRequest("/categories").catch(() => []);
    Promise.all([productRequest, apiRequest("/products/requests"), categoryRequest])
      .then(([items, requests, categoryItems]) => {
        if (!useDummyProducts) setProducts(items.map(normalizeProduct));
        setRequestedProducts(requests);
        setCategories(categoryItems.map((category) => category.name));
      })
      .catch((requestError) => setError(requestError.message || "Unable to load products."))
      .finally(() => setIsLoading(false));
  }, []);

  return <ProductsContext.Provider value={{ products, requestedProducts, categories, isLoading, error, useDummyProducts }}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) throw new Error("useProducts must be used inside ProductsProvider");
  return context;
}