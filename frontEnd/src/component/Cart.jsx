import React, { useState } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ImageOff,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useCart } from "./CartContext";
import storeInfo from "../storeInfo";
import Reveal from "./Reveal";

const formatPrice = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);

const pad = (number) => String(number).padStart(2, "0");

const CartImage = ({ src, name }) => {
  const [failedSource, setFailedSource] = useState(null);

  if (!src || failedSource === src) {
    return (
      <span className="tt-product-empty">
        <ImageOff size={30} strokeWidth={1.2} aria-hidden="true" />
        <span className="tt-cart-noimage">Image unavailable</span>
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={name || "Handbag"}
      loading="lazy"
      onError={() => setFailedSource(src)}
    />
  );
};

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartSubtotal } =
    useCart();

  const items = cartItems || [];

  const getQuantity = (item) =>
    Math.max(1, Math.floor(Number(item.quantity) || 1));

  const totalItems = items.reduce(
    (total, item) => total + getQuantity(item),
    0,
  );

  const subtotal = Number(cartSubtotal) || 0;
  const shipping = 0;
  const total = subtotal + shipping;

  const handleQuantity = (item, change) => {
    updateQuantity(item.id, Math.max(1, getQuantity(item) + change));
  };

  /* ================= EMPTY CART ================= */

  if (items.length === 0) {
    return (
      <>
        <section className="tt-info-hero" data-index="0">
          <p className="tt-eyebrow">
            <span className="tt-eyebrow-dot" />
            Your collection starts here
          </p>

          <h1>
            Find your
            <br />
            <em>everyday muse.</em>
          </h1>

          <p>
            Your cart is empty. Discover the pieces that fit your routine,
            your plans, and your personal style.
          </p>

          <div className="tt-hero-buttons" style={{ marginTop: 30 }}>
            <Link to="/shop" className="tt-button tt-button--dark">
              Explore handbags
              <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <div style={{ height: 90 }} />
      </>
    );
  }

  /* ================= CART WITH ITEMS ================= */

  return (
    <>
      <section className="tt-info-hero tt-cart-hero" data-index={pad(totalItems)}>
        <Link to="/shop" className="tt-cart-back">
          <ChevronLeft size={16} aria-hidden="true" />
          Back to collection
        </Link>

        <p className="tt-eyebrow">
          <span className="tt-eyebrow-dot" />
          The pieces you picked
        </p>

        <h1>
          Your <em>cart.</em>
        </h1>

        <p>
          <strong>{totalItems}</strong>
          {totalItems === 1 ? " piece" : " pieces"} — your favourites,
          together in one place.
        </p>
      </section>

      <div className="tt-cart">
        {/* ITEMS */}
        <section aria-labelledby="tt-cart-title">
          <div className="tt-cart-heading">
            <h2 id="tt-cart-title">Your selection</h2>
            <span>
              {items.length} {items.length === 1 ? "style" : "styles"}
            </span>
          </div>

          {items.map((item, index) => {
            const quantity = getQuantity(item);

            return (
              <Reveal
                as="article"
                key={item.id}
                className="tt-cart-item"
                delay={Math.min(index, 5) * 70}
              >
                <Link
                  to={`/shop/${item.id}`}
                  className="tt-cart-thumb"
                  aria-label={`View ${item.name}`}
                >
                  <CartImage src={item.image} name={item.name} />
                  <span className="tt-product-index" aria-hidden="true">
                    {pad(index + 1)}
                  </span>
                </Link>

                <div className="tt-cart-info">
                  <p className="tt-cart-category">
                    {item.category || `${storeInfo.businessName} collection`}
                  </p>

                  <h3>
                    <Link to={`/shop/${item.id}`}>{item.name}</Link>
                  </h3>

                  <p className="tt-cart-each">
                    {formatPrice(item.price)} each
                  </p>

                  <div className="tt-cart-controls">
                    <div
                      className="tt-quantity"
                      role="group"
                      aria-label={`Quantity of ${item.name}`}
                    >
                      <button
                        type="button"
                        disabled={quantity <= 1}
                        onClick={() => handleQuantity(item, -1)}
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        <Minus size={14} aria-hidden="true" />
                      </button>

                      <span aria-live="polite" aria-atomic="true">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleQuantity(item, 1)}
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        <Plus size={14} aria-hidden="true" />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="tt-cart-remove"
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 size={15} strokeWidth={1.6} aria-hidden="true" />
                      Remove
                    </button>
                  </div>
                </div>

                <div className="tt-cart-line">
                  <span>Item total</span>
                  <strong>{formatPrice(Number(item.price) * quantity)}</strong>
                </div>
              </Reveal>
            );
          })}

          <Link to="/shop" className="tt-cart-more">
            <span>
              <small>There is more to discover</small>
              <strong>Find another favourite.</strong>
            </span>
            <ArrowUpRight size={26} strokeWidth={1.4} aria-hidden="true" />
          </Link>
        </section>

        {/* SUMMARY */}
        <aside className="tt-cart-summary">
          <p className="tt-eyebrow">Ready when you are</p>

          <h2>
            Make them <em>yours.</em>
          </h2>

          <dl>
            <div>
              <dt>
                Subtotal · {totalItems} {totalItems === 1 ? "item" : "items"}
              </dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>

            <div>
              <dt>Shipping</dt>
              <dd>Free</dd>
            </div>
          </dl>

          <div className="tt-cart-total" aria-live="polite" aria-atomic="true">
            <span>Order total</span>
            <strong>{formatPrice(total)}</strong>
          </div>

          <Link to="/checkout" className="tt-button tt-button--light">
            Proceed to checkout
            <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
          </Link>

          <p className="tt-cart-note">
            Review your items and quantities before checkout.
          </p>

          <div className="tt-cart-delivery">
            <Truck size={22} strokeWidth={1.4} aria-hidden="true" />
            <div>
              <strong>Free U.S. shipping</strong>
              <p>No shipping charge added to this order.</p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Cart;