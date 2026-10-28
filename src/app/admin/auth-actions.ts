"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { SESSION_COOKIE, SESSION_DAYS, signSession } from "@/lib/session";

// Simple in-memory throttle: 5 failed attempts per IP+email per 15 minutes.
const attempts = new Map<string, { n: number; until: number }>();
const WINDOW = 15 * 60 * 1000;

export type LoginState = { error?: string; email?: string };

export async function login(_: LoginState, fd: FormData): Promise<LoginState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const next = String(fd.get("next") ?? "");
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const k = `${ip}|${email}`;

  const a = attempts.get(k);
  if (a && a.n >= 5 && a.until > Date.now()) return { error: "অনেকবার ভুল চেষ্টা হয়েছে — ১৫ মিনিট পরে আবার চেষ্টা করুন।", email };

  const user = email ? await db.adminUser.findUnique({ where: { email } }) : null;
  const ok = user ? await verifyPassword(password, user.passwordHash) : false;
  if (!user || !ok) {
    const cur = a && a.until > Date.now() ? a : { n: 0, until: Date.now() + WINDOW };
    attempts.set(k, { n: cur.n + 1, until: cur.until });
    return { error: "ইমেইল বা পাসওয়ার্ড সঠিক নয়", email };
  }
  attempts.delete(k);

  await db.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  const token = await signSession({ uid: user.id, name: user.name, role: user.role });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
  // Only follow same-site admin paths.
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}
