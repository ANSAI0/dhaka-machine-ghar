import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { Catalog, Product } from "./catalog";
import { byWeight, unitPriceText, type SiteInfo } from "./site";
import { isValidBDPhone, normalizePhone } from "./orders";

export type ChatTurn = { role: "user" | "assistant"; text: string; at: string };
export type LeadInput = { name: string; phone: string; interest: string };
export type BotReply = { text: string; lead?: LeadInput; mode: "ai" | "basic" };

const MODEL = "claude-opus-5-5";

// AI replies use Claude when ANTHROPIC_API_KEY is set, otherwise Google Gemini with the free key saved
// in Admin → Settings → Messenger & AI. Without either, the built-in assistant answers.
export const aiConfigured = (geminiKey?: string) => !!process.env.ANTHROPIC_API_KEY || !!geminiKey;

export type AiOptions = {
  geminiKey?: string;
  geminiModel?: string;
  channel?: "web" | "messenger";
  baseUrl?: string; // full site address, for links sent outside the website
  adTitle?: string; // Messenger: the Facebook ad the customer clicked
};

const productLine = (p: Product) =>
  [
    `- ${p.name} (${p.nameBn}) | ${unitPriceText(p)}${byWeight(p) ? ` (weight ${byWeight(p)!.kg} kg; quote per kg, not a total)` : ""} | /product/${p.slug}`,
    `  ${p.short}`,
    p.highlights.length ? `  Highlights: ${p.highlights.join("; ")}` : "",
    p.specs.length ? `  Specs: ${p.specs.map(([k, v]) => `${k}: ${v}`).join("; ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

// Stable prefix (catalog + business info) so prompt caching applies across visitors.
function systemPrompt(catalog: Catalog, site: SiteInfo, knowledge: string, opts: AiOptions = {}) {
  const byCat = catalog.categories
    .map((c) => `## ${c.name} (${c.nameBn}) — /category/${c.slug}\n${catalog.products.filter((p) => p.category === c.slug).map(productLine).join("\n")}`)
    .join("\n\n");
  return `You are "DMG সহকারী", the website assistant of ${site.name} (${site.nameBn}), a Bangladeshi manufacturer of mechanical and hydraulic power presses (channel body / H-frame, bou body / C-frame, hydraulic) built in its own factory, and maker of AC outdoor-unit stands (wall stands and roof chowki stands, sold per set) and royal / rawal (anchor) bolts (sold per piece). It also sells shearing and drill machines.

${opts.channel === "messenger" ? messengerStyle(site, opts) : "Reply in the visitor's language — Bangla by default, English if they write in English. Keep replies short (2–5 sentences), friendly and concrete. Plain text only, no markdown formatting; put site links as bare relative paths like /product/<slug> on their own."}

What you can do:
- Answer any question about the business, the website and the products from the catalog and info below: what a product is, what it is used for, its specs, which one suits the visitor's work, and its link. Never invent machines, prices, tonnage or specs that are not listed. Where the price is "Call for price", explain that it depends on the tonnage/size and offer a call back or a quotation. Power presses are built to order in the tonnage the buyer needs (/quotation).
- AC stands are sold per set (prices listed); royal bolts per piece. For big quantities the owner confirms the price.
- Machines carry a serial-based warranty with after-sales service; it can be checked at /warranty.
- Explain ordering: ${site.advancePercent}% advance booking by bKash/Nagad/Bank, the rest at delivery; delivery all over Bangladesh; order progress is visible at /track.
- When a visitor shows buying interest or asks for a call back, ask for their name and mobile number. When you have both, call the save_lead tool once, then tell them the team will call soon.
- For negotiation, final price, visits or anything you can't answer, hand over to a person: hotline ${site.phone}, WhatsApp ${site.phone} (the chat window has a WhatsApp button).

Business info: ${site.showroom ? `factory ${site.address}; showroom ${site.showroom}` : `factory and showroom ${site.address}`}; hours ${site.hours}; phone ${site.phone}; email ${site.email}.
Website pages: all products /shop, custom quotation /quotation, order tracking /track, warranty & service /warranty, contact & map /contact, terms /terms, refund policy /refund.
${knowledge ? `\nNotes from the owner:\n${knowledge}\n` : ""}
# Catalog (prices in BDT)
${byCat}`;
}

function messengerStyle(site: SiteInfo, opts: AiOptions) {
  const base = (opts.baseUrl ?? "").replace(/\/$/, "");
  return `You are chatting with a customer on the Facebook Messenger inbox of the business page.
- Write like a friendly, helpful salesperson of ${site.name} texting a customer: warm, natural and short — usually 1–3 short sentences. Never sound like a form or a robot.
- Match the customer's language and style: Bangla script if they write Bangla, Banglish (Bangla in English letters) if they write Banglish, English if English. Use "আপনি" / "apni".
- Say salam only in your first reply. Don't greet or thank again in every message.
- Understand the need before pitching: ask one question at a time (what work, what size or tonnage, how many, which district for delivery).
- Plain text only: no markdown, no *, #, or bullet lists. At most one emoji in a message.
- Links must be full addresses, e.g. ${base}/product/<slug> or ${base}/shop. Share a link only when it helps.
- If the customer sends a photo or file you can't see, say thanks and ask what they need, or ask them to describe it.
- Never claim to be a human. If asked whether this is a bot or a person, say honestly that you are ${site.name}'s assistant and that a team member can also talk (hotline ${site.phone}). Don't promise to call or visit yourself.
- Quote listed prices exactly. Never promise discounts or delivery dates; for bargaining, bulk deals or anything unsure, say the owner will confirm and ask for their name and mobile number.${opts.adTitle ? `\n- The customer came from the Facebook ad "${opts.adTitle}". Assume they are asking about that product unless they say otherwise.` : ""}`;
}

const saveLeadTool: Anthropic.Beta.BetaTool = {
  name: "save_lead",
  description: "Save a visitor who wants to be contacted. Call only after the visitor has given both their name and a Bangladeshi mobile number.",
  strict: true,
  input_schema: {
    type: "object",
    properties: {
      name: { type: "string", description: "Visitor's name" },
      phone: { type: "string", description: "Mobile number, e.g. 01712345678" },
      interest: { type: "string", description: "Machine or need they asked about, short" },
    },
    required: ["name", "phone", "interest"],
    additionalProperties: false,
  },
};

let client: Anthropic | null = null;

export async function aiReply(history: ChatTurn[], catalog: Catalog, site: SiteInfo, knowledge: string, opts: AiOptions = {}): Promise<BotReply> {
  if (process.env.ANTHROPIC_API_KEY) return claudeReply(history, catalog, site, knowledge, opts);
  if (opts.geminiKey) return geminiReply(history, catalog, site, knowledge, opts);
  throw new Error("No AI key configured");
}

const leadFrom = (input: Partial<LeadInput>): LeadInput | null =>
  typeof input.name === "string" && input.name.trim().length > 1 && typeof input.phone === "string" && isValidBDPhone(input.phone)
    ? { name: input.name.trim().slice(0, 80), phone: normalizePhone(input.phone), interest: String(input.interest ?? "").slice(0, 200) }
    : null;

async function claudeReply(history: ChatTurn[], catalog: Catalog, site: SiteInfo, knowledge: string, opts: AiOptions): Promise<BotReply> {
  client ??= new Anthropic();
  const messages: Anthropic.Beta.BetaMessageParam[] = history.map((t) => ({ role: t.role, content: t.text }));
  let lead: LeadInput | undefined;

  // At most a couple of tool rounds: save_lead, then the final text.
  for (let round = 0; round < 3; round++) {
    const res = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: [{ type: "text", text: systemPrompt(catalog, site, knowledge, opts), cache_control: { type: "ephemeral" } }],
      tools: [saveLeadTool],
      messages,
    });

    if (res.stop_reason === "refusal") return { text: `দুঃখিত, এ বিষয়ে আমি সাহায্য করতে পারছি না। আমাদের টিমের সাথে কথা বলুন: ${site.phone}`, lead, mode: "ai" };

    const toolUses = res.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
    if (res.stop_reason !== "tool_use" || toolUses.length === 0) {
      const text = res.content
        .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      return { text: text || `আরও জানতে কল করুন ${site.phone}`, lead, mode: "ai" };
    }

    messages.push({ role: "assistant", content: res.content });
    const results: Anthropic.Beta.BetaToolResultBlockParam[] = toolUses.map((tu) => {
      const found = tu.name === "save_lead" ? leadFrom(tu.input as Partial<LeadInput>) : null;
      const ok = !!found;
      if (found) lead = found;
      return {
        type: "tool_result",
        tool_use_id: tu.id,
        content: ok ? "Saved. The sales team will call the visitor." : "Not saved: need the visitor's name and a valid Bangladeshi mobile number (01XXXXXXXXX). Ask again.",
        is_error: !ok,
      };
    });
    messages.push({ role: "user", content: results });
  }
  return { text: `ধন্যবাদ! আরও জানতে কল করুন ${site.phone}`, lead, mode: "ai" };
}

// Google Gemini over REST (free tier key from aistudio.google.com). Same prompt and save_lead tool.
type GeminiPart = { text?: string; functionCall?: { name: string; args?: Record<string, unknown> }; functionResponse?: { name: string; response: Record<string, unknown> }; thought?: boolean };
type GeminiContent = { role: "user" | "model"; parts: GeminiPart[] };

async function geminiReply(history: ChatTurn[], catalog: Catalog, site: SiteInfo, knowledge: string, opts: AiOptions): Promise<BotReply> {
  const model = (opts.geminiModel || "gemini-2.5-flash").replace(/[^a-z0-9.-]/gi, "");
  const contents: GeminiContent[] = history.map((t) => ({ role: t.role === "assistant" ? "model" : "user", parts: [{ text: t.text }] }));
  const tools = [
    {
      functionDeclarations: [
        {
          name: saveLeadTool.name,
          description: saveLeadTool.description,
          parameters: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING", description: "Customer's name" },
              phone: { type: "STRING", description: "Mobile number, e.g. 01712345678" },
              interest: { type: "STRING", description: "Product or need, short" },
            },
            required: ["name", "phone", "interest"],
          },
        },
      ],
    },
  ];
  let lead: LeadInput | undefined;

  for (let round = 0; round < 3; round++) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": opts.geminiKey! },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt(catalog, site, knowledge, opts) }] },
        contents,
        tools,
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
      }),
      signal: AbortSignal.timeout(25_000),
    });
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = (await res.json()) as { candidates?: { content?: { parts?: GeminiPart[] } }[] };
    const parts = (data.candidates?.[0]?.content?.parts ?? []).filter((x) => !x.thought);
    const calls = parts.filter((x) => x.functionCall);
    if (calls.length === 0) {
      const text = parts.map((x) => x.text ?? "").join("").trim();
      return { text: text || `আরও জানতে কল করুন ${site.phone}`, lead, mode: "ai" };
    }
    contents.push({ role: "model", parts });
    contents.push({
      role: "user",
      parts: calls.map((c) => {
        const call = c.functionCall!;
        const found = call.name === "save_lead" ? leadFrom((call.args ?? {}) as Partial<LeadInput>) : null;
        if (found) lead = found;
        const result = found ? "Saved. The sales team will call the customer." : "Not saved: need the customer's name and a valid Bangladeshi mobile number (01XXXXXXXXX). Ask again.";
        return { functionResponse: { name: call.name, response: { result } } };
      }),
    });
  }
  return { text: `ধন্যবাদ! আরও জানতে কল করুন ${site.phone}`, lead, mode: "ai" };
}
