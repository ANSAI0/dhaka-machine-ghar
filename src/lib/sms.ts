import "server-only";
import { db } from "./db";
import { customerDocUrl } from "./doc-token";
import { siteUrl } from "./url";
import { formatBDT } from "./site";
import { getSite, getSmsSettings, type SmsSettings } from "./settings";
import { factorySteps, type StepKey } from "./tracking";

export { siteUrl };

type Kind = "order_placed" | "order_step" | "test" | "otp";
const intl = (local: string) => (local.startsWith("880") ? local : `88${local.replace(/^\+?88/, "")}`);

async function deliver(cfg: SmsSettings, phone: string, message: string): Promise<{ ok: boolean; response: string }> {
  let url: string;
  if (cfg.provider === "bulksmsbd") {
    url = `http://bulksmsbd.net/api/smsapi?${new URLSearchParams({ api_key: cfg.apiKey, type: "text", number: intl(phone), senderid: cfg.senderId, message })}`;
  } else if (cfg.provider === "custom") {
    url = cfg.customUrl.replace("{number}", encodeURIComponent(intl(phone))).replace("{message}", encodeURIComponent(message));
  } else {
    return { ok: false, response: "SMS provider not configured" };
  }
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  const text = (await res.text()).slice(0, 500);
  // BulkSMSBD answers HTTP 200 with response_code 202 on success; custom gateways are judged by HTTP status.
  const ok = cfg.provider === "bulksmsbd" ? /"response_code"\s*:\s*202/.test(text) : res.ok;
  return { ok, response: text };
}

export async function sendSms(phone: string, message: string, kind: Kind, orderId?: string) {
  const cfg = await getSmsSettings();
  if (cfg.provider === "none") {
    await db.smsLog.create({ data: { phone, message, kind, orderId, status: "skipped", response: "No SMS provider set in Settings" } });
    return { ok: false, response: "No SMS provider set in Settings" };
  }
  try {
    const r = await deliver(cfg, phone, message);
    await db.smsLog.create({ data: { phone, message, kind, orderId, status: r.ok ? "sent" : "failed", response: r.response } });
    return r;
  } catch (e) {
    const response = e instanceof Error ? e.message : String(e);
    await db.smsLog.create({ data: { phone, message, kind, orderId, status: "failed", response } });
    return { ok: false, response };
  }
}

// ── Message templates ──

export async function notifyOrderPlaced(o: { id: string; name: string; phone: string; total: number; payNow: number }) {
  const cfg = await getSmsSettings();
  if (!cfg.onOrder) return;
  const site = await getSite();
  const link = `${siteUrl()}/track?q=${o.id}`;
  const msg =
    cfg.language === "en"
      ? `Dear ${o.name}, your order ${o.id} at ${site.name} is received. Total ${formatBDT(o.total).replace("৳", "Tk ")}. Track: ${link} Call ${site.phone}`
      : `প্রিয় ${o.name}, ${site.nameBn}-এ আপনার অর্ডার ${o.id} গ্রহণ করা হয়েছে। মোট ${formatBDT(o.total)}। ট্র্যাক: ${link} কল: ${site.phone}`;
  await sendSms(o.phone, msg, "order_placed", o.id);
}

export async function notifyOrderStep(o: { id: string; phone: string }, step: StepKey, note: string | null) {
  const cfg = await getSmsSettings();
  if (!cfg.onStep) return;
  const site = await getSite();
  const s = factorySteps.find((x) => x.key === step)!;
  const link = `${siteUrl()}/track?q=${o.id}`;
  const msg =
    cfg.language === "en"
      ? `${site.name}: order ${o.id} is now at "${s.en}".${note ? ` ${note}.` : ""} Track: ${link}`
      : `${site.nameBn}: অর্ডার ${o.id} এখন "${s.title}" ধাপে।${note ? ` ${note}।` : ""} ট্র্যাক: ${link}`;
  // At handover, send the delivery challan instead of the tracking link.
  const final = step === "handover" ? msg.replace(link, customerDocUrl(o.id, "challan")) : msg;
  await sendSms(o.phone, final, "order_step", o.id);
}
