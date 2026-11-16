import "server-only";
import { converse, wantsAssistant, type AssistantReply, type BotState } from "./assistant";
import { getCatalog } from "./catalog-server";
import { aiConfigured, aiReply, type ChatTurn } from "./chatbot";
import { getBotSettings, getMessengerSettings, getSite } from "./settings";

export type ChatResult = AssistantReply & { mode: "ai" | "basic" };

// One reply for the website chat and Facebook Messenger. Orders, order tracking and an order in
// progress always go through the built-in assistant (it places real orders); other questions use the
// AI when a key is set, else the built-in assistant too.
export async function chatReply(o: { text: string; history: ChatTurn[]; state?: BotState | null; channel: "web" | "messenger"; baseUrl?: string; adTitle?: string }): Promise<ChatResult> {
  const [site, catalog, bot, ai] = await Promise.all([getSite(), getCatalog(), getBotSettings(), getMessengerSettings()]);
  const state: BotState = { ...(o.state ?? {}) };

  if (aiConfigured(ai.geminiKey) && !wantsAssistant(o.text, state)) {
    try {
      const turns: ChatTurn[] = [...o.history, { role: "user" as const, text: o.text, at: new Date().toISOString() }].slice(-20);
      const r = await aiReply(turns, catalog, site, bot.knowledge, { geminiKey: ai.geminiKey, geminiModel: ai.geminiModel, channel: o.channel, baseUrl: o.baseUrl, adTitle: o.adTitle });
      return { text: r.text, lead: r.lead, state, mode: "ai" };
    } catch (e) {
      console.error("Chat AI error", e instanceof Error ? e.message : e); // fall back to the built-in assistant
    }
  }
  const r = await converse({ text: o.text, history: o.history, state, catalog, site, knowledge: bot.knowledge, channel: o.channel, adTitle: o.adTitle });
  return { ...r, mode: "basic" };
}
