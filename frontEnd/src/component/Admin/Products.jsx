import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  ImageOff,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { API_BASE_URL } from "../../config";
import { BUSINESS_INFO } from "../../storeInfo";

const apiBase = String(API_BASE_URL || "").replace(/\/+$/, "");
const API_URL = `${apiBase}/api/products`;
const MAX_IMAGES = 4;

const CATEGORIES = [
  "Shoulder Bags",
  "Handbags",
  "Tote Bags",
  "Crossbody Bags",
  "Hobo Bags",
];

const INITIAL_FORM = {
  name: "",
  category: "Shoulder Bags",
  price: "",
  stock: "",
  sku: "",
  material: "",
  weight: "",
  description: "",
  isFeatured: false,
};

const getId = (product) => String(product?._id || product?.id || "");

const numeric = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numeric(value));

const timestamp = (value) => {
  const parsed = new Date(value || 0).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};

const getImageUrl = (image) => {
  if (typeof image !== "string" || !image.trim()) return "";

  const value = image.trim();

  return /^https?:\/\//i.test(value)
    ? value
    : `${apiBase}/${value.replace(/^\/+/, "")}`;
};

const getStatus = (product) => {
  const status = String(product.status || "").trim();

  if (["Active", "Low Stock", "Out of Stock"].includes(status)) {
    return status;
  }

  const stock = numeric(product.stock);
  return stock <= 0 ? "Out of Stock" : stock <= 5 ? "Low Stock" : "Active";
};

const authHeaders = () => {
  let token;

  try {
    token = localStorage.getItem(BUSINESS_INFO.storageKeys.token);
  } catch {
    throw new Error("Unable to access your login. Please sign in again.");
  }

  if (!token?.trim()) {
    throw new Error("Please sign in with an admin account.");
  }

  return { Authorization: `Bearer ${token}` };
};

const ProductImage = ({ image, name }) => {
  const src = getImageUrl(image);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return src && !failed ? (
    <img
      src={src}
      alt={name || "Product"}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
    />
  ) : (
    <ImageOff size={26} className="text-mauve" aria-hidden="true" />
  );
};

// Shared Tailwind class sets
const eyebrow =
  "text-[10px] font-extrabold uppercase tracking-[0.16em] text-mauve";
const fieldLabel =
  "mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink/55";
const control =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink transition-all duration-200 placeholder:text-ink/35 focus:border-mauve focus:outline-none focus:ring-4 focus:ring-mauve/15 aria-[invalid=true]:border-red-300";
const pillControl =
  "h-12 w-full rounded-full border border-line bg-white px-4 text-sm text-ink transition-all duration-200 focus:border-mauve focus:outline-none focus:ring-4 focus:ring-mauve/15";
const fieldError = "mt-1.5 text-xs font-semibold text-red-700";
const secondaryButton =
  "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border border-line bg-white px-5 text-xs font-extrabold transition-all duration-200 hover:-translate-y-0.5 hover:border-mauve hover:shadow-md disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none";
const primaryButton =
  "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-plum px-6 text-xs font-extrabold text-white shadow-lg shadow-plum/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-plum-dark disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50";
const panel = "rounded-3xl border border-line bg-white p-5 sm:p-7";

const STATUS_STYLES = {
  Active: "bg-emerald-50 text-emerald-700",
  "Low Stock": "bg-amber-50 text-amber-700",
  "Out of Stock": "bg-red-50 text-red-700",
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [fetchError, setFetchError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [featuredFilter, setFeaturedFilter] = useState("All");
  const [sortBy, setSortBy] = useState("latest");

  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [uploads, setUploads] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const formRef = useRef(null);
  const headingRef = useRef(null);
  const uploadUrls = useRef(new Set());
  const mountedRef = useRef(true);
  const mutationRef = useRef(null);
  const mutationLock = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      mutationRef.current?.abort();
      uploadUrls.current.forEach((url) => URL.revokeObjectURL(url));
      uploadUrls.current.clear();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const fetchProducts = async () => {
      setLoading(true);
      setFetchError("");

      try {
        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "Unable to load products.");
        }

        if (!Array.isArray(data.products)) {
          throw new Error("The products response is incomplete.");
        }

        if (active) {
          setProducts(
            data.products.filter(
              (product) =>
                product && typeof product === "object" && getId(product)
            )
          );
          setLoaded(true);
        }
      } catch (error) {
        if (active && error.name !== "AbortError") {
          setFetchError(error.message || "Unable to load products.");
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
  }, [refreshCount]);

  const categories = useMemo(
    () => [
      ...new Set([
        ...CATEGORIES,
        ...products.map((product) => product.category).filter(Boolean),
      ]),
    ],
    [products]
  );

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const result = products.filter((product) => {
      const text = [product.name, product.category, product.sku]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!query || text.includes(query)) &&
        (categoryFilter === "All" || product.category === categoryFilter) &&
        (statusFilter === "All" || getStatus(product) === statusFilter) &&
        (featuredFilter === "All" ||
          (featuredFilter === "Featured"
            ? product.isFeatured === true
            : product.isFeatured !== true))
      );
    });

    return result.sort((a, b) => {
      if (sortBy === "price-low") return numeric(a.price) - numeric(b.price);
      if (sortBy === "price-high") return numeric(b.price) - numeric(a.price);
      if (sortBy === "stock-low") return numeric(a.stock) - numeric(b.stock);
      if (sortBy === "featured") {
        return Number(b.isFeatured === true) - Number(a.isFeatured === true);
      }
      return timestamp(b.createdAt) - timestamp(a.createdAt);
    });
  }, [
    products,
    searchTerm,
    categoryFilter,
    statusFilter,
    featuredFilter,
    sortBy,
  ]);

  const releaseUploads = () => {
    uploadUrls.current.forEach((url) => URL.revokeObjectURL(url));
    uploadUrls.current.clear();
    setUploads([]);
  };

  const resetForm = () => {
    releaseUploads();
    setFormData(INITIAL_FORM);
    setErrors({});
  };

  const openCreate = () => {
    resetForm();
    setActionError("");
    setSuccessMessage("");
    setCreating(true);

    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const closeCreate = () => {
    if (mutationLock.current) return;

    resetForm();
    setCreating(false);
    setActionError("");

    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((current) => ({ ...current, [name]: "" }));
    setActionError("");
  };

  const handleImages = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (!files.length) return;

    let message = "";

    if (uploads.length + files.length > MAX_IMAGES) {
      message = `You can upload a maximum of ${MAX_IMAGES} images.`;
    } else if (
      files.some(
        (file) =>
          !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
            file.type
          )
      )
    ) {
      message = "Only JPG, JPEG, PNG and WEBP images are allowed.";
    } else if (files.some((file) => file.size > 5 * 1024 * 1024)) {
      message = "Each image must be 5MB or less.";
    }

    if (message) {
      setErrors((current) => ({ ...current, images: message }));
      return;
    }

    const additions = files.map((file) => {
      const url = URL.createObjectURL(file);
      uploadUrls.current.add(url);
      return { file, url };
    });

    setUploads((current) => [...current, ...additions]);
    setErrors((current) => ({ ...current, images: "" }));
  };

  const removeImage = (index) => {
    const upload = uploads[index];

    if (upload) {
      URL.revokeObjectURL(upload.url);
      uploadUrls.current.delete(upload.url);
    }

    setUploads((current) => current.filter((_, position) => position !== index));
    setErrors((current) => ({ ...current, images: "" }));
  };

  const validateForm = () => {
    const next = {};

    if (formData.name.trim().length < 3) {
      next.name = "Product name must be at least 3 characters.";
    }

    if (!formData.category) next.category = "Select a category.";

    if (
      formData.price === "" ||
      !Number.isFinite(Number(formData.price)) ||
      Number(formData.price) <= 0
    ) {
      next.price = "Enter a price greater than zero.";
    }

    if (
      formData.stock === "" ||
      !Number.isInteger(Number(formData.stock)) ||
      Number(formData.stock) < 0
    ) {
      next.stock = "Enter a whole stock quantity of zero or more.";
    }

    ["sku", "material", "weight"].forEach((field) => {
      if (!formData[field].trim()) {
        next[field] = `${field === "sku" ? "SKU" : field[0].toUpperCase() + field.slice(1)} is required.`;
      }
    });

    if (formData.description.trim().length < 10) {
      next.description = "Description must be at least 10 characters.";
    }

    if (!uploads.length) next.images = "Add at least one product image.";

    setErrors(next);

    const firstField = Object.keys(next)[0];

    if (firstField) {
      formRef.current?.elements.namedItem(firstField)?.focus();
      return false;
    }

    return true;
  };

  const createProduct = async (event) => {
    event.preventDefault();

    if (mutationLock.current || loading || !validateForm()) return;

    const controller = new AbortController();
    mutationRef.current = controller;
    mutationLock.current = true;
    setSubmitting(true);
    setActionError("");
    setSuccessMessage("");

    try {
      const body = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        body.append(
          key,
          typeof value === "string" ? value.trim() : String(value)
        );
      });

      uploads.forEach(({ file }) => body.append("images", file));

      const response = await fetch(API_URL, {
        method: "POST",
        headers: authHeaders(),
        signal: controller.signal,
        body,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to create product.");
      }

      if (!data.product || !getId(data.product)) {
        throw new Error(
          "The creation response is incomplete. Refresh inventory before trying again."
        );
      }

      if (!mountedRef.current) return;

      setProducts((current) => [
        data.product,
        ...current.filter((product) => getId(product) !== getId(data.product)),
      ]);

      resetForm();
      setCreating(false);
      setSuccessMessage("Product created successfully.");
    } catch (error) {
      if (mountedRef.current && error.name !== "AbortError") {
        setActionError(error.message || "Unable to create product.");
      }
    } finally {
      mutationLock.current = false;
      if (mountedRef.current) setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteProduct || mutationLock.current || loading) return;

    const productId = getId(deleteProduct);
    const controller = new AbortController();

    mutationRef.current = controller;
    mutationLock.current = true;
    setDeleting(true);
    setActionError("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(productId)}`,
        {
          method: "DELETE",
          headers: authHeaders(),
          signal: controller.signal,
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete product.");
      }

      if (!mountedRef.current) return;

      setProducts((current) =>
        current.filter((product) => getId(product) !== productId)
      );
      setDeleteProduct(null);
      setSuccessMessage("Product deleted successfully.");
    } catch (error) {
      if (mountedRef.current && error.name !== "AbortError") {
        setActionError(error.message || "Unable to delete product.");
      }
    } finally {
      mutationLock.current = false;
      if (mountedRef.current) setDeleting(false);
    }
  };

  const fields = [
    ["name", "Product name", "text", "Enter product name"],
    ["price", "Price (USD)", "number", "0.00"],
    ["stock", "Stock quantity", "number", "0"],
    ["sku", "SKU", "text", "TT-BAG-001"],
    ["material", "Material", "text", "Enter actual material"],
    ["weight", "Weight", "text", "Enter weight with unit"],
  ];

  const summary = {
    total: products.length,
    active: products.filter((product) => getStatus(product) === "Active").length,
    low: products.filter((product) => getStatus(product) === "Low Stock").length,
    out: products.filter((product) => getStatus(product) === "Out of Stock")
      .length,
    featured: products.filter((product) => product.isFeatured === true).length,
  };

  const hasFilters =
    searchTerm ||
    categoryFilter !== "All" ||
    statusFilter !== "All" ||
    featuredFilter !== "All" ||
    sortBy !== "latest";

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("All");
    setStatusFilter("All");
    setFeaturedFilter("All");
    setSortBy("latest");
  };

  return (
    <div>
      {/* HEADING */}
      <header className="flex flex-col gap-6 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={eyebrow}>{BUSINESS_INFO.businessName} / Inventory</p>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="mt-2 font-display text-5xl leading-none tracking-tight focus:outline-none sm:text-6xl"
          >
            {creating ? "A new addition." : "Your collection."}
          </h1>
          <p className="mt-3 text-sm text-ink/60">
            {creating
              ? "Add product details, stock and photography."
              : "Manage your products, inventory and featured pieces."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {creating ? (
            <button
              type="button"
              className={secondaryButton}
              onClick={closeCreate}
              disabled={submitting}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Back to inventory
            </button>
          ) : (
            <>
              <button
                type="button"
                className={secondaryButton}
                onClick={() => setRefreshCount((count) => count + 1)}
                disabled={loading || deleting}
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                  aria-hidden="true"
                />
                Refresh
              </button>
              <button
                type="button"
                className={primaryButton}
                onClick={openCreate}
                disabled={deleting}
              >
                <Plus size={17} aria-hidden="true" />
                Add product
              </button>
            </>
          )}
        </div>
      </header>

      {fetchError && (
        <div
          className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700"
          role="alert"
        >
          {fetchError}
        </div>
      )}

      {actionError && (
        <div
          className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700"
          role="alert"
        >
          {actionError}
        </div>
      )}

      <div role="status" aria-live="polite">
        {successMessage && (
          <p className="animate-fade-down mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700 [animation-duration:300ms]">
            {successMessage}
          </p>
        )}
      </div>

      {creating ? (
        /* ================= NEW PRODUCT FORM ================= */
        <form ref={formRef} onSubmit={createProduct} noValidate>
          <fieldset
            disabled={submitting}
            className="m-0 min-w-0 border-0 p-0 disabled:opacity-70"
          >
            <legend className="sr-only">New product details</legend>

            <div className="grid items-start gap-5 xl:grid-cols-[1.2fr_1fr]">
              <section className={panel}>
                <div className="mb-6 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lilac text-[11px] font-extrabold text-plum">
                    01
                  </span>
                  <h2 className="font-display text-3xl tracking-tight">
                    Product information
                  </h2>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  {fields.map(([name, label, type, placeholder]) => (
                    <div
                      key={name}
                      className={name === "name" ? "sm:col-span-2" : undefined}
                    >
                      <label htmlFor={`tt-products-${name}`} className={fieldLabel}>
                        {label}
                      </label>
                      <input
                        id={`tt-products-${name}`}
                        name={name}
                        type={type}
                        value={formData[name]}
                        onChange={handleChange}
                        placeholder={placeholder}
                        min={type === "number" ? 0 : undefined}
                        step={
                          name === "price"
                            ? "0.01"
                            : name === "stock"
                              ? "1"
                              : undefined
                        }
                        required
                        aria-invalid={Boolean(errors[name])}
                        aria-describedby={
                          errors[name] ? `tt-products-${name}-error` : undefined
                        }
                        className={control}
                      />
                      {errors[name] && (
                        <p id={`tt-products-${name}-error`} className={fieldError}>
                          {errors[name]}
                        </p>
                      )}
                    </div>
                  ))}

                  <div className="sm:col-span-2">
                    <label htmlFor="tt-products-category" className={fieldLabel}>
                      Category
                    </label>
                    <select
                      id="tt-products-category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      aria-invalid={Boolean(errors.category)}
                      className={control}
                    >
                      {categories.map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className={fieldError}>{errors.category}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="tt-products-description"
                      className={fieldLabel}
                    >
                      Description
                    </label>
                    <textarea
                      id="tt-products-description"
                      name="description"
                      rows={6}
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe the actual product and its details…"
                      required
                      aria-invalid={Boolean(errors.description)}
                      aria-describedby={
                        errors.description
                          ? "tt-products-description-error"
                          : undefined
                      }
                      className={`${control} resize-y leading-relaxed`}
                    />
                    {errors.description && (
                      <p
                        id="tt-products-description-error"
                        className={fieldError}
                      >
                        {errors.description}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section className={panel}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lilac text-[11px] font-extrabold text-plum">
                    02
                  </span>
                  <h2 className="font-display text-3xl tracking-tight">
                    Photography &amp; visibility
                  </h2>
                </div>

                <p className="text-sm leading-relaxed text-ink/60">
                  The first image is the main product image. Upload up to four
                  JPG, PNG or WEBP images, 5MB each.
                </p>

                {uploads.length > 0 && (
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {uploads.map((upload, index) => (
                      <div
                        key={upload.url}
                        className="animate-fade-down group relative aspect-square overflow-hidden rounded-2xl bg-lilac [animation-duration:300ms]"
                      >
                        <img
                          src={upload.url}
                          alt={`Product preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-plum">
                          {index === 0 ? "Main image" : `View ${index + 1}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          aria-label={`Remove image ${index + 1}`}
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink transition-all duration-200 hover:rotate-90 hover:bg-red-50 hover:text-red-700"
                        >
                          <X size={16} aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-5">
                  <label htmlFor="tt-products-images" className={fieldLabel}>
                    Product images · {uploads.length}/{MAX_IMAGES}
                  </label>
                  <input
                    id="tt-products-images"
                    name="images"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImages}
                    disabled={submitting || uploads.length >= MAX_IMAGES}
                    aria-invalid={Boolean(errors.images)}
                    aria-describedby={
                      errors.images ? "tt-products-images-error" : undefined
                    }
                    className="block w-full cursor-pointer rounded-2xl border border-dashed border-mauve/50 bg-lilac/40 p-3 text-sm text-ink/70 transition-colors file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-plum file:px-4 file:py-2.5 file:text-xs file:font-extrabold file:text-white hover:bg-lilac/70 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {errors.images && (
                    <p id="tt-products-images-error" className={fieldError}>
                      {errors.images}
                    </p>
                  )}
                </div>

                <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-line p-4 transition-colors hover:border-mauve hover:bg-lilac/30">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-plum"
                  />
                  <span>
                    <strong className="block text-sm">
                      Show in Featured Pieces
                    </strong>
                    <span className="mt-0.5 block text-xs leading-relaxed text-ink/60">
                      Keep this product in its category and also feature it on
                      the homepage.
                    </span>
                  </span>
                </label>

                <div className="mt-6 flex flex-wrap justify-end gap-2.5 border-t border-line pt-5">
                  <button
                    type="button"
                    className={secondaryButton}
                    onClick={closeCreate}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={primaryButton}
                    disabled={submitting || loading}
                  >
                    {submitting && (
                      <Loader2
                        size={17}
                        className="animate-spin"
                        aria-hidden="true"
                      />
                    )}
                    {submitting ? "Creating…" : "Create product"}
                  </button>
                </div>
              </section>
            </div>
          </fieldset>
        </form>
      ) : (
        /* ================= INVENTORY ================= */
        <>
          <section
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5"
            aria-label="Inventory totals"
          >
            {[
              ["Products", summary.total],
              ["Active", summary.active],
              ["Low stock", summary.low],
              ["Out of stock", summary.out],
              ["Featured", summary.featured],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-3xl border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-plum/10"
              >
                <span className={eyebrow}>{label}</span>
                <strong className="mt-1 block font-display text-4xl leading-tight tracking-tight">
                  {loaded ? value.toLocaleString() : "—"}
                </strong>
              </div>
            ))}
          </section>

          {/* SEARCH + FILTERS */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.6fr_1fr_1fr_1fr_1fr] xl:items-end">
            <div className="sm:col-span-2 xl:col-span-1">
              <label htmlFor="tt-products-search" className={fieldLabel}>
                Search by name, category or SKU
              </label>
              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mauve"
                  aria-hidden="true"
                />
                <input
                  id="tt-products-search"
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Name, category or SKU…"
                  className={`${pillControl} pl-11`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="tt-products-category-filter" className={fieldLabel}>
                Category
              </label>
              <select
                id="tt-products-category-filter"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className={pillControl}
              >
                <option>All</option>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tt-products-status-filter" className={fieldLabel}>
                Status
              </label>
              <select
                id="tt-products-status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className={pillControl}
              >
                <option>All</option>
                <option>Active</option>
                <option>Low Stock</option>
                <option>Out of Stock</option>
              </select>
            </div>

            <div>
              <label htmlFor="tt-products-featured-filter" className={fieldLabel}>
                Featured
              </label>
              <select
                id="tt-products-featured-filter"
                value={featuredFilter}
                onChange={(event) => setFeaturedFilter(event.target.value)}
                className={pillControl}
              >
                <option>All</option>
                <option>Featured</option>
                <option>Not featured</option>
              </select>
            </div>

            <div>
              <label htmlFor="tt-products-sort" className={fieldLabel}>
                Sort by
              </label>
              <select
                id="tt-products-sort"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className={pillControl}
              >
                <option value="latest">Newest</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="stock-low">Stock: low to high</option>
                <option value="featured">Featured first</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 text-xs font-semibold text-ink/55">
            <span role="status" aria-live="polite">
              {loading
                ? "Loading products…"
                : loaded
                  ? `${filteredProducts.length} of ${products.length} products`
                  : "Products unavailable"}
            </span>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="border-b border-mauve pb-0.5 font-extrabold text-plum"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* PRODUCT GRID */}
          <section className="mt-5" aria-label="Products" aria-busy={loading}>
            {loading && !loaded ? (
              <div
                className="flex min-h-60 flex-col items-center justify-center gap-4 rounded-3xl border border-line bg-white p-8 text-sm text-ink/60"
                role="status"
              >
                <Loader2
                  size={28}
                  className="animate-spin text-mauve"
                  aria-hidden="true"
                />
                <p>Loading your collection…</p>
              </div>
            ) : !loaded ? (
              <div className="rounded-3xl border border-line bg-white p-10 text-center text-sm text-ink/60">
                <p>Refresh to load your products.</p>
              </div>
            ) : !filteredProducts.length ? (
              <div className="rounded-3xl border border-line bg-white p-10 text-center text-sm text-ink/60">
                <p>
                  {products.length ? "No matching products." : "No products yet."}
                </p>
                {products.length > 0 ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className={`mt-5 ${primaryButton}`}
                  >
                    View all products
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={openCreate}
                    className={`mt-5 ${primaryButton}`}
                  >
                    <Plus size={17} aria-hidden="true" />
                    Add product
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredProducts.map((product) => {
                  const productId = getId(product);
                  const status = getStatus(product);

                  return (
                    <article
                      key={productId}
                      className="group overflow-hidden rounded-3xl border border-line bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-plum/10"
                    >
                      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-lilac">
                        <ProductImage
                          image={product.images?.[0]}
                          name={product.name}
                        />

                        <span
                          className={`absolute left-3 top-3 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider ${
                            STATUS_STYLES[status] || "bg-white text-ink/70"
                          }`}
                        >
                          {status}
                        </span>

                        {product.isFeatured === true && (
                          <span className="absolute right-3 top-3 rounded-full bg-plum px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                            Featured
                          </span>
                        )}
                      </div>

                      <div className="p-5">
                        <p className={eyebrow}>
                          {product.category || "Uncategorised"}
                        </p>
                        <h2 className="mt-1 truncate font-display text-2xl tracking-tight">
                          {product.name || "Product"}
                        </h2>
                        <p className="mt-0.5 truncate text-xs text-ink/50">
                          SKU: {product.sku || "—"}
                        </p>

                        <div className="mt-4 flex items-end justify-between gap-3 border-t border-line pt-4">
                          <div>
                            <strong className="block text-lg font-extrabold">
                              {money(product.price)}
                            </strong>
                            <span className="text-xs text-ink/55">
                              {numeric(product.stock)} in stock
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              to={`/shop/${encodeURIComponent(productId)}`}
                              aria-label={`View ${product.name || "product"} in the store`}
                              className="flex h-10 w-10 items-center justify-center rounded-full bg-lilac text-plum transition-all duration-200 hover:bg-plum hover:text-white"
                            >
                              <ArrowUpRight size={17} aria-hidden="true" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => {
                                setActionError("");
                                setSuccessMessage("");
                                setDeleteProduct(product);
                              }}
                              disabled={deleting || loading}
                              aria-label={`Delete ${product.name || "product"}`}
                              className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 transition-all duration-200 hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Trash2 size={16} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteProduct && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-plum-dark/55 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tt-products-delete-title"
          onClick={(event) => {
            if (event.target === event.currentTarget && !deleting) {
              setDeleteProduct(null);
            }
          }}
        >
          <div className="animate-fade-down w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl [animation-duration:250ms] sm:p-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 size={20} aria-hidden="true" />
            </span>

            <h2
              id="tt-products-delete-title"
              className="mt-4 font-display text-3xl tracking-tight"
            >
              Delete this product?
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-ink/65">
              <strong className="text-ink">
                {deleteProduct.name || "This product"}
              </strong>{" "}
              will be removed from your collection. This cannot be undone.
            </p>

            {actionError && (
              <p className="mt-3 text-xs font-semibold text-red-700" role="alert">
                {actionError}
              </p>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-2.5">
              <button
                type="button"
                className={secondaryButton}
                onClick={() => setDeleteProduct(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting || loading}
                className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-red-600 px-6 text-xs font-extrabold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-700 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting && (
                  <Loader2 size={17} className="animate-spin" aria-hidden="true" />
                )}
                {deleting ? "Deleting…" : "Delete product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;