import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowUp,
  ArrowUpRight,
  Clock,
  Mail,
  MapPin,
  Menu,
  Phone,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";

import { useCart } from "./CartContext";
import storeInfo, {
  getAddressLines,
  getEmailLink,
  getPhoneLink,
} from "../storeInfo";
import Reveal from "./Reveal";

const navigation = [
  { name: "Shop all", path: "/shop" },
  { name: "Collections", path: "/categories" },
  { name: "Our story", path: "/about" },
  { name: "Contact", path: "/contact" },
  { name: "Help", path: "/faqs" },
];

const mobileNavigation = [
  { name: "Home", path: "/" },
  ...navigation,
  { name: "Track your order", path: "/track-order" },
  { name: "My account", path: "/login" },
];

const footerLinks = {
  Explore: [
    { name: "Home", path: "/" },
    { name: "Shop all", path: "/shop" },
    { name: "Collections", path: "/categories" },
    { name: "Our story", path: "/about" },
    { name: "Contact", path: "/contact" },
  ],
  Help: [
    { name: "FAQ", path: "/faqs" },
    { name: "Track your order", path: "/track-order" },
    { name: "Shipping policy", path: "/shipping-policy" },
    { name: "Returns & refunds", path: "/return-policy" },
    { name: "Order cancellation", path: "/order-cancellation-policy" },
  ],
  "The details": [
    { name: "Terms of use", path: "/terms-and-conditions" },
    { name: "Privacy policy", path: "/privacy-policy" },
    { name: "Payment policy", path: "/payment-policy" },
    { name: "Cookie policy", path: "/cookie-policy" },
  ],
};

// Text logo — the brand name comes from storeInfo.js
const BrandLogo = () => (
  <span className="tt-logo">
    <span className="tt-logo-mark" aria-hidden="true">
      ✳
    </span>
    {storeInfo.businessName.toUpperCase()}
    <span className="tt-logo-dot" aria-hidden="true">
      .
    </span>
  </span>
);

const Layout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const searchInputRef = useRef(null);

  const { cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const count = cartCount || 0;
  const addressLines = getAddressLines();
  const emailLink = getEmailLink();
  const phoneLink = getPhoneLink();
  const hoursLine = [storeInfo.supportHours, storeInfo.timeZone]
    .filter(Boolean)
    .join(" ");

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname === path ||
        location.pathname.startsWith(`${path}/`);

  const closePanels = () => {
    setMenuOpen(false);
    setSearchOpen(false);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();

    if (!query) return;

    navigate(`/shop?search=${encodeURIComponent(query)}`);
    closePanels();
  };

  // Close the menu and search whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search, location.hash]);

  // Header tightens and gains a shadow once the page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 25);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock page scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Escape closes whatever is open; desktop width closes the mobile menu
  useEffect(() => {
    if (!menuOpen && !searchOpen) return undefined;

    const onKey = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };

    const desktop = window.matchMedia("(min-width: 851px)");
    const onResize = () => {
      if (desktop.matches) setMenuOpen(false);
    };

    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onResize);

    return () => {
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onResize);
    };
  }, [menuOpen, searchOpen]);

  // Put the cursor in the search field as soon as it opens
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  return (
    <div className="tt-site">
      <a href="#main-content" className="tt-skip">
        Skip to content
      </a>

      {/* PROMO BAR */}
      <div className="tt-promo">
        <span>The new edit</span>
        <span>Find your way to carry</span>
        <Link to="/shop">
          Explore the collection
          <ArrowUpRight size={13} strokeWidth={2.2} aria-hidden="true" />
        </Link>
      </div>

      {/* HEADER */}
      <header className={`tt-header${scrolled ? " is-scrolled" : ""}`}>
        <div className="tt-header-shell">
          <button
            type="button"
            className="tt-icon-button tt-menu-toggle"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="tt-mobile-nav"
            onClick={() => {
              setSearchOpen(false);
              setMenuOpen((open) => !open);
            }}
          >
            {menuOpen ? (
              <X size={23} strokeWidth={1.7} aria-hidden="true" />
            ) : (
              <Menu size={23} strokeWidth={1.7} aria-hidden="true" />
            )}
          </button>

          <Link
            to="/"
            className="tt-header-logo"
            aria-label={`${storeInfo.businessName} home`}
            onClick={closePanels}
          >
            <BrandLogo />
          </Link>

          <nav className="tt-nav" aria-label="Main navigation">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                aria-current={isActive(item.path) ? "page" : undefined}
                className={isActive(item.path) ? "is-active" : undefined}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="tt-actions">
            <button
              type="button"
              className="tt-icon-button"
              aria-label={searchOpen ? "Close search" : "Search products"}
              aria-expanded={searchOpen}
              aria-controls="tt-search"
              onClick={() => {
                setMenuOpen(false);
                setSearchOpen((open) => !open);
              }}
            >
              {searchOpen ? (
                <X size={21} strokeWidth={1.7} aria-hidden="true" />
              ) : (
                <Search size={21} strokeWidth={1.7} aria-hidden="true" />
              )}
            </button>

            <Link
              to="/login"
              className="tt-icon-button tt-account"
              aria-label="My account"
            >
              <User size={21} strokeWidth={1.7} aria-hidden="true" />
            </Link>

            <Link
              to="/cart"
              className="tt-bag"
              aria-label={`Shopping cart with ${count} items`}
            >
              <ShoppingBag size={19} strokeWidth={1.7} aria-hidden="true" />
              <span>Cart</span>
              {/* key restarts the small "pop" animation when the count changes */}
              <b key={count}>{count > 99 ? "99+" : count}</b>
            </Link>
          </div>
        </div>

        {/* SEARCH PANEL */}
        {searchOpen && (
          <div id="tt-search" className="tt-search">
            <form onSubmit={handleSearch} role="search">
              <span className="tt-search-label">Find your next favourite</span>

              <label className="tt-search-field">
                <Search size={26} strokeWidth={1.6} aria-hidden="true" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search handbags…"
                  aria-label="Search products"
                  autoComplete="off"
                />
                <button type="submit" className="tt-button tt-button--dark">
                  Search
                </button>
              </label>
            </form>
          </div>
        )}

        {/* MOBILE AND TABLET NAVIGATION */}
        {menuOpen && (
          <nav
            id="tt-mobile-nav"
            className="tt-mobile-nav"
            aria-label="Mobile navigation"
          >
            {mobileNavigation.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closePanels}
                aria-current={isActive(item.path) ? "page" : undefined}
                className={isActive(item.path) ? "is-active" : undefined}
                style={{ animationDelay: `${60 + index * 45}ms` }}
              >
                {item.name}
                <ArrowUpRight size={19} strokeWidth={1.7} aria-hidden="true" />
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* PAGE CONTENT */}
      <main
        id="main-content"
        tabIndex={-1}
        key={location.pathname}
        className="tt-page"
      >
        {children}
      </main>

      {/* FOOTER */}
      <footer id="help" className="tt-footer">
        <div className="tt-footer-inner">
          <Reveal className="tt-footer-top">
            <div>
              <p className="tt-footer-eyebrow">
                {storeInfo.businessName} / The bag edit
              </p>
              <h2>
                Take your day
                <br />
                <em>somewhere new.</em>
              </h2>
            </div>

            <Link to="/shop" className="tt-footer-shop">
              Shop the edit
              <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
            </Link>
          </Reveal>

          <div className="tt-footer-links">
            <div className="tt-footer-brand">
              <Link to="/" aria-label={`${storeInfo.businessName} home`}>
                <BrandLogo />
              </Link>

              <p>
                Find your way to carry. Explore shapes for your daily routines
                and the moments in between.
              </p>

              {/* Contact details — all read from src/storeInfo.js */}
              <div className="tt-footer-contact">
                {storeInfo.email && (
                  <a href={emailLink}>
                    <Mail size={16} aria-hidden="true" />
                    {storeInfo.email}
                  </a>
                )}

                {storeInfo.phoneDisplay && (
                  <a href={phoneLink}>
                    <Phone size={16} aria-hidden="true" />
                    {storeInfo.phoneDisplay}
                  </a>
                )}

                {addressLines.length > 0 && (
                  <div>
                    <MapPin size={16} aria-hidden="true" />
                    <span>
                      {addressLines.map((line) => (
                        <React.Fragment key={line}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}
                    </span>
                  </div>
                )}

                {(storeInfo.businessDays || hoursLine) && (
                  <div>
                    <Clock size={16} aria-hidden="true" />
                    <span>
                      {storeInfo.businessDays}
                      {storeInfo.businessDays && hoursLine && <br />}
                      {hoursLine}
                    </span>
                  </div>
                )}

                <Link to="/contact">
                  <ArrowUpRight size={16} aria-hidden="true" />
                  Contact support
                </Link>
              </div>
            </div>

            {Object.entries(footerLinks).map(([title, links]) => (
              <nav
                key={title}
                className="tt-footer-col"
                aria-label={`${title} links`}
              >
                <h3>{title}</h3>

                {links.map((item) => (
                  <Link key={item.path} to={item.path}>
                    {item.name}
                  </Link>
                ))}
              </nav>
            ))}
          </div>

          <div className="tt-footer-bottom">
            <span>
              © {new Date().getFullYear()}{" "}
              {storeInfo.legalName || storeInfo.businessName}. All rights
              reserved.
            </span>

            <button type="button" onClick={scrollToTop}>
              Back to top{" "}
              <ArrowUp
                size={12}
                strokeWidth={2.4}
                style={{ display: "inline", verticalAlign: "-1px" }}
                aria-hidden="true"
              />
            </button>

            <span>{storeInfo.tagline}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;