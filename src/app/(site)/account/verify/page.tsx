import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireCustomer, safeNext } from "@/lib/customer-auth";
import { AuthShell } from "../auth-ui";
import { VerifyForm } from "../forms";

export const metadata: Metadata = { title: "Verify phone", robots: { index: false } };

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  const c = await requireCustomer("/account/verify");
  if (c.phoneVerified) redirect(next);
  return (
    <AuthShell title="মোবাইল নম্বর যাচাই" sub={`${c.phone} নম্বরে একটি ৬ অঙ্কের কোড পাঠানো হয়েছে।`}>
      <VerifyForm next={next} />
    </AuthShell>
  );
}
