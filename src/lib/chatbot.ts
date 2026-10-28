import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { Catalog, Product } from "./catalog";
import { formatBDT, type SiteInfo } from "./site";
import { isValidBDPhone, normalizePhone } from "./orders";

export type ChatTurn = { role: "user" | "assistant"; text: string; at: string };
export type LeadInput = { name: string; phone: string; interest: string };
export type BotReply = { text: string; lead?: LeadInput; mode: "ai" | "basic" };

const MODEL = "claude-opus-5-5";

// The API key comes from the ANTHROPIC_API_KEY environment variable (never stored in the DB).
export const aiConfigured = () => !!process.env.ANTHROPIC_API_KEY;

const productLine = (p: Product) =>
  `- ${p.name} (${p.nameBn}) | ${p.capacity} | ${p.condition === "new" ? "Brand New" : "Foreign Reconditioned"} | ${formatBDT(p.price)} | /product/${p.slug}`;

// Stable prefix (catalog + business info) so prompt caching applies across visitors.
function systemPrompt(catalog: Catalog, site: SiteInfo, knowledge: string) {
  const byCat = catalog.categories
    .map((c) => `## ${c.name} (${c.nameBn}) — /category/${c.slug}\n${catalog.products.filter((p) => p.category === c.slug).map(productLine).join("\n")}`)
    .join("\n\n");
  return `You are "DMG সহকারী", the website assistant of ${site.name} (${site.nameBn}), a power press manufacturer and importer of foreign & reconditioned workshop machinery in Bangladesh.

Reply in the visitor's language — Bangla by default, English if they write in English. Keep replies short (2–5 sentences), friendly and concrete. Plain text only, no markdown formatting; put site links as bare relative paths like /product/<slug> on their own.

What you can do:
- Recommend machines from the catalog below with price and link. Never invent machines, prices or specs that are not listed; if something isn't listed, offer a custom quotation (/quotation) — the factory builds power presses to order.
- Explain ordering: ${site.advancePercent}% advance booking by bKash/Nagad/Bank, the rest at delivery; delivery all over Bangladesh; order progress is visible at /track.
- When a visitor shows buying interest or asks for a call back, ask for their name and mobile number. When you have both, call the save_lead tool once, then tell them the team will call soon.
- For negotiation, final price, visits or anything you can't answer, hand over to a person: hotline ${site.phone}, WhatsApp ${site.phone} (the chat window has a WhatsApp button).

Business info: factory ${site.address}; showroom ${site.showroom}; hours ${site.hours}; email ${site.email}.
${knowledge ? `\nNotes from the owner:\n${knowledge}\n` : ""}
# Catalog (prices in BDT)
${byCat}`;
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

export async function aiReply(history: ChatTurn[], catalog: Catalog, site: SiteInfo, knowledge: string): Promise<BotReply> {
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
      system: [{ type: "text", text: systemPrompt(catalog, site, knowledge), cache_control: { type: "ephemeral" } }],
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
      const input = tu.input as Partial<LeadInput>;
      const ok = tu.name === "save_lead" && typeof input.name === "string" && input.name.trim().length > 1 && typeof input.phone === "string" && isValidBDPhone(input.phone);
      if (ok) lead = { name: input.name!.trim().slice(0, 80), phone: normalizePhone(input.phone!), interest: String(input.interest ?? "").slice(0, 200) };
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

// ── Basic mode (no API key): catalog keyword search + phone capture ──

const synonyms: [RegExp, string][] = [
  [/প্রেস|press/i, "press"],
  [/লেদ|lathe/i, "lathe"],
  [/শেপার|shaper/i, "shaper"],
  [/মিলিং|milling/i, "milling"],
  [/ড্রিল|drill/i, "drill"],
  [/বেন্ড|bender|পাইপ/i, "bender"],
  [/শিয়ার|shear|কাটিং/i, "shear"],
  [/ব্রেক|brake/i, "brake"],
  [/ইট|পাথর|crusher/i, "crusher"],
  [/মিক্সার|mixer/i, "mixer"],
  [/হয়েস্ট|hoist|winch/i, "hoist"],
  [/ডাই|die/i, "die"],
  [/প্যানেল|panel|plc/i, "panel"],
  [/রিকন্ডিশন|recondition|পুরাতন|used/i, "reconditioned"],
];

const bnDigits = (s: string) => s.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));
const fillerWords = /\b(?:my|name|is|number|phone|call me)\b|আমার|আমি|নাম|নম্বর|নাম্বার|মোবাইল|ফোন|কল দিন|কল করুন|দিন|হলো|হল/gi;

export function basicReply(raw: string, catalog: Catalog, site: SiteInfo): BotReply {
  const text = bnDigits(raw);
  const phoneMatch = text.match(/(?:\+?88)?01[3-9][\d\s-]{8,12}/);
  if (phoneMatch && isValidBDPhone(phoneMatch[0])) {
    const name = text.replace(phoneMatch[0], "").replace(fillerWords, " ").replace(/[^\p{L}\p{M}\s.]/gu, " ").trim().split(/\s+/).slice(0, 4).join(" ");
    return {
      text: `ধন্যবাদ! আপনার নম্বর ${normalizePhone(phoneMatch[0])} সংরক্ষণ করা হয়েছে। আমাদের টিম শীঘ্রই কল করবে। জরুরি হলে কল করুন ${site.phone}।`,
      lead: { name: name || "Chat visitor", phone: normalizePhone(phoneMatch[0]), interest: raw.slice(0, 200) },
      mode: "basic",
    };
  }

  const terms = synonyms.filter(([re]) => re.test(text)).map(([, t]) => t);
  const ton = text.match(/(\d+)\s*(?:টন|ton)/i)?.[1];
  const scored = catalog.products
    .map((p) => {
      const hay = `${p.name} ${p.nameBn} ${p.capacity} ${p.subcategory} ${p.condition}`.toLowerCase();
      let s = terms.filter((t) => hay.includes(t)).length * 2;
      if (ton && new RegExp(`\\b${ton}\\s*ton`, "i").test(p.capacity)) s += 3;
      return { p, s };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3);

  if (/ট্র্যাক|track|অর্ডার কোথায়/i.test(text)) {
    return { text: `ইনভয়েস বা মোবাইল নম্বর দিয়ে অর্ডারের অবস্থা দেখুন: /track`, mode: "basic" };
  }
  if (scored.length) {
    const list = scored.map(({ p }) => `• ${p.nameBn} — ${formatBDT(p.price)}\n/product/${p.slug}`).join("\n");
    return { text: `এই মেশিনগুলো দেখতে পারেন:\n${list}\n\nকল ব্যাক চাইলে আপনার নাম ও মোবাইল নম্বর লিখুন।`, mode: "basic" };
  }
  const cats = catalog.categories.map((c) => `• ${c.nameBn}: /category/${c.slug}`).join("\n");
  return {
    text: `আসসালামু আলাইকুম! কোন মেশিন খুঁজছেন? যেমন: "২৫ টন পাওয়ার প্রেস" বা "লেদ মেশিন"।\n${cats}\n\nনিজের মাপে মেশিন বানাতে: /quotation\nসরাসরি কথা বলতে: ${site.phone}`,
    mode: "basic",
  };
}
