"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Home, LayoutGrid, ShoppingCart, Truck } from "lucide-react";
import { useCart } from "./cart";

const items = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/shop", label: "Shop", Icon: LayoutGrid },
  { href: "/checkout", label: "Cart", Icon: ShoppingCart },
  { href: "/track", label: "Track", Icon: Truck },
  { href: "/quotation", label: "Quote", Icon: FileText },
];

// Phones: full-width dark bottom bar; the current page's icon sits in a raised round badge.
export function MobileNav() {
  const path = usePathname();
  const { count } = useCart();
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 rounded-t-2xl bg-brand-900 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.5)] md:hidden lux:bg-lux-900" aria-label="Quick">
      <div className="flex">
        {items.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`relative flex flex-1 flex-col items-center gap-1 pb-2 pt-2.5 text-[10.5px] font-semibold ${active ? "text-white" : "text-white/60"}`}>
              <span
                className={`relative flex items-center justify-center rounded-full transition-all duration-200 ${
                  active ? "-mt-6 h-11 w-11 bg-white text-brand-700 shadow-[0_6px_16px_-4px_rgba(0,0,0,0.45)] ring-4 ring-brand-900 lux:bg-gold-gradient lux:text-lux-950 lux:ring-lux-900" : "h-6 w-6"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
                {href === "/checkout" && count > 0 && (
                  <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[9px] font-bold text-white ring-2 ring-brand-900">{count}</span>
                )}
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
