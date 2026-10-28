"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Home, LayoutGrid, ShoppingBag, Truck } from "lucide-react";
import { useCart } from "./cart";

const side = [
  [
    { href: "/", label: "Home", Icon: Home },
    { href: "/shop", label: "Shop", Icon: LayoutGrid },
  ],
  [
    { href: "/track", label: "Track", Icon: Truck },
    { href: "/quotation", label: "Quote", Icon: FileText },
  ],
];

// Phones: a floating dock with a raised cart button in the middle (gold in the dark luxury style).
export function MobileNav() {
  const path = usePathname();
  const { count } = useCart();
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  const cartOn = isActive("/checkout");

  const tab = ({ href, label, Icon }: (typeof side)[number][number]) => {
    const active = isActive(href);
    return (
      <Link key={href} href={href} className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold tracking-wide ${active ? "text-brand-700 lux:text-gold-300" : "text-gray-400 lux:text-white/45"}`}>
        <Icon className="h-[19px] w-[19px]" strokeWidth={active ? 2.1 : 1.7} />
        {label}
        <span className={`h-1 w-1 rounded-full ${active ? "bg-brand-600 lux:bg-gold-400 lux:shadow-[0_0_8px_rgba(214,174,85,0.9)]" : "bg-transparent"}`} />
      </Link>
    );
  };

  return (
    <nav className="fixed inset-x-4 bottom-3 z-40 pb-[env(safe-area-inset-bottom)] md:hidden" aria-label="Quick">
      <div className="relative flex items-end rounded-full border border-gray-200/80 bg-white px-2 shadow-[0_18px_40px_-14px_rgba(16,24,40,0.28)] lux:border-gold-400/15 lux:bg-lux-900 lux:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.05)]">
        {side[0].map(tab)}
        <div className="flex flex-1 justify-center">
          <Link
            href="/checkout"
            aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
            className={`relative -mt-6 mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow-[0_10px_24px_-6px_rgba(46,94,71,0.55)] ring-4 ring-[#f4f6f5] lux:bg-gold-gradient lux:text-lux-950 lux:shadow-[0_10px_24px_-6px_rgba(214,174,85,0.65)] lux:ring-lux-950 ${cartOn ? "scale-105" : ""}`}
          >
            <ShoppingBag className="h-6 w-6" strokeWidth={2} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white ring-2 ring-white lux:ring-lux-950">{count}</span>
            )}
          </Link>
        </div>
        {side[1].map(tab)}
      </div>
    </nav>
  );
}
