import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  Store,
  BarChart3,
  User,
} from "lucide-react";

import Logo from "../Logo";
import storeInfo from "../../storeInfo";

const MENU_ITEMS = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Products", path: "/admin/products", icon: Package },
  { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
  { name: "Users", path: "/admin/users", icon: Users },
];

// The signed-in admin, as saved by the login page
const readAdmin = () => {
  try {
    const saved = localStorage.getItem(storeInfo.storageKeys.user);
    const user = saved ? JSON.parse(saved) : null;

    return user && typeof user === "object" ? user : null;
  } catch {
    return null;
  }
};

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const admin = useMemo(readAdmin, []);
  const adminName = admin?.name || "Admin User";
  const adminInitial = adminName.trim().charAt(0).toUpperCase() || "A";

  const isActive = (path) => {
    if (path === "/admin") {
      return (
        location.pathname === "/admin" ||
        location.pathname === "/admin/dashboard"
      );
    }

    return location.pathname.startsWith(path);
  };

  const currentPage =
    MENU_ITEMS.find((item) => isActive(item.path))?.name || "Management Panel";

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Close the menus whenever the page changes
  useEffect(() => {
    setSidebarOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    try {
      localStorage.removeItem(storeInfo.storageKeys.token);
      localStorage.removeItem(storeInfo.storageKeys.user);
    } catch {
      // Browser storage may be unavailable.
    }

    navigate("/login", { replace: true });
  };

  const navLink =
    "group flex w-full items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold transition-all duration-200";
  const navIdle = "text-white/65 hover:bg-white/10 hover:text-white";
  const iconButton =
    "flex h-10 w-10 items-center justify-center rounded-full text-ink/60 transition-all duration-200 hover:bg-lilac hover:text-ink";

  return (
    <div className="min-h-screen bg-paper font-sans text-ink">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-plum-dark/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-gradient-to-b from-plum via-plum to-plum-dark text-white transition-transform duration-300 ease-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between px-6">
          <Link to="/admin" onClick={closeSidebar}>
            <Logo size="md" tone="light" />
          </Link>

          <button
            type="button"
            aria-label="Close sidebar"
            onClick={closeSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pt-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-white/40">
            Administration
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-1.5">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={closeSidebar}
                  aria-current={active ? "page" : undefined}
                  className={`${navLink} ${
                    active
                      ? "bg-white text-plum shadow-lg shadow-black/10"
                      : navIdle
                  }`}
                >
                  <Icon
                    size={19}
                    strokeWidth={active ? 2.3 : 2}
                    className={`transition-transform duration-200 ${
                      active ? "" : "group-hover:scale-110"
                    }`}
                  />

                  <span>{item.name}</span>

                  {active && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-gradient-to-br from-mauve to-blush" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="mt-8">
            <p className="mb-3 px-4 text-[10px] font-extrabold uppercase tracking-[0.25em] text-white/40">
              Management
            </p>

            <div className="space-y-1.5">
              <button type="button" className={`${navLink} ${navIdle}`}>
                <BarChart3
                  size={19}
                  className="transition-transform duration-200 group-hover:scale-110"
                />
                Analytics
              </button>

              <button type="button" className={`${navLink} ${navIdle}`}>
                <Settings
                  size={19}
                  className="transition-transform duration-300 group-hover:rotate-45"
                />
                Settings
              </button>
            </div>
          </div>
        </nav>

        <div className="border-t border-white/15 p-4">
          <Link
            to="/"
            onClick={closeSidebar}
            className={`${navLink} ${navIdle}`}
          >
            <Store size={19} />
            <span>View Store</span>
          </Link>

          <div className="mt-2 flex items-center gap-3 rounded-2xl bg-white/10 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lilac to-blush text-sm font-extrabold text-plum">
              {adminInitial}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{adminName}</p>
              <p className="truncate text-xs text-white/55">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-xl">
          <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Open sidebar"
                onClick={() => setSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-lilac text-ink/70 transition-colors hover:bg-line lg:hidden"
              >
                <Menu size={21} />
              </button>

              <div className="hidden sm:block">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-mauve">
                  {storeInfo.businessName} Admin
                </p>

                <h1 className="font-display text-2xl leading-tight tracking-tight text-ink">
                  {currentPage}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button type="button" aria-label="Search" className={iconButton}>
                <Search size={19} />
              </button>

              <button
                type="button"
                aria-label="Notifications"
                className={`relative ${iconButton}`}
              >
                <Bell size={19} />
              </button>

              <div className="mx-1 hidden h-8 w-px bg-line sm:block" />

              <div className="relative">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-line bg-white p-1 pr-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-mauve hover:shadow-md md:pr-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-lilac to-blush text-xs font-extrabold text-plum">
                    {adminInitial}
                  </div>

                  <div className="hidden max-w-36 text-left md:block">
                    <p className="truncate text-xs font-bold text-ink">
                      {adminName}
                    </p>
                    <p className="text-[10px] text-ink/50">Administrator</p>
                  </div>

                  <ChevronDown
                    size={15}
                    className={`text-ink/40 transition-transform duration-200 ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {profileOpen && (
                  <div
                    role="menu"
                    className="animate-fade-down absolute right-0 top-14 w-56 rounded-2xl border border-line bg-white p-2 shadow-xl shadow-plum/10 [animation-duration:250ms]"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-ink/65 transition-colors hover:bg-lilac hover:text-ink"
                    >
                      <User size={17} />
                      My Profile
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-ink/65 transition-colors hover:bg-lilac hover:text-ink"
                    >
                      <Settings size={17} />
                      Settings
                    </button>

                    <div className="my-1 border-t border-line" />

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut size={17} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-5rem)] p-4 sm:p-6 lg:p-8">
          <section className="mx-auto max-w-[1600px]">{children}</section>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;