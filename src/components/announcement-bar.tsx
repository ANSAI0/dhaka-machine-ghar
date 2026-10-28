import Link from "next/link";
import { Factory, PencilRuler, Scale, ShieldCheck, Truck, Wallet } from "lucide-react";
import { getSite } from "@/lib/settings";

const itemsFor = (advance: number) => [
  { Icon: Scale, text: "এখন কেজি হিসেবেও কিনতে পারবেন", tag: "Buy by KG", href: "/contact" },
  { Icon: PencilRuler, text: "নিজের মনমতো কাস্টম মেশিন বানিয়ে নিন", tag: "Custom Build", href: "/quotation" },
  { Icon: Factory, text: "Factory-made Power Press · 10 – 100 Ton", tag: "Own Factory", href: "/category/power-press" },
  { Icon: Wallet, text: `${advance}% advance booking · bKash / Nagad / Bank`, tag: "Easy Booking", href: "/checkout" },
  { Icon: ShieldCheck, text: "Serial-based warranty & after-sales service", tag: "Warranty", href: "/warranty" },
  { Icon: Truck, text: "Delivery all over Bangladesh", tag: "Nationwide", href: "/contact" },
];

// Thin premium ribbon under the header; loops right-to-left and pauses on hover.
export async function AnnouncementBar() {
  const items = itemsFor((await getSite()).advancePercent);
  return (
    <div className="group/ann relative overflow-hidden border-b border-white/5 bg-gradient-to-r from-ink via-brand-900 to-ink text-white max-md:border-y max-md:border-gold-400/15 max-md:from-lux-950 max-md:via-lux-800 max-md:to-lux-950">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink to-transparent" />
      <ul className="flex w-max animate-marquee items-center py-1 group-hover/ann:[animation-play-state:paused]" style={{ ["--marquee-duration" as string]: "45s" }}>
        {[0, 1].map((copy) =>
          items.map(({ Icon, text, tag, href }) => (
            <li key={`${copy}-${tag}`} aria-hidden={copy === 1} className="flex items-center">
              <Link href={href} tabIndex={copy === 1 ? -1 : undefined} className="flex items-center gap-2 px-5 text-xs font-medium text-white/90 hover:text-white sm:px-7">
                <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-accent-600/90">
                  <Icon className="h-2.5 w-2.5" />
                </span>
                <span className="rounded border border-amber-300/40 px-1 text-[9px] font-bold leading-[14px] uppercase tracking-wider text-amber-200">{tag}</span>
                {text}
              </Link>
              <span className="h-1 w-1 rotate-45 bg-white/30" />
            </li>
          )),
        )}
      </ul>
    </div>
  );
}
