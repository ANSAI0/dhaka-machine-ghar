import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { Catalog, Product } from "./catalog";
import { priceText, type SiteInfo } from "./site";
import { isValidBDPhone, normalizePhone } from "./orders";

export type ChatTurn = { role: "user" | "assistant"; text: string; at: string };
export type LeadInput = { name: string; phone: string; interest: string };
export type BotReply = { text: string; lead?: LeadInput; mode: "ai" | "basic" };

const MODEL = "claude-opus-5-5";

// The API key comes from the ANTHROPIC_API_KEY environment variable (never stored in the DB).
export const aiConfigured = () => !!process.env.ANTHROPIC_API_KEY;

const productLine = (p: Product) =>
  [
    `- ${p.name} (${p.nameBn}) | ${priceText(p.price)} | /product/${p.slug}`,
    `  ${p.short}`,
    p.highlights.length ? `  Highlights: ${p.highlights.join("; ")}` : "",
    p.specs.length ? `  Specs: ${p.specs.map(([k, v]) => `${k}: ${v}`).join("; ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

// Stable prefix (catalog + business info) so prompt caching applies across visitors.
function systemPrompt(catalog: Catalog, site: SiteInfo, knowledge: string) {
  const byCat = catalog.categories
    .map((c) => `## ${c.name} (${c.nameBn}) — /category/${c.slug}\n${catalog.products.filter((p) => p.category === c.slug).map(productLine).join("\n")}`)
    .join("\n\n");
  return `You are "DMG সহকারী", the website assistant of ${site.name} (${site.nameBn}), a Bangladeshi manufacturer of mechanical and hydraulic power presses (channel body / H-frame, bou body / C-frame, hydraulic) built in its own factory, and maker of AC outdoor-unit stands (wall brackets, floor stands; sold per piece, boxed and in bulk by KG) and rawal (anchor) bolts. It also sells shearing and drill machines.

Reply in the visitor's language — Bangla by default, English if they write in English. Keep replies short (2–5 sentences), friendly and concrete. Plain text only, no markdown formatting; put site links as bare relative paths like /product/<slug> on their own.

What you can do:
- Answer any question about the business, the website and the products from the catalog and info below: what a product is, what it is used for, its specs, which one suits the visitor's work, and its link. Never invent machines, prices, tonnage or specs that are not listed. Where the price is "Call for price", explain that it depends on the tonnage/size and offer a call back or a quotation. Power presses are built to order in the tonnage the buyer needs (/quotation).
- AC stands are sold per piece, in a box with the fitting kit, and in bulk by KG for dealers and installers.
- Machines carry a serial-based warranty with after-sales service; it can be checked at /warranty.
- Explain ordering: ${site.advancePercent}% advance booking by bKash/Nagad/Bank, the rest at delivery; delivery all over Bangladesh; order progress is visible at /track.
- When a visitor shows buying interest or asks for a call back, ask for their name and mobile number. When you have both, call the save_lead tool once, then tell them the team will call soon.
- For negotiation, final price, visits or anything you can't answer, hand over to a person: hotline ${site.phone}, WhatsApp ${site.phone} (the chat window has a WhatsApp button).

Business info: factory ${site.address}; showroom ${site.showroom}; hours ${site.hours}; phone ${site.phone}; email ${site.email}.
Website pages: all products /shop, custom quotation /quotation, order tracking /track, warranty & service /warranty, contact & map /contact, terms /terms, refund policy /refund.
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

// ── Built-in assistant (free, no API key): understands Bangla and Banglish, answers from the catalog,
// business info and the owner's notes, remembers the product talked about last, and captures phones ──

type Rule = [RegExp, string];

// Words visitors use (Bangla, Banglish, English) → a token found in product names / categories.
const productTerms: Rule[] = [
  [/প্রেস|press|pres\b|preess/i, "press"],
  [/চ্যানেল|channel|chanel|chenel|h.?frame/i, "channel"],
  [/বউ|বো বডি|bou|bow|c.?frame|সি ফ্রেম/i, "bou"],
  [/হাইড্রোলিক|hydraulic|hydrolic|haidrolik|hidrolik/i, "hydraulic"],
  [/মোটর|motor/i, "motor"],
  [/হেভি|heavy/i, "heavy"],
  [/ডাবল|double|dabol/i, "double"],
  [/এসি|ac\b|a\.c|air ?con|স্ট্যান্ড|stand|ষ্ট্যান্ড|ব্র্যাকেট|bracket/i, "stand"],
  [/ফ্লোর|floor|ground|গ্রাউন্ড|মাটিতে|chade|ছাদে/i, "floor"],
  [/কেজি|kg\b|keji|পাইকারি|pikari|wholesale|bulk/i, "kg"],
  [/বক্স|box/i, "box"],
  [/রেড|লাল|red|oxide/i, "red"],
  [/বোল্ট|bolt|রাওয়াল|রাওল|rawal|rawl|anchor/i, "bolt"],
  [/ড্রিল|drill/i, "drill"],
  [/শিয়ার|শেয়ার|shear|sheet cut|কাটিং মেশিন|cutting machine/i, "shear"],
  [/সবুজ|green|sobuj/i, "green"],
  [/আকাশি|sky/i, "sky"],
  [/নীল|blue|nil\b/i, "blue"],
  [/টিল|teal/i, "teal"],
  [/হলুদ|yellow|holud/i, "yellow"],
  [/কমলা|orange|komla/i, "orange"],
  [/ধূসর|grey|gray/i, "grey"],
  [/লাইম|lime/i, "lime"],
  [/মিন্ট|mint/i, "mint"],
  [/জলপাই|olive/i, "olive"],
];

const asks = {
  greet: /^(?:\s*(?:hi+|hello|hey|salam|assalamu ?alaikum|আসসালামু আলাইকুম|সালাম|হাই|হ্যালো|হেলো)\W*)+$/i,
  thanks: /ধন্যবাদ|থ্যাংক|thanks?|thank you|tnx|thx|ok thanks/i,
  detail: /বিস্তারিত|ডিটেইল|details?|spec|স্পেসিফিকেশন|কি কাজ|কী কাজ|কাজ কি|ব্যবহার|use\b|সম্পর্কে|about|জানতে চাই|janate|jante|bolen|বলুন/i,
  price: /দাম|price|কত টাকা|koto taka|dam\b|rate|মূল্য|cost/i,
  list: /কি কি|কী কী|ki ki|কি পাওয়া|কী পাওয়া|ki pawa|ki ase|কি আছে|কী আছে|products?|পণ্য|catalog|সব মেশিন/i,
  track: /ট্র্যাক|track|অর্ডার কোথায়|order kothay|অর্ডারের অবস্থা/i,
};

const faq = (site: SiteInfo): Rule[] => [
  [/ঠিকানা|কোথায়|লোকেশন|location|address|thikana|kothay|শোরুম|showroom|কারখানা|factory|ম্যাপ|map/i, `কারখানা: ${site.address}\nশোরুম: ${site.showroom}\nম্যাপ ও যোগাযোগ: /contact\nকল: ${site.phone}`],
  [/সময়|খোলা|বন্ধ|hours|open|time|somoy|kokhon|কখন/i, `আমাদের সময়: ${site.hours}। কল: ${site.phone}`],
  [/ওয়ারেন্টি|গ্যারান্টি|warranty|waranty|guarantee|garanti|সার্ভিস|service/i, `আমাদের মেশিনে সিরিয়াল নম্বর ভিত্তিক ওয়ারেন্টি ও বিক্রয়-পরবর্তী সার্ভিস আছে। মেশিনের সিরিয়াল দিয়ে যাচাই ও সার্ভিস অনুরোধ: /warranty`],
  [/ডেলিভারি|delivery|deliveri|পাঠান|pathan|কুরিয়ার|courier|সারা দেশ|jela|জেলা/i, `সারা বাংলাদেশে ট্রান্সপোর্ট/কুরিয়ারে ডেলিভারি দেওয়া হয়। অর্ডারের প্রতিটি ধাপ দেখুন /track এ।`],
  [/পেমেন্ট|payment|বিকাশ|bkash|bikash|নগদ|nagad|অগ্রিম|advance|ogrim|ব্যাংক|bank|কিস্তি|kisti/i, `মোট মূল্যের ${site.advancePercent}% অগ্রিম (bKash / Nagad / Bank বা অনলাইনে) দিয়ে অর্ডার কনফার্ম, বাকি টাকা ডেলিভারির সময়।`],
  [/কাস্টম|custom|মাপে|mape|টনেজ|tonnage|বানিয়ে|baniye|অর্ডার দিয়ে বানা/i, `আপনার প্রয়োজনীয় টনেজ ও মাপে পাওয়ার প্রেস নিজস্ব কারখানায় তৈরি করে দিই। কোটেশন নিন: /quotation`],
  [/ফেরত|ferot|refund|return|বদল|change/i, `ফেরত ও রিফান্ডের নিয়ম দেখুন: /refund। প্রশ্ন থাকলে কল করুন ${site.phone}`],
  [/যোগাযোগ|contact|নম্বর|number|phone|ফোন|whatsapp|হোয়াটসঅ্যাপ|imo|email|ইমেইল/i, `কল / WhatsApp: ${site.phone}\nইমেইল: ${site.email}\nযোগাযোগ পেজ: /contact`],
  [/কেজি|kg\b|keji|পাইকারি|pikari|wholesale|dealer|ডিলার/i, `এসি স্ট্যান্ড পিস হিসেবে, বক্সে এবং পাইকারি কেজি হিসেবেও বিক্রি করি — ডিলার ও ইনস্টলারদের জন্য বিশেষ দাম। দেখুন /product/ac-stand-bulk-by-kg`],
];

const bnDigits = (s: string) => s.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));
const fillerWords = /\b(?:my|name|is|number|phone|call me|amar|nam|nambar)\b|আমার|আমি|নাম|নম্বর|নাম্বার|মোবাইল|ফোন|কল দিন|কল করুন|দিন|হলো|হল/gi;
const callBack = "কল ব্যাক চাইলে আপনার নাম ও মোবাইল নম্বর লিখুন।";
const words = (s: string) => s.toLowerCase().split(/[^\p{L}\p{M}\p{N}]+/u).filter((w) => w.length > 2);

function describe(p: Product) {
  const hl = p.highlights.slice(0, 3).map((h) => `• ${h}`).join("\n");
  return `${p.nameBn}\n${p.short}\n${hl}\nদাম: ${p.price > 0 ? priceText(p.price) : p.category === "power-press" ? "টনেজ/সাইজ অনুযায়ী — কল করে জেনে নিন" : "পরিমাণ অনুযায়ী — কল করে জেনে নিন"}\n/product/${p.slug}`;
}

// The product linked in the assistant's last reply, for follow-ups like "details?" or "দাম কত?".
function lastProduct(history: ChatTurn[], catalog: Catalog) {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role !== "assistant") continue;
    const slugs = [...history[i].text.matchAll(/\/product\/([\w-]+)/g)].map((m) => m[1]);
    if (slugs.length === 1) return catalog.products.find((p) => p.slug === slugs[0]);
    return undefined;
  }
  return undefined;
}

// Best paragraph of the owner's notes (Admin → Settings → Chat assistant) for this question.
function fromNotes(text: string, knowledge: string) {
  const q = new Set(words(text));
  if (!q.size || !knowledge.trim()) return null;
  const best = knowledge
    .split(/\n\s*\n|\n(?=[-•*])/)
    .map((para) => ({ para: para.trim(), hits: words(para).filter((w) => q.has(w)).length }))
    .sort((a, b) => b.hits - a.hits)[0];
  return best && best.hits >= 2 ? best.para : null;
}

export function basicReply(raw: string, catalog: Catalog, site: SiteInfo, knowledge = "", history: ChatTurn[] = []): BotReply {
  const text = bnDigits(raw);
  const reply = (t: string): BotReply => ({ text: t, mode: "basic" });

  const phoneMatch = text.match(/(?:\+?88)?01[3-9][\d\s-]{8,12}/);
  if (phoneMatch && isValidBDPhone(phoneMatch[0])) {
    const name = text.replace(phoneMatch[0], "").replace(fillerWords, " ").replace(/[^\p{L}\p{M}\s.]/gu, " ").trim().split(/\s+/).slice(0, 4).join(" ");
    const about = lastProduct(history, catalog);
    return {
      text: `ধন্যবাদ! আপনার নম্বর ${normalizePhone(phoneMatch[0])} সংরক্ষণ করা হয়েছে। আমাদের টিম শীঘ্রই কল করবে। জরুরি হলে কল করুন ${site.phone}।`,
      lead: { name: name || "Chat visitor", phone: normalizePhone(phoneMatch[0]), interest: (about ? `${about.name} — ` : "") + raw.slice(0, 160) },
      mode: "basic",
    };
  }

  const cats = catalog.categories.map((c) => `• ${c.nameBn}: /category/${c.slug}`).join("\n");
  const intro = `ঢাকা মেশিন ঘরে পাবেন নিজস্ব কারখানায় তৈরি পাওয়ার প্রেস (চ্যানেল বডি, বউ বডি, হাইড্রোলিক), এসি স্ট্যান্ড ও রাওয়াল বোল্ট।`;
  if (asks.greet.test(text)) return reply(`ওয়ালাইকুম আসসালাম! ${intro} কী জানতে চান?\n${cats}`);
  if (asks.thanks.test(text) && text.length < 40) return reply(`আপনাকেও ধন্যবাদ! আর কিছু জানতে চাইলে লিখুন, অথবা কল করুন ${site.phone}।`);
  if (asks.track.test(text)) return reply(`ইনভয়েস বা মোবাইল নম্বর দিয়ে অর্ডারের অবস্থা দেখুন: /track`);

  const terms = productTerms.filter(([re]) => re.test(text)).map(([, t]) => t);
  const ton = text.match(/(\d+)\s*(?:টন|ton)/i)?.[1];
  const norm = (x: string) => x.toLowerCase().replace(/bou body|c-frame/g, "bou").replace(/h-frame/g, "channel");
  const scored = catalog.products
    .map((p) => {
      // A term in the product's name / category counts far more than one in its description.
      const title = norm(`${p.name} ${p.category} ${p.subcategory}`);
      const body = norm(`${p.capacity} ${p.short} ${p.specs.map(([, v]) => v).join(" ")}`);
      let s = terms.reduce((sum, t) => sum + (title.includes(t) ? 4 : body.includes(t) ? 1 : 0), 0);
      if (ton && new RegExp(`\\b${ton}\\s*ton`, "i").test(`${p.capacity} ${p.name}`)) s += 3;
      return { p, s };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);

  // Follow-up about the product we just talked about.
  const prev = lastProduct(history, catalog);
  if (!scored.length && prev && (asks.detail.test(text) || asks.price.test(text))) return reply(`${describe(prev)}\n\n${callBack}`);

  if (scored.length) {
    const top = scored[0];
    const clear = scored.length === 1 || top.s > scored[1].s;
    if (clear || asks.detail.test(text)) return reply(`${describe(top.p)}\n\n${callBack}`);
    const list = scored.slice(0, 4).map(({ p }) => `• ${p.nameBn} — ${priceText(p.price)}\n/product/${p.slug}`).join("\n");
    const more = scored.length > 4 ? `\nআরও ${scored.length - 4}টি: /category/${scored[0].p.category}` : "";
    const note = asks.price.test(text) ? "\nদাম টনেজ/সাইজ অনুযায়ী আলাদা — কল করে জেনে নিন।" : "";
    return reply(`এই পণ্যগুলো দেখতে পারেন:\n${list}${more}${note}\n\n${callBack}`);
  }

  const notes = fromNotes(text, knowledge);
  if (notes) return reply(`${notes}\n\nআরও জানতে কল করুন ${site.phone}।`);

  const hit = faq(site).find(([re]) => re.test(text));
  if (hit) return reply(`${hit[1]}\n\n${callBack}`);
  if (asks.price.test(text)) return reply(`দাম মেশিনের টনেজ/সাইজ অনুযায়ী আলাদা। কোন মেশিনের দাম জানতে চান লিখুন, অথবা আপনার নাম ও মোবাইল নম্বর দিন — আমরা কল করে জানাব। সব পণ্য: /shop`);
  if (asks.list.test(text)) return reply(`${intro}\n${cats}\nসব পণ্য: /shop`);

  return reply(`দুঃখিত, প্রশ্নটা ঠিক বুঝিনি। ${intro}\nযেমন লিখুন: "চ্যানেল বডি প্রেস", "এসি স্ট্যান্ড", "ঠিকানা", "ওয়ারেন্টি"।\n${cats}\nসরাসরি কথা বলতে: ${site.phone}`);
}
