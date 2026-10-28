// Catalog types shared by server and client. Data lives in the database (see catalog-server.ts);
// the initial catalog is in prisma/seed-data/catalog.ts.

export type Condition = "new" | "reconditioned";

export type Category = {
  slug: string;
  name: string;
  nameBn: string;
  icon: string; // lucide icon name, resolved in <CategoryIcon>
  subcategories: { slug: string; name: string }[];
};

export type Product = {
  slug: string;
  name: string;
  nameBn: string;
  category: string; // category slug
  subcategory: string; // subcategory slug, "" if none
  icon: string; // category icon, for the placeholder image
  condition: Condition;
  price: number;
  oldPrice?: number;
  image?: string; // falls back to a category illustration
  imageCredit?: string; // set for representative stock photos (shown as "প্রতীকী ছবি")
  imageSource?: string;
  brand: string;
  capacity: string;
  voltage: string;
  short: string;
  highlights: string[];
  specs: [string, string][];
  roi?: { product: string; unitsPerDay: number; profitPerUnit: number; monthlyCost: number }; // monthlyCost = electricity + operator + wear
  videoId?: string;
  featured?: boolean;
  landing?: boolean; // has an ad landing page at /lp/<slug>
  landingCopy?: { headline: string; sub: string };
  offer?: { title: string | null; endsAt: string | null }; // active admin offer; price/oldPrice already reflect it
};

export type Catalog = { categories: Category[]; products: Product[] };

export const discountPercent = (p: Product) => (p.oldPrice ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0);

export const findProduct = (c: Catalog, slug: string) => c.products.find((p) => p.slug === slug);
export const findCategory = (c: Catalog, slug: string) => c.categories.find((x) => x.slug === slug);
export const productsIn = (c: Catalog, category: string) => c.products.filter((p) => p.category === category);
