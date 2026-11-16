"use client";

import { useActionState } from "react";
import Link from "next/link";
import { KeyRound, Loader2, Mail } from "lucide-react";
import { requestCode, resetPassword, type ForgotState } from "./actions";

const field = "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100";
const button = "flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 font-bold text-white hover:bg-brand-700 disabled:opacity-60";

export function ForgotForm() {
  const [sent, ask, asking] = useActionState<ForgotState, FormData>(requestCode, { step: "email" });
  const [done, reset, resetting] = useActionState<ForgotState, FormData>(resetPassword, { step: "code" });
  const email = done.email ?? sent.email;
  const onCode = sent.step === "code" || !!done.error;

  if (!onCode) {
    return (
      <form action={ask} className="space-y-4">
        <p className="text-sm text-gray-600">অ্যাডমিন ইমেইল দিন — সেখানে একটি ৬ সংখ্যার কোড যাবে।</p>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-semibold text-gray-700">Email</label>
          <input key={sent.email} id="email" name="email" type="email" autoComplete="username" required defaultValue={sent.email} className={field} />
        </div>
        {sent.error && <p className="rounded-lg bg-accent-50 p-3 text-sm font-medium text-accent-700" role="alert">{sent.error}</p>}
        <button type="submit" disabled={asking} className={button}>
          {asking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />} কোড পাঠান
        </button>
        <Link href="/admin/login" className="block text-center text-sm font-semibold text-brand-700 hover:underline">লগইনে ফিরে যান</Link>
      </form>
    );
  }

  const error = done.error ?? sent.error;
  return (
    <form action={reset} className="space-y-4">
      <input type="hidden" name="email" value={email} />
      {sent.info && !error && <p className="rounded-lg bg-brand-50 p-3 text-sm text-brand-800">{sent.info}</p>}
      <div>
        <label htmlFor="code" className="mb-1 block text-sm font-semibold text-gray-700">৬ সংখ্যার কোড</label>
        <input id="code" name="code" inputMode="numeric" pattern="\d{6}" maxLength={6} autoComplete="one-time-code" required className={`${field} text-center text-lg tracking-[0.5em]`} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-semibold text-gray-700">নতুন পাসওয়ার্ড</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className={field} />
      </div>
      <div>
        <label htmlFor="confirm" className="mb-1 block text-sm font-semibold text-gray-700">আবার লিখুন</label>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required className={field} />
      </div>
      {error && <p className="rounded-lg bg-accent-50 p-3 text-sm font-medium text-accent-700" role="alert">{error}</p>}
      <button type="submit" disabled={resetting} className={button}>
        {resetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} পাসওয়ার্ড বদলান
      </button>
      <a href="/admin/forgot" className="block text-center text-sm font-semibold text-brand-700 hover:underline">নতুন কোড নিন</a>
    </form>
  );
}
