"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Menu, PackageSearch, Search, ShoppingBag, UserRound } from "lucide-react";
import type { Category } from "@/lib/catalog";
import { formatBDT } from "@/lib/site";
import { useCart } from "./cart";
import { useCatalog } from "./catalog-provider";
import { useCustomer } from "./customer-provider";
import { Logo } from "./logo";
import { MainNav } from "./main-nav";
import { MobileDrawer } from "./mobile-drawer";

// Pill search box.
function SearchBox({ onDone }: { onDone?: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const query = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
        router.push(`/shop${query}`);
        input.current?.blur();
        onDone?.();
      }}
      className="group/search flex h-11 w-full items-center rounded-full bg-gray-100 pl-4 pr-1 ring-1 ring-black/[0.04] transition-all duration-200 hover:bg-gray-100/70 focus-within:bg-white focus-within:shadow-[0_10px_30px_-12px_rgba(46,94,71,0.45)] focus-within:ring-2 focus-within:ring-brand-600/30 lux:bg-white/[0.06] lux:ring-white/10 lux:focus-within:bg-white/[0.09] lux:focus-within:ring-gold-400/50 lux:focus-within:shadow-[0_10px_30px_-12px_rgba(214,174,85,0.35)]"
    >
      <Search className="h-[18px] w-[18px] shrink-0 text-gray-400 transition-colors group-focus-within/search:text-brand-600 lux:text-white/40 lux:group-focus-within/search:text-gold-300" strokeWidth={2} />
      <input
        ref={input}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="মেশিন খুঁজুন — power press, lathe…"
        aria-label="Search machines"
        className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 lux:text-white lux:placeholder:text-white/35"
      />
      <button
        type="submit"
        aria-label="Search"
        className="flex h-9 w-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-brand-600 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 sm:w-auto sm:px-5 lux:bg-gold-gradient lux:text-lux-950 lux:shadow-[0_4px_14px_-4px_rgba(214,174,85,0.6)]"
      >
        <Search className="h-4 w-4 sm:hidden" strokeWidth={2.25} />
        <span className="hidden sm:inline">Search</span>
      </button>
    </form>
  );
}

// Header action icons: bare line icons that turn brand green on hover / when active.
const iconBox = "relative flex h-9 w-9 items-center justify-center text-gray-800 transition-colors group-hover:text-brand-700 lux:text-white/90";
const iconBoxOn = "!text-brand-700 lux:!text-gold-300";

export function Header({ categories, announcement }: { categories: Category[]; announcement?: React.ReactNode }) {
  const path = usePathname();
  const { items, count } = useCart();
  const { getProduct } = useCatalog();
  const { me } = useCustomer();
  const [drawer, setDrawer] = useState(false);
  const closeDrawer = useCallback(() => setDrawer(false), []);
  const [scrolled, setScrolled] = useState(false);
  const cartTotal = items.reduce((s, i) => s + (getProduct(i.slug)?.price ?? 0) * i.qty, 0);

  // Shrink the header once the page is scrolled (hysteresis avoids flicker at the threshold).
  useEffect(() => {
    const onScroll = () => setScrolled((was) => (was ? window.scrollY > 40 : window.scrollY > 120));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <header className={`sticky top-0 z-40 bg-white transition-shadow max-md:flex max-md:flex-col lux:bg-lux-950 md:bg-white/80 md:backdrop-blur-xl ${scrolled ? "shadow-md lux:shadow-black/60" : "shadow-sm lux:shadow-none"}`}>
      {/* Main row. Phones: menu | centred logo | call + cart. md+: logo, search, hotline, track, cart. */}
      <div className="border-b border-gray-100 lux:border-white/[0.06]">
        <div className={`container mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 transition-all duration-300 md:flex md:gap-6 md:px-4 ${scrolled ? "py-1.5" : "py-2 md:py-3"}`}>
          <button onClick={() => setDrawer(true)} className="-ml-1 justify-self-start rounded-lg p-1.5 text-gray-800 active:bg-gray-100 md:hidden lux:text-white/90 lux:active:bg-white/10" aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </button>
          <Logo variant="mark" className={scrolled ? "h-7 md:h-8" : "h-8 md:h-10"} />
          <div className="hidden min-w-0 flex-1 md:block lg:pr-6">
            <SearchBox />
          </div>

          <div className="flex items-center gap-1 justify-self-end md:gap-1.5">
            <Link
              href="/track"
              aria-current={isActive("/track") ? "page" : undefined}
              className="group hidden items-center gap-2 px-1 py-1 md:flex lg:px-2"
            >
              <span className={`${iconBox} ${isActive("/track") ? iconBoxOn : ""}`}>
                <PackageSearch className="h-6 w-6" strokeWidth={1.6} />
              </span>
              <span className="hidden leading-tight lg:block">
                <span className="block text-[11px] font-medium text-gray-500">Track</span>
                <span className="block text-sm font-bold text-gray-900 group-hover:text-brand-700">Your Order</span>
              </span>
            </Link>
            <span className="hidden h-7 w-px bg-gray-200 lg:block" />
            <Link href={me ? "/account" : "/account/login"} aria-label={me ? "My account" : "Sign in or register"} className="group flex items-center gap-2 px-1 py-1 lg:px-2">
              <span className={`relative ${iconBox} ${me ? iconBoxOn : ""}`}>
                <UserRound className="h-6 w-6" strokeWidth={1.6} />
                {me && <span className="absolute right-1 top-1 h-2 w-2 rounded-full border-2 border-white bg-emerald-500 lux:border-lux-950" />}
              </span>
              <span className="hidden max-w-[110px] leading-tight lg:block">
                <span className="block text-[11px] font-medium text-gray-500">{me ? "Welcome" : "Sign In"}</span>
                <span className="block truncate text-sm font-bold text-gray-900 group-hover:text-brand-700">{me ? me.name.split(" ")[0] : "My Account"}</span>
              </span>
            </Link>
            <span className="hidden h-7 w-px bg-gray-200 lg:block" />
            <Link href="/checkout" aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`} className="group flex items-center gap-2 px-1 py-1 lg:pl-2">
              {/* data-cart-target: where "add to cart" items fly to */}
              <span className={`relative ${iconBox} `} data-cart-target>
                <ShoppingBag className="h-6 w-6" strokeWidth={1.6} />
                <span className={`absolute -right-1.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white px-1 text-[10px] font-bold text-white lux:border-lux-950 ${count ? "bg-accent-600" : "bg-gray-400 lux:bg-white/25"}`}>{count}</span>
              </span>
              <span className="hidden leading-tight lg:block">
                <span className="block text-[11px] font-medium text-gray-500">My Cart</span>
                <span className="block text-sm font-bold text-gray-900 group-hover:text-brand-700">{formatBDT(cartTotal)}</span>
              </span>
            </Link>
          </div>
        </div>
        <div className={`px-3 md:hidden ${scrolled ? "pb-1.5" : "pb-2.5"}`}>
          <SearchBox />
        </div>
      </div>

      {/* Phones: the ribbon sits above the logo row; desktop: between the logo row and the menu. */}
      <div className="max-md:order-first">{announcement}</div>

      {/* Main nav */}
      <div className="hidden md:block">
        <MainNav categories={categories} />
      </div>

      <MobileDrawer open={drawer} onClose={closeDrawer} categories={categories} me={me} />
    </header>
  );
}
