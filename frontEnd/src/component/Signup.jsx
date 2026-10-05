import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  terms: false,
};

const Signup = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const requestRef = useRef(null);
  const redirectRef = useRef(null);
  const mountedRef = useRef(true);
  const submittingRef = useRef(false);

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      requestRef.current?.abort();
      clearTimeout(redirectRef.current);
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

    if (!formData.name.trim()) {
      nextErrors.name = "Name is required.";
    } else if (formData.name.trim().length < 2) {
      nextErrors.name = "Name must be at least 2 characters.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
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

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (!formData.terms) {
      nextErrors.terms =
        "Please accept the Terms & Conditions and Privacy Policy.";
    }

    setErrors(nextErrors);

    const firstInvalidField = Object.keys(nextErrors)[0];

    if (firstInvalidField) {
      formRef.current?.elements.namedItem(firstInvalidField)?.focus();
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submittingRef.current || successMessage) return;

    setServerError("");

    if (!validateForm()) return;

    submittingRef.current = true;
    setIsSubmitting(true);

    const controller = new AbortController();
    requestRef.current = controller;

    try {
      const response = await fetch(`${apiBase}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create your account. Please try again."
        );
      }

      if (!mountedRef.current) return;

      setSuccessMessage(
        `Your ${BUSINESS_INFO.businessName} account has been created successfully.`
      );

      setFormData(initialForm);
      setErrors({});
      setShowPassword(false);
      setShowConfirmPassword(false);

      redirectRef.current = setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (error) {
      if (mountedRef.current && error.name !== "AbortError") {
        setServerError(
          error.message || "Unable to create your account. Please try again."
        );
      }
    } finally {
      submittingRef.current = false;

      if (mountedRef.current) {
        setIsSubmitting(false);
      }

      if (requestRef.current === controller) {
        requestRef.current = null;
      }
    }
  };

  const fields = [
    {
      name: "name",
      label: "Full name",
      type: "text",
      placeholder: "Enter your full name",
      autoComplete: "name",
    },
    {
      name: "email",
      label: "Email address",
      type: "email",
      placeholder: "you@example.com",
      autoComplete: "email",
    },
    {
      name: "password",
      label: "Password",
      type: showPassword ? "text" : "password",
      placeholder: "Minimum 6 characters",
      autoComplete: "new-password",
      visible: showPassword,
      toggle: () => setShowPassword((current) => !current),
    },
    {
      name: "confirmPassword",
      label: "Confirm password",
      type: showConfirmPassword ? "text" : "password",
      placeholder: "Re-enter your password",
      autoComplete: "new-password",
      visible: showConfirmPassword,
      toggle: () => setShowConfirmPassword((current) => !current),
    },
  ];

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
            Your style starts here
          </p>

          <h1>
            A little more <em>you.</em>
          </h1>

          <p>
            Create your {brand} account for a faster, more convenient shopping
            experience.
          </p>
        </div>
      </aside>

      {/* FORM SIDE */}
      <main className="tt-auth-main">
        <Link to="/shop" className="tt-cart-back tt-auth-back">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to shopping
        </Link>

        <section className="tt-auth-panel" aria-labelledby="tt-signup-title">
          <p className="tt-eyebrow tt-eyebrow--accent">
            Already registered?{" "}
            <Link to="/login" className="tt-inline-link">
              Sign in
            </Link>
          </p>
          <h2 id="tt-signup-title">Create your account</h2>

          {serverError && (
            <div className="tt-feedback is-error" role="alert">
              <p>{serverError}</p>
            </div>
          )}

          {successMessage ? (
            <div className="tt-auth-success">
              <span aria-hidden="true">
                <Check size={26} />
              </span>

              <h3>You’re all set.</h3>

              <p role="status" aria-live="polite">
                {successMessage}
                <br />
                Taking you to sign in…
              </p>

              <Link to="/login" className="tt-button tt-button--dark">
                Continue to sign in
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              noValidate
              aria-busy={isSubmitting}
            >
              <fieldset disabled={isSubmitting}>
                <legend className="sr-only">Registration details</legend>

                {fields.map((field) => (
                  <div
                    className={`tt-field${errors[field.name] ? " has-error" : ""}`}
                    key={field.name}
                  >
                    <label htmlFor={`tt-signup-${field.name}`}>
                      <span>{field.label}</span>
                    </label>

                    <div className={field.toggle ? "tt-password" : undefined}>
                      <input
                        id={`tt-signup-${field.name}`}
                        name={field.name}
                        type={field.type}
                        value={formData[field.name]}
                        onChange={handleChange}
                        autoComplete={field.autoComplete}
                        placeholder={field.placeholder}
                        required
                        minLength={
                          field.name === "name"
                            ? 2
                            : field.toggle
                              ? 6
                              : undefined
                        }
                        autoCapitalize={
                          field.name === "email" || field.toggle
                            ? "none"
                            : "words"
                        }
                        spellCheck={field.name === "name"}
                        aria-invalid={Boolean(errors[field.name])}
                        aria-describedby={
                          errors[field.name]
                            ? `tt-signup-${field.name}-error`
                            : field.name === "password"
                              ? "tt-signup-password-hint"
                              : undefined
                        }
                      />

                      {field.toggle && (
                        <button
                          type="button"
                          onClick={field.toggle}
                          aria-label={`${field.visible ? "Hide" : "Show"} ${
                            field.name === "confirmPassword"
                              ? "confirm password"
                              : "password"
                          }`}
                          aria-pressed={field.visible}
                          aria-controls={`tt-signup-${field.name}`}
                        >
                          {field.visible ? (
                            <EyeOff size={18} aria-hidden="true" />
                          ) : (
                            <Eye size={18} aria-hidden="true" />
                          )}
                        </button>
                      )}
                    </div>

                    {errors[field.name] ? (
                      <em id={`tt-signup-${field.name}-error`}>
                        {errors[field.name]}
                      </em>
                    ) : field.name === "password" ? (
                      <small id="tt-signup-password-hint">
                        Use at least 6 characters.
                      </small>
                    ) : null}
                  </div>
                ))}

                <div>
                  <div className="tt-check">
                    <input
                      id="tt-signup-terms"
                      name="terms"
                      type="checkbox"
                      checked={formData.terms}
                      onChange={handleChange}
                      required
                      aria-invalid={Boolean(errors.terms)}
                      aria-describedby={
                        errors.terms ? "tt-signup-terms-error" : undefined
                      }
                    />

                    <div>
                      <label htmlFor="tt-signup-terms">I agree to the</label>{" "}
                      <Link to="/terms-and-conditions">
                        Terms &amp; Conditions
                      </Link>{" "}
                      and <Link to="/privacy-policy">Privacy Policy</Link>.
                    </div>
                  </div>

                  {errors.terms && (
                    <p id="tt-signup-terms-error" className="tt-check-error">
                      {errors.terms}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="tt-button tt-button--dark tt-auth-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      Creating account…
                      <Loader2
                        size={18}
                        className="tt-spinner"
                        aria-hidden="true"
                      />
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowUpRight size={18} aria-hidden="true" />
                    </>
                  )}
                </button>

                <p className="tt-auth-note">
                  Your account, ready for your next favourite.
                </p>
              </fieldset>
            </form>
          )}

          <div className="tt-auth-switch">
            <div>
              <p className="tt-eyebrow tt-eyebrow--accent">
                Already part of {brand}?
              </p>
            </div>

            <Link to="/login" className="tt-text-arrow">
              Sign in to your account
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </section>

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

export default Signup;