import "server-only";
import { createHash, randomInt } from "node:crypto";
import { db } from "./db";
import { getSmsSettings } from "./settings";
import { sendSms } from "./sms";

export type OtpPurpose = "verify" | "reset";
const TTL_MIN = 10;
const MAX_ATTEMPTS = 5;
const hash = (phone: string, code: string) => createHash("sha256").update(`${process.env.AUTH_SECRET}:${phone}:${code}`).digest("hex");

// OTPs need a working SMS gateway; without one, accounts stay unverified and reset is by phone call.
export const otpAvailable = async () => (await getSmsSettings()).provider !== "none";

export async function sendOtp(phone: string, purpose: OtpPurpose): Promise<{ ok: boolean; error?: string }> {
  const since = new Date(Date.now() - 15 * 60_000);
  if ((await db.otpCode.count({ where: { phone, createdAt: { gte: since } } })) >= 3) return { ok: false, error: "অনেকবার কোড পাঠানো হয়েছে — ১৫ মিনিট পরে চেষ্টা করুন।" };
  const code = String(randomInt(100000, 1000000));
  await db.otpCode.create({ data: { phone, purpose, codeHash: hash(phone, code), expiresAt: new Date(Date.now() + TTL_MIN * 60_000) } });
  const r = await sendSms(phone, `ঢাকা মেশিন ঘর: আপনার কোড ${code}। ${TTL_MIN} মিনিট বৈধ। কাউকে জানাবেন না।`, "otp");
  return r.ok ? { ok: true } : { ok: false, error: "SMS পাঠানো যায়নি — কিছুক্ষণ পরে চেষ্টা করুন।" };
}

export async function checkOtp(phone: string, purpose: OtpPurpose, code: string): Promise<boolean> {
  const otp = await db.otpCode.findFirst({ where: { phone, purpose, usedAt: null, expiresAt: { gt: new Date() } }, orderBy: { createdAt: "desc" } });
  if (!otp || otp.attempts >= MAX_ATTEMPTS) return false;
  if (otp.codeHash !== hash(phone, code.trim())) {
    await db.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    return false;
  }
  await db.otpCode.update({ where: { id: otp.id }, data: { usedAt: new Date() } });
  return true;
}
