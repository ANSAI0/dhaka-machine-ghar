// Shared order validation (used by the order form and the /api/orders route).

export type PaymentPlan = "advance" | "full" | "cod_booking";

export type OrderInput = {
  name: string;
  phone: string;
  email?: string;
  address: string;
  district: string;
  note?: string;
  payment: PaymentPlan;
  items: { slug: string; qty: number }[];
  source?: string; // e.g. "product-page", "landing", "checkout"
};

export const paymentLabels: Record<PaymentPlan, string> = {
  advance: "অগ্রিম বুকিং (bKash / Nagad / Bank)",
  full: "সম্পূর্ণ মূল্য পরিশোধ",
  cod_booking: "আগে কল করুন, পরে বুকিং",
};

export function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  return digits.startsWith("880") ? digits.slice(2) : digits;
}

export const isValidEmail = (raw: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim()) && raw.trim().length <= 120;

export const isValidBDPhone = (raw: string) => /^01[3-9]\d{8}$/.test(normalizePhone(raw));

export function validateOrder(o: Partial<OrderInput>): Partial<Record<keyof OrderInput, string>> {
  const e: Partial<Record<keyof OrderInput, string>> = {};
  if (!o.name || o.name.trim().length < 2) e.name = "আপনার নাম লিখুন";
  if (!o.phone || !isValidBDPhone(o.phone)) e.phone = "সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)";
  if (o.email && !isValidEmail(o.email)) e.email = "সঠিক ইমেইল দিন অথবা খালি রাখুন";
  if (!o.address || o.address.trim().length < 5) e.address = "পূর্ণ ঠিকানা লিখুন";
  if (!o.district) e.district = "জেলা নির্বাচন করুন";
  if (!o.payment || !(o.payment in paymentLabels)) e.payment = "পেমেন্ট পদ্ধতি নির্বাচন করুন";
  if (!o.items?.length || o.items.some((i) => !i.slug || !Number.isInteger(i.qty) || i.qty < 1)) e.items = "অন্তত একটি মেশিন নির্বাচন করুন";
  return e;
}

export const districts = [
  "Dhaka", "Gazipur", "Narayanganj", "Narsingdi", "Munshiganj", "Manikganj", "Tangail", "Kishoreganj", "Faridpur", "Gopalganj",
  "Madaripur", "Rajbari", "Shariatpur", "Chattogram", "Cox's Bazar", "Cumilla", "Brahmanbaria", "Chandpur", "Feni", "Lakshmipur",
  "Noakhali", "Khagrachhari", "Rangamati", "Bandarban", "Rajshahi", "Bogura", "Joypurhat", "Naogaon", "Natore", "Chapainawabganj",
  "Pabna", "Sirajganj", "Khulna", "Bagerhat", "Chuadanga", "Jashore", "Jhenaidah", "Kushtia", "Magura", "Meherpur", "Narail",
  "Satkhira", "Barishal", "Barguna", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur", "Sylhet", "Habiganj", "Moulvibazar",
  "Sunamganj", "Rangpur", "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Thakurgaon",
  "Mymensingh", "Jamalpur", "Netrokona", "Sherpur",
];
