"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Eye, GitCompareArrows, ShoppingCart, Zap } from "lucide-react";
import { discountPercent, type Product } from "@/lib/catalog";
import { flyToCart } from "@/lib/fly-to-cart";
import { formatBDT } from "@/lib/site";
import { useCart } from "./cart";
import { useCompare } from "./compare";
import { ProductImage } from "./product-image";
import { QuickView } from "./quick-view";

export function ProductCard({ product }: { product: Product }) {
  const cart = useCart();
  const compare = useCompare();
  const router = useRouter();
  const imageRef = useRef<HTMLDivElement>(null);
  const [quick, setQuick] = useState(false);
  const added = cart.has(product.slug);
  const comparing = compare.has(product.slug);
  const off = discountPercent(product);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-gray-200 hover:shadow-[0_18px_40px_-16px_rgba(16,24,40,0.25)] max-md:rounded-[20px] max-md:border-white/[0.07] max-md:bg-gradient-to-b max-md:from-lux-700 max-md:to-lux-800 max-md:shadow-[0_16px_30px_-16px_rgba(0,0,0,0.9)]">
      <span aria-hidden className="pointer-events-none absolute inset-x-4 top-0 z-30 h-px bg-gradient-to-r from-transparent via-gold-300/70 to-transparent md:hidden" />
      <div className="absolute right-2.5 top-2.5 z-20 flex flex-col gap-1.5 transition-all duration-300 md:translate-x-2 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100">
        <button
          type="button"
          onClick={() => setQuick(true)}
          aria-label="Quick view"
          title="Quick view"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm ring-1 ring-black/5 md:backdrop-blur transition hover:bg-ink hover:text-white max-md:bg-lux-950/75 max-md:text-white/80 max-md:ring-white/10"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => compare.toggle(product.slug)}
          disabled={!comparing && compare.full}
          aria-pressed={comparing}
          aria-label={comparing ? "Remove from compare" : "Add to compare"}
          title={!comparing && compare.full ? "Compare list full (max 4)" : "Compare"}
          className={`flex h-8 w-8 items-center justify-center rounded-full shadow-sm ring-1 ring-black/5 md:backdrop-blur transition disabled:opacity-40 ${
            comparing ? "bg-ink text-white max-md:bg-gold-gradient max-md:text-lux-950" : "bg-white/90 text-gray-700 hover:bg-ink hover:text-white max-md:bg-lux-950/75 max-md:text-white/80 max-md:ring-white/10"
          }`}
        >
          <GitCompareArrows className="h-4 w-4" />
        </button>
      </div>
      {quick && <QuickView product={product} onClose={() => setQuick(false)} />}
      <Link href={`/product/${product.slug}`} className="block">
        <div ref={imageRef} className="relative aspect-[4/5] overflow-hidden bg-gray-50 max-md:bg-lux-700">
          <div className="absolute left-2 top-2 z-10 flex flex-col items-start gap-1">
            {off > 0 && <span className="rounded-full bg-accent-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">-{off}%</span>}
            <span className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-gray-700 shadow-sm ring-1 ring-black/5 md:backdrop-blur max-md:bg-lux-950/75 max-md:text-white/85 max-md:ring-white/10">
              <span className={`h-1.5 w-1.5 rounded-full ${product.condition === "new" ? "bg-emerald-500" : "bg-steel-500"}`} />
              {product.condition === "new" ? "Factory New" : "Reconditioned"}
            </span>
          </div>
          <ProductImage product={product} sizes="(max-width: 768px) 50vw, 280px" cover />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/10 to-transparent max-md:h-1/3 max-md:from-lux-800" />
        </div>
        <div className="px-3 pt-2.5 md:px-3.5 md:pt-3">
          {product.capacity && <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-gray-400 md:text-[11px] max-md:text-gold-400/75">{product.capacity}</p>}
          <h3 className="mt-0.5 line-clamp-2 min-h-[2.5em] text-[13px] font-semibold leading-snug text-gray-900 transition-colors group-hover:text-brand-700 md:text-sm max-md:text-white/95">
            {product.name}
          </h3>
        </div>
      </Link>
      <div className="mt-auto px-3 pb-3 pt-2 md:px-3.5 md:pb-3.5">
        <div className="flex flex-wrap items-baseline gap-x-1.5">
          <p className="text-[15px] font-bold leading-tight tracking-tight text-gray-900 md:text-[17px] max-md:text-gold-gradient">{formatBDT(product.price)}</p>
          {product.oldPrice && <p className="text-[11px] leading-none text-gray-400 line-through max-md:text-white/35">{formatBDT(product.oldPrice)}</p>}
        </div>
        <div className="mt-2.5 flex gap-1.5">
          <button
            type="button"
            onClick={() => {
              cart.add(product.slug);
              flyToCart(imageRef.current);
            }}
            aria-label={added ? `${product.name} added to cart` : `Add ${product.name} to cart`}
            title={added ? "Added to cart" : "Add to cart"}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all md:h-10 md:w-10 ${
              added ? "border-brand-600 bg-brand-600 text-white max-md:border-gold-400 max-md:bg-gold-400/15 max-md:text-gold-300" : "border-gray-200 bg-white text-gray-800 hover:border-ink hover:bg-ink hover:text-white max-md:border-white/15 max-md:bg-white/[0.04] max-md:text-white/85"
            }`}
          >
            {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!added) cart.add(product.slug);
              router.push("/checkout");
            }}
            aria-label={`Buy ${product.name} now`}
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-ink text-xs font-bold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-md md:h-10 md:text-[13px] max-md:bg-gold-gradient max-md:text-lux-950 max-md:shadow-[0_6px_16px_-6px_rgba(214,174,85,0.6)]"
          >
            <Zap className="h-3.5 w-3.5 text-amber-300 max-md:text-lux-950" /> Buy Now
          </button>
        </div>
      </div>
    </article>
  );
}
