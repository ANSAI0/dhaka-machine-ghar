"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Loader2, Search, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import { serviceIssues } from "@/lib/tracking";
import { useSite } from "./site-provider";
import { fieldClass } from "./order-form";

type Lookup =
  | { found: false }
  | { found: true; serial: string; slug: string; productName: string; owner: string; phone: string; purchasedAt: string; expiresAt: string; months: number; active: boolean };

const bnDay = (iso: string) => new Date(iso).toLocaleDateString("bn-BD", { dateStyle: "long", timeZone: "Asia/Dhaka" });

export function WarrantyPortal() {
  const site = useSite();
  const [serial, setSerial] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Lookup | null>(null);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    if (!serial.trim()) return setError("সিরিয়াল নম্বর দিন");
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/warranty?serial=${encodeURIComponent(serial.trim())}`);
      const data = await r.json();
      if (!r.ok) setError(data.error);
      else setResult(data);
    } catch {
      setError("নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={check} className="mx-auto flex max-w-2xl overflow-hidden rounded-2xl border-2 border-brand-600 bg-white shadow-lg">
        <label htmlFor="w-serial" className="sr-only">মেশিনের সিরিয়াল নম্বর</label>
        <input
          id="w-serial"
          value={serial}
          onChange={(e) => {
            setSerial(e.target.value);
            setResult(null);
          }}
          placeholder="মেশিনের সিরিয়াল নম্বর (যেমন DMG-PP25-2610-0001)"
          className="min-w-0 flex-1 px-5 py-4 font-mono text-base uppercase outline-none placeholder:font-sans placeholder:normal-case"
        />
        <button type="submit" disabled={busy} className="flex items-center gap-2 bg-brand-600 px-5 font-bold text-white hover:bg-brand-700 disabled:opacity-60 sm:px-8">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />} <span className="hidden sm:inline">যাচাই করুন</span>
        </button>
      </form>
      {error && <p className="mx-auto max-w-2xl rounded-xl bg-accent-50 p-4 text-center font-medium text-accent-700">{error}</p>}

      {result && !result.found && (
        <div className="mx-auto max-w-2xl rounded-2xl border-2 border-accent-100 bg-white p-6 text-center">
          <ShieldX className="mx-auto h-12 w-12 text-accent-600" />
          <p className="mt-2 font-bold text-gray-900">এই সিরিয়াল নম্বর আমাদের রেকর্ডে পাওয়া যায়নি</p>
          <p className="mt-1 text-sm text-gray-500">
            মেশিনের বডিতে লাগানো প্লেট থেকে নম্বরটি আবার দেখুন। সন্দেহ হলে কল করুন <a href={`tel:${site.phoneIntl}`} className="font-semibold text-brand-700">{site.phone}</a> — নকল মেশিন থেকে সাবধান।
          </p>
        </div>
      )}

      {result?.found && (
        <>
          <div className={`mx-auto max-w-2xl overflow-hidden rounded-2xl border-2 bg-white shadow-sm ${result.active ? "border-brand-600" : "border-amber-400"}`}>
            <div className={`flex items-center gap-3 p-5 text-white ${result.active ? "bg-brand-600" : "bg-amber-500"}`}>
              {result.active ? <ShieldCheck className="h-10 w-10" /> : <ShieldAlert className="h-10 w-10" />}
              <div>
                <p className="text-lg font-bold">{result.active ? "আসল মেশিন — ওয়ারেন্টি চালু আছে" : "আসল মেশিন — ওয়ারেন্টির মেয়াদ শেষ"}</p>
                <p className="font-mono text-sm text-white/85">{result.serial}</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-4 p-5 text-sm">
              <div className="col-span-2"><dt className="text-gray-500">মেশিন</dt><dd className="font-bold text-gray-900"><Link href={`/product/${result.slug}`} className="hover:text-brand-700">{result.productName}</Link></dd></div>
              <div><dt className="text-gray-500">মালিক</dt><dd className="font-semibold text-gray-800">{result.owner} · {result.phone}</dd></div>
              <div><dt className="text-gray-500">ওয়ারেন্টি</dt><dd className="font-semibold text-gray-800">{result.months} মাস</dd></div>
              <div><dt className="text-gray-500">ক্রয়ের তারিখ</dt><dd className="font-semibold text-gray-800">{bnDay(result.purchasedAt)}</dd></div>
              <div><dt className="text-gray-500">মেয়াদ শেষ</dt><dd className={`font-semibold ${result.active ? "text-brand-700" : "text-amber-600"}`}>{bnDay(result.expiresAt)}</dd></div>
            </dl>
            {!result.active && <p className="border-t border-gray-100 px-5 py-3 text-xs text-gray-500">মেয়াদ শেষ হলেও পেইড সার্ভিস ও স্পেয়ার পার্টস পাওয়া যাবে।</p>}
          </div>
          <ServiceForm serial={result.serial} underWarranty={result.active} />
        </>
      )}
    </div>
  );
}

type Errors = Partial<Record<"name" | "phone" | "issue" | "details" | "visit" | "serial" | "form", string>>;

function ServiceForm({ serial, underWarranty }: { serial: string; underWarranty: boolean }) {
  const [visit, setVisit] = useState<"onsite" | "workshop">("onsite");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const r = await fetch("/api/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serial, name: fd.get("name"), phone: fd.get("phone"), issue: fd.get("issue"), details: fd.get("details"), visit }),
      });
      const data = await r.json();
      if (!r.ok) setErrors(data.errors ?? { form: "পাঠানো যায়নি" });
      else setDoneId(data.id);
    } catch {
      setErrors({ form: "নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন" });
    } finally {
      setBusy(false);
    }
  }

  if (doneId)
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border-2 border-brand-600 bg-brand-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-brand-600" />
        <p className="mt-2 text-lg font-bold text-gray-900">সার্ভিস রিকোয়েস্ট গ্রহণ করা হয়েছে</p>
        <p className="text-2xl font-bold tracking-wider text-accent-600">{doneId}</p>
        <p className="mt-2 text-sm text-gray-600">আমাদের সার্ভিস টিম শীঘ্রই কল করে সময় নির্ধারণ করবে।</p>
      </div>
    );

  const err = (k: keyof Errors) => errors[k] && <p className="mt-1 text-xs font-medium text-accent-600">{errors[k]}</p>;
  const border = (k: keyof Errors) => (errors[k] ? "border-accent-600" : "border-gray-200");
  const label = "mb-1 block text-sm font-semibold text-gray-700";

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
      <div>
        <h2 className="text-lg font-bold text-gray-900">সার্ভিস / ওয়ারেন্টি দাবি</h2>
        <p className="text-sm text-gray-500">{underWarranty ? "ওয়ারেন্টির আওতায় সার্ভিস ফ্রি (পার্টস নীতিমালা অনুযায়ী)।" : "পেইড সার্ভিস — খরচ কলে জানানো হবে।"}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="sf-name" className={label}>আপনার নাম *</label>
          <input id="sf-name" name="name" autoComplete="name" className={`${fieldClass} ${border("name")}`} />
          {err("name")}
        </div>
        <div>
          <label htmlFor="sf-phone" className={label}>মোবাইল নম্বর *</label>
          <input id="sf-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" className={`${fieldClass} ${border("phone")}`} />
          {err("phone")}
        </div>
      </div>
      <div>
        <label htmlFor="sf-issue" className={label}>সমস্যার ধরন *</label>
        <select id="sf-issue" name="issue" defaultValue="" className={`${fieldClass} ${border("issue")}`}>
          <option value="" disabled>নির্বাচন করুন</option>
          {serviceIssues.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {err("issue")}
      </div>
      <div>
        <label htmlFor="sf-details" className={label}>বিস্তারিত *</label>
        <textarea id="sf-details" name="details" rows={3} placeholder="কখন থেকে সমস্যা, কী অবস্থায় হয়…" className={`${fieldClass} ${border("details")}`} />
        {err("details")}
      </div>
      <fieldset>
        <legend className={label}>সার্ভিস কোথায় চান? *</legend>
        <div className="grid grid-cols-2 gap-2">
          {([["onsite", "আমার কারখানায় এসে"], ["workshop", "মেশিন ওয়ার্কশপে পাঠাবো"]] as const).map(([v, t]) => (
            <label key={v} className={`flex cursor-pointer items-center justify-center rounded-xl border-2 py-2.5 text-center text-sm font-semibold ${visit === v ? "border-brand-600 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600"}`}>
              <input type="radio" name="visit" value={v} checked={visit === v} onChange={() => setVisit(v)} className="sr-only" />
              {t}
            </label>
          ))}
        </div>
      </fieldset>
      {(errors.form || errors.serial) && <p className="rounded-lg bg-accent-50 p-3 text-sm font-medium text-accent-700">{errors.form ?? errors.serial}</p>}
      <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 text-lg font-bold text-white hover:bg-brand-700 disabled:opacity-60">
        {busy && <Loader2 className="h-5 w-5 animate-spin" />} সার্ভিস রিকোয়েস্ট পাঠান
      </button>
    </form>
  );
}
