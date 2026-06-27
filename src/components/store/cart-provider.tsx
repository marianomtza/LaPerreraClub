"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type CartItem = {
  variantId: string;
  name: string;
  variantName: string;
  priceCents: number;
  quantity: number;
  imageUrl?: string | null;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  addItem: (item: CartItem) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "la-perrera-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const storageLoaded = useRef(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      storageLoaded.current = true;
      return;
    }
    try {
      const parsed = JSON.parse(stored) as CartItem[];
      window.queueMicrotask(() => {
        storageLoaded.current = true;
        if (Array.isArray(parsed)) setItems(parsed);
      });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      storageLoaded.current = true;
    }
  }, []);

  useEffect(() => {
    if (!storageLoaded.current) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((item: CartItem) => {
    setItems((current) => {
      const existing = current.find((entry) => entry.variantId === item.variantId);
      if (!existing) return [...current, item];
      return current.map((entry) =>
        entry.variantId === item.variantId
          ? { ...entry, quantity: Math.min(entry.quantity + item.quantity, 20) }
          : entry
      );
    });
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    setItems((current) =>
      current
        .map((item) => (item.variantId === variantId ? { ...item, quantity: Math.max(1, Math.min(quantity, 20)) } : item))
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((variantId: string) => {
    setItems((current) => current.filter((item) => item.variantId !== variantId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      addItem,
      updateQuantity,
      removeItem,
      clearCart
    }),
    [addItem, clearCart, items, removeItem, updateQuantity]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart debe usarse dentro de CartProvider.");
  return value;
}
