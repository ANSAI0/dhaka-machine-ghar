"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Loader2, Minus, Plus } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { districts, paymentLabels, validateOrder, type OrderInput, type PaymentPlan } from "@/lib/orders";
import { formatBDT } from "@/lib/site";
import { useSite } from "./site-provider";
import { trackConversion } from "@/lib/analytics";
import { useCustomer } from "./customer-provider";
import { PayOnlineButton } from "./pay-online-button";

type Errors = Partial<Record<keyof OrderInput | "form", string>>;
export type OrderLine = { product: Product; qty: number };
type Placed = { id: string; total: number; payNow: number; payOnline?: boolean };

export const fieldClass = "w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100";

type Props = {
  lines: OrderLine[];
  source: string;
  qtySlot?: React.ReactNode; // single-product forms render their own quantity stepper here
  onPlaced?: (o: Placed) => void;
};

export function OrderForm({ lines, source, qtySlot, onPlaced }: Props) {
  const site = useSite();
  const { me } = useCustomer();
  const [payment, setPayment] = useState<PaymentPlan>("advance");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Placed | null>(null);

  const total = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const payNow = payment === "full" ? total : payment === "advance" ? Math.round((total * site.advancePercent) / 100) : 0;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input: OrderInput = {
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? "").trim(),
      address: String(fd.get("address") ?? ""),
      district: String(fd.get("district") ?? ""),
      note: String(fd.get("note") ?? ""),
      payment,
      items: lines.map((l) => ({ slug: l.product.slug, qty: l.qty })),
      source,
    };
    const v = validateOrder(input);
    setErrors(v);
    if (Object.keys(v).length) return;

    setBusy(true);
    try {
      const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      const data = await res.json();
      if (!res.ok) setErrors(data.errors ?? { form: "অর্ডার পাঠানো যায়নি, আবার চেষ্টা করুন।" });
      else {
        setDone(data);
        trackConversion("Purchase", { value: data.total, currency: "BDT", content_ids: lines.map((l) => l.product.slug), content_type: "product" }, data.id);
        onPlaced?.(data);
      }
    } catch {
      setErrors({ form: "নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন অথবা কল করুন " + site.phone });
    } finally {
      setBusy(false);
    }
  }

  if (done) return <OrderSuccess order={done} />;

  const err = (k: keyof Errors) => errors[k] && <p className="mt-1 text-xs font-medium text-accent-600">{errors[k]}</p>;
  const border = (k: keyof Errors) => (errors[k] ? "border-accent-600" : "border-gray-200");

  return (
    // Re-mount when the customer loads so the saved name/phone/address fill in.
    <form key={me?.phone ?? "guest"} onSubmit={submit} noValidate className="space-y-4">
      {me && <p className="rounded-xl bg-brand-50 px-3 py-2 text-xs text-brand-800">{me.name} হিসেবে লগইন করা আছে — আপনার তথ্য বসিয়ে দেওয়া হয়েছে।</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="of-name" className="mb-1 block text-sm font-semibold text-gray-700">আপনার নাম *</label>
          <input id="of-name" name="name" defaultValue={me?.name} autoComplete="name" placeholder="পূর্ণ নাম" className={`${fieldClass} ${border("name")}`} />
          {err("name")}
        </div>
        <div>
          <label htmlFor="of-phone" className="mb-1 block text-sm font-semibold text-gray-700">মোবাইল নম্বর *</label>
          <input id="of-phone" name="phone" defaultValue={me?.phone} type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" className={`${fieldClass} ${border("phone")}`} />
          {err("phone")}
        </div>
      </div>
      <div>
        <label htmlFor="of-email" className="mb-1 block text-sm font-semibold text-gray-700">
          ইমেইল <span className="font-normal text-gray-400">(ঐচ্ছিক — অর্ডার কনফার্মেশন, পেমেন্ট রসিদ ও ডেলিভারি চালান পাবেন)</span>
        </label>
        <input id="of-email" name="email" type="email" inputMode="email" defaultValue={me?.email ?? ""} autoComplete="email" placeholder="you@example.com" className={`${fieldClass} ${border("email")}`} />
        {err("email")}
      </div>
      <div>
        <label htmlFor="of-address" className="mb-1 block text-sm font-semibold text-gray-700">ডেলিভারি ঠিকানা *</label>
        <input id="of-address" name="address" defaultValue={me?.address ?? ""} autoComplete="street-address" placeholder="গ্রাম/রোড, থানা" className={`${fieldClass} ${border("address")}`} />
        {err("address")}
      </div>
      <div className={`grid gap-4 ${qtySlot ? "sm:grid-cols-2" : ""}`}>
        <div>
          <label htmlFor="of-district" className="mb-1 block text-sm font-semibold text-gray-700">জেলা *</label>
          <select id="of-district" name="district" defaultValue={me?.district ?? ""} className={`${fieldClass} ${border("district")}`}>
            <option value="" disabled>জেলা নির্বাচন করুন</option>
            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {err("district")}
        </div>
        {qtySlot}
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-gray-700">পেমেন্ট পদ্ধতি *</legend>
        <div className="space-y-2">
          {(Object.keys(paymentLabels) as PaymentPlan[]).map((p) => (
            <label key={p} className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 ${payment === p ? "border-brand-600 bg-brand-50" : "border-gray-200 bg-white"}`}>
              <input type="radio" name="payment" value={p} checked={payment === p} onChange={() => setPayment(p)} className="mt-1 h-4 w-4 accent-brand-600" />
              <span className="flex-1 text-sm">
                <span className="font-semibold text-gray-800">{paymentLabels[p]}</span>
                <span className="block text-xs text-gray-500">
                  {p === "advance" && `মোট মূল্যের ${site.advancePercent}% অগ্রিম দিয়ে অর্ডার কনফার্ম করুন, বাকি ডেলিভারির সময়।`}
                  {p === "full" && "সম্পূর্ণ মূল্য পরিশোধে অগ্রাধিকার ভিত্তিতে প্রোডাকশন শুরু।"}
                  {p === "cod_booking" && "আমাদের প্রতিনিধি কল করে বিস্তারিত জানিয়ে বুকিং নেবেন।"}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="of-note" className="mb-1 block text-sm font-semibold text-gray-700">বিশেষ নির্দেশনা (ঐচ্ছিক)</label>
        <textarea id="of-note" name="note" rows={2} placeholder="যেমন: ডাই সহ চাই, নির্দিষ্ট টনেজ…" className={`${fieldClass} border-gray-200`} />
      </div>

      <div className="space-y-1 rounded-xl bg-gray-50 p-4 text-sm">
        {lines.map((l) => (
          <p key={l.product.slug} className="flex justify-between gap-3">
            <span className="text-gray-600">{l.product.name} × {l.qty}</span>
            <strong className="shrink-0">{formatBDT(l.product.price * l.qty)}</strong>
          </p>
        ))}
        {lines.length > 1 && (
          <p className="flex justify-between border-t border-gray-200 pt-2"><span className="font-semibold text-gray-700">মোট</span><strong>{formatBDT(total)}</strong></p>
        )}
        <p className="mt-1 flex justify-between border-t border-gray-200 pt-2 text-base">
          <span className="font-semibold text-gray-800">এখন পরিশোধ</span>
          <strong className="text-accent-600">{payNow ? formatBDT(payNow) : "কলের পরে"}</strong>
        </p>
      </div>

      {errors.form && <p className="rounded-lg bg-accent-50 p-3 text-sm font-medium text-accent-700">{errors.form}</p>}
      {errors.items && <p className="rounded-lg bg-accent-50 p-3 text-sm font-medium text-accent-700">{errors.items}</p>}

      <button type="submit" disabled={busy || !lines.length} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-600 to-accent-700 py-3.5 text-lg font-bold text-white shadow-lg hover:brightness-110 disabled:opacity-60">
        {busy && <Loader2 className="h-5 w-5 animate-spin" />} অর্ডার কনফার্ম করুন
      </button>
    </form>
  );
}

export function OrderSuccess({ order }: { order: Placed }) {
  const site = useSite();
  return (
    <div className="rounded-2xl border-2 border-brand-600 bg-brand-50 p-6 text-center">
      <CheckCircle2 className="mx-auto h-14 w-14 text-brand-600" />
      <h3 className="mt-3 text-xl font-bold text-gray-900">ধন্যবাদ! আপনার অর্ডার গ্রহণ করা হয়েছে</h3>
      <p className="mt-1 text-sm text-gray-600">ইনভয়েস নম্বর</p>
      <p className="text-2xl font-extrabold tracking-wider text-accent-600">{order.id}</p>
      <div className="mx-auto mt-4 max-w-sm space-y-1 rounded-xl bg-white p-4 text-sm">
        <p className="flex justify-between"><span className="text-gray-500">মোট মূল্য</span><strong>{formatBDT(order.total)}</strong></p>
        {order.payNow > 0 && <p className="flex justify-between"><span className="text-gray-500">এখন পরিশোধযোগ্য</span><strong className="text-accent-600">{formatBDT(order.payNow)}</strong></p>}
      </div>
      {order.payOnline ? (
        <div className="mx-auto mt-4 max-w-sm">
          <PayOnlineButton orderId={order.id} amount={order.payNow} />
          <p className="mt-2 text-xs text-gray-500">bKash, Nagad, Rocket বা কার্ড — অথবা পরে আমাদের প্রতিনিধির সাথে কথা বলে পেমেন্ট করুন।</p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-600">
          আমাদের প্রতিনিধি শীঘ্রই <strong>{site.phone}</strong> থেকে কল করে পেমেন্ট ও ডেলিভারি নিশ্চিত করবেন।
        </p>
      )}
      <Link href={`/track?q=${order.id}`} className="mt-4 inline-block rounded-xl border border-brand-600 px-5 py-2.5 text-sm font-bold text-brand-700 hover:bg-brand-600 hover:text-white">
        অর্ডার ট্র্যাক করুন
      </Link>
    </div>
  );
}

export function QtyStepper({ value, onChange, label = "পরিমাণ" }: { value: number; onChange: (n: number) => void; label?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-1" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))} aria-label="Decrease quantity" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm hover:bg-gray-100"><Minus className="h-4 w-4" /></button>
      <span className="w-8 text-center font-bold" aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} aria-label="Increase quantity" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm hover:bg-gray-100"><Plus className="h-4 w-4" /></button>
    </div>
  );
}

export function ProductOrderForm({ product, source = "product-page" }: { product: Product; source?: string }) {
  const [qty, setQty] = useState(1);
  return (
    <OrderForm
      lines={[{ product, qty }]}
      source={source}
      qtySlot={
        <div>
          <span className="mb-1 block text-sm font-semibold text-gray-700">পরিমাণ</span>
          <div className="flex items-center gap-3">
            <QtyStepper value={qty} onChange={setQty} />
            <span className="text-sm text-gray-600">মোট: <strong className="text-brand-700">{formatBDT(product.price * qty)}</strong></span>
          </div>
        </div>
      }
    />
  );
}
