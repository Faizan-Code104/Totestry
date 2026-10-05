import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import storeInfo from "../storeInfo";

const CartContext = createContext(null);

// The key name lives in src/storeInfo.js
const CART_STORAGE_KEY = storeInfo.storageKeys.cart;

const getProductId = (product) => {
  const id = product?.id ?? product?._id;

  return id == null ? "" : String(id).trim();
};

const getSafeQuantity = (value) => {
  const quantity = Number(value);

  return Number.isFinite(quantity)
    ? Math.max(1, Math.floor(quantity))
    : 1;
};

const getSafePrice = (value) => {
  const price = Number(value);

  return Number.isFinite(price)
    ? Math.max(0, price)
    : 0;
};

const normalizeCart = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  const normalizedItems = new Map();

  items.forEach((item) => {
    if (!item || typeof item !== "object") {
      return;
    }

    const id = getProductId(item);

    if (!id) {
      return;
    }

    const quantity = getSafeQuantity(item.quantity);
    const existingItem = normalizedItems.get(id);

    if (existingItem) {
      normalizedItems.set(id, {
        ...existingItem,
        quantity: existingItem.quantity + quantity,
      });

      return;
    }

    normalizedItems.set(id, {
      ...item,
      id,
      price: getSafePrice(item.price),
      quantity,
    });
  });

  return Array.from(normalizedItems.values());
};

const readStoredCart = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const savedCart = window.localStorage.getItem(
      CART_STORAGE_KEY
    );

    if (savedCart !== null) {
      return normalizeCart(JSON.parse(savedCart));
    }

    return [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(readStoredCart);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cartItems)
      );
    } catch {
      // Cart remains available in memory if storage is unavailable.
    }
  }, [cartItems]);

  const addToCart = useCallback((product) => {
    const productId = getProductId(product);

    if (!productId) {
      return;
    }

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.id === productId
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity: getSafeQuantity(item.quantity) + 1,
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          ...product,
          id: productId,
          price: getSafePrice(product.price),
          quantity: 1,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    const id = getProductId({ id: productId });

    if (!id) {
      return;
    }

    setCartItems((currentItems) =>
      currentItems.filter((item) => item.id !== id)
    );
  }, []);

  const updateQuantity = useCallback(
    (productId, quantity) => {
      const id = getProductId({ id: productId });
      const numericQuantity = Number(quantity);

      if (!id || !Number.isFinite(numericQuantity)) {
        return;
      }

      const wholeQuantity = Math.floor(numericQuantity);

      if (wholeQuantity <= 0) {
        removeFromCart(id);
        return;
      }

      setCartItems((currentItems) =>
        currentItems.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: wholeQuantity,
              }
            : item
        )
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartCount = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total + getSafeQuantity(item.quantity),
        0
      ),
    [cartItems]
  );

  const cartSubtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total +
          getSafePrice(item.price) *
            getSafeQuantity(item.quantity),
        0
      ),
    [cartItems]
  );

  const value = useMemo(
    () => ({
      cartItems,
      cartCount,
      cartSubtotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }),
    [
      cartItems,
      cartCount,
      cartSubtotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
};

export default CartContext;