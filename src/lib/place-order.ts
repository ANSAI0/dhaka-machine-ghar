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
import { notifyOrderPlaced } from "./sms";

// Creates an order from validated input (website checkout, order forms and the chat assistant).
// Prices always come from the database. Sends the owner/customer alerts after the response.
export async function placeOrder(input: OrderInput, opts: { withCustomer?: boolean } = { withCustomer: true }) {
  // Price from the database, never from the client.
  const products = await db.product.findMany({ where: { slug: { in: input.items.map((i) => i.slug) }, active: true }, include: { offers: liveOfferInclude() } });
  const lines = input.items.map((i) => ({ qty: i.qty, product: products.find((p) => p.slug === i.slug) }));
  if (lines.some((l) => !l.product)) return null;
  const total = lines.reduce((s, l) => s + effectivePrice(l.product!) * l.qty, 0);
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
          items: { create: lines.map((l) => ({ productId: l.product!.id, slug: l.product!.slug, name: l.product!.name, qty: l.qty, price: effectivePrice(l.product!) })) },
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
