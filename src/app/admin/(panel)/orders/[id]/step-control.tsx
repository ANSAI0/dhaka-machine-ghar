"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { factorySteps, stepIndex, type StepKey } from "@/lib/tracking";
import { setOrderStep, type StepState } from "../actions";

export function StepControl({ orderId, current }: { orderId: string; current: StepKey }) {
  const [state, action, pending] = useActionState<StepState, FormData>(setOrderStep.bind(null, orderId), {});
  const next = factorySteps[Math.min(stepIndex(current) + 1, factorySteps.length - 1)].key;
  const [step, setStep] = useState<StepKey>(current === "handover" ? current : next);

  return (
    <form action={action} className="space-y-3">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-gray-700">Move order to</legend>
        <div className="grid gap-1.5">
          {factorySteps.map((s, i) => {
            const done = i < stepIndex(current);
            return (
              <label key={s.key} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm ${step === s.key ? "border-brand-600 bg-brand-50" : "border-gray-200 hover:bg-gray-50"}`}>
                <input type="radio" name="step" value={s.key} checked={step === s.key} onChange={() => setStep(s.key)} className="h-4 w-4 accent-brand-600" />
                <span className={`flex-1 ${done ? "text-gray-400" : "text-gray-800"}`}>{i + 1}. {s.en}</span>
                {s.key === current && <span className="text-xs font-bold text-accent-600">current</span>}
              </label>
            );
          })}
        </div>
      </fieldset>
      <div>
        <label htmlFor="step-note" className="mb-1 block text-sm font-semibold text-gray-700">Note for customer (optional)</label>
        <input id="step-note" name="note" maxLength={200} placeholder="e.g. চেসিস ওয়েল্ডিং শেষ, মোটর আসছে" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-600" />
        <p className="mt-1 text-xs text-gray-400">Shown on the public tracking page.</p>
      </div>
      {step === "handover" && current !== "handover" && (
        <p className="rounded-lg bg-steel-50 p-2.5 text-xs text-steel-700">Handover creates one warranty serial per machine for this order.</p>
      )}
      {state.error && <p className="rounded-lg bg-accent-50 p-2.5 text-sm text-accent-700" role="status">{state.error}</p>}
      {state.ok && <p className="rounded-lg bg-brand-50 p-2.5 text-sm text-brand-800" role="status">{state.ok}</p>}
      <button disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} Update step
      </button>
    </form>
  );
}
