import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  ImageOff,
  Loader2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import { API_BASE_URL } from "../../config";
import { BUSINESS_INFO } from "../../storeInfo";

const apiBase = String(API_BASE_URL || "").replace(/\/+$/, "");
const API_URL = `${apiBase}/api/orders`;

const STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const getId = (order) => String(order?._id || order?.id || "");

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

const formatDate = (value) =>
  value && timestamp(value)
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : "—";

const customerName = (order) => {
  const address = order.shippingAddress || {};
  const name = `${address.firstName || ""} ${address.lastName || ""}`.trim();

  return name || order.user?.name || "Guest";
};

const customerEmail = (order) =>
  order.shippingAddress?.email || order.user?.email || "";

const shippingAddress = (order) => {
  const address = order.shippingAddress || {};

  return [
    address.address,
    address.apartment,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
};

const orderItems = (order) =>
  Array.isArray(order?.items)
    ? order.items.filter((item) => item && typeof item === "object")
    : [];

const itemCount = (order) =>
  orderItems(order).reduce(
    (sum, item) => sum + Math.max(0, numeric(item.quantity)),
    0
  );

const orderStatus = (order) => {
  const raw = String(order.status || "").trim();

  if (raw.toLowerCase() === "canceled") return "Cancelled";

  return (
    STATUSES.find((status) => status.toLowerCase() === raw.toLowerCase()) ||
    raw ||
    "Unknown"
  );
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

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const ItemImage = ({ image }) => {
  const value = typeof image === "string" ? image.trim() : "";
  const src = value
    ? /^https?:\/\//i.test(value)
      ? value
      : `${apiBase}/${value.replace(/^\/+/, "")}`
    : "";

  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-lilac text-mauve">
      {src && !failed ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <ImageOff size={20} aria-hidden="true" />
      )}
    </div>
  );
};

// Shared Tailwind class sets
const eyebrow =
  "text-[10px] font-extrabold uppercase tracking-[0.16em] text-mauve";
const control =
  "h-12 w-full rounded-full border border-line bg-white px-4 text-sm text-ink transition-all duration-200 focus:border-mauve focus:outline-none focus:ring-4 focus:ring-mauve/15";
const fieldLabel =
  "mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink/55";
const detailTitle =
  "text-[10px] font-extrabold uppercase tracking-[0.16em] text-mauve";

const STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-700",
  Processing: "bg-lilac text-plum",
  Shipped: "bg-sky-50 text-sky-700",
  Delivered: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-red-50 text-red-700",
};

const Badge = ({ status }) => (
  <span
    className={`inline-block shrink-0 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider ${
      STATUS_STYLES[status] || "bg-lilac text-ink/70"
    }`}
  >
    {status}
  </span>
);

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [selectedId, setSelectedId] = useState("");
  const [draftStatus, setDraftStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [notice, setNotice] = useState("");

  const detailRef = useRef(null);
  const mountedRef = useRef(true);
  const mutationRef = useRef(null);
  const mutationLock = useRef(false);
  const selectionRef = useRef("");

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      mutationRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const fetchOrders = async () => {
      setLoading(true);
      setFetchError("");

      try {
        const response = await fetch(API_URL, {
          headers: authHeaders(),
          signal: controller.signal,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "Unable to load orders.");
        }

        if (!Array.isArray(data.orders)) {
          throw new Error("The orders response is incomplete.");
        }

        if (active) {
          setOrders(
            data.orders.filter(
              (order) => order && typeof order === "object" && getId(order)
            )
          );
          setLoaded(true);
        }
      } catch (error) {
        if (active && error.name !== "AbortError") {
          setFetchError(error.message || "Unable to load orders.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchOrders();

    return () => {
      active = false;
      controller.abort();
    };
  }, [refreshCount]);

  const selectedOrder = orders.find((order) => getId(order) === selectedId);

  const selectedStatus = selectedOrder ? orderStatus(selectedOrder) : "";

  useEffect(() => {
    setDraftStatus(selectedStatus);
  }, [selectedId, selectedStatus]);

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const result = orders.filter((order) => {
      const searchable = [
        order.orderNumber,
        customerName(order),
        customerEmail(order),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!query || searchable.includes(query)) &&
        (statusFilter === "All" || orderStatus(order) === statusFilter)
      );
    });

    return result.sort((a, b) => {
      if (sortBy === "Highest") {
        return numeric(b.totalAmount) - numeric(a.totalAmount);
      }

      if (sortBy === "Lowest") {
        return numeric(a.totalAmount) - numeric(b.totalAmount);
      }

      if (sortBy === "Items") return itemCount(b) - itemCount(a);

      return timestamp(b.createdAt) - timestamp(a.createdAt);
    });
  }, [orders, searchTerm, statusFilter, sortBy]);

  const summary = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((order) => orderStatus(order) === "Pending").length,
      processing: orders.filter(
        (order) => orderStatus(order) === "Processing"
      ).length,
      delivered: orders.filter(
        (order) => orderStatus(order) === "Delivered"
      ).length,
      value: orders
        .filter((order) => orderStatus(order) !== "Cancelled")
        .reduce((sum, order) => sum + numeric(order.totalAmount), 0),
    }),
    [orders]
  );

  const openOrder = (order) => {
    const orderId = getId(order);

    selectionRef.current = orderId;
    setSelectedId(orderId);
    setDraftStatus(orderStatus(order));
    setUpdateError("");
    setNotice("");

    requestAnimationFrame(() => {
      detailRef.current?.focus();

      if (window.matchMedia("(max-width: 1000px)").matches) {
        detailRef.current?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
          block: "start",
        });
      }
    });
  };

  const closeOrder = () => {
    selectionRef.current = "";
    setSelectedId("");
    setUpdateError("");
    setNotice("");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setSortBy("Newest");
  };

  const handleStatusUpdate = async (event) => {
    event.preventDefault();

    if (
      mutationLock.current ||
      loading ||
      !selectedOrder ||
      !STATUSES.includes(draftStatus) ||
      draftStatus === selectedStatus
    ) {
      return;
    }

    const orderId = getId(selectedOrder);
    const controller = new AbortController();

    mutationRef.current = controller;
    mutationLock.current = true;
    setUpdating(true);
    setUpdateError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(orderId)}/status`,
        {
          method: "PUT",
          headers: authHeaders(),
          signal: controller.signal,
          body: JSON.stringify({ status: draftStatus }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to update order status.");
      }

      if (!data.order || getId(data.order) !== orderId) {
        throw new Error(
          "The update response is incomplete. Refresh to check the current status."
        );
      }

      if (!mountedRef.current) return;

      setOrders((current) =>
        current.map((order) =>
          getId(order) === orderId ? data.order : order
        )
      );

      if (selectionRef.current === orderId) {
        setNotice("Order status updated successfully.");
      }
    } catch (error) {
      if (
        mountedRef.current &&
        error.name !== "AbortError" &&
        selectionRef.current === orderId
      ) {
        setUpdateError(error.message || "Unable to update order status.");
      }
    } finally {
      mutationLock.current = false;

      if (mountedRef.current) setUpdating(false);

      if (mutationRef.current === controller) {
        mutationRef.current = null;
      }
    }
  };

  const stats = [
    ["Total orders", summary.total],
    ["Pending", summary.pending],
    ["Processing", summary.processing],
    ["Delivered", summary.delivered],
  ];

  const filterOptions = [
    "All",
    ...STATUSES,
    ...new Set(
      orders.map(orderStatus).filter((status) => !STATUSES.includes(status))
    ),
  ];

  return (
    <div>
      {/* HEADING */}
      <header className="flex flex-col gap-6 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={eyebrow}>{BUSINESS_INFO.businessName} / Admin</p>
          <h1 className="mt-2 font-display text-5xl leading-none tracking-tight sm:text-6xl">
            Order <em className="font-normal text-mauve">desk.</em>
          </h1>
          <p className="mt-3 text-sm text-ink/60">
            Review purchases and manage fulfillment from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setRefreshCount((count) => count + 1)}
          disabled={loading || updating}
          className="inline-flex min-h-12 items-center gap-2.5 self-start rounded-full border border-line bg-white px-5 text-xs font-extrabold transition-all duration-200 hover:-translate-y-0.5 hover:border-mauve hover:shadow-md disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none sm:self-auto"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
            aria-hidden="true"
          />
          {loading ? "Loading…" : "Refresh orders"}
        </button>
      </header>

      {fetchError && (
        <div
          className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700"
          role="alert"
        >
          {fetchError}
          {loaded && (
            <p className="mt-1 font-normal">
              The list shows the last successfully loaded data.
            </p>
          )}
        </div>
      )}

      {/* TOTALS */}
      <section
        className="grid grid-cols-2 gap-3 lg:grid-cols-[repeat(4,minmax(0,1fr))_1.5fr]"
        aria-label="Order totals"
      >
        {stats.map(([label, value]) => (
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

        <div className="col-span-2 rounded-3xl bg-gradient-to-br from-plum via-[#7e5f80] to-[#b58186] p-5 text-white lg:col-span-1">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/70">
            Non-cancelled order value
          </span>
          <strong className="mt-1 block font-display text-4xl leading-tight tracking-tight">
            {loaded ? money(summary.value) : "—"}
          </strong>
        </div>
      </section>

      {/* SEARCH + FILTERS */}
      <div className="mt-6 grid gap-3 md:grid-cols-[1fr_200px_200px] md:items-end">
        <div>
          <label htmlFor="tt-orders-search" className={fieldLabel}>
            Search by order number, customer or email
          </label>
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mauve"
              aria-hidden="true"
            />
            <input
              id="tt-orders-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Order number, customer or email…"
              className={`${control} pl-11`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="tt-orders-status-filter" className={fieldLabel}>
            Status
          </label>
          <select
            id="tt-orders-status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={control}
          >
            {filterOptions.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tt-orders-sort" className={fieldLabel}>
            Sort by
          </label>
          <select
            id="tt-orders-sort"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className={control}
          >
            <option value="Newest">Newest</option>
            <option value="Highest">Highest value</option>
            <option value="Lowest">Lowest value</option>
            <option value="Items">Most units</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 text-xs font-semibold text-ink/55">
        <span role="status" aria-live="polite">
          {loading
            ? "Loading orders…"
            : loaded
              ? `${filteredOrders.length} of ${orders.length} orders`
              : "Orders unavailable"}
        </span>

        {(searchTerm || statusFilter !== "All" || sortBy !== "Newest") && (
          <button
            type="button"
            onClick={clearFilters}
            className="border-b border-mauve pb-0.5 font-extrabold text-plum"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* LIST + DETAILS */}
      <div className="mt-5 grid items-start gap-5 xl:grid-cols-[1.15fr_1fr]">
        <section
          className="space-y-3"
          aria-label="Customer orders"
          aria-busy={loading}
        >
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
              <p>Loading customer orders…</p>
            </div>
          ) : !loaded ? (
            <div className="rounded-3xl border border-line bg-white p-10 text-center text-sm text-ink/60">
              <p>Refresh to load your orders.</p>
            </div>
          ) : !filteredOrders.length ? (
            <div className="rounded-3xl border border-line bg-white p-10 text-center text-sm text-ink/60">
              <p>{orders.length ? "No matching orders." : "No orders yet."}</p>
              {orders.length > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 inline-flex min-h-11 items-center rounded-full bg-plum px-5 text-xs font-extrabold text-white transition-colors hover:bg-plum-dark"
                >
                  View all orders
                </button>
              )}
            </div>
          ) : (
            filteredOrders.map((order) => {
              const orderId = getId(order);
              const selected = selectedId === orderId;

              return (
                <article
                  key={orderId}
                  className={`rounded-3xl border bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-plum/10 ${
                    selected
                      ? "border-mauve shadow-lg shadow-plum/10 ring-4 ring-mauve/10"
                      : "border-line"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <strong className="truncate text-xs font-extrabold uppercase tracking-wider text-ink/60">
                      {order.orderNumber || "Order"}
                    </strong>
                    <Badge status={orderStatus(order)} />
                  </div>

                  <h2 className="mt-3 truncate font-display text-2xl tracking-tight">
                    {customerName(order)}
                  </h2>
                  <p className="truncate text-sm text-ink/55">
                    {customerEmail(order) || "Email not provided"}
                  </p>

                  <div className="mt-4 flex items-end justify-between gap-4 border-t border-line pt-4">
                    <div className="min-w-0">
                      <strong className="block text-lg font-extrabold">
                        {money(order.totalAmount)}
                      </strong>
                      <span className="text-xs text-ink/55">
                        {itemCount(order)} units · {formatDate(order.createdAt)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => openOrder(order)}
                      aria-label={`View ${order.orderNumber || "order"} details`}
                      aria-pressed={selected}
                      className={`group inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-xs font-extrabold transition-all duration-200 ${
                        selected
                          ? "bg-plum text-white"
                          : "bg-lilac text-plum hover:bg-plum hover:text-white"
                      }`}
                    >
                      Details
                      <ArrowUpRight
                        size={16}
                        className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </section>

        <section
          ref={detailRef}
          tabIndex={-1}
          aria-labelledby="tt-orders-detail-title"
          className="scroll-mt-24 overflow-hidden rounded-3xl border border-line bg-white focus:outline-none xl:sticky xl:top-24"
        >
          <div className="flex items-start justify-between gap-4 bg-gradient-to-r from-lilac via-[#f1dfe2] to-[#f6e5d5] p-5 sm:p-6">
            <div className="min-w-0">
              <p className={eyebrow}>Order details</p>
              <h2
                id="tt-orders-detail-title"
                className="mt-1.5 break-words font-display text-3xl leading-tight tracking-tight"
              >
                {selectedOrder?.orderNumber || "Review an order"}
              </h2>
            </div>

            {selectedId && (
              <button
                type="button"
                onClick={closeOrder}
                aria-label="Close order details"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/70 text-ink/70 transition-all duration-200 hover:rotate-90 hover:bg-white hover:text-ink"
              >
                <X size={19} aria-hidden="true" />
              </button>
            )}
          </div>

          {!selectedOrder ? (
            <div className="p-10 text-center text-sm leading-relaxed text-ink/60">
              <p>
                {selectedId
                  ? "This order is no longer in the loaded list."
                  : "Select Details on an order to review its items and shipping information."}
              </p>
            </div>
          ) : (
            <div key={selectedId} className="animate-fade-down space-y-6 p-5 [animation-duration:350ms] sm:p-6">
              <div className="flex items-center justify-between gap-4 text-sm text-ink/60">
                <span>{formatDate(selectedOrder.createdAt)}</span>
                <Badge status={selectedStatus} />
              </div>

              <form
                onSubmit={handleStatusUpdate}
                className="rounded-2xl bg-lilac/50 p-4"
              >
                <label htmlFor="tt-orders-update-status" className={fieldLabel}>
                  Fulfillment status
                </label>

                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <select
                    id="tt-orders-update-status"
                    value={draftStatus}
                    onChange={(event) => setDraftStatus(event.target.value)}
                    disabled={updating || loading}
                    className={`${control} disabled:opacity-60`}
                  >
                    {!STATUSES.includes(selectedStatus) && (
                      <option value={selectedStatus}>{selectedStatus}</option>
                    )}
                    {STATUSES.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    disabled={
                      updating ||
                      loading ||
                      draftStatus === selectedStatus ||
                      !STATUSES.includes(draftStatus)
                    }
                    className="h-12 shrink-0 rounded-full bg-plum px-6 text-xs font-extrabold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-plum-dark disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {updating ? "Saving…" : "Save status"}
                  </button>
                </div>

                {updateError && (
                  <p
                    className="mt-3 text-xs font-semibold text-red-700"
                    role="alert"
                  >
                    {updateError}
                  </p>
                )}

                <p
                  className="mt-3 text-xs font-semibold text-emerald-700 empty:hidden"
                  role="status"
                  aria-live="polite"
                >
                  {notice}
                </p>
              </form>

              <div>
                <h3 className={detailTitle}>Customer</h3>
                <div className="mt-2 space-y-0.5 text-sm leading-relaxed text-ink/75">
                  <p className="font-bold text-ink">
                    {customerName(selectedOrder)}
                  </p>
                  {customerEmail(selectedOrder) && (
                    <p className="break-words">{customerEmail(selectedOrder)}</p>
                  )}
                  {selectedOrder.shippingAddress?.phone && (
                    <p>{selectedOrder.shippingAddress.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className={detailTitle}>Shipping address</h3>
                <p className="mt-2 break-words text-sm leading-relaxed text-ink/75">
                  {shippingAddress(selectedOrder) || "Address not provided"}
                </p>
              </div>

              <div>
                <h3 className={detailTitle}>
                  Items · {itemCount(selectedOrder)} units
                </h3>

                {orderItems(selectedOrder).length ? (
                  <ul className="mt-2 divide-y divide-line">
                    {orderItems(selectedOrder).map((item, index) => (
                      <li
                        key={`${item.product || item._id || "item"}-${index}`}
                        className="flex items-center gap-4 py-3.5"
                      >
                        <ItemImage image={item.image} />

                        <div className="min-w-0 flex-1">
                          <strong className="block truncate text-sm">
                            {item.name || "Product"}
                          </strong>
                          <span className="text-xs text-ink/55">
                            {Math.max(0, numeric(item.quantity))} ×{" "}
                            {money(item.price)}
                          </span>
                        </div>

                        <strong className="shrink-0 text-sm">
                          {money(
                            numeric(item.price) *
                              Math.max(0, numeric(item.quantity)),
                          )}
                        </strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-ink/55">
                    No item details for this order.
                  </p>
                )}
              </div>

              <div className="flex items-baseline justify-between gap-4 border-t border-line pt-5">
                <span className={detailTitle}>Order total</span>
                <strong className="font-display text-4xl tracking-tight">
                  {money(selectedOrder.totalAmount)}
                </strong>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Orders;