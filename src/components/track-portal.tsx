"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BadgeCheck, ClipboardCheck, Cog, Factory, FileDown, Loader2, PackageSearch, PaintBucket, Search, Truck } from "lucide-react";
import { factorySteps, stepIndex, type PublicOrder } from "@/lib/tracking";
import { formatBDT } from "@/lib/site";
import { useSite } from "./site-provider";

const icons = [ClipboardCheck, Factory, Cog, BadgeCheck, PaintBucket, Truck];
export const bnDate = (iso: string) =>
  new Date(iso).toLocaleString("bn-BD", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" });

export function TrackPortal() {
  const site = useSite();
  const router = useRouter();
  const pathname = usePathname();
  const q = useSearchParams().get("q") ?? "";
  const [input, setInput] = useState(q);
  const [state, setState] = useState<{ loading: boolean; error?: string; orders?: PublicOrder[] }>({ loading: false });

  // The URL is the source of truth, so /track?q=DMG-… links (e.g. from the order confirmation) work directly.
  useEffect(() => {
    if (!q) return;
    let cancelled = false;
    setState({ loading: true });
    fetch(`/api/track?q=${encodeURIComponent(q)}`)
      .then(async (r) => ({ ok: r.ok, data: await r.json() }))
      .then(({ ok, data }) => !cancelled && setState(ok ? { loading: false, orders: data.orders } : { loading: false, error: data.error }))
      .catch(() => !cancelled && setState({ loading: false, error: "নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন" }));
    return () => {
      cancelled = true;
    };
  }, [q]);

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.replace(`${pathname}?q=${encodeURIComponent(input.trim())}`, { scroll: false });
        }}
        className="mx-auto flex max-w-2xl overflow-hidden rounded-2xl border-2 border-brand-600 bg-white shadow-lg"
      >
        <label htmlFor="track-q" className="sr-only">ইনভয়েস বা মোবাইল নম্বর</label>
        <input
          id="track-q"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ইনভয়েস (DMG-…) অথবা মোবাইল নম্বর"
          className="min-w-0 flex-1 px-5 py-4 text-base outline-none"
        />
        <button type="submit" className="flex items-center gap-2 bg-brand-600 px-5 font-bold text-white hover:bg-brand-700 sm:px-8">
          <Search className="h-5 w-5" /> <span className="hidden sm:inline">ট্র্যাক করুন</span>
        </button>
      </form>

      {state.loading && (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      )}
      {state.error && <p className="mx-auto max-w-2xl rounded-xl bg-accent-50 p-4 text-center font-medium text-accent-700">{state.error}</p>}
      {state.orders?.length === 0 && (
        <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <PackageSearch className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-3 font-semibold text-gray-700">কোনো অর্ডার পাওয়া যায়নি</p>
          <p className="mt-1 text-sm text-gray-500">ইনভয়েস নম্বর বা অর্ডারের সময় দেওয়া মোবাইল নম্বর আবার দেখুন, অথবা কল করুন {site.phone}</p>
        </div>
      )}
      {state.orders?.map((o) => <OrderProgress key={o.id} order={o} />)}
    </div>
  );
}

function OrderProgress({ order: o }: { order: PublicOrder }) {
  const current = stepIndex(o.status);
  const at = (key: string) => o.history.find((h) => h.step === key);
  const pct = Math.round(((current + 1) / factorySteps.length) * 100);

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gradient-to-r from-brand-50 to-steel-50 p-5">
        <div>
          <p className="text-xs text-gray-500">ইনভয়েস</p>
          <p className="text-xl font-extrabold tracking-wide text-gray-900">{o.id}</p>
          <p className="text-xs text-gray-500">{o.name} · {o.phone} · {o.district}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">অর্ডারের তারিখ</p>
          <p className="text-sm font-semibold text-gray-800">{bnDate(o.createdAt)}</p>
          <p className="text-sm font-bold text-brand-700">{formatBDT(o.total)}</p>
          {o.docs && (
            <a href={o.docs.invoice} target="_blank" rel="noopener" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 underline">
              <FileDown className="h-3.5 w-3.5" /> ইনভয়েস
            </a>
          )}
        </div>
      </header>

      <div className="p-5">
        <ul className="mb-5 space-y-1 text-sm text-gray-700">
          {o.items.map((i) => (
            <li key={i.slug}>
              <Link href={`/product/${i.slug}`} className="font-semibold hover:text-brand-700">{i.name}</Link> × {i.qty}
            </li>
          ))}
        </ul>

        <div className="mb-6">
          <div className="mb-1 flex justify-between text-xs font-semibold">
            <span className="text-brand-700">{factorySteps[current].title}</span>
            <span className="text-gray-500">{pct}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-steel-600 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <ol className="relative space-y-0">
          {factorySteps.map((s, i) => {
            const Icon = icons[i];
            const done = i < current;
            const active = i === current;
            const h = at(s.key);
            return (
              <li key={s.key} className="relative flex gap-4 pb-6 last:pb-0">
                {i < factorySteps.length - 1 && <span className={`absolute left-5 top-11 h-[calc(100%-2.75rem)] w-0.5 ${done ? "bg-brand-600" : "bg-gray-200"}`} aria-hidden />}
                <span
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    done ? "bg-brand-600 text-white" : active ? "bg-accent-600 text-white ring-4 ring-accent-100" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1 pt-1">
                  <p className={`font-bold ${done || active ? "text-gray-900" : "text-gray-400"}`}>
                    {i + 1}. {s.title}
                    {active && <span className="ml-2 rounded-full bg-accent-50 px-2 py-0.5 text-[11px] font-bold text-accent-600">চলমান</span>}
                  </p>
                  <p className={`text-xs ${done || active ? "text-gray-500" : "text-gray-300"}`}>{s.en} — {s.detail}</p>
                  {h && <p className="mt-0.5 text-xs font-semibold text-brand-700">{bnDate(h.at)}{h.note ? ` · ${h.note}` : ""}</p>}
                  {s.key === "handover" && active && o.docs?.challan && (
                    <a href={o.docs.challan} target="_blank" rel="noopener" className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100">
                      <FileDown className="h-4 w-4" /> ডেলিভারি চালান ডাউনলোড
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </article>
  );
}
