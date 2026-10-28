"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { addOffer, type OfferState } from "./actions";

const input = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-600";

export function OfferForm({ products }: { products: { slug: string; name: string; price: number }[] }) {
  const [state, action, pending] = useActionState<OfferState, FormData>(addOffer, {});
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const regular = products.find((p) => p.slug === slug)?.price;
  const off = regular && Number(price) > 0 && Number(price) < regular ? Math.round(((regular - Number(price)) / regular) * 100) : null;

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      <label className="text-sm sm:col-span-2">
        <span className="mb-1 block font-semibold text-gray-700">Machine *</span>
        <select name="product" required value={slug} onChange={(e) => setSlug(e.target.value)} className={input}>
          <option value="" disabled>Choose…</option>
          {products.map((p) => <option key={p.slug} value={p.slug}>{p.name} — ৳{p.price.toLocaleString("en-IN")}</option>)}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-semibold text-gray-700">Offer price (৳) *</span>
        <input name="offerPrice" inputMode="numeric" required value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))} className={input} />
        {off !== null && <span className="mt-1 block text-xs font-semibold text-accent-600">{off}% off</span>}
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-semibold text-gray-700">Title</span>
        <input name="title" maxLength={60} placeholder="e.g. ঈদ অফার" className={input} />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-semibold text-gray-700">Starts</span>
        <input name="startsAt" type="date" className={input} />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-semibold text-gray-700">Ends</span>
        <input name="endsAt" type="date" className={input} />
      </label>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2 xl:col-span-6">
        <button disabled={pending} className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />} Add offer
        </button>
        <span className="text-xs text-gray-500">Empty dates = starts now / runs until you switch it off.</span>
        {state.error && <p className="text-sm text-accent-600" role="status">{state.error}</p>}
        {state.ok && <p className="text-sm text-brand-700" role="status">{state.ok}</p>}
      </div>
    </form>
  );
}
