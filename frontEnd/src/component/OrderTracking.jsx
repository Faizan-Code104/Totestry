import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  Copy,
  ImageOff,
  Loader2,
  Package,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import { API_BASE_URL } from "../config";
import { BUSINESS_INFO } from "../storeInfo";
import Reveal from "./Reveal";

const STATUS_STEPS = [
  { key: "Pending", title: "Order placed", icon: Package },
  { key: "Processing", title: "Processing", icon: CheckCircle2 },
  { key: "Shipped", title: "Shipped", icon: Truck },
  { key: "Delivered", title: "Delivered", icon: CheckCircle2 },
];

const apiBase = API_BASE_URL.replace(/\/+$/, "");

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatMoney = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
    : "—";
};

const getImageUrl = (image) => {
  if (typeof image !== "string" || !image.trim()) return "";

  const value = image.trim();
  if (/^https?:\/\//i.test(value)) return value;

  return `${apiBase}/${value.replace(/^\/+/, "")}`;
};

const ProductImage = ({ image, name }) => {
  const [failed, setFailed] = useState(false);
  const src = getImageUrl(image);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <span className="tt-track-thumb">
      {src && !failed ? (
        <img
          src={src}
          alt={name || "Ordered product"}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <ImageOff size={22} aria-label="Product image unavailable" />
      )}
    </span>
  );
};

const OrderTracking = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  const requestRef = useRef(null);
  const copyTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      requestRef.current?.abort();
      clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleTrackOrder = async (event) => {
    event.preventDefault();
    if (requestRef.current) return;

    const value = trackingNumber.trim().toUpperCase();

    setError("");
    setOrder(null);
    setCopied(false);
    setCopyError("");
    clearTimeout(copyTimerRef.current);

    if (!value) {
      setError("Please enter your order number.");
      return;
    }

    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);

    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 20000);

    try {
      const response = await fetch(
        `${apiBase}/api/orders/track/${encodeURIComponent(value)}`,
        { signal: controller.signal }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "We couldn't find an order with this number. Please check and try again."
        );
      }

      if (
        !data?.order ||
        typeof data.order !== "object" ||
        Array.isArray(data.order)
      ) {
        throw new Error(
          "Order details are unavailable right now. Please try again."
        );
      }

      if (!controller.signal.aborted) {
        setOrder(data.order);
      }
    } catch (fetchError) {
      if (timedOut) {
        setError("The request took too long. Please try again.");
      } else if (fetchError?.name !== "AbortError") {
        setError(
          fetchError?.message ||
            "Unable to retrieve this order right now. Please try again."
        );
      }
    } finally {
      clearTimeout(timeout);

      if (requestRef.current === controller) {
        requestRef.current = null;
        setLoading(false);
      }
    }
  };

  const handleCopyOrderNumber = async () => {
    if (!order?.orderNumber) return;

    setCopyError("");

    try {
      await navigator.clipboard.writeText(String(order.orderNumber));
      setCopied(true);
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setCopyError("Couldn't copy. Please select the order number manually.");
    }
  };

  const status = String(order?.status || "").trim();
  const isCancelled = status.toLowerCase() === "cancelled";
  const currentStepIndex = STATUS_STEPS.findIndex(
    (step) => step.key.toLowerCase() === status.toLowerCase()
  );

  const destination = [
    order?.shippingAddress?.city,
    order?.shippingAddress?.state,
  ]
    .filter(Boolean)
    .join(", ");

  const items = Array.isArray(order?.items) ? order.items : [];

  const supportHref = BUSINESS_INFO.email
    ? `mailto:${BUSINESS_INFO.email}?subject=${encodeURIComponent(
        `${BUSINESS_INFO.businessName} Order Support - ${
          order?.orderNumber || ""
        }`
      )}`
    : "";

  return (
    <>
      {/* OPENING + SEARCH */}
      <section className="tt-info-hero" data-index="→">
        <p className="tt-eyebrow">
          <span className="tt-eyebrow-dot" />
          {BUSINESS_INFO.businessName} / Order care / Track your order
        </p>

        <h1>
          From our door
          <br />
          <em>to yours.</em>
        </h1>

        <p>
          Enter the order number from your confirmation to see the latest
          available status.
        </p>

        <form
          className="tt-track-form"
          onSubmit={handleTrackOrder}
          aria-busy={loading}
        >
          <label htmlFor="tt-track-number">Order number</label>

          <div className="tt-faq-search">
            <Package size={20} strokeWidth={1.6} aria-hidden="true" />
            <input
              id="tt-track-number"
              type="text"
              value={trackingNumber}
              onChange={(event) => {
                setTrackingNumber(event.target.value);
                setError("");
              }}
              placeholder="Enter your order number"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              maxLength={120}
              disabled={loading}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "tt-track-error" : "tt-track-help"}
            />

            <button
              type="submit"
              className="tt-button tt-button--dark"
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={17} className="tt-spinner" aria-hidden="true" />
              ) : (
                <Search size={17} aria-hidden="true" />
              )}
              {loading ? "Searching…" : "Track order"}
            </button>
          </div>

          <small id="tt-track-help">
            Use the order number exactly as shown in your confirmation.
          </small>
        </form>
      </section>

      <section className="tt-wrap tt-track" aria-label="Order tracking">
        {error && (
          <div id="tt-track-error" className="tt-feedback is-error" role="alert">
            <XCircle size={20} aria-hidden="true" />
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="tt-state" role="status">
            <Loader2
              size={28}
              className="tt-spinner"
              style={{ margin: "0 auto" }}
              aria-hidden="true"
            />
            <p style={{ marginTop: 14 }}>Looking up your order…</p>
          </div>
        )}

        {/* GUIDE (before a search) */}
        {!order && !loading && (
          <>
            <Reveal className="tt-section-title">
              <div>
                <p className="tt-eyebrow tt-eyebrow--accent">
                  A few simple steps
                </p>
                <h2>
                  Stay in
                  <br />
                  <em>the loop.</em>
                </h2>
              </div>
            </Reveal>

            <div className="tt-card-grid tt-track-guide">
              {[
                {
                  title: "Find your number",
                  text: "Check your existing order confirmation.",
                },
                {
                  title: "Check the progress",
                  text: "View the current stage and latest available update.",
                },
                {
                  title: "Talk to our team",
                  text: "Contact support if your order needs attention.",
                },
              ].map((step, index) => (
                <Reveal key={step.title} delay={index * 110}>
                  <article className="tt-card tt-about-step">
                    <div>
                      <span>{String(index + 1).padStart(2, "0")} / 03</span>
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </>
        )}

        {/* RESULT */}
        {order && (
          <div className="tt-track-result">
            <div className="tt-track-head">
              <div>
                <p className="tt-eyebrow tt-eyebrow--accent">
                  Latest order status
                </p>
                <h2>
                  {isCancelled
                    ? "This order was cancelled."
                    : currentStepIndex === 3
                      ? "Your order has arrived."
                      : currentStepIndex >= 0
                        ? "Here’s where it stands."
                        : "Your order update."}
                </h2>
                <span
                  className={`tt-track-status${isCancelled ? " is-cancelled" : ""}`}
                >
                  {status || "Status unavailable"}
                </span>
              </div>

              <div className="tt-track-number">
                <p className="tt-eyebrow">Order number</p>
                <div>
                  <strong>{order.orderNumber || "—"}</strong>
                  {order.orderNumber && (
                    <button
                      type="button"
                      onClick={handleCopyOrderNumber}
                      aria-label="Copy order number"
                    >
                      {copied ? <Check size={17} /> : <Copy size={17} />}
                    </button>
                  )}
                </div>
                <p role="status">
                  {copied ? "Order number copied." : copyError}
                </p>
              </div>
            </div>

            <dl className="tt-track-meta">
              <div>
                <dt>Placed on</dt>
                <dd>{formatDateTime(order.createdAt)}</dd>
              </div>
              <div>
                <dt>Destination</dt>
                <dd>{destination || "—"}</dd>
              </div>
              <div>
                <dt>Latest update</dt>
                <dd>{formatDateTime(order.updatedAt)}</dd>
              </div>
            </dl>

            <section
              className="tt-track-block"
              aria-labelledby="tt-track-progress-title"
            >
              <p className="tt-eyebrow tt-eyebrow--accent">Delivery progress</p>
              <h3 id="tt-track-progress-title">The journey so far.</h3>

              {isCancelled ? (
                <div className="tt-feedback is-error">
                  <XCircle size={22} aria-hidden="true" />
                  <p>
                    This order was cancelled and will not be delivered.
                    Contact support if you believe this is a mistake.
                  </p>
                </div>
              ) : currentStepIndex < 0 ? (
                <p className="tt-track-muted">
                  A delivery stage is not available for this status. Contact
                  our team for more details.
                </p>
              ) : (
                <ol className="tt-track-timeline">
                  {STATUS_STEPS.map((step, index) => {
                    const Icon = step.icon;
                    const isCurrent = index === currentStepIndex;
                    const isPast = index < currentStepIndex;

                    return (
                      <li
                        key={step.key}
                        className={
                          isCurrent ? "is-current" : isPast ? "is-complete" : ""
                        }
                        aria-current={isCurrent ? "step" : undefined}
                        style={{ animationDelay: `${index * 110}ms` }}
                      >
                        <span>
                          {isPast ? (
                            <Check size={20} aria-hidden="true" />
                          ) : (
                            <Icon size={20} aria-hidden="true" />
                          )}
                        </span>
                        <h4>{step.title}</h4>
                        <p>
                          {isCurrent
                            ? index === 3
                              ? "Completed"
                              : "Current stage"
                            : isPast
                              ? "Completed"
                              : "Not reached yet"}
                        </p>
                        {index === 0 && (
                          <time>{formatDateTime(order.createdAt)}</time>
                        )}
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>

            <section
              className="tt-track-block"
              aria-labelledby="tt-track-purchase-title"
            >
              <div className="tt-cart-heading">
                <div>
                  <p className="tt-eyebrow tt-eyebrow--accent">Your purchase</p>
                  <h3 id="tt-track-purchase-title">Inside your order.</h3>
                </div>
                <span>
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </div>

              {items.length ? (
                <ul className="tt-track-items">
                  {items.map((item, index) => (
                    <li key={`${item.product || item._id || "item"}-${index}`}>
                      <ProductImage image={item.image} name={item.name} />
                      <div>
                        <h4>{item.name || "Ordered product"}</h4>
                        <span>Quantity: {item.quantity ?? "—"}</span>
                      </div>
                      <div>
                        <small>Unit price</small>
                        <strong>{formatMoney(item.price)}</strong>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="tt-track-muted">
                  Item details are not available for this order.
                </p>
              )}

              <div className="tt-track-total">
                <span>Order total</span>
                <strong>{formatMoney(order.totalAmount)}</strong>
              </div>
            </section>
          </div>
        )}
      </section>

      {/* SUPPORT */}
      <Reveal as="section" className="tt-wrap tt-closing tt-about-tight">
        <p className="tt-eyebrow tt-eyebrow--accent">We’re here to help</p>

        <h2>
          A question about
          <br />
          <em>your order?</em>
        </h2>

        <p className="tt-closing-note">
          If anything looks incorrect, our support team can help.
        </p>

        {supportHref ? (
          <a className="tt-button tt-button--dark" href={supportHref}>
            Contact support
            <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
          </a>
        ) : (
          <Link className="tt-button tt-button--dark" to="/contact">
            Contact support
            <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
          </Link>
        )}
      </Reveal>
    </>
  );
};

export default OrderTracking;