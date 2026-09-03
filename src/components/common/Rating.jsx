import React from "react";
import { Star } from "lucide-react";

export function Rating({ value, reviews }) {
  return (
    <div className="rating">
      <span><Star size={14} fill="currentColor" /> {value}</span>
      {reviews !== undefined && <small>({reviews} reviews)</small>}
    </div>
  );
}
