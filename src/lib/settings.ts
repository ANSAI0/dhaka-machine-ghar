import "server-only";
import { unstable_cache } from "next/cache";
import { db } from "./db";
import { buildSite, siteDefaults, type EditableSite } from "./site";
import { themeDefaults, type Theme } from "./theme";

export const SETTINGS_TAG = "settings";

export type Marketing = { pixelId: string; gtmId: string; capiToken: string; capiTestCode: string };
const marketingDefaults: Marketing = { pixelId: "", gtmId: "", capiToken: "", capiTestCode: "" };

export type BotSettings = { enabled: boolean; knowledge: string };
const botDefaults: BotSettings = { enabled: true, knowledge: "" };

export type SmsProvider = "none" | "bulksmsbd" | "custom";
export type SmsSettings = {
  provider: SmsProvider;
  apiKey: string;
  senderId: string;
  customUrl: string; // GET url with {number} and {message} placeholders
  onOrder: boolean;
  onStep: boolean;
  language: "bn" | "en"; // Bangla SMS fit 70 characters per part, English 160
};
export type EmailSettings = {
  enabled: boolean; // weekly product-update email on/off
  host: string;
  port: number;
  secure: boolean; // true = SSL on connect (465); false = STARTTLS (587)
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
  weekday: number; // 0 = Sunday … 6 = Saturday, sent from 10:00 Dhaka time
  weeklyNote: string; // owner's message / offer shown at the top of the email
  // Order emails to the customer (when they gave an email) and a new-order alert to the owner.
  onOrder: boolean;
  onPayment: boolean;
  onStep: boolean;
  onDelivery: boolean;
  alertTo: string;
};
const emailDefaults: EmailSettings = { enabled: false, host: "", port: 587, secure: false, user: "", pass: "", fromEmail: "", fromName: "Dhaka Machine Ghar", weekday: 6, weeklyNote: "", onOrder: true, onPayment: true, onStep: false, onDelivery: true, alertTo: "" };

// Home hero banners uploaded in Admin → Hero Banners (shown in this order).
export type Banner = { id: string; image: string; link: string };

const smsDefaults: SmsSettings = { provider: "none", apiKey: "", senderId: "", customUrl: "", onOrder: true, onStep: true, language: "bn" };

async function readFromDb() {
  const rows = await db.setting.findMany({ where: { key: { in: ["site", "marketing", "theme", "bot", "sms", "email", "banners"] } } });
  const get = (k: string) => (rows.find((r) => r.key === k)?.value ?? {}) as Record<string, unknown>;
  return {
    site: { ...siteDefaults, ...get("site") } as EditableSite,
    marketing: { ...marketingDefaults, ...get("marketing") } as Marketing,
    theme: { ...themeDefaults, ...get("theme") } as Theme,
    bot: { ...botDefaults, ...get("bot") } as BotSettings,
    sms: { ...smsDefaults, ...get("sms") } as SmsSettings,
    email: { ...emailDefaults, ...get("email") } as EmailSettings,
    banners: (Array.isArray(get("banners").items) ? get("banners").items : []) as Banner[],
  };
}

const cached = unstable_cache(readFromDb, ["settings"], {
  // Admin saves revalidate the tag; the hour cap covers edits made directly in the DB.
  tags: [SETTINGS_TAG],
  revalidate: 3600,
});

// unstable_cache only works inside a request. The weekly-email scheduler runs outside one
// ("incrementalCache missing"), so it reads straight from the DB instead.
async function read() {
  try {
    return await cached();
  } catch (e) {
    if (e instanceof Error && e.message.includes("incrementalCache missing")) return readFromDb();
    throw e;
  }
}

export const getSite = async () => buildSite((await read()).site);
export const getEditableSite = async () => (await read()).site;
export const getTheme = async () => (await read()).theme;
export const getBanners = async () => (await read()).banners;
export const getBotSettings = async () => (await read()).bot;
// Includes the SMS API key — server only.
export const getSmsSettings = async () => (await read()).sms;
// Includes the SMTP password — server only.
export const getEmailSettings = async () => (await read()).email;

// Includes the CAPI token — never pass the whole object to the browser.
export const getMarketing = async () => (await read()).marketing;
export const getPublicMarketing = async () => {
  const m = await getMarketing();
  return { pixelId: m.pixelId, gtmId: m.gtmId };
};
