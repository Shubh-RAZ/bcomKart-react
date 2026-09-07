import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProductCard } from "./ProductCard";

export function ProductCarousel({ products, autoplay = false, slideshow = false }) {
  const ref = useRef(null);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (!slideshow || products.length < 2) return undefined;
    const interval = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % products.length);
    }, 3200);
    return () => window.clearInterval(interval);
  }, [slideshow, products.length]);

  const scroll = (direction) => {
    if (slideshow) {
      setSlideIndex((current) => (current + direction + products.length) % products.length);
      return;
    }
    ref.current?.scrollBy({ left: direction * 300, behavior: "smooth" });
  };

  if (slideshow) {
    const product = products[slideIndex];
    return (
      <div className="product-slideshow">
        <button className="carousel-control left" onClick={() => scroll(-1)} aria-label="Previous deal"><ChevronLeft /></button>
        <div className="product-slideshow-stage" key={product?.id}>
          {product && <ProductCard product={product} />}
        </div>
        <button className="carousel-control right" onClick={() => scroll(1)} aria-label="Next deal"><ChevronRight /></button>
        <div className="slideshow-dots" aria-label="Trending deal slides">
          {products.map((item, index) => <button key={item.id} className={index === slideIndex ? "active" : ""} onClick={() => setSlideIndex(index)} aria-label={`Show deal ${index + 1}`} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="carousel-shell is-product-grid">
      <button className="carousel-control left" onClick={() => scroll(-1)} aria-label="Previous products"><ChevronLeft /></button>
      <div className="product-carousel" ref={ref}>
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
      <button className="carousel-control right" onClick={() => scroll(1)} aria-label="Next products"><ChevronRight /></button>
    </div>
  );
}
