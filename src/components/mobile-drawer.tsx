"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronRight, FileText, Home, LayoutGrid, Mail, MapPin, Phone, ShieldCheck, Truck, UserRound, X } from "lucide-react";
import type { Category } from "@/lib/catalog";
import { FacebookIcon, WhatsappIcon, YoutubeIcon } from "./brand-icons";
import { CategoryIcon } from "./category-icon";
import type { Me } from "./customer-provider";
import { Logo } from "./logo";
import { useSite } from "./site-provider";

const links = [
  { href: "/", label: "হোম", Icon: Home },
  { href: "/shop", label: "সব মেশিন", Icon: LayoutGrid },
  { href: "/quotation", label: "কাস্টম কোটেশন", Icon: FileText },
  { href: "/track", label: "অর্ডার ট্র্যাকিং", Icon: Truck },
  { href: "/warranty", label: "ওয়ারেন্টি ও সার্ভিস", Icon: ShieldCheck },
  { href: "/contact", label: "যোগাযোগ", Icon: Mail },
];

// Rendered into <body> through a portal: the sticky header uses backdrop-blur, which would
// otherwise make this "fixed" panel size itself to the header instead of the screen.
export function MobileDrawer({ open, onClose, categories, me }: { open: boolean; onClose: () => void; categories: Category[]; me: Me | null }) {
  const site = useSite();
  const path = usePathname();
  const [mounted, setMounted] = useState(false);
  const [openCat, setOpenCat] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  // Close when the route changes.
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on navigation
  }, [path]);

  // Lock page scroll and close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted) return null;
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return createPortal(
    <div className={`fixed inset-0 z-[60] md:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div onClick={onClose} className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`absolute inset-y-0 left-0 flex w-[86vw] max-w-[340px] flex-col bg-lux-900 text-white shadow-2xl shadow-black ring-1 ring-white/5 transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Brand header — logo with the Bangla/English name */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3.5">
          <Logo dark />
          <button onClick={onClose} aria-label="Close menu" className="rounded-full bg-white/[0.06] p-2 text-white/70 ring-1 ring-white/10 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* Account */}
          <Link href={me ? "/account" : "/account/login"} className="mx-4 mt-4 flex items-center gap-3 rounded-2xl border border-gold-400/25 bg-gradient-to-br from-lux-700 to-lux-800 p-3.5 text-white shadow-lg shadow-black/40">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-gradient text-lg font-bold text-lux-950">
              {me ? me.name.trim()[0]?.toUpperCase() : <UserRound className="h-5 w-5" />}
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate font-bold">{me ? me.name : "লগইন / রেজিস্টার"}</span>
              <span className="block text-xs text-gold-300/80">{me ? "আমার অ্যাকাউন্ট ও অর্ডার" : "সাপ্তাহিক মেশিন আপডেট পান"}</span>
            </span>
            <ChevronRight className="h-5 w-5 text-gold-300" />
          </Link>

          {/* Main links */}
          <nav className="mt-3 px-2" aria-label="Main">
            {links.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-semibold ${isActive(href) ? "bg-gold-400/10 text-gold-300" : "text-white/85 active:bg-white/5"}`}
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${isActive(href) ? "bg-gold-gradient text-lux-950" : "bg-white/[0.06] text-white/60 ring-1 ring-white/10"}`}>
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                {label}
              </Link>
            ))}
          </nav>

          {/* Categories accordion */}
          <p className="mt-5 px-5 text-[11px] font-bold uppercase tracking-[0.2em] text-gold-400/80">ক্যাটাগরি</p>
          <div className="mt-1 px-2 pb-4">
            {categories.map((c) => {
              const expanded = openCat === c.slug;
              return (
                <div key={c.slug} className="border-b border-white/[0.05] last:border-0">
                  <div className="flex items-center">
                    <Link href={`/category/${c.slug}`} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/80 active:bg-white/5">
                      <CategoryIcon name={c.icon} className="h-5 w-5 shrink-0 text-gold-400" />
                      <span className="truncate">{c.nameBn}</span>
                    </Link>
                    <button
                      onClick={() => setOpenCat(expanded ? null : c.slug)}
                      aria-expanded={expanded}
                      aria-label={`${c.name} types`}
                      className="rounded-lg p-2.5 text-white/40 active:bg-white/5"
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                  <div className={`grid transition-all duration-300 ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <ul className="overflow-hidden pl-11 pr-3">
                      {c.subcategories.map((s) => (
                        <li key={s.slug}>
                          <Link href={`/category/${c.slug}?sub=${s.slug}`} className="block py-2 text-[13px] text-white/55 active:text-gold-300">
                            {s.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact footer */}
        <div className="border-t border-white/[0.06] bg-lux-950/60 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs text-white/45"><MapPin className="h-3.5 w-3.5" /> {site.showroom}</p>
          <div className="grid grid-cols-2 gap-2">
            <a href={`tel:${site.phoneIntl}`} className="flex items-center justify-center gap-1.5 rounded-xl bg-gold-gradient py-2.5 text-sm font-bold text-lux-950"><Phone className="h-4 w-4" /> কল করুন</a>
            <a href={`https://wa.me/${site.whatsappIntl}`} target="_blank" rel="noopener" className="flex items-center justify-center gap-1.5 rounded-xl bg-[#25d366] py-2.5 text-sm font-bold text-white"><WhatsappIcon className="h-4 w-4" /> WhatsApp</a>
          </div>
          <div className="mt-3 flex items-center justify-center gap-4 text-white/40">
            <a href={site.facebook} target="_blank" rel="noopener" aria-label="Facebook" className="hover:text-[#1877f2]"><FacebookIcon className="h-5 w-5" /></a>
            <a href={site.youtube} target="_blank" rel="noopener" aria-label="YouTube" className="hover:text-[#ff0000]"><YoutubeIcon className="h-5 w-5" /></a>
            <span className="text-xs">{site.phone}</span>
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
