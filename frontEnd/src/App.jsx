import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import { CartProvider } from "./component/CartContext";
import ScrollToTop from "./component/ScrollToTop";
import AdminRoute from "./component/AdminRoute";
import storeInfo from "./storeInfo";

import Layout from "./component/Layout";
import Home from "./component/Home";
import Shop from "./component/Shop";
import Category from "./component/Category";
import Contact from "./component/Contact";
import About from "./component/About";
import Login from "./component/Login";
import Signup from "./component/Signup";
import Cart from "./component/Cart";
import ShopDetails from "./component/ShopDetails";
import Checkout from "./component/Checkout";
import OrderTracking from "./component/OrderTracking";
import ShippingPolicy from "./component/ShippingPolicy";
import ReturnPolicy from "./component/ReturnPolicy";
import PrivacyPolicy from "./component/PrivacyPolicy";
import FAQs from "./component/FAQs";
import TermsAndConditions from "./component/TermsAndConditions";
import PaymentPolicy from "./component/PaymentPolicy";
import OrderCancellationPolicy from "./component/OrderCancellationPolicy";
import CookiePolicy from "./component/CookiePolicy";

import AdminLayout from "./component/Admin/AdminLayout";
import Dashboard from "./component/Admin/Dashboard";
import Products from "./component/Admin/Products";
import Orders from "./component/Admin/Orders";
import Users from "./component/Admin/Users";

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <CartProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />

          <Route
            path="/shop"
            element={
              <Layout>
                <Shop />
              </Layout>
            }
          />

          <Route
            path="/shop/:id"
            element={
              <Layout>
                <ShopDetails />
              </Layout>
            }
          />

          <Route
            path="/categories"
            element={
              <Layout>
                <Category />
              </Layout>
            }
          />

          <Route
            path="/about"
            element={
              <Layout>
                <About />
              </Layout>
            }
          />

          <Route
            path="/contact"
            element={
              <Layout>
                <Contact />
              </Layout>
            }
          />

          <Route
            path="/cart"
            element={
              <Layout>
                <Cart />
              </Layout>
            }
          />

          <Route
            path="/checkout"
            element={
              <Layout>
                <Checkout />
              </Layout>
            }
          />

          <Route
            path="/track-order"
            element={
              <Layout>
                <OrderTracking />
              </Layout>
            }
          />

          <Route
            path="/shipping-policy"
            element={
              <Layout>
                <ShippingPolicy />
              </Layout>
            }
          />

          <Route
            path="/return-policy"
            element={
              <Layout>
                <ReturnPolicy />
              </Layout>
            }
          />

          <Route
            path="/privacy-policy"
            element={
              <Layout>
                <PrivacyPolicy />
              </Layout>
            }
          />

          <Route
            path="/payment-policy"
            element={
              <Layout>
                <PaymentPolicy />
              </Layout>
            }
          />

          <Route
            path="/order-cancellation-policy"
            element={
              <Layout>
                <OrderCancellationPolicy />
              </Layout>
            }
          />

          <Route
            path="/cookie-policy"
            element={
              <Layout>
                <CookiePolicy />
              </Layout>
            }
          />

          <Route
            path="/faqs"
            element={
              <Layout>
                <FAQs />
              </Layout>
            }
          />

          <Route
            path="/terms-and-conditions"
            element={
              <Layout>
                <TermsAndConditions />
              </Layout>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <AdminLayout>
                  <Products />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminLayout>
                  <Orders />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminLayout>
                  <Users />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route
            path="*"
            element={
              <Layout>
                <section className="tt-info-hero" data-index="404">
                  <p className="tt-eyebrow">
                    <span className="tt-eyebrow-dot" />
                    {storeInfo.businessName} / Page unavailable
                  </p>

                  <h1>
                    A little <em>off course.</em>
                  </h1>

                  <p>
                    The page you&apos;re looking for doesn&apos;t exist or may
                    have been moved. Let&apos;s find your way back.
                  </p>

                  <div className="tt-hero-buttons" style={{ marginTop: 30 }}>
                    <Link to="/" className="tt-button tt-button--dark">
                      Back to home
                      <span aria-hidden="true">↗</span>
                    </Link>

                    <Link to="/shop" className="tt-button tt-button--outline">
                      Shop the collection
                    </Link>
                  </div>
                </section>

                <div style={{ height: 80 }} />
              </Layout>
            }
          />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
};

export default App;