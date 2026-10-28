"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type CartItem = { slug: string; qty: number };

type CartCtx = {
  items: CartItem[];
  count: number;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  has: (slug: string) => boolean;
  ready: boolean; // false until localStorage has been read
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "dmg-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  const save = (next: CartItem[]) => {
    setItems(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  };

  const value: CartCtx = {
    items,
    count: items.reduce((s, i) => s + i.qty, 0),
    add: (slug, qty = 1) => {
      const found = items.find((i) => i.slug === slug);
      save(found ? items.map((i) => (i.slug === slug ? { ...i, qty: i.qty + qty } : i)) : [...items, { slug, qty }]);
    },
    setQty: (slug, qty) => save(qty <= 0 ? items.filter((i) => i.slug !== slug) : items.map((i) => (i.slug === slug ? { ...i, qty } : i))),
    remove: (slug) => save(items.filter((i) => i.slug !== slug)),
    clear: () => save([]),
    has: (slug) => items.some((i) => i.slug === slug),
    ready,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
