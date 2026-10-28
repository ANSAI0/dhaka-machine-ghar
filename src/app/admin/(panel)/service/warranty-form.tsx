"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { addWarranty, type WarrantyState } from "./actions";

const input = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-600";

export function WarrantyForm({ products }: { products: { slug: string; name: string; condition: string }[] }) {
  const [state, action, pending] = useActionState<WarrantyState, FormData>(addWarranty, {});
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <label className="text-sm sm:col-span-2 xl:col-span-1">
        <span className="mb-1 block font-semibold text-gray-700">Machine *</span>
        <select name="product" defaultValue="" required className={input}>
          <option value="" disabled>Choose…</option>
          {products.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
        </select>
      </label>
      <label className="text-sm"><span className="mb-1 block font-semibold text-gray-700">Owner name *</span><input name="owner" required className={input} /></label>
      <label className="text-sm"><span className="mb-1 block font-semibold text-gray-700">Owner phone *</span><input name="phone" type="tel" required placeholder="01XXXXXXXXX" className={input} /></label>
      <label className="text-sm"><span className="mb-1 block font-semibold text-gray-700">Purchase date *</span><input name="purchasedAt" type="date" required className={input} /></label>
      <label className="text-sm"><span className="mb-1 block font-semibold text-gray-700">Warranty (months) *</span><input name="months" type="number" min={0} max={120} defaultValue={12} required className={input} /></label>
      <label className="text-sm"><span className="mb-1 block font-semibold text-gray-700">Serial</span><input name="serial" placeholder="Leave empty to generate" className={`${input} font-mono uppercase`} /></label>
      <div className="flex items-center gap-3 sm:col-span-2 xl:col-span-3">
        <button disabled={pending} className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />} Register warranty
        </button>
        {state.error && <p className="text-sm text-accent-600" role="status">{state.error}</p>}
        {state.ok && <p className="font-mono text-sm font-semibold text-brand-700" role="status">{state.ok}</p>}
      </div>
    </form>
  );
}
