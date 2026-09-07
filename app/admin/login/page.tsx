"use client";

import { useEffect, useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const isLoading = false;

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("error");
    const messages: Record<string, string> = {
      credentials: "Incorrect email or password.",
      auth: "Sign-in was rejected. Check your account confirmation and try again.",
      connection: "The server could not complete sign-in. Please try again.",
      missing: "Please enter your email and password.",
      origin: "Please reload the login page from your current website address.",
    };
    if (code) setErrorMessage(messages[code] || "Unable to sign in. Please try again.");
  }, []);

  return (
    <main className="store-admin-login-page">
      <div className="store-admin-login-glow store-admin-login-glow-one" />
      <div className="store-admin-login-glow store-admin-login-glow-two" />
      <section className="store-admin-login-card">
        <div className="store-admin-login-top">
          <div className="store-admin-login-brand">
            <span>TCL</span>
            <small>Systems &amp; Digitals PH</small>
          </div>
          <a className="store-admin-login-back" href="/">← Back to Store</a>
        </div>
        <div className="store-admin-login-heading">
          <span className="section-kicker">Private Admin</span>
          <h1>Welcome back ♡</h1>
          <p>
            Sign in to manage your TCL storefront, products, orders, reviews,
            customers, and deliveries.
          </p>
        </div>
        <form className="store-admin-login-form" action="/api/admin/login" method="post">
          <label>
            <span>Email address</span>
            <input type="email" name="email" value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@business.com" autoComplete="email"
              required disabled={isLoading} />
          </label>
          <label>
            <span>Password</span>
            <input type="password" name="password" value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password" autoComplete="current-password"
              required disabled={isLoading} />
          </label>
          {errorMessage ? (
            <div className="store-admin-login-error" role="alert">{errorMessage}</div>
          ) : null}
          <button className="button button-primary store-admin-login-button"
            type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
            {!isLoading ? <span>→</span> : null}
          </button>
        </form>
        <div className="store-admin-login-security">
          <span>✓</span>
          <p>This area is for authorized TCL administrators only.</p>
        </div>
      </section>
    </main>
  );
}
