import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "./db";
import { unsubscribeOneClickUrl, unsubscribeUrl, verifyEmailUrl } from "./email-token";
import { mailerReady, sendMail } from "./mailer";
import { getEmailSettings, getSite } from "./settings";
import { formatBDT, type SiteInfo } from "./site";
import { siteUrl } from "./url";

const DAY = 864e5;
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

// Dhaka local time parts (UTC+6, no DST).
const dhaka = (d = new Date()) => new Date(d.getTime() + 6 * 3600_000);
export function weekKey(d = new Date()) {
  const t = dhaka(d);
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day); // ISO week: Thursday decides the year
  const yearStart = Date.UTC(t.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((t.getTime() - yearStart) / DAY + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

type Item = { slug: string; name: string; nameBn: string; price: number; oldPrice: number | null; image: string | null; capacity: string; tag: "নতুন" | "আপডেট" | "জনপ্রিয়" };

// New or changed machines in the last 7 days; featured ones when nothing changed.
export async function weeklyItems(): Promise<Item[]> {
  const since = new Date(Date.now() - 7 * DAY);
  const fresh = await db.product.findMany({ where: { active: true, updatedAt: { gte: since } }, orderBy: { updatedAt: "desc" }, take: 8 });
  const list = fresh.length ? fresh : await db.product.findMany({ where: { active: true, featured: true }, orderBy: { sortOrder: "asc" }, take: 6 });
  return list.map((p) => ({
    slug: p.slug,
    name: p.name,
    nameBn: p.nameBn,
    price: p.price,
    oldPrice: p.oldPrice,
    image: p.image,
    capacity: p.capacity,
    tag: !fresh.length ? "জনপ্রিয়" : p.createdAt >= since ? "নতুন" : "আপডেট",
  }));
}

export function renderWeekly(o: { name: string; items: Item[]; note: string; site: SiteInfo; unsubscribe: string }) {
  const base = siteUrl();
  const abs = (p: string) => (p.startsWith("http") ? p : `${base}${p}`);
  const subject = `${o.site.nameBn}: এই সপ্তাহের মেশিন আপডেট`;
  const cards = o.items
    .map(
      (it) => `
<tr><td style="padding:12px 0;border-bottom:1px solid #eef0ef">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
    ${it.image ? `<td width="120" valign="top" style="padding-right:14px"><a href="${abs(`/product/${it.slug}`)}"><img src="${abs(it.image)}" width="120" height="120" alt="${esc(it.name)}" style="display:block;border-radius:10px;border:1px solid #eef0ef;object-fit:contain;background:#fff"></a></td>` : ""}
    <td valign="top" style="font-family:Arial,sans-serif">
      <span style="display:inline-block;background:${it.tag === "নতুন" ? "#98000f" : "#2e5e47"};color:#fff;font-size:11px;font-weight:bold;padding:2px 8px;border-radius:999px">${it.tag}</span>
      <p style="margin:6px 0 2px;font-size:16px;font-weight:bold;color:#111">${esc(it.nameBn)}</p>
      <p style="margin:0 0 6px;font-size:13px;color:#666">${esc(it.name)} · ${esc(it.capacity)}</p>
      <p style="margin:0 0 10px;font-size:18px;font-weight:bold;color:#2e5e47">${formatBDT(it.price)}${it.oldPrice ? ` <span style="font-size:12px;color:#999;text-decoration:line-through;font-weight:normal">${formatBDT(it.oldPrice)}</span>` : ""}</p>
      <a href="${abs(`/product/${it.slug}`)}" style="display:inline-block;background:#98000f;color:#fff;text-decoration:none;font-size:13px;font-weight:bold;padding:8px 16px;border-radius:8px">বিস্তারিত দেখুন →</a>
    </td>
  </tr></table>
</td></tr>`,
    )
    .join("");

  const html = `<!doctype html><html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;background:#f4f6f5">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6f5"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden">
  <tr><td style="background:#ffffff;padding:20px 24px;border-bottom:4px solid #2e5e47;text-align:center">
    <img src="${base}/brand/dmg-logo-transparent.png" width="140" alt="Dhaka Machine Ghar" style="display:inline-block;height:auto">
  </td></tr>
  <tr><td style="padding:24px;font-family:Arial,sans-serif;color:#222">
    <p style="margin:0 0 6px;font-size:16px">প্রিয় ${esc(o.name)},</p>
    <p style="margin:0 0 16px;font-size:14px;color:#555">এই সপ্তাহে আমাদের ${o.items.some((i) => i.tag !== "জনপ্রিয়") ? "নতুন ও আপডেট হওয়া" : "জনপ্রিয়"} মেশিনগুলো দেখুন।</p>
    ${o.note ? `<div style="background:#eef6f1;border-left:4px solid #2e5e47;border-radius:8px;padding:12px 14px;margin:0 0 16px;font-size:14px;color:#1a382a;white-space:pre-line">${esc(o.note)}</div>` : ""}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${cards}</table>
    <p style="margin:20px 0 0;text-align:center"><a href="${base}/shop" style="display:inline-block;background:#2e5e47;color:#fff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:10px">সব মেশিন দেখুন</a></p>
  </td></tr>
  <tr><td style="background:#10251b;padding:18px 24px;font-family:Arial,sans-serif;color:#cfd8d3;font-size:12px;line-height:1.6;text-align:center">
    ${esc(o.site.name)} · ${esc(o.site.address)}<br>হটলাইন ${esc(o.site.phone)} · <a href="https://wa.me/${o.site.whatsappIntl}" style="color:#cfd8d3">WhatsApp</a><br>
    আপনি অ্যাকাউন্টে সাপ্তাহিক আপডেট চালু রেখেছেন বলে এই ইমেইল পাচ্ছেন। <a href="${o.unsubscribe}" style="color:#ffffff">আনসাবস্ক্রাইব</a>
  </td></tr>
</table></td></tr></table></body></html>`;

  const text = [`প্রিয় ${o.name},`, "", o.note, "", ...o.items.map((i) => `• ${i.nameBn} — ${formatBDT(i.price)}\n  ${abs(`/product/${i.slug}`)}`), "", `সব মেশিন: ${base}/shop`, `হটলাইন: ${o.site.phone}`, "", `আনসাবস্ক্রাইব: ${o.unsubscribe}`].join("\n");
  return { subject, html, text };
}

export const newsletterAudience = () => db.customer.findMany({ where: { newsletter: true, emailVerified: true, unsubscribedAt: null }, select: { id: true, name: true, email: true } });

/** Sends this week's update once per ISO week (manual sends get their own key). */
export async function sendWeekly(trigger: "schedule" | "manual") {
  const cfg = await getEmailSettings();
  if (!mailerReady(cfg)) return { ok: false as const, error: "SMTP not set up" };
  if (trigger === "schedule" && !cfg.enabled) return { ok: false as const, error: "Weekly email is off" };

  const key = trigger === "manual" ? `${weekKey()}-manual-${Date.now()}` : weekKey();
  let run;
  try {
    run = await db.newsletterRun.create({ data: { weekKey: key, trigger } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return { ok: false as const, error: "Already sent this week" };
    throw e;
  }

  const [site, items, audience] = await Promise.all([getSite(), weeklyItems(), newsletterAudience()]);
  let sent = 0;
  let failed = 0;
  for (const c of audience) {
    const unsub = unsubscribeUrl(c.id);
    const mail = renderWeekly({ name: c.name, items, note: cfg.weeklyNote, site, unsubscribe: unsub });
    try {
      await sendMail({ to: c.email, ...mail, headers: { "List-Unsubscribe": `<${unsubscribeOneClickUrl(c.id)}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } }, cfg);
      sent++;
    } catch (e) {
      failed++;
      console.error("Newsletter send failed", c.email, e instanceof Error ? e.message : e);
    }
    await new Promise((r) => setTimeout(r, 300)); // stay under SMTP rate limits
  }
  await db.newsletterRun.update({ where: { id: run.id }, data: { sent, failed, status: "done" } });
  return { ok: true as const, sent, failed };
}

// Called hourly by the scheduler: send on the chosen weekday from 10:00 Dhaka time.
export async function maybeSendWeekly() {
  const cfg = await getEmailSettings();
  if (!cfg.enabled || !mailerReady(cfg)) return;
  const now = dhaka();
  if (now.getUTCDay() !== cfg.weekday || now.getUTCHours() < 10) return;
  if (await db.newsletterRun.findUnique({ where: { weekKey: weekKey() } })) return;
  await sendWeekly("schedule");
}

export async function sendVerificationEmail(c: { id: string; name: string; email: string }) {
  const cfg = await getEmailSettings();
  if (!mailerReady(cfg)) return false;
  const site = await getSite();
  const link = verifyEmailUrl(c.id, c.email);
  await sendMail(
    {
      to: c.email,
      subject: `${site.nameBn}: আপনার ইমেইল নিশ্চিত করুন`,
      text: `প্রিয় ${c.name},\n\nসাপ্তাহিক মেশিন আপডেট পেতে ইমেইলটি নিশ্চিত করুন (৩ দিন বৈধ):\n${link}\n\n${site.name}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#222"><img src="${siteUrl()}/brand/dmg-logo-transparent.png" width="120" alt="DMG"><p style="font-size:16px">প্রিয় ${esc(c.name)},</p><p>সাপ্তাহিক মেশিন আপডেট পেতে আপনার ইমেইল নিশ্চিত করুন।</p><p><a href="${link}" style="display:inline-block;background:#2e5e47;color:#fff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:10px">ইমেইল নিশ্চিত করুন</a></p><p style="font-size:12px;color:#888">লিংকটি ৩ দিন বৈধ। আপনি অ্যাকাউন্ট না খুলে থাকলে এই ইমেইল উপেক্ষা করুন।</p></div>`,
    },
    cfg,
  );
  return true;
}
