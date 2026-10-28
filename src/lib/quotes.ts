import type { Category } from "./catalog";
import { isValidBDPhone } from "./orders";

export type QuoteInput = {
  name: string;
  phone: string;
  company?: string;
  district: string;
  machineType: string; // category slug or "other"
  capacity: string; // e.g. "40 Ton", "8 ft bed"
  quantity: number;
  details: string;
  budget?: string;
  contactBy: "call" | "whatsapp";
  product?: string; // slug the visitor came from, if any
};

export const machineTypes = (categories: Category[]) => [
  ...categories.map((c) => ({ value: c.slug, label: `${c.name} (${c.nameBn})` })),
  { value: "other", label: "অন্যান্য / Other" },
];

export const budgetRanges = ["৳1 লাখের নিচে", "৳1–3 লাখ", "৳3–7 লাখ", "৳7–15 লাখ", "৳15 লাখের বেশি"];

export function validateQuote(q: Partial<QuoteInput>, categories: Category[]): Partial<Record<keyof QuoteInput, string>> {
  const e: Partial<Record<keyof QuoteInput, string>> = {};
  if (!q.name || q.name.trim().length < 2) e.name = "আপনার নাম লিখুন";
  if (!q.phone || !isValidBDPhone(q.phone)) e.phone = "সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)";
  if (!q.district) e.district = "জেলা নির্বাচন করুন";
  if (!q.machineType || !machineTypes(categories).some((m) => m.value === q.machineType)) e.machineType = "মেশিনের ধরন নির্বাচন করুন";
  if (!q.capacity || !q.capacity.trim()) e.capacity = "টনেজ / সাইজ লিখুন";
  if (!q.quantity || !Number.isInteger(q.quantity) || q.quantity < 1) e.quantity = "সংখ্যা দিন";
  if (!q.details || q.details.trim().length < 10) e.details = "কী কাজে ব্যবহার করবেন, সংক্ষেপে লিখুন (অন্তত ১০ অক্ষর)";
  if (q.contactBy !== "call" && q.contactBy !== "whatsapp") e.contactBy = "যোগাযোগের মাধ্যম নির্বাচন করুন";
  return e;
}
