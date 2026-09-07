import React from "react";
import { LoaderCircle } from "lucide-react";

export function LoadingScreen({ label = "Loading your shopping experience" }) {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-mark"><LoaderCircle size={25} /></div>
      <strong>{label}</strong>
      <span>One moment while we bring everything together.</span>
    </div>
  );
}
