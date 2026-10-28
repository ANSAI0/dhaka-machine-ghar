"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { isValidBDPhone } from "@/lib/orders";
import { hashPassword, verifyPassword } from "@/lib/password";
import { resolveMapQuery } from "@/lib/maps";
import { getEmailSettings, getMarketing, getSmsSettings, SETTINGS_TAG } from "@/lib/settings";
import { mailerReady, sendMail } from "@/lib/mailer";
import { sendWeekly } from "@/lib/newsletter";
import { sendSms } from "@/lib/sms";
import type { EditableSite } from "@/lib/site";
import { contrastWithWhite, isHex, themeDefaults, type Theme } from "@/lib/theme";

export type FormState = { ok?: string; error?: string };

const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const isUrl = (u: string) => /^https:\/\/[^\s]+$/.test(u);

async function put(key: string, value: Prisma.InputJsonValue) {
  await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  revalidateTag(SETTINGS_TAG);
  revalidatePath("/", "layout");
}

export async function saveSiteSettings(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin("owner");
  const v: EditableSite = {
    address: s(fd, "address"),
    showroom: s(fd, "showroom"),
    phone: s(fd, "phone"),
    whatsapp: s(fd, "whatsapp"),
    email: s(fd, "email"),
    facebook: s(fd, "facebook"),
    youtube: s(fd, "youtube"),
    hours: s(fd, "hours"),
    mapQuery: s(fd, "mapQuery"),
    advancePercent: Number(s(fd, "advancePercent")),
    warrantyNewMonths: Number(s(fd, "warrantyNewMonths")),
    warrantyReconMonths: Number(s(fd, "warrantyReconMonths")),
  };
  if (!v.address || !v.showroom || !v.hours || !v.mapQuery) return { error: "Address, showroom, hours and map location are required" };
  const map = await resolveMapQuery(v.mapQuery);
  if (!map) return { error: "Couldn't read a location from that map link — open the place in Google Maps, tap Share → Copy link, and paste it here." };
  v.mapQuery = map;
  if (!isValidBDPhone(v.phone)) return { error: "Hotline must be a Bangladeshi mobile number (01XXXXXXXXX)" };
  if (v.whatsapp && !isValidBDPhone(v.whatsapp)) return { error: "WhatsApp must be a Bangladeshi mobile number, or empty to use the hotline" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) return { error: "Email is not valid" };
  if (!isUrl(v.facebook) || !isUrl(v.youtube)) return { error: "Facebook and YouTube must be https:// links" };
  if (!Number.isInteger(v.advancePercent) || v.advancePercent < 0 || v.advancePercent > 100) return { error: "Advance % must be 0–100" };
  if ([v.warrantyNewMonths, v.warrantyReconMonths].some((m) => !Number.isInteger(m) || m < 0 || m > 120)) return { error: "Warranty months must be 0–120" };
  await put("site", v);
  return { ok: "Saved — the website now shows the new details." };
}

export async function saveMarketing(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin("owner");
  const current = await getMarketing();
  const pixelId = s(fd, "pixelId");
  const gtmId = s(fd, "gtmId").toUpperCase();
  const token = s(fd, "capiToken");
  const v = {
    pixelId,
    gtmId,
    // Blank keeps the stored token (it is never sent back to the browser); "clear" removes it.
    capiToken: token === "clear" ? "" : token || current.capiToken,
    capiTestCode: s(fd, "capiTestCode"),
  };
  if (pixelId && !/^\d{5,20}$/.test(pixelId)) return { error: "Pixel ID is numbers only" };
  if (gtmId && !/^GTM-[A-Z0-9]{4,12}$/.test(gtmId)) return { error: "GTM ID looks like GTM-XXXXXXX" };
  if (v.capiToken && !pixelId) return { error: "Conversions API needs the Pixel ID too" };
  await put("marketing", v);
  return { ok: "Saved." };
}

export async function saveTheme(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin("owner");
  if (fd.get("reset") === "1") {
    await put("theme", themeDefaults);
    return { ok: "Back to the logo colours." };
  }
  const t: Theme = { brand: s(fd, "brand").toLowerCase(), accent: s(fd, "accent").toLowerCase(), steel: s(fd, "steel").toLowerCase() };
  const names = { brand: "Primary", accent: "Accent", steel: "Secondary" } as const;
  for (const k of Object.keys(names) as (keyof Theme)[]) {
    if (!isHex(t[k])) return { error: `${names[k]} must be a colour like #2e5e47` };
    // White text sits on these colours (buttons, nav, badges) — keep it readable.
    const min = k === "steel" ? 3 : 4.5;
    if (contrastWithWhite(t[k]) < min) return { error: `${names[k]} is too light — white text on it would be hard to read. Pick a darker shade.` };
  }
  await put("theme", t);
  return { ok: "Saved — the whole website now uses these colours." };
}

export async function saveBot(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin("owner");
  await put("bot", { enabled: fd.get("enabled") === "on", knowledge: s(fd, "knowledge").slice(0, 4000) });
  return { ok: "Saved." };
}

export async function saveSms(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin("owner");
  const current = await getSmsSettings();
  const provider = s(fd, "provider");
  const key = s(fd, "apiKey");
  const v = {
    provider: provider === "bulksmsbd" || provider === "custom" ? provider : "none",
    apiKey: key === "clear" ? "" : key || current.apiKey, // blank keeps the stored key
    senderId: s(fd, "senderId"),
    customUrl: s(fd, "customUrl"),
    onOrder: fd.get("onOrder") === "on",
    onStep: fd.get("onStep") === "on",
    language: s(fd, "language") === "en" ? "en" : "bn",
  } as const;
  if (v.provider === "bulksmsbd" && (!v.apiKey || !v.senderId)) return { error: "BulkSMSBD needs the API key and an approved sender ID" };
  if (v.provider === "custom" && (!/^https?:\/\/\S+$/.test(v.customUrl) || !v.customUrl.includes("{number}") || !v.customUrl.includes("{message}")))
    return { error: "Custom URL must be http(s) and contain {number} and {message}" };
  await put("sms", v);
  return { ok: "Saved." };
}

export async function sendTestSms(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin("owner");
  const phone = s(fd, "testPhone");
  if (!isValidBDPhone(phone)) return { error: "Enter a mobile number to test (01XXXXXXXXX)" };
  const r = await sendSms(phone.replace(/\D/g, "").replace(/^88/, ""), "Dhaka Machine Ghar: test SMS / টেস্ট এসএমএস", "test");
  return r.ok ? { ok: "Sent — check the phone." } : { error: `Not sent: ${r.response.slice(0, 200)}` };
}

export async function changePassword(_: FormState, fd: FormData): Promise<FormState> {
  const session = await requireAdmin();
  const user = await db.adminUser.findUnique({ where: { id: session.uid } });
  if (!user || !(await verifyPassword(s(fd, "current"), user.passwordHash))) return { error: "Current password is wrong" };
  const next = String(fd.get("next") ?? "");
  if (next.length < 10) return { error: "New password must be at least 10 characters" };
  if (next !== String(fd.get("confirm") ?? "")) return { error: "New passwords don't match" };
  await db.adminUser.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(next) } });
  return { ok: "Password changed." };
}

export async function addAdmin(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin("owner");
  const email = s(fd, "email").toLowerCase();
  const name = s(fd, "name");
  const role = s(fd, "role") === "owner" ? "owner" : "staff";
  const password = String(fd.get("password") ?? "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Valid email required" };
  if (name.length < 2) return { error: "Name required" };
  if (password.length < 10) return { error: "Password must be at least 10 characters" };
  try {
    await db.adminUser.create({ data: { email, name, role, passwordHash: await hashPassword(password) } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return { error: "That email already has an account" };
    throw e;
  }
  revalidatePath("/admin/settings");
  return { ok: `Added ${email} (${role}). Share the password with them privately.` };
}

export async function removeAdmin(id: string) {
  const session = await requireAdmin("owner");
  if (id === session.uid) return; // can't remove yourself
  const owners = await db.adminUser.count({ where: { role: "owner" } });
  const target = await db.adminUser.findUnique({ where: { id } });
  if (!target || (target.role === "owner" && owners <= 1)) return;
  await db.adminUser.delete({ where: { id } });
  revalidatePath("/admin/settings");
}

export async function saveEmail(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin("owner");
  const current = await getEmailSettings();
  const pass = String(fd.get("pass") ?? "");
  const v = {
    enabled: fd.get("enabled") === "on",
    host: s(fd, "host"),
    port: Number(s(fd, "port")) || 587,
    secure: fd.get("secure") === "on",
    user: s(fd, "user"),
    pass: pass === "clear" ? "" : pass || current.pass, // blank keeps the stored password
    fromEmail: s(fd, "fromEmail").toLowerCase(),
    fromName: s(fd, "fromName") || "Dhaka Machine Ghar",
    weekday: Math.min(6, Math.max(0, Number(s(fd, "weekday")) || 0)),
    weeklyNote: s(fd, "weeklyNote").slice(0, 1000),
  };
  if (v.host && !/^[a-z0-9.-]+$/i.test(v.host)) return { error: "SMTP host looks wrong (e.g. smtp.gmail.com)" };
  if (v.fromEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.fromEmail)) return { error: "From email is not valid" };
  if (v.enabled && !mailerReady(v)) return { error: "Fill SMTP host, user, password and from-email before turning the weekly email on" };
  await put("email", v);
  return { ok: "Saved." };
}

export async function sendTestEmail(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin("owner");
  const to = s(fd, "testTo");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return { error: "Enter an email address to test" };
  try {
    await sendMail({ to, subject: "Dhaka Machine Ghar — test email", text: "SMTP works. টেস্ট ইমেইল সফল।", html: "<p>SMTP works. <b>টেস্ট ইমেইল সফল।</b></p>" });
    return { ok: `Sent to ${to} — check the inbox (and spam).` };
  } catch (e) {
    return { error: `Not sent: ${e instanceof Error ? e.message.slice(0, 200) : "error"}` };
  }
}

export async function sendNewsletterNow(): Promise<FormState> {
  await requireAdmin("owner");
  const r = await sendWeekly("manual");
  revalidatePath("/admin/settings");
  return r.ok ? { ok: `Sent to ${r.sent} subscriber${r.sent === 1 ? "" : "s"}${r.failed ? `, ${r.failed} failed` : ""}.` } : { error: r.error };
}
