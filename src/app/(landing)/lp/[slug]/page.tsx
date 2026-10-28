import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, CheckCircle2, ChevronDown, ClipboardCheck, Cog, Factory, PaintBucket, Phone, ShieldCheck, Truck, Wallet, Wrench } from "lucide-react";
import { discountPercent, findProduct } from "@/lib/catalog";
import { getCatalog } from "@/lib/catalog-server";
import { formatBDT, type SiteInfo } from "@/lib/site";
import { getSite } from "@/lib/settings";
import { ConditionBadge } from "@/components/condition-badge";
import { ProductImage } from "@/components/product-image";
import { ProductOrderForm } from "@/components/order-form";
import { RoiCalculator } from "@/components/roi-calculator";
import { FacebookIcon, WhatsappIcon, YoutubeIcon } from "@/components/brand-icons";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getCatalog()).products.filter((p) => p.landing).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = findProduct(await getCatalog(), (await params).slug);
  if (!p?.landing) return {};
  return {
    title: p.landingCopy?.headline ?? p.nameBn,
    description: p.landingCopy?.sub ?? p.short,
    // Ad pages duplicate the product page, so keep them out of search results.
    robots: { index: false, follow: true },
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: { images: p.image ? [p.image] : ["/brand/dmg-logo.jpg"] },
  };
}

const buildSteps = [
  { Icon: ClipboardCheck, t: "অর্ডার রেজিস্টার" },
  { Icon: Factory, t: "স্টিল ফেব্রিকেশন" },
  { Icon: Cog, t: "মোটর ও প্যানেল সেটিং" },
  { Icon: BadgeCheck, t: "লোড টেস্ট" },
  { Icon: PaintBucket, t: "পেইন্টিং ও প্যাকিং" },
  { Icon: Truck, t: "ডেলিভারি" },
];

const faqs = (site: SiteInfo, advance: number) => [
  { q: "অর্ডার করতে কত টাকা অগ্রিম দিতে হবে?", a: `মোট মূল্যের ${site.advancePercent}% (${formatBDT(advance)}) bKash / Nagad / ব্যাংকে অগ্রিম দিয়ে বুকিং কনফার্ম করতে পারবেন। বাকি টাকা ডেলিভারির সময়।` },
  { q: "মেশিন কি নিজে দেখে কিনতে পারবো?", a: `অবশ্যই। কারখানা: ${site.address}। শোরুম: ${site.showroom}। আসার আগে ${site.phone} নম্বরে কল করুন।` },
  { q: "ঢাকার বাইরে ডেলিভারি হয়?", a: "হ্যাঁ, সারা বাংলাদেশে ট্রান্সপোর্ট বা কুরিয়ারে গেটপাস ও চালান সহ পাঠানো হয়। ভারী মেশিনে ইঞ্জিনিয়ার গিয়ে ইনস্টল করে দেন।" },
  { q: "ওয়ারেন্টি ও সার্ভিস কেমন?", a: "প্রতিটি মেশিনে সিরিয়াল নম্বর থাকে। ওয়েবসাইটের Warranty & Service পেজ থেকে বা ফোনে সার্ভিস দাবি করতে পারবেন।" },
  { q: "অর্ডারের পর মেশিন তৈরির আপডেট পাবো কীভাবে?", a: "ইনভয়েস বা মোবাইল নম্বর দিয়ে অর্ডার ট্র্যাকিং পেজে কারখানার ৬টি ধাপের লাইভ আপডেট দেখতে পারবেন।" },
];

export default async function LandingPage({ params }: Params) {
  const [catalog, site] = await Promise.all([getCatalog(), getSite()]);
  const p = findProduct(catalog, (await params).slug);
  if (!p?.landing) notFound();

  const off = discountPercent(p);
  const advance = Math.round((p.price * site.advancePercent) / 100);
  const headline = p.landingCopy?.headline ?? `${p.nameBn} — সরাসরি কারখানা থেকে`;
  const sub = p.landingCopy?.sub ?? p.short;
  const waText = encodeURIComponent(`আসসালামু আলাইকুম, আমি "${p.name}" অর্ডার করতে চাই।`);
  const benefits = [...p.highlights, "সরাসরি কারখানা থেকে — মধ্যস্বত্বভোগী নেই", "অর্ডার থেকে ডেলিভারি পর্যন্ত লাইভ ট্র্যাকিং", "ইনস্টলেশন ও ট্রেনিং সাপোর্ট"];

  return (
    <div className="pb-20 md:pb-0">
      {/* Minimal header */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/brand/dmg-logo-transparent.png" alt="DMG logo" width={1057} height={400} className="h-9 w-auto" />
            <span className="text-sm font-extrabold text-brand-700 sm:text-base">{site.nameBn}</span>
          </Link>
          <a href={`tel:${site.phoneIntl}`} className="flex items-center gap-2 rounded-full bg-accent-600 px-4 py-2 text-sm font-bold text-white hover:bg-accent-700">
            <Phone className="h-4 w-4" /> <span className="hidden sm:inline">কল করুন:</span> {site.phone}
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-900 via-brand-700 to-steel-700 text-white">
        <div className="mx-auto grid max-w-5xl items-center gap-6 px-4 py-8 md:grid-cols-2 md:py-12">
          <div className="space-y-4">
            <ConditionBadge condition={p.condition} />
            <h1 className="text-2xl font-extrabold leading-snug sm:text-4xl">{headline}</h1>
            <p className="text-white/85">{sub}</p>
            <div className="flex flex-wrap items-end gap-3">
              <span className="text-4xl font-extrabold">{formatBDT(p.price)}</span>
              {p.oldPrice && <span className="pb-1 text-lg text-white/60 line-through">{formatBDT(p.oldPrice)}</span>}
              {off > 0 && <span className="mb-1 rounded-full bg-accent-600 px-3 py-1 text-sm font-bold">{off}% ছাড়</span>}
            </div>
            <p className="flex items-center gap-2 text-sm text-white/85">
              <Wallet className="h-5 w-5 shrink-0" /> মাত্র <strong className="text-white">{formatBDT(advance)}</strong> অগ্রিম দিয়ে বুকিং
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#order" className="rounded-xl bg-accent-600 px-6 py-3 text-lg font-bold shadow-lg hover:bg-accent-700">এখনই অর্ডার করুন</a>
              <a href={`https://wa.me/${site.whatsappIntl}?text=${waText}`} target="_blank" rel="noopener" className="flex items-center gap-2 rounded-xl bg-white/15 px-5 py-3 font-bold backdrop-blur hover:bg-white/25">
                <WhatsappIcon className="h-5 w-5" /> WhatsApp
              </a>
            </div>
          </div>
          <div className="group relative aspect-square overflow-hidden rounded-3xl bg-white shadow-2xl">
            <ProductImage product={p} sizes="(max-width: 768px) 100vw, 480px" priority />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 px-4 py-4 text-sm sm:grid-cols-4">
          {[
            { Icon: Factory, t: "নিজস্ব কারখানা, কেরানীগঞ্জ" },
            { Icon: BadgeCheck, t: "লোড টেস্ট করে ডেলিভারি" },
            { Icon: ShieldCheck, t: "সিরিয়াল ভিত্তিক ওয়ারেন্টি" },
            { Icon: Truck, t: "সারা দেশে ডেলিভারি" },
          ].map(({ Icon, t }) => (
            <span key={t} className="flex items-center gap-2 font-semibold text-gray-700">
              <Icon className="h-5 w-5 shrink-0 text-brand-600" /> {t}
            </span>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-10 px-4 py-10">
        {/* Video */}
        <section>
          <SectionTitle>মেশিন চালু অবস্থায় দেখুন</SectionTitle>
          {p.videoId ? (
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-black shadow-lg">
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
            <a href={site.youtube} target="_blank" rel="noopener" className="flex flex-col items-center gap-3 rounded-2xl bg-ink px-6 py-12 text-center text-white hover:bg-gray-900">
              <YoutubeIcon className="h-16 w-16 text-[#ff0000]" />
              <span className="text-lg font-bold">আমাদের YouTube চ্যানেলে মেশিনের কাজের ভিডিও দেখুন</span>
            </a>
          )}
        </section>

        {/* Benefits + specs */}
        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <SectionTitle>কেন এই মেশিন?</SectionTitle>
            <ul className="space-y-3">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3 text-gray-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" /> {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <SectionTitle>টেকনিক্যাল স্পেসিফিকেশন</SectionTitle>
            <table className="w-full text-sm">
              <tbody>
                {[...p.specs, ["Power supply", p.voltage] as [string, string]].map(([k, v], i) => (
                  <tr key={k} className={i % 2 ? "" : "bg-gray-50"}>
                    <th scope="row" className="w-1/2 p-2.5 text-left font-semibold text-gray-600">{k}</th>
                    <td className="p-2.5 font-medium text-gray-900">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ROI */}
        {p.roi && (
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <SectionTitle>এই মেশিনে মাসে কত আয় সম্ভব?</SectionTitle>
            <RoiCalculator product={p} />
          </section>
        )}

        {/* Factory process */}
        <section>
          <SectionTitle>অর্ডারের পর আপনার মেশিন যেভাবে তৈরি হয়</SectionTitle>
          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {buildSteps.map(({ Icon, t }, i) => (
              <li key={t} className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm">
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <Icon className="h-6 w-6" />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-600 text-[10px] font-bold text-white">{i + 1}</span>
                </span>
                <span className="text-sm font-semibold text-gray-800">{t}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-center text-sm text-gray-500">প্রতিটি ধাপ আপনি মোবাইলে লাইভ ট্র্যাক করতে পারবেন।</p>
        </section>

        {/* Order form */}
        <section id="order" className="scroll-mt-20 rounded-3xl border-2 border-accent-600 bg-white p-5 shadow-xl sm:p-8">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">অর্ডার করতে নিচের ফর্মটি পূরণ করুন</h2>
            <p className="mt-1 text-gray-600">{p.nameBn} — <strong className="text-accent-600">{formatBDT(p.price)}</strong></p>
          </div>
          <ProductOrderForm product={p} source={`landing:${p.slug}`} />
        </section>

        {/* FAQ */}
        <section>
          <SectionTitle>সাধারণ জিজ্ঞাসা</SectionTitle>
          <div className="space-y-2">
            {faqs(site, advance).map((f) => (
              <details key={f.q} className="group rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-gray-800">
                  {f.q}
                  <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Contact block */}
        <section className="rounded-2xl bg-ink p-6 text-center text-white">
          <Wrench className="mx-auto h-8 w-8 text-steel-500" />
          <p className="mt-2 text-lg font-bold">আরও জানতে সরাসরি কথা বলুন</p>
          <p className="text-sm text-gray-400">{site.address}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <a href={`tel:${site.phoneIntl}`} className="flex items-center gap-2 rounded-xl bg-accent-600 px-5 py-2.5 font-bold"><Phone className="h-4 w-4" /> {site.phone}</a>
            <a href={site.facebook} target="_blank" rel="noopener" className="flex items-center gap-2 rounded-xl bg-[#1877f2] px-5 py-2.5 font-bold"><FacebookIcon className="h-4 w-4" /> Facebook Page</a>
          </div>
        </section>
      </div>

      <footer className="border-t border-gray-200 bg-white py-5 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} {site.name} · <Link href={`/product/${p.slug}`} className="underline">পূর্ণ প্রোডাক্ট পেজ</Link> · <Link href="/" className="underline">ওয়েবসাইট</Link>
      </footer>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-gray-200 bg-white p-2 md:hidden">
        <a href={`tel:${site.phoneIntl}`} className="flex items-center justify-center gap-2 rounded-xl bg-ink py-3 font-bold text-white"><Phone className="h-4 w-4" /> কল করুন</a>
        <a href="#order" className="flex items-center justify-center rounded-xl bg-accent-600 py-3 font-bold text-white">অর্ডার করুন</a>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 border-l-4 border-accent-600 pl-3 text-xl font-extrabold text-gray-900 sm:text-2xl">{children}</h2>;
}
