import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ImageOff,
  Minus,
  Plus,
  RotateCcw,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";

import { useCart } from "./CartContext";
import { API_BASE_URL } from "../config";
import { BUSINESS_INFO } from "../storeInfo";
import Reveal from "./Reveal";

const apiBase = String(API_BASE_URL || "").replace(/\/+$/, "");

const getProductId = (product) =>
  String(product?._id || product?.id || "");

const getImageUrl = (image) => {
  if (typeof image !== "string" || !image.trim()) return "";

  const value = image.trim();

  return /^https?:\/\//i.test(value)
    ? value
    : `${apiBase}/${value.replace(/^\/+/, "")}`;
};

const formatPrice = (price) => {
  if (price === null || price === undefined || price === "") return "—";

  const value = Number(price);

  return Number.isFinite(value) && value >= 0
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value)
    : "—";
};

const ProductImage = ({ image, alt, thumbnail = false }) => {
  const src = getImageUrl(image);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return src && !failed ? (
    <img
      src={src}
      alt={alt}
      decoding="async"
      loading={thumbnail ? "lazy" : "eager"}
      onError={() => setFailed(true)}
    />
  ) : (
    <span className="tt-product-empty tt-shop-noimage">
      <ImageOff size={thumbnail ? 20 : 36} aria-hidden="true" />
      {!thumbnail && <span>Image unavailable</span>}
    </span>
  );
};

const ShopDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems = [] } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState("");

  const noticeTimer = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    clearTimeout(noticeTimer.current);
    setNotice("");
    setProduct(null);
    setActiveImage(0);
    setQuantity(1);
    setLoading(true);
    setErrorMessage("");

    const fetchProduct = async () => {
      try {
        if (!id) throw new Error("The product link is incomplete.");

        const response = await fetch(
          `${apiBase}/api/products/${encodeURIComponent(id)}`,
          { signal: controller.signal }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "Unable to load this product.");
        }

        if (
          !data.product ||
          typeof data.product !== "object" ||
          Array.isArray(data.product) ||
          !getProductId(data.product)
        ) {
          throw new Error("Product details are unavailable.");
        }

        if (active) setProduct(data.product);
      } catch (error) {
        if (active && error.name !== "AbortError") {
          setErrorMessage(error.message || "Unable to load this product.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      active = false;
      controller.abort();
    };
  }, [id, retryCount]);

  useEffect(() => {
    return () => clearTimeout(noticeTimer.current);
  }, []);

  const productId = getProductId(product);
  const rawStock = Number(product?.stock);
  const stock = Number.isFinite(rawStock)
    ? Math.max(0, Math.floor(rawStock))
    : 0;

  const inStock =
    stock > 0 &&
    String(product?.status || "").trim().toLowerCase() !== "out of stock";

  const alreadyInCart = cartItems.reduce((total, item) => {
    if (getProductId(item) !== productId) return total;

    const value = Number(item.quantity);
    return total + (Number.isFinite(value) ? Math.max(0, value) : 0);
  }, 0);

  const availableQuantity = inStock
    ? Math.max(0, Math.floor(stock - alreadyInCart))
    : 0;

  const selectedQuantity = availableQuantity
    ? Math.min(Math.max(1, quantity), availableQuantity)
    : 1;

  const canPurchase = Boolean(productId) && availableQuantity > 0;

  const images = Array.isArray(product?.images)
    ? product.images.filter(
        (image) => typeof image === "string" && image.trim()
      )
    : [];

  if (!images.length && typeof product?.image === "string") {
    if (product.image.trim()) images.push(product.image);
  }

  const imageIndex = Math.min(activeImage, Math.max(0, images.length - 1));

  const changeImage = (direction) => {
    if (images.length < 2) return;

    setActiveImage(
      (current) => (current + direction + images.length) % images.length
    );
  };

  const dismissNotice = () => {
    clearTimeout(noticeTimer.current);
    setNotice("");
  };

  const addSelectedItems = () => {
    if (!product || !canPurchase) return false;

    const cartProduct = {
      ...product,
      id: productId,
      price: Number(product.price),
      image: getImageUrl(images[0]),
    };

    // CartContext adds one unit per call.
    for (let index = 0; index < selectedQuantity; index += 1) {
      addToCart(cartProduct);
    }

    return true;
  };

  const handleAddToCart = () => {
    if (!addSelectedItems()) return;

    clearTimeout(noticeTimer.current);
    setNotice(
      `${selectedQuantity} ${
        selectedQuantity === 1 ? "item" : "items"
      } added to cart.`
    );
    setQuantity(1);

    noticeTimer.current = setTimeout(() => setNotice(""), 3000);
  };

  const handleBuyNow = () => {
    if (addSelectedItems()) navigate("/cart");
  };

  const specifications = [
    ["SKU", product?.sku],
    ["Material", product?.material],
    ["Weight", product?.weight],
  ];

  const pad = (number) => String(number).padStart(2, "0");

  return (
    <>
      <nav className="tt-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> / <Link to="/shop">The collection</Link>
        {product && (
          <>
            {" "}
            / <span>{product.name || "Product"}</span>
          </>
        )}
      </nav>

      <div className="tt-detail">
        {loading ? (
          <div className="tt-detail-layout" role="status">
            <span className="sr-only">Loading product details…</span>
            <div className="tt-skeleton tt-detail-skeleton" />
            <div>
              <div className="tt-skeleton tt-detail-line" style={{ width: "40%" }} />
              <div className="tt-skeleton tt-detail-line is-tall" />
              <div className="tt-skeleton tt-detail-line" style={{ width: "70%" }} />
            </div>
          </div>
        ) : errorMessage || !product ? (
          <div className="tt-state" role="alert">
            <ShoppingBag size={32} style={{ margin: "0 auto" }} aria-hidden="true" />
            <h1 className="tt-detail-state-title">Product unavailable</h1>
            <p>{errorMessage || "This product is currently unavailable."}</p>

            <div className="tt-detail-state-actions">
              <button
                type="button"
                className="tt-button tt-button--dark"
                onClick={() => setRetryCount((value) => value + 1)}
              >
                Try again
              </button>

              <Link to="/shop" className="tt-text-arrow">
                Browse the collection
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="tt-detail-layout">
              {/* GALLERY */}
              <section
                className="tt-detail-gallery"
                aria-label="Product image gallery"
              >
                <div className="tt-detail-image">
                  <div key={imageIndex} className="tt-detail-image-inner">
                    <ProductImage
                      image={images[imageIndex]}
                      alt={`${product.name || "Product"} — view ${imageIndex + 1}`}
                    />
                  </div>

                  {product.isFeatured && (
                    <span className="tt-product-index">Featured</span>
                  )}

                  {images.length > 1 && (
                    <div className="tt-detail-controls">
                      <button
                        type="button"
                        onClick={() => changeImage(-1)}
                        aria-label="Previous product image"
                      >
                        <ChevronLeft size={20} aria-hidden="true" />
                      </button>

                      <span aria-live="polite" aria-atomic="true">
                        {pad(imageIndex + 1)}
                        <span> / </span>
                        {pad(images.length)}
                      </span>

                      <button
                        type="button"
                        onClick={() => changeImage(1)}
                        aria-label="Next product image"
                      >
                        <ChevronRight size={20} aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="tt-detail-thumbs">
                    {images.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        className={imageIndex === index ? "is-active" : ""}
                        onClick={() => setActiveImage(index)}
                        aria-label={`Show product image ${index + 1}`}
                        aria-pressed={imageIndex === index}
                      >
                        <ProductImage image={image} alt="" thumbnail />
                      </button>
                    ))}
                  </div>
                )}

                <p className="tt-detail-caption">
                  <span>A closer look — every angle, every detail.</span>
                  <span>Explore the available product views.</span>
                </p>
              </section>

              {/* DETAILS + PURCHASE */}
              <section
                className="tt-detail-info"
                aria-labelledby="tt-detail-title"
              >
                <p className="tt-eyebrow tt-eyebrow--accent">
                  The collection / {product.category || "The collection"}
                </p>

                <h1 id="tt-detail-title">{product.name || "Product"}</h1>

                <div className="tt-detail-price">
                  <strong>{formatPrice(product.price)}</strong>
                  <span className={inStock ? "" : "is-out"}>
                    <i aria-hidden="true" />
                    {inStock ? "In stock" : "Out of stock"}
                  </span>
                </div>

                <p className="tt-detail-description">
                  {product.description || "A description has not been provided."}
                </p>

                <div className="tt-detail-buy">
                  <p className="tt-eyebrow">Make it yours</p>
                  <p className="tt-detail-buy-note">
                    Select your quantity and add this bag to your cart.
                  </p>

                  <div className="tt-detail-purchase">
                    <div
                      className="tt-quantity"
                      role="group"
                      aria-label="Quantity"
                    >
                      <button
                        type="button"
                        disabled={!canPurchase || selectedQuantity <= 1}
                        onClick={() =>
                          setQuantity(Math.max(1, selectedQuantity - 1))
                        }
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} aria-hidden="true" />
                      </button>

                      <span aria-live="polite">{selectedQuantity}</span>

                      <button
                        type="button"
                        disabled={
                          !canPurchase || selectedQuantity >= availableQuantity
                        }
                        onClick={() =>
                          setQuantity(
                            Math.min(availableQuantity, selectedQuantity + 1),
                          )
                        }
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} aria-hidden="true" />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="tt-detail-add"
                      disabled={!canPurchase}
                      onClick={handleAddToCart}
                    >
                      {!inStock
                        ? "Out of stock"
                        : !availableQuantity
                          ? "Available stock in cart"
                          : "Add to cart"}
                      <ShoppingBag size={18} aria-hidden="true" />
                    </button>
                  </div>

                  <button
                    type="button"
                    className="tt-button tt-button--outline tt-detail-now"
                    disabled={!canPurchase}
                    onClick={handleBuyNow}
                  >
                    Buy it now
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </button>

                  {inStock && !availableQuantity && (
                    <Link to="/cart" className="tt-text-arrow tt-detail-hint">
                      Review this item in your cart
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </Link>
                  )}
                </div>

                <div className="tt-detail-specs">
                  <h2>Product specifications</h2>

                  <dl>
                    {specifications.map(([label, value]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>
                          {value !== null &&
                          value !== undefined &&
                          String(value).trim()
                            ? String(value)
                            : "Not provided"}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </section>
            </div>

            {/* SHIPPING + RETURNS */}
            <section
              className="tt-card-grid tt-track-guide tt-detail-service"
              aria-label="Shipping and returns information"
            >
              <Reveal>
                <div className="tt-card tt-about-step">
                  <div>
                    <span>Shipping</span>
                    <Truck size={24} strokeWidth={1.4} aria-hidden="true" />
                  </div>
                  <h3>Free standard shipping</h3>
                  <p>On eligible orders within the contiguous United States.</p>
                </div>
              </Reveal>

              <Reveal delay={110}>
                <div className="tt-card tt-about-step">
                  <div>
                    <span>Processing</span>
                    <Clock3 size={24} strokeWidth={1.4} aria-hidden="true" />
                  </div>
                  <h3>1–2 business-day processing</h3>
                  <p>
                    Standard transit is generally 3–7 business days after
                    processing.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={220}>
                <div className="tt-card tt-about-step">
                  <div>
                    <span>Returns</span>
                    <RotateCcw size={24} strokeWidth={1.4} aria-hidden="true" />
                  </div>
                  <h3>30-day returns</h3>
                  <p>
                    Eligible items may be returned within 30 days of confirmed
                    delivery, in accordance with our Return and Refund Policy.
                  </p>
                </div>
              </Reveal>
            </section>

            {/* MORE */}
            <Reveal as="section" className="tt-closing tt-detail-more">
              <p className="tt-eyebrow tt-eyebrow--accent">
                {BUSINESS_INFO.businessName}
              </p>

              <h2>
                Find more <em>to fall for.</em>
              </h2>

              <Link to="/shop" className="tt-text-arrow">
                Explore the collection
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </Reveal>
          </>
        )}
      </div>

      {/* ADDED-TO-CART NOTICE */}
      <div
        className={`tt-toast${notice ? " is-visible" : ""}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {notice && (
          <>
            <Check size={18} aria-hidden="true" />
            <span>{notice}</span>
            <Link to="/cart">View cart</Link>
            <button
              type="button"
              onClick={dismissNotice}
              aria-label="Dismiss cart notification"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default ShopDetails;