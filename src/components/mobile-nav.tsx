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

export function MobileNav() {
  const path = usePathname();
  const { count } = useCart();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.06] bg-lux-950 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.6)] md:hidden">
      <div className="flex">
        {items.map(({ href, label, Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link key={href} href={href} className={`relative flex flex-1 flex-col items-center gap-1 pb-2 pt-2.5 text-[10.5px] font-semibold tracking-wide ${active ? "text-gold-300" : "text-white/45"}`}>
              {active && <span className="absolute top-0 h-[2px] w-10 rounded-b-full bg-gold-gradient shadow-[0_0_12px_rgba(214,174,85,0.7)]" />}
              <span className={`relative flex h-8 w-12 items-center justify-center rounded-full transition-colors ${active ? "bg-gold-400/10" : ""}`}>
                <Icon className="h-[19px] w-[19px]" strokeWidth={active ? 2.1 : 1.7} />
                {href === "/checkout" && count > 0 && (
                  <span className="absolute right-1 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[9px] font-bold text-white ring-2 ring-lux-950">{count}</span>
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
