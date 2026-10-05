import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Loader2,
  Package,
  RefreshCw,
  ShoppingCart,
  Users,
} from "lucide-react";

import { API_BASE_URL } from "../../config";
import { BUSINESS_INFO } from "../../storeInfo";

const apiBase = String(API_BASE_URL || "").replace(/\/+$/, "");

const STATUS_ORDER = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const number = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(number(value));

const timestamp = (value) => {
  const date = new Date(value || 0).getTime();
  return Number.isFinite(date) ? date : 0;
};

const formatDate = (value) => {
  if (!value || !timestamp(value)) return "—";

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const getId = (value) => {
  if (value && typeof value === "object") {
    return String(value._id || value.id || "");
  }

  return value ? String(value) : "";
};

const getStatus = (order) => {
  const raw = String(order.status || "").trim();
  return (
    STATUS_ORDER.find(
      (status) => status.toLowerCase() === raw.toLowerCase()
    ) || raw || "Unknown"
  );
};

const isCancelled = (order) =>
  ["cancelled", "canceled"].includes(
    String(order.status || "").trim().toLowerCase()
  );

const getImageUrl = (image) => {
  if (typeof image !== "string" || !image.trim()) return "";

  const value = image.trim();

  return /^https?:\/\//i.test(value)
    ? value
    : `${apiBase}/${value.replace(/^\/+/, "")}`;
};

const getCustomer = (order) => {
  const address = order.shippingAddress || {};
  const name = `${address.firstName || ""} ${address.lastName || ""}`.trim();

  return name || order.user?.name || "Guest";
};

const getOrderSummary = (order) => {
  const items = Array.isArray(order.items) ? order.items : [];

  if (!items.length) return "No item details";

  const firstName = items[0]?.name || "Product";

  return items.length > 1
    ? `${firstName} +${items.length - 1} more`
    : firstName;
};

const getChange = (current, previous) => {
  if (previous === 0) {
    return current > 0
      ? "No previous-month baseline"
      : "No change this month";
  }

  const change = ((current - previous) / previous) * 100;

  return `${change > 0 ? "+" : ""}${change.toFixed(1)}% vs. previous month`;
};

const ProductThumbnail = ({ image, rank }) => {
  const src = getImageUrl(image);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-lilac text-xs font-extrabold text-mauve">
      {src && !failed ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{String(rank).padStart(2, "0")}</span>
      )}
    </div>
  );
};

// Shared Tailwind class sets
const eyebrow =
  "text-[10px] font-extrabold uppercase tracking-[0.16em] text-mauve";
const panel = "rounded-3xl border border-line bg-white p-5 sm:p-7";
const panelTitle = "mt-1.5 font-display text-2xl tracking-tight sm:text-3xl";

const STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-700",
  Processing: "bg-lilac text-plum",
  Shipped: "bg-sky-50 text-sky-700",
  Delivered: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-red-50 text-red-700",
};

const statusClass = (status) =>
  STATUS_STYLES[status] || "bg-lilac text-ink/70";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const fetchDashboard = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        let token;

        try {
          token = localStorage.getItem(BUSINESS_INFO.storageKeys.token);
        } catch {
          throw new Error("Unable to access your login. Please sign in again.");
        }

        if (!token?.trim()) {
          throw new Error("Please sign in with an admin account.");
        }

        const headers = { Authorization: `Bearer ${token}` };

        const results = await Promise.allSettled(
          ["products", "orders", "users"].map(async (resource) => {
            const response = await fetch(`${apiBase}/api/${resource}`, {
              headers,
              signal: controller.signal,
            });

            const body = await response.json().catch(() => ({}));

            if (!response.ok) {
              throw new Error(
                body.message ||
                  (response.status === 401 || response.status === 403
                    ? "Your admin access could not be verified. Please sign in again."
                    : `Unable to load ${resource}.`)
              );
            }

            if (!Array.isArray(body[resource])) {
              throw new Error(`The ${resource} response is incomplete.`);
            }

            return body[resource].filter(
              (item) => item && typeof item === "object"
            );
          })
        );

        const failed = results.find((result) => result.status === "rejected");
        if (failed) throw failed.reason;

        if (active) {
          setData({
            products: results[0].value,
            orders: results[1].value,
            users: results[2].value,
            updatedAt: new Date(),
          });
        }
      } catch (error) {
        if (active && error.name !== "AbortError") {
          setErrorMessage(error.message || "Unable to load dashboard data.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDashboard();

    return () => {
      active = false;
      controller.abort();
    };
  }, [refreshCount]);

  const overview = useMemo(() => {
    if (!data) return null;

    const { orders, products, users, updatedAt } = data;
    const year = updatedAt.getFullYear();
    const month = updatedAt.getMonth();
    const previous = new Date(year, month - 1, 1);

    const inMonth = (item, targetYear, targetMonth) => {
      if (!item.createdAt || !timestamp(item.createdAt)) return false;

      const date = new Date(item.createdAt);

      return (
        date.getFullYear() === targetYear &&
        date.getMonth() === targetMonth
      );
    };

    const countCurrent = (items) =>
      items.filter((item) => inMonth(item, year, month)).length;

    const countPrevious = (items) =>
      items.filter((item) =>
        inMonth(item, previous.getFullYear(), previous.getMonth())
      ).length;

    const eligibleOrders = orders.filter((order) => !isCancelled(order));
    const customers = users.filter(
      (user) => String(user.role || "").toLowerCase() !== "admin"
    );

    const totalValue = eligibleOrders.reduce(
      (sum, order) => sum + number(order.totalAmount),
      0
    );

    const currentValue = eligibleOrders
      .filter((order) => inMonth(order, year, month))
      .reduce((sum, order) => sum + number(order.totalAmount), 0);

    const previousValue = eligibleOrders
      .filter((order) =>
        inMonth(order, previous.getFullYear(), previous.getMonth())
      )
      .reduce((sum, order) => sum + number(order.totalAmount), 0);

    const months = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(year, month - 11 + index, 1);

      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        year: date.getFullYear(),
        month: date.getMonth(),
        label: date.toLocaleDateString("en-US", { month: "short" }),
        fullLabel: date.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        value: 0,
      };
    });

    eligibleOrders.forEach((order) => {
      if (!order.createdAt || !timestamp(order.createdAt)) return;

      const date = new Date(order.createdAt);
      const bucket = months.find(
        (item) =>
          item.year === date.getFullYear() &&
          item.month === date.getMonth()
      );

      if (bucket) bucket.value += number(order.totalAmount);
    });

    const maxValue = Math.max(...months.map((item) => item.value), 1);
    const periodValue = months.reduce((sum, item) => sum + item.value, 0);

    const statusNames = [
      ...STATUS_ORDER,
      ...new Set(
        orders.map(getStatus).filter((status) => !STATUS_ORDER.includes(status))
      ),
    ];

    const statuses = statusNames.map((status) => {
      const count = orders.filter((order) => getStatus(order) === status).length;

      return {
        status,
        count,
        percent: orders.length ? (count / orders.length) * 100 : 0,
      };
    });

    const productMap = new Map(
      products.map((product) => [getId(product), product])
    );
    const sales = new Map();

    eligibleOrders.forEach((order) => {
      const items = Array.isArray(order.items) ? order.items : [];

      items.forEach((item) => {
        if (!item || typeof item !== "object") return;

        const productId = getId(item.product);
        const key = productId || String(item.name || "Unknown product");
        const product = productMap.get(productId);
        const entry = sales.get(key) || {
          key,
          name: product?.name || item.name || "Product",
          category: product?.category || "Uncategorised",
          image: product?.images?.[0] || item.image || "",
          units: 0,
          value: 0,
        };

        const quantity = Math.max(0, number(item.quantity));
        entry.units += quantity;
        entry.value += number(item.price) * quantity;
        sales.set(key, entry);
      });
    });

    return {
      totalValue,
      currentValue,
      periodValue,
      average: eligibleOrders.length
        ? totalValue / eligibleOrders.length
        : 0,
      valueChange: getChange(currentValue, previousValue),
      months: months.map((item) => ({
        ...item,
        height: Math.max(0, (item.value / maxValue) * 100),
      })),
      statuses,
      recentOrders: [...orders]
        .sort((a, b) => timestamp(b.createdAt) - timestamp(a.createdAt))
        .slice(0, 5),
      topProducts: [...sales.values()]
        .sort((a, b) => b.value - a.value)
        .slice(0, 4),
      stats: [
        {
          title: "Orders",
          value: orders.length,
          change: getChange(countCurrent(orders), countPrevious(orders)),
          Icon: ShoppingCart,
          href: "/admin/orders",
        },
        {
          title: "Products",
          value: products.length,
          change: getChange(countCurrent(products), countPrevious(products)),
          Icon: Package,
          href: "/admin/products",
        },
        {
          title: "Customers",
          value: customers.length,
          change: getChange(countCurrent(customers), countPrevious(customers)),
          Icon: Users,
          href: "/admin/users",
        },
      ],
    };
  }, [data]);

  return (
    <div>
      {/* HEADING */}
      <header className="flex flex-col gap-6 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={eyebrow}>{BUSINESS_INFO.businessName} / Admin</p>
          <h1 className="mt-2 font-display text-5xl leading-none tracking-tight sm:text-6xl">
            Store <em className="font-normal text-mauve">overview.</em>
          </h1>
          <p className="mt-3 text-sm text-ink/60">
            Your orders, collection and customers at a glance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={loading}
            onClick={() => setRefreshCount((value) => value + 1)}
            className="inline-flex min-h-12 items-center gap-2.5 rounded-full border border-line bg-white px-5 text-xs font-extrabold transition-all duration-200 hover:-translate-y-0.5 hover:border-mauve hover:shadow-md disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
              aria-hidden="true"
            />
            {loading ? "Loading…" : "Refresh"}
          </button>

          <Link
            to="/shop"
            className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-plum px-5 text-xs font-extrabold text-white shadow-lg shadow-plum/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-plum-dark"
          >
            View store
            <ArrowUpRight
              size={17}
              className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </header>

      {errorMessage && (
        <div
          className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700"
          role="alert"
        >
          {errorMessage}
          {data && (
            <p className="mt-1 font-normal">
              The figures below show the last successful update.
            </p>
          )}
        </div>
      )}

      {!data ? (
        <div
          className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-3xl border border-line bg-white p-8 text-center text-sm text-ink/60"
          role={loading ? "status" : undefined}
        >
          {loading ? (
            <>
              <Loader2
                size={30}
                className="animate-spin text-mauve"
                aria-hidden="true"
              />
              <p>Loading your store overview…</p>
            </>
          ) : (
            <p>Dashboard figures will appear once the data loads successfully.</p>
          )}
        </div>
      ) : (
        <div
          className={`space-y-5 transition-opacity duration-300 ${
            loading ? "opacity-60" : ""
          }`}
          aria-busy={loading}
        >
          <div className="flex items-center gap-2 text-xs text-ink/50">
            <span>Last updated</span>
            <time
              className="font-bold text-ink/70"
              dateTime={data.updatedAt.toISOString()}
            >
              {data.updatedAt.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </time>
          </div>

          {/* TOTALS */}
          <section
            className="grid gap-5 xl:grid-cols-[1.25fr_1fr]"
            aria-label="Store totals"
          >
            <div className="rounded-3xl bg-gradient-to-br from-plum via-[#7e5f80] to-[#b58186] p-6 text-white sm:p-8">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/70">
                All-time order value
              </p>
              <h2 className="mt-3 font-display text-5xl leading-none tracking-tight sm:text-7xl">
                {money(overview.totalValue)}
              </h2>
              <p className="mt-4 max-w-md text-xs leading-relaxed text-white/70">
                Total of non-cancelled orders; this is not a confirmed payment
                or net-profit figure.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/12 p-4 backdrop-blur-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/65">
                    This month
                  </span>
                  <strong className="mt-1.5 block text-2xl font-extrabold">
                    {money(overview.currentValue)}
                  </strong>
                </div>
                <div className="rounded-2xl bg-white/12 p-4 backdrop-blur-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/65">
                    Average order value
                  </span>
                  <strong className="mt-1.5 block text-2xl font-extrabold">
                    {money(overview.average)}
                  </strong>
                </div>
              </div>

              <p className="mt-4 text-xs font-semibold text-white/75">
                {overview.valueChange}
              </p>
            </div>

            <div className="grid gap-4">
              {overview.stats.map(({ title, value, change, Icon, href }) => (
                <Link
                  to={href}
                  key={title}
                  className="group flex items-center gap-4 rounded-3xl border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-mauve/50 hover:shadow-xl hover:shadow-plum/10"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-lilac text-plum transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                    <Icon size={20} aria-hidden="true" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <span className={eyebrow}>{title}</span>
                    <strong className="block font-display text-4xl leading-tight tracking-tight">
                      {value.toLocaleString()}
                    </strong>
                    <p className="truncate text-xs text-ink/55">{change}</p>
                  </div>

                  <ArrowUpRight
                    size={18}
                    className="shrink-0 text-mauve transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          </section>

          {/* MONTHLY CHART */}
          <section className={panel}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className={eyebrow}>Monthly activity</p>
                <h2 className={panelTitle}>Order value over time</h2>
              </div>
              <div className="sm:text-right">
                <strong className="block text-xl font-extrabold">
                  {money(overview.periodValue)}
                </strong>
                <span className="text-xs text-ink/55">
                  Last 12 months · non-cancelled orders
                </span>
              </div>
            </div>

            <div className="mt-7 overflow-x-auto pb-1">
              <div
                className="grid min-w-[720px] grid-cols-12 gap-3"
                aria-label="Monthly order values"
              >
                {overview.months.map((month, index) => (
                  <div className="group text-center" key={month.key}>
                    <div className="flex h-52 items-end rounded-2xl bg-lilac/50 p-1.5">
                      <div
                        className={`w-full rounded-xl transition-all duration-700 ease-out group-hover:opacity-80 ${
                          index === overview.months.length - 1
                            ? "bg-plum"
                            : "bg-mauve"
                        }`}
                        style={{ height: `${month.height}%` }}
                      />
                    </div>
                    <span className="mt-2.5 block text-xs font-bold">
                      {month.label}
                    </span>
                    <span className="block text-[10px] text-ink/55">
                      {money(month.value)}
                    </span>
                    <span className="sr-only">{month.fullLabel}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* RECENT ORDERS */}
          <section className={panel}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className={eyebrow}>Latest activity</p>
                <h2 className={panelTitle}>Recent orders</h2>
              </div>
              <Link
                to="/admin/orders"
                className="group inline-flex items-center gap-2 border-b-2 border-mauve pb-1 text-xs font-extrabold"
              >
                All orders
                <ArrowUpRight
                  size={16}
                  className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>

            {!overview.recentOrders.length ? (
              <p className="mt-6 text-sm text-ink/55">
                No orders have been placed yet.
              </p>
            ) : (
              <div className="mt-5 divide-y divide-line">
                {overview.recentOrders.map((order, index) => (
                  <article
                    key={getId(order) || index}
                    className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 rounded-2xl px-2 py-4 transition-colors duration-200 hover:bg-lilac/40 md:grid-cols-[1.1fr_1.5fr_auto_auto_auto] md:gap-x-6"
                  >
                    <div className="min-w-0">
                      <strong className="block truncate text-sm">
                        {order.orderNumber || "Order"}
                      </strong>
                      <span className="text-xs text-ink/55">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>

                    <div className="order-3 col-span-2 min-w-0 md:order-none md:col-span-1">
                      <strong className="block truncate text-sm">
                        {getCustomer(order)}
                      </strong>
                      <span className="block truncate text-xs text-ink/55">
                        {getOrderSummary(order)}
                      </span>
                    </div>

                    <span
                      className={`justify-self-end rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider md:justify-self-auto ${statusClass(
                        getStatus(order),
                      )}`}
                    >
                      {getStatus(order)}
                    </span>

                    <strong className="order-4 text-sm md:order-none">
                      {money(order.totalAmount)}
                    </strong>

                    <Link
                      to="/admin/orders"
                      className="order-5 flex h-9 w-9 items-center justify-center justify-self-end rounded-full bg-lilac text-plum transition-all duration-200 hover:bg-plum hover:text-white md:order-none"
                      aria-label={`Open orders to review ${
                        order.orderNumber || "this order"
                      }`}
                    >
                      <ArrowUpRight size={17} aria-hidden="true" />
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </section>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* STATUS */}
            <section className={panel}>
              <p className={eyebrow}>Order distribution</p>
              <h2 className={panelTitle}>Fulfillment status</h2>

              <div className="mt-6 space-y-5">
                {overview.statuses.map((row) => (
                  <div key={row.status}>
                    <div className="flex items-baseline justify-between gap-4 text-sm">
                      <span className="font-semibold">{row.status}</span>
                      <strong>
                        {row.count}{" "}
                        <span className="font-normal text-ink/50">
                          / {row.percent.toFixed(0)}%
                        </span>
                      </strong>
                    </div>
                    <div
                      className="mt-2 h-2 overflow-hidden rounded-full bg-lilac"
                      aria-hidden="true"
                    >
                      <span
                        className="block h-full rounded-full bg-gradient-to-r from-mauve to-blush transition-all duration-700 ease-out"
                        style={{ width: `${row.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* TOP PRODUCTS */}
            <section className={panel}>
              <p className={eyebrow}>Ranked by order item value</p>
              <h2 className={panelTitle}>Top products</h2>

              {!overview.topProducts.length ? (
                <p className="mt-6 text-sm text-ink/55">
                  No product sales to show yet.
                </p>
              ) : (
                <div className="mt-5 divide-y divide-line">
                  {overview.topProducts.map((product, index) => (
                    <article
                      key={product.key}
                      className="flex items-center gap-4 py-4"
                    >
                      <ProductThumbnail image={product.image} rank={index + 1} />

                      <div className="min-w-0 flex-1">
                        <strong className="block truncate text-sm">
                          {product.name}
                        </strong>
                        <span className="block truncate text-xs text-ink/55">
                          {product.category} · {product.units.toLocaleString()}{" "}
                          {product.units === 1 ? "unit" : "units"}
                        </span>
                      </div>

                      <strong className="shrink-0 text-sm">
                        {money(product.value)}
                      </strong>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;