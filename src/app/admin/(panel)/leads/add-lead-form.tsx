"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { addLead } from "./actions";

const input = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-600";

export function AddLeadForm() {
  const [state, action, pending] = useActionState(addLead, {});
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <input name="name" required placeholder="Name" aria-label="Name" className={input} />
      <input name="phone" type="tel" required placeholder="01XXXXXXXXX" aria-label="Phone" className={input} />
      <input name="interest" placeholder="Interested in…" aria-label="Interested in" className={`${input} xl:col-span-2`} />
      <select name="source" defaultValue="manual" aria-label="Source" className={input}>
        <option value="manual">Phone call / walk-in</option>
        <option value="whatsapp">WhatsApp</option>
        <option value="facebook">Facebook</option>
      </select>
      <div className="flex items-center gap-3 sm:col-span-2 xl:col-span-5">
        <button disabled={pending} className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />} Add lead
        </button>
        {state.error && <p className="text-sm text-accent-600" role="status">{state.error}</p>}
        {state.ok && <p className="text-sm text-brand-700" role="status">{state.ok}</p>}
      </div>
    </form>
  );
}
