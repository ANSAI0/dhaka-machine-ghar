"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { ProductCard } from "./product-card";

const STEP = 10;

// One home-page category block: title with an underline, product count, a grid of cards and
// "Load More (10 of 22)" that reveals ten more at a time.
export function CategorySection({ title, href, items }: { title: string; href: string; items: Product[] }) {
  const [shown, setShown] = useState(STEP);
  if (!items.length) return null;

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <Link href={href} className="group">
          <h2 className="text-lg font-bold text-gray-900 group-hover:text-brand-700 sm:text-xl lux:text-white">{title}</h2>
          <span className="mt-1.5 block h-1 w-14 rounded-full bg-gradient-to-r from-brand-600 to-brand-400 lux:bg-gold-gradient" />
        </Link>
        <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 lux:bg-white/[0.06] lux:text-gold-300">
          {items.length} products
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:gap-3 xl:grid-cols-5">
        {items.slice(0, shown).map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
      {shown < items.length && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setShown((n) => n + STEP)}
            className="rounded-full bg-gradient-to-r from-brand-600 to-brand-700 px-7 py-2.5 text-sm font-bold text-white shadow-[0_8px_18px_-8px_rgba(46,94,71,0.7)] hover:from-brand-700 hover:to-brand-800 lux:bg-gold-gradient lux:text-lux-950"
          >
            Load More ({shown} of {items.length})
          </button>
        </div>
      )}
    </section>
  );
}
