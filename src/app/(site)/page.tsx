import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, FileText, Phone, ShieldCheck, Truck, Wallet } from "lucide-react";
import { productsIn } from "@/lib/catalog";
import { getCatalog } from "@/lib/catalog-server";
import { heroImages } from "@/lib/hero-images";
import { getSite } from "@/lib/settings";
import type { SiteInfo } from "@/lib/site";
import { CategoryIcon } from "@/components/category-icon";
import { HeroSlider } from "@/components/hero-slider";
import { HomeSidebar } from "@/components/home-sidebar";
import { CategorySection } from "@/components/category-section";
import { ProductMarquee } from "@/components/product-marquee";
import { WhatsappIcon } from "@/components/brand-icons";

// "Especially for you" cards under the hero.
const shortcuts = (site: SiteInfo) => [
  { title: "Call Now", text: "Talk to us directly", cta: "Call Now", href: `tel:${site.phoneIntl}`, Icon: Phone, photo: "/shortcuts/heavy-duty-channel-body-power-press.webp", tone: "from-accent-700/95 via-accent-600/80 to-accent-500/55" },
  { title: "WhatsApp", text: "Send photos, get a price", cta: "Chat Now", href: `https://wa.me/${site.whatsappIntl}`, Icon: WhatsappIcon, photo: "/shortcuts/bou-body-power-press-lime.webp", tone: "from-brand-900/95 via-brand-700/80 to-brand-500/55" },
  { title: "Custom Machine", text: "Built to your size", cta: "Get Quote", href: "/quotation", Icon: FileText, photo: "/shortcuts/hydraulic-h-frame-press.webp", tone: "from-steel-700/95 via-steel-600/80 to-steel-500/55" },
  { title: "Track Order", text: "Live factory updates", cta: "Track", href: "/track", Icon: Truck, photo: "/shortcuts/channel-body-power-press-teal-yellow.webp", tone: "from-ink/95 via-gray-800/80 to-gray-600/55" },
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
  // Category tile photo: a featured machine's photo if there is one, else any photo in the category.
  const coverOf = (slug: string) => {
    const inCat = productsIn(catalog, slug).filter((p) => p.image);
    return (inCat.find((p) => p.featured) ?? inCat[0])?.image;
  };
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

        {/* Especially for you */}
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5 lux:border-white/[0.07] lux:bg-lux-800">
          <h2 className="mb-4 text-center text-lg font-bold text-gray-900 sm:text-xl lux:text-white">Especially For You</h2>
          <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 xl:grid-cols-4">
            {shortcuts(site).map(({ title, text, cta, href, Icon, photo, tone }) => (
              <a key={title} href={href} className="group relative isolate flex w-[46%] shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-ink p-3.5 text-white shadow-[0_10px_22px_-12px_rgba(16,24,40,0.55)] transition-transform hover:-translate-y-0.5 sm:w-auto sm:p-4 lux:ring-1 lux:ring-gold-400/25">
                <Image src={photo} alt="" fill sizes="(min-width: 1280px) 220px, 46vw" className="-z-10 object-cover opacity-45 transition-transform duration-500 group-hover:scale-105" />
                <span className={`absolute inset-0 -z-10 bg-gradient-to-br ${tone} lux:from-lux-900/95 lux:via-lux-800/85 lux:to-lux-700/60`} />
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[15px] font-bold leading-tight drop-shadow sm:text-base">{title}</p>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/30 lux:bg-gold-gradient lux:text-lux-950 lux:ring-0">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <p className="mb-4 mt-1 text-xs text-white/80 sm:text-sm">{text}</p>
                <span className="mt-auto rounded-lg bg-white py-2 text-center text-xs font-bold text-gray-900 sm:text-sm lux:bg-gold-gradient lux:text-lux-950">{cta}</span>
              </a>
            ))}
          </div>
        </section>

        {/* Shop by category — photo tiles */}
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 lux:border-white/[0.07] lux:bg-lux-800">
          <h2 className="mb-4 text-center text-lg font-bold text-gray-900 sm:mb-5 sm:text-xl lux:text-white">Shop by Category</h2>
          <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-5 sm:gap-4 sm:overflow-visible sm:px-0">
            {categories.map((c) => {
              const img = coverOf(c.slug);
              return (
                <Link key={c.slug} href={`/category/${c.slug}`} className="group flex w-[27%] shrink-0 snap-start flex-col items-center gap-2 text-center sm:w-auto">
                  <span className="relative block aspect-square w-full overflow-hidden rounded-2xl border border-gray-100 bg-studio shadow-sm transition-shadow group-hover:shadow-md lux:border-white/10 lux:bg-lux-700 lux:bg-none">
                    {img ? (
                      <Image src={img} alt="" fill sizes="(min-width: 640px) 160px, 30vw" className="object-contain p-1.5 drop-shadow-[0_8px_8px_rgba(15,23,42,0.16)] transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-brand-600 lux:text-gold-300">
                        <CategoryIcon name={c.icon} className="h-9 w-9" strokeWidth={1.5} />
                      </span>
                    )}
                  </span>
                  <span className="line-clamp-2 text-[11px] font-semibold leading-tight text-gray-700 group-hover:text-brand-700 sm:text-sm lux:text-white/85">{c.name}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Popular machines — continuous ribbon */}
        <ProductMarquee title="Popular Machines" items={popular} href="/shop" />

        {/* Trust band */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 via-brand-800 to-steel-700 p-4 shadow-lg sm:rounded-3xl sm:p-6 lux:border lux:border-gold-400/20 lux:from-lux-800 lux:via-lux-900 lux:to-brand-900">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border-[30px] border-white/5" />
          <div className="no-scrollbar relative grid grid-cols-2 gap-3 lg:grid-cols-4 max-md:-mx-4 max-md:flex max-md:snap-x max-md:overflow-x-auto max-md:px-4">
            {trust(site).map(({ Icon, title, text }) => (
              <div key={title} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 md:backdrop-blur sm:p-4 max-md:w-[200px] max-md:shrink-0 max-md:snap-start lux:border-gold-400/15 lux:bg-lux-950/50">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/15 sm:h-12 sm:w-12 lux:bg-gold-400/10 lux:text-gold-300 lux:ring-gold-400/25">
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
          <CategorySection key={c.slug} title={c.name} items={productsIn(catalog, c.slug)} href={`/category/${c.slug}`} />
        ))}

        {/* Custom machine banner */}
        <section className="relative overflow-hidden rounded-2xl shadow-lg sm:rounded-3xl lux:ring-1 lux:ring-gold-400/20">
          <Image src={heroImages.hall.src} alt="" fill sizes="(min-width: 1024px) 75vw, 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/70 to-ink/30" />
          <div className="relative flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div className="max-w-xl">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70 lux:text-gold-300"><span className="h-1.5 w-1.5 rounded-full bg-accent-500 lux:bg-gold-400" /> Custom Order</p>
              <h2 className="mt-1 text-2xl font-bold leading-tight text-white sm:text-3xl">যে মেশিন দরকার, সেটাই বানিয়ে দেব</h2>
              <p className="mt-2 text-sm text-white/75 sm:text-base">Tell us the tonnage, size and job — we&apos;ll send a quotation, and you can follow every build step online.</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:flex-col">
              <Link href="/quotation" className="flex items-center justify-center gap-2 rounded-xl bg-accent-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-accent-600/30 hover:bg-accent-500 lux:bg-gold-gradient lux:text-lux-950 lux:shadow-gold-500/30">
                Get a Quote <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={`tel:${site.phoneIntl}`} className="flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white md:backdrop-blur hover:bg-white/20">
                <Phone className="h-4 w-4" /> {site.phone}
              </a>
            </div>
          </div>
          <a href={heroImages.hall.source} target="_blank" rel="noopener nofollow" className="absolute bottom-1.5 right-3 text-[9px] text-white/40 hover:text-white/70">
            Photo: {heroImages.hall.credit}
          </a>
        </section>

        {categories.slice(2).map((c) => (
          <CategorySection key={c.slug} title={c.name} items={productsIn(catalog, c.slug)} href={`/category/${c.slug}`} />
        ))}
      </div>
    </div>
  );
}
