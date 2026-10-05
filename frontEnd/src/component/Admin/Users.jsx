import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Users as UsersIcon,
} from "lucide-react";

import { API_BASE_URL } from "../../config";
import storeInfo from "../../storeInfo";

const USERS_API_URL = `${API_BASE_URL}/api/users`;
const ORDERS_API_URL = `${API_BASE_URL}/api/orders`;

const getId = (value) => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return String(value?._id || value?.id || "");
};

const getText = (value, fallback = "") =>
  typeof value === "string" ? value : fallback;

const getAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

const getTimestamp = (value) => {
  const timestamp = value ? new Date(value).getTime() : 0;
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const formatDate = (value) => {
  if (!getTimestamp(value)) return "—";

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const formatMoney = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(getAmount(value));

const isCancelled = (order) =>
  ["cancelled", "canceled"].includes(
    getText(order?.status).trim().toLowerCase(),
  );

const getRole = (user) => {
  const role = getText(user?.role).trim().toLowerCase();

  if (role === "admin") return "Admin";
  if (!role || role === "user" || role === "customer") return "Customer";

  return role.charAt(0).toUpperCase() + role.slice(1);
};

const getInitials = (name) =>
  getText(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "?";

// Shared Tailwind class sets
const eyebrow =
  "text-[10px] font-extrabold uppercase tracking-[0.16em] text-mauve";
const pillControl =
  "h-12 w-full rounded-full border border-line bg-white px-4 text-sm text-ink transition-all duration-200 focus:border-mauve focus:outline-none focus:ring-4 focus:ring-mauve/15";
const secondaryButton =
  "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border border-line bg-white px-5 text-xs font-extrabold transition-all duration-200 hover:-translate-y-0.5 hover:border-mauve hover:shadow-md disabled:translate-y-0 disabled:cursor-wait disabled:opacity-55 disabled:shadow-none";

const RoleBadge = ({ role, light = false }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider ${
      role === "Admin"
        ? "bg-plum text-white"
        : light
          ? "bg-white/15 text-white"
          : "bg-lilac text-plum"
    }`}
  >
    {role === "Admin" && <ShieldCheck size={12} aria-hidden="true" />}
    {role}
  </span>
);

const Users = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [selectedId, setSelectedId] = useState("");

  const profileHeadingRef = useRef(null);
  const directoryHeadingRef = useRef(null);
  const previousSelectionRef = useRef("");

  const brandName = storeInfo.businessName;

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const fetchData = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const token = localStorage.getItem(storeInfo.storageKeys.token);

        if (!token) {
          throw new Error("Please sign in with your admin account.");
        }

        const headers = { Authorization: `Bearer ${token}` };

        const fetchCollection = async (url, field, label) => {
          const response = await fetch(url, {
            headers,
            signal: controller.signal,
          });

          const data = await response.json().catch(() => null);

          if (!response.ok) {
            throw new Error(
              data?.message || `Unable to load ${label}. Please try again.`,
            );
          }

          if (!Array.isArray(data?.[field])) {
            throw new Error(`The ${label} response is invalid.`);
          }

          return data[field].filter(
            (item) => item && typeof item === "object" && !Array.isArray(item),
          );
        };

        const results = await Promise.allSettled([
          fetchCollection(USERS_API_URL, "users", "users"),
          fetchCollection(ORDERS_API_URL, "orders", "orders"),
        ]);

        if (!active) return;

        const failure = results.find((result) => result.status === "rejected");

        if (failure) throw failure.reason;

        setUsers(results[0].value.filter((user) => getId(user)));
        setOrders(results[1].value);
        setHasLoaded(true);
      } catch (error) {
        if (active && error?.name !== "AbortError") {
          setErrorMessage(error?.message || "Unable to load account activity.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();

    return () => {
      active = false;
      controller.abort();
    };
  }, [refreshCount]);

  const userDirectory = useMemo(() => {
    const activity = new Map();

    orders.forEach((order) => {
      const userId = getId(order.user);
      if (!userId) return;

      if (!activity.has(userId)) activity.set(userId, []);
      activity.get(userId).push(order);
    });

    return users.map((user) => {
      const userOrders = [...(activity.get(getId(user)) || [])].sort(
        (a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt),
      );

      return {
        ...user,
        accountId: getId(user),
        roleLabel: getRole(user),
        userOrders,
        orderCount: userOrders.length,
        orderValue: userOrders.reduce(
          (total, order) =>
            total + (isCancelled(order) ? 0 : getAmount(order.totalAmount)),
          0,
        ),
      };
    });
  }, [users, orders]);

  const roleOptions = useMemo(
    () => [
      "All",
      "Customer",
      "Admin",
      ...Array.from(
        new Set(userDirectory.map((user) => user.roleLabel)),
      ).filter((role) => role !== "Customer" && role !== "Admin"),
    ],
    [userDirectory],
  );

  const filteredUsers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    const result = userDirectory.filter((user) => {
      const matchesSearch =
        !search ||
        [getText(user.name), getText(user.email)]
          .join(" ")
          .toLowerCase()
          .includes(search);

      return (
        matchesSearch && (roleFilter === "All" || user.roleLabel === roleFilter)
      );
    });

    return result.sort((a, b) => {
      if (sortBy === "Oldest") {
        return getTimestamp(a.createdAt) - getTimestamp(b.createdAt);
      }

      if (sortBy === "Name") {
        return getText(a.name).localeCompare(getText(b.name));
      }

      if (sortBy === "Orders") return b.orderCount - a.orderCount;
      if (sortBy === "Value") return b.orderValue - a.orderValue;

      return getTimestamp(b.createdAt) - getTimestamp(a.createdAt);
    });
  }, [userDirectory, searchTerm, roleFilter, sortBy]);

  const selectedUser = userDirectory.find(
    (user) => user.accountId === selectedId,
  );

  const summary = useMemo(() => {
    const customers = userDirectory.filter(
      (user) => user.roleLabel !== "Admin",
    );

    return {
      total: userDirectory.length,
      customers: customers.length,
      admins: userDirectory.length - customers.length,
      withOrders: userDirectory.filter((user) => user.orderCount > 0).length,
    };
  }, [userDirectory]);

  // Move focus to the heading of whichever view has just opened
  useEffect(() => {
    if (selectedId) {
      profileHeadingRef.current?.focus();
    } else if (previousSelectionRef.current) {
      directoryHeadingRef.current?.focus();
    }

    previousSelectionRef.current = selectedId;
  }, [selectedId]);

  const hasFilters =
    Boolean(searchTerm) || roleFilter !== "All" || sortBy !== "Newest";

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("All");
    setSortBy("Newest");
  };

  const refreshButton = (
    <button
      type="button"
      className={secondaryButton}
      onClick={() => setRefreshCount((count) => count + 1)}
      disabled={loading}
    >
      <RefreshCw
        size={16}
        className={loading ? "animate-spin" : ""}
        aria-hidden="true"
      />
      {loading ? "Loading…" : "Refresh"}
    </button>
  );

  const errorBanner = errorMessage && (
    <div
      className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700"
      role="alert"
    >
      {errorMessage}
      {hasLoaded && (
        <p className="mt-1 font-normal">
          The list shows the last successfully loaded data.
        </p>
      )}
    </div>
  );

  /* ================= ONE ACCOUNT ================= */

  if (selectedId) {
    return (
      <div>
        <button
          type="button"
          className={`mb-6 ${secondaryButton}`}
          onClick={() => setSelectedId("")}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to accounts
        </button>

        {errorBanner}

        {!selectedUser ? (
          <div className="rounded-3xl border border-dashed border-line bg-white p-10 text-center text-sm text-ink/60">
            <h2
              ref={profileHeadingRef}
              tabIndex={-1}
              className="font-display text-3xl tracking-tight text-ink focus:outline-none"
            >
              Account unavailable
            </h2>
            <p className="mt-2">
              This account is no longer in the loaded list.
            </p>
          </div>
        ) : (
          <div
            key={selectedId}
            className="animate-fade-down grid items-start gap-5 [animation-duration:350ms] lg:grid-cols-[0.85fr_1.7fr]"
          >
            {/* IDENTITY */}
            <section className="rounded-3xl bg-gradient-to-br from-plum via-[#7e5f80] to-[#b58186] p-6 text-white sm:p-8">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-lilac to-blush text-2xl font-extrabold text-plum">
                {getInitials(selectedUser.name)}
              </div>

              <h1
                ref={profileHeadingRef}
                tabIndex={-1}
                className="mt-6 break-words font-display text-4xl leading-tight tracking-tight focus:outline-none"
              >
                {getText(selectedUser.name, "Unnamed account") ||
                  "Unnamed account"}
              </h1>

              <p className="mt-1 break-words text-sm text-white/75">
                {getText(selectedUser.email) || "Email not provided"}
              </p>

              <div className="mt-4">
                <RoleBadge role={selectedUser.roleLabel} light />
              </div>

              <dl className="mt-7 divide-y divide-white/15 border-t border-white/15">
                <div className="py-4">
                  <dt className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/60">
                    <Mail size={13} aria-hidden="true" />
                    Email
                  </dt>
                  <dd className="mt-1.5 break-words text-sm">
                    {getText(selectedUser.email) || "—"}
                  </dd>
                </div>

                <div className="py-4">
                  <dt className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/60">
                    <CalendarDays size={13} aria-hidden="true" />
                    Joined
                  </dt>
                  <dd className="mt-1.5 text-sm">
                    {formatDate(selectedUser.createdAt)}
                  </dd>
                </div>

                <div className="py-4">
                  <dt className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/60">
                    <ShieldCheck size={13} aria-hidden="true" />
                    Account type
                  </dt>
                  <dd className="mt-1.5 text-sm">{selectedUser.roleLabel}</dd>
                </div>
              </dl>
            </section>

            {/* ACTIVITY */}
            <section className="min-w-0 rounded-3xl border border-line bg-white p-5 sm:p-7">
              <p className={eyebrow}>{brandName} / Account activity</p>
              <h2 className="mt-1.5 font-display text-3xl tracking-tight">
                Order history
              </h2>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-lilac/50 p-4">
                  <span className={eyebrow}>Orders</span>
                  <strong className="mt-1 block font-display text-4xl leading-tight tracking-tight">
                    {selectedUser.orderCount.toLocaleString()}
                  </strong>
                </div>
                <div className="rounded-2xl bg-lilac/50 p-4">
                  <span className={eyebrow}>Order value</span>
                  <strong className="mt-1 block break-words font-display text-4xl leading-tight tracking-tight">
                    {formatMoney(selectedUser.orderValue)}
                  </strong>
                </div>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-ink/55">
                Order value is the total of non-cancelled orders linked to this
                account.
              </p>

              {!selectedUser.userOrders.length ? (
                <p className="mt-6 border-t border-line pt-6 text-sm text-ink/55">
                  No orders are linked to this account yet.
                </p>
              ) : (
                <div className="mt-5 divide-y divide-line border-t border-line">
                  {selectedUser.userOrders.map((order, index) => (
                    <article
                      key={getId(order) || index}
                      className="grid grid-cols-[1fr_auto] items-center gap-4 py-4"
                    >
                      <div className="min-w-0">
                        <strong className="block truncate text-sm">
                          {getText(order.orderNumber) || "Order"}
                        </strong>
                        <small className="mt-1 block text-xs text-ink/55">
                          {formatDate(order.createdAt)} ·{" "}
                          {getText(order.status) || "Status unavailable"}
                        </small>
                      </div>

                      <strong
                        className={`text-sm ${
                          isCancelled(order) ? "text-ink/40 line-through" : ""
                        }`}
                      >
                        {formatMoney(order.totalAmount)}
                      </strong>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    );
  }

  /* ================= ALL ACCOUNTS ================= */

  const stats = [
    ["Accounts", summary.total],
    ["Customers", summary.customers],
    ["Admins", summary.admins],
    ["With orders", summary.withOrders],
  ];

  return (
    <div>
      {/* HEADING */}
      <header className="flex flex-col gap-6 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={eyebrow}>{brandName} / Admin</p>
          <h1
            ref={directoryHeadingRef}
            tabIndex={-1}
            className="mt-2 font-display text-5xl leading-none tracking-tight focus:outline-none sm:text-6xl"
          >
            Your <em className="font-normal text-mauve">people.</em>
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink/60">
            Customer and admin accounts, with the orders linked to each one.
          </p>
        </div>

        {refreshButton}
      </header>

      {errorBanner}

      {/* TOTALS */}
      <section
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        aria-label="Account totals"
      >
        {stats.map(([label, value], index) => (
          <div
            key={label}
            className={`rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-plum/10 ${
              index === 0
                ? "bg-gradient-to-br from-plum via-[#7e5f80] to-[#b58186] text-white"
                : "border border-line bg-white"
            }`}
          >
            <span
              className={
                index === 0
                  ? "text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/70"
                  : eyebrow
              }
            >
              {label}
            </span>
            <strong className="mt-1 block font-display text-4xl leading-tight tracking-tight">
              {hasLoaded ? value.toLocaleString() : "—"}
            </strong>
          </div>
        ))}
      </section>

      {/* SEARCH + SORT */}
      <div className="mt-6 grid gap-3 md:grid-cols-[1fr_230px] md:items-end">
        <div>
          <label
            htmlFor="tt-users-search"
            className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink/55"
          >
            Search by name or email
          </label>
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mauve"
              aria-hidden="true"
            />
            <input
              id="tt-users-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Name or email…"
              className={`${pillControl} pl-11`}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="tt-users-sort"
            className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink/55"
          >
            Sort by
          </label>
          <select
            id="tt-users-sort"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className={pillControl}
          >
            <option value="Newest">Newest</option>
            <option value="Oldest">Oldest</option>
            <option value="Name">Name: A to Z</option>
            <option value="Orders">Most orders</option>
            <option value="Value">Highest order value</option>
          </select>
        </div>
      </div>

      {/* ROLE TABS */}
      <div
        className="mt-5 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter by account type"
      >
        {roleOptions.map((role) => (
          <button
            key={role}
            type="button"
            aria-pressed={roleFilter === role}
            onClick={() => setRoleFilter(role)}
            className={`min-h-10 rounded-full border px-4 text-xs font-bold transition-all duration-200 ${
              roleFilter === role
                ? "border-plum bg-plum text-white"
                : "border-line bg-white text-ink/60 hover:border-mauve hover:bg-lilac hover:text-plum"
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 text-xs font-semibold text-ink/55">
        <span role="status" aria-live="polite">
          {loading
            ? "Loading accounts…"
            : hasLoaded
              ? `${filteredUsers.length} of ${userDirectory.length} accounts`
              : "Accounts unavailable"}
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

      {/* ACCOUNTS */}
      <section className="mt-5" aria-label="Accounts" aria-busy={loading}>
        {loading && !hasLoaded ? (
          <div
            className="flex min-h-60 flex-col items-center justify-center gap-4 rounded-3xl border border-line bg-white p-8 text-sm text-ink/60"
            role="status"
          >
            <Loader2
              size={28}
              className="animate-spin text-mauve"
              aria-hidden="true"
            />
            <p>Loading accounts…</p>
          </div>
        ) : !hasLoaded ? (
          <div className="rounded-3xl border border-dashed border-line bg-white p-10 text-center text-sm text-ink/60">
            <p>Refresh to load your accounts.</p>
          </div>
        ) : !filteredUsers.length ? (
          <div className="flex min-h-60 flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-white p-10 text-center text-sm text-ink/60">
            <UsersIcon size={28} className="text-mauve" aria-hidden="true" />
            <h2 className="mt-3 font-display text-2xl tracking-tight text-ink">
              {userDirectory.length
                ? "No matching accounts."
                : "No accounts yet."}
            </h2>
            {userDirectory.length > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 inline-flex min-h-11 items-center rounded-full bg-plum px-5 text-xs font-extrabold text-white transition-colors hover:bg-plum-dark"
              >
                View all accounts
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredUsers.map((user) => (
              <article
                key={user.accountId}
                className="group min-w-0 rounded-3xl border border-line bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-plum/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lilac to-blush text-base font-extrabold text-plum transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
                    {getInitials(user.name)}
                  </div>

                  <RoleBadge role={user.roleLabel} />
                </div>

                <h2 className="mt-5 truncate font-display text-2xl tracking-tight">
                  {getText(user.name) || "Unnamed account"}
                </h2>
                <p className="truncate text-sm text-ink/55">
                  {getText(user.email) || "Email not provided"}
                </p>

                <div className="my-5 grid grid-cols-[1fr_1.5fr] gap-4 border-y border-line py-4">
                  <div>
                    <small className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/50">
                      <ShoppingBag size={12} aria-hidden="true" />
                      Orders
                    </small>
                    <strong className="mt-1 block text-lg font-extrabold">
                      {user.orderCount.toLocaleString()}
                    </strong>
                  </div>
                  <div className="min-w-0">
                    <small className="block text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/50">
                      Order value
                    </small>
                    <strong className="mt-1 block truncate text-lg font-extrabold">
                      {formatMoney(user.orderValue)}
                    </strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-ink/50">
                    Joined {formatDate(user.createdAt)}
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedId(user.accountId)}
                    aria-label={`View ${getText(user.name) || "account"} details`}
                    className="group/open inline-flex min-h-10 items-center gap-2 rounded-full bg-lilac px-4 text-xs font-extrabold text-plum transition-all duration-200 hover:bg-plum hover:text-white"
                  >
                    View
                    <ArrowUpRight
                      size={15}
                      className="transition-transform duration-200 group-hover/open:-translate-y-0.5 group-hover/open:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Users;
