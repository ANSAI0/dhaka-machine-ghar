"use client";

import { startTransition, useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import type { EditableSite } from "@/lib/site";
import { contrastWithWhite, isHex, themeDefaults, type Theme } from "@/lib/theme";
import { addAdmin, changePassword, saveBot, saveEmail, saveMarketing, saveSiteSettings, saveSms, saveTheme, sendNewsletterNow, sendTestEmail, sendTestSms, type FormState } from "./actions";

const input = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100";

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold text-gray-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-400">{hint}</span>}
    </label>
  );
}

// Keeps typed values on validation errors (a plain <form action> resets the fields).
function useForm(fn: (s: FormState, fd: FormData) => Promise<FormState>, resetOnOk = false) {
  const [state, action, pending] = useActionState<FormState, FormData>(fn, {});
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    // Pass the submitter so a clicked button's name/value (e.g. reset=1) is included.
    const fd = new FormData(form, (e.nativeEvent as SubmitEvent).submitter);
    startTransition(async () => {
      await action(fd);
      if (resetOnOk) form.reset();
    });
  };
  return { state, pending, onSubmit };
}

function Footer({ state, pending, label }: { state: FormState; pending: boolean; label: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
      <button disabled={pending} className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} {label}
      </button>
      {state.error && <p className="text-sm text-accent-600" role="status">{state.error}</p>}
      {state.ok && <p className="text-sm text-brand-700" role="status">{state.ok}</p>}
    </div>
  );
}

export function SiteSettingsForm({ v }: { v: EditableSite }) {
  const f = useForm(saveSiteSettings);
  return (
    <form onSubmit={f.onSubmit} className="grid gap-4 sm:grid-cols-2">
      <Row label="Factory address"><input name="address" defaultValue={v.address} className={input} /></Row>
      <Row label="Showroom"><input name="showroom" defaultValue={v.showroom} className={input} /></Row>
      <Row label="Hotline"><input name="phone" defaultValue={v.phone} className={input} /></Row>
      <Row label="WhatsApp number" hint="Empty = same as hotline"><input name="whatsapp" defaultValue={v.whatsapp} className={input} /></Row>
      <Row label="Email"><input name="email" type="email" defaultValue={v.email} className={input} /></Row>
      <Row label="Office hours"><input name="hours" defaultValue={v.hours} className={input} /></Row>
      <Row label="Facebook page"><input name="facebook" defaultValue={v.facebook} className={input} /></Row>
      <Row label="YouTube channel"><input name="youtube" defaultValue={v.youtube} className={input} /></Row>
      <Row label="Map location" hint="Paste the Google Maps share link of the factory pin (Share → Copy link), or a place name / lat,lng"><input name="mapQuery" defaultValue={v.mapQuery} className={input} /></Row>
      <Row label="Advance booking %" hint="Shown on product pages and used for order totals"><input name="advancePercent" type="number" min={0} max={100} defaultValue={v.advancePercent} className={input} /></Row>
      <Row label="Warranty — new machines (months)"><input name="warrantyNewMonths" type="number" min={0} max={120} defaultValue={v.warrantyNewMonths} className={input} /></Row>
      <Row label="Warranty — reconditioned (months)"><input name="warrantyReconMonths" type="number" min={0} max={120} defaultValue={v.warrantyReconMonths} className={input} /></Row>
      <Footer {...f} label="Save business info" />
    </form>
  );
}

export function MarketingForm({ pixelId, gtmId, hasToken, capiTestCode }: { pixelId: string; gtmId: string; hasToken: boolean; capiTestCode: string }) {
  const f = useForm(saveMarketing);
  return (
    <form onSubmit={f.onSubmit} className="grid gap-4 sm:grid-cols-2">
      <Row label="Meta Pixel ID" hint="Events Manager → Data sources → your pixel"><input name="pixelId" defaultValue={pixelId} inputMode="numeric" className={input} /></Row>
      <Row label="Google Tag Manager ID" hint="e.g. GTM-ABCD123"><input name="gtmId" defaultValue={gtmId} className={input} /></Row>
      <Row label="Conversions API access token" hint={hasToken ? "A token is saved. Leave blank to keep it, or type clear to remove it." : "Server-side Purchase/Lead events. Stored on the server only."}>
        <input name="capiToken" type="password" autoComplete="off" placeholder={hasToken ? "••••••••  (saved)" : ""} className={input} />
      </Row>
      <Row label="CAPI test event code" hint="Optional — from Events Manager → Test events. Clear it when done."><input name="capiTestCode" defaultValue={capiTestCode} className={input} /></Row>
      <Footer {...f} label="Save marketing" />
    </form>
  );
}

export function PasswordForm() {
  const f = useForm(changePassword, true);
  return (
    <form onSubmit={f.onSubmit} className="grid gap-4 sm:grid-cols-3">
      <Row label="Current password"><input name="current" type="password" autoComplete="current-password" required className={input} /></Row>
      <Row label="New password" hint="At least 10 characters"><input name="next" type="password" autoComplete="new-password" required minLength={10} className={input} /></Row>
      <Row label="Repeat new password"><input name="confirm" type="password" autoComplete="new-password" required className={input} /></Row>
      <Footer {...f} label="Change password" />
    </form>
  );
}

export function AddAdminForm() {
  const f = useForm(addAdmin, true);
  return (
    <form onSubmit={f.onSubmit} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Row label="Name"><input name="name" required className={input} /></Row>
      <Row label="Email"><input name="email" type="email" required className={input} /></Row>
      <Row label="Temporary password" hint="10+ characters"><input name="password" type="text" autoComplete="off" required minLength={10} className={input} /></Row>
      <Row label="Role" hint="Staff can manage orders, products, quotes and service">
        <select name="role" defaultValue="staff" className={input}><option value="staff">Staff</option><option value="owner">Owner</option></select>
      </Row>
      <Footer {...f} label="Add user" />
    </form>
  );
}

const themeFields: { key: keyof Theme; label: string; hint: string }[] = [
  { key: "brand", label: "Primary", hint: "Nav bar, prices, main buttons (logo green)" },
  { key: "accent", label: "Accent", hint: "Order buttons, discounts, highlights (logo crimson)" },
  { key: "steel", label: "Secondary", hint: "Reconditioned badge, info boxes (logo blue)" },
];

export function ThemeForm({ theme }: { theme: Theme }) {
  const f = useForm(saveTheme);
  const [t, setT] = useState(theme);
  const set = (k: keyof Theme, v: string) => setT((x) => ({ ...x, [k]: v }));
  const ok = (k: keyof Theme) => isHex(t[k]) && contrastWithWhite(t[k]) >= (k === "steel" ? 3 : 4.5);

  return (
    <form onSubmit={f.onSubmit} className="grid gap-5 sm:grid-cols-2">
      <div className="space-y-4">
        {themeFields.map(({ key, label, hint }) => (
          <div key={key} className="text-sm">
            <span className="mb-1 block font-semibold text-gray-700">{label}</span>
            <div className="flex items-center gap-2">
              <input type="color" value={isHex(t[key]) ? t[key] : "#000000"} onChange={(e) => set(key, e.target.value)} aria-label={`${label} colour picker`} className="h-10 w-14 cursor-pointer rounded-lg border border-gray-200 bg-white p-1" />
              <input name={key} value={t[key]} onChange={(e) => set(key, e.target.value.trim())} aria-label={`${label} hex`} className={`${input} max-w-[140px] font-mono`} />
              {!ok(key) && <span className="text-xs font-medium text-accent-600">{isHex(t[key]) ? "too light for white text" : "use #rrggbb"}</span>}
            </div>
            <span className="mt-1 block text-xs text-gray-400">{hint}</span>
          </div>
        ))}
      </div>

      <div className="sm:col-span-2">
        <span className="mb-2 block text-sm font-semibold text-gray-700">Mobile style</span>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { v: "dark", label: "Dark luxury", hint: "Near-black with gold accents", sw: "bg-[#070a09] ring-[#d6ae55]" },
            { v: "light", label: "Clean light", hint: "White, soft shadows, brand colours", sw: "bg-white ring-gray-300" },
          ].map((o) => (
            <label key={o.v} className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 text-sm ${t.mobile === o.v ? "border-brand-600 bg-brand-50" : "border-gray-200"}`}>
              <input type="radio" name="mobile" value={o.v} checked={t.mobile === o.v} onChange={() => setT((x) => ({ ...x, mobile: o.v as Theme["mobile"] }))} className="h-4 w-4 accent-brand-600" />
              <span className={`h-8 w-8 shrink-0 rounded-lg ring-2 ${o.sw}`} />
              <span><span className="block font-semibold text-gray-800">{o.label}</span><span className="text-xs text-gray-500">{o.hint}</span></span>
            </label>
          ))}
        </div>
        <span className="mt-1 block text-xs text-gray-400">Phones only — the desktop site always uses the light design.</span>
      </div>

      {/* Live preview — uses the picked colours directly, before saving. */}
      <div className="overflow-hidden rounded-xl border border-gray-200 text-sm" aria-label="Preview">
        <div className="px-4 py-2.5 font-semibold text-white" style={{ background: t.brand }}>Home · Shop · Order Tracking</div>
        <div className="space-y-3 bg-white p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: t.brand }}>Brand New</span>
            <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: t.steel }}>Foreign Reconditioned</span>
            <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: t.accent }}>8% OFF</span>
          </div>
          <p className="text-lg font-bold" style={{ color: t.brand }}>৳2,95,000</p>
          <div className="flex gap-2">
            <span className="rounded-lg px-4 py-2 font-bold text-white" style={{ background: t.accent }}>অর্ডার করুন</span>
            <span className="rounded-lg border-2 px-4 py-2 font-bold" style={{ borderColor: t.brand, color: t.brand }}>কার্টে যোগ করুন</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button disabled={f.pending} className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">
          {f.pending && <Loader2 className="h-4 w-4 animate-spin" />} Save colours
        </button>
        <button
          type="submit"
          name="reset"
          value="1"
          onClick={() => setT(themeDefaults)}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Reset to logo colours
        </button>
        {f.state.error && <p className="text-sm text-accent-600" role="status">{f.state.error}</p>}
        {f.state.ok && <p className="text-sm text-brand-700" role="status">{f.state.ok}</p>}
      </div>
    </form>
  );
}

export function BotForm({ enabled, knowledge, aiReady }: { enabled: boolean; knowledge: string; aiReady: boolean }) {
  const f = useForm(saveBot);
  return (
    <form onSubmit={f.onSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-3 text-sm sm:col-span-2">
        <label className="flex items-center gap-2 font-semibold text-gray-700"><input type="checkbox" name="enabled" defaultChecked={enabled} className="h-4 w-4 accent-brand-600" /> Show the chat assistant on the website</label>
        <p className={`rounded-lg p-3 ${aiReady ? "bg-brand-50 text-brand-800" : "bg-amber-50 text-amber-900"}`}>
          {aiReady
            ? "AI mode is on (Claude). It answers from your live catalog and these notes, and saves visitors who leave a name and number as leads."
            : "Basic mode: no ANTHROPIC_API_KEY in the server's .env, so the assistant matches machines by keyword, captures phone numbers, and points people to WhatsApp. Add the key and restart to switch to AI mode."}
        </p>
      </div>
      <Row label="Extra notes for the assistant" hint="Facts it should know: delivery charges, current offers, installation, what not to promise… (max 4000 characters)">
        <textarea name="knowledge" rows={6} defaultValue={knowledge} maxLength={4000} className={`${input} sm:col-span-2`} />
      </Row>
      <Footer {...f} label="Save assistant" />
    </form>
  );
}

type SmsView = { provider: string; hasKey: boolean; senderId: string; customUrl: string; onOrder: boolean; onStep: boolean; language: string };

export function SmsForm({ v }: { v: SmsView }) {
  const f = useForm(saveSms);
  const t = useForm(sendTestSms);
  const [provider, setProvider] = useState(v.provider);
  return (
    <div className="space-y-6">
      <form onSubmit={f.onSubmit} className="grid gap-4 sm:grid-cols-2">
        <Row label="SMS gateway">
          <select name="provider" value={provider} onChange={(e) => setProvider(e.target.value)} className={input}>
            <option value="none">Off</option>
            <option value="bulksmsbd">BulkSMSBD</option>
            <option value="custom">Other gateway (URL)</option>
          </select>
        </Row>
        <Row label="SMS language" hint="Bangla: 70 characters per SMS part · English: 160">
          <select name="language" defaultValue={v.language} className={input}><option value="bn">বাংলা</option><option value="en">English</option></select>
        </Row>
        {provider === "bulksmsbd" && (
          <>
            <Row label="API key" hint={v.hasKey ? "A key is saved. Leave blank to keep it, or type clear to remove it." : "From your BulkSMSBD dashboard"}>
              <input name="apiKey" type="password" autoComplete="off" placeholder={v.hasKey ? "••••••••  (saved)" : ""} className={input} />
            </Row>
            <Row label="Sender ID" hint="Approved sender ID / masking name"><input name="senderId" defaultValue={v.senderId} className={input} /></Row>
          </>
        )}
        {provider === "custom" && (
          <Row label="Gateway URL" hint="GET request. Use {number} (8801…) and {message}, e.g. https://api.example.com/send?key=XXX&to={number}&text={message}">
            <input name="customUrl" defaultValue={v.customUrl} className={`${input} font-mono text-xs`} />
          </Row>
        )}
        <div className="space-y-2 text-sm sm:col-span-2">
          <label className="flex items-center gap-2 text-gray-700"><input type="checkbox" name="onOrder" defaultChecked={v.onOrder} className="h-4 w-4 accent-brand-600" /> SMS the customer when an order is placed (invoice + tracking link)</label>
          <label className="flex items-center gap-2 text-gray-700"><input type="checkbox" name="onStep" defaultChecked={v.onStep} className="h-4 w-4 accent-brand-600" /> SMS the customer when the factory step changes</label>
        </div>
        <Footer {...f} label="Save SMS settings" />
      </form>
      <form onSubmit={t.onSubmit} className="flex flex-wrap items-end gap-3 border-t border-gray-100 pt-4">
        <Row label="Send a test SMS to"><input name="testPhone" type="tel" placeholder="01XXXXXXXXX" className={input} /></Row>
        <button disabled={t.pending} className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-50 disabled:opacity-60">
          {t.pending && <Loader2 className="h-4 w-4 animate-spin" />} Send test
        </button>
        {t.state.error && <p className="text-sm text-accent-600" role="status">{t.state.error}</p>}
        {t.state.ok && <p className="text-sm text-brand-700" role="status">{t.state.ok}</p>}
      </form>
    </div>
  );
}

const weekdays = ["রবিবার (Sun)", "সোমবার (Mon)", "মঙ্গলবার (Tue)", "বুধবার (Wed)", "বৃহস্পতিবার (Thu)", "শুক্রবার (Fri)", "শনিবার (Sat)"];
type EmailView = {
  enabled: boolean; host: string; port: number; secure: boolean; user: string; hasPass: boolean; fromEmail: string; fromName: string; weekday: number; weeklyNote: string;
  onOrder: boolean; onPayment: boolean; onStep: boolean; onDelivery: boolean; alertTo: string;
};

export function EmailForm({ v, audience }: { v: EmailView; audience: number }) {
  const f = useForm(saveEmail);
  const t = useForm(sendTestEmail);
  const now = useForm(async () => sendNewsletterNow());
  return (
    <div className="space-y-6">
      <form onSubmit={f.onSubmit} className="grid gap-4 sm:grid-cols-2">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 sm:col-span-2">
          1 · Email account (SMTP) — the address emails are sent from
          <span className={`rounded-full px-2 py-0.5 text-[10px] normal-case tracking-normal ${v.host && v.user && v.hasPass && v.fromEmail ? "bg-brand-50 text-brand-700" : "bg-amber-50 text-amber-700"}`}>
            {v.host && v.user && v.hasPass && v.fromEmail ? "Connected" : "Not set up — no emails are sent"}
          </span>
        </p>
        <p className="-mt-2 text-xs text-gray-500 sm:col-span-2">Gmail: smtp.gmail.com · port 587 · your Gmail address · an App Password (Google Account → Security → 2-Step Verification → App passwords). Zoho, Brevo or your hosting mail also work.</p>
        <Row label="SMTP host" hint="e.g. smtp.gmail.com"><input name="host" defaultValue={v.host} className={input} /></Row>
        <Row label="Port" hint="587 (STARTTLS) or 465 (SSL)"><input name="port" type="number" defaultValue={v.port} className={input} /></Row>
        <Row label="Username" hint="Usually your full email address"><input name="user" defaultValue={v.user} autoComplete="off" className={input} /></Row>
        <Row label="Password / app password" hint={v.hasPass ? "Saved. Leave blank to keep, or type clear to remove." : "For Gmail use an App Password, not your normal password."}>
          <input name="pass" type="password" autoComplete="off" placeholder={v.hasPass ? "••••••••  (saved)" : ""} className={input} />
        </Row>
        <Row label="From email" hint="Usually the same as the username"><input name="fromEmail" type="email" defaultValue={v.fromEmail} className={input} /></Row>
        <Row label="From name"><input name="fromName" defaultValue={v.fromName} className={input} /></Row>
        <label className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2"><input type="checkbox" name="secure" defaultChecked={v.secure} className="h-4 w-4 accent-brand-600" /> SSL on connect (port 465)</label>

        <p className="mt-2 border-t border-gray-100 pt-4 text-xs font-bold uppercase tracking-wider text-gray-500 sm:col-span-2">2 · Order emails to customers (sent when the customer gives an email at checkout)</p>
        <div className="grid gap-2 sm:col-span-2 sm:grid-cols-2">
          {[
            { name: "onOrder", on: v.onOrder, label: "Order confirmation", hint: "Invoice no., items, amount, track & pay-online buttons" },
            { name: "onPayment", on: v.onPayment, label: "Payment receipt", hint: "After an online (SSLCommerz) payment is confirmed" },
            { name: "onDelivery", on: v.onDelivery, label: "Delivery / handover", hint: "When moved to Handover — challan, invoice & warranty links" },
            { name: "onStep", on: v.onStep, label: "Every factory step", hint: "Fabrication, motor & panel, load test, painting" },
          ].map((o) => (
            <label key={o.name} className="flex items-start gap-2.5 rounded-lg border border-gray-200 p-3 text-sm hover:bg-gray-50">
              <input type="checkbox" name={o.name} defaultChecked={o.on} className="mt-0.5 h-4 w-4 accent-brand-600" />
              <span><span className="block font-semibold text-gray-800">{o.label}</span><span className="text-xs text-gray-500">{o.hint}</span></span>
            </label>
          ))}
        </div>
        <Row label="New-order alert to (owner)" hint="Get an email for every new order and online payment. Leave empty for none.">
          <input name="alertTo" type="email" defaultValue={v.alertTo} placeholder="owner@example.com" className={input} />
        </Row>
        <div />

        <p className="mt-2 border-t border-gray-100 pt-4 text-xs font-bold uppercase tracking-wider text-gray-500 sm:col-span-2">3 · Weekly product-update email</p>
        <div className="sm:col-span-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700"><input type="checkbox" name="enabled" defaultChecked={v.enabled} className="h-4 w-4 accent-brand-600" /> Send the weekly product-update email automatically</label>
          <p className="mt-1 text-xs text-gray-500">Goes to registered customers who ticked “weekly update” and confirmed their email — currently <strong>{audience}</strong>.</p>
        </div>
        <Row label="Send every" hint="From 10:00 AM Dhaka time">
          <select name="weekday" defaultValue={v.weekday} className={input}>{weekdays.map((d, i) => <option key={d} value={i}>{d}</option>)}</select>
        </Row>
        <Row label="This week’s note / offer" hint="Shown at the top of the email. Leave empty for none.">
          <textarea name="weeklyNote" rows={3} defaultValue={v.weeklyNote} maxLength={1000} className={input} />
        </Row>
        <Footer {...f} label="Save email settings" />
      </form>

      <div className="flex flex-wrap items-end gap-3 border-t border-gray-100 pt-4">
        <form onSubmit={t.onSubmit} className="flex flex-wrap items-end gap-3">
          <Row label="Send a test email to"><input name="testTo" type="email" className={input} /></Row>
          <button disabled={t.pending} className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-50 disabled:opacity-60">
            {t.pending && <Loader2 className="h-4 w-4 animate-spin" />} Send test
          </button>
        </form>
        <a href="/admin/newsletter/preview" target="_blank" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-50">Preview this week’s email</a>
        <form onSubmit={now.onSubmit}>
          <button
            disabled={now.pending}
            onClick={(e) => { if (!window.confirm(`Send this week’s update now to ${audience} subscriber(s)?`)) e.preventDefault(); }}
            className="flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-bold text-white hover:bg-accent-700 disabled:opacity-60"
          >
            {now.pending && <Loader2 className="h-4 w-4 animate-spin" />} Send now
          </button>
        </form>
      </div>
      {[t.state, now.state].map((st, i) => (st.error || st.ok ? <p key={i} role="status" className={`text-sm ${st.error ? "text-accent-600" : "text-brand-700"}`}>{st.error ?? st.ok}</p> : null))}
    </div>
  );
}
