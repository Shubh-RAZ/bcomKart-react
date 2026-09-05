import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
let googleScriptPromise;

export function LoginPage() {
  const tokenClientRef = useRef(null);
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const [message, setMessage] = useState("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!googleClientId) return undefined;

    const loadGoogleScript = () => {
      if (window.google) return Promise.resolve();
      if (googleScriptPromise) return googleScriptPromise;

      googleScriptPromise = new Promise((resolve, reject) => {
        const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (existingScript) {
          existingScript.addEventListener("load", resolve, { once: true });
          existingScript.addEventListener("error", reject, { once: true });
          return;
        }

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
      return googleScriptPromise;
    };

    let active = true;
    loadGoogleScript().then(() => {
      if (!active || !window.google) return;

      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: "openid email profile",
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              setMessage("Google sign in was cancelled or denied.");
              return;
            }

            try {
              const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              if (!response.ok) throw new Error("Profile request failed");
              await signInWithGoogle(tokenResponse.access_token);
              navigate("/");
            } catch {
              setMessage("Google signed you in, but we could not load your profile.");
            }
          },
        });
      setIsReady(true);
    }).catch(() => setMessage("Google sign in could not load. Please refresh and try again."));

    return () => {
      active = false;
    };
  }, [navigate, signInWithGoogle]);

  const handleGoogleSignIn = () => {
    setMessage("");
    if (!tokenClientRef.current) {
      setMessage("Google sign in is still loading. Please try again in a moment.");
      return;
    }
    tokenClientRef.current.requestAccessToken({ prompt: "select_account" });
  };

  return (
    <div className="login-page">
      <div className="login-intro">
        <Link to="/" className="login-back"><ArrowLeft size={16} /> Back to shopping</Link>
        <div className="login-brand-mark">bcom<span>.kart</span></div>
        <p className="eyebrow">Welcome back</p>
        <h1>Your everyday picks, all in one place.</h1>
        <p className="login-intro-copy">Sign in to keep your cart, saved items, and orders together wherever you shop.</p>
        <div className="login-perks">
          <span><Check size={15} /> Faster checkout</span>
          <span><Check size={15} /> Track every order</span>
          <span><Check size={15} /> Save your favourites</span>
        </div>
      </div>

      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-panel-heading">
          <div className="login-icon"><ShieldCheck size={21} /></div>
          <p className="eyebrow">Secure account</p>
          <h2 id="login-title">Sign in to bcom.kart</h2>
          <p>Use your Google account to continue.</p>
        </div>

        {googleClientId ? (
          <button className="google-fallback" onClick={handleGoogleSignIn} disabled={!isReady}>
            <span className="google-g">G</span>
            {isReady ? "Continue with Google" : "Loading Google sign in..."}
          </button>
        ) : (
          <button className="google-fallback" onClick={() => setMessage("Add VITE_GOOGLE_CLIENT_ID to your environment to enable Google sign in.")}>
            <span className="google-g">G</span>
            Continue with Google
          </button>
        )}
        {message && <p className="login-message" role="status">{message}</p>}
        <p className="login-terms">By continuing, you agree to our <Link to="/">Terms of Service</Link> and <Link to="/">Privacy Policy</Link>.</p>
      </section>
    </div>
  );
}