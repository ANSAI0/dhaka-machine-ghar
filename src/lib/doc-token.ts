import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { siteUrl } from "./url";

// Unguessable per-order link for customers to open their invoice / challan without logging in.
export function docToken(orderId: string) {
  return createHmac("sha256", process.env.AUTH_SECRET ?? "").update(`doc:${orderId}`).digest("base64url").slice(0, 24);
}

export function verifyDocToken(orderId: string, token: string | undefined) {
  if (!token) return false;
  const a = Buffer.from(docToken(orderId));
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const customerDocUrl = (orderId: string, doc: "invoice" | "challan" = "challan") => `${siteUrl()}/doc/${orderId}?doc=${doc}&t=${docToken(orderId)}`;
