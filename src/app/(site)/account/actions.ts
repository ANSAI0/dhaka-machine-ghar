"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { endCustomerSession, getCustomer, requireCustomer, safeNext, startCustomerSession } from "@/lib/customer-auth";
import { db } from "@/lib/db";
import { districts, isValidBDPhone, normalizePhone } from "@/lib/orders";
import { sendVerificationEmail } from "@/lib/newsletter";
import { checkOtp, otpAvailable, sendOtp } from "@/lib/otp";
import { hashPassword, verifyPassword } from "@/lib/password";

export type AuthState = { error?: string; ok?: string; fields?: Record<string, string>; step?: "code" };

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// 5 failed logins per IP + identifier per 15 minutes.
const fails = new Map<string, { n: number; until: number }>();

export async function register(_: AuthState, fd: FormData): Promise<AuthState> {
  const name = str(fd, "name");
  const phone = normalizePhone(str(fd, "phone"));
  const email = str(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const fields = { name, phone: str(fd, "phone"), email };

  if (name.length < 2) return { error: "আপনার নাম লিখুন", fields };
  if (!isValidBDPhone(phone)) return { error: "সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)", fields };
  if (!emailOk(email)) return { error: "সঠিক ইমেইল দিন — সাপ্তাহিক আপডেট এখানেই যাবে", fields };
  if (password.length < 8) return { error: "পাসওয়ার্ড অন্তত ৮ অক্ষরের হতে হবে", fields };
  if (password !== String(fd.get("confirm") ?? "")) return { error: "দুইটি পাসওয়ার্ড মেলেনি", fields };

  let customer;
  try {
    customer = await db.customer.create({ data: { name, phone, email, newsletter: fd.get("newsletter") === "on", passwordHash: await hashPassword(password) } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return { error: "এই নম্বর বা ইমেইলে আগেই অ্যাকাউন্ট আছে — লগইন করুন।", fields };
    throw e;
  }
  await startCustomerSession(customer);
  await sendVerificationEmail(customer).catch((e) => console.error("Verify email failed", e));
  const next = safeNext(str(fd, "next"));
  if (await otpAvailable()) {
    await sendOtp(phone, "verify");
    redirect(`/account/verify?next=${encodeURIComponent(next)}`);
  }
  redirect(next);
}

export async function login(_: AuthState, fd: FormData): Promise<AuthState> {
  const id = str(fd, "id").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const k = `${ip}|${id}`;
  const f = fails.get(k);
  if (f && f.n >= 5 && f.until > Date.now()) return { error: "অনেকবার ভুল চেষ্টা — ১৫ মিনিট পরে আবার চেষ্টা করুন।", fields: { id } };

  const where = isValidBDPhone(id) ? { phone: normalizePhone(id) } : emailOk(id) ? { email: id } : null;
  const c = where ? await db.customer.findUnique({ where }) : null;
  if (!c || !(await verifyPassword(password, c.passwordHash))) {
    const cur = f && f.until > Date.now() ? f : { n: 0, until: Date.now() + 15 * 60_000 };
    fails.set(k, { n: cur.n + 1, until: cur.until });
    return { error: "মোবাইল/ইমেইল বা পাসওয়ার্ড সঠিক নয়", fields: { id } };
  }
  fails.delete(k);
  await db.customer.update({ where: { id: c.id }, data: { lastLoginAt: new Date() } });
  await startCustomerSession(c);
  redirect(safeNext(str(fd, "next")));
}

export async function logout() {
  await endCustomerSession();
  redirect("/");
}

export async function verifyPhone(_: AuthState, fd: FormData): Promise<AuthState> {
  const c = await requireCustomer("/account/verify");
  if (c.phoneVerified) redirect(safeNext(str(fd, "next")));
  if (!(await checkOtp(c.phone, "verify", str(fd, "code")))) return { error: "কোড সঠিক নয় বা মেয়াদ শেষ" };
  await db.customer.update({ where: { id: c.id }, data: { phoneVerified: true } });
  redirect(safeNext(str(fd, "next")));
}

export async function resendCode(): Promise<AuthState> {
  const c = await requireCustomer("/account/verify");
  const r = await sendOtp(c.phone, "verify");
  return r.ok ? { ok: "নতুন কোড পাঠানো হয়েছে" } : { error: r.error };
}

// Step 1: phone → code by SMS. Step 2: code + new password. Same reply whether or not the account exists.
export async function resetPassword(_: AuthState, fd: FormData): Promise<AuthState> {
  const phone = normalizePhone(str(fd, "phone"));
  if (!isValidBDPhone(phone)) return { error: "সঠিক মোবাইল নম্বর দিন", fields: { phone: str(fd, "phone") } };
  if (!(await otpAvailable())) return { error: "এখন অনলাইনে রিসেট বন্ধ — আমাদের হটলাইনে কল করুন, আমরা সাহায্য করব।", fields: { phone } };

  if (!fd.get("code")) {
    const exists = await db.customer.findUnique({ where: { phone } });
    if (exists) {
      const r = await sendOtp(phone, "reset");
      if (!r.ok) return { error: r.error, fields: { phone } };
    }
    return { step: "code", ok: "এই নম্বরে অ্যাকাউন্ট থাকলে একটি কোড পাঠানো হয়েছে।", fields: { phone } };
  }

  const password = String(fd.get("password") ?? "");
  if (password.length < 8) return { step: "code", error: "পাসওয়ার্ড অন্তত ৮ অক্ষরের হতে হবে", fields: { phone } };
  if (!(await checkOtp(phone, "reset", str(fd, "code")))) return { step: "code", error: "কোড সঠিক নয় বা মেয়াদ শেষ", fields: { phone } };
  // A correct code proves the phone, so the account is verified too.
  const c = await db.customer.update({ where: { phone }, data: { passwordHash: await hashPassword(password), phoneVerified: true } });
  await startCustomerSession(c);
  redirect("/account");
}

export async function updateProfile(_: AuthState, fd: FormData): Promise<AuthState> {
  const c = await getCustomer();
  if (!c) return { error: "আবার লগইন করুন" };
  const name = str(fd, "name");
  const email = str(fd, "email").toLowerCase();
  const district = str(fd, "district");
  if (name.length < 2) return { error: "নাম লিখুন" };
  if (!emailOk(email)) return { error: "সঠিক ইমেইল দিন" };
  if (district && !districts.includes(district)) return { error: "জেলা নির্বাচন করুন" };
  try {
    const changed = email !== c.email;
    const updated = await db.customer.update({
      where: { id: c.id },
      // A new address must be confirmed again before newsletters go to it.
      data: { name, email, address: str(fd, "address").slice(0, 200) || null, district: district || null, ...(changed ? { emailVerified: false } : {}) },
    });
    if (changed) await sendVerificationEmail(updated).catch((e) => console.error("Verify email failed", e));
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return { error: "এই ইমেইল অন্য অ্যাকাউন্টে ব্যবহৃত" };
    throw e;
  }
  return { ok: "সংরক্ষণ করা হয়েছে" };
}

export async function changeCustomerPassword(_: AuthState, fd: FormData): Promise<AuthState> {
  const c = await getCustomer();
  if (!c) return { error: "আবার লগইন করুন" };
  if (!(await verifyPassword(String(fd.get("current") ?? ""), c.passwordHash))) return { error: "বর্তমান পাসওয়ার্ড ভুল" };
  const next = String(fd.get("next") ?? "");
  if (next.length < 8) return { error: "নতুন পাসওয়ার্ড অন্তত ৮ অক্ষরের" };
  if (next !== String(fd.get("confirm") ?? "")) return { error: "দুইটি পাসওয়ার্ড মেলেনি" };
  await db.customer.update({ where: { id: c.id }, data: { passwordHash: await hashPassword(next) } });
  return { ok: "পাসওয়ার্ড পরিবর্তন হয়েছে" };
}

export async function resendVerifyEmail(): Promise<AuthState> {
  const c = await getCustomer();
  if (!c) return { error: "আবার লগইন করুন" };
  if (c.emailVerified) return { ok: "ইমেইল আগেই নিশ্চিত" };
  const sent = await sendVerificationEmail(c).catch(() => false);
  return sent ? { ok: `${c.email}-এ লিংক পাঠানো হয়েছে` } : { error: "এখন ইমেইল পাঠানো যাচ্ছে না — পরে চেষ্টা করুন।" };
}

export async function setNewsletter(_: AuthState, fd: FormData): Promise<AuthState> {
  const c = await getCustomer();
  if (!c) return { error: "আবার লগইন করুন" };
  const on = fd.get("newsletter") === "on";
  await db.customer.update({ where: { id: c.id }, data: { newsletter: on, unsubscribedAt: on ? null : new Date() } });
  return { ok: on ? "সাপ্তাহিক আপডেট চালু" : "সাপ্তাহিক আপডেট বন্ধ" };
}
