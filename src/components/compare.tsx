"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useState } from "react";
import { GitCompareArrows, X } from "lucide-react";
import { useCatalog } from "./catalog-provider";

export const COMPARE_MAX = 4;
const KEY = "dmg-compare";

type CompareCtx = {
  slugs: string[];
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
  has: (slug: string) => boolean;
  full: boolean;
};

const Ctx = createContext<CompareCtx | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSlugs(JSON.parse(raw));
    } catch {}
  }, []);

  const save = (next: string[]) => {
    setSlugs(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  };

  const value: CompareCtx = {
    slugs,
    toggle: (slug) =>
      save(slugs.includes(slug) ? slugs.filter((s) => s !== slug) : slugs.length < COMPARE_MAX ? [...slugs, slug] : slugs),
    remove: (slug) => save(slugs.filter((s) => s !== slug)),
    clear: () => save([]),
    has: (slug) => slugs.includes(slug),
    full: slugs.length >= COMPARE_MAX,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCompare() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCompare must be used inside <CompareProvider>");
  return ctx;
}

export function CompareBar() {
  const { slugs, remove, clear } = useCompare();
  const { getProduct } = useCatalog();
  if (!slugs.length) return null;
  return (
    <div className="fixed inset-x-3 bottom-[68px] z-40 mx-auto max-w-3xl rounded-2xl border border-brand-100 bg-white p-3 shadow-2xl md:bottom-5">
      <div className="flex items-center gap-3">
        <GitCompareArrows className="hidden h-6 w-6 shrink-0 text-brand-600 sm:block" />
        <div className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto">
          {slugs.map((s) => {
            const p = getProduct(s);
            return (
              <span key={s} className="flex shrink-0 items-center gap-1 rounded-full bg-brand-50 py-1 pl-3 pr-1 text-xs font-semibold text-brand-700">
                <span className="max-w-[140px] truncate">{p?.name ?? s}</span>
                <button onClick={() => remove(s)} aria-label="Remove from compare" className="rounded-full p-0.5 hover:bg-brand-100">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            );
          })}
        </div>
        <button onClick={clear} className="shrink-0 text-xs font-semibold text-gray-500 hover:text-accent-600">
          Clear
        </button>
        <Link href="/compare" className="shrink-0 rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700">
          Compare ({slugs.length})
        </Link>
      </div>
    </div>
  );
}
