import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCustomer, safeNext } from "@/lib/customer-auth";
import { AuthShell } from "../auth-ui";
import { LoginForm } from "../forms";

export const metadata: Metadata = { title: "Login", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await getCustomer()) redirect(next);
  return (
    <AuthShell title="স্বাগতম 👋" sub="আপনার অ্যাকাউন্টে লগইন করুন">
      <LoginForm next={next} />
    </AuthShell>
  );
}
