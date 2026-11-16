"use client";

import { useActionState, useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { setPrice, type PriceState } from "./actions";

// Quick price edit right in the product list: type the price and press Enter (empty = Call for price).
export function PriceCell({ slug, price, oldPrice }: { slug: string; price: number; oldPrice: number | null }) {
  const [state, action, pending] = useActionState<PriceState, FormData>(setPrice.bind(null, slug), {});
  const [value, setValue] = useState(price > 0 ? String(price) : "");
  const [shown, setShown] = useState(false);
  const dirty = value !== (price > 0 ? String(price) : "");

  useEffect(() => {
    if (!state.ok) return;
    setShown(true);
    const t = setTimeout(() => setShown(false), 2000);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <form action={action} className="flex items-center justify-end gap-1.5">
      <span className="text-xs text-gray-400">৳</span>
      <input
        name="price"
        inputMode="numeric"
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/[^\d]/g, ""))}
        placeholder="Call"
        aria-label="Price"
        className="w-24 rounded-lg border border-gray-200 px-2 py-1.5 text-right text-sm font-semibold outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
      />
      <button
        disabled={pending || !dirty}
        aria-label="Save price"
        className={`flex h-8 w-8 items-center justify-center rounded-lg text-white transition-colors ${dirty ? "bg-brand-600 hover:bg-brand-700" : shown ? "bg-emerald-500" : "bg-gray-200"}`}
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      </button>
      {state.error && <span className="block w-full text-right text-xs text-accent-600">{state.error}</span>}
      {oldPrice ? <span className="sr-only">Old price {oldPrice}</span> : null}
    </form>
  );
}
