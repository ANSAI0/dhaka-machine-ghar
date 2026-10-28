import Image from "next/image";
import Link from "next/link";
import { brand as site } from "@/lib/site";

// "mark": the DMG logo on its own, large (site header).
// "full": small logo + Bangla/English name (mobile menu, footer).
export function Logo({ dark = false, variant = "full", className = "h-11 sm:h-14" }: { dark?: boolean; variant?: "full" | "mark"; className?: string }) {
  if (variant === "mark") {
    return (
      <Link href="/" aria-label={`${site.name} — home`} className="flex shrink-0 flex-col items-center">
        {/* The dark-luxury phone header gets the light-on-dark logo. */}
        <Image src="/brand/dmg-logo-transparent.png" alt={`${site.name} (DMG) logo`} width={1057} height={400} priority className={`w-auto transition-all duration-300 lux:hidden ${className}`} />
        <Image src="/brand/dmg-logo-on-dark.png" alt={`${site.name} (DMG) logo`} width={1057} height={400} priority className={`hidden w-auto transition-all duration-300 lux:block ${className}`} />
        <span className="mt-0.5 whitespace-nowrap text-[7.5px] font-bold uppercase leading-none tracking-[0.22em] text-gray-600 lux:text-gold-300/90 md:text-[8.5px]">{site.name}</span>
      </Link>
    );
  }
  return (
    <Link href="/" className="flex items-center gap-2" aria-label={site.name}>
      <Image src={dark ? "/brand/dmg-logo-on-dark.png" : "/brand/dmg-logo-transparent.png"} alt="DMG logo" width={1057} height={400} className="h-8 w-auto shrink-0 sm:h-10" />
      <span className="leading-tight">
        <span className={`block text-[15px] font-bold tracking-tight sm:text-base ${dark ? "text-white" : "text-brand-700"}`}>
          {site.nameBn}
        </span>
        <span className={`block text-[10px] font-semibold uppercase tracking-wider sm:text-[11px] ${dark ? "text-gray-300" : "text-accent-600"}`}>
          {site.name}
        </span>
      </span>
    </Link>
  );
}
