import { MapPin, Navigation } from "lucide-react";
import { getSite } from "@/lib/settings";

// Phones: a small map of the shop pin just above the footer, with a directions button.
export async function MapStrip() {
  const site = await getSite();
  if (!site.mapQuery) return null;
  const q = encodeURIComponent(site.mapQuery);

  return (
    <section aria-label="Our location" className="container mx-auto mt-10 px-3 md:hidden">
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lux:border-white/[0.08] lux:bg-lux-800">
        <div className="flex items-center gap-2 px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-700 lux:bg-white/10 lux:text-gold-300">
            <MapPin className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-gray-900 lux:text-white">আমাদের লোকেশন</h2>
            <p className="truncate text-xs text-gray-500 lux:text-white/50">{site.name}</p>
          </div>
        </div>
        <iframe
          src={`https://www.google.com/maps?q=${q}&z=16&output=embed`}
          title={`${site.name} on Google Maps`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block h-44 w-full border-0"
        />
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${q}`}
          target="_blank"
          rel="noopener"
          className="flex items-center justify-center gap-2 bg-brand-700 py-2.5 text-sm font-bold text-white lux:bg-gold-gradient lux:text-lux-950"
        >
          <Navigation className="h-4 w-4" /> Google Maps-এ দিক নির্দেশনা
        </a>
      </div>
    </section>
  );
}
