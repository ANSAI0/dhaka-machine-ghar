"use client";

import Link from "next/link";
import { useRef } from "react";
import { Check, Plus } from "lucide-react";
import { discountPercent, type Product } from "@/lib/catalog";
import { flyToCart } from "@/lib/fly-to-cart";
import { formatBDT, priceText } from "@/lib/site";
import { useCart } from "./cart";
import { ProductImage } from "./product-image";

// Clean shop card: discount badge, photo, centred name, price (with the old price struck through) and
// an outlined ADD button that flies the photo to the cart.
export function ProductCard({ product }: { product: Product }) {
  const cart = useCart();
  const imageRef = useRef<HTMLDivElement>(null);
  const added = cart.has(product.slug);
  const off = discountPercent(product);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_2px_10px_-4px_rgba(16,24,40,0.12)] transition-shadow duration-300 hover:shadow-[0_14px_30px_-14px_rgba(16,24,40,0.3)] lux:border-white/[0.07] lux:bg-lux-800">
      <Link href={`/product/${product.slug}`} className="block">
        <div ref={imageRef} className="relative aspect-square overflow-hidden bg-studio lux:bg-lux-700 lux:bg-none">
          {off > 0 && <span className="absolute left-2 top-2 z-10 rounded-md bg-accent-600 px-1.5 py-0.5 text-[10px] font-bold text-white">{off}% OFF</span>}
          <ProductImage product={product} sizes="(max-width: 768px) 50vw, 240px" />
        </div>
        <h3 className="line-clamp-2 min-h-[2.6em] px-2.5 pt-2 text-center text-[13px] font-semibold leading-snug text-gray-800 group-hover:text-brand-700 md:text-sm lux:text-white/90">
          {product.name}
        </h3>
      </Link>
      <div className="mt-auto flex flex-col gap-2 px-2.5 pb-3 pt-2 sm:flex-row sm:items-end sm:justify-between sm:gap-1.5">
        <div className="min-w-0 text-center leading-tight sm:text-left">
          {product.oldPrice && <p className="text-[10px] text-gray-400 line-through md:text-[11px]">{formatBDT(product.oldPrice)}</p>}
          <p className="whitespace-nowrap text-[15px] font-bold tracking-tight text-brand-700 md:text-[15px] lux:text-gold-300">{priceText(product.price)}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            cart.add(product.slug);
            flyToCart(imageRef.current);
          }}
          aria-label={added ? `${product.name} added to cart` : `Add ${product.name} to cart`}
          className={`flex h-8 shrink-0 items-center justify-center gap-0.5 rounded-lg border px-2 text-[11px] font-bold transition-colors ${
            added
              ? "border-brand-600 bg-brand-600 text-white lux:border-gold-400 lux:bg-gold-400 lux:text-lux-950"
              : "border-brand-600/50 text-brand-700 hover:bg-brand-600 hover:text-white lux:border-gold-400/50 lux:text-gold-300"
          }`}
        >
          {added ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          {added ? "ADDED" : "ADD"}
        </button>
      </div>
    </article>
  );
}
