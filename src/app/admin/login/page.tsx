import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin Login", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-900 to-steel-700 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/brand/dmg-logo-transparent.png" alt="DMG logo" width={1057} height={400} className="h-14 w-auto" priority />
          <h1 className="mt-2 text-xl font-extrabold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-500">Dhaka Machine Ghar</p>
        </div>
        <LoginForm next={next ?? ""} />
      </div>
    </div>
  );
}
