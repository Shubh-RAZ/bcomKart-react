import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroBanner() {
  return (
    <section className="hero-banner">
      <div className="hero-copy">
        <span className="eyebrow"><Sparkles size={14}/> Curated for you</span>
        <h1>Hello Shubham Raj! <span>👋</span></h1>
        <p>Discover amazing products, fresh deals and everyday essentials at prices you'll love.</p>
        <Link to="/?category=All" className="primary-button">Shop Now <ArrowRight size={17}/></Link>
      </div>
      <div className="hero-art">
        <div className="floating-shape shape-one"></div>
        <div className="floating-shape shape-two"></div>
        <div className="hero-circle"></div>
        <img src="https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=1000&q=85" alt="Shopping collection" />
      </div>
    </section>
  );
}
