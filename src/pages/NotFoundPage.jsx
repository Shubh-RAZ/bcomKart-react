import React from "react";
import { Link } from "react-router-dom";
export function NotFoundPage() {
  return <div className="empty-page"><span>404</span><h2>Page not found</h2><p>Let's get you back to Bcomkart.</p><Link to="/" className="primary-button">Go Home</Link></div>;
}
