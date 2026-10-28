import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { maskName, maskPhone, normalizeSerial, warrantyStatus } from "@/lib/tracking";

// GET /api/warranty?serial=<serial>
export async function GET(req: Request) {
  const serial = normalizeSerial(new URL(req.url).searchParams.get("serial") ?? "");
  if (!serial) return NextResponse.json({ error: "সিরিয়াল নম্বর দিন" }, { status: 400 });

  const w = await db.warranty.findUnique({ where: { serial } });
  if (!w) return NextResponse.json({ found: false });

  const { expires, active } = warrantyStatus(w);
  return NextResponse.json({
    found: true,
    serial: w.serial,
    slug: w.slug,
    productName: w.productName,
    owner: maskName(w.owner),
    phone: maskPhone(w.phone),
    purchasedAt: w.purchasedAt.toISOString(),
    expiresAt: expires.toISOString(),
    months: w.months,
    active,
  });
}
