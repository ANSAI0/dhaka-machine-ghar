import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MailX } from "lucide-react";
import { checkUnsubscribe } from "@/lib/email-token";
import { unsubscribe } from "@/lib/unsubscribe";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false } };
export const dynamic = "force-dynamic";

type SP = Promise<{ c?: string; t?: string; done?: string }>;

export default async function UnsubscribePage({ searchParams }: { searchParams: SP }) {
  const { c = "", t = "", done } = await searchParams;
  const valid = !!c && !!t && checkUnsubscribe(c, t);

  async function confirm() {
    "use server";
    await unsubscribe(c, t);
    redirect(`/unsubscribe?done=1`);
  }

  return (
    <div className="container mx-auto px-3 py-12 sm:px-4">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-gray-100">
        <MailX className="mx-auto h-12 w-12 text-brand-600" />
        {done ? (
          <>
            <h1 className="mt-3 text-xl font-bold text-gray-900">আনসাবস্ক্রাইব হয়েছে</h1>
            <p className="mt-2 text-sm text-gray-600">আর সাপ্তাহিক আপডেট ইমেইল যাবে না। চাইলে অ্যাকাউন্ট থেকে আবার চালু করতে পারবেন।</p>
            <Link href="/" className="mt-5 inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white">হোমে ফিরে যান</Link>
          </>
        ) : valid ? (
          <>
            <h1 className="mt-3 text-xl font-bold text-gray-900">সাপ্তাহিক আপডেট বন্ধ করবেন?</h1>
            <p className="mt-2 text-sm text-gray-600">নতুন মেশিন ও অফারের সাপ্তাহিক ইমেইল আর পাবেন না।</p>
            <form action={confirm} className="mt-5">
              <button className="rounded-xl bg-accent-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-accent-700">হ্যাঁ, আনসাবস্ক্রাইব করুন</button>
            </form>
          </>
        ) : (
          <>
            <h1 className="mt-3 text-xl font-bold text-gray-900">লিংকটি সঠিক নয়</h1>
            <p className="mt-2 text-sm text-gray-600">ইমেইলের নিচের লিংক থেকে আবার চেষ্টা করুন, অথবা অ্যাকাউন্টে লগইন করে আপডেট বন্ধ করুন।</p>
          </>
        )}
      </div>
    </div>
  );
}
