import Link from "next/link";
import { Mail, MapPin, Phone, Store } from "lucide-react";
import type { Category } from "@/lib/catalog";
import { getSite } from "@/lib/settings";
import { FacebookIcon, WhatsappIcon, YoutubeIcon } from "./brand-icons";
import { Logo } from "./logo";

export async function Footer({ categories }: { categories: Category[] }) {
  const site = await getSite();
  return (
    <footer className="mt-16 border-t-4 border-accent-600 bg-brand-900 pb-24 pt-10 text-white md:pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo dark />
            <p className="text-sm leading-relaxed text-gray-300">
              Power press manufacturer and importer of foreign &amp; reconditioned workshop machinery — lathe, shaper, milling, drill and
              fabrication machines.
            </p>
            <div className="flex gap-3">
              <a href={site.facebook} target="_blank" rel="noopener" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1877f2] hover:opacity-90">
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a href={site.youtube} target="_blank" rel="noopener" aria-label="YouTube" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff0000] hover:opacity-90">
                <YoutubeIcon className="h-4 w-4" />
              </a>
              <a href={`https://wa.me/${site.whatsappIntl}`} target="_blank" rel="noopener" aria-label="WhatsApp" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25d366] hover:opacity-90">
                <WhatsappIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold">Categories</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/category/${c.slug}`} className="hover:text-white">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/track" className="hover:text-white">Live Factory Order Tracking</Link></li>
              <li><Link href="/quotation" className="hover:text-white">Custom Machine Quotation</Link></li>
              <li><Link href="/warranty" className="hover:text-white">Warranty &amp; Service</Link></li>
              <li><Link href="/shop" className="hover:text-white">All Machines</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold">Contact Us</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <p className="flex items-start gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-steel-500" /> Factory: {site.address}</p>
              <p className="flex items-start gap-2.5"><Store className="mt-0.5 h-4 w-4 shrink-0 text-steel-500" /> Showroom: {site.showroom}</p>
              <a href={`tel:${site.phoneIntl}`} className="flex items-center gap-2.5 font-semibold hover:text-white"><Phone className="h-4 w-4 text-steel-500" /> {site.phone}</a>
              <a href={`mailto:${site.email}`} className="flex items-center gap-2.5 hover:text-white"><Mail className="h-4 w-4 text-steel-500" /> {site.email}</a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-5 text-xs text-gray-400 sm:flex-row">
          <p>
            © {new Date().getFullYear()} <strong className="font-semibold text-white">{site.name}</strong>. All rights reserved.
          </p>
          <p className="text-[11px] tracking-wide text-gray-500">
            Designed &amp; Developed by <span className="font-semibold text-gray-300">An Nasmu Sakib</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
