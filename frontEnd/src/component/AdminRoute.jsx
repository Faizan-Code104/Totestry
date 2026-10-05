import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import storeInfo from "../storeInfo";

// Storage key names live in src/storeInfo.js so every file uses the same ones
const TOKEN_KEY = storeInfo.storageKeys.token;
const USER_KEY = storeInfo.storageKeys.user;

const AdminRoute = ({ children }) => {
  const location = useLocation();
  const from = `${location.pathname}${location.search}${location.hash}`;

  let token;
  let user;

  try {
    token = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    if (!token?.trim() || !savedUser) {
      return (
        <Navigate
          to="/login"
          replace
          state={{ from }}
        />
      );
    }

    user = JSON.parse(savedUser);

    if (!user || typeof user !== "object" || Array.isArray(user)) {
      throw new Error("Invalid stored user.");
    }
  } catch {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // Browser storage may be unavailable.
    }

    return (
      <Navigate
        to="/login"
        replace
        state={{ from }}
      />
    );
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;