"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BadgePercent, ExternalLink, FileText, LayoutDashboard, LogOut, Menu, MessagesSquare, Package, Settings, ShoppingBag, Users, Wrench, X } from "lucide-react";
import { logout } from "../auth-actions";

const links = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders & Factory", Icon: ShoppingBag },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/offers", label: "Offers", Icon: BadgePercent },
  { href: "/admin/quotes", label: "Quotations", Icon: FileText },
  { href: "/admin/leads", label: "Leads (CRM)", Icon: MessagesSquare },
  { href: "/admin/customers", label: "Customers", Icon: Users },
  { href: "/admin/service", label: "Warranty & Service", Icon: Wrench },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
];

export function AdminNav({ name, role }: { name: string; role: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
        <Image src="/brand/dmg-logo-on-dark.png" alt="" width={1057} height={400} className="h-8 w-auto" />
        <span className="text-sm font-bold leading-tight text-white">Dhaka Machine Ghar<span className="block text-[11px] font-medium text-white/60">Admin Panel</span></span>
      </Link>
      <ul className="flex-1 space-y-1 p-3">
        {links.map(({ href, label, Icon }) => {
          const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${active ? "bg-white text-brand-800" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="space-y-1 border-t border-white/10 p-3">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white">
          <ExternalLink className="h-4 w-4" /> View website
        </Link>
        <form action={logout}>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white">
            <LogOut className="h-4 w-4" /> Logout <span className="ml-auto truncate text-xs text-white/50">{name} · {role}</span>
          </button>
        </form>
      </div>
    </nav>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 bg-brand-900 lg:block">{nav}</aside>
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-lg p-1.5 hover:bg-gray-100"><Menu className="h-5 w-5" /></button>
        <span className="font-bold text-gray-800">Admin Panel</span>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-brand-900">
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-4 rounded-lg p-1 text-white/70 hover:bg-white/10"><X className="h-5 w-5" /></button>
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
