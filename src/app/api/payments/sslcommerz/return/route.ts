import { NextResponse } from "next/server";
import { confirmPayment, markFailed } from "@/lib/sslcommerz";
import { siteUrl } from "@/lib/url";

// SSLCommerz sends the customer's browser back here (form POST) after success / failure / cancel.
// Success is only trusted after the server-side validation in confirmPayment().
export async function POST(req: Request) {
  const result = new URL(req.url).searchParams.get("result");
  const form = await req.formData().catch(() => null);
  const valId = String(form?.get("val_id") ?? "");
  const tranId = String(form?.get("tran_id") ?? "");

  let orderId: string | null = null;
  let status = result === "cancel" ? "cancelled" : "failed";
  if (result === "success" && valId) {
    const r = await confirmPayment(valId);
    orderId = r.orderId;
    if (r.paid) status = "paid";
  }
  if (status !== "paid" && tranId) orderId = (await markFailed(tranId)) ?? orderId;

  const to = new URL("/payment", siteUrl());
  if (orderId) to.searchParams.set("order", orderId);
  to.searchParams.set("status", status);
  return NextResponse.redirect(to, 303);
}
