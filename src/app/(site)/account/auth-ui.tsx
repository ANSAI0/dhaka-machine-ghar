"use client";

import Image from "next/image";
import { useState } from "react";
import { BadgeCheck, Eye, EyeOff, Factory, FileDown, Loader2, ShieldCheck, Zap } from "lucide-react";

const perks = [
  { Icon: Factory, t: "কারখানায় মেশিন তৈরির লাইভ আপডেট" },
  { Icon: Zap, t: "এক ক্লিকে চেকআউট — ঠিকানা মনে রাখে" },
  { Icon: FileDown, t: "ইনভয়েস ও চালান যেকোনো সময় ডাউনলোড" },
  { Icon: ShieldCheck, t: "আপনার সব মেশিনের ওয়ারেন্টি এক জায়গায়" },
];

// Split-screen card used by login / register / verify / reset.
export function AuthShell({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-10">
      <div className="mx-auto grid max-w-4xl overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100 md:grid-cols-[5fr_6fr]">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-steel-700 p-8 text-white md:block">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border-[24px] border-white/5" />
          <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-white/5" />
          <div className="relative">
            <Image src="/brand/dmg-logo-on-dark.png" alt="DMG" width={1057} height={400} className="h-10 w-auto" />
            <h2 className="mt-6 text-2xl font-bold leading-snug">আমার DMG অ্যাকাউন্ট</h2>
            <p className="mt-1 text-sm text-white/75">অর্ডার, ওয়ারেন্টি ও সার্ভিস — সব এক জায়গায়।</p>
            <ul className="mt-8 space-y-4">
              {perks.map(({ Icon, t }) => (
                <li key={t} className="flex items-center gap-3 text-sm">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10"><Icon className="h-4.5 w-4.5" /></span>
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-10 flex items-center gap-2 text-xs text-white/60"><BadgeCheck className="h-4 w-4" /> আপনার তথ্য সুরক্ষিত — পাসওয়ার্ড এনক্রিপ্ট করে রাখা হয়।</p>
          </div>
        </aside>
        <section className="p-6 sm:p-10">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="mb-6 mt-1 text-sm text-gray-500">{sub}</p>
          {children}
        </section>
      </div>
    </div>
  );
}

export const inputCls = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-brand-600 focus:bg-white focus:ring-4 focus:ring-brand-100";

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-400">{hint}</span>}
    </label>
  );
}

export function PasswordInput({ name, autoComplete, placeholder }: { name: string; autoComplete: string; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input name={name} type={show ? "text" : "password"} autoComplete={autoComplete} placeholder={placeholder} required minLength={name === "current" ? undefined : 8} className={`${inputCls} pr-11`} />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 hover:text-gray-700">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function SubmitButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 py-3.5 font-bold text-white shadow-lg shadow-brand-600/20 transition hover:brightness-110 disabled:opacity-60">
      {pending && <Loader2 className="h-4 w-4 animate-spin" />} {children}
    </button>
  );
}

export function Notice({ error, ok }: { error?: string; ok?: string }) {
  if (error) return <p role="alert" className="rounded-xl bg-accent-50 p-3 text-sm font-medium text-accent-700">{error}</p>;
  if (ok) return <p role="status" className="rounded-xl bg-brand-50 p-3 text-sm font-medium text-brand-800">{ok}</p>;
  return null;
}
