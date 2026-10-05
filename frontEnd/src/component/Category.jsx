import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ImageOff } from "lucide-react";

import { API_BASE_URL } from "../config";
import storeInfo from "../storeInfo";
import Reveal from "./Reveal";

const CATEGORY_CONFIG = [
  {
    id: "shoulder",
    name: "Shoulder Bags",
    image: "/Shoulder Bag.png",
    subtitle: "Close by, all day.",
    description:
      "Discover shoulder bags for everyday plans, evening outings, and everything in between.",
    mood: "For your daily rhythm",
    background: "#f0e9ee",
  },
  {
    id: "handbags",
    name: "Handbags",
    image: "/Handbags.png",
    subtitle: "A little presence.",
    description:
      "Explore handbags that bring your personal style into the everyday.",
    mood: "For a considered look",
    background: "#f7e8df",
  },
  {
    id: "totes",
    name: "Tote Bags",
    image: "/Tote Bags.png",
    subtitle: "Room for your day.",
    description:
      "Browse tote bags and find a shape that suits your routine, from workdays to weekends.",
    mood: "For fuller days",
    background: "#e9eee9",
  },
  {
    id: "crossbody",
    name: "Crossbody Bags",
    image: "/Crossbody Bags.png",
    subtitle: "Go your own way.",
    description:
      "Find a crossbody style for days on the move and plans that take you somewhere new.",
    mood: "For wherever you go",
    background: "#f3e6ea",
  },
];

const normalizeCategory = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const createShopLink = (categoryName) =>
  `/shop?category=${encodeURIComponent(categoryName)}`;

const pad = (number) => String(number).padStart(2, "0");

const CategoryImage = ({ src, name }) => {
  const [failedSource, setFailedSource] = useState(null);

  if (!src || failedSource === src) {
    return (
      <span className="tt-collection-fallback">
        <ImageOff size={38} strokeWidth={1.2} aria-hidden="true" />
        Collection image unavailable
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={`${name} collection`}
      loading="lazy"
      onError={() => setFailedSource(src)}
    />
  );
};

const Category = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const baseUrl = String(API_BASE_URL).replace(/\/+$/, "");

        const response = await fetch(`${baseUrl}/api/products`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load collection counts.");
        }

        const data = await response.json();

        if (controller.signal.aborted) return;

        const productList = Array.isArray(data)
          ? data
          : Array.isArray(data.products)
            ? data.products
            : null;

        if (!productList) {
          throw new Error("Unexpected product response.");
        }

        setProducts(productList);
      } catch {
        if (controller.signal.aborted) return;

        setError(
          "Collection counts are unavailable. You can still browse every category.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => controller.abort();
  }, [requestVersion]);

  const categories = useMemo(
    () =>
      CATEGORY_CONFIG.map((category) => ({
        ...category,
        count: products.filter(
          (product) =>
            normalizeCategory(product?.category) ===
            normalizeCategory(category.name),
        ).length,
      })),
    [products],
  );

  const totalProducts = categories.reduce(
    (total, category) => total + category.count,
    0,
  );

  const getCountText = (count) => {
    if (loading) return "Loading styles…";
    if (error) return "Explore collection";

    return `${count} ${count === 1 ? "style" : "styles"}`;
  };

  return (
    <>
      {/* OPENING */}
      <section className="tt-info-hero" data-index="04">
        <p className="tt-eyebrow">
          <span className="tt-eyebrow-dot" />
          {storeInfo.businessName} / The collection
        </p>

        <h1>
          Different shapes.
          <br />
          <em>Same you.</em>
        </h1>

        <p>
          Start with a silhouette. Find the piece that fits naturally into
          your day.
        </p>
      </section>

      {/* SILHOUETTES */}
      <section className="tt-wrap" aria-label="Explore bag categories">
        <Reveal className="tt-section-title">
          <div>
            <p className="tt-eyebrow tt-eyebrow--accent">
              Find your silhouette
            </p>
            <h2>
              What feels
              <br />
              <em>like you?</em>
            </h2>
          </div>

          <p>
            Choose a shape, then explore the collection.{" "}
            <Link to="/shop" className="tt-inline-link">
              Browse all bags
            </Link>
          </p>
        </Reveal>

        <div className="tt-collection-grid">
          {categories.map((category, index) => (
            <Reveal key={category.id} delay={(index % 2) * 110}>
              <Link
                to={createShopLink(category.name)}
                className="tt-collection-card"
                aria-label={`Explore ${category.name}`}
              >
                <span
                  className="tt-collection-art"
                  style={{ background: category.background }}
                >
                  <span className="tt-collection-ring" aria-hidden="true" />
                  <CategoryImage src={category.image} name={category.name} />

                  <span className="tt-product-index">
                    {pad(index + 1)} / {pad(categories.length)}
                  </span>
                  <span className="tt-collection-count">
                    {getCountText(category.count)}
                  </span>
                </span>

                <span className="tt-collection-copy">
                  <small>{category.mood}</small>

                  <span className="tt-collection-name">
                    <strong>{category.name}</strong>
                    <ArrowUpRight
                      size={28}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </span>

                  <em>{category.subtitle}</em>
                  <span>{category.description}</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        {error && (
          <div className="tt-note tt-collection-error" role="status">
            <p>{error}</p>

            <button
              type="button"
              className="tt-chip is-active"
              onClick={() => setRequestVersion((version) => version + 1)}
              disabled={loading}
            >
              {loading ? "Retrying…" : "Retry counts"}
            </button>
          </div>
        )}
      </section>

      {/* CLOSING */}
      <Reveal as="section" className="tt-wrap tt-closing tt-about-tight">
        <p className="tt-eyebrow tt-eyebrow--accent">
          A shape for every chapter
        </p>

        <h2>
          Make it an
          <br />
          <em>everyday favourite.</em>
        </h2>

        <p className="tt-closing-note">
          {loading
            ? "Discover the collection"
            : error
              ? "Four silhouettes to explore"
              : `${totalProducts} ${
                  totalProducts === 1 ? "style" : "styles"
                } across four silhouettes`}
        </p>

        <Link to="/shop" className="tt-button tt-button--dark">
          Shop the collection
          <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
        </Link>
      </Reveal>
    </>
  );
};

export default Category;