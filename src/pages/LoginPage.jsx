import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, KeyRound, LogOut, Mail, ShieldCheck, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
let googleScriptPromise;

export function LoginPage() {
  const tokenClientRef = useRef(null);
  const navigate = useNavigate();
  const { user, requestEmailOtp, checkEmailExists, verifyEmailOtp, loginWithPassword, signInWithGoogle, signOut } = useAuth();
  const [message, setMessage] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginStage, setLoginStage] = useState("email"); // email, password, otp, verify-otp
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [credentials, setCredentials] = useState({ name: "", email: "", password: "", otp: "" });

  // Redirect if already signed in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

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
              const signedInUser = await signInWithGoogle(tokenResponse.access_token);
              navigate(signedInUser.role === "ADMIN" ? "/admin" : "/");
            } catch (error) {
              setMessage(error.message || "We could not complete Google sign in. Please try again.");
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
    signOut();
    if (!tokenClientRef.current) {
      setMessage("Google sign in is still loading. Please try again in a moment.");
      return;
    }
    tokenClientRef.current.requestAccessToken({ prompt: "select_account" });
  };

  const handleCredentialChange = (event) => {
    const { name, value } = event.target;
    setCredentials((current) => ({ ...current, [name]: value }));
    setMessage("");
  };

  // Stage 1: User enters email
  const handleCheckEmail = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);
    try {
      const email = credentials.email.trim();
      const exists = await checkEmailExists(email);
      
      if (exists) {
        // Account exists - show password login form
        setIsExistingUser(true);
        setLoginStage("password");
        setMessage("Sign in with your password");
      } else {
        // Account doesn't exist - show new user signup form
        setIsExistingUser(false);
        setLoginStage("new-user");
        setMessage("Create a new account to continue");
      }
    } catch (error) {
      setMessage(error.message || "Could not check account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stage 2: New user enters name and password, then requests OTP
  const handleRequestOtp = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);
    try {
      await requestEmailOtp({ name: credentials.name.trim(), email: credentials.email.trim(), password: credentials.password });
      setLoginStage("verify-otp");
      setMessage(`We sent a verification code to ${credentials.email.trim()}.`);
    } catch (error) {
      setMessage(error.message || "We could not send the verification code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stage 2: Existing user enters password
  const handlePasswordLogin = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);
    try {
      const signedInUser = await loginWithPassword({ email: credentials.email.trim(), password: credentials.password });
      navigate(signedInUser.role === "ADMIN" ? "/admin" : "/");
    } catch (error) {
      setMessage(error.message || "Invalid email or password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stage 3: Verify OTP for new user
  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);
    try {
      const signedInUser = await verifyEmailOtp({ email: credentials.email.trim(), otp: credentials.otp.trim() });
      navigate(signedInUser.role === "ADMIN" ? "/admin" : "/");
    } catch (error) {
      setMessage(error.message || "That code could not be verified. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
          <p>Sign in with your email and password, or create a new account.</p>
        </div>

        {user && (
          <div className="login-current-account">
            <p>Currently signed in as <strong>{user.email}</strong></p>
            <button className="google-fallback" onClick={signOut}>
              <LogOut size={17} />
              Sign out
            </button>
          </div>
        )}

        {loginStage === "email" && (
          <form className="email-auth-form" onSubmit={handleCheckEmail}>
            <label><span><Mail size={14} /> Email address</span><input name="email" type="email" value={credentials.email} onChange={handleCredentialChange} placeholder="you@example.com" autoComplete="email" required /></label>
            <button className="primary-auth-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Checking..." : "Continue"}</button>
          </form>
        )}

        {loginStage === "new-user" && (
          <form className="email-auth-form" onSubmit={handleRequestOtp}>
            <label><span><UserRound size={14} /> Full name</span><input name="name" value={credentials.name} onChange={handleCredentialChange} placeholder="Your name" autoComplete="name" required /></label>
            <label><span><Mail size={14} /> Email address</span><input name="email" type="email" value={credentials.email} onChange={handleCredentialChange} placeholder="you@example.com" autoComplete="email" disabled /></label>
            <label><span><KeyRound size={14} /> Password</span><input name="password" type="password" value={credentials.password} onChange={handleCredentialChange} placeholder="At least 8 characters" autoComplete="new-password" minLength={8} required /></label>
            <button className="primary-auth-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending code..." : "Send verification code"}</button>
            <button className="text-auth-button" type="button" onClick={() => { setLoginStage("email"); setMessage(""); setCredentials(c => ({ ...c, name: "", password: "", otp: "" })); }}>Use a different email</button>
          </form>
        )}

        {loginStage === "password" && (
          <form className="email-auth-form" onSubmit={handlePasswordLogin}>
            <label><span><Mail size={14} /> Email address</span><input name="email" type="email" value={credentials.email} onChange={handleCredentialChange} placeholder="you@example.com" autoComplete="email" disabled /></label>
            <label><span><KeyRound size={14} /> Password</span><input name="password" type="password" value={credentials.password} onChange={handleCredentialChange} placeholder="Enter your password" autoComplete="current-password" required /></label>
            <button className="primary-auth-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Sign in"}</button>
            <button className="text-auth-button" type="button" onClick={() => { setLoginStage("email"); setMessage(""); setCredentials(c => ({ ...c, password: "", otp: "" })); }}>Use a different email</button>
          </form>
        )}

        {loginStage === "verify-otp" && (
          <form className="email-auth-form" onSubmit={handleVerifyOtp}>
            <label><span><Mail size={14} /> Verification code</span><input name="otp" value={credentials.otp} onChange={handleCredentialChange} placeholder="Enter 6-digit code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required /></label>
            <button className="primary-auth-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Verifying..." : "Verify and create account"}</button>
            <button className="text-auth-button" type="button" onClick={() => { setLoginStage("new-user"); setMessage(""); setCredentials(c => ({ ...c, otp: "" })); }}>Use a different email</button>
          </form>
        )}
        <div className="auth-divider"><span>or use backup</span></div>
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