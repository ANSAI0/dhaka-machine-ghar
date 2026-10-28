import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { amountDue, onlinePaymentEnabled, startPayment } from "@/lib/sslcommerz";

// POST { orderId } → { url } of the SSLCommerz payment page for the amount still due.
export async function POST(req: Request) {
  if (!onlinePaymentEnabled()) return NextResponse.json({ error: "Online payment is not available yet" }, { status: 503 });
  const { orderId } = (await req.json().catch(() => ({}))) as { orderId?: string };
  const order = typeof orderId === "string" ? await db.order.findUnique({ where: { id: orderId }, include: { customer: { select: { email: true } } } }) : null;
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (amountDue(order) <= 0) return NextResponse.json({ error: "This order has nothing to pay online" }, { status: 409 });
  try {
    return NextResponse.json({ url: await startPayment(order, order.customer?.email ?? null) });
  } catch (e) {
    console.error("SSLCommerz init failed", e);
    return NextResponse.json({ error: "Payment gateway is busy — please try again or call us" }, { status: 502 });
  }
}
