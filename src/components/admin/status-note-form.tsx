"use client";

import { useActionState } from "react";
import { Check, Loader2 } from "lucide-react";

type State = { ok?: boolean; error?: string };

// Status dropdown + internal note, saved by a bound server action.
export function StatusNoteForm({
  action,
  statuses,
  status,
  note,
}: {
  action: (s: State, fd: FormData) => Promise<State>;
  statuses: Record<string, { label: string }>;
  status: string;
  note: string | null;
}) {
  const [state, formAction, pending] = useActionState<State, FormData>(action, {});
  return (
    <form action={formAction} className="flex flex-wrap items-start gap-2">
      <select name="status" defaultValue={status} aria-label="Status" className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm">
        {Object.entries(statuses).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
      </select>
      <input name="note" defaultValue={note ?? ""} maxLength={500} placeholder="Internal note (customers never see this)" aria-label="Internal note" className="min-w-[200px] flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm" />
      <button disabled={pending} className="flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : state.ok ? <Check className="h-4 w-4" /> : null} Save
      </button>
      {state.error && <p className="w-full text-xs text-accent-600">{state.error}</p>}
    </form>
  );
}
