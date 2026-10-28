"use client";

import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { formatBDT } from "@/lib/site";

// Sends the customer to the SSLCommerz page for this order's amount due.
export function PayOnlineButton({ orderId, amount }: { orderId: string; amount: number }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pay() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/payments/sslcommerz/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId }) });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error ?? "পেমেন্ট শুরু করা যায়নি");
    } catch {
      setError("নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন");
    }
    setBusy(false);
  }

  return (
    <div>
      <button
        type="button"
        onClick={pay}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-accent-600/25 transition hover:bg-accent-700 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
        {formatBDT(amount)} অনলাইনে পেমেন্ট করুন
      </button>
      {error && <p className="mt-2 text-sm font-semibold text-accent-600">{error}</p>}
    </div>
  );
}
