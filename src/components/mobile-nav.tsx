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
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white md:hidden">
      <div className="flex">
        {items.map(({ href, label, Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link key={href} href={href} className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${active ? "text-brand-600" : "text-gray-500"}`}>
              {active && <span className="absolute top-0 h-0.5 w-8 rounded-b bg-accent-600" />}
              <span className="relative">
                <Icon className="h-5 w-5" />
                {href === "/checkout" && count > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-600 px-1 text-[9px] text-white">{count}</span>
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
