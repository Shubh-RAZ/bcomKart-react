import React from "react";
import { BadgeCheck, Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";

const features = [
  { icon: BadgeCheck, title: "100% Original Products", text: "Genuine & brand warranty" },
  { icon: Truck, title: "Free Delivery", text: "On orders above ₹2,499" },
  { icon: RotateCcw, title: "Easy Returns", text: "7 days return policy" },
  { icon: ShieldCheck, title: "Secure Payments", text: "100% secure transactions" },
  { icon: Headphones, title: "Support", text: "We're here to help" }
];

export function TrustFeatures() {
  return (
    <section className="trust-grid">
      {features.map(({ icon: Icon, title, text }) => (
        <div className="trust-item" key={title}>
          <span className="trust-icon"><Icon size={19}/></span>
          <div><strong>{title}</strong><small>{text}</small></div>
        </div>
      ))}
    </section>
  );
}
