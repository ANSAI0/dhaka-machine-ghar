import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin Login", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; reset?: string }> }) {
  const { next, reset } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-900 to-steel-700 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/brand/dmg-logo-transparent.png" alt="DMG logo" width={1057} height={400} className="h-14 w-auto" priority />
          <h1 className="mt-2 text-xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-500">Dhaka Machine Ghar</p>
        </div>
        {reset && <p className="mb-4 rounded-lg bg-brand-50 p-3 text-sm font-medium text-brand-800">পাসওয়ার্ড বদলানো হয়েছে — নতুন পাসওয়ার্ড দিয়ে লগইন করুন।</p>}
        <LoginForm next={next ?? ""} />
      </div>
    </div>
  );
}
