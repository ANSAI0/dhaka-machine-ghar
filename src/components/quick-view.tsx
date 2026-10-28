"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ShoppingCart, X } from "lucide-react";
import { discountPercent, type Product } from "@/lib/catalog";
import { flyToCart } from "@/lib/fly-to-cart";
import { formatBDT } from "@/lib/site";
import { useCart } from "./cart";
import { ConditionBadge } from "./condition-badge";
import { ProductImage } from "./product-image";

export function QuickView({ product, onClose }: { product: Product; onClose: () => void }) {
  const cart = useCart();
  const off = discountPercent(product);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={product.name}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 shadow hover:bg-gray-100">
          <X className="h-5 w-5" />
        </button>
        <div className="grid sm:grid-cols-2">
          <div ref={imageRef} className="group relative aspect-square bg-white sm:rounded-l-3xl">
            <ProductImage product={product} sizes="(max-width: 640px) 100vw, 384px" />
          </div>
          <div className="flex flex-col gap-3 border-t border-gray-100 p-5 sm:border-l sm:border-t-0">
            <ConditionBadge condition={product.condition} className="w-fit" />
            <div>
              <h2 className="text-lg font-bold leading-snug text-gray-900">{product.name}</h2>
              <p className="text-sm text-brand-700">{product.nameBn}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-extrabold text-accent-600">{formatBDT(product.price)}</span>
              {product.oldPrice && <span className="text-sm text-gray-400 line-through">{formatBDT(product.oldPrice)}</span>}
              {off > 0 && <span className="rounded-full bg-accent-50 px-2 py-0.5 text-xs font-bold text-accent-600">{off}% ছাড়</span>}
            </div>
            <p className="text-sm text-gray-600">{product.short}</p>
            <table className="w-full text-sm">
              <tbody>
                {product.specs.slice(0, 5).map(([k, v]) => (
                  <tr key={k} className="border-b border-gray-100 last:border-0">
                    <td className="py-1.5 pr-3 text-gray-500">{k}</td>
                    <td className="py-1.5 font-medium text-gray-800">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-auto flex gap-2 pt-2">
              <button
                onClick={() => {
                  cart.add(product.slug);
                  flyToCart(imageRef.current);
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent-600 py-2.5 text-sm font-bold text-white hover:bg-accent-700"
              >
                <ShoppingCart className="h-4 w-4" /> {cart.has(product.slug) ? "Add another" : "Add to cart"}
              </button>
              <Link href={`/product/${product.slug}`} className="flex flex-1 items-center justify-center rounded-xl border-2 border-brand-600 py-2.5 text-sm font-bold text-brand-700 hover:bg-brand-50">
                বিস্তারিত দেখুন
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
