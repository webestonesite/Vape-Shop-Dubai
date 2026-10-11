"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useCustomerAuth } from "./CustomerAuthContext";

export interface WishlistItem {
  id: string;
  handle: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  category?: string;
  availableForSale?: boolean;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  wishlistCount: number;
  isInWishlist: (id: string) => boolean;
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  toggleWishlist: (item: WishlistItem) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = "vapeshope_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useCustomerAuth();

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setWishlist(parsed);
        }
      }
    } catch (e) {
      console.error("[Wishlist] Failed to read localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error("[Wishlist] Failed to save localStorage:", e);
    }
  }, [wishlist, isLoaded]);

  // Sync with Firestore backend if user is logged in
  useEffect(() => {
    if (!user || !isLoaded) return;

    let isMounted = true;
    const syncCloudWishlist = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/customer/wishlist", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.wishlist) && isMounted) {
            // Merge local and cloud wishlist
            setWishlist((current) => {
              const combinedMap = new Map<string, WishlistItem>();
              data.wishlist.forEach((item: WishlistItem) => combinedMap.set(item.id, item));
              current.forEach((item) => combinedMap.set(item.id, item));
              return Array.from(combinedMap.values());
            });
          }
        }
      } catch (err) {
        console.error("[Wishlist] Cloud sync error:", err);
      }
    };

    syncCloudWishlist();
    return () => {
      isMounted = false;
    };
  }, [user, isLoaded]);

  // Helper to sync changes to backend
  const pushToBackend = useCallback(async (updatedWishlist: WishlistItem[]) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      await fetch("/api/customer/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ wishlist: updatedWishlist }),
      });
    } catch (err) {
      console.error("[Wishlist] Push to backend failed:", err);
    }
  }, [user]);

  const isInWishlist = useCallback(
    (id: string) => {
      return wishlist.some((item) => item.id === id);
    },
    [wishlist]
  );

  const addToWishlist = useCallback(
    (item: WishlistItem) => {
      setWishlist((prev) => {
        if (prev.some((p) => p.id === item.id)) return prev;
        const updated = [item, ...prev];
        pushToBackend(updated);
        return updated;
      });
    },
    [pushToBackend]
  );

  const removeFromWishlist = useCallback(
    (id: string) => {
      setWishlist((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        pushToBackend(updated);
        return updated;
      });
    },
    [pushToBackend]
  );

  const toggleWishlist = useCallback(
    (item: WishlistItem): boolean => {
      const exists = wishlist.some((p) => p.id === item.id);
      if (exists) {
        removeFromWishlist(item.id);
        return false;
      } else {
        addToWishlist(item);
        return true;
      }
    },
    [wishlist, addToWishlist, removeFromWishlist]
  );

  const clearWishlist = useCallback(() => {
    setWishlist([]);
    pushToBackend([]);
  }, [pushToBackend]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
