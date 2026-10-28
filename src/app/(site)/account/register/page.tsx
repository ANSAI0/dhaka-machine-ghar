import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCustomer, safeNext } from "@/lib/customer-auth";
import { AuthShell } from "../auth-ui";
import { RegisterForm } from "../forms";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await getCustomer()) redirect(next);
  return (
    <AuthShell title="নতুন অ্যাকাউন্ট" sub="প্রতি সপ্তাহে নতুন মেশিন ও অফারের আপডেট ইমেইলে পান — কিনতে অ্যাকাউন্ট লাগে না">
      <RegisterForm next={next} />
    </AuthShell>
  );
}
