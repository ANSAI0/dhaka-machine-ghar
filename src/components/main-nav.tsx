"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LayoutGrid } from "lucide-react";
import type { Category } from "@/lib/catalog";
import { CategoryIcon } from "./category-icon";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/track", label: "Order Tracking" },
  { href: "/warranty", label: "Warranty & Service" },
  { href: "/contact", label: "Contact" },
];

// Header menu: frosted white bar with the All Categories mega menu.
export function MainNav({ categories }: { categories: Category[] }) {
  const path = usePathname();
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <nav className="border-b border-gray-200/70 bg-white/60 backdrop-blur-md" aria-label="Main">
      <div className="container mx-auto flex items-center gap-1 px-4 py-1.5">
        <div className="group relative">
          <button className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-brand-600 px-3 py-2 text-[13px] font-bold text-white shadow-sm transition hover:bg-brand-700 lg:px-4 lg:text-sm">
            <LayoutGrid className="h-4 w-4" /> <span className="lg:hidden">Categories</span>
            <span className="hidden lg:inline">All Categories</span>
            <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
          </button>
          <div className="invisible absolute left-0 top-full z-50 mt-1.5 w-[min(92vw,1000px)] translate-y-2 rounded-2xl border border-gray-100 bg-white p-6 opacity-0 shadow-2xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
            <div className="grid grid-cols-3 gap-6 lg:grid-cols-5">
              {categories.map((c) => (
                <div key={c.slug}>
                  <Link href={`/category/${c.slug}`} className="mb-2 flex items-center gap-2 text-sm font-bold text-brand-700 hover:text-accent-600">
                    <CategoryIcon name={c.icon} className="h-4 w-4 shrink-0" /> {c.name}
                  </Link>
                  <ul className="space-y-1.5 border-l-2 border-brand-100 pl-3">
                    {c.subcategories.map((s) => (
                      <li key={s.slug}>
                        <Link href={`/category/${c.slug}?sub=${s.slug}`} className="text-[13px] text-gray-600 hover:text-accent-600">
                          {s.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`relative whitespace-nowrap rounded-lg px-2.5 py-2 text-[13px] font-semibold transition-colors lg:px-4 lg:text-sm ${
                isActive(l.href)
                  ? "text-brand-700 after:absolute after:inset-x-3 after:-bottom-1.5 after:h-0.5 after:rounded-full after:bg-brand-600"
                  : "text-gray-600 hover:bg-gray-900/5 hover:text-gray-900"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
