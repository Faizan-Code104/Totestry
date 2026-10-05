import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Clock3,
  ImageOff,
  Truck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useCart } from "./CartContext";
import storeInfo from "../storeInfo";

const STEPS = ["Contact", "Delivery", "Review"];

const STEP_TITLES = [
  "First, a little about you.",
  "Next, your delivery details.",
  "Everything in one place.",
];

const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);

const pad = (number) => String(number).padStart(2, "0");

// Pre-fills the email of a signed-in customer (key name is in storeInfo.js)
const readSavedEmail = () => {
  if (typeof window === "undefined") return "";

  try {
    const saved = window.localStorage.getItem(storeInfo.storageKeys.user);

    if (!saved) return "";

    const user = JSON.parse(saved);

    if (typeof user?.email === "string" && user.email.trim()) {
      return user.email;
    }
  } catch {
    // Storage unavailable or unreadable — leave the field empty.
  }

  return "";
};

const CheckoutImage = ({ src, name }) => {
  const [failedSource, setFailedSource] = useState(null);

  return src && failedSource !== src ? (
    <img
      src={src}
      alt={name || `${storeInfo.businessName} handbag`}
      onError={() => setFailedSource(src)}
      loading="lazy"
    />
  ) : (
    <span className="tt-product-empty">
      <ImageOff size={22} strokeWidth={1.3} aria-hidden="true" />
    </span>
  );
};

const Field = ({
  name,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  placeholder,
  required = false,
  readOnly = false,
  inputMode,
  pattern,
  full = false,
}) => (
  <label
    className={`tt-field${full ? " tt-field--full" : ""}`}
    htmlFor={`tt-checkout-${name}`}
  >
    <span>
      {label}
      {!required && !readOnly && <small>Optional</small>}
    </span>

    <input
      id={`tt-checkout-${name}`}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      placeholder={placeholder}
      required={required}
      readOnly={readOnly}
      inputMode={inputMode}
      pattern={pattern}
    />
  </label>
);

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartSubtotal } = useCart();

  const [step, setStep] = useState(0);
  const sectionTitleRef = useRef(null);
  const shouldFocusStep = useRef(false);

  const [formData, setFormData] = useState(() => ({
    firstName: "",
    lastName: "",
    email: readSavedEmail(),
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
  }));

  const items = cartItems || [];
  const subtotal = Number(cartSubtotal) || 0;
  const shipping = 0;
  const total = subtotal + shipping;

  const totalItems = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 1),
    0
  );

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [items.length, navigate]);

  useEffect(() => {
    if (shouldFocusStep.current) {
      sectionTitleRef.current?.focus();
      shouldFocusStep.current = false;
    }
  }, [step]);

  const changeStep = (nextStep) => {
    shouldFocusStep.current = true;
    setStep(nextStep);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!event.currentTarget.reportValidity()) return;

    changeStep(Math.min(step + 1, 2));
  };

  if (items.length === 0) return null;

  return (
    <>
      {/* OPENING */}
      <section className="tt-info-hero tt-cart-hero" data-index={pad(step + 1)}>
        <Link to="/cart" className="tt-cart-back">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to cart
        </Link>

        <p className="tt-eyebrow">
          <span className="tt-eyebrow-dot" />
          A little closer to yours
        </p>

        <h1>
          The final <em>details.</em>
        </h1>

        <p>
          Review your selection and delivery details. Online orders and
          payments are not yet available.
        </p>
      </section>

      <div className="tt-cart tt-checkout">
        {/* DETAILS */}
        <section className="tt-checkout-panel">
          <ol className="tt-steps" aria-label="Checkout progress">
            {STEPS.map((label, index) => (
              <li
                key={label}
                className={
                  index === step
                    ? "is-current"
                    : index < step
                      ? "is-complete"
                      : ""
                }
                aria-current={index === step ? "step" : undefined}
              >
                <span>
                  {index < step ? (
                    <Check size={14} strokeWidth={2.4} aria-hidden="true" />
                  ) : (
                    pad(index + 1)
                  )}
                </span>
                {label}
              </li>
            ))}
          </ol>

          <div className="tt-note" role="note">
            <strong>
              <Clock3
                size={15}
                style={{ display: "inline", verticalAlign: "-2px" }}
                aria-hidden="true"
              />{" "}
              Coming soon
            </strong>
            <p>
              <b>Online checkout is coming soon.</b> These details are for
              review only. No order is placed and no payment is collected.
            </p>
          </div>

          <div key={step} className="tt-checkout-step">
            <p className="tt-eyebrow tt-eyebrow--accent">Step {pad(step + 1)}</p>

            <h2 ref={sectionTitleRef} tabIndex={-1}>
              {STEP_TITLES[step]}
            </h2>

            {step < 2 ? (
              <form onSubmit={handleSubmit}>
                  <div className="tt-checkout-fields">
                    {step === 0 ? (
                      <>
                        <Field
                          name="firstName"
                          label="First name"
                          autoComplete="given-name"
                          placeholder="First name"
                          required
                          value={formData.firstName}
                          onChange={handleChange}
                        />
                        <Field
                          name="lastName"
                          label="Last name"
                          autoComplete="family-name"
                          placeholder="Last name"
                          required
                          value={formData.lastName}
                          onChange={handleChange}
                        />
                        <Field
                          name="email"
                          label="Email address"
                          type="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          required
                          value={formData.email}
                          onChange={handleChange}
                        />
                        <Field
                          name="phone"
                          label="Phone number"
                          type="tel"
                          autoComplete="tel"
                          placeholder="+1 555 000 0000"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </>
                    ) : (
                      <>
                        <Field
                          name="address"
                          label="Street address"
                          autoComplete="address-line1"
                          placeholder="Street address"
                          required
                          full
                          value={formData.address}
                          onChange={handleChange}
                        />
                        <Field
                          name="apartment"
                          label="Apartment, suite, etc."
                          autoComplete="address-line2"
                          placeholder="Apartment or suite"
                          full
                          value={formData.apartment}
                          onChange={handleChange}
                        />
                        <Field
                          name="city"
                          label="City"
                          autoComplete="address-level2"
                          placeholder="City"
                          required
                          value={formData.city}
                          onChange={handleChange}
                        />
                        <Field
                          name="state"
                          label="State"
                          autoComplete="address-level1"
                          placeholder="State"
                          required
                          value={formData.state}
                          onChange={handleChange}
                        />
                        <Field
                          name="postalCode"
                          label="ZIP code"
                          autoComplete="postal-code"
                          inputMode="numeric"
                          pattern="[0-9]{5}(-[0-9]{4})?"
                          placeholder="10001 or 10001-1234"
                          required
                          value={formData.postalCode}
                          onChange={handleChange}
                        />
                        <Field
                          name="country"
                          label="Country"
                          autoComplete="country-name"
                          readOnly
                          value={formData.country}
                          onChange={handleChange}
                        />
                      </>
                    )}
                  </div>

                <div className="tt-checkout-actions">
                  {step === 1 && (
                    <button
                      type="button"
                      className="tt-button tt-button--outline"
                      onClick={() => changeStep(0)}
                    >
                      <ArrowLeft size={16} aria-hidden="true" />
                      Back
                    </button>
                  )}

                  <button type="submit" className="tt-button tt-button--dark">
                    {step === 0 ? "Continue to delivery" : "Review details"}
                    <ArrowUpRight
                      size={18}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </form>
            ) : (
              <div className="tt-checkout-review">
                <section className="tt-card">
                  <div>
                    <h3>Contact</h3>
                    <button type="button" onClick={() => changeStep(0)}>
                      Edit
                    </button>
                  </div>

                  <p>
                    {formData.firstName} {formData.lastName}
                  </p>
                  <p>{formData.email}</p>
                  {formData.phone && <p>{formData.phone}</p>}
                </section>

                <section className="tt-card">
                  <div>
                    <h3>Delivery address</h3>
                    <button type="button" onClick={() => changeStep(1)}>
                      Edit
                    </button>
                  </div>

                  <p>{formData.address}</p>
                  {formData.apartment && <p>{formData.apartment}</p>}
                  <p>
                    {formData.city}, {formData.state} {formData.postalCode}
                  </p>
                  <p>{formData.country}</p>
                </section>

                <div className="tt-note tt-checkout-status">
                  <Clock3 size={22} strokeWidth={1.4} aria-hidden="true" />
                  <div>
                    <h3>Payment is not available yet.</h3>
                    <p>
                      {storeInfo.businessName} is completing its online
                      payment setup. Your order has not been submitted. These
                      details are not saved when you leave this page.
                    </p>
                  </div>
                </div>

                <Link to="/cart" className="tt-button tt-button--dark">
                  Return to cart
                  <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ORDER SUMMARY */}
        <aside className="tt-cart-summary" aria-labelledby="tt-checkout-order">
          <p className="tt-eyebrow">Your selection</p>

          <h2 id="tt-checkout-order">
            {totalItems}{" "}
            <em>{totalItems === 1 ? "lovely piece" : "lovely pieces"}.</em>
          </h2>

          <div className="tt-checkout-items">
            {items.map((item) => {
              const id = item.id || item._id;
              const quantity = Number(item.quantity) || 1;

              return (
                <article key={id}>
                  <Link to={`/shop/${id}`} aria-label={`View ${item.name}`}>
                    <CheckoutImage src={item.image} name={item.name} />
                  </Link>

                  <div>
                    <small>
                      {item.category || `${storeInfo.businessName} collection`}
                    </small>
                    <h3>
                      <Link to={`/shop/${id}`}>{item.name}</Link>
                    </h3>
                    <span>Quantity: {quantity}</span>
                  </div>

                  <strong>{money(Number(item.price) * quantity)}</strong>
                </article>
              );
            })}
          </div>

          <Link to="/cart" className="tt-checkout-edit">
            Edit cart
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>

          <dl>
            <div>
              <dt>Subtotal</dt>
              <dd>{money(subtotal)}</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd>Free</dd>
            </div>
          </dl>

          <div className="tt-cart-total">
            <span>Order total</span>
            <strong>{money(total)}</strong>
          </div>

          <div className="tt-cart-delivery">
            <Truck size={22} strokeWidth={1.4} aria-hidden="true" />
            <div>
              <strong>United States delivery</strong>
              <p>Free U.S. shipping is shown in your order review.</p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Checkout;