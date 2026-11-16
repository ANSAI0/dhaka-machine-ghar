import { after, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import type { BotState } from "@/lib/assistant";
import { chatReply } from "@/lib/chat-reply";
import type { ChatTurn } from "@/lib/chatbot";
import { db } from "@/lib/db";
import { BOT_TAG, sendLikeAPerson, validSignature, verifyTokenFor } from "@/lib/messenger";
import { getMessengerSettings, type MessengerSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/url";

// Facebook Messenger webhook: Meta sends page messages here; the assistant answers in the inbox.
// Set up in Meta for Developers → the app → Messenger → Webhooks (URL /api/messenger + verify token
// from Admin → Settings → Messenger & AI), subscribed to messages, messaging_postbacks,
// messaging_referrals and message_echoes.
export const maxDuration = 60;

type Meta = { pausedUntil?: string; ad?: string; lastMid?: string; lastUserAt?: string; bot?: BotState };
type Referral = { ref?: string; ads_context_data?: { ad_title?: string } };
type MessagingEvent = {
  sender?: { id: string };
  recipient?: { id: string };
  message?: { mid?: string; text?: string; is_echo?: boolean; metadata?: string; attachments?: unknown[]; referral?: Referral };
  postback?: { title?: string; payload?: string; referral?: Referral };
  referral?: Referral;
};

const MAX_TURNS = 80; // kept per thread

// GET: Meta's one-time webhook verification.
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const m = await getMessengerSettings();
  if (q.get("hub.mode") === "subscribe" && q.get("hub.verify_token") === verifyTokenFor(m.verifyToken)) {
    return new Response(q.get("hub.challenge") ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
  const raw = await req.text();
  const m = await getMessengerSettings();
  if (!validSignature(raw, req.headers.get("x-hub-signature-256"), m.appSecret)) return new Response("Bad signature", { status: 401 });

  let body: { object?: string; entry?: { messaging?: MessagingEvent[] }[] };
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }
  if (body.object !== "page") return new Response("Not a page event", { status: 404 });

  const events = (body.entry ?? []).flatMap((e) => e.messaging ?? []);
  const env = siteUrl();
  const base = env.includes("localhost") ? new URL(req.url).origin : env;
  // Answer Meta at once (it retries slow webhooks); reply to the customer after the response.
  after(async () => {
    for (const ev of events) await handle(ev, m, base).catch((e) => console.error("Messenger event failed", e instanceof Error ? e.message : e));
  });
  return NextResponse.json({ ok: true });
}

async function thread(key: string) {
  try {
    return await db.chatSession.upsert({ where: { externalId: key }, update: {}, create: { externalId: key, channel: "messenger", page: "Facebook Messenger", messages: [] } });
  } catch (e) {
    // Two events for a new thread at once: the other one created it.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return db.chatSession.findUniqueOrThrow({ where: { externalId: key } });
    throw e;
  }
}

async function handle(ev: MessagingEvent, m: MessengerSettings, base: string) {
  const echo = !!ev.message?.is_echo;
  const psid = echo ? ev.recipient?.id : ev.sender?.id;
  if (!psid) return;

  const session = await thread(`fb:${psid}`);
  const meta = { ...((session.meta as Meta | null) ?? {}) };
  const history = ((session.messages as ChatTurn[] | null) ?? []).slice(-MAX_TURNS);
  const now = new Date();
  const save = (turns: ChatTurn[]) =>
    db.chatSession.update({ where: { id: session.id }, data: { messages: turns.slice(-MAX_TURNS) as unknown as Prisma.InputJsonValue, meta: meta as Prisma.InputJsonValue } });

  const ref = ev.referral ?? ev.message?.referral ?? ev.postback?.referral;
  if (ref) meta.ad = (ref.ads_context_data?.ad_title || ref.ref || meta.ad || "").slice(0, 200);

  if (echo) {
    if (ev.message?.metadata === BOT_TAG) return; // our own reply
    // Something else the page sent. Business Suite automations (comment-to-message, instant reply) fire
    // before the customer writes or within seconds of it; a person replying takes longer. Only a
    // person's reply makes the bot step back from this chat.
    const sinceUser = meta.lastUserAt ? now.getTime() - new Date(meta.lastUserAt).getTime() : Infinity;
    const automated = !meta.lastUserAt || sinceUser < 10_000;
    if (!automated) meta.pausedUntil = new Date(now.getTime() + m.pauseHours * 3_600_000).toISOString();
    const text = ev.message?.text?.trim();
    await save(text ? [...history, { role: "assistant", text, at: now.toISOString() }] : history);
    return;
  }

  if (!ev.message && !ev.postback) {
    if (ref) await save(history);
    return;
  }
  const mid = ev.message?.mid;
  if (mid && meta.lastMid === mid) return; // Meta re-delivered the same message
  if (mid) meta.lastMid = mid;

  const text = (ev.message?.text ?? (ev.message?.attachments?.length ? "(গ্রাহক একটি ছবি বা ফাইল পাঠিয়েছেন)" : "")).trim() || ev.postback?.title?.trim() || "";
  if (!text) return;
  meta.lastUserAt = now.toISOString();
  const turns: ChatTurn[] = [...history, { role: "user", text: text.slice(0, 1000), at: now.toISOString() }];

  const paused = meta.pausedUntil && new Date(meta.pausedUntil) > now;
  if (!m.enabled || !m.pageToken || paused) return void (await save(turns));

  const reply = await chatReply({ text, history, state: meta.bot, channel: "messenger", baseUrl: base, adTitle: meta.ad });
  meta.bot = reply.state;
  // Asked for a person: the bot steps back from this chat so the team can take over.
  if (reply.handover) meta.pausedUntil = new Date(now.getTime() + m.pauseHours * 3_600_000).toISOString();

  // Site links must be full addresses outside the website.
  const out = reply.text.replace(/(^|[\s(])\/(product|category|shop|quotation|track|warranty|contact|terms|refund)\b/g, `$1${base}/$2`);
  await save([...turns, { role: "assistant", text: out, at: new Date().toISOString() }]);
  if (reply.lead) await db.lead.create({ data: { ...reply.lead, source: "messenger", chatId: session.id } });
  await sendLikeAPerson(m.pageToken, psid, out);
}
