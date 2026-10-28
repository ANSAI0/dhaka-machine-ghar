import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, FileText, Phone, ShieldCheck, Truck, Wallet } from "lucide-react";
import { productsIn, type Product } from "@/lib/catalog";
import { getCatalog } from "@/lib/catalog-server";
import { heroImages } from "@/lib/hero-images";
import { getSite } from "@/lib/settings";
import type { SiteInfo } from "@/lib/site";
import { CategoryIcon } from "@/components/category-icon";
import { HeroSlider } from "@/components/hero-slider";
import { HomeSidebar } from "@/components/home-sidebar";
import { ProductCard } from "@/components/product-card";
import { ProductMarquee } from "@/components/product-marquee";
import { WhatsappIcon } from "@/components/brand-icons";

const offers = (site: SiteInfo) => [
  { title: "Call Us", sub: site.phone, href: `tel:${site.phoneIntl}`, Icon: Phone, tint: "bg-accent-50 text-accent-600 ring-accent-100" },
  { title: "WhatsApp", sub: "Chat with photos", href: `https://wa.me/${site.whatsappIntl}`, Icon: WhatsappIcon, tint: "bg-[#e8f8ee] text-[#128c4a] ring-[#c9eed7]" },
  { title: "Custom Build", sub: "Made to order", href: "/quotation", Icon: FileText, tint: "bg-steel-50 text-steel-600 ring-steel-100" },
  { title: "Track Order", sub: "Live updates", href: "/track", Icon: Truck, tint: "bg-brand-50 text-brand-600 ring-brand-100" },
];

const trust = (site: SiteInfo) => [
  { Icon: BadgeCheck, title: "Own Factory", text: "Made in Keraniganj" },
  { Icon: ShieldCheck, title: "Warranty & Service", text: "Serial-based warranty" },
  { Icon: Wallet, title: `${site.advancePercent}% Advance Booking`, text: "bKash / Nagad / Bank" },
  { Icon: Truck, title: "Nationwide Delivery", text: "Transport & courier" },
];

export default async function Home() {
  const [catalog, site] = await Promise.all([getCatalog(), getSite()]);
  const { categories, products } = catalog;
  // Ribbon: featured first, then the rest — photographed machines only, one per photo.
  const seen = new Set<string>();
  const popular = [...products.filter((p) => p.featured), ...products.filter((p) => !p.featured)]
    .filter((p) => p.image && !seen.has(p.image) && seen.add(p.image))
    .slice(0, 14);
  return (
    <div className="container mx-auto flex gap-6 px-3 pt-4 sm:px-4 lg:pt-6">
      <h1 className="sr-only">{site.name} — পাওয়ার প্রেস ও ইন্ডাস্ট্রিয়াল মেশিন</h1>
      <HomeSidebar catalog={catalog} />

      <div className="min-w-0 flex-1 space-y-6 sm:space-y-8">
        <HeroSlider />

        {/* Quick actions */}
        <section className="grid grid-cols-2 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm xl:grid-cols-4">
          {offers(site).map(({ title, sub, href, Icon, tint }, idx) => (
            <a
              key={title}
              href={href}
              className={`group flex items-center gap-3 p-3.5 transition-colors hover:bg-gray-50 sm:p-5 ${idx % 2 === 0 ? "border-r" : "xl:border-r"} ${idx < 2 ? "border-b xl:border-b-0" : ""} border-gray-100 last:border-r-0`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-110 sm:h-12 sm:w-12 ${tint}`}>
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-gray-900 sm:text-[15px]">{title}</span>
                <span className="block truncate text-xs text-gray-500">{sub}</span>
              </span>
              <ArrowRight className="hidden h-4 w-4 shrink-0 -translate-x-1 text-gray-300 transition-all group-hover:translate-x-0 group-hover:text-gray-700 2xl:block" />
            </a>
          ))}
        </section>

        {/* Popular machines — continuous ribbon */}
        <ProductMarquee title="Popular Machines" subtitle="Featured" items={popular} href="/shop" />

        {/* Shop by category */}
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-7">
          <SectionHeading eyebrow="Browse" title="Shop by Category" center />
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 sm:gap-4">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="group flex flex-col items-center gap-2.5 rounded-2xl border border-transparent px-1 py-3 text-center transition-all hover:border-brand-100 hover:bg-gradient-to-b hover:from-brand-50 hover:to-white hover:shadow-sm sm:py-4"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-steel-50 text-brand-600 ring-1 ring-brand-100 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:from-brand-600 group-hover:to-brand-800 group-hover:text-white group-hover:shadow-lg group-hover:shadow-brand-600/25 sm:h-[72px] sm:w-[72px]">
                  <CategoryIcon name={c.icon} className="h-7 w-7 sm:h-9 sm:w-9" strokeWidth={1.5} />
                </span>
                <span className="line-clamp-2 text-xs font-bold leading-tight text-gray-800 sm:text-sm">{c.name}</span>
                <span className="-mt-1.5 text-[10px] font-semibold text-gray-400 sm:text-[11px]">{productsIn(catalog, c.slug).length} machines</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Trust band */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 via-brand-800 to-steel-700 p-4 shadow-lg sm:rounded-3xl sm:p-6">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border-[30px] border-white/5" />
          <div className="relative grid grid-cols-2 gap-3 lg:grid-cols-4">
            {trust(site).map(({ Icon, title, text }) => (
              <div key={title} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur sm:p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/15 sm:h-12 sm:w-12">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold leading-tight text-white sm:text-sm">{title}</p>
                  <p className="mt-0.5 text-[11px] text-white/60 sm:text-xs">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {categories.slice(0, 2).map((c) => (
          <ProductSection key={c.slug} title={c.name} subtitle="Category" items={productsIn(catalog, c.slug).slice(0, 10)} total={productsIn(catalog, c.slug).length} href={`/category/${c.slug}`} />
        ))}

        {/* Custom machine banner */}
        <section className="relative overflow-hidden rounded-2xl shadow-lg sm:rounded-3xl">
          <Image src={heroImages.hall.src} alt="" fill sizes="(min-width: 1024px) 75vw, 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/70 to-ink/30" />
          <div className="relative flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div className="max-w-xl">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70"><span className="h-1.5 w-1.5 rounded-full bg-accent-500" /> Custom Order</p>
              <h2 className="mt-1 text-2xl font-extrabold leading-tight text-white sm:text-3xl">যে মেশিন দরকার, সেটাই বানিয়ে দেব</h2>
              <p className="mt-2 text-sm text-white/75 sm:text-base">Tell us the tonnage, size and job — we&apos;ll send a quotation, and you can follow every build step online.</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:flex-col">
              <Link href="/quotation" className="flex items-center justify-center gap-2 rounded-xl bg-accent-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-accent-600/30 hover:bg-accent-500">
                Get a Quote <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={`tel:${site.phoneIntl}`} className="flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur hover:bg-white/20">
                <Phone className="h-4 w-4" /> {site.phone}
              </a>
            </div>
          </div>
          <a href={heroImages.hall.source} target="_blank" rel="noopener nofollow" className="absolute bottom-1.5 right-3 text-[9px] text-white/40 hover:text-white/70">
            Photo: {heroImages.hall.credit}
          </a>
        </section>

        {categories.slice(2).map((c) => (
          <ProductSection key={c.slug} title={c.name} subtitle="Category" items={productsIn(catalog, c.slug).slice(0, 10)} total={productsIn(catalog, c.slug).length} href={`/category/${c.slug}`} />
        ))}
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, center }: { eyebrow: string; title: string; center?: boolean }) {
  return (
    <div className={`mb-5 sm:mb-6 ${center ? "text-center" : ""}`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent-600">{eyebrow}</p>
      <h2 className="mt-1 text-xl font-extrabold text-gray-900 sm:text-2xl">{title}</h2>
      {center && <span className="mx-auto mt-2 block h-1 w-12 rounded-full bg-gradient-to-r from-brand-600 to-steel-600" />}
    </div>
  );
}

function ProductSection({ title, subtitle, items, total, href }: { title: string; subtitle: string; items: Product[]; total?: number; href: string }) {
  if (!items.length) return null;
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="flex items-stretch gap-3">
          <span className="w-1 rounded-full bg-gradient-to-b from-accent-600 to-brand-600" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">{subtitle}</p>
            <h2 className="text-lg font-extrabold text-gray-900 sm:text-xl">{title}</h2>
          </div>
        </div>
        <Link href={href} className="flex shrink-0 items-center gap-1 rounded-full border border-brand-100 bg-white px-3.5 py-1.5 text-xs font-bold text-brand-700 shadow-sm hover:border-brand-600 hover:bg-brand-600 hover:text-white">
          {total ? `View all ${total}` : "View all"} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3 xl:grid-cols-5">
        {items.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}
