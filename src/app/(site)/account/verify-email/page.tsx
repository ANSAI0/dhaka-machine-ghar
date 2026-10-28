import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck, MailWarning } from "lucide-react";
import { db } from "@/lib/db";
import { checkVerifyEmail } from "@/lib/email-token";

export const metadata: Metadata = { title: "Verify email", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ c?: string; x?: string; t?: string }> }) {
  const { c = "", x = "", t = "" } = await searchParams;
  const customer = c ? await db.customer.findUnique({ where: { id: c } }) : null;
  // The token is bound to the address it was sent to, so changing the email invalidates old links.
  const ok = !!customer && checkVerifyEmail(c, customer.email, x, t);
  if (ok && !customer.emailVerified) await db.customer.update({ where: { id: c }, data: { emailVerified: true } });

  return (
    <div className="container mx-auto px-3 py-12 sm:px-4">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-gray-100">
        {ok ? <MailCheck className="mx-auto h-12 w-12 text-brand-600" /> : <MailWarning className="mx-auto h-12 w-12 text-accent-600" />}
        <h1 className="mt-3 text-xl font-extrabold text-gray-900">{ok ? "ইমেইল নিশ্চিত হয়েছে" : "লিংকটি সঠিক নয় বা মেয়াদ শেষ"}</h1>
        <p className="mt-2 text-sm text-gray-600">{ok ? "এখন থেকে প্রতি সপ্তাহে নতুন মেশিন ও অফারের আপডেট পাবেন।" : "অ্যাকাউন্টে লগইন করে নতুন লিংক পাঠান।"}</p>
        <Link href="/account" className="mt-5 inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white">আমার অ্যাকাউন্ট</Link>
      </div>
    </div>
  );
}
