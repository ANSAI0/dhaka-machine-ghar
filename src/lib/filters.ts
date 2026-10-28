import type { Condition, Product } from "./catalog";

export type Filters = {
  q: string;
  sub: string[];
  condition: Condition[];
  voltage: string[];
  capacity: string[];
  min: number | null;
  max: number | null;
  sort: SortKey;
};

export const sortOptions = {
  featured: "Featured",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  name: "Name A–Z",
} as const;
export type SortKey = keyof typeof sortOptions;

const list = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);
const num = (v: string | null) => (v && !Number.isNaN(Number(v)) ? Number(v) : null);

export function parseFilters(sp: URLSearchParams): Filters {
  const sort = sp.get("sort") ?? "featured";
  return {
    q: sp.get("q") ?? "",
    sub: list(sp.get("sub")),
    condition: list(sp.get("condition")) as Condition[],
    voltage: list(sp.get("voltage")),
    capacity: list(sp.get("capacity")),
    min: num(sp.get("min")),
    max: num(sp.get("max")),
    sort: sort in sortOptions ? (sort as SortKey) : "featured",
  };
}

export function filtersToQuery(f: Filters): string {
  const sp = new URLSearchParams();
  if (f.q) sp.set("q", f.q);
  if (f.sub.length) sp.set("sub", f.sub.join(","));
  if (f.condition.length) sp.set("condition", f.condition.join(","));
  if (f.voltage.length) sp.set("voltage", f.voltage.join(","));
  if (f.capacity.length) sp.set("capacity", f.capacity.join(","));
  if (f.min !== null) sp.set("min", String(f.min));
  if (f.max !== null) sp.set("max", String(f.max));
  if (f.sort !== "featured") sp.set("sort", f.sort);
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export const activeFilterCount = (f: Filters) =>
  f.sub.length + f.condition.length + f.voltage.length + f.capacity.length + (f.min !== null ? 1 : 0) + (f.max !== null ? 1 : 0);

function matchesQuery(p: Product, q: string) {
  const hay = [p.name, p.nameBn, p.brand, p.capacity, p.short, p.category, p.subcategory].join(" ").toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.includes(w));
}

export function applyFilters(items: Product[], f: Filters): Product[] {
  const out = items.filter(
    (p) =>
      (!f.q || matchesQuery(p, f.q)) &&
      (!f.sub.length || f.sub.includes(p.subcategory)) &&
      (!f.condition.length || f.condition.includes(p.condition)) &&
      (!f.voltage.length || f.voltage.includes(p.voltage)) &&
      (!f.capacity.length || f.capacity.includes(p.capacity)) &&
      (f.min === null || p.price >= f.min) &&
      (f.max === null || p.price <= f.max),
  );
  switch (f.sort) {
    case "price-asc":
      return out.sort((a, b) => a.price - b.price);
    case "price-desc":
      return out.sort((a, b) => b.price - a.price);
    case "name":
      return out.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return out.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  }
}

// Counts per option, so the sidebar can show "(3)" next to each choice.
export function facetCounts<K extends keyof Product>(items: Product[], key: K) {
  const m = new Map<string, number>();
  for (const p of items) m.set(String(p[key]), (m.get(String(p[key])) ?? 0) + 1);
  return m;
}
