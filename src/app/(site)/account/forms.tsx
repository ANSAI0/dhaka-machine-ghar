"use client";

import Link from "next/link";
import { startTransition, useActionState } from "react";
import { districts } from "@/lib/orders";
import { changeCustomerPassword, login, register, resendCode, resendVerifyEmail, resetPassword, setNewsletter, updateProfile, verifyPhone, type AuthState } from "./actions";
import { Field, inputCls, Notice, PasswordInput, SubmitButton } from "./auth-ui";

// Submit without React's automatic form reset so typed values survive a validation error.
function useAuthForm(action: (s: AuthState, fd: FormData) => Promise<AuthState>) {
  const [state, run, pending] = useActionState<AuthState, FormData>(action, {});
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => run(fd));
  };
  return { state, pending, onSubmit };
}

export function LoginForm({ next }: { next: string }) {
  const { state, pending, onSubmit } = useAuthForm(login);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <Field label="মোবাইল নম্বর বা ইমেইল">
        <input name="id" defaultValue={state.fields?.id} autoComplete="username" inputMode="email" placeholder="01XXXXXXXXX" required className={inputCls} />
      </Field>
      <Field label="পাসওয়ার্ড">
        <PasswordInput name="password" autoComplete="current-password" />
      </Field>
      <div className="flex justify-end">
        <Link href="/account/forgot" className="text-sm font-semibold text-brand-700 hover:underline">পাসওয়ার্ড ভুলে গেছেন?</Link>
      </div>
      <Notice error={state.error} />
      <SubmitButton pending={pending}>লগইন করুন</SubmitButton>
      <p className="text-center text-sm text-gray-500">
        নতুন? <Link href={`/account/register${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-bold text-accent-600 hover:underline">অ্যাকাউন্ট খুলুন</Link>
      </p>
    </form>
  );
}

export function RegisterForm({ next }: { next: string }) {
  const { state, pending, onSubmit } = useAuthForm(register);
  const f = state.fields ?? {};
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <Field label="আপনার নাম">
        <input name="name" defaultValue={f.name} autoComplete="name" required className={inputCls} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="মোবাইল নম্বর">
          <input name="phone" type="tel" defaultValue={f.phone} autoComplete="tel" placeholder="01XXXXXXXXX" required className={inputCls} />
        </Field>
        <Field label="ইমেইল">
          <input name="email" type="email" defaultValue={f.email} autoComplete="email" required className={inputCls} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="পাসওয়ার্ড" hint="অন্তত ৮ অক্ষর">
          <PasswordInput name="password" autoComplete="new-password" />
        </Field>
        <Field label="আবার পাসওয়ার্ড">
          <PasswordInput name="confirm" autoComplete="new-password" />
        </Field>
      </div>
      <label className="flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50/60 p-3 text-sm text-gray-700">
        <input type="checkbox" name="newsletter" defaultChecked className="mt-0.5 h-4 w-4 accent-brand-600" />
        <span><strong className="text-brand-800">প্রতি সপ্তাহে ইমেইলে আপডেট চাই</strong> — নতুন মেশিন, দাম ও অফার। যেকোনো সময় বন্ধ করা যাবে।</span>
      </label>
      <Notice error={state.error} />
      <SubmitButton pending={pending}>অ্যাকাউন্ট খুলুন</SubmitButton>
      <p className="text-center text-sm text-gray-500">
        আগেই অ্যাকাউন্ট আছে? <Link href="/account/login" className="font-bold text-accent-600 hover:underline">লগইন করুন</Link>
      </p>
    </form>
  );
}

export function VerifyForm({ next }: { next: string }) {
  const { state, pending, onSubmit } = useAuthForm(verifyPhone);
  const resend = useAuthForm(async () => resendCode());
  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <Field label="৬ অঙ্কের কোড">
          <input name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="\d{6}" required className={`${inputCls} text-center font-mono text-2xl tracking-[0.5em]`} />
        </Field>
        <Notice error={state.error} />
        <SubmitButton pending={pending}>যাচাই করুন</SubmitButton>
      </form>
      <form onSubmit={resend.onSubmit} className="text-center">
        <button disabled={resend.pending} className="text-sm font-semibold text-brand-700 hover:underline disabled:opacity-50">কোড পাননি? আবার পাঠান</button>
        <div className="mt-2"><Notice error={resend.state.error} ok={resend.state.ok} /></div>
      </form>
      <p className="text-center text-xs text-gray-400"><Link href={next} className="underline">পরে করব</Link> — যাচাই না করলে শুধু এই অ্যাকাউন্ট থেকে দেওয়া অর্ডার দেখা যাবে।</p>
    </div>
  );
}

export function ForgotForm() {
  const { state, pending, onSubmit } = useAuthForm(resetPassword);
  const codeStep = state.step === "code";
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="অ্যাকাউন্টের মোবাইল নম্বর">
        <input name="phone" type="tel" defaultValue={state.fields?.phone} readOnly={codeStep} autoComplete="tel" placeholder="01XXXXXXXXX" required className={inputCls} />
      </Field>
      {codeStep && (
        <>
          <Field label="SMS-এ পাওয়া কোড">
            <input name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required className={`${inputCls} text-center font-mono text-xl tracking-[0.4em]`} />
          </Field>
          <Field label="নতুন পাসওয়ার্ড" hint="অন্তত ৮ অক্ষর">
            <PasswordInput name="password" autoComplete="new-password" />
          </Field>
        </>
      )}
      <Notice error={state.error} ok={state.ok} />
      <SubmitButton pending={pending}>{codeStep ? "পাসওয়ার্ড পরিবর্তন করুন" : "কোড পাঠান"}</SubmitButton>
      <p className="text-center text-sm text-gray-500"><Link href="/account/login" className="font-semibold text-brand-700 hover:underline">← লগইনে ফিরে যান</Link></p>
    </form>
  );
}

export function ProfileForm({ v }: { v: { name: string; email: string; address: string; district: string } }) {
  const { state, pending, onSubmit } = useAuthForm(updateProfile);
  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
      <Field label="নাম"><input name="name" defaultValue={v.name} required className={inputCls} /></Field>
      <Field label="ইমেইল"><input name="email" type="email" defaultValue={v.email} required className={inputCls} /></Field>
      <Field label="ডেলিভারি ঠিকানা" hint="চেকআউটে নিজে থেকে বসে যাবে"><input name="address" defaultValue={v.address} placeholder="গ্রাম/রোড, থানা" className={inputCls} /></Field>
      <Field label="জেলা">
        <select name="district" defaultValue={v.district} className={inputCls}>
          <option value="">নির্বাচন করুন</option>
          {districts.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </Field>
      <div className="space-y-3 sm:col-span-2 lg:col-span-1">
        <Notice error={state.error} ok={state.ok} />
        <div className="max-w-xs"><SubmitButton pending={pending}>সংরক্ষণ করুন</SubmitButton></div>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const { state, pending, onSubmit } = useAuthForm(changeCustomerPassword);
  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
      <Field label="বর্তমান পাসওয়ার্ড"><PasswordInput name="current" autoComplete="current-password" /></Field>
      <Field label="নতুন পাসওয়ার্ড"><PasswordInput name="next" autoComplete="new-password" /></Field>
      <Field label="আবার নতুন পাসওয়ার্ড"><PasswordInput name="confirm" autoComplete="new-password" /></Field>
      <div className="space-y-3 sm:col-span-3 lg:col-span-1">
        <Notice error={state.error} ok={state.ok} />
        <div className="max-w-xs"><SubmitButton pending={pending}>পাসওয়ার্ড পরিবর্তন</SubmitButton></div>
      </div>
    </form>
  );
}

export function NewsletterBox({ email, verified, on }: { email: string; verified: boolean; on: boolean }) {
  const toggle = useAuthForm(setNewsletter);
  const resend = useAuthForm(async () => resendVerifyEmail());
  return (
    <div className="space-y-3 text-sm">
      <p className="break-all text-gray-600">
        {email} {verified ? <span className="font-semibold text-brand-700">· নিশ্চিত</span> : <span className="font-semibold text-amber-600">· নিশ্চিত হয়নি</span>}
      </p>
      {!verified && (
        <form onSubmit={resend.onSubmit} className="rounded-xl bg-amber-50 p-3 text-amber-900">
          <p>ইমেইলের লিংকে ক্লিক করে নিশ্চিত না করা পর্যন্ত সাপ্তাহিক আপডেট যাবে না।</p>
          <button disabled={resend.pending} className="mt-2 font-bold underline disabled:opacity-50">লিংক আবার পাঠান</button>
          <div className="mt-2"><Notice error={resend.state.error} ok={resend.state.ok} /></div>
        </form>
      )}
      <form onSubmit={toggle.onSubmit} className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 font-semibold text-gray-800">
          <input type="checkbox" name="newsletter" defaultChecked={on} className="h-4 w-4 accent-brand-600" /> প্রতি সপ্তাহে আপডেট ইমেইল
        </label>
        <button disabled={toggle.pending} className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60">সংরক্ষণ</button>
      </form>
      <Notice error={toggle.state.error} ok={toggle.state.ok} />
    </div>
  );
}
