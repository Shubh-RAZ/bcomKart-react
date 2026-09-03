import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { ProductCard } from "./ProductCard";

export function ProductCarousel({ products }) {
  const ref = useRef(null);

  const scroll = (direction) => {
    ref.current?.scrollBy({ left: direction * 300, behavior: "smooth" });
  };

  return (
    <div className="carousel-shell">
      <button className="carousel-control left" onClick={() => scroll(-1)} aria-label="Previous products"><ChevronLeft /></button>
      <div className="product-carousel" ref={ref}>
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
      <button className="carousel-control right" onClick={() => scroll(1)} aria-label="Next products"><ChevronRight /></button>
    </div>
  );
}
