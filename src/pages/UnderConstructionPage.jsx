import React from "react";
import { ArrowRight, Construction, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function UnderConstructionPage() {
  return (
    <div className="construction-page">
      <div className="construction-orbit construction-orbit-one" />
      <div className="construction-orbit construction-orbit-two" />
      <div className="construction-content">
        <span className="construction-icon"><Construction size={30} /></span>
        <p className="eyebrow"><Sparkles size={14} /> Something thoughtful is coming</p>
        <h1>Sorry, we're under construction.</h1>
        <p className="construction-copy">We're shaping a better Bcomkart experience behind the scenes. This page will be ready for you soon.</p>
        <Link to="/" className="primary-button">Back to shopping <ArrowRight size={16} /></Link>
        <span className="construction-status"><i /> Building with care</span>
      </div>
    </div>
  );
}
