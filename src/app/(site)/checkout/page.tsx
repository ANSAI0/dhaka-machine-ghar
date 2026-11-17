"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, ShoppingCart, Trash2 } from "lucide-react";
import { defaultKg, formatBDT, priceText, rateOf, saleUnit, unitPrice } from "@/lib/site";
import { useSite } from "@/components/site-provider";
import { Breadcrumb } from "@/components/breadcrumb";
import { PageHero } from "@/components/page-hero";
import { useCart } from "@/components/cart";
import { useCatalog } from "@/components/catalog-provider";
import { KgInput, OrderForm, OrderSuccess, QtyStepper, type OrderLine } from "@/components/order-form";
import { ProductImage } from "@/components/product-image";

export default function CheckoutPage() {
  const site = useSite();
  const cart = useCart();
  const { getProduct } = useCatalog();
  const [placed, setPlaced] = useState<{ id: string; total: number; payNow: number } | null>(null);

  // Drop slugs that no longer exist in the catalog.
  const lines: OrderLine[] = cart.items.flatMap((i) => {
    const product = getProduct(i.slug);
    return product ? [{ product, qty: i.qty, ...(rateOf(product) ? { kg: i.kg ?? defaultKg(product) } : {}) }] : [];
  });
  const total = lines.reduce((s, l) => s + unitPrice(l.product, l.kg) * l.qty, 0);

  return (
    <div className="container mx-auto px-3 pt-4 sm:px-4 lg:pt-6">
      <Breadcrumb items={[{ label: "Cart & Checkout" }]} />
      <PageHero eyebrow="Checkout" title="Your Cart & Checkout" Icon={ShoppingCart} />

      {placed ? (
        <div className="mx-auto max-w-xl"><OrderSuccess order={placed} /></div>
      ) : !cart.ready ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      ) : lines.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-3 font-semibold text-gray-700">আপনার কার্ট খালি</p>
          <p className="mt-1 text-sm text-gray-500">মেশিন বাছাই করুন, অথবা আপনার মাপে মেশিন বানাতে কাস্টম কোটেশন দিন।</p>
          <div className="mt-4 flex justify-center gap-2">
            <Link prefetch={false} href="/shop" className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white">Browse machines</Link>
            <Link prefetch={false} href="/quotation" className="rounded-xl border-2 border-brand-600 px-5 py-2.5 text-sm font-bold text-brand-700">Custom Quotation</Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Cart lines */}
          <section className="space-y-3 lg:col-span-2">
            {lines.map(({ product: p, qty, kg }) => {
              const rate = rateOf(p);
              const listed = defaultKg(p);
              const raw = cart.items.find((i) => i.slug === p.slug)?.kg;
              const mode = rate && (raw !== undefined || !listed) ? "kg" : "unit";
              const line = rate && !kg ? null : unitPrice(p, kg) * qty;
              return (
                <article key={p.slug} className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
                  <div className="flex gap-3">
                    <Link prefetch={false} href={`/product/${p.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-studio">
                      <ProductImage product={p} sizes="80px" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link prefetch={false} href={`/product/${p.slug}`} className="line-clamp-2 text-sm font-semibold leading-snug text-gray-800 hover:text-brand-700">{p.name}</Link>
                        <button onClick={() => cart.remove(p.slug)} aria-label={`Remove ${p.name}`} className="-mr-1 -mt-1 shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-accent-50 hover:text-accent-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-1 text-xs font-semibold text-gray-500">{rate ? `${formatBDT(rate)} / কেজি` : `${priceText(p.price)} / ${saleUnit(p)}`}</p>
                    </div>
                  </div>

                  {rate > 0 && (
                    <div className="mt-3 space-y-2">
                      {listed > 0 && (
                        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={`${p.name}: order by`}>
                          {([["unit", "মেশিন হিসেবে", `${listed.toLocaleString("en-IN")} কেজি`], ["kg", "ওজন অনুযায়ী", "যত কেজি চান"]] as const).map(([m, title, sub]) => (
                            <button
                              key={m}
                              type="button"
                              role="radio"
                              aria-checked={mode === m}
                              onClick={() => cart.setKg(p.slug, m === "unit" ? undefined : (raw ?? listed))}
                              className={`rounded-xl border-2 px-2.5 py-2 text-left ${mode === m ? "border-brand-600 bg-brand-50" : "border-gray-200 bg-white"}`}
                            >
                              <span className="block text-[13px] font-bold text-gray-900">{title}</span>
                              <span className="block text-[11px] text-gray-500">{sub}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {mode === "kg" && <KgInput value={kg ?? 0} onChange={(n) => cart.setKg(p.slug, n)} label={`${p.name} weight`} />}
                    </div>
                  )}

                  <div className="mt-3 flex items-end justify-between gap-2 border-t border-gray-100 pt-3">
                    <QtyStepper value={qty} onChange={(n) => cart.setQty(p.slug, n)} label={`${p.name} quantity`} unit={saleUnit(p)} />
                    <div className="text-right leading-tight">
                      <span className="block text-[11px] text-gray-500">{rate && kg ? `${kg.toLocaleString("en-IN")} কেজি × ${formatBDT(rate)}${qty > 1 ? ` × ${qty}` : ""}` : "মোট"}</span>
                      <strong className="text-base text-brand-700">{line === null ? "ওজন লিখুন" : formatBDT(line)}</strong>
                    </div>
                  </div>
                </article>
              );
            })}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 text-sm shadow-sm">
              <p className="flex justify-between"><span className="text-gray-600">মোট মূল্য</span><strong className="text-lg">{formatBDT(total)}</strong></p>
              <p className="mt-1 flex justify-between text-gray-500"><span>{site.advancePercent}% অগ্রিম বুকিং</span><span>{formatBDT(Math.round((total * site.advancePercent) / 100))}</span></p>
              <p className="mt-2 text-xs text-gray-400">ডেলিভারি চার্জ মেশিনের ওজন ও দূরত্ব অনুযায়ী কলে জানানো হবে।</p>
            </div>
          </section>

          {/* Form */}
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7 lg:col-span-3">
            <h2 className="mb-1 text-lg font-bold text-gray-900">ডেলিভারি ও পেমেন্ট তথ্য</h2>
            <p className="mb-5 text-sm text-gray-500">অর্ডার দেওয়ার পর আমাদের প্রতিনিধি কল করে কনফার্ম করবেন।</p>
            <OrderForm
              lines={lines}
              source="checkout"
              onPlaced={(o) => {
                setPlaced(o);
                cart.clear();
              }}
            />
          </section>
        </div>
      )}
    </div>
  );
}
