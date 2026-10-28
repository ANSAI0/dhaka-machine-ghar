import type { Metadata } from "next";
import { Suspense } from "react";
import { ClipboardList, Factory, Phone, Ruler, Truck } from "lucide-react";
import { getSite } from "@/lib/settings";
import { Breadcrumb } from "@/components/breadcrumb";
import { heroImages } from "@/lib/hero-images";
import { PageHero } from "@/components/page-hero";
import { QuoteForm } from "@/components/quote-form";
import { WhatsappIcon } from "@/components/brand-icons";

export const metadata: Metadata = {
  title: "Custom Machine Quotation",
  description: "Get a quotation for a custom-tonnage power press or made-to-order machine from Dhaka Machine Ghar's Keraniganj factory.",
};

const steps = [
  { Icon: ClipboardList, t: "চাহিদা জানান", d: "টনেজ, সাইজ ও কাজের ধরন লিখে ফর্ম পাঠান" },
  { Icon: Ruler, t: "ইঞ্জিনিয়ারিং ডিজাইন", d: "আমাদের ইঞ্জিনিয়ার ডিজাইন ও দাম ঠিক করবেন" },
  { Icon: Factory, t: "কারখানায় তৈরি", d: "অগ্রিম বুকিংয়ের পর প্রোডাকশন — লাইভ ট্র্যাকিং সহ" },
  { Icon: Truck, t: "ডেলিভারি ও ইনস্টল", d: "লোড টেস্টের পর আপনার কারখানায় পৌঁছে দেওয়া হয়" },
];

export default async function QuotationPage() {
  const site = await getSite();
  return (
    <div className="container mx-auto px-3 pt-4 sm:px-4 lg:pt-6">
      <Breadcrumb items={[{ label: "Custom Quotation" }]} />
      <PageHero
        eyebrow="Custom Order"
        title="Custom Machine Quotation"
        text="Power presses, dies or any machine built to your tonnage and size in our own factory. Fill in the form — we'll send you the price within 24 hours."
        image={heroImages.welding.src}
        Icon={ClipboardList}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7 lg:col-span-2">
          <Suspense>
            <QuoteForm />
          </Suspense>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-bold text-gray-800">কীভাবে কাজ করে</h2>
            <ol className="space-y-4">
              {steps.map(({ Icon, t, d }, i) => (
                <li key={t} className="flex gap-3">
                  <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <Icon className="h-5 w-5" />
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-600 text-[10px] font-bold text-white">{i + 1}</span>
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-gray-800">{t}</span>
                    <span className="block text-xs text-gray-500">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-2xl bg-ink p-5 text-white">
            <p className="text-sm text-gray-300">ড্রয়িং বা স্যাম্পলের ছবি আছে?</p>
            <p className="mb-3 font-bold">সরাসরি WhatsApp-এ পাঠান</p>
            <div className="grid grid-cols-2 gap-2">
              <a href={`https://wa.me/${site.whatsappIntl}`} target="_blank" rel="noopener" className="flex items-center justify-center gap-2 rounded-xl bg-[#25d366] py-2.5 text-sm font-bold">
                <WhatsappIcon className="h-4 w-4" /> WhatsApp
              </a>
              <a href={`tel:${site.phoneIntl}`} className="flex items-center justify-center gap-2 rounded-xl bg-accent-600 py-2.5 text-sm font-bold">
                <Phone className="h-4 w-4" /> কল
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
