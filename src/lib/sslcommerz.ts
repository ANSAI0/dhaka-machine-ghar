import "server-only";
import { randomBytes } from "node:crypto";
import type { Order } from "@prisma/client";
import { db } from "./db";
import { mailPaymentReceived } from "./order-mail";
import { siteUrl } from "./url";

// SSLCommerz hosted checkout (bKash, Nagad, Rocket, cards, net banking).
// Env: SSLCZ_STORE_ID, SSLCZ_STORE_PASSWORD, and SSLCZ_LIVE=true once the live store is approved
// (otherwise the sandbox is used).
const store = () => {
  const id = process.env.SSLCZ_STORE_ID;
  const pass = process.env.SSLCZ_STORE_PASSWORD;
  return id && pass ? { id, pass } : null;
};
const host = () => (process.env.SSLCZ_LIVE === "true" ? "https://securepay.sslcommerz.com" : "https://sandbox.sslcommerz.com");

export const onlinePaymentEnabled = () => store() !== null;

// Amount still to be paid online for this order (the booking amount, or the balance of it).
export const amountDue = (o: Pick<Order, "payNow" | "paidAmount">) => Math.max(0, o.payNow - o.paidAmount);

// Starts a gateway session and returns the page to send the customer to.
export async function startPayment(order: Order, email: string | null): Promise<string> {
  const s = store();
  if (!s) throw new Error("Online payment is not set up");
  const amount = amountDue(order);
  if (amount <= 0) throw new Error("Nothing to pay");

  const tranId = `${order.id}-${randomBytes(3).toString("hex")}`;
  await db.order.update({ where: { id: order.id }, data: { tranId } });

  const back = `${siteUrl()}/api/payments/sslcommerz`;
  const body = new URLSearchParams({
    store_id: s.id,
    store_passwd: s.pass,
    total_amount: amount.toFixed(2),
    currency: "BDT",
    tran_id: tranId,
    success_url: `${back}/return?result=success`,
    fail_url: `${back}/return?result=fail`,
    cancel_url: `${back}/return?result=cancel`,
    ipn_url: `${back}/ipn`,
    cus_name: order.name,
    cus_email: email || "customer@dhakamachineghar.com",
    cus_phone: order.phone,
    cus_add1: order.address,
    cus_city: order.district,
    cus_country: "Bangladesh",
    shipping_method: "NO",
    num_of_item: "1",
    product_name: `Machine order ${order.id}`,
    product_category: "Industrial machinery",
    product_profile: "general",
    value_a: order.id,
  });
  const res = await fetch(`${host()}/gwprocess/v4/api.php`, { method: "POST", body, signal: AbortSignal.timeout(20000) });
  const data = (await res.json().catch(() => ({}))) as { status?: string; GatewayPageURL?: string; failedreason?: string };
  if (data.status !== "SUCCESS" || !data.GatewayPageURL) throw new Error(data.failedreason || "Payment gateway is not responding");
  return data.GatewayPageURL;
}

type Validation = { status?: string; tran_id?: string; amount?: string; currency?: string; card_type?: string; value_a?: string };

// Confirms a payment with SSLCommerz's validation API (never trust the browser's POST alone)
// and records it on the order. Safe to call twice (return URL + IPN).
export async function confirmPayment(valId: string): Promise<{ orderId: string | null; paid: boolean }> {
  const s = store();
  if (!s || !valId) return { orderId: null, paid: false };
  const q = new URLSearchParams({ val_id: valId, store_id: s.id, store_passwd: s.pass, format: "json" });
  const res = await fetch(`${host()}/validator/api/validationserverAPI.php?${q}`, { signal: AbortSignal.timeout(20000) });
  const v = (await res.json().catch(() => ({}))) as Validation;
  if (!v.tran_id) return { orderId: null, paid: false };

  const order = await db.order.findUnique({ where: { tranId: v.tran_id } });
  if (!order) return { orderId: null, paid: false };
  if (order.paymentStatus === "paid") return { orderId: order.id, paid: true };

  const amount = Math.round(Number(v.amount ?? 0));
  const ok = (v.status === "VALID" || v.status === "VALIDATED") && v.currency === "BDT" && amount >= amountDue(order);
  await db.order.update({
    where: { id: order.id },
    data: ok
      ? { paymentStatus: "paid", paidAmount: order.paidAmount + amount, paidAt: new Date(), payMethod: v.card_type ?? null }
      : { paymentStatus: "failed" },
  });
  if (ok) await mailPaymentReceived(order.id);
  return { orderId: order.id, paid: ok };
}

// Marks the latest attempt failed (customer cancelled or the gateway declined) without a val_id.
export async function markFailed(tranId: string) {
  const order = await db.order.findUnique({ where: { tranId } });
  if (order && order.paymentStatus !== "paid") await db.order.update({ where: { id: order.id }, data: { paymentStatus: "failed" } });
  return order?.id ?? null;
}
