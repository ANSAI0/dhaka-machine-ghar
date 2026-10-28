import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { customerDocUrl } from "@/lib/doc-token";
import { isValidBDPhone, normalizePhone } from "@/lib/orders";
import { maskName, maskPhone, type PublicOrder } from "@/lib/tracking";

// GET /api/track?q=<invoice id | phone>
export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ error: "ইনভয়েস বা মোবাইল নম্বর দিন" }, { status: 400 });

  let where: Prisma.OrderWhereInput;
  const byInvoice = /^DMG-/i.test(q);
  if (byInvoice) where = { id: q.toUpperCase() };
  else if (isValidBDPhone(q)) where = { phone: normalizePhone(q) };
  else return NextResponse.json({ error: "সঠিক ইনভয়েস (DMG-…) বা মোবাইল নম্বর দিন" }, { status: 400 });

  const found = await db.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { items: true, events: { orderBy: { at: "asc" } } },
  });

  // Public view — no address, masked name & phone.
  const orders: PublicOrder[] = found.map((o) => ({
    id: o.id,
    createdAt: o.createdAt.toISOString(),
    status: o.status,
    history: o.events.map((e) => ({ step: e.step, at: e.at.toISOString(), note: e.note ?? undefined })),
    items: o.items.map((i) => ({ slug: i.slug, name: i.name, qty: i.qty, price: i.price })),
    total: o.total,
    district: o.district,
    name: maskName(o.name),
    phone: maskPhone(o.phone),
    // Documents show the delivery address, so only the invoice-number lookup gets them — not a phone lookup.
    docs: byInvoice ? { invoice: customerDocUrl(o.id, "invoice"), challan: o.status === "handover" ? customerDocUrl(o.id, "challan") : undefined } : undefined,
  }));
  return NextResponse.json({ orders });
}
