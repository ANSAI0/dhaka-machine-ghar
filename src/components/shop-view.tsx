"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { SearchX, SlidersHorizontal, X } from "lucide-react";
import type { Category, Condition, Product } from "@/lib/catalog";
import { activeFilterCount, applyFilters, facetCounts, filtersToQuery, parseFilters, sortOptions, type Filters, type SortKey } from "@/lib/filters";
import { formatBDT } from "@/lib/site";
import { ProductCard } from "./product-card";

const conditionLabels: Record<Condition, string> = { new: "Brand New (Factory Made)", reconditioned: "Foreign Reconditioned" };

type Props = { items: Product[]; category?: Category };

export function ShopView({ items, category }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const f = useMemo(() => parseFilters(new URLSearchParams(sp.toString())), [sp]);
  const results = useMemo(() => applyFilters(items, f), [items, f]);
  // Facets reflect the search term, but not the other checkboxes, so options don't vanish as you tick them.
  const searched = useMemo(() => applyFilters(items, { ...parseFilters(new URLSearchParams()), q: f.q }), [items, f.q]);
  const [drawer, setDrawer] = useState(false);

  const update = (patch: Partial<Filters>) => router.replace(pathname + filtersToQuery({ ...f, ...patch }), { scroll: false });
  const toggle = (key: "sub" | "condition" | "voltage" | "capacity", value: string) => {
    const cur = f[key] as string[];
    update({ [key]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] });
  };
  const reset = () => router.replace(pathname + filtersToQuery({ ...parseFilters(new URLSearchParams()), q: f.q, sort: f.sort }), { scroll: false });

  const n = activeFilterCount(f);
  const panel = <FilterPanel items={searched} category={category} f={f} toggle={toggle} update={update} />;

  return (
    <div className="flex gap-6">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-40 max-h-[calc(100vh-11rem)] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold text-gray-800">
              <SlidersHorizontal className="h-4 w-4 text-brand-600" /> Filters
            </h2>
            {n > 0 && (
              <button onClick={reset} className="text-xs font-semibold text-accent-600 hover:underline">
                Clear all
              </button>
            )}
          </div>
          {panel}
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
          <button onClick={() => setDrawer(true)} className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 lg:hidden">
            <SlidersHorizontal className="h-4 w-4" /> Filters
            {n > 0 && <span className="rounded-full bg-accent-600 px-1.5 text-[11px] text-white">{n}</span>}
          </button>
          <p className="text-sm text-gray-600">
            <strong className="text-gray-900">{results.length}</strong> machines
            {f.q && (
              <>
                {" "}for “<strong className="text-gray-900">{f.q}</strong>”
              </>
            )}
          </p>
          <label className="ml-auto flex items-center gap-2 text-sm text-gray-600">
            <span className="hidden sm:inline">Sort:</span>
            <select
              value={f.sort}
              onChange={(e) => update({ sort: e.target.value as SortKey })}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-brand-600"
            >
              {Object.entries(sortOptions).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Active chips */}
        {(n > 0 || f.q) && (
          <div className="mb-4 flex flex-wrap gap-2">
            {f.q && <Chip label={`Search: ${f.q}`} onRemove={() => update({ q: "" })} />}
            {f.sub.map((s) => (
              <Chip key={s} label={category?.subcategories.find((x) => x.slug === s)?.name ?? s} onRemove={() => toggle("sub", s)} />
            ))}
            {f.condition.map((c) => (
              <Chip key={c} label={conditionLabels[c]} onRemove={() => toggle("condition", c)} />
            ))}
            {f.voltage.map((v) => (
              <Chip key={v} label={v} onRemove={() => toggle("voltage", v)} />
            ))}
            {f.capacity.map((c) => (
              <Chip key={c} label={c} onRemove={() => toggle("capacity", c)} />
            ))}
            {f.min !== null && <Chip label={`Min ${formatBDT(f.min)}`} onRemove={() => update({ min: null })} />}
            {f.max !== null && <Chip label={`Max ${formatBDT(f.max)}`} onRemove={() => update({ max: null })} />}
          </div>
        )}

        {results.length ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3 xl:grid-cols-4">
            {results.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <SearchX className="h-12 w-12 text-gray-300" />
            <p className="font-semibold text-gray-700">কোনো মেশিন পাওয়া যায়নি</p>
            <p className="max-w-sm text-sm text-gray-500">Filter কমিয়ে দেখুন, অথবা আপনার প্রয়োজনীয় মেশিনের জন্য কাস্টম কোটেশন দিন।</p>
            <div className="flex gap-2">
              <button onClick={() => router.replace(pathname)} className="rounded-xl border-2 border-brand-600 px-4 py-2 text-sm font-bold text-brand-700">
                Reset
              </button>
              <Link href="/quotation" className="rounded-xl bg-accent-600 px-4 py-2 text-sm font-bold text-white">
                Custom Quotation
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Mobile filter drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawer(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-3xl bg-white">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="font-bold">Filters</h2>
              <button onClick={() => setDrawer(false)} aria-label="Close filters" className="rounded-full p-1.5 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{panel}</div>
            <div className="flex gap-2 border-t p-4">
              <button onClick={reset} className="flex-1 rounded-xl border-2 border-gray-200 py-2.5 text-sm font-bold text-gray-700">
                Clear
              </button>
              <button onClick={() => setDrawer(false)} className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white">
                Show {results.length} results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-3 pr-1 text-xs font-semibold text-brand-700">
      {label}
      <button onClick={onRemove} aria-label={`Remove ${label}`} className="rounded-full p-0.5 hover:bg-brand-100">
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}

type PanelProps = {
  items: Product[];
  category?: Category;
  f: Filters;
  toggle: (key: "sub" | "condition" | "voltage" | "capacity", value: string) => void;
  update: (patch: Partial<Filters>) => void;
};

function FilterPanel({ items, category, f, toggle, update }: PanelProps) {
  const subCounts = facetCounts(items, "subcategory");
  const condCounts = facetCounts(items, "condition");
  const voltCounts = facetCounts(items, "voltage");
  const capCounts = facetCounts(items, "capacity");

  return (
    <div className="divide-y divide-gray-100">
      {category && (
        <Group title="Type">
          {category.subcategories
            .filter((s) => subCounts.has(s.slug))
            .map((s) => (
              <Check key={s.slug} label={s.name} count={subCounts.get(s.slug)} checked={f.sub.includes(s.slug)} onChange={() => toggle("sub", s.slug)} />
            ))}
        </Group>
      )}
      <Group title="Condition">
        {(Object.keys(conditionLabels) as Condition[])
          .filter((c) => condCounts.has(c))
          .map((c) => (
            <Check key={c} label={conditionLabels[c]} count={condCounts.get(c)} checked={f.condition.includes(c)} onChange={() => toggle("condition", c)} />
          ))}
      </Group>
      <Group title="Voltage / Power">
        {[...voltCounts].map(([v, count]) => (
          <Check key={v} label={v} count={count} checked={f.voltage.includes(v)} onChange={() => toggle("voltage", v)} />
        ))}
      </Group>
      <Group title="Price (৳)">
        <PriceRange key={`${f.min}-${f.max}`} min={f.min} max={f.max} onApply={(min, max) => update({ min, max })} />
      </Group>
      <Group title="Capacity">
        <div className="max-h-56 space-y-0.5 overflow-y-auto pr-1">
          {[...capCounts]
            .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
            .map(([c, count]) => (
              <Check key={c} label={c} count={count} checked={f.capacity.includes(c)} onChange={() => toggle("capacity", c)} />
            ))}
        </div>
      </Group>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">{title}</h3>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Check({ label, count, checked, onChange }: { label: string; count?: number; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-brand-600" />
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-xs text-gray-400">{count}</span>}
    </label>
  );
}

function PriceRange({ min, max, onApply }: { min: number | null; max: number | null; onApply: (min: number | null, max: number | null) => void }) {
  const [lo, setLo] = useState(min?.toString() ?? "");
  const [hi, setHi] = useState(max?.toString() ?? "");
  const parse = (v: string) => (v.trim() === "" || Number.isNaN(Number(v)) ? null : Number(v));
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onApply(parse(lo), parse(hi));
      }}
      className="flex items-center gap-2"
    >
      <input value={lo} onChange={(e) => setLo(e.target.value)} inputMode="numeric" placeholder="Min" aria-label="Minimum price" className="w-full min-w-0 rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-brand-600" />
      <span className="text-gray-400">–</span>
      <input value={hi} onChange={(e) => setHi(e.target.value)} inputMode="numeric" placeholder="Max" aria-label="Maximum price" className="w-full min-w-0 rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-brand-600" />
      <button type="submit" className="rounded-lg bg-brand-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-brand-700">
        Go
      </button>
    </form>
  );
}
