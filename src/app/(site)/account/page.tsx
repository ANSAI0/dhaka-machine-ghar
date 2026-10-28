import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { BadgeCheck, FileDown, LogOut, Mail, Package, ShieldCheck, ShieldAlert, Truck, UserRound } from "lucide-react";
import { requireCustomer } from "@/lib/customer-auth";
import { db } from "@/lib/db";
import { customerDocUrl } from "@/lib/doc-token";
import { otpAvailable } from "@/lib/otp";
import { formatBDT } from "@/lib/site";
import { factorySteps, stepIndex, warrantyStatus } from "@/lib/tracking";
import { logout } from "./actions";
import { NewsletterBox, PasswordForm, ProfileForm } from "./forms";

export const metadata: Metadata = { title: "My account", robots: { index: false } };
export const dynamic = "force-dynamic";

const day = (d: Date) => d.toLocaleDateString("bn-BD", { dateStyle: "medium", timeZone: "Asia/Dhaka" });

export default async function AccountPage() {
  const c = await requireCustomer("/account");
  // Orders placed while signed in always show; orders placed earlier with the same phone only once
  // the phone is verified — otherwise anyone could register with someone else's number.
  const orderWhere: Prisma.OrderWhereInput = c.phoneVerified ? { OR: [{ customerId: c.id }, { phone: c.phone }] } : { customerId: c.id };
  const [orders, canVerify] = await Promise.all([
    db.order.findMany({ where: orderWhere, orderBy: { createdAt: "desc" }, include: { items: true } }),
    otpAvailable(),
  ]);
  const warranties = await db.warranty.findMany({
    where: c.phoneVerified ? { OR: [{ phone: c.phone }, { orderId: { in: orders.map((o) => o.id) } }] } : { orderId: { in: orders.map((o) => o.id) } },
    orderBy: { purchasedAt: "desc" },
  });
  const active = orders.filter((o) => o.status !== "handover").length;
  const initials = c.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="container mx-auto px-3 pt-4 sm:px-4 lg:pt-6">
      {/* Welcome */}
      <section className="relative overflow-hidden rounded-3xl bg-ink p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -left-24 -top-28 h-72 w-72 rounded-full bg-brand-600/35 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-10 h-64 w-64 rounded-full bg-steel-600/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="relative flex flex-wrap items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-xl font-extrabold">{initials}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-white/70">স্বাগতম,</p>
            <h1 className="truncate text-2xl font-extrabold">{c.name}</h1>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-white/80">
              {c.phone}
              {c.phoneVerified ? <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold"><BadgeCheck className="h-3.5 w-3.5" /> যাচাইকৃত</span> : <span className="rounded-full bg-amber-400/90 px-2 py-0.5 text-xs font-semibold text-amber-950">যাচাই হয়নি</span>}
            </p>
          </div>
          <form action={logout}>
            <button className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"><LogOut className="h-4 w-4" /> লগআউট</button>
          </form>
        </div>
        <div className="relative mt-6 grid grid-cols-3 gap-3">
          {[
            { n: orders.length, l: "মোট অর্ডার", Icon: Package },
            { n: active, l: "কারখানায় তৈরি হচ্ছে", Icon: Truck },
            { n: warranties.length, l: "ওয়ারেন্টি", Icon: ShieldCheck },
          ].map(({ n, l, Icon }) => (
            <div key={l} className="rounded-2xl bg-white/10 p-3 md:backdrop-blur sm:p-4">
              <Icon className="h-5 w-5 text-white/70" />
              <p className="mt-1 text-2xl font-extrabold">{n}</p>
              <p className="text-xs text-white/75">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {!c.phoneVerified && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <p className="flex-1">মোবাইল নম্বর যাচাই করলে এই নম্বরে আগে দেওয়া অর্ডার ও ওয়ারেন্টিও এখানে দেখা যাবে।</p>
          {canVerify ? (
            <Link href="/account/verify" className="rounded-lg bg-amber-500 px-3 py-1.5 font-bold text-white hover:bg-amber-600">এখন যাচাই করুন</Link>
          ) : (
            <span className="text-xs">যাচাইয়ের জন্য আমাদের হটলাইনে কল করুন।</span>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Orders */}
        <section className="space-y-3 lg:col-span-2">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-gray-900"><Package className="h-5 w-5 text-brand-600" /> আমার অর্ডার</h2>
          {orders.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <p className="font-semibold text-gray-700">এখনো কোনো অর্ডার নেই</p>
              <Link href="/shop" className="mt-3 inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white">মেশিন দেখুন</Link>
            </div>
          )}
          {orders.map((o) => {
            const i = stepIndex(o.status);
            const pct = Math.round(((i + 1) / factorySteps.length) * 100);
            return (
              <article key={o.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-sm font-bold text-gray-900">{o.id}</p>
                    <p className="text-xs text-gray-500">{day(o.createdAt)} · {formatBDT(o.total)}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${o.status === "handover" ? "bg-brand-50 text-brand-700" : "bg-steel-50 text-steel-700"}`}>{i + 1}/6 · {factorySteps[i].title}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-gray-700">{o.items.map((it) => `${it.name} × ${it.qty}`).join(", ")}</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-steel-600" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  <Link href={`/track?q=${o.id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 font-semibold hover:bg-gray-50"><Truck className="h-4 w-4" /> ট্র্যাক</Link>
                  <a href={customerDocUrl(o.id, "invoice")} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 font-semibold hover:bg-gray-50"><FileDown className="h-4 w-4" /> ইনভয়েস</a>
                  {o.status === "handover" && (
                    <a href={customerDocUrl(o.id, "challan")} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 font-semibold hover:bg-gray-50"><FileDown className="h-4 w-4" /> চালান</a>
                  )}
                </div>
              </article>
            );
          })}

          <h2 className="flex items-center gap-2 pt-4 text-lg font-extrabold text-gray-900"><ShieldCheck className="h-5 w-5 text-brand-600" /> আমার ওয়ারেন্টি</h2>
          {warranties.length === 0 ? (
            <p className="rounded-2xl bg-white p-5 text-sm text-gray-500 shadow-sm">মেশিন ডেলিভারির সময় সিরিয়াল নম্বর এখানে যোগ হবে।</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {warranties.map((w) => {
                const { expires, active: on } = warrantyStatus(w);
                return (
                  <div key={w.serial} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <p className="font-mono text-sm font-bold">{w.serial}</p>
                    <p className="text-sm text-gray-700">{w.productName}</p>
                    <p className={`mt-1 text-xs font-semibold ${on ? "text-brand-700" : "text-gray-400"}`}>{on ? "চালু" : "মেয়াদ শেষ"} · {day(expires)} পর্যন্ত</p>
                    <Link href="/warranty" className="mt-2 inline-block text-xs font-semibold text-brand-700 hover:underline">সার্ভিস চাই →</Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Profile */}
        <aside className="space-y-6">
          <section className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 font-extrabold text-gray-900"><Mail className="h-5 w-5 text-brand-600" /> সাপ্তাহিক মেশিন আপডেট</h2>
            <NewsletterBox email={c.email} verified={c.emailVerified} on={c.newsletter} />
          </section>
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-extrabold text-gray-900"><UserRound className="h-5 w-5 text-brand-600" /> প্রোফাইল ও ঠিকানা</h2>
            <ProfileForm v={{ name: c.name, email: c.email, address: c.address ?? "", district: c.district ?? "" }} />
          </section>
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-extrabold text-gray-900">পাসওয়ার্ড পরিবর্তন</h2>
            <PasswordForm />
          </section>
        </aside>
      </div>
    </div>
  );
}
