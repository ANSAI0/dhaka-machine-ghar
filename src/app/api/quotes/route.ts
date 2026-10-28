import { after, NextResponse } from "next/server";
import { sendCapiEvent } from "@/lib/capi";
import { getCatalog } from "@/lib/catalog-server";
import { db, withUniqueId } from "@/lib/db";
import { makeId } from "@/lib/ids";
import { normalizePhone } from "@/lib/orders";
import { validateQuote, type QuoteInput } from "@/lib/quotes";

export async function POST(req: Request) {
  let body: Partial<QuoteInput>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const errors = validateQuote(body, (await getCatalog()).categories);
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 422 });
  const q = body as QuoteInput;

  const quote = await withUniqueId(
    () => makeId("QT"),
    (id) =>
      db.quote.create({
        data: {
          id,
          name: q.name.trim(),
          phone: normalizePhone(q.phone),
          company: q.company?.trim() || null,
          district: q.district,
          machineType: q.machineType,
          capacity: q.capacity.trim(),
          quantity: q.quantity,
          details: q.details.trim(),
          budget: q.budget || null,
          contactBy: q.contactBy,
          productSlug: q.product || null,
        },
      }),
  );
  after(() => sendCapiEvent({ name: "Lead", eventId: quote.id, phone: quote.phone }));
  return NextResponse.json({ id: quote.id }, { status: 201 });
}
