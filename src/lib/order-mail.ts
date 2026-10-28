import "server-only";
import type { Order, OrderItem } from "@prisma/client";
import { db } from "./db";
import { customerDocUrl } from "./doc-token";
import { mailerReady, sendMail } from "./mailer";
import { paymentLabels } from "./orders";
import { getEmailSettings, getSite } from "./settings";
import { formatBDT, type SiteInfo } from "./site";
import { factorySteps, type StepKey } from "./tracking";
import { siteUrl } from "./url";

// Transactional emails for orders: confirmation, payment receipt, factory-step updates and
// delivery (with invoice + challan links), plus a new-order alert to the owner.
// Every send is best-effort: a mail problem must never block an order.

type FullOrder = Order & { items: OrderItem[] };

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function layout(site: SiteInfo, title: string, body: string) {
  const base = siteUrl();
  return `<!doctype html><html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;background:#f4f6f5">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6f5"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden">
  <tr><td style="padding:20px 24px;border-bottom:4px solid #2e5e47;text-align:center"><img src="${base}/brand/dmg-logo-transparent.png" width="140" alt="${esc(site.name)}" style="display:inline-block;height:auto"></td></tr>
  <tr><td style="padding:24px;font-family:Arial,sans-serif;color:#222;font-size:14px;line-height:1.6">${body}</td></tr>
  <tr><td style="background:#10251b;padding:18px 24px;font-family:Arial,sans-serif;color:#cfd8d3;font-size:12px;line-height:1.6;text-align:center">
    ${esc(site.name)} (${esc(site.nameBn)}) · ${esc(site.address)}<br>হটলাইন ${esc(site.phone)} · <a href="https://wa.me/${site.whatsappIntl}" style="color:#cfd8d3">WhatsApp</a> · <a href="${base}" style="color:#cfd8d3">${esc(base.replace(/^https?:\/\//, ""))}</a>
  </td></tr>
</table></td></tr></table></body></html>`;
}

const button = (href: string, label: string, color = "#2e5e47") =>
  `<a href="${href}" style="display:inline-block;background:${color};color:#fff;text-decoration:none;font-weight:bold;padding:11px 20px;border-radius:10px;margin:4px 6px 4px 0">${esc(label)}</a>`;

function summary(o: FullOrder) {
  const rows = o.items
    .map((i) => `<tr><td style="padding:6px 0;border-bottom:1px solid #eee">${esc(i.name)} × ${i.qty}</td><td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right">${formatBDT(i.price * i.qty)}</td></tr>`)
    .join("");
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:14px 0;font-size:14px">
    ${rows}
    <tr><td style="padding:8px 0;font-weight:bold">মোট মূল্য</td><td style="padding:8px 0;text-align:right;font-weight:bold">${formatBDT(o.total)}</td></tr>
    ${
      o.paidAmount
        ? `<tr><td style="padding:2px 0;color:#555">পরিশোধিত</td><td style="text-align:right;color:#2e5e47;font-weight:bold">${formatBDT(o.paidAmount)}</td></tr>
           <tr><td style="padding:2px 0;color:#555">বাকি</td><td style="text-align:right;font-weight:bold">${formatBDT(Math.max(0, o.total - o.paidAmount))}</td></tr>`
        : o.payNow
          ? `<tr><td style="padding:2px 0;color:#555">এখন পরিশোধযোগ্য (${esc(paymentLabels[o.payment])})</td><td style="text-align:right;color:#98000f;font-weight:bold">${formatBDT(o.payNow)}</td></tr>`
          : ""
    }
  </table>`;
}

const invoiceBox = (id: string) =>
  `<p style="margin:12px 0;padding:12px 14px;background:#eef6f1;border-radius:10px">ইনভয়েস নম্বর: <strong style="font-size:18px;letter-spacing:1px;color:#98000f">${esc(id)}</strong></p>`;

async function send(to: string | null | undefined, subject: string, body: string, text: string) {
  if (!to) return;
  const [cfg, site] = await Promise.all([getEmailSettings(), getSite()]);
  if (!mailerReady(cfg)) return;
  try {
    await sendMail({ to, subject, html: layout(site, subject, body), text }, cfg);
  } catch (e) {
    console.error(`Order email "${subject}" to ${to} failed`, e);
  }
}

const load = (id: string) => db.order.findUnique({ where: { id }, include: { items: true } });

/** Right after checkout: confirmation to the customer and an alert to the owner. */
export async function mailOrderPlaced(orderId: string) {
  const [cfg, site, o] = await Promise.all([getEmailSettings(), getSite(), load(orderId)]);
  if (!o || !mailerReady(cfg)) return;
  const track = `${siteUrl()}/track?q=${o.id}`;

  if (cfg.onOrder && o.email) {
    const pay = o.payNow > o.paidAmount ? `${siteUrl()}/payment?order=${o.id}` : null;
    await send(
      o.email,
      `অর্ডার গ্রহণ করা হয়েছে — ${o.id}`,
      `<p style="margin:0 0 6px;font-size:16px">প্রিয় ${esc(o.name)},</p>
       <p style="margin:0">${esc(site.nameBn)}-এ অর্ডার করার জন্য ধন্যবাদ। আপনার অর্ডার আমরা পেয়েছি; আমাদের প্রতিনিধি শীঘ্রই কল করে বিস্তারিত নিশ্চিত করবেন।</p>
       ${invoiceBox(o.id)}${summary(o)}
       <p style="margin:0 0 4px;color:#555">ডেলিভারি ঠিকানা: ${esc(o.address)}, ${esc(o.district)}</p>
       <p style="margin:16px 0 0">${button(track, "অর্ডার ট্র্যাক করুন")}${pay ? button(pay, `${formatBDT(o.payNow - o.paidAmount)} অনলাইনে পেমেন্ট`, "#98000f") : ""}</p>`,
      `প্রিয় ${o.name},\n${site.nameBn}-এ আপনার অর্ডার ${o.id} গ্রহণ করা হয়েছে।\nমোট: ${formatBDT(o.total)}\nট্র্যাক: ${track}\nহটলাইন: ${site.phone}`,
    );
  }

  if (cfg.alertTo) {
    await send(
      cfg.alertTo,
      `New order ${o.id} — ${o.name} (${formatBDT(o.total)})`,
      `<p style="margin:0 0 8px;font-size:16px;font-weight:bold">New order on the website</p>
       ${invoiceBox(o.id)}
       <p style="margin:0">${esc(o.name)} · <a href="tel:${esc(o.phone)}">${esc(o.phone)}</a>${o.email ? ` · ${esc(o.email)}` : ""}<br>${esc(o.address)}, ${esc(o.district)}${o.note ? `<br>Note: ${esc(o.note)}` : ""}</p>
       ${summary(o)}
       <p style="margin:16px 0 0">${button(`${siteUrl()}/admin/orders/${o.id}`, "Open in admin")}</p>`,
      `New order ${o.id}\n${o.name} ${o.phone}\nTotal ${formatBDT(o.total)}\n${siteUrl()}/admin/orders/${o.id}`,
    );
  }
}

/** After SSLCommerz confirms a payment. */
export async function mailPaymentReceived(orderId: string) {
  const [cfg, o] = await Promise.all([getEmailSettings(), load(orderId)]);
  if (!o || !cfg.onPayment) return;
  const body = `${invoiceBox(o.id)}
     <p style="margin:0">আমরা <strong style="color:#2e5e47">${formatBDT(o.paidAmount)}</strong> পেমেন্ট পেয়েছি${o.payMethod ? ` (${esc(o.payMethod)})` : ""}। ধন্যবাদ!</p>
     ${summary(o)}
     <p style="margin:16px 0 0">${button(`${siteUrl()}/track?q=${o.id}`, "অর্ডার ট্র্যাক করুন")}${button(customerDocUrl(o.id, "invoice"), "ইনভয়েস দেখুন", "#1570a8")}</p>`;
  await send(o.email, `পেমেন্ট সফল — ${o.id}`, `<p style="margin:0 0 6px;font-size:16px">প্রিয় ${esc(o.name)},</p>${body}`, `প্রিয় ${o.name},\n${o.id} অর্ডারের ${formatBDT(o.paidAmount)} পেমেন্ট পেয়েছি। ধন্যবাদ!`);
  if (cfg.alertTo) await send(cfg.alertTo, `Payment received ${o.id} — ${formatBDT(o.paidAmount)}`, body, `Payment received for ${o.id}: ${formatBDT(o.paidAmount)} ${o.payMethod ?? ""}`);
}

/** When the admin moves the order to a new factory step. Handover = delivery email. */
export async function mailOrderStep(orderId: string, step: StepKey, note: string | null) {
  const [cfg, o] = await Promise.all([getEmailSettings(), load(orderId)]);
  if (!o?.email) return;
  const s = factorySteps.find((x) => x.key === step)!;
  const track = `${siteUrl()}/track?q=${o.id}`;
  const noteHtml = note ? `<p style="margin:10px 0;padding:10px 12px;border-left:4px solid #2e5e47;background:#f6f8f7">${esc(note)}</p>` : "";

  if (step === "handover") {
    if (!cfg.onDelivery) return;
    await send(
      o.email,
      `আপনার মেশিন পাঠানো হয়েছে — ${o.id}`,
      `<p style="margin:0 0 6px;font-size:16px">প্রিয় ${esc(o.name)},</p>
       <p style="margin:0">সুখবর! আপনার অর্ডারের মেশিন তৈরি ও টেস্ট শেষে <strong>ট্রান্সপোর্ট / কুরিয়ারে হস্তান্তর</strong> করা হয়েছে।</p>
       ${invoiceBox(o.id)}${noteHtml}${summary(o)}
       <p style="margin:0;color:#555">মেশিন হাতে পেয়ে পরীক্ষা করে নিন। কোনো সমস্যা হলে ৩ দিনের মধ্যে ছবি/ভিডিও সহ আমাদের জানান। মেশিনের সিরিয়াল নম্বর দিয়ে ওয়ারেন্টি যাচাই করতে পারবেন।</p>
       <p style="margin:16px 0 0">${button(customerDocUrl(o.id, "challan"), "ডেলিভারি চালান")}${button(customerDocUrl(o.id, "invoice"), "ইনভয়েস", "#1570a8")}${button(`${siteUrl()}/warranty`, "ওয়ারেন্টি", "#98000f")}</p>`,
      `প্রিয় ${o.name},\nআপনার অর্ডার ${o.id} এর মেশিন হস্তান্তর করা হয়েছে।\nচালান: ${customerDocUrl(o.id, "challan")}\nইনভয়েস: ${customerDocUrl(o.id, "invoice")}`,
    );
    return;
  }

  if (!cfg.onStep) return;
  await send(
    o.email,
    `অর্ডার আপডেট: ${s.title} — ${o.id}`,
    `<p style="margin:0 0 6px;font-size:16px">প্রিয় ${esc(o.name)},</p>
     <p style="margin:0">আপনার অর্ডার <strong>${esc(o.id)}</strong> এখন কারখানার <strong style="color:#2e5e47">"${esc(s.title)}"</strong> ধাপে।</p>
     <p style="margin:6px 0;color:#555">${esc(s.detail)}</p>${noteHtml}
     <p style="margin:16px 0 0">${button(track, "লাইভ ট্র্যাকিং দেখুন")}</p>`,
    `প্রিয় ${o.name},\nঅর্ডার ${o.id} এখন "${s.title}" ধাপে।${note ? `\n${note}` : ""}\nট্র্যাক: ${track}`,
  );
}
