"use client";

import { Check, GitCompareArrows, ShoppingCart, Zap } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { useCart } from "./cart";
import { useCompare } from "./compare";
import { flyToCart } from "@/lib/fly-to-cart";

export function ProductActions({ product }: { product: Product }) {
  const cart = useCart();
  const compare = useCompare();
  const added = cart.has(product.slug);
  const comparing = compare.has(product.slug);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            cart.add(product.slug);
            flyToCart(document.querySelector<HTMLElement>("[data-product-image]"));
          }}
          className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-bold ${
            added ? "border-brand-600 bg-brand-50 text-brand-700" : "border-brand-600 text-brand-700 hover:bg-brand-50"
          }`}
        >
          {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
          {added ? "কার্টে যোগ হয়েছে" : "কার্টে যোগ করুন"}
        </button>
        <a href="#order" className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-600 to-accent-700 py-3 text-sm font-bold text-white shadow hover:brightness-110">
          <Zap className="h-4 w-4" /> এখনই অর্ডার করুন
        </a>
      </div>
      <button
        onClick={() => compare.toggle(product.slug)}
        disabled={!comparing && compare.full}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
      >
        <GitCompareArrows className="h-4 w-4" /> {comparing ? "Compare থেকে সরান" : "Compare-এ যোগ করুন"}
      </button>
    </div>
  );
}
