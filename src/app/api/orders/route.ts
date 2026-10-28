import { after, NextResponse } from "next/server";
import { sendCapiEvent } from "@/lib/capi";
import { getCustomer } from "@/lib/customer-auth";
import { effectivePrice, liveOfferInclude } from "@/lib/offers";
import { notifyOrderPlaced } from "@/lib/sms";
import { db, withUniqueId } from "@/lib/db";
import { makeId } from "@/lib/ids";
import { normalizePhone, validateOrder, type OrderInput } from "@/lib/orders";
import { getSite } from "@/lib/settings";
import { onlinePaymentEnabled } from "@/lib/sslcommerz";

export async function POST(req: Request) {
  let body: Partial<OrderInput>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const errors = validateOrder(body);
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 422 });
  const input = body as OrderInput;

  // Price from the database, never from the client.
  const products = await db.product.findMany({ where: { slug: { in: input.items.map((i) => i.slug) }, active: true }, include: { offers: liveOfferInclude() } });
  const lines = input.items.map((i) => ({ qty: i.qty, product: products.find((p) => p.slug === i.slug) }));
  if (lines.some((l) => !l.product)) return NextResponse.json({ errors: { items: "Unknown product" } }, { status: 422 });
  const total = lines.reduce((s, l) => s + effectivePrice(l.product!) * l.qty, 0);
  const { advancePercent } = await getSite();
  const advance = input.payment === "full" ? total : Math.round((total * advancePercent) / 100);
  const payNow = input.payment === "cod_booking" ? 0 : advance;
  const customer = await getCustomer();

  const order = await withUniqueId(
    () => makeId("DMG"),
    (id) =>
      db.order.create({
        data: {
          id,
          name: input.name.trim(),
          phone: normalizePhone(input.phone),
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
  return NextResponse.json({ id: order.id, total, payNow, payOnline: onlinePaymentEnabled() && payNow > 0 }, { status: 201 });
}
