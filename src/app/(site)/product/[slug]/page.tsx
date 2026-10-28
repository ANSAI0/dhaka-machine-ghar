import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, CheckCircle2, Phone, ShieldCheck, Truck, Wallet } from "lucide-react";
import { discountPercent, findCategory, findProduct } from "@/lib/catalog";
import { getCatalog } from "@/lib/catalog-server";
import { formatBDT } from "@/lib/site";
import { getSite } from "@/lib/settings";
import { Breadcrumb } from "@/components/breadcrumb";
import { ConditionBadge } from "@/components/condition-badge";
import { ProductOrderForm } from "@/components/order-form";
import { ProductActions } from "@/components/product-actions";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { ProductTabs } from "@/components/product-tabs";
import { RoiCalculator } from "@/components/roi-calculator";
import { WhatsappIcon, YoutubeIcon } from "@/components/brand-icons";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getCatalog()).products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = findProduct(await getCatalog(), (await params).slug);
  if (!p) return {};
  return {
    title: `${p.name} — ${formatBDT(p.price)}`,
    description: `${p.nameBn}. ${p.short} Price in Bangladesh: ${formatBDT(p.price)}.`,
    openGraph: { images: p.image ? [p.image] : ["/brand/dmg-logo.jpg"] },
  };
}

export default async function ProductPage({ params }: Params) {
  const [catalog, site] = await Promise.all([getCatalog(), getSite()]);
  const p = findProduct(catalog, (await params).slug);
  if (!p) notFound();
  const cat = findCategory(catalog, p.category)!;
  const sub = cat.subcategories.find((s) => s.slug === p.subcategory);
  const off = discountPercent(p);
  const advance = Math.round((p.price * site.advancePercent) / 100);
  const related = catalog.products.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 5);
  const waText = encodeURIComponent(`আসসালামু আলাইকুম, আমি "${p.name}" (${formatBDT(p.price)}) সম্পর্কে জানতে চাই।`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.short,
    brand: { "@type": "Brand", name: p.brand },
    image: p.image,
    itemCondition: p.condition === "new" ? "https://schema.org/NewCondition" : "https://schema.org/RefurbishedCondition",
    offers: { "@type": "Offer", priceCurrency: "BDT", price: p.price, availability: "https://schema.org/InStock", seller: { "@type": "Organization", name: site.name } },
  };

  return (
    <div className="container mx-auto px-3 pt-4 sm:px-4 lg:pt-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumb items={[{ label: cat.name, href: `/category/${cat.slug}` }, ...(sub ? [{ label: sub.name, href: `/category/${cat.slug}?sub=${sub.slug}` }] : []), { label: p.name }]} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Image */}
        <div className="lg:sticky lg:top-40 lg:self-start">
          <div data-product-image className="group relative aspect-square overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {off > 0 && <span className="absolute left-3 top-3 z-10 rounded-full bg-accent-600 px-3 py-1 text-xs font-bold text-white">{off}% ছাড়</span>}
            <ProductImage product={p} sizes="(max-width: 1024px) 100vw, 600px" priority />
          </div>
          {p.imageCredit && (
            <p className="mt-2 text-[11px] leading-snug text-gray-400">
              প্রতীকী ছবি — মেশিনের ধরন বোঝাতে। ছবি:{" "}
              {p.imageSource ? <a href={p.imageSource} target="_blank" rel="noopener nofollow" className="underline hover:text-gray-600">{p.imageCredit}</a> : p.imageCredit}
            </p>
          )}
        </div>

        {/* Summary */}
        <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <ConditionBadge condition={p.condition} />
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600">{p.brand}</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold leading-snug text-gray-900 sm:text-2xl">{p.name}</h1>
            <p className="mt-1 font-semibold text-brand-700">{p.nameBn}</p>
          </div>

          <div className="flex flex-wrap items-end gap-3 border-b border-gray-100 pb-4">
            <span className="text-3xl font-extrabold text-accent-600">{formatBDT(p.price)}</span>
            {p.oldPrice && <span className="pb-1 text-lg text-gray-400 line-through">{formatBDT(p.oldPrice)}</span>}
            {p.offer && (
              <span className="mb-1 rounded-full bg-accent-600 px-3 py-1 text-xs font-bold text-white">
                {p.offer.title ?? "অফার"}
                {p.offer.endsAt && ` · শেষ ${new Date(p.offer.endsAt).toLocaleDateString("bn-BD", { day: "numeric", month: "long", timeZone: "Asia/Dhaka" })}`}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 font-semibold text-brand-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
              {p.condition === "new" && p.brand === site.name ? "অর্ডারে তৈরি (Made to order)" : "স্টকে আছে (In Stock)"}
            </span>
            <span className="text-gray-500">Capacity: <strong className="text-gray-800">{p.capacity}</strong></span>
          </div>

          <p className="text-sm leading-relaxed text-gray-600">{p.short}</p>

          <ul className="grid gap-1.5 sm:grid-cols-2">
            {p.highlights.map((h) => (
              <li key={h} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-600" /> {h}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3 rounded-xl border border-steel-100 bg-steel-50 p-3">
            <Wallet className="h-8 w-8 shrink-0 text-steel-600" />
            <p className="text-sm text-gray-700">
              মাত্র <strong className="text-steel-700">{formatBDT(advance)}</strong> ({site.advancePercent}%) অগ্রিম দিয়ে বুকিং করুন — bKash / Nagad / Bank
            </p>
          </div>

          <ProductActions product={p} />
          <Link href={`/quotation?product=${p.slug}`} className="block text-center text-xs font-semibold text-steel-700 underline-offset-2 hover:underline">
            ভিন্ন টনেজ / সাইজ লাগবে? কাস্টম কোটেশন নিন →
          </Link>

          <div className="grid grid-cols-2 gap-2">
            <a href={`tel:${site.phoneIntl}`} className="flex items-center justify-center gap-2 rounded-xl bg-ink py-2.5 text-sm font-bold text-white hover:bg-gray-800">
              <Phone className="h-4 w-4" /> কল করুন
            </a>
            <a href={`https://wa.me/${site.whatsappIntl}?text=${waText}`} target="_blank" rel="noopener" className="flex items-center justify-center gap-2 rounded-xl bg-[#25d366] py-2.5 text-sm font-bold text-white hover:brightness-95">
              <WhatsappIcon className="h-4 w-4" /> WhatsApp
            </a>
          </div>

          <div className="grid grid-cols-3 divide-x divide-gray-200 rounded-xl border border-gray-100 bg-gray-50 py-3 text-center">
            {[
              { Icon: BadgeCheck, t: "লোড টেস্টেড" },
              { Icon: ShieldCheck, t: "ওয়ারেন্টি সহ" },
              { Icon: Truck, t: "সারা দেশে ডেলিভারি" },
            ].map(({ Icon, t }) => (
              <span key={t} className="flex flex-col items-center gap-1 px-1 text-[11px] font-semibold text-gray-700">
                <Icon className="h-5 w-5 text-brand-600" /> {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="mt-10">
        <ProductTabs
          tabs={[
            {
              id: "specs",
              label: "স্পেসিফিকেশন",
              content: (
                <div>
                  <h2 className="mb-1 text-lg font-extrabold text-gray-900 sm:text-xl">Technical Specifications</h2>
                  <p className="mb-5 text-sm text-gray-500">{p.name}</p>
                  <table className="w-full overflow-hidden rounded-xl text-sm">
                    <tbody>
                      {[["Model / Type", p.name] as [string, string], ["Brand", p.brand] as [string, string], ...p.specs, ["Power supply", p.voltage] as [string, string], ["Condition", p.condition === "new" ? "Brand New (Factory Made)" : "Foreign Reconditioned"] as [string, string]].map(([k, v], i) => (
                        <tr key={k} className={i % 2 ? "bg-white" : "bg-gray-50"}>
                          <th scope="row" className="w-2/5 p-3 text-left font-semibold text-gray-600">{k}</th>
                          <td className="p-3 font-medium text-gray-900">{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ),
            },
            {
              id: "roi",
              label: "লাভের হিসাব (ROI)",
              content: <RoiCalculator product={p} />,
            },
            {
              id: "video",
              label: "ভিডিও",
              content: p.videoId ? (
                <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${p.videoId}`}
                    title={`${p.name} working video`}
                    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <YoutubeIcon className="h-14 w-14 text-[#ff0000]" />
                  <p className="font-semibold text-gray-800">এই মেশিনের কাজের ভিডিও আমাদের YouTube চ্যানেলে দেখুন</p>
                  <a href={site.youtube} target="_blank" rel="noopener" className="rounded-xl bg-[#ff0000] px-5 py-2.5 text-sm font-bold text-white hover:brightness-95">
                    YouTube চ্যানেল
                  </a>
                </div>
              ),
            },
            {
              id: "delivery",
              label: "ডেলিভারি ও ওয়ারেন্টি",
              content: (
                <ul className="space-y-3 text-sm leading-relaxed text-gray-700">
                  <li><strong>অর্ডার প্রক্রিয়া:</strong> অগ্রিম বুকিংয়ের পর মেশিন কারখানায় তৈরি/সার্ভিস শুরু হয়। প্রতিটি ধাপ আপনি <a href="/track" className="font-semibold text-brand-700 underline">অর্ডার ট্র্যাকিং</a> পেজে লাইভ দেখতে পারবেন।</li>
                  <li><strong>ডেলিভারি:</strong> ঢাকার ভেতরে নিজস্ব পরিবহন; ঢাকার বাইরে ট্রান্সপোর্ট/কুরিয়ারে গেটপাস ও চালান সহ পাঠানো হয়।</li>
                  <li><strong>ইনস্টলেশন:</strong> ভারী মেশিনে ইঞ্জিনিয়ার দ্বারা ইনস্টলেশন ও ট্রায়াল রান।</li>
                  <li><strong>ওয়ারেন্টি:</strong> প্রতিটি মেশিনে সিরিয়াল নম্বর থাকে; সার্ভিস ও ওয়ারেন্টি দাবি <a href="/warranty" className="font-semibold text-brand-700 underline">Warranty &amp; Service</a> পেজ থেকে।</li>
                  <li><strong>শোরুম:</strong> কারখানা — {site.address}; শোরুম — {site.showroom}।</li>
                </ul>
              ),
            },
          ]}
        />
      </div>

      {/* One-step order */}
      <section id="order" className="mt-10 scroll-mt-40 rounded-2xl border-2 border-accent-100 bg-white p-5 shadow-sm sm:p-8">
        <h2 className="text-xl font-extrabold text-gray-900 sm:text-2xl">এক ধাপে অর্ডার করুন</h2>
        <p className="mb-5 text-sm text-gray-500">নিচের ফর্ম পূরণ করুন — আমাদের প্রতিনিধি কল করে অর্ডার নিশ্চিত করবেন।</p>
        <ProductOrderForm product={p} />
      </section>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 border-l-4 border-accent-600 pl-3 text-lg font-bold text-gray-800 sm:text-xl">একই ধরনের মেশিন</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3 xl:grid-cols-5">
            {related.map((r) => <ProductCard key={r.slug} product={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
