import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { findCategory, productsIn } from "@/lib/catalog";
import { getCatalog } from "@/lib/catalog-server";
import { Breadcrumb } from "@/components/breadcrumb";
import { heroImages } from "@/lib/hero-images";
import { PageHero } from "@/components/page-hero";
import { ShopView } from "@/components/shop-view";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getCatalog()).categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const cat = findCategory(await getCatalog(), (await params).slug);
  if (!cat) return {};
  return { title: `${cat.name} (${cat.nameBn})`, description: `${cat.name}: ${cat.subcategories.map((s) => s.name).join(", ")} — price in Bangladesh.` };
}

export default async function CategoryPage({ params }: Params) {
  const catalog = await getCatalog();
  const cat = findCategory(catalog, (await params).slug);
  if (!cat) notFound();
  const items = productsIn(catalog, cat.slug);

  return (
    <div className="container mx-auto px-3 pt-4 sm:px-4 lg:pt-6">
      <Breadcrumb items={[{ label: "Shop", href: "/shop" }, { label: cat.name }]} />
      <PageHero eyebrow={`Category · ${items.length} machines`} title={cat.name} text={cat.nameBn} image={heroImages.hall.src} />
      <Suspense>
        <ShopView items={items} category={cat} />
      </Suspense>
    </div>
  );
}
