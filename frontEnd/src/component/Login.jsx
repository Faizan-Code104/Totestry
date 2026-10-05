import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

import { API_BASE_URL } from "../config";
import { BUSINESS_INFO } from "../storeInfo";

const apiBase = String(API_BASE_URL || "").replace(/\/+$/, "");
// Storage key names come from src/storeInfo.js
const USER_KEY = BUSINESS_INFO.storageKeys.user;
const TOKEN_KEY = BUSINESS_INFO.storageKeys.token;
const REMEMBERED_EMAIL_KEY = TOKEN_KEY.replace(/-token$/, "-remembered-email");

const getRememberedEmail = () => {
  try {
    return localStorage.getItem(REMEMBERED_EMAIL_KEY) || "";
  } catch {
    return "";
  }
};

const getRedirect = (from) => {
  const candidate =
    typeof from === "string"
      ? from
      : from && typeof from.pathname === "string"
      ? `${from.pathname}${from.search || ""}${from.hash || ""}`
      : "/";

  if (
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    /[\\\u0000-\u001f]/.test(candidate) ||
    /^\/(?:login|signup)(?:[/?#]|$)/i.test(candidate)
  ) {
    return "/";
  }

  return candidate;
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = getRedirect(location.state?.from);

  const formRef = useRef(null);
  const mountedRef = useRef(true);
  const submittingRef = useRef(false);
  const requestRef = useRef(null);
  const redirectTimer = useRef(null);

  const [formData, setFormData] = useState(() => {
    const email = getRememberedEmail();

    return {
      email,
      password: "",
      rememberEmail: Boolean(email),
    };
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      requestRef.current?.abort();
      clearTimeout(redirectTimer.current);
    };
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((current) => ({ ...current, [name]: "" }));
    setServerError("");
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(nextErrors);

    const firstField = Object.keys(nextErrors)[0];

    if (firstField) {
      formRef.current?.elements.namedItem(firstField)?.focus();
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submittingRef.current || success) return;

    setServerError("");

    if (!validateForm()) return;

    submittingRef.current = true;
    setLoading(true);

    const controller = new AbortController();
    requestRef.current = controller;

    const email = formData.email.trim().toLowerCase();

    try {
      const response = await fetch(`${apiBase}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          email,
          password: formData.password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to sign in. Please check your details and try again."
        );
      }

      if (
        typeof data.token !== "string" ||
        !data.token.trim() ||
        !data.user ||
        typeof data.user !== "object" ||
        Array.isArray(data.user)
      ) {
        throw new Error("The server returned an incomplete login response.");
      }

      if (!mountedRef.current) return;

      try {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        localStorage.setItem(TOKEN_KEY, data.token);
      } catch {
        try {
          localStorage.removeItem(USER_KEY);
          localStorage.removeItem(TOKEN_KEY);
        } catch {
          // Storage may be blocked by the browser.
        }

        throw new Error(
          "Your browser could not save this login. Please allow site storage and try again."
        );
      }

      try {
        if (formData.rememberEmail) {
          localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
        } else {
          localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        }
      } catch {
        // Remembering the email is optional.
      }

      setSuccess(true);
      setShowPassword(false);
      setFormData((current) => ({ ...current, password: "" }));

      redirectTimer.current = setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 700);
    } catch (error) {
      if (mountedRef.current && error.name !== "AbortError") {
        setServerError(
          error instanceof TypeError
            ? "Unable to connect right now. Please try again."
            : error.message || "Unable to sign in. Please try again."
        );
      }
    } finally {
      submittingRef.current = false;

      if (mountedRef.current) setLoading(false);

      if (requestRef.current === controller) {
        requestRef.current = null;
      }
    }
  };

  const brand = BUSINESS_INFO.businessName;

  return (
    <div className="tt-site tt-auth">
      {/* VISUAL SIDE */}
      <aside className="tt-auth-visual">
        <img src="/images/hero.webp" alt="" aria-hidden="true" />

        <Link to="/" className="tt-auth-logo" aria-label={`${brand} home`}>
          <span className="tt-logo">
            <span className="tt-logo-mark" aria-hidden="true">
              ✳
            </span>
            {brand.toUpperCase()}
            <span className="tt-logo-dot" aria-hidden="true">
              .
            </span>
          </span>
        </Link>

        <div className="tt-auth-copy">
          <p className="tt-eyebrow">
            <span className="tt-eyebrow-dot" />
            Your account / Welcome back
          </p>

          <h1>
            Pick up where
            <br />
            <em>you left off.</em>
          </h1>

          <p>Sign in to your {brand} account to continue.</p>
        </div>
      </aside>

      {/* FORM SIDE */}
      <main className="tt-auth-main">
        <Link to="/shop" className="tt-cart-back tt-auth-back">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to shopping
        </Link>

        <section className="tt-auth-panel" aria-labelledby="tt-login-title">
          <p className="tt-eyebrow tt-eyebrow--accent">
            Good to see you again.
          </p>
          <h2 id="tt-login-title">Sign in</h2>

          {serverError && (
            <div className="tt-feedback is-error" role="alert">
              <p>{serverError}</p>
            </div>
          )}

          {success ? (
            <div className="tt-auth-success">
              <span aria-hidden="true">
                <Check size={26} />
              </span>

              <h3>You’re signed in.</h3>

              <p role="status" aria-live="polite">
                Login successful. Redirecting…
              </p>

              <Link to={redirectTo} className="tt-button tt-button--dark">
                Continue
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              noValidate
              aria-busy={loading}
            >
              <fieldset disabled={loading}>
                <legend className="sr-only">Login details</legend>

                <label
                  className={`tt-field${errors.email ? " has-error" : ""}`}
                  htmlFor="tt-login-email"
                >
                  <span>Email address</span>
                  <input
                    id="tt-login-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={
                      errors.email ? "tt-login-email-error" : undefined
                    }
                  />
                  {errors.email && (
                    <em id="tt-login-email-error">{errors.email}</em>
                  )}
                </label>

                <div
                  className={`tt-field${errors.password ? " has-error" : ""}`}
                >
                  <label htmlFor="tt-login-password">
                    <span>Password</span>
                  </label>

                  <div className="tt-password">
                    <input
                      id="tt-login-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                      minLength={6}
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={
                        errors.password ? "tt-login-password-error" : undefined
                      }
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      aria-controls="tt-login-password"
                    >
                      {showPassword ? (
                        <EyeOff size={18} aria-hidden="true" />
                      ) : (
                        <Eye size={18} aria-hidden="true" />
                      )}
                    </button>
                  </div>

                  {errors.password && (
                    <em id="tt-login-password-error">{errors.password}</em>
                  )}
                </div>

                <label className="tt-check">
                  <input
                    name="rememberEmail"
                    type="checkbox"
                    checked={formData.rememberEmail}
                    onChange={handleChange}
                  />
                  Remember my email on this device
                </label>

                <button
                  type="submit"
                  className="tt-button tt-button--dark tt-auth-submit"
                  disabled={loading}
                >
                  {loading ? "Signing in…" : "Sign in"}

                  {loading ? (
                    <Loader2 size={18} className="tt-spinner" aria-hidden="true" />
                  ) : (
                    <ArrowUpRight size={18} aria-hidden="true" />
                  )}
                </button>
              </fieldset>
            </form>
          )}

          <div className="tt-auth-switch">
            <div>
              <p className="tt-eyebrow tt-eyebrow--accent">New here?</p>
              <p>Make yourself at home.</p>
            </div>

            <Link to="/signup" className="tt-text-arrow">
              Create account
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <p className="tt-auth-guest">
          An account is not required to continue as a guest during checkout.
        </p>

        <footer className="tt-auth-footer">
          <span>
            © {new Date().getFullYear()} {brand}. All rights reserved.
          </span>

          <div>
            <Link to="/privacy-policy">Privacy</Link>
            <Link to="/terms-and-conditions">Terms</Link>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Login;