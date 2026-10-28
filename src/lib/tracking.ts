// The 6-step factory workflow from the blueprint. Admin moves orders along these (step 8).
export const factorySteps = [
  { key: "registered", title: "অর্ডার ও রিকুইজিশন রেজিস্টার", en: "Order & Requisition Registered", detail: "অর্ডার গ্রহণ করে ডিজাইন ইউনিটে পাঠানো হয়েছে" },
  { key: "fabrication", title: "স্টিল স্ট্রাকচার ও ফেব্রিকেশন", en: "Steel Structure & Fabrication", detail: "চেসিস কাটিং ও ওয়েল্ডিং চলছে" },
  { key: "motor_panel", title: "মোটর, গিয়ার ও প্যানেল সেটিং", en: "Motor, Gear & Panel Setting", detail: "ইলেকট্রিক্যাল কন্ট্রোল ও মোটর বসানো হচ্ছে" },
  { key: "load_test", title: "লোড টেস্ট ও কোয়ালিটি চেক", en: "Load Test & Quality Check", detail: "ট্রায়াল রান ও ইঞ্জিনিয়ার পরিদর্শন" },
  { key: "painting", title: "ইন্ডাস্ট্রিয়াল পেইন্টিং ও ফিনিশিং", en: "Industrial Painting & Finishing", detail: "অ্যান্টি-রাস্ট কোটিং ও হেভি-ডিউটি প্যাকিং" },
  { key: "handover", title: "ট্রান্সপোর্ট / কুরিয়ারে হস্তান্তর", en: "Handover to Transport / Courier", detail: "গেটপাস ও চালান সহ মেশিন পাঠানো হয়েছে" },
] as const;

export type StepKey = (typeof factorySteps)[number]["key"];
export const stepIndex = (k: StepKey) => factorySteps.findIndex((s) => s.key === k);

// What the public tracking portal may see — no address, masked phone & name.
export type PublicOrder = {
  id: string;
  createdAt: string;
  status: StepKey;
  history: { step: StepKey; at: string; note?: string }[];
  items: { slug: string; name: string; qty: number; price: number }[];
  total: number;
  district: string;
  name: string;
  phone: string;
  docs?: { invoice: string; challan?: string }; // only when looked up by invoice number
};

export const maskPhone = (p: string) => (p.length >= 11 ? `${p.slice(0, 3)}****${p.slice(-4)}` : "****");
export const maskName = (n: string) => n.split(/\s+/).map((w, i) => (i === 0 ? w : `${w[0]}.`)).join(" ");

// ── Warranty ────────────────────────────────────────────────
export function warrantyStatus(w: { purchasedAt: Date | string; months: number }, now = new Date()) {
  const expires = new Date(w.purchasedAt);
  expires.setMonth(expires.getMonth() + w.months);
  return { expires, active: now <= expires };
}

export const normalizeSerial = (s: string) => s.trim().toUpperCase().replace(/\s+/g, "");

export const serviceIssues = ["মেশিন চালু হচ্ছে না", "অস্বাভাবিক শব্দ / কম্পন", "ক্লাচ / ব্রেক সমস্যা", "মোটর / ইলেকট্রিক্যাল সমস্যা", "হাইড্রোলিক লিক", "নিয়মিত সার্ভিসিং", "অন্যান্য"];
