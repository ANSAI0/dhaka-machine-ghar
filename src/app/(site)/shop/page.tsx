import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getCatalog } from "@/lib/catalog-server";
import { Breadcrumb } from "@/components/breadcrumb";
import { heroImages } from "@/lib/hero-images";
import { PageHero } from "@/components/page-hero";
import { CategoryIcon } from "@/components/category-icon";
import { ShopView } from "@/components/shop-view";

export const metadata: Metadata = {
  title: "All Machines",
  description: "Power press, lathe, shaper, milling, drill, press brake, shear, tube bender and construction machinery with ৳ BDT prices.",
};

export default async function ShopPage() {
  const { categories, products } = await getCatalog();
  return (
    <div className="container mx-auto px-3 pt-4 sm:px-4 lg:pt-6">
      <Breadcrumb items={[{ label: "Shop" }]} />
      <PageHero eyebrow="Shop" title="All Machines" text="Factory-made power presses and foreign & reconditioned workshop machines." image={heroImages.workshop.src}>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          {categories.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} className="flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-sm font-semibold backdrop-blur transition hover:border-white/40 hover:bg-white hover:text-ink">
              <CategoryIcon name={c.icon} className="h-4 w-4" /> {c.name}
            </Link>
          ))}
        </div>
      </PageHero>
      <Suspense>
        <ShopView items={products} />
      </Suspense>
    </div>
  );
}
