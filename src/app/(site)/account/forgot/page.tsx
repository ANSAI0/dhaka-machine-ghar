import type { Metadata } from "next";
import { AuthShell } from "../auth-ui";
import { ForgotForm } from "../forms";

export const metadata: Metadata = { title: "Reset password", robots: { index: false } };

export default function ForgotPage() {
  return (
    <AuthShell title="পাসওয়ার্ড রিসেট" sub="মোবাইলে কোড পাঠিয়ে নতুন পাসওয়ার্ড সেট করুন">
      <ForgotForm />
    </AuthShell>
  );
}
