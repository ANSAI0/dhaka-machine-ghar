import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { siteUrl } from "./url";

// Signed links in emails: verify an address (expires) and unsubscribe (doesn't).
type Purpose = "verify-email" | "unsubscribe";
const sign = (purpose: Purpose, cid: string, payload: string) =>
  createHmac("sha256", process.env.AUTH_SECRET ?? "").update(`${purpose}:${cid}:${payload}`).digest("base64url").slice(0, 32);

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

export function verifyEmailUrl(cid: string, email: string) {
  const exp = String(Date.now() + 3 * 864e5); // 3 days
  const p = new URLSearchParams({ c: cid, x: exp, t: sign("verify-email", cid, `${email}|${exp}`) });
  return `${siteUrl()}/account/verify-email?${p}`;
}

export function checkVerifyEmail(cid: string, email: string, exp: string, t: string) {
  return Number(exp) > Date.now() && same(sign("verify-email", cid, `${email}|${exp}`), t);
}

const unsubQuery = (cid: string) => new URLSearchParams({ c: cid, t: sign("unsubscribe", cid, "") });
// Page with a confirm button (for people) and a one-click POST endpoint (for the mail app's List-Unsubscribe).
export const unsubscribeUrl = (cid: string) => `${siteUrl()}/unsubscribe?${unsubQuery(cid)}`;
export const unsubscribeOneClickUrl = (cid: string) => `${siteUrl()}/api/newsletter/unsubscribe?${unsubQuery(cid)}`;
export const checkUnsubscribe = (cid: string, t: string) => same(sign("unsubscribe", cid, ""), t);
