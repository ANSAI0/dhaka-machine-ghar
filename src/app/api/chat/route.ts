import { after, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import type { BotState } from "@/lib/assistant";
import { sendCapiEvent } from "@/lib/capi";
import { chatReply } from "@/lib/chat-reply";
import type { ChatTurn } from "@/lib/chatbot";
import { db } from "@/lib/db";
import { getBotSettings, getSite } from "@/lib/settings";

const MAX_LEN = 1000;
const MAX_TURNS = 80; // per session, both sides
const hits = new Map<string, number[]>(); // ip → timestamps (in-memory throttle)

type Meta = { bot?: BotState };

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  if (recent.length >= 40) return NextResponse.json({ error: "অনেক বার্তা পাঠানো হয়েছে — কিছুক্ষণ পরে চেষ্টা করুন।" }, { status: 429 });
  hits.set(ip, [...recent, now]);

  let body: { sessionId?: string; message?: string; page?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const message = String(body.message ?? "").trim().slice(0, MAX_LEN);
  if (!message) return NextResponse.json({ error: "Empty message" }, { status: 400 });

  const bot = await getBotSettings();
  if (!bot.enabled) return NextResponse.json({ error: "Chat is off" }, { status: 503 });

  const session = (body.sessionId && (await db.chatSession.findUnique({ where: { id: body.sessionId } }))) || (await db.chatSession.create({ data: { messages: [], page: body.page?.slice(0, 200), ip } }));
  const history = (session.messages as ChatTurn[]) ?? [];
  if (history.length >= MAX_TURNS) {
    const site = await getSite();
    return NextResponse.json({ sessionId: session.id, reply: `অনেক কথা হলো! বাকিটা সরাসরি কথা বলে ঠিক করি — কল বা WhatsApp করুন ${site.phone}।`, mode: "basic" });
  }
  const meta = (session.meta as Meta | null) ?? {};

  const reply = await chatReply({ text: message, history, state: meta.bot, channel: "web" });

  const at = new Date().toISOString();
  const updated: ChatTurn[] = [...history, { role: "user", text: message, at }, { role: "assistant", text: reply.text, at }];
  await db.chatSession.update({
    where: { id: session.id },
    data: { messages: updated as unknown as Prisma.InputJsonValue, meta: { ...meta, bot: reply.state } as unknown as Prisma.InputJsonValue },
  });

  let leadSaved = false;
  if (reply.lead) {
    const lead = await db.lead.create({ data: { ...reply.lead, source: "chatbot", chatId: session.id } });
    leadSaved = true;
    after(() => sendCapiEvent({ name: "Lead", eventId: `lead-${lead.id}`, phone: lead.phone }));
  }

  return NextResponse.json({ sessionId: session.id, reply: reply.text, mode: reply.mode, leadSaved, orderId: reply.orderId });
}
