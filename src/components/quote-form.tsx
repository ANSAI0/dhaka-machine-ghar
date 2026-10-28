"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { districts } from "@/lib/orders";
import { budgetRanges, machineTypes, validateQuote, type QuoteInput } from "@/lib/quotes";
import { fieldClass } from "./order-form";
import { useCatalog } from "./catalog-provider";
import { useSite } from "./site-provider";
import { trackConversion } from "@/lib/analytics";

type Errors = Partial<Record<keyof QuoteInput | "form", string>>;

export function QuoteForm() {
  const site = useSite();
  const sp = useSearchParams();
  const { categories, getProduct } = useCatalog();
  const types = machineTypes(categories);
  // /quotation?product=<slug> pre-fills type and capacity from that machine.
  const from = getProduct(sp.get("product") ?? "");
  const presetType = from?.category ?? (types.some((m) => m.value === sp.get("type")) ? sp.get("type")! : "");

  const [contactBy, setContactBy] = useState<"call" | "whatsapp">("call");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input: QuoteInput = {
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      company: String(fd.get("company") ?? ""),
      district: String(fd.get("district") ?? ""),
      machineType: String(fd.get("machineType") ?? ""),
      capacity: String(fd.get("capacity") ?? ""),
      quantity: Number(fd.get("quantity") ?? 0),
      details: String(fd.get("details") ?? ""),
      budget: String(fd.get("budget") ?? ""),
      contactBy,
      product: from?.slug,
    };
    const v = validateQuote(input, categories);
    setErrors(v);
    if (Object.keys(v).length) return;

    setBusy(true);
    try {
      const res = await fetch("/api/quotes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      const data = await res.json();
      if (!res.ok) setErrors(data.errors ?? { form: "পাঠানো যায়নি, আবার চেষ্টা করুন।" });
      else {
        setDoneId(data.id);
        trackConversion("Lead", { content_name: input.machineType }, data.id);
      }
    } catch {
      setErrors({ form: "নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন অথবা কল করুন " + site.phone });
    } finally {
      setBusy(false);
    }
  }

  if (doneId) {
    return (
      <div className="rounded-2xl border-2 border-brand-600 bg-brand-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-brand-600" />
        <h3 className="mt-3 text-xl font-bold text-gray-900">কোটেশন অনুরোধ পাঠানো হয়েছে</h3>
        <p className="mt-1 text-sm text-gray-600">রেফারেন্স নম্বর</p>
        <p className="text-2xl font-bold tracking-wider text-accent-600">{doneId}</p>
        <p className="mt-4 text-sm text-gray-600">
          আমাদের ইঞ্জিনিয়ার আপনার চাহিদা দেখে ২৪ ঘণ্টার মধ্যে {contactBy === "whatsapp" ? "WhatsApp-এ" : "কল করে"} দাম ও ডেলিভারি সময় জানাবেন।
        </p>
      </div>
    );
  }

  const err = (k: keyof Errors) => errors[k] && <p className="mt-1 text-xs font-medium text-accent-600">{errors[k]}</p>;
  const border = (k: keyof Errors) => (errors[k] ? "border-accent-600" : "border-gray-200");
  const label = "mb-1 block text-sm font-semibold text-gray-700";

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {from && (
        <p className="rounded-xl bg-steel-50 p-3 text-sm text-steel-700">
          রেফারেন্স মেশিন: <strong>{from.name}</strong> — এর থেকে ভিন্ন টনেজ/সাইজ চাইলে নিচে লিখুন।
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="qf-name" className={label}>আপনার নাম *</label>
          <input id="qf-name" name="name" autoComplete="name" className={`${fieldClass} ${border("name")}`} />
          {err("name")}
        </div>
        <div>
          <label htmlFor="qf-phone" className={label}>মোবাইল নম্বর *</label>
          <input id="qf-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" className={`${fieldClass} ${border("phone")}`} />
          {err("phone")}
        </div>
        <div>
          <label htmlFor="qf-company" className={label}>প্রতিষ্ঠানের নাম (ঐচ্ছিক)</label>
          <input id="qf-company" name="company" autoComplete="organization" className={`${fieldClass} border-gray-200`} />
        </div>
        <div>
          <label htmlFor="qf-district" className={label}>জেলা *</label>
          <select id="qf-district" name="district" defaultValue="" className={`${fieldClass} ${border("district")}`}>
            <option value="" disabled>জেলা নির্বাচন করুন</option>
            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {err("district")}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-3">
          <label htmlFor="qf-type" className={label}>মেশিনের ধরন *</label>
          <select id="qf-type" name="machineType" defaultValue={presetType} className={`${fieldClass} ${border("machineType")}`}>
            <option value="" disabled>নির্বাচন করুন</option>
            {types.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          {err("machineType")}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="qf-capacity" className={label}>টনেজ / সাইজ / ক্যাপাসিটি *</label>
          <input id="qf-capacity" name="capacity" defaultValue={from?.capacity ?? ""} placeholder="যেমন: 40 Ton, 8 ft bed, 3 ton/hour" className={`${fieldClass} ${border("capacity")}`} />
          {err("capacity")}
        </div>
        <div>
          <label htmlFor="qf-qty" className={label}>সংখ্যা *</label>
          <input id="qf-qty" name="quantity" type="number" min={1} defaultValue={1} className={`${fieldClass} ${border("quantity")}`} />
          {err("quantity")}
        </div>
      </div>

      <div>
        <label htmlFor="qf-details" className={label}>বিস্তারিত চাহিদা *</label>
        <textarea
          id="qf-details"
          name="details"
          rows={4}
          placeholder="কী পণ্য তৈরি করবেন, কাঁচামালের পুরুত্ব, বেড সাইজ, স্ট্রোক, বিদ্যুৎ সংযোগ (220V/440V), ডাই লাগবে কিনা…"
          className={`${fieldClass} ${border("details")}`}
        />
        {err("details")}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="qf-budget" className={label}>আনুমানিক বাজেট (ঐচ্ছিক)</label>
          <select id="qf-budget" name="budget" defaultValue="" className={`${fieldClass} border-gray-200`}>
            <option value="">বলতে চাই না</option>
            {budgetRanges.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <fieldset>
          <legend className={label}>কীভাবে যোগাযোগ করবো? *</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["call", "whatsapp"] as const).map((c) => (
              <label key={c} className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-sm font-semibold ${contactBy === c ? "border-brand-600 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600"}`}>
                <input type="radio" name="contactBy" value={c} checked={contactBy === c} onChange={() => setContactBy(c)} className="sr-only" />
                {c === "call" ? "ফোন কল" : "WhatsApp"}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {errors.form && <p className="rounded-lg bg-accent-50 p-3 text-sm font-medium text-accent-700">{errors.form}</p>}

      <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-800 py-3.5 text-lg font-bold text-white shadow-lg hover:brightness-110 disabled:opacity-60">
        {busy && <Loader2 className="h-5 w-5 animate-spin" />} কোটেশন চাই
      </button>
    </form>
  );
}
