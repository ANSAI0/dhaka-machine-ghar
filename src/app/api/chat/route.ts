import { after, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { Prisma } from "@prisma/client";
import { getCatalog } from "@/lib/catalog-server";
import { aiConfigured, aiReply, basicReply, type BotReply, type ChatTurn } from "@/lib/chatbot";
import { sendCapiEvent } from "@/lib/capi";
import { db } from "@/lib/db";
import { getBotSettings, getSite } from "@/lib/settings";

const MAX_LEN = 1000;
const MAX_TURNS = 30; // per session, both sides
const hits = new Map<string, number[]>(); // ip → timestamps (in-memory throttle)

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  if (recent.length >= 20) return NextResponse.json({ error: "অনেক বার্তা পাঠানো হয়েছে — কিছুক্ষণ পরে চেষ্টা করুন।" }, { status: 429 });
  hits.set(ip, [...recent, now]);

  let body: { sessionId?: string; message?: string; page?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const message = String(body.message ?? "").trim().slice(0, MAX_LEN);
  if (!message) return NextResponse.json({ error: "Empty message" }, { status: 400 });

  const [bot, site, catalog] = await Promise.all([getBotSettings(), getSite(), getCatalog()]);
  if (!bot.enabled) return NextResponse.json({ error: "Chat is off" }, { status: 503 });

  const session = (body.sessionId && (await db.chatSession.findUnique({ where: { id: body.sessionId } }))) || (await db.chatSession.create({ data: { messages: [], page: body.page?.slice(0, 200), ip } }));
  const history = (session.messages as ChatTurn[]) ?? [];
  if (history.length >= MAX_TURNS) {
    return NextResponse.json({ sessionId: session.id, reply: `অনেক কথা হলো! বিস্তারিত জানতে সরাসরি কল করুন ${site.phone} অথবা WhatsApp করুন।`, mode: "basic" });
  }
  const turns: ChatTurn[] = [...history, { role: "user", text: message, at: new Date().toISOString() }];

  let reply: BotReply;
  if (aiConfigured()) {
    try {
      reply = await aiReply(turns, catalog, site, bot.knowledge);
    } catch (e) {
      // Keep the visitor served even when the API is unavailable.
      console.error("Chat AI error", e instanceof Anthropic.APIError ? `${e.status} ${e.message}` : e);
      reply = basicReply(message, catalog, site);
    }
  } else {
    reply = basicReply(message, catalog, site);
  }

  const updated = [...turns, { role: "assistant" as const, text: reply.text, at: new Date().toISOString() }];
  await db.chatSession.update({ where: { id: session.id }, data: { messages: updated as unknown as Prisma.InputJsonValue } });

  let leadSaved = false;
  if (reply.lead) {
    const lead = await db.lead.create({ data: { ...reply.lead, source: "chatbot", chatId: session.id } });
    leadSaved = true;
    after(() => sendCapiEvent({ name: "Lead", eventId: `lead-${lead.id}`, phone: lead.phone }));
  }

  return NextResponse.json({ sessionId: session.id, reply: reply.text, mode: reply.mode, leadSaved });
}
