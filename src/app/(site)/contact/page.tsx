import type { Metadata } from "next";
import { Clock, Factory, Mail, Phone, Store } from "lucide-react";
import { getSite } from "@/lib/settings";
import { Breadcrumb } from "@/components/breadcrumb";
import { heroImages } from "@/lib/hero-images";
import { PageHero } from "@/components/page-hero";
import { FacebookIcon, WhatsappIcon, YoutubeIcon } from "@/components/brand-icons";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: "Contact",
    description: `Contact Dhaka Machine Ghar — factory at ${site.address}, showroom at ${site.showroom}. Hotline ${site.phone}.`,
  };
}

export default async function ContactPage() {
  const site = await getSite();
  const cards = [
    { Icon: Phone, t: "হটলাইন", v: site.phone, href: `tel:${site.phoneIntl}` },
    { Icon: WhatsappIcon, t: "WhatsApp", v: site.phone, href: `https://wa.me/${site.whatsappIntl}` },
    { Icon: Mail, t: "ইমেইল", v: site.email, href: `mailto:${site.email}` },
    { Icon: Clock, t: "সময়", v: site.hours },
  ];
  return (
    <div className="container mx-auto px-3 pt-4 sm:px-4 lg:pt-6">
      <Breadcrumb items={[{ label: "Contact" }]} />
      <PageHero eyebrow="Get in Touch" title="Contact Us" text="Call, message us on WhatsApp, or visit our showroom and factory." image={heroImages.hall.src} Icon={Phone} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ Icon, t, v, href }) => {
          const body = (
            <>
              <Icon className="h-7 w-7 text-brand-600" />
              <p className="mt-2 text-sm text-gray-500">{t}</p>
              <p className="font-bold text-gray-900">{v}</p>
            </>
          );
          return href ? (
            <a key={t} href={href} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:border-brand-200">{body}</a>
          ) : (
            <div key={t} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">{body}</div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <Factory className="h-7 w-7 text-accent-600" />
            <p className="mt-2 font-bold text-gray-900">কারখানা ও অফিস</p>
            <p className="text-sm text-gray-600">{site.address}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <Store className="h-7 w-7 text-accent-600" />
            <p className="mt-2 font-bold text-gray-900">শোরুম</p>
            <p className="text-sm text-gray-600">{site.showroom}</p>
          </div>
          <div className="flex gap-3">
            <a href={site.facebook} target="_blank" rel="noopener" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1877f2] py-3 text-sm font-bold text-white"><FacebookIcon className="h-4 w-4" /> Facebook</a>
            <a href={site.youtube} target="_blank" rel="noopener" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#ff0000] py-3 text-sm font-bold text-white"><YoutubeIcon className="h-4 w-4" /> YouTube</a>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-2">
          <iframe
            title="Dhaka Machine Ghar factory location"
            src={`https://www.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[360px] w-full lg:h-full"
          />
        </div>
      </div>
    </div>
  );
}
