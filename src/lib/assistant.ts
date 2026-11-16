import "server-only";
import type { Catalog, Product } from "./catalog";
import type { ChatTurn, LeadInput } from "./chatbot";
import { db } from "./db";
import { isValidBDPhone, normalizePhone } from "./orders";
import { placeOrder } from "./place-order";
import { priceText, type SiteInfo } from "./site";
import { factorySteps } from "./tracking";

// ── Built-in sales assistant (free, no API key) ────────────────────────────────────────────────
// Talks like a salesperson in Bangla, Banglish or English (whichever the customer writes), answers
// from the catalog, business info and the owner's notes, remembers what was being discussed, takes
// orders step by step (product → quantity → name → mobile → address → district → confirm) and
// places them, saves call-back requests as leads, and tells customers where their order is.
// Used by the website chat and the Facebook Messenger webhook.

export type Lang = "bn" | "bl" | "en";
type Step = "product" | "qty" | "name" | "phone" | "address" | "district" | "confirm";
export type OrderDraft = { step: Step; slug?: string; qty?: number; name?: string; phone?: string; address?: string; district?: string; note?: string; generic?: boolean };
export type BotState = { lang?: Lang; product?: string; candidates?: string[]; category?: string; order?: OrderDraft; awaitTrack?: boolean; misses?: number };
export type AssistantReply = { text: string; state: BotState; lead?: LeadInput; orderId?: string; handover?: boolean };
export type AssistantInput = { text: string; history: ChatTurn[]; state?: BotState | null; catalog: Catalog; site: SiteInfo; knowledge: string; channel: "web" | "messenger"; adTitle?: string };

// ── Language ──
const BANGLISH = /\b(?:ami|apni|apnar|apnader|amar|amra|ki|kii|koto|dam|daam|ase|ache|achhe|asen|chai|cai|lagbe|nibo|nebo|kinbo|kivabe|kibhabe|kemne|bhai|vai|vaiya|bhaiya|apu|kothay|kothai|hobe|dite|den|diben|deben|thikana|taka|tk|koyta|kota|ekta|duita|tinta|haa|ha|hya|jodi|kno|keno|kobe|pathaben|bolen|bolben|janan|jante|janabo|valo|bhalo|thik|ache\?|nai|nei|korbo|korte|kore|order\s*dibo|pawa|pabo|jabe|lage|dorkar|ektu)\b/gi;
const ENGLISH = /\b(?:the|what|how|want|need|please|where|is|are|do|does|you|your|have|can|could|would|buy|cost|much|which|when|send|deliver|thanks|hello|hi|my|i|me)\b/gi;

function detectLang(t: string, prev?: Lang): Lang {
  if (/[ঀ-৿]/.test(t)) return "bn";
  if (!/[a-z]/i.test(t)) return prev ?? "bn"; // only digits (a phone number, a quantity)
  const bl = (t.match(BANGLISH) ?? []).length;
  const en = (t.match(ENGLISH) ?? []).length;
  if (bl === 0 && en === 0) return prev ?? "bl";
  return bl >= en ? "bl" : "en";
}

const say = (lang: Lang, bn: string, bl: string, en: string) => (lang === "bn" ? bn : lang === "bl" ? bl : en);
const pick = <T,>(xs: T[], seed: number) => xs[seed % xs.length];
const bnDigits = (s: string) => s.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));
const words = (s: string) => s.toLowerCase().split(/[^\p{L}\p{M}\p{N}]+/u).filter((w) => w.length > 2);

// ── Products ──
type Rule = [RegExp, string];
// Words customers use (Bangla, Banglish, English) → a token found in product names / categories.
const productTerms: Rule[] = [
  [/প্রেস|press|pres\b|preess|pres machine/i, "press"],
  [/চ্যানেল|channel|chanel|chenel|h.?frame/i, "channel"],
  [/বউ|বো বডি|bou|bow|c.?frame|সি ফ্রেম/i, "bou"],
  [/হাইড্রোলিক|hydraulic|hydrolic|haidrolik|hidrolik/i, "hydraulic"],
  [/মোটর|motor/i, "motor"],
  [/হেভি|heavy/i, "heavy"],
  [/ডাবল|double|dabol/i, "double"],
  [/এসি|ac\b|a\.c|air ?con|স্ট্যান্ড|stand|ষ্ট্যান্ড|ব্র্যাকেট|bracket/i, "stand"],
  [/চায়না|চাইনা|china|chaina|চীন|বক্স|box/i, "china"],
  [/পাউডার|powder|এঙ্গেল|অ্যাঙ্গেল|angle|angel/i, "powder"],
  [/চৌকি|চৌকী|chouki|chowki|couki|ছাদ|chad|roof|floor|ফ্লোর/i, "chowki"],
  [/রেড|লাল|red|ব্ল্যাক|কালো|black/i, "red"],
  [/বোল্ট|bolt|রাওয়াল|রাওল|রয়েল|royal|rawal|rawl|anchor/i, "bolt"],
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

function findProducts(text: string, catalog: Catalog) {
  const terms = productTerms.filter(([re]) => re.test(text)).map(([, t]) => t);
  const kg = bnDigits(text).match(/(\d[\d,]*)\s*(?:kg|কেজি|keji)/i)?.[1].replace(/,/g, "");
  if (!terms.length && !kg) return [];
  const ton = text.match(/(\d+)\s*(?:টন|ton)/i)?.[1];
  const norm = (x: string) => x.toLowerCase().replace(/bou body|c-frame/g, "bou").replace(/h-frame/g, "channel").replace(/chowki|chouki/g, "chowki").replace(/no powder coating/g, "plain paint").replace(/powder coated|angle/g, "powder").replace(/red & black|red oxide/g, "red");
  return catalog.products
    .map((p) => {
      // A term in the product's name / category counts far more than one in its description.
      const title = norm(`${p.name.replace(/\s*[—-]\s*with\b.*$/i, "")} ${p.category} ${p.subcategory}`);
      const body = norm(`${p.capacity} ${p.short}`);
      let s = terms.reduce((sum, t) => sum + (title.includes(t) ? 4 : body.includes(t) ? 1 : 0), 0);
      if (ton && new RegExp(`\\b${ton}\\s*ton`, "i").test(`${p.capacity} ${p.name}`)) s += 3;
      const w = p.specs.find(([k]) => k === "Weight")?.[1].replace(/[^\d]/g, "");
      if (kg && w === kg) s += 5;
      return { p, s };
    })
    .filter((x) => x.s >= 4)
    .sort((a, b) => b.s - a.s);
}

// When the customer picks from a list we just showed, prefer those products.
function narrow(found: ReturnType<typeof findProducts>, state: BotState) {
  const inList = found.filter((x) => state.candidates?.includes(x.p.slug));
  return inList.length ? inList : found;
}
const isClear = (found: ReturnType<typeof findProducts>) => found.length === 1 || (found.length > 1 && found[0].s > found[1].s);

const nameOf = (p: Product, lang: Lang) => (lang === "bn" ? p.nameBn : p.name);
const unitOf = (p: Product, lang: Lang) => {
  const t = `${p.short} ${p.highlights.join(" ")}`.toLowerCase();
  if (t.includes("per piece")) return say(lang, "পিস", "pis", "piece");
  if (t.includes("per set")) return say(lang, "সেট", "set", "set");
  return say(lang, "টি", "ta", "unit");
};
const spec = (p: Product, label: string) => p.specs.find(([k]) => k.toLowerCase() === label.toLowerCase())?.[1];
const bnNum = (s: string) => s.replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
// "ওজন ৫০০ কেজি, প্রতি কেজি ৳180" for presses sold by weight.
function weightLine(p: Product, lang: Lang) {
  const w = spec(p, "Weight");
  const rate = spec(p, "Price rate")?.replace(/\s*per kg/i, "");
  if (!w) return "";
  const cap = p.capacity ? say(lang, `, ক্ষমতা ${bnNum(p.capacity.replace(/ton/i, "টন"))}`, `, capacity ${p.capacity}`, `, capacity ${p.capacity}`) : "";
  return say(lang, `ওজন ${bnNum(w.replace(/kg/i, "কেজি"))}${rate ? `, প্রতি কেজি ${rate}` : ""}${cap}`, `ojon ${w}${rate ? `, per kg ${rate}` : ""}${cap}`, `weight ${w}${rate ? `, ${rate} per kg` : ""}${cap}`);
}

// "Plain: ৳320 per set" style lines from the highlights (products with more than one price).
function priceLines(p: Product, lang: Lang) {
  const lines = p.highlights.filter((h) => /৳\s?\d/.test(h) && !/^(?:price|rate)\b/i.test(h));
  return lines.map((h) => h.replace(/per set/gi, `/ ${say(lang, "সেট", "set", "set")}`).replace(/per piece/gi, `/ ${say(lang, "পিস", "pis", "piece")}`));
}

function aboutProduct(p: Product, lang: Lang, seed: number) {
  const name = nameOf(p, lang);
  const link = `/product/${p.slug}`;
  if (p.price > 0 && spec(p, "Weight")) {
    const open = pick([say(lang, "জি, আছে 👍", "Ji, ache 👍", "Yes, we have it 👍"), say(lang, "অবশ্যই পাবেন।", "Obosshoi paben.", "Sure, it's available.")], seed);
    const wl = weightLine(p, lang);
    return say(
      lang,
      `${open} ${name} — দাম ${priceText(p.price)} (${wl})।\nআমাদের কারখানায় এসে চালিয়ে দেখতেও পারেন। নিতে চাইলে বলুন, অর্ডার নিয়ে নিচ্ছি।\n${link}`,
      `${open} ${name} — dam ${priceText(p.price)} (${wl}).\nAmader karkhanay eshe chaliye dekhteo paren. Nite chaile bolen, order niye nicchi.\n${link}`,
      `${open} ${name} — ${priceText(p.price)} (${wl}).\nYou're welcome to come and see it run at our factory. Want me to take the order?\n${link}`,
    );
  }
  if (p.price > 0) {
    const unit = unitOf(p, lang);
    const extra = priceLines(p, lang);
    const prices = extra.length > 1 ? `\n${extra.join("\n")}` : "";
    const open = pick([say(lang, "জি, আছে 👍", "Ji, ache 👍", "Yes, we have it 👍"), say(lang, "অবশ্যই পাবেন।", "Obosshoi paben.", "Sure, it's available.")], seed);
    return say(
      lang,
      `${open} ${name} — দাম ${priceText(p.price)} প্রতি ${unit}।${prices}\nকয়টা লাগবে বলুন, এখনই অর্ডার নিয়ে নিচ্ছি।\n${link}`,
      `${open} ${name} — dam ${priceText(p.price)} per ${unit}.${prices}\nKoyta lagbe bolen, ekhoni order niye nicchi.\n${link}`,
      `${open} ${name} — ${priceText(p.price)} per ${unit}.${prices}\nHow many do you need? I can take the order right here.\n${link}`,
    );
  }
  return say(
    lang,
    `জি, ${name} আমাদের নিজস্ব কারখানায় তৈরি হয় 👍 এর দাম টনেজ আর সাইজ অনুযায়ী ঠিক হয়। কত টনের লাগবে আর কী কাজে ব্যবহার করবেন জানালে সঠিক দামটা জানিয়ে দিতে পারব।\n${link}`,
    `Ji, ${name} amader nijer karkhanay toiri hoy 👍 Eta-r dam tonnage ar size onujayi thik hoy. Koto ton er lagbe ar ki kaje use korben janale exact dam ta janate parbo.\n${link}`,
    `Yes, ${name} is built in our own factory 👍 Its price depends on the tonnage and size. Tell me the tonnage you need and what you'll use it for, and I'll get you the exact price.\n${link}`,
  );
}

// ── Districts (for delivery) ──
const DISTRICTS: [string, RegExp][] = [
  ["Dhaka", /ঢাকা|dhaka|কেরানীগঞ্জ|keraniganj|সাভার|savar|মিরপুর|mirpur|উত্তরা|uttara|যাত্রাবাড়ী|jatrabari|ধানমন্ডি|dhanmondi|গুলশান|gulshan|মোহাম্মদপুর|mohammadpur|মতিঝিল|motijheel|বাড্ডা|badda|দোহার|dohar|নবাবগঞ্জ|nawabganj|ধামরাই|dhamrai/i],
  ["Gazipur", /গাজীপুর|gazipur|টঙ্গী|tongi|কালিয়াকৈর|kaliakair/i], ["Narayanganj", /নারায়ণগঞ্জ|নারায়নগঞ্জ|narayanganj|narayangonj/i],
  ["Narsingdi", /নরসিংদী|narsingdi/i], ["Munshiganj", /মুন্সীগঞ্জ|মুন্সিগঞ্জ|munshiganj/i], ["Manikganj", /মানিকগঞ্জ|manikganj/i],
  ["Tangail", /টাঙ্গাইল|tangail/i], ["Kishoreganj", /কিশোরগঞ্জ|kishoreganj/i], ["Faridpur", /ফরিদপুর|faridpur/i], ["Gopalganj", /গোপালগঞ্জ|gopalganj/i],
  ["Madaripur", /মাদারীপুর|madaripur/i], ["Rajbari", /রাজবাড়ী|rajbari/i], ["Shariatpur", /শরীয়তপুর|shariatpur/i],
  ["Chattogram", /চট্টগ্রাম|chattogram|chittagong|ctg/i], ["Cox's Bazar", /কক্সবাজার|cox'?s ?bazar/i], ["Cumilla", /কুমিল্লা|cumilla|comilla/i],
  ["Brahmanbaria", /ব্রাহ্মণবাড়িয়া|brahmanbaria/i], ["Chandpur", /চাঁদপুর|chandpur/i], ["Feni", /ফেনী|feni/i], ["Lakshmipur", /লক্ষ্মীপুর|lakshmipur|laxmipur/i],
  ["Noakhali", /নোয়াখালী|noakhali/i], ["Khagrachhari", /খাগড়াছড়ি|khagrachhari/i], ["Rangamati", /রাঙ্গামাটি|rangamati/i], ["Bandarban", /বান্দরবান|bandarban/i],
  ["Rajshahi", /রাজশাহী|rajshahi/i], ["Bogura", /বগুড়া|bogura|bogra/i], ["Joypurhat", /জয়পুরহাট|joypurhat/i], ["Naogaon", /নওগাঁ|naogaon/i],
  ["Natore", /নাটোর|natore/i], ["Chapainawabganj", /চাঁপাইনবাবগঞ্জ|chapai/i], ["Pabna", /পাবনা|pabna/i], ["Sirajganj", /সিরাজগঞ্জ|sirajganj/i],
  ["Khulna", /খুলনা|khulna/i], ["Bagerhat", /বাগেরহাট|bagerhat/i], ["Chuadanga", /চুয়াডাঙ্গা|chuadanga/i], ["Jashore", /যশোর|jashore|jessore/i],
  ["Jhenaidah", /ঝিনাইদহ|jhenaidah/i], ["Kushtia", /কুষ্টিয়া|kushtia/i], ["Magura", /মাগুরা|magura/i], ["Meherpur", /মেহেরপুর|meherpur/i],
  ["Narail", /নড়াইল|narail/i], ["Satkhira", /সাতক্ষীরা|satkhira/i], ["Barishal", /বরিশাল|barishal|barisal/i], ["Barguna", /বরগুনা|barguna/i],
  ["Bhola", /ভোলা|bhola/i], ["Jhalokati", /ঝালকাঠি|jhalokati/i], ["Patuakhali", /পটুয়াখালী|patuakhali/i], ["Pirojpur", /পিরোজপুর|pirojpur/i],
  ["Sylhet", /সিলেট|sylhet/i], ["Habiganj", /হবিগঞ্জ|habiganj/i], ["Moulvibazar", /মৌলভীবাজার|moulvibazar/i], ["Sunamganj", /সুনামগঞ্জ|sunamganj/i],
  ["Rangpur", /রংপুর|rangpur/i], ["Dinajpur", /দিনাজপুর|dinajpur/i], ["Gaibandha", /গাইবান্ধা|gaibandha/i], ["Kurigram", /কুড়িগ্রাম|kurigram/i],
  ["Lalmonirhat", /লালমনিরহাট|lalmonirhat/i], ["Nilphamari", /নীলফামারী|nilphamari/i], ["Panchagarh", /পঞ্চগড়|panchagarh/i], ["Thakurgaon", /ঠাকুরগাঁও|thakurgaon/i],
  ["Mymensingh", /ময়মনসিংহ|mymensingh/i], ["Jamalpur", /জামালপুর|jamalpur/i], ["Netrokona", /নেত্রকোনা|netrokona/i], ["Sherpur", /শেরপুর|sherpur/i],
];
const districtIn = (t: string) => DISTRICTS.find(([, re]) => re.test(t))?.[0];

// ── Small parsers ──
const YES = /^\s*(?:ha+|haa|hae|hya|ji+|jee|yes|yeah|yep|y|ok|okay|okey|thik ache|thik ase|confirm|done|sure|হ্যাঁ|হ্যা|হা|জি|জ্বি|ঠিক আছে|কনফার্ম|ওকে|অবশ্যই|সব ঠিক)/i;
const NO = /^\s*(?:na|nah|no|nope|not|cancel|batil|thak|lagbe na|থাক|না|বাতিল|লাগবে না)\b/i;
const CANCEL = /বাতিল|cancel|থাক|lagbe na|লাগবে না|batil|order korbo na|অর্ডার করব না/i;
const QUESTION = /\?|কি\b|কী\b|কত|কেন|কিভাবে|কীভাবে|কোথায়|\bki\b|\bkoto\b|\bkeno\b|\bkivabe\b|\bkothay\b|\bwhat\b|\bhow\b|\bwhere\b|\bwhy\b/i;

function phoneIn(t: string) {
  const m = bnDigits(t).match(/(?:\+?88)?0\s?1[3-9][\d\s-]{8,12}/);
  return m && isValidBDPhone(m[0]) ? { raw: m[0], phone: normalizePhone(m[0]) } : null;
}

const NUM_WORDS: [RegExp, number][] = [
  [/\b(?:ek|ekta|ekti|one|single)\b|একটা|একটি|এক(?:টা|টি)?\s?(?:পিস|সেট)/i, 1],
  [/\b(?:dui|duita|duiti|duto|two)\b|দুইটা|দুটি|দুটো|দুই/i, 2],
  [/\b(?:tin|tinta|three)\b|তিনটা|তিনটি|তিন/i, 3],
  [/\b(?:char|charta|four)\b|চারটা|চারটি|চার/i, 4],
  [/\b(?:pach|pachta|panch|five)\b|পাঁচটা|পাঁচটি|পাঁচ/i, 5],
  [/\b(?:dosh|dos|ten)\b|দশটা|দশ/i, 10],
];
function qtyIn(t: string) {
  const s = bnDigits(t).replace(/(?:\+?88)?01[3-9][\d\s-]{8,12}/g, " ").replace(/\d+\s*(?:টন|ton|inch|ইঞ্চি|mm|মিমি)/gi, " ");
  const d = s.match(/\b(\d{1,5})\b/);
  if (d) {
    const n = Number(d[1]);
    return n > 0 && n <= 10000 ? n : undefined;
  }
  return NUM_WORDS.find(([re]) => re.test(s))?.[1];
}

function nameIn(t: string) {
  const n = t
    .replace(/(?:\+?88)?01[3-9][\d\s-]{8,12}/g, " ")
    .replace(/\b(?:my name is|name is|i am|i'm|this is|amar nam|amar naam|ami|nam|name)\b/gi, " ")
    .replace(/আমার নাম|নাম|আমি|বলছি|bolchi|হলো|হল/gi, " ")
    .replace(/[^\p{L}\p{M}\s.]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  const parts = n.split(" ").filter(Boolean);
  return n.length >= 2 && n.length <= 40 && parts.length <= 5 ? n : null;
}

// ── FAQ ──
type Faq = [RegExp, (lang: Lang) => string];
function faqs(site: SiteInfo): Faq[] {
  const place = site.showroom ? `${site.address} (শোরুম: ${site.showroom})` : site.address;
  return [
    [/বট|robot|\bbot\b|মানুষ না|manush na|are you human|real person|তুমি কে|আপনি কে|apni ke|who are you/i, (l) =>
      say(l, `আমি ঢাকা মেশিন ঘরের অটো-সহকারী 🙂 দাম, প্রোডাক্ট আর অর্ডারে সাহায্য করি। আমাদের টিমের কারো সাথে কথা বলতে চাইলে "মানুষ" লিখুন বা কল করুন ${site.phone}।`,
        `Ami Dhaka Machine Ghar er auto-assistant 🙂 Dam, product ar order e help kori. Team er karo sathe kotha bolte chaile "manush" likhun ba call korun ${site.phone}.`,
        `I'm Dhaka Machine Ghar's automatic assistant 🙂 I help with prices, products and orders. To talk to someone from our team, type "human" or call ${site.phone}.`)],
    [/ঠিকানা|কোথায়|লোকেশন|location|address|thikana|kothay|kothai|শোরুম|showroom|কারখানা|factory|ম্যাপ|map|আসতে চাই|dekhte aste/i, (l) =>
      say(l, `আমাদের কারখানা ও শোরুম: ${place}। ম্যাপে লোকেশন আর রাস্তা দেখুন: /contact\nআসার আগে একটা কল দিলে ভালো হয়: ${site.phone}`,
        `Amader karkhana o showroom: ${site.address}. Map e location ar rasta dekhun: /contact\nAshar age ekta call dile bhalo: ${site.phone}`,
        `Our factory and showroom: ${site.address}. See the map and directions: /contact\nPlease call before you come: ${site.phone}`)],
    [/সময়|খোলা|বন্ধ|hours|open|somoy|kokhon|কখন|শুক্রবার|friday/i, (l) =>
      say(l, `আমরা খোলা থাকি ${site.hours}। এর মধ্যে যেকোনো সময় কল করতে পারেন: ${site.phone}`, `Amra khola thaki ${site.hours}. Ei somoy er moddhe call korte paren: ${site.phone}`, `We're open ${site.hours}. Call any time in those hours: ${site.phone}`)],
    [/ওয়ারেন্টি|গ্যারান্টি|warranty|waranty|guarantee|garanti|সার্ভিস|service|নষ্ট|nosto|সমস্যা হলে|problem hole/i, (l) =>
      say(l, `প্রতিটি মেশিনে সিরিয়াল নম্বরসহ ওয়ারেন্টি আর বিক্রির পরের সার্ভিস আছে। কোনো সমস্যা হলে সিরিয়াল দিয়ে এখানে জানাতে পারেন: /warranty`,
        `Protiti machine e serial number shoho warranty ar after-sales service ache. Kono somossa hole serial diye ekhane janan: /warranty`,
        `Every machine has a serial-numbered warranty and after-sales service. If anything goes wrong, report it with the serial here: /warranty`)],
    [/ডেলিভারি|deliver|deliveri|shipping|ship to|পাঠান|pathan|পাঠাবেন|কুরিয়ার|courier|সারা দেশ|jela|জেলায়|home delivery/i, (l) =>
      say(l, `জি, সারা বাংলাদেশে ট্রান্সপোর্ট বা কুরিয়ারে ডেলিভারি দিই। আপনি কোন জেলায় নেবেন বললে খরচ আর সময়টা জানিয়ে দিতে পারি।`,
        `Ji, shara Bangladesh e transport ba courier e delivery dei. Kon jelay niben bolle khoroch ar somoy ta janiye dite pari.`,
        `Yes, we deliver all over Bangladesh by transport or courier. Tell me your district and we'll confirm the cost and time.`)],
    [/পেমেন্ট|payment|বিকাশ|bkash|bikash|নগদ|nagad|অগ্রিম|advance|ogrim|ব্যাংক|bank|কিস্তি|kisti|cash on|ক্যাশ/i, (l) =>
      say(l, `অর্ডার কনফার্মের সময় অল্প অগ্রিম (মোটের ${site.advancePercent}%) bKash / Nagad / ব্যাংকে দিতে হয়, বাকিটা ডেলিভারির সময়। অর্ডার দিলে আমাদের টিম কল করে সব বুঝিয়ে দেবে।`,
        `Order confirm er somoy olpo advance (moter ${site.advancePercent}%) bKash / Nagad / bank e dite hoy, baki ta delivery r somoy. Order dile amader team call kore shob bujhiye dibe.`,
        `To confirm an order we take a small advance (${site.advancePercent}% of the total) by bKash / Nagad / bank; the rest is paid on delivery. Our team will call to explain after you order.`)],
    [/কাস্টম|custom|মাপে|mape|টনেজ|tonnage|বানিয়ে|baniye|বানাতে|banate/i, (l) =>
      say(l, `জি, আপনার দরকারি টনেজ আর মাপে পাওয়ার প্রেস আমরা নিজেরাই বানিয়ে দিই। কত টনের আর কী কাজের জন্য লাগবে বলুন, অথবা এখানে কোটেশন চান: /quotation`,
        `Ji, apnar dorkari tonnage ar mape power press amra nijerai baniye dei. Koto ton er ar ki kaje lagbe bolen, othoba ekhane quotation chan: /quotation`,
        `Yes, we build power presses to the tonnage and size you need. Tell me the tonnage and the job, or ask for a quotation here: /quotation`)],
    [/ফেরত|ferot|refund|return|বদলে|bodle/i, (l) =>
      say(l, `ফেরত আর রিফান্ডের নিয়ম এখানে আছে: /refund। কোনো সমস্যা হলে সরাসরি কল করুন ${site.phone}, আমরা দেখে দেব।`, `Ferot ar refund er niyom ekhane: /refund. Kono somossa hole call korun ${site.phone}.`, `Our return and refund policy: /refund. For any problem, call ${site.phone}.`)],
    [/যোগাযোগ|contact|নম্বর দিন|number din|নাম্বার|phone number|ফোন নম্বর|whatsapp|হোয়াটসঅ্যাপ|imo|email|ইমেইল/i, (l) =>
      say(l, `কল বা WhatsApp: ${site.phone}\nইমেইল: ${site.email}`, `Call ba WhatsApp: ${site.phone}\nEmail: ${site.email}`, `Call or WhatsApp: ${site.phone}\nEmail: ${site.email}`)],
    [/কেজি|kg\b|keji|পাইকারি|pikari|wholesale|dealer|ডিলার|বেশি পরিমাণ|beshi nile|ছাড়|discount|কম দাম|kom dam|কমানো|komano/i, (l) =>
      say(l, `বেশি পরিমাণে নিলে দামের ব্যাপারে মালিক নিজে কথা বলে ঠিক করেন। কোনটা কত পিস/সেট লাগবে জানান আর আপনার নম্বরটা দিন — আমরা কল করে সেরা দামটা জানাব।`,
        `Beshi poriman e nile dam er bepare malik nije kotha bole thik koren. Konta koto pis/set lagbe janan ar apnar number ta din — amra call kore best dam ta janabo.`,
        `For large quantities the owner sets the price personally. Tell me what and how many you need and share your number — we'll call with our best price.`)],
  ];
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

// ── Intents ──
const GREET = /^(?:\s*(?:hi+|hello|helo|hey|salam|slm|assalamu ?alaikum|assalamualaikum|asalamualaikum|আসসালামু আলাইকুম|আসসালামুয়ালাইকুম|সালাম|হাই|হ্যালো|হেলো|good (?:morning|evening))(?:\s+(?:vai|bhai|bhaiya|vaiya|apu|sir|bro|brother|ভাই|ভাইয়া|আপু|স্যার))?[\s,.!]*)+/i;
const THANKS = /ধন্যবাদ|থ্যাংক|thanks?|thank you|tnx|thx|shukriya|জাযাকাল্লাহ|jazakallah/i;
const BYE = /^\s*(?:bye|ok bye|আল্লাহ হাফেজ|allah hafez|খোদা হাফেজ|khoda hafez|পরে কথা বলব|pore kotha)\b/i;
const ORDER = /অর্ডার|order|কিনব|কিনতে|kinbo|kinte|নিব|নেব|নিতে চাই|nibo|nebo|nite chai|buy|purchase|বুকিং|booking|confirm kor|কনফার্ম কর|lagbe\b|লাগবে(?! না)/i;
const TRACK = /ট্র্যাক|track|অর্ডার(?:ের)? (?:অবস্থা|কোথায়|কতদূর|কি অবস্থা)|order (?:status|kothay|kotodur|ki obostha)|আমার অর্ডার|amar order|ডেলিভারি কবে|delivery kobe/i;
const INVOICE = /DMG-\d{6}-\d{3,5}/i;
const PRICE = /দাম|price|কত টাকা|koto taka|\bdam\b|\bdaam\b|rate|মূল্য|cost|how much/i;
const LIST = /কি কি|কী কী|ki ki|কি পাওয়া|কী পাওয়া|ki pawa|ki ase|ki ache|কি আছে|কী আছে|products?|পণ্য|catalog|সব মেশিন|kon kon|কোন কোন|what do you (?:sell|have)/i;
const HUMAN = /মানুষ|লোকের সাথে|কর্মী|অফিসের কেউ|human|real person|agent|manush|owner er sathe|মালিকের সাথে/i;

export function wantsAssistant(text: string, state?: BotState | null) {
  return !!(state?.order || state?.awaitTrack || ORDER.test(text) || TRACK.test(text) || INVOICE.test(text));
}

// ── Main ──
export async function converse(input: AssistantInput): Promise<AssistantReply> {
  const { catalog, site, knowledge, channel } = input;
  const raw = input.text.trim().slice(0, 1000);
  const text = bnDigits(raw);
  const state: BotState = { ...(input.state ?? {}) };
  const lang = detectLang(text, state.lang);
  state.lang = lang;
  const seed = input.history.length;
  const first = !input.history.some((t) => t.role === "assistant");
  const out = (t: string, extra: Partial<AssistantReply> = {}): AssistantReply => ({ text: t, state, ...extra });
  const bySlug = (slug?: string) => catalog.products.find((p) => p.slug === slug);
  // Came from a Facebook ad: start out talking about that ad's product.
  if (!state.product && input.adTitle) {
    const fromAd = findProducts(input.adTitle, catalog);
    if (isClear(fromAd)) {
      state.product = fromAd[0].p.slug;
      state.category = fromAd[0].p.category;
    } else if (fromAd.length) state.category = fromAd[0].p.category;
  }

  // 1. An order in progress takes priority.
  if (state.order) {
    const r = await continueOrder(text, raw, state, input, lang, seed);
    if (r) return r;
  }

  // 2. Order tracking.
  const inv = text.match(INVOICE)?.[0].toUpperCase();
  const ph = phoneIn(text);
  if (inv || (state.awaitTrack && ph) || (TRACK.test(text) && ph)) {
    state.awaitTrack = false;
    return out(await trackReply(inv ? { id: inv } : { phone: ph!.phone }, lang, site));
  }
  if (TRACK.test(text)) {
    state.awaitTrack = true;
    return out(say(lang, `অবশ্যই, দেখে দিচ্ছি। অর্ডারের ইনভয়েস নম্বর (যেমন DMG-261116-1234) বা অর্ডারের সময় দেওয়া মোবাইল নম্বরটা লিখুন।`,
      `Obosshoi, dekhe dicchi. Order er invoice number (jemon DMG-261116-1234) ba order er somoy deya mobile number ta likhun.`,
      `Sure, let me check. Please type the invoice number (like DMG-261116-1234) or the mobile number you ordered with.`));
  }

  // 3. A person, please.
  if (HUMAN.test(text) && !/বট|\bbot\b|robot/i.test(text)) {
    return out(say(lang, `অবশ্যই 🙏 আমাদের টিমের একজন শিগগিরই আপনাকে উত্তর দেবেন। খুব জরুরি হলে সরাসরি কল বা WhatsApp করুন: ${site.phone}`,
      `Obosshoi 🙏 Amader team er ekjon shiggiri apnake reply diben. Khub joruri hole direct call ba WhatsApp korun: ${site.phone}`,
      `Of course 🙏 Someone from our team will reply to you soon. If it's urgent, call or WhatsApp ${site.phone}.`), { handover: true });
  }

  // 4. Greetings, thanks, goodbye.
  const greeted = GREET.test(text);
  const rest = text.replace(GREET, "").trim();
  const hello = greeted ? say(lang, "ওয়ালাইকুম আসসালাম 😊 ", "Walaikum assalam 😊 ", "Hello 😊 ") : "";
  if (greeted && rest.length < 2) {
    return out(
      first
        ? say(lang, `${hello}ঢাকা মেশিন ঘরে আপনাকে স্বাগতম। বলুন, কী খুঁজছেন? পাওয়ার প্রেস, এসি স্ট্যান্ড, রয়েল বোল্ট — সবই আমাদের কারখানায় তৈরি।`,
            `${hello}Dhaka Machine Ghar e apnake shagotom. Bolen, ki khujchen? Power press, AC stand, royal bolt — shob amader karkhanay toiri.`,
            `${hello}Welcome to Dhaka Machine Ghar. What are you looking for? Power presses, AC stands, royal bolts — all made in our own factory.`)
        : say(lang, `${hello}জি বলুন, কীভাবে সাহায্য করতে পারি?`, `${hello}Ji bolen, kivabe help korte pari?`, `${hello}How can I help?`),
    );
  }
  if (THANKS.test(rest) && rest.length < 40) {
    return out(pick([say(lang, "আপনাকেও ধন্যবাদ 😊 আর কিছু লাগলে জানাবেন।", "Apnakeo dhonnobad 😊 Ar kichu lagle janaben.", "You're welcome 😊 Let me know if you need anything else."),
      say(lang, "ধন্যবাদ আপনাকে! যেকোনো দরকারে আমরা আছি 🙏", "Dhonnobad apnake! Je kono dorkare amra achi 🙏", "Thank you! We're here whenever you need us 🙏")], seed));
  }
  if (BYE.test(rest)) return out(say(lang, "আল্লাহ হাফেজ 🙏 ভালো থাকবেন।", "Allah hafez 🙏 Bhalo thakben.", "Goodbye 🙏 Take care."));

  // 5. Which product is this about?
  const found = narrow(findProducts(rest, catalog), state);
  const clear = isClear(found);
  if (clear) {
    state.product = found[0].p.slug;
    state.category = found[0].p.category;
    state.candidates = undefined;
  } else if (found.length > 1) {
    state.candidates = found.slice(0, 6).map((x) => x.p.slug);
    state.category = found[0].p.category;
  }
  const current = clear ? found[0].p : bySlug(state.product);
  const pressTalk = current?.price === 0 || state.category === "power-press" || /প্রেস|press/i.test(rest);

  // Tonnage for a press → the owner prices it: take name and number (a call-back with the details).
  const tonAsked = rest.match(/(\d+)\s*(?:টন|ton)/i)?.[1];
  const tonMatch = tonAsked ? catalog.products.filter((p) => p.category === "power-press" && p.price > 0 && new RegExp(`^${tonAsked}\\s*ton`, "i").test(p.capacity)) : [];
  if (tonMatch.length && !ORDER.test(rest.replace(/লাগবে|lagbe/gi, ""))) {
    state.product = tonMatch[0].slug;
    state.category = "power-press";
    return out(hello + aboutProduct(tonMatch[0], lang, seed));
  }
  if (pressTalk && /\d+\s*(?:টন|ton)/i.test(rest)) {
    const slug = (current?.price === 0 ? current.slug : undefined) ?? state.candidates?.[0] ?? catalog.products.find((p) => p.category === "power-press")?.slug;
    state.order = { step: "name", slug, qty: 1, note: raw.slice(0, 160), phone: ph?.phone, generic: current?.price !== 0 };
    return out(hello + say(lang, `বুঝেছি, ধন্যবাদ 👍 এই টনেজের জন্য সঠিক দামটা মালিক নিজে হিসাব করে জানাবেন। আপনার নামটা বলবেন?`,
      `Bujhechi, dhonnobad 👍 Ei tonnage er jonno exact dam ta malik nije hishab kore janaben. Apnar nam ta bolben?`,
      `Got it, thanks 👍 The owner will work out the exact price for that tonnage. May I have your name?`));
  }

  // 6. Wants to order.
  if (ORDER.test(rest) && !QUESTION.test(rest.replace(/order\s*korte\s*chai|অর্ডার করতে চাই/i, ""))) {
    const draft: OrderDraft = { step: "product" };
    if (clear || (found.length === 0 && current)) draft.slug = current!.slug;
    const q = qtyIn(rest);
    if (q) draft.qty = q;
    if (ph) draft.phone = ph.phone;
    state.order = draft;
    return out(hello + nextPrompt(state.order, input, lang, state));
  }

  // 7. A phone number on its own: a call-back request (and an offer to order).
  if (ph) {
    const name = nameIn(text.replace(ph.raw, "")) ?? "Chat customer";
    const lead: LeadInput = { name, phone: ph.phone, interest: (current ? `${current.name} — ` : "") + raw.slice(0, 160) };
    return out(
      say(lang, `ধন্যবাদ! ${ph.phone} নম্বরটা নোট করে রাখলাম, আমাদের টিম শিগগিরই কল করবে। চাইলে এখনই অর্ডারটাও এখানে কনফার্ম করে দিতে পারি — শুধু লিখুন "অর্ডার করব"।`,
        `Dhonnobad! ${ph.phone} number ta note kore rakhlam, amader team shiggiri call korbe. Chaile ekhoni order ta-o ekhane confirm kore dite pari — shudhu likhun "order korbo".`,
        `Thanks! I've noted ${ph.phone}; our team will call you soon. If you like, I can confirm the order right here — just type "order".`),
      { lead },
    );
  }

  // 8. About a product.
  if (clear) return out(hello + aboutProduct(found[0].p, lang, seed));
  if (!clear && PRICE.test(rest) && /প্রেস|press/i.test(rest) && !/হাইড্রোলিক|hydraulic|hidrolik|haidrolik|চ্যানেল|channel|বউ|bou/i.test(rest)) {
    const some = catalog.products.filter((p) => p.category === "power-press" && p.price > 0).sort((a, b) => a.price - b.price);
    const pickd = [some[0], some[Math.floor(some.length / 2)], some[some.length - 1]].filter((x, i, a) => x && a.indexOf(x) === i);
    const list = pickd.map((p) => `• ${nameOf(p, lang)} — ${priceText(p.price)}`).join("\n");
    state.category = "power-press";
    return out(hello + say(lang, `আমাদের পাওয়ার প্রেসের দাম ওজন অনুযায়ী — প্রতি কেজি ৳১৮০ থেকে ৳২৩০। যেমন:\n${list}\nকত টনের বা কী কাজের জন্য লাগবে বললে ঠিক মেশিনটা দেখিয়ে দিই। সব দেখুন: /category/power-press`,
      `Amader power press er dam ojon onujayi — per kg ৳180 theke ৳230. Jemon:\n${list}\nKoto ton er ba ki kaje lagbe bolle thik machine ta dekhiye dei. Shob dekhun: /category/power-press`,
      `Our power presses are priced by weight — ৳180 to ৳230 per kg. For example:\n${list}\nTell me the tonnage or the job and I'll point you to the right machine. All of them: /category/power-press`));
  }
  if (found.length > 1 && found.every((x) => x.p.price === 0)) {
    return out(hello + say(lang, `জি, এগুলো আমাদের নিজস্ব কারখানায় তৈরি হয় 👍 কয়েকটা মডেল ও রঙে আছে, ছবি দেখুন: /category/${found[0].p.category}\nদাম টনেজ আর সাইজ অনুযায়ী ঠিক হয় — কত টনের লাগবে আর কী কাজে ব্যবহার করবেন বললে দামটা জানিয়ে দেব।`,
      `Ji, egula amader nijer karkhanay toiri hoy 👍 Koyekta model o rong e ache, chobi dekhun: /category/${found[0].p.category}\nDam tonnage ar size onujayi thik hoy — koto ton lagbe ar ki kaje use korben bolle dam ta janiye dibo.`,
      `Yes, we build these in our own factory 👍 There are a few models and colours — see them here: /category/${found[0].p.category}\nThe price depends on tonnage and size — tell me the tonnage and the job and I'll get you a price.`));
  }
  if (found.length > 1) {
    const list = [...found].sort((a, b) => b.s - a.s || Number(b.p.price > 0) - Number(a.p.price > 0)).slice(0, 5).map(({ p }) => `• ${nameOf(p, lang)} — ${priceText(p.price)}`).join("\n");
    return out(hello + say(lang, `এই ধরনের কয়েকটা আছে:\n${list}\nকোনটার কথা জানতে চান?`, `Ei dhoroner koyekta ache:\n${list}\nKonta-r kotha jante chan?`, `We have a few of these:\n${list}\nWhich one would you like to know about?`) + `\n/category/${found[0].p.category}`);
  }
  if (current && /ওজন|কত কেজি|koto kg|koto keji|ojon|weight|kg koto/i.test(rest)) {
    const wl = weightLine(current, lang);
    if (wl) return out(hello + say(lang, `${nameOf(current, lang)} — ${wl}।`, `${nameOf(current, lang)} — ${wl}.`, `${nameOf(current, lang)} — ${wl}.`));
  }
  // Follow-up on the product we were discussing ("dam koto?", "details?").
  if (current && (PRICE.test(rest) || /বিস্তারিত|details?|ডিটেইল|আর কি|ar ki|spec/i.test(rest))) return out(hello + aboutProduct(current, lang, seed + 1));
  if (!current && (state.category === "power-press" || /প্রেস|press/i.test(rest)) && PRICE.test(rest)) {
    const some = catalog.products.filter((p) => p.category === "power-press" && p.price > 0).sort((a, b) => a.price - b.price);
    const pickd = [some[0], some[Math.floor(some.length / 2)], some[some.length - 1]].filter((x, i, a) => x && a.indexOf(x) === i);
    const list = pickd.map((p) => `• ${nameOf(p, lang)} — ${priceText(p.price)}`).join("\n");
    return out(hello + say(lang, `আমাদের পাওয়ার প্রেসের দাম ওজন অনুযায়ী — প্রতি কেজি ৳১৮০ থেকে ৳২৩০। যেমন:\n${list}\nকত টনের বা কী কাজের জন্য লাগবে বললে ঠিক মেশিনটা দেখিয়ে দিই। সব দেখুন: /category/power-press`,
      `Amader power press er dam ojon onujayi — per kg ৳180 theke ৳230. Jemon:\n${list}\nKoto ton er ba ki kaje lagbe bolle thik machine ta dekhiye dei. Shob dekhun: /category/power-press`,
      `Our power presses are priced by weight — ৳180 to ৳230 per kg. For example:\n${list}\nTell me the tonnage or the job and I'll point you to the right machine. All of them: /category/power-press`));
  }
  // Tonnage / use for a press we're discussing → ask for a number to give the exact price.
  if (current && current.price === 0 && /\d+\s*(?:টন|ton)|কাজে|kaje|বানাব|banabo|কাটব|katbo|use/i.test(rest)) {
    state.order = { step: "name", slug: current.slug, qty: 1 };
    return out(say(lang, `বুঝেছি, ধন্যবাদ 👍 আপনার জন্য সঠিক দামটা মালিক নিজে জানাবেন। আপনার নামটা বলবেন?`,
      `Bujhechi, dhonnobad 👍 Apnar jonno exact dam ta malik nije janaben. Apnar nam ta bolben?`,
      `Got it, thanks 👍 The owner will give you the exact price personally. May I have your name?`));
  }

  // 9. Owner's notes, then common questions.
  const notes = fromNotes(rest, knowledge);
  if (notes) return out(hello + notes);
  const faq = faqs(site).find(([re]) => re.test(rest));
  if (faq) return out(hello + faq[1](lang));

  // 10. Prices / catalogue in general.
  const priced = catalog.products.filter((p) => p.price > 0);
  if (PRICE.test(rest)) {
    const list = priced.slice(0, 6).map((p) => `• ${nameOf(p, lang)} — ${priceText(p.price)}/${unitOf(p, lang)}`).join("\n");
    return out(hello + say(lang, `কোনটার দাম জানতে চান বলুন তো? কয়েকটার দাম:\n${list}\nপাওয়ার প্রেসের দাম টনেজ অনুযায়ী হয় — কত টনের লাগবে জানালে বলে দেব।`,
      `Kon ta-r dam jante chan bolen to? Koyekta-r dam:\n${list}\nPower press er dam tonnage onujayi hoy — koto ton lagbe janale bole dibo.`,
      `Which one would you like the price for? Some prices:\n${list}\nPower press prices depend on tonnage — tell me the tonnage and I'll let you know.`));
  }
  if (LIST.test(rest)) {
    const cats = catalog.categories.map((c) => `• ${lang === "bn" ? c.nameBn : c.name}: /category/${c.slug}`).join("\n");
    return out(hello + say(lang, `আমাদের কারখানায় যা যা তৈরি হয়:\n${cats}\nকোনটা নিয়ে জানতে চান?`, `Amader karkhanay ja ja toiri hoy:\n${cats}\nKonta niye jante chan?`, `Here's what we make:\n${cats}\nWhich would you like to know about?`));
  }

  // 11. Didn't understand.
  state.misses = (state.misses ?? 0) + 1;
  if (state.misses >= 2) {
    state.misses = 0;
    return out(say(lang, `দুঃখিত, আমি ঠিক বুঝে উঠতে পারছি না 🙏 আমাদের টিমের সাথে সরাসরি কথা বললে দ্রুত সমাধান হবে — কল বা WhatsApp করুন ${site.phone}। অথবা আপনার নম্বরটা দিন, আমরাই কল করব।`,
      `Dukkhito, ami thik bujhe uthte parchi na 🙏 Amader team er sathe direct kotha bolle taratari hobe — call ba WhatsApp korun ${site.phone}. Othoba apnar number ta din, amrai call korbo.`,
      `Sorry, I'm not quite getting it 🙏 Our team can help faster — call or WhatsApp ${site.phone}, or share your number and we'll call you.`));
  }
  return out(hello + say(lang, `দুঃখিত, প্রশ্নটা ঠিক বুঝিনি 🙏 একটু অন্যভাবে লিখবেন? যেমন: "এসি স্ট্যান্ডের দাম", "বউ বডি প্রেস", "অর্ডার করতে চাই" বা "ঠিকানা"।`,
    `Dukkhito, proshno ta thik bujhini 🙏 Ektu onnobhabe likhben? Jemon: "AC stand er dam", "bou body press", "order korte chai" ba "thikana".`,
    `Sorry, I didn't quite get that 🙏 Could you put it another way? For example: "AC stand price", "bou body press", "I want to order" or "address".`));
}

// ── Order flow ──
const placeOf = (d: OrderDraft) => (d.address && districtIn(d.address) === d.district ? d.address : `${d.address}, ${d.district}`);
function nextPrompt(d: OrderDraft, input: AssistantInput, lang: Lang, state: BotState): string {
  const p = input.catalog.products.find((x) => x.slug === d.slug);
  if (!p) {
    d.step = "product";
    const listed = (state.candidates ?? []).map((sl) => input.catalog.products.find((x) => x.slug === sl)).filter((x): x is Product => !!x);
    const opts = (listed.length ? listed : input.catalog.products.filter((x) => x.price > 0)).slice(0, 6).map((x) => `• ${nameOf(x, lang)} — ${priceText(x.price)}`).join("\n");
    return say(lang, `জি, অবশ্যই 😊 কোন প্রোডাক্টটা নিতে চান? নাম লিখুন — যেমন:\n${opts}\nবা "বউ বডি প্রেস", "চ্যানেল বডি প্রেস"।`,
      `Ji, obosshoi 😊 Kon product ta nite chan? Nam likhun — jemon:\n${opts}\nba "bou body press", "channel body press".`,
      `Sure 😊 Which product would you like? Type its name — for example:\n${opts}\nor "bou body press", "channel body press".`);
  }
  if (!d.qty && (p.price === 0 || p.category === "power-press")) d.qty = 1; // machines: one unless the customer says more
  if (!d.qty) {
    d.step = "qty";
    const u = unitOf(p, lang);
    const unitWord = ["টি", "ta", "unit"].includes(u) ? "" : ` ${u}`;
    return say(lang, `${nameOf(p, lang)} — কয়টা${unitWord} লাগবে?`, `${nameOf(p, lang)} — koyta${unitWord} lagbe?`, `${nameOf(p, lang)} — how many${unitWord ? `${unitWord}s` : ""} do you need?`);
  }
  if (!d.name) {
    d.step = "name";
    return say(lang, `অর্ডারটা কার নামে হবে? আপনার নামটা লিখুন।`, `Order ta kar name e hobe? Apnar nam ta likhun.`, `Whose name should the order be under?`);
  }
  if (!d.phone) {
    d.step = "phone";
    return say(lang, `আপনার মোবাইল নম্বরটা দিন — আমাদের টিম এই নম্বরে কল করে কনফার্ম করবে।`, `Apnar mobile number ta din — amader team ei number e call kore confirm korbe.`, `Your mobile number, please — our team will call it to confirm.`);
  }
  if (p.price === 0) return ""; // call-for-price: name + phone is enough (saved as a lead)
  if (!d.address) {
    d.step = "address";
    return say(lang, `ডেলিভারির ঠিকানাটা লিখুন (এলাকা, থানা, জেলা)।`, `Delivery r thikana ta likhun (elaka, thana, jela).`, `Your delivery address, please (area, thana, district).`);
  }
  if (!d.district) {
    d.step = "district";
    return say(lang, `কোন জেলায় পাঠাতে হবে?`, `Kon jelay pathate hobe?`, `Which district should we deliver to?`);
  }
  d.step = "confirm";
  const total = p.price * d.qty;
  return say(lang,
    `একবার মিলিয়ে নিন 👇\n📦 ${p.nameBn} × ${d.qty} ${unitOf(p, lang)}\n💰 মোট: ${priceText(total)}\n👤 ${d.name}\n📞 ${d.phone}\n📍 ${placeOf(d)}\n\nসব ঠিক থাকলে "হ্যাঁ" লিখুন। কিছু বদলাতে চাইলে বলুন (যেমন "নম্বর বদলাব")।`,
    `Ekbar miliye nin 👇\n📦 ${p.name} × ${d.qty} ${unitOf(p, lang)}\n💰 Mot: ${priceText(total)}\n👤 ${d.name}\n📞 ${d.phone}\n📍 ${placeOf(d)}\n\nShob thik thakle "ha" likhun. Kichu bodlate chaile bolen (jemon "number bodlabo").`,
    `Please check 👇\n📦 ${p.name} × ${d.qty} ${unitOf(p, lang)}\n💰 Total: ${priceText(total)}\n👤 ${d.name}\n📞 ${d.phone}\n📍 ${placeOf(d)}\n\nIf everything is right, type "yes". To change something, tell me (e.g. "change number").`);
}

async function continueOrder(text: string, raw: string, state: BotState, input: AssistantInput, lang: Lang, seed: number): Promise<AssistantReply | null> {
  const d = state.order!;
  const out = (t: string, extra: Partial<AssistantReply> = {}): AssistantReply => ({ text: t, state, ...extra });
  const { catalog, site } = input;

  if (CANCEL.test(text) && d.step !== "confirm") {
    state.order = undefined;
    return out(say(lang, `ঠিক আছে, অর্ডারটা বাতিল করলাম। আর কিছু জানতে চাইলে বলুন 😊`, `Thik ache, order ta batil korlam. Ar kichu jante chaile bolen 😊`, `Okay, I've cancelled the order. Anything else I can help with? 😊`));
  }

  // Side question in the middle of the order: answer it, then ask the pending step again.
  const p0 = catalog.products.find((x) => x.slug === d.slug);
  const sideFaq = faqs(site).find(([re]) => re.test(text));
  const answersStep =
    (d.step === "qty" && qtyIn(text)) || (d.step === "phone" && phoneIn(text)) || (d.step === "district" && districtIn(text)) ||
    (d.step === "confirm" && (YES.test(text) || NO.test(text))) || (d.step === "product" && findProducts(text, catalog).length);
  if (!answersStep && (QUESTION.test(text) || sideFaq) && d.step !== "address" && d.step !== "name") {
    const ans = sideFaq ? sideFaq[1](lang) : PRICE.test(text) && p0 ? aboutProduct(p0, lang, seed) : null;
    if (ans) return out(`${ans}\n\n${nextPrompt(d, input, lang, state)}`);
  }

  switch (d.step) {
    case "product": {
      const found = narrow(findProducts(text, catalog), state);
      if (!found.length) {
        const q = qtyIn(text);
        if (q) d.qty = q;
        const ph = phoneIn(text);
        if (ph) d.phone = ph.phone;
        if (q || ph || nameIn(text)) return out(say(lang, `ঠিক আছে 👍 আগে বলুন কোন প্রোডাক্টটা নেবেন?`, `Thik ache 👍 Age bolen kon product ta niben?`, `Okay 👍 First, which product would you like?`) + "\n" + nextPrompt(d, input, lang, state).split("\n").slice(1).join("\n"));
        return null; // something else: the normal flow answers (the order stays open)
      }
      if (!isClear(found)) {
        state.candidates = found.slice(0, 6).map((x) => x.p.slug);
        const list = found.slice(0, 5).map(({ p }) => `• ${nameOf(p, lang)} — ${priceText(p.price)}`).join("\n");
        return out(say(lang, `কোনটা নেবেন?\n${list}`, `Konta niben?\n${list}`, `Which one?\n${list}`));
      }
      d.slug = found[0].p.slug;
      state.product = d.slug;
      state.candidates = undefined;
      const q = qtyIn(text);
      if (q) d.qty = q;
      break;
    }
    case "qty": {
      const q = qtyIn(text);
      if (!q) return out(say(lang, `কয়টা লাগবে সংখ্যায় লিখুন (যেমন 2 বা ১০)।`, `Koyta lagbe shonkhay likhun (jemon 2 ba 10).`, `Please type the quantity as a number (e.g. 2 or 10).`));
      d.qty = q;
      break;
    }
    case "name": {
      const ph = phoneIn(text);
      if (ph) d.phone = ph.phone;
      const n = nameIn(ph ? text.replace(ph.raw, " ") : text);
      if (!n) return out(say(lang, `আপনার নামটা লিখুন প্লিজ।`, `Apnar nam ta likhun please.`, `Please type your name.`));
      d.name = n;
      break;
    }
    case "phone": {
      const ph = phoneIn(text);
      if (!ph) return out(say(lang, `নম্বরটা ঠিক মনে হচ্ছে না 🙏 ১১ সংখ্যার মোবাইল নম্বর লিখুন (যেমন 017XXXXXXXX)।`, `Number ta thik mone hocche na 🙏 11 digit er mobile number likhun (jemon 017XXXXXXXX).`, `That number doesn't look right 🙏 Please type an 11-digit mobile number (like 017XXXXXXXX).`));
      d.phone = ph.phone;
      break;
    }
    case "address": {
      const a = raw.replace(/\s+/g, " ").trim();
      if (a.length < 5) return out(say(lang, `ঠিকানাটা আরেকটু বিস্তারিত লিখুন (এলাকা, থানা, জেলা)।`, `Thikana ta arektu bistarito likhun (elaka, thana, jela).`, `Please write the address in a bit more detail (area, thana, district).`));
      d.address = a.slice(0, 300);
      d.district = d.district ?? districtIn(a);
      break;
    }
    case "district": {
      const dist = districtIn(text);
      if (!dist) return out(say(lang, `জেলার নামটা লিখুন (যেমন ঢাকা, গাজীপুর, চট্টগ্রাম)।`, `Jelar nam ta likhun (jemon Dhaka, Gazipur, Chattogram).`, `Please type the district (e.g. Dhaka, Gazipur, Chattogram).`));
      d.district = dist;
      break;
    }
    case "confirm": {
      const p = catalog.products.find((x) => x.slug === d.slug);
      if (!p) {
        state.order = undefined;
        return null;
      }
      if (YES.test(text)) return await finishOrder(state, input, lang, p);
      // Change something?
      if (/নাম|name|nam\b/i.test(text)) d.name = undefined;
      else if (/নম্বর|নাম্বার|number|phone|mobile|মোবাইল/i.test(text)) d.phone = undefined;
      else if (/ঠিকানা|address|thikana/i.test(text)) d.address = d.district = undefined;
      else if (/জেলা|district|jela/i.test(text)) d.district = undefined;
      else if (/পরিমাণ|কয়টা|qty|quantity|koyta|পিস|সেট|set|pis/i.test(text) || qtyIn(text)) {
        const q = qtyIn(text);
        if (q) d.qty = q;
        else d.qty = undefined;
      } else if (NO.test(text) || CANCEL.test(text)) {
        state.order = undefined;
        return out(say(lang, `ঠিক আছে, অর্ডারটা করলাম না। মত বদলালে যেকোনো সময় জানাবেন 😊`, `Thik ache, order ta korlam na. Mot bodlale je kono somoy janaben 😊`, `Okay, I haven't placed it. Let me know any time if you change your mind 😊`));
      } else return out(say(lang, `সব ঠিক থাকলে "হ্যাঁ" লিখুন, বা কী বদলাতে চান বলুন (নাম / নম্বর / ঠিকানা / পরিমাণ)।`, `Shob thik thakle "ha" likhun, ba ki bodlate chan bolen (nam / number / thikana / poriman).`, `Type "yes" if everything is right, or tell me what to change (name / number / address / quantity).`));
      break;
    }
  }

  const p = catalog.products.find((x) => x.slug === d.slug);
  // Call-for-price product: once we have a name and number, it's a call-back request with the details.
  if (p && p.price === 0 && d.name && d.phone) {
    state.order = undefined;
    const lead: LeadInput = { name: d.name, phone: d.phone, interest: `${d.generic ? "Power press" : p.name}${d.qty && d.qty > 1 ? ` × ${d.qty}` : ""}${d.note ? ` — ${d.note}` : ""} — দাম জানতে চেয়েছেন`.slice(0, 200) };
    return out(say(lang, `ধন্যবাদ ${d.name} 🙏 আপনার তথ্য নিয়ে নিলাম। ${d.generic ? "আপনার দরকারি প্রেসের" : `${p.nameBn}-এর`} সঠিক দাম জানাতে আমাদের টিম শিগগিরই ${d.phone} নম্বরে কল করবে।`,
      `Dhonnobad ${d.name} 🙏 Apnar tottho niye nilam. ${d.generic ? "Apnar dorkari press er" : `${p.name} er`} exact dam janate amader team shiggiri ${d.phone} number e call korbe.`,
      `Thank you, ${d.name} 🙏 I've noted your details. Our team will call ${d.phone} soon with the exact price${d.generic ? "" : ` of the ${p.name}`}.`), { lead });
  }
  return out(nextPrompt(d, input, lang, state));
}

async function finishOrder(state: BotState, input: AssistantInput, lang: Lang, p: Product): Promise<AssistantReply> {
  const d = state.order!;
  const out = (t: string, extra: Partial<AssistantReply> = {}): AssistantReply => ({ text: t, state, ...extra });
  const placed = await placeOrder(
    { name: d.name!, phone: d.phone!, address: d.address!, district: d.district!, payment: "cod_booking", items: [{ slug: p.slug, qty: d.qty! }], note: input.channel === "messenger" ? "Facebook Messenger থেকে অর্ডার" : "ওয়েবসাইট চ্যাট থেকে অর্ডার", source: input.channel === "messenger" ? "messenger" : "chatbot" },
    { withCustomer: input.channel === "web" },
  ).catch((e) => {
    console.error("Chat order failed", e instanceof Error ? e.message : e);
    return null;
  });
  state.order = undefined;
  if (!placed) {
    const lead: LeadInput = { name: d.name!, phone: d.phone!, interest: `অর্ডার: ${p.name} × ${d.qty} — ${d.address}, ${d.district}` };
    return out(say(lang, `দুঃখিত, এই মুহূর্তে অর্ডারটা সিস্টেমে তুলতে পারলাম না 🙏 তবে আপনার তথ্য রেখে দিয়েছি, আমাদের টিম ${d.phone} নম্বরে কল করে অর্ডার নিয়ে নেবে।`,
      `Dukkhito, ei muhurte order ta system e tulte parlam na 🙏 Tobe apnar tottho rekhe diyechi, amader team ${d.phone} number e call kore order niye nibe.`,
      `Sorry, I couldn't put the order into the system just now 🙏 I've kept your details and our team will call ${d.phone} to take it.`), { lead });
  }
  return out(
    say(lang,
      `আলহামদুলিল্লাহ, আপনার অর্ডার নেওয়া হয়েছে ✅\nইনভয়েস: ${placed.id}\nমোট: ${priceText(placed.total)}\nআমাদের টিম শিগগিরই ${d.phone} নম্বরে কল করে কনফার্ম করবে, তখন অগ্রিম আর ডেলিভারির বিষয়টা জানিয়ে দেবে।\nঅর্ডারের অবস্থা দেখুন: /track?q=${placed.id}`,
      `Alhamdulillah, apnar order neya hoyeche ✅\nInvoice: ${placed.id}\nMot: ${priceText(placed.total)}\nAmader team shiggiri ${d.phone} number e call kore confirm korbe, tokhon advance ar delivery r bishoy ta janiye dibe.\nOrder er obostha dekhun: /track?q=${placed.id}`,
      `Your order has been placed ✅\nInvoice: ${placed.id}\nTotal: ${priceText(placed.total)}\nOur team will call ${d.phone} soon to confirm it and explain the advance and delivery.\nTrack it here: /track?q=${placed.id}`),
    { orderId: placed.id },
  );
}

// ── Order status ──
async function trackReply(by: { id: string } | { phone: string }, lang: Lang, site: SiteInfo) {
  const order = "id" in by ? await db.order.findUnique({ where: { id: by.id } }) : await db.order.findFirst({ where: { phone: by.phone }, orderBy: { createdAt: "desc" } });
  if (!order) {
    return say(lang, `এই তথ্যে কোনো অর্ডার খুঁজে পেলাম না 🙏 নম্বর/ইনভয়েসটা আরেকবার মিলিয়ে দেখবেন? দরকার হলে কল করুন ${site.phone}।`,
      `Ei totthe kono order khuje pelam na 🙏 Number/invoice ta arekbar miliye dekhben? Dorkar hole call korun ${site.phone}.`,
      `I couldn't find an order with that 🙏 Could you double-check the number or invoice? You can also call ${site.phone}.`);
  }
  const step = factorySteps.find((s) => s.key === order.status) ?? factorySteps[0];
  const n = factorySteps.findIndex((s) => s.key === step.key) + 1;
  const date = order.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Dhaka" });
  return say(lang,
    `পেয়েছি 👍 অর্ডার ${order.id} (${date})\nএখনকার অবস্থা: ধাপ ${n}/${factorySteps.length} — ${step.title}\nবিস্তারিত: /track?q=${order.id}`,
    `Peyechi 👍 Order ${order.id} (${date})\nEkhonkar obostha: step ${n}/${factorySteps.length} — ${step.en}\nBistarito: /track?q=${order.id}`,
    `Found it 👍 Order ${order.id} (${date})\nCurrent status: step ${n}/${factorySteps.length} — ${step.en}\nDetails: /track?q=${order.id}`);
}
