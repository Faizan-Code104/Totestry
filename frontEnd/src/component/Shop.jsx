import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowUpRight,
  Check,
  ImageOff,
  Plus,
  Search,
  X,
} from "lucide-react";

import { useCart } from "./CartContext";
import { API_BASE_URL } from "../config";
import { BUSINESS_INFO } from "../storeInfo";
import Reveal from "./Reveal";

const apiBase = API_BASE_URL.replace(/\/+$/, "");

const getProductId = (product) => product?._id || product?.id || "";

const getImageUrl = (image) => {
  if (typeof image !== "string" || !image.trim()) return "";

  const value = image.trim();
  if (/^https?:\/\//i.test(value)) return value;

  return `${apiBase}/${value.replace(/^\/+/, "")}`;
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

const isUnavailable = (product) => {
  const stock = Number(product?.stock);
  return (
    !Number.isFinite(stock) ||
    stock <= 0 ||
    String(product?.status || "").toLowerCase() === "out of stock"
  );
};

const ProductImage = ({ image, name }) => {
  const [failed, setFailed] = useState(false);
  const src = getImageUrl(image);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return src && !failed ? (
    <img
      src={src}
      alt={name || `${BUSINESS_INFO.businessName} handbag`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  ) : (
    <span className="tt-product-empty tt-shop-noimage">
      <ImageOff size={30} strokeWidth={1.3} aria-hidden="true" />
      <span>Image unavailable</span>
    </span>
  );
};

const pad = (number) => String(number).padStart(2, "0");

const Shop = () => {
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = searchParams.get("category") || "All";

  // The header search opens this page as /shop?search=...
  const urlSearch = searchParams.get("search") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [sortBy, setSortBy] = useState("newest");
  const [cartNotice, setCartNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const fetchProducts = async () => {
      setLoading(true);
      setFetchError("");

      try {
        const response = await fetch(`${apiBase}/api/products`, {
          signal: controller.signal,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.message || "Unable to load products.");
        }

        if (!Array.isArray(data?.products)) {
          throw new Error("Product details are unavailable. Please try again.");
        }

        if (active) {
          setProducts(
            data.products.filter(
              (product) => product && typeof product === "object"
            )
          );
        }
      } catch (error) {
        if (active && error?.name !== "AbortError") {
          setFetchError(
            error?.message || "Unable to load products. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      active = false;
      controller.abort();
    };
  }, [retryCount]);

  // Keep the search box in step with the header search
  useEffect(() => {
    setSearchQuery(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    if (!cartNotice) return;
    const timer = setTimeout(() => setCartNotice(""), 2500);
    return () => clearTimeout(timer);
  }, [cartNotice]);

  const categories = useMemo(() => {
    const counts = new Map();

    products.forEach((product) => {
      const name = String(product.category || "").trim();
      if (!name || name.toLowerCase() === "all") return;

      const key = name.toLowerCase();
      const existing = counts.get(key);

      counts.set(key, {
        name: existing?.name || name,
        count: (existing?.count || 0) + 1,
      });
    });

    if (
      activeCategory.toLowerCase() !== "all" &&
      !counts.has(activeCategory.toLowerCase())
    ) {
      counts.set(activeCategory.toLowerCase(), {
        name: activeCategory,
        count: 0,
      });
    }

    return [
      { name: "All", count: products.length },
      ...counts.values(),
    ];
  }, [products, activeCategory]);

  const filteredProducts = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();

    const result = products.filter((product) => {
      const category = String(product.category || "").trim().toLowerCase();
      const searchable = [
        product.name,
        product.category,
        product.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (activeCategory.toLowerCase() === "all" ||
          category === activeCategory.trim().toLowerCase()) &&
        (!search || searchable.includes(search))
      );
    });

    const price = (product) => {
      const value = Number(product.price);
      return Number.isFinite(value) ? value : 0;
    };

    const date = (product) => {
      const value = new Date(product.createdAt || 0).getTime();
      return Number.isFinite(value) ? value : 0;
    };

    return result.sort((a, b) => {
      if (sortBy === "price-low") return price(a) - price(b);
      if (sortBy === "price-high") return price(b) - price(a);
      if (sortBy === "name-az") {
        return String(a.name || "").localeCompare(String(b.name || ""));
      }
      return date(b) - date(a);
    });
  }, [products, activeCategory, searchQuery, sortBy]);

  const selectCategory = (category) => {
    const nextParams = new URLSearchParams(searchParams);

    if (category === "All") {
      nextParams.delete("category");
    } else {
      nextParams.set("category", category);
    }

    setSearchParams(nextParams, { preventScrollReset: true });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSortBy("newest");

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("category");
    nextParams.delete("search");

    setSearchParams(nextParams, { preventScrollReset: true });
  };

  const handleAddToCart = (product) => {
    const id = getProductId(product);
    if (!id || isUnavailable(product)) return;

    addToCart({
      ...product,
      id,
      image: getImageUrl(product.images?.[0]),
    });

    setCartNotice(`${product.name || "Product"} added to cart.`);
  };

  const isAll = activeCategory.toLowerCase() === "all";

  return (
    <>
      {/* OPENING + SEARCH */}
      <section className="tt-info-hero" data-index={pad(products.length)}>
        <p className="tt-eyebrow">
          <span className="tt-eyebrow-dot" />
          {BUSINESS_INFO.businessName} / The collection / Find your favourite
        </p>

        <h1>
          The bag <em>edit.</em>
        </h1>

        <p>
          A style for your everyday routine. Explore the collection and make
          it yours.
        </p>

        <label className="tt-faq-search" htmlFor="tt-shop-search">
          <Search size={20} strokeWidth={1.6} aria-hidden="true" />
          <span className="sr-only">Search products</span>
          <input
            id="tt-shop-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Find a bag…"
            autoComplete="off"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}
        </label>
      </section>

      <section
        id="tt-shop-products"
        className="tt-wrap tt-shop-page"
        aria-labelledby="tt-shop-title"
        aria-busy={loading}
      >
        <div className="tt-section-title">
          <div>
            <p className="tt-eyebrow tt-eyebrow--accent">
              {BUSINESS_INFO.businessName}
            </p>
            <h2 id="tt-shop-title">
              {isAll ? (
                <>
                  Everyday,
                  <br />
                  <em>beautifully.</em>
                </>
              ) : (
                activeCategory
              )}
            </h2>
          </div>

          <p role="status" aria-live="polite" aria-atomic="true">
            {loading
              ? "Loading collection…"
              : fetchError
                ? "Collection unavailable"
                : `${filteredProducts.length} ${
                    filteredProducts.length === 1 ? "product" : "products"
                  }`}
          </p>
        </div>

        {/* CATEGORIES + SORT */}
        <div className="tt-toolbar">
          <nav className="tt-filters" aria-label="Product categories">
            {categories.map((category) => {
              const selected =
                activeCategory.toLowerCase() === category.name.toLowerCase();

              return (
                <button
                  key={category.name}
                  type="button"
                  onClick={() => selectCategory(category.name)}
                  aria-pressed={selected}
                  aria-controls="tt-shop-products"
                  className={`tt-chip${selected ? " is-active" : ""}`}
                >
                  {category.name === "All" ? "All bags" : category.name}{" "}
                  <span>{loading ? "…" : category.count}</span>
                </button>
              );
            })}
          </nav>

          <label className="tt-sort">
            Sort by
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-az">Name: A to Z</option>
            </select>
          </label>
        </div>

        {(searchQuery || !isAll) && (
          <div className="tt-shop-summary">
            <span>
              {isAll ? "All bags" : activeCategory}
              {searchQuery && ` / “${searchQuery}”`}
            </span>
            <button type="button" onClick={clearFilters}>
              Clear filters <X size={14} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* PRODUCTS */}
        {loading ? (
          <div className="tt-product-grid tt-shop-grid" role="status">
            <span className="sr-only">Loading your next favourite…</span>
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="tt-skeleton" />
            ))}
          </div>
        ) : fetchError ? (
          <div className="tt-state" role="alert">
            <h3>We couldn’t load the collection.</h3>
            <p>{fetchError}</p>
            <button
              className="tt-button tt-button--dark"
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
            >
              Try again
            </button>
          </div>
        ) : filteredProducts.length ? (
          <div className="tt-product-grid tt-shop-grid">
            {filteredProducts.map((product, index) => {
              const id = getProductId(product);
              const unavailable = isUnavailable(product);
              const productLink = `/shop/${encodeURIComponent(id)}`;
              const name = product.name || "Product";

              const imageContent = (
                <ProductImage image={product.images?.[0]} name={product.name} />
              );

              return (
                <Reveal
                  as="article"
                  key={id || `product-${index}`}
                  className={`tt-product-card${unavailable ? " is-unavailable" : ""}`}
                  delay={(index % 4) * 70}
                >
                  <div className="tt-product-media">
                    {id ? (
                      <Link
                        to={productLink}
                        aria-label={`View ${product.name || "product"}`}
                      >
                        {imageContent}
                      </Link>
                    ) : (
                      imageContent
                    )}

                    <span className="tt-product-index">
                      {pad(index + 1)} / {pad(filteredProducts.length)}
                    </span>

                    {unavailable ? (
                      <span className="tt-product-badge">Out of stock</span>
                    ) : product.status && product.status !== "Active" ? (
                      <span className="tt-product-badge">{product.status}</span>
                    ) : null}

                    <button
                      type="button"
                      className="tt-quick-add"
                      disabled={unavailable || !id}
                      onClick={() => handleAddToCart(product)}
                      aria-label={
                        unavailable
                          ? `${name} is out of stock`
                          : `Add ${product.name || "product"} to cart`
                      }
                    >
                      {unavailable ? (
                        "Out of stock"
                      ) : (
                        <>
                          <Plus
                            size={14}
                            strokeWidth={2.4}
                            style={{ display: "inline", verticalAlign: "-2px" }}
                            aria-hidden="true"
                          />{" "}
                          Add to cart
                        </>
                      )}
                    </button>
                  </div>

                  <div className="tt-product-meta">
                    <div>
                      <p>{product.category || "The collection"}</p>
                      <h3>
                        {id ? <Link to={productLink}>{name}</Link> : name}
                      </h3>
                      <span className="tt-shop-stock">
                        {unavailable ? "Out of stock" : "In stock"}
                      </span>
                    </div>

                    <strong>{formatPrice(product.price)}</strong>
                  </div>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <div className="tt-state">
            <Search size={30} style={{ margin: "0 auto" }} aria-hidden="true" />
            <h3>No matching bags.</h3>
            <p>Try another keyword or browse the full collection.</p>
            <button
              type="button"
              className="tt-button tt-button--dark"
              onClick={clearFilters}
            >
              View all products
            </button>
          </div>
        )}
      </section>

      {/* GUIDANCE */}
      <Reveal as="section" className="tt-wrap tt-closing tt-about-tight">
        <p className="tt-eyebrow tt-eyebrow--accent">A little guidance</p>

        <h2>
          A little style,
          <br />
          <em>wherever the day takes you.</em>
        </h2>

        <p className="tt-closing-note">
          Review each product page for its current details and specifications.
        </p>

        <Link to="/contact" className="tt-text-arrow">
          Ask our team
          <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
        </Link>
      </Reveal>

      {/* ADDED-TO-CART NOTICE */}
      <div
        className={`tt-toast${cartNotice ? " is-visible" : ""}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {cartNotice && (
          <>
            <Check size={18} aria-hidden="true" />
            <span>{cartNotice}</span>
            <Link to="/cart">View cart</Link>
          </>
        )}
      </div>
    </>
  );
};

export default Shop;