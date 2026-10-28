"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, ShoppingCart, Trash2 } from "lucide-react";
import { formatBDT } from "@/lib/site";
import { useSite } from "@/components/site-provider";
import { Breadcrumb } from "@/components/breadcrumb";
import { PageHero } from "@/components/page-hero";
import { useCart } from "@/components/cart";
import { useCatalog } from "@/components/catalog-provider";
import { ConditionBadge } from "@/components/condition-badge";
import { OrderForm, OrderSuccess, QtyStepper, type OrderLine } from "@/components/order-form";
import { ProductImage } from "@/components/product-image";

export default function CheckoutPage() {
  const site = useSite();
  const cart = useCart();
  const { getProduct } = useCatalog();
  const [placed, setPlaced] = useState<{ id: string; total: number; payNow: number } | null>(null);

  // Drop slugs that no longer exist in the catalog.
  const lines: OrderLine[] = cart.items.flatMap((i) => {
    const product = getProduct(i.slug);
    return product ? [{ product, qty: i.qty }] : [];
  });
  const total = lines.reduce((s, l) => s + l.product.price * l.qty, 0);

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
            <Link href="/shop" className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white">Browse machines</Link>
            <Link href="/quotation" className="rounded-xl border-2 border-brand-600 px-5 py-2.5 text-sm font-bold text-brand-700">Custom Quotation</Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Cart lines */}
          <section className="space-y-3 lg:col-span-2">
            {lines.map(({ product: p, qty }) => (
              <article key={p.slug} className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
                <Link href={`/product/${p.slug}`} className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-white">
                  <ProductImage product={p} sizes="96px" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/product/${p.slug}`} className="line-clamp-2 text-sm font-semibold text-gray-800 hover:text-brand-700">{p.name}</Link>
                    <button onClick={() => cart.remove(p.slug)} aria-label={`Remove ${p.name}`} className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-accent-50 hover:text-accent-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <ConditionBadge condition={p.condition} className="w-fit" />
                  <div className="mt-auto flex items-center justify-between gap-2">
                    <QtyStepper value={qty} onChange={(n) => cart.setQty(p.slug, n)} label={`${p.name} quantity`} />
                    <span className="text-sm font-bold text-brand-700">{formatBDT(p.price * qty)}</span>
                  </div>
                </div>
              </article>
            ))}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 text-sm shadow-sm">
              <p className="flex justify-between"><span className="text-gray-600">মোট মূল্য</span><strong className="text-lg">{formatBDT(total)}</strong></p>
              <p className="mt-1 flex justify-between text-gray-500"><span>{site.advancePercent}% অগ্রিম বুকিং</span><span>{formatBDT(Math.round((total * site.advancePercent) / 100))}</span></p>
              <p className="mt-2 text-xs text-gray-400">ডেলিভারি চার্জ মেশিনের ওজন ও দূরত্ব অনুযায়ী কলে জানানো হবে।</p>
            </div>
          </section>

          {/* Form */}
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7 lg:col-span-3">
            <h2 className="mb-1 text-lg font-extrabold text-gray-900">ডেলিভারি ও পেমেন্ট তথ্য</h2>
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
