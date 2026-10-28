import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgePercent, ChevronRight, Flame, LayoutGrid } from "lucide-react";
import { discountPercent, productsIn, type Catalog } from "@/lib/catalog";
import { formatBDT } from "@/lib/site";
import { CategoryIcon } from "./category-icon";

const endsLabel = (iso: string) => new Date(iso).toLocaleDateString("bn-BD", { day: "numeric", month: "short", timeZone: "Asia/Dhaka" });

// Home page left column: categories + admin-managed offers. The whole column stays put while
// the page scrolls; if many offers make it taller than the screen, it scrolls on its own.
export function HomeSidebar({ catalog }: { catalog: Catalog }) {
  const offers = catalog.products.filter((p) => p.offer);

  return (
    <aside className="no-scrollbar sticky top-[146px] hidden max-h-[calc(100vh-162px)] w-72 shrink-0 flex-col gap-4 self-start overflow-y-auto overscroll-contain pb-2 lg:flex">
      {/* Categories */}
      <section className="shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-white">
            <LayoutGrid className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-extrabold leading-tight text-gray-900">Categories</h2>
            <p className="text-xs text-gray-500">Machines by type</p>
          </div>
        </div>
        <ul className="space-y-0.5 p-2.5">
          {catalog.categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/category/${c.slug}`} className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-gray-50">
                <span className="absolute inset-y-3 left-0 w-0.5 scale-y-0 rounded-full bg-gray-900 transition-transform duration-300 group-hover:scale-y-100" />
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-600 ring-1 ring-gray-200 transition-colors duration-200 group-hover:bg-white group-hover:text-brand-700 group-hover:ring-brand-200">
                  <CategoryIcon name={c.icon} className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-gray-800 group-hover:text-gray-950">{c.name}</span>
                </span>
                <span className="relative flex h-6 min-w-6 items-center justify-center">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500 transition-opacity group-hover:opacity-0">{productsIn(catalog, c.slug).length}</span>
                  <ChevronRight className="absolute h-4 w-4 -translate-x-1 text-gray-700 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="p-2.5 pt-0">
          <Link href="/shop" className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-800 transition hover:border-gray-900 hover:bg-gray-900 hover:text-white">
            View All Machines <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Offers — only what the admin has added */}
      <section className="shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <h2 className="flex items-center gap-3 border-b border-gray-100 px-5 py-4 text-base font-extrabold text-gray-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-50 text-accent-600 ring-1 ring-accent-100">
            <Flame className="h-4 w-4" />
          </span>
          অফার চলছে
          {offers.length > 0 && <span className="ml-auto rounded-full bg-accent-600 px-2 py-0.5 text-[11px] font-bold text-white">{offers.length}</span>}
        </h2>
        {offers.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-8 text-center">
            <BadgePercent className="h-9 w-9 text-gray-300" />
            <p className="text-sm font-semibold text-gray-500">এই মুহূর্তে কোনো অফার নেই</p>
            <p className="text-xs text-gray-400">নতুন অফার এলে এখানে দেখা যাবে</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {offers.map((p) => (
              <li key={p.slug}>
                <Link href={`/product/${p.slug}`} className="group flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                  <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-white">
                    {p.image ? <Image src={p.image} alt="" fill sizes="56px" className="object-contain p-1" /> : <CategoryIcon name={p.icon} className="h-6 w-6 text-brand-600/60" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    {p.offer?.title && <span className="mb-0.5 inline-block rounded bg-accent-50 px-1.5 py-px text-[10px] font-bold text-accent-700">{p.offer.title}</span>}
                    <span className="line-clamp-2 text-[13px] font-semibold leading-snug text-gray-800 group-hover:text-brand-700">{p.nameBn}</span>
                    <span className="mt-0.5 flex items-baseline gap-1.5">
                      <span className="text-sm font-bold text-accent-600">{formatBDT(p.price)}</span>
                      {p.oldPrice && <span className="text-[10px] text-gray-400 line-through">{formatBDT(p.oldPrice)}</span>}
                    </span>
                    {p.offer?.endsAt && <span className="block text-[10px] text-gray-400">শেষ: {endsLabel(p.offer.endsAt)}</span>}
                  </span>
                  {discountPercent(p) > 0 && <span className="shrink-0 rounded-full bg-accent-600 px-1.5 py-0.5 text-[10px] font-bold text-white">-{discountPercent(p)}%</span>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}
