import { NextResponse } from "next/server";
import { confirmPayment } from "@/lib/sslcommerz";

// Instant Payment Notification: SSLCommerz calls this server-to-server, so a payment is recorded
// even if the customer closes the browser before returning to the site.
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const valId = String(form?.get("val_id") ?? "");
  if (valId) await confirmPayment(valId);
  return NextResponse.json({ ok: true });
}
