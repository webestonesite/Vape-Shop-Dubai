"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useCustomerAuth } from "./CustomerAuthContext";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
  variantId?: string;
  handle?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "vapeshope_cart";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const { user } = useCustomerAuth();
  const pathname = usePathname();

  // Always reset drawer state and unlock DOM interaction on route change
  useEffect(() => {
    setIsCartOpen(false);
    if (typeof document !== "undefined") {
      document.body.style.pointerEvents = "auto";
      document.body.style.overflow = "auto";
      document.documentElement.style.pointerEvents = "auto";
      document.documentElement.style.overflow = "auto";
    }
  }, [pathname]);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch (e) {
      console.error("[Cart] Error parsing cart storage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error("[Cart] Error saving cart to storage:", e);
    }
  }, [cart, isLoaded]);

  // Sync with Firestore cloud cart when user is logged in
  useEffect(() => {
    if (!user || !isLoaded) return;

    let isMounted = true;
    const syncCloudCart = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/customer/cart", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.cart) && isMounted) {
            setCart((current) => {
              const combinedMap = new Map<string, CartItem>();
              data.cart.forEach((item: CartItem) => combinedMap.set(item.id, item));
              current.forEach((item) => {
                const existing = combinedMap.get(item.id);
                if (existing) {
                  combinedMap.set(item.id, {
                    ...item,
                    quantity: Math.max(item.quantity, existing.quantity),
                  });
                } else {
                  combinedMap.set(item.id, item);
                }
              });
              const merged = Array.from(combinedMap.values());
              return merged;
            });
          }
        }
      } catch (err) {
        console.error("[Cart] Cloud sync error:", err);
      }
    };

    syncCloudCart();
    return () => {
      isMounted = false;
    };
  }, [user, isLoaded]);

  // Helper to persist cart updates to Firestore
  const pushToBackend = useCallback(
    async (updatedCart: CartItem[]) => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        await fetch("/api/customer/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cart: updatedCart }),
        });
      } catch (err) {
        console.error("[Cart] Push to backend failed:", err);
      }
    },
    [user]
  );

  const addToCart = useCallback(
    (product: Omit<CartItem, "quantity">, quantity = 1) => {
      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.id === product.id);
        let updated: CartItem[];
        if (existingItem) {
          updated = prevCart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
          );
        } else {
          updated = [...prevCart, { ...product, quantity }];
        }
        pushToBackend(updated);
        return updated;
      });
      setIsCartOpen(true);
    },
    [pushToBackend]
  );

  const removeFromCart = useCallback(
    (id: string) => {
      setCart((prevCart) => {
        const updated = prevCart.filter((item) => item.id !== id);
        pushToBackend(updated);
        return updated;
      });
    },
    [pushToBackend]
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(id);
        return;
      }
      setCart((prevCart) => {
        const updated = prevCart.map((item) => (item.id === id ? { ...item, quantity } : item));
        pushToBackend(updated);
        return updated;
      });
    },
    [pushToBackend, removeFromCart]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    pushToBackend([]);
  }, [pushToBackend]);

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
