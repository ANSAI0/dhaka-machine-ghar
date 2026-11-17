import "server-only";
import { after } from "next/server";
import { sendCapiEvent } from "./capi";
import { getCustomer } from "./customer-auth";
import { db, withUniqueId } from "./db";
import { makeId } from "./ids";
import { effectivePrice, liveOfferInclude } from "./offers";
import { mailOrderPlaced } from "./order-mail";
import { normalizePhone, type OrderInput } from "./orders";
import { getSite } from "./settings";
import { rateOf } from "./site";
import { notifyOrderPlaced } from "./sms";

// Creates an order from validated input (website checkout, order forms and the chat assistant).
// Prices always come from the database. Sends the owner/customer alerts after the response.
export type PlaceResult = { id: string; total: number; payNow: number } | { error: string };

export async function placeOrder(input: OrderInput, opts: { withCustomer?: boolean } = { withCustomer: true }): Promise<PlaceResult> {
  // Price from the database, never from the client.
  const products = await db.product.findMany({ where: { slug: { in: input.items.map((i) => i.slug) }, active: true }, include: { offers: liveOfferInclude() } });
  const found = input.items.map((i) => ({ qty: i.qty, kg: i.kg, product: products.find((p) => p.slug === i.slug) }));
  if (found.some((l) => !l.product)) return { error: "একটি পণ্য আর পাওয়া যাচ্ছে না — পেজটি রিফ্রেশ করুন।" };
  // Machines priced per kg: price = chosen weight × rate (the listed weight if none was chosen).
  const lines = found.map((l) => {
    const p = l.product!;
    const rate = rateOf({ specs: p.specs as [string, string][] });
    const listedKg = Number((p.specs as [string, string][]).find(([k]) => k === "Weight")?.[1].replace(/[^\d]/g, "")) || 0;
    const kg = rate ? l.kg ?? (listedKg || undefined) : undefined;
    const unit = rate && kg ? rate * kg : effectivePrice(p);
    return { qty: l.qty, product: p, kg, unit, name: kg ? `${p.name} (${kg.toLocaleString("en-IN")} kg)` : p.name };
  });
  const missing = lines.find((l) => rateOf({ specs: l.product.specs as [string, string][] }) && !l.kg);
  if (missing) return { error: `"${missing.product.name}" — কত কেজি ওজনের মেশিন চান লিখুন।` };
  const total = lines.reduce((s, l) => s + l.unit * l.qty, 0);
  const { advancePercent } = await getSite();
  const advance = input.payment === "full" ? total : Math.round((total * advancePercent) / 100);
  const payNow = input.payment === "cod_booking" ? 0 : advance;
  const customer = opts.withCustomer ? await getCustomer() : null;

  const order = await withUniqueId(
    () => makeId("DMG"),
    (id) =>
      db.order.create({
        data: {
          id,
          name: input.name.trim(),
          phone: normalizePhone(input.phone),
          email: input.email?.trim().toLowerCase() || customer?.email || null,
          address: input.address.trim(),
          district: input.district,
          note: input.note?.trim() || null,
          payment: input.payment,
          source: (input.source ?? "web").slice(0, 80),
          total,
          payNow,
          items: { create: lines.map((l) => ({ productId: l.product.id, slug: l.product.slug, name: l.name, qty: l.qty, price: l.unit })) },
          events: { create: [{ step: "registered" }] },
          customerId: customer?.id ?? null,
        },
      }),
  );

  after(() => sendCapiEvent({ name: "Purchase", eventId: order.id, phone: order.phone, value: total }));
  after(() => notifyOrderPlaced(order));
  after(() => mailOrderPlaced(order.id));
  return { id: order.id, total, payNow };
}
