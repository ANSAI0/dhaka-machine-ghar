"use server";

import { createHash, randomInt } from "node:crypto";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { mailerReady, sendMail } from "@/lib/mailer";
import { hashPassword } from "@/lib/password";
import { getEmailSettings } from "@/lib/settings";

// Admin password reset by a 6-digit code sent to the admin's email. Codes live in OtpCode,
// keyed "admin:<email>" so they never mix with customers' phone OTPs.
const PURPOSE = "admin-reset";
const TTL_MIN = 10;
const MAX_ATTEMPTS = 5;
const key = (email: string) => `admin:${email}`;
const hash = (email: string, code: string) => createHash("sha256").update(`${process.env.AUTH_SECRET}:${key(email)}:${code}`).digest("hex");

export type ForgotState = { step: "email" | "code"; email?: string; error?: string; info?: string };

export async function requestCode(_: ForgotState, fd: FormData): Promise<ForgotState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  if (!email) return { step: "email", error: "ইমেইল লিখুন" };

  const cfg = await getEmailSettings();
  if (!mailerReady(cfg)) return { step: "email", email, error: "সাইটে এখনো ইমেইল (SMTP) সেটআপ করা নেই, তাই কোড পাঠানো যাচ্ছে না। ডেভেলপারের সাথে যোগাযোগ করুন।" };

  // Same answer whether or not the email is an admin, so the form can't be used to probe accounts.
  const sent: ForgotState = { step: "code", email, info: "এই ইমেইলে অ্যাডমিন অ্যাকাউন্ট থাকলে ৬ সংখ্যার কোড পাঠানো হয়েছে। ইনবক্স ও স্প্যাম দুটোই দেখুন।" };
  const user = await db.adminUser.findUnique({ where: { email } });
  if (!user) return sent;

  const since = new Date(Date.now() - 15 * 60_000);
  if ((await db.otpCode.count({ where: { phone: key(email), createdAt: { gte: since } } })) >= 3)
    return { step: "code", email, error: "অনেকবার কোড পাঠানো হয়েছে — ১৫ মিনিট পরে আবার চেষ্টা করুন।" };

  const code = String(randomInt(100000, 1000000));
  await db.otpCode.create({ data: { phone: key(email), purpose: PURPOSE, codeHash: hash(email, code), expiresAt: new Date(Date.now() + TTL_MIN * 60_000) } });
  try {
    await sendMail(
      {
        to: email,
        subject: `Admin password reset code: ${code}`,
        text: `Dhaka Machine Ghar admin panel\n\nYour password reset code is ${code}. It is valid for ${TTL_MIN} minutes.\nIf you did not ask for this, ignore this email — your password stays the same.`,
        html: `<div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
<h2 style="margin:0 0 8px;color:#1f4d3a">Dhaka Machine Ghar — Admin</h2>
<p style="color:#374151">Your password reset code:</p>
<p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#111827;margin:12px 0">${code}</p>
<p style="color:#6b7280;font-size:13px">Valid for ${TTL_MIN} minutes. If you did not ask for this, ignore this email — your password stays the same.</p>
</div>`,
      },
      cfg,
    );
  } catch {
    return { step: "email", email, error: "ইমেইল পাঠানো যায়নি — কিছুক্ষণ পরে আবার চেষ্টা করুন।" };
  }
  return sent;
}

export async function resetPassword(_: ForgotState, fd: FormData): Promise<ForgotState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const code = String(fd.get("code") ?? "").trim();
  const password = String(fd.get("password") ?? "");
  const confirm = String(fd.get("confirm") ?? "");
  const back = (error: string): ForgotState => ({ step: "code", email, error });

  if (!/^\d{6}$/.test(code)) return back("৬ সংখ্যার কোড লিখুন");
  if (password.length < 8) return back("নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে");
  if (password !== confirm) return back("দুইটি পাসওয়ার্ড মিলছে না");

  const otp = await db.otpCode.findFirst({
    where: { phone: key(email), purpose: PURPOSE, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp || otp.attempts >= MAX_ATTEMPTS) return back("কোডের মেয়াদ শেষ বা ভুল — আবার নতুন কোড নিন।");
  if (otp.codeHash !== hash(email, code)) {
    await db.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    return back("কোড সঠিক নয়");
  }
  const user = await db.adminUser.findUnique({ where: { email } });
  if (!user) return back("কোড সঠিক নয়");

  await db.$transaction([
    db.otpCode.update({ where: { id: otp.id }, data: { usedAt: new Date() } }),
    db.adminUser.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(password) } }),
  ]);
  redirect("/admin/login?reset=1");
}
