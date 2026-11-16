import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Facebook Messenger Send API helpers.

// Token typed into Meta's webhook setup. Derived from AUTH_SECRET, so it exists before anything is saved.
export const verifyTokenFor = (saved: string) => saved || createHmac("sha256", process.env.AUTH_SECRET ?? "dmg").update("messenger-verify").digest("hex").slice(0, 24);
const GRAPH = "https://graph.facebook.com/v23.0";

// Meta signs each webhook call with the app secret (X-Hub-Signature-256: sha256=<hex>).
export function validSignature(raw: string, header: string | null, appSecret: string) {
  if (!appSecret || !header?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", appSecret).update(raw).digest();
  const given = Buffer.from(header.slice(7), "hex");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

async function send(token: string, body: Record<string, unknown>) {
  const res = await fetch(`${GRAPH}/me/messages`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Messenger ${res.status}: ${(await res.text()).slice(0, 300)}`);
}

export const senderAction = (token: string, psid: string, action: "mark_seen" | "typing_on" | "typing_off") =>
  send(token, { recipient: { id: psid }, sender_action: action }).catch(() => {});

// Meta echoes every message the page sends; this tag marks the bot's own, so a reply typed by a
// person in the inbox can be told apart (and the bot steps back from that chat).
export const BOT_TAG = "dmg-bot";

export const sendText = (token: string, psid: string, text: string) =>
  send(token, { recipient: { id: psid }, messaging_type: "RESPONSE", message: { text: text.slice(0, 1900), metadata: BOT_TAG } });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Send a reply the way a person types: seen → typing… → message, split into at most three
// short bubbles at paragraph breaks, with a pause that grows with the length of each bubble.
export async function sendLikeAPerson(token: string, psid: string, text: string) {
  const paras = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const bubbles = paras.length <= 3 ? paras : [paras[0], paras[1], paras.slice(2).join("\n\n")];
  await senderAction(token, psid, "mark_seen");
  for (const b of bubbles.length ? bubbles : [text]) {
    await senderAction(token, psid, "typing_on");
    await sleep(Math.min(1200 + b.length * 25, 4500));
    await sendText(token, psid, b);
  }
}
