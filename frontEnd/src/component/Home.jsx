import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUpRight, ImageOff, ShoppingBag } from "lucide-react";

import { API_BASE_URL } from "../config";
import storeInfo from "../storeInfo";
import Reveal from "./Reveal";

const SERVER_URL = API_BASE_URL.replace(/\/+$/, "");
const API_URL = `${SERVER_URL}/api/products`;

const FEATURED_COUNT = 6;

// The three shape cards. "search" is the category name the shop page is opened with.
const SHAPES = [
  {
    label: "01 / The evening edit",
    name: "Shoulder bags",
    search: "Shoulder Bags",
    image: "/images/shape-shoulder.webp",
    alt: "Lavender mini shoulder bag",
    tone: "",
  },
  {
    label: "02 / A lighter way",
    name: "Crossbody",
    search: "Crossbody Bags",
    image: "/images/shape-crossbody.webp",
    alt: "Burnt orange crossbody bag",
    tone: "tt-category-card--peach",
  },
  {
    label: "03 / The everyday edit",
    name: "Tote bags",
    search: "Tote Bags",
    image: "/images/shape-tote.webp",
    alt: "Sage green tote bag",
    tone: "tt-category-card--mint",
  },
];

const getProductId = (product) => product?._id || product?.id;

const getImageUrl = (image) => {
  if (typeof image !== "string" || !image.trim()) return "";

  const source = image.trim();

  if (/^https?:\/\//i.test(source)) return source;

  return `${SERVER_URL}/${source.replace(/^\/+/, "")}`;
};

const getCategory = (product) => {
  if (typeof product?.category === "string") return product.category;

  return product?.category?.name || "Handbag";
};

const getPriceValue = (product) => {
  const value = Number(product?.price);

  return Number.isFinite(value) ? value : 0;
};

const getPrice = (product) => {
  if (
    product?.price === null ||
    product?.price === undefined ||
    product?.price === ""
  ) {
    return "";
  }

  const value = Number(product.price);

  return Number.isFinite(value) ? `$${value.toFixed(2)}` : "";
};

const getName = (product) =>
  product?.name || `${storeInfo.businessName} Handbag`;

const pad = (number) => String(number).padStart(2, "0");

// Main image, with a second image that fades in on hover when there is one
const ProductImages = ({ product }) => {
  const main = getImageUrl(product?.images?.[0]);
  const second = getImageUrl(product?.images?.[1]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [main]);

  if (!main || failed) {
    return (
      <span
        className="tt-product-empty"
        role="img"
        aria-label="Product image unavailable"
      >
        <ImageOff size={34} strokeWidth={1.3} aria-hidden="true" />
      </span>
    );
  }

  return (
    <>
      <img
        src={main}
        alt={getName(product)}
        loading="lazy"
        onError={() => setFailed(true)}
      />

      {second && (
        <img
          src={second}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="tt-product-alt"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      )}
    </>
  );
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [activeFilter, setActiveFilter] = useState("all");
  const [sortMode, setSortMode] = useState("featured");

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load products.");
        }

        const data = await response.json();

        if (isMounted) {
          setProducts(Array.isArray(data?.products) ? data.products : []);
        }
      } catch (error) {
        if (isMounted && error.name !== "AbortError") {
          setProducts([]);
          setLoadError(
            "Products are temporarily unavailable. Please try again later.",
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // Newest products first
  const latestProducts = useMemo(
    () =>
      [...products]
        .filter((product) => getProductId(product))
        .sort((a, b) => {
          const dateA = new Date(a?.createdAt || 0).getTime() || 0;
          const dateB = new Date(b?.createdAt || 0).getTime() || 0;

          return dateB - dateA;
        })
        .slice(0, FEATURED_COUNT),
    [products],
  );

  const filters = useMemo(
    () => [...new Set(latestProducts.map(getCategory))],
    [latestProducts],
  );

  const visibleProducts = useMemo(() => {
    const list = latestProducts.filter(
      (product) =>
        activeFilter === "all" || getCategory(product) === activeFilter,
    );

    if (sortMode === "price-asc") {
      list.sort((a, b) => getPriceValue(a) - getPriceValue(b));
    }

    if (sortMode === "price-desc") {
      list.sort((a, b) => getPriceValue(b) - getPriceValue(a));
    }

    if (sortMode === "name") {
      list.sort((a, b) => getName(a).localeCompare(getName(b)));
    }

    return list;
  }, [latestProducts, activeFilter, sortMode]);

  return (
    <>
      {/* ================= HERO ================= */}

      <section className="tt-hero" aria-labelledby="tt-hero-title">
        <div className="tt-hero-copy">
          <p className="tt-eyebrow">
            <span className="tt-eyebrow-dot" />
            The bag edit / Vol. 01
          </p>

          <h1 id="tt-hero-title">
            Carry your
            <br />
            <em>own story.</em>
          </h1>

          <p>
            Find your way to carry. Explore shapes for your daily routines
            and the moments in between.
          </p>

          <div className="tt-hero-buttons">
            <Link to="/shop" className="tt-button tt-button--dark">
              Shop the collection
              <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
            </Link>

            <a href="#shapes" className="tt-button tt-button--outline">
              Find your shape
            </a>
          </div>

          <div className="tt-hero-foot">
            <span>
              {storeInfo.businessName} <i /> The new edit
            </span>
            <span>
              Scroll to discover
              <ArrowDown size={12} strokeWidth={2.4} aria-hidden="true" />
            </span>
          </div>
        </div>

        <div className="tt-hero-visual">
          <img
            src="/images/hero.webp"
            alt="Model carrying a lavender handbag in a luminous studio"
            width="1586"
            height="992"
            fetchPriority="high"
          />

          <span className="tt-hero-label">
            THE NEW
            <br />
            COLLECTION
          </span>
        </div>
      </section>

      {/* ================= VALUE ROW ================= */}

      <div className="tt-values">
        <span>
          <b>01</b> Designed to stand out
        </span>
        <span>
          <b>02</b> Made for everyday plans
        </span>
        <span>
          <b>03</b> A shape for every mood
        </span>
      </div>

      {/* ================= SHAPE GUIDE ================= */}

      <section
        className="tt-wrap"
        id="shapes"
        style={{ scrollMarginTop: 102 }}
      >
        <Reveal className="tt-section-title">
          <div>
            <p className="tt-eyebrow tt-eyebrow--accent">The shape guide / 01</p>
            <h2>
              Find your kind
              <br />
              of <em>carry.</em>
            </h2>
          </div>

          <p>Start with a silhouette that feels like you. The rest follows.</p>
        </Reveal>

        <div className="tt-category-grid">
          {SHAPES.map((shape, index) => (
            <Reveal key={shape.search} delay={index * 110}>
              <Link
                to={`/shop?category=${encodeURIComponent(shape.search)}`}
                className={`tt-category-card ${shape.tone}`}
              >
                <img
                  src={shape.image}
                  alt={shape.alt}
                  loading="lazy"
                  width="1254"
                  height="1254"
                />

                <span className="tt-category-copy">
                  <small>{shape.label.toUpperCase()}</small>
                  <strong>{shape.name}</strong>
                  <ArrowUpRight size={26} strokeWidth={1.6} aria-hidden="true" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= COLLECTION ================= */}

      <section className="tt-wrap tt-shop" id="collection">
        <Reveal className="tt-section-title">
          <div>
            <p className="tt-eyebrow tt-eyebrow--accent">The collection / 02</p>
            <h2>
              Meet the
              <br />
              <em>new icons.</em>
            </h2>
          </div>

          <p>Each bag has a personality. Find the one that matches yours.</p>
        </Reveal>

        {loading ? (
          <div className="tt-product-grid" role="status" aria-label="Loading products">
            {Array.from({ length: FEATURED_COUNT }).map((_, index) => (
              <div key={index} className="tt-skeleton" />
            ))}
          </div>
        ) : loadError ? (
          <div className="tt-state" role="alert">
            <p>{loadError}</p>

            <Link to="/shop" className="tt-button tt-button--dark">
              Visit shop
              <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
            </Link>
          </div>
        ) : latestProducts.length === 0 ? (
          <div className="tt-state">
            <ShoppingBag size={30} style={{ margin: "0 auto" }} aria-hidden="true" />
            <h3>Collection coming soon</h3>
            <p>
              Products are being prepared for the {storeInfo.businessName}{" "}
              collection. Please check back soon.
            </p>
          </div>
        ) : (
          <>
            <div className="tt-toolbar">
              <div className="tt-filters" role="group" aria-label="Filter products">
                <button
                  type="button"
                  className={`tt-chip${activeFilter === "all" ? " is-active" : ""}`}
                  aria-pressed={activeFilter === "all"}
                  onClick={() => setActiveFilter("all")}
                >
                  All {latestProducts.length}
                </button>

                {filters.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`tt-chip${activeFilter === category ? " is-active" : ""}`}
                    aria-pressed={activeFilter === category}
                    onClick={() => setActiveFilter(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <label className="tt-sort">
                Sort by
                <select
                  value={sortMode}
                  onChange={(event) => setSortMode(event.target.value)}
                >
                  <option value="featured">Newest</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </label>
            </div>

            <div className="tt-product-grid">
              {visibleProducts.map((product, index) => {
                const id = getProductId(product);
                const name = getName(product);

                return (
                  <Reveal
                    as="article"
                    key={id}
                    className="tt-product-card"
                    delay={(index % 3) * 90}
                  >
                    <div className="tt-product-media">
                      <Link to={`/shop/${id}`} aria-label={`View ${name}`}>
                        <ProductImages product={product} />
                      </Link>

                      <span className="tt-product-index">
                        {pad(index + 1)} / {pad(visibleProducts.length)}
                      </span>

                      <Link
                        to={`/shop/${id}`}
                        className="tt-quick-add"
                        tabIndex={-1}
                        aria-hidden="true"
                      >
                        View product ↗
                      </Link>
                    </div>

                    <div className="tt-product-meta">
                      <div>
                        <p>{getCategory(product)}</p>

                        <h3>
                          <Link to={`/shop/${id}`}>{name}</Link>
                        </h3>
                      </div>

                      {getPrice(product) && (
                        <strong>{getPrice(product)}</strong>
                      )}
                    </div>
                  </Reveal>
                );
              })}
            </div>

            <div className="tt-shop-more">
              <Link to="/shop" className="tt-text-arrow">
                View all products
                <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
              </Link>
            </div>
          </>
        )}
      </section>

      {/* ================= STORY PANEL ================= */}

      <section className="tt-story">
        <div className="tt-story-image">
          <img
            src="/images/shape-tote.webp"
            alt="Sage tote bag in a studio setting"
            loading="lazy"
            width="1254"
            height="1254"
          />
          <span>THE DETAILS / 03</span>
        </div>

        <Reveal className="tt-story-copy">
          <p className="tt-eyebrow">A little more you</p>

          <h2>
            Good design goes <em>where you go.</em>
          </h2>

          <p>
            Ways to take the day with you. Open any piece to see available
            options and its full details on the product page.
          </p>

          <Link to="/about" className="tt-button tt-button--light">
            Get to know {storeInfo.businessName}
            <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
          </Link>
        </Reveal>
      </section>

      {/* ================= CLOSING CTA ================= */}

      <Reveal as="section" className="tt-wrap tt-closing">
        <p className="tt-eyebrow tt-eyebrow--accent">Questions / 04</p>

        <h2>
          More to know?
          <br />
          <em>We've got you.</em>
        </h2>

        <Link to="/faqs" className="tt-text-arrow">
          Explore the FAQ
          <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
        </Link>
      </Reveal>
    </>
  );
};

export default Home;