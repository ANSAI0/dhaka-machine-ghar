import "server-only";
import { unstable_cache } from "next/cache";
import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { liveOfferInclude } from "./offers";
import type { Catalog, Product } from "./catalog";

export const CATALOG_TAG = "catalog";

type DbProduct = Prisma.ProductGetPayload<{ include: { category: true; subcategory: true; offers: true } }>;

function toProduct(p: DbProduct): Product {
  // A live admin offer replaces the price; the regular price becomes the struck-through one.
  const offer = p.offers[0] && p.offers[0].offerPrice < p.price ? p.offers[0] : undefined;
  return {
    slug: p.slug,
    name: p.name,
    nameBn: p.nameBn,
    category: p.category.slug,
    subcategory: p.subcategory?.slug ?? "",
    icon: p.category.icon,
    condition: p.condition,
    price: offer ? offer.offerPrice : p.price,
    oldPrice: offer ? p.price : (p.oldPrice ?? undefined),
    offer: offer ? { title: offer.title, endsAt: offer.endsAt?.toISOString() ?? null } : undefined,
    image: p.image ?? undefined,
    imageCredit: p.imageCredit ?? undefined,
    imageSource: p.imageSource ?? undefined,
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
  };
}

// The whole active catalog in one cached query — it's small, and every page needs most of it.
// Admin edits call revalidateTag(CATALOG_TAG).
export const getCatalog = unstable_cache(
  async (): Promise<Catalog> => {
    const [cats, prods] = await Promise.all([
      db.category.findMany({ orderBy: { sortOrder: "asc" }, include: { subcategories: { orderBy: { sortOrder: "asc" } } } }),
      db.product.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, include: { category: true, subcategory: true, offers: liveOfferInclude() } }),
    ]);
    return {
      categories: cats.map((c) => ({ slug: c.slug, name: c.name, nameBn: c.nameBn, icon: c.icon, subcategories: c.subcategories.map((s) => ({ slug: s.slug, name: s.name })) })),
      products: prods.map(toProduct),
    };
  },
  ["catalog"],
  // Short revalidate so offers that end on their own drop off within minutes.
  { tags: [CATALOG_TAG], revalidate: 300 },
);
