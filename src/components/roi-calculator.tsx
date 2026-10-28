"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { formatBDT } from "@/lib/site";

// Defaults come from product.roi; every number is editable so buyers can plug in their own figures.
export function RoiCalculator({ product }: { product: Product }) {
  const roi = product.roi ?? { product: "Job work", unitsPerDay: 100, profitPerUnit: 10, monthlyCost: 20000 };
  const [units, setUnits] = useState(roi.unitsPerDay);
  const [profit, setProfit] = useState(roi.profitPerUnit);
  const [days, setDays] = useState(26);
  const [costs, setCosts] = useState(roi.monthlyCost);

  const daily = units * profit;
  const monthlyGross = daily * days;
  const monthlyNet = monthlyGross - costs;
  const payback = monthlyNet > 0 ? product.price / monthlyNet : null;

  const rows: [string, number][] = [
    ["দৈনিক আয়", daily],
    ["মাসিক মোট আয়", monthlyGross],
    ["মাসিক খরচ", -costs],
    ["মাসিক নিট লাভ", monthlyNet],
    ["বাৎসরিক নিট লাভ", monthlyNet * 12],
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          উদাহরণ পণ্য: <strong className="text-gray-800">{roi.product}</strong>। আপনার নিজের হিসাব বসিয়ে দেখুন।
        </p>
        <NumberField label="দৈনিক উৎপাদন (পিস/কাজ)" value={units} onChange={setUnits} />
        <NumberField label="প্রতি পিসে লাভ (৳)" value={profit} onChange={setProfit} step={0.1} />
        <NumberField label="মাসে কাজের দিন" value={days} onChange={setDays} max={31} />
        <NumberField label="মাসিক খরচ — বিদ্যুৎ, অপারেটর (৳)" value={costs} onChange={setCosts} />
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 p-5 text-white">
        <h4 className="mb-3 flex items-center gap-2 font-bold">
          <TrendingUp className="h-5 w-5 text-brand-200" /> লাভের হিসাব
        </h4>
        <table className="w-full text-sm">
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k} className="border-b border-white/10 last:border-0">
                <td className="py-2 text-white/75">{k}</td>
                <td className={`py-2 text-right font-bold ${v < 0 ? "text-red-300" : ""}`}>{formatBDT(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 rounded-xl bg-white/10 p-4 text-center">
          <p className="text-xs text-white/70">মেশিনের দাম ফেরত আসবে আনুমানিক</p>
          <p className="text-2xl font-extrabold">{payback ? `${payback.toFixed(1)} মাসে` : "—"}</p>
        </div>
        <p className="mt-3 text-[11px] leading-snug text-white/60">* এটি একটি আনুমানিক হিসাব। প্রকৃত লাভ কাঁচামাল, বাজারদর ও উৎপাদনের উপর নির্ভর করে।</p>
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange, step = 1, max }: { label: string; value: number; onChange: (n: number) => void; step?: number; max?: number }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-gray-700">{label}</span>
      <input
        type="number"
        min={0}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : ""}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)))}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );
}
