"use client";

import { useActionState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { login, type LoginState } from "../auth-actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const field = "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100";
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-semibold text-gray-700">Email</label>
        <input key={state.email} id="email" name="email" type="email" autoComplete="username" required defaultValue={state.email} className={field} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-semibold text-gray-700">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={field} />
      </div>
      {state.error && <p className="rounded-lg bg-accent-50 p-3 text-sm font-medium text-accent-700" role="alert">{state.error}</p>}
      <button type="submit" disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 font-bold text-white hover:bg-brand-700 disabled:opacity-60">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />} Login
      </button>
    </form>
  );
}
