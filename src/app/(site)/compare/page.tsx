"use client";

import Link from "next/link";
import { GitCompareArrows, ShoppingCart, X } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { useCatalog } from "@/components/catalog-provider";
import { formatBDT } from "@/lib/site";
import { Breadcrumb } from "@/components/breadcrumb";
import { PageHero } from "@/components/page-hero";
import { useCart } from "@/components/cart";
import { useCompare } from "@/components/compare";
import { ConditionBadge } from "@/components/condition-badge";
import { ProductImage } from "@/components/product-image";

export default function ComparePage() {
  const { slugs, remove } = useCompare();
  const cart = useCart();
  const { getProduct } = useCatalog();
  const items = slugs.map((s) => getProduct(s)).filter((p): p is Product => !!p);

  // Union of spec labels, in first-seen order, so each row lines up across machines.
  const specKeys = [...new Set(items.flatMap((p) => p.specs.map(([k]) => k)))];
  const rows: { label: string; value: (p: Product) => React.ReactNode }[] = [
    { label: "Price", value: (p) => <span className="font-bold text-accent-600">{formatBDT(p.price)}</span> },
    { label: "Condition", value: (p) => <ConditionBadge condition={p.condition} /> },
    { label: "Brand", value: (p) => p.brand },
    { label: "Capacity", value: (p) => p.capacity },
    { label: "Power", value: (p) => p.voltage },
    ...specKeys.map((k) => ({ label: k, value: (p: Product) => p.specs.find(([sk]) => sk === k)?.[1] ?? "—" })),
  ];

  return (
    <div className="container mx-auto px-3 pt-4 sm:px-4 lg:pt-6">
      <Breadcrumb items={[{ label: "Shop", href: "/shop" }, { label: "Compare" }]} />
      <PageHero eyebrow="Compare" title="Compare Machines" Icon={GitCompareArrows} />

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <p className="font-semibold text-gray-700">তুলনা করার জন্য কোনো মেশিন বাছাই করা হয়নি</p>
          <p className="mt-1 text-sm text-gray-500">Product card-এর compare বাটনে চাপ দিয়ে সর্বোচ্চ ৪টি মেশিন যোগ করুন।</p>
          <Link href="/shop" className="mt-4 inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white">
            Browse machines
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full min-w-[640px] table-fixed text-sm">
            <thead>
              <tr>
                <th className="w-36 bg-gray-50 p-3 text-left align-bottom text-xs font-bold uppercase tracking-wider text-gray-500">Machine</th>
                {items.map((p) => (
                  <th key={p.slug} className="relative p-3 align-top font-normal">
                    <button onClick={() => remove(p.slug)} aria-label={`Remove ${p.name}`} className="absolute right-2 top-2 z-10 rounded-full bg-white p-1 shadow hover:bg-gray-100">
                      <X className="h-4 w-4" />
                    </button>
                    <Link href={`/product/${p.slug}`} className="group block">
                      <div className="relative mx-auto aspect-square w-full max-w-[160px] overflow-hidden rounded-xl bg-white">
                        <ProductImage product={p} sizes="160px" />
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm font-semibold text-gray-800 group-hover:text-brand-700">{p.name}</p>
                    </Link>
                    <button
                      onClick={() => cart.add(p.slug)}
                      className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent-600 py-1.5 text-xs font-bold text-white hover:bg-accent-700"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" /> {cart.has(p.slug) ? "Added" : "Add to cart"}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-t border-gray-100">
                  <td className="bg-gray-50 p-3 font-semibold text-gray-600">{r.label}</td>
                  {items.map((p) => (
                    <td key={p.slug} className="p-3 text-gray-800">
                      {r.value(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
