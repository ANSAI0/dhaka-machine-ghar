import { NextResponse } from "next/server";
import { validateOrder, type OrderInput } from "@/lib/orders";
import { placeOrder } from "@/lib/place-order";
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

  const placed = await placeOrder(input);
  if (!placed) return NextResponse.json({ errors: { items: "Unknown product" } }, { status: 422 });
  const { id, total, payNow } = placed;
  return NextResponse.json({ id, total, payNow, payOnline: onlinePaymentEnabled() && payNow > 0 }, { status: 201 });
}
