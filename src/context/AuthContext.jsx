import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || "https://site--bcomkart--xww9qqf4bywz.code.run/api";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("bcomkart_token");
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...(isFormData ? {} : { "Content-Type": "application/json" }), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "Request failed");
  }
  return response.status === 204 ? null : response.json();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("bcomkart_user") || "null"));

  useEffect(() => {
    const token = localStorage.getItem("bcomkart_token");
    if (!token) return;
    apiRequest("/auth/me").then(({ user: currentUser }) => setUser(currentUser)).catch(() => {
      localStorage.removeItem("bcomkart_token");
      localStorage.removeItem("bcomkart_user");
      setUser(null);
    });
  }, []);

  const signInWithGoogle = async (accessToken) => {
    const result = await apiRequest("/auth/google", { method: "POST", body: JSON.stringify({ accessToken }) });
    localStorage.setItem("bcomkart_token", result.token);
    localStorage.setItem("bcomkart_user", JSON.stringify(result.user));
    setUser(result.user);
    return result.user;
  };

  const requestEmailOtp = async ({ name, email, password }) => {
    return apiRequest("/auth/request-otp", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  };

  const verifyEmailOtp = async ({ email, otp }) => {
    const result = await apiRequest("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });
    localStorage.setItem("bcomkart_token", result.token);
    localStorage.setItem("bcomkart_user", JSON.stringify(result.user));
    setUser(result.user);
    return result.user;
  };

  const signOut = () => {
    localStorage.removeItem("bcomkart_token");
    localStorage.removeItem("bcomkart_user");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, requestEmailOtp, verifyEmailOtp, signInWithGoogle, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
