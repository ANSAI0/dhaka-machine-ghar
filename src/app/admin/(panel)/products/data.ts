import "server-only";
import { db } from "@/lib/db";
import type { Category, Product } from "@/lib/catalog";
import type { ProductFormValues } from "./product-form";

export async function getAdminCategories(): Promise<Category[]> {
  const cats = await db.category.findMany({ orderBy: { sortOrder: "asc" }, include: { subcategories: { orderBy: { sortOrder: "asc" } } } });
  return cats.map((c) => ({ slug: c.slug, name: c.name, nameBn: c.nameBn, icon: c.icon, subcategories: c.subcategories.map((s) => ({ slug: s.slug, name: s.name })) }));
}

// Includes inactive products, unlike the public catalog.
export async function getAdminProduct(slug: string): Promise<ProductFormValues | null> {
  const p = await db.product.findUnique({ where: { slug }, include: { category: true, subcategory: true } });
  if (!p) return null;
  return {
    slug: p.slug,
    name: p.name,
    nameBn: p.nameBn,
    category: p.category.slug,
    subcategory: p.subcategory?.slug ?? "",
    condition: p.condition,
    price: p.price,
    oldPrice: p.oldPrice ?? undefined,
    image: p.image ?? undefined,
    brand: p.brand,
    capacity: p.capacity,
    voltage: p.voltage,
    short: p.short,
    highlights: p.highlights,
    specs: p.specs as [string, string][],
    roi: (p.roi as Product["roi"]) ?? undefined,
    videoId: p.videoId ?? undefined,
    featured: p.featured,
    landing: p.landing,
    landingCopy: (p.landingCopy as Product["landingCopy"]) ?? undefined,
    active: p.active,
  };
}
