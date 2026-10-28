import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { verifyDocToken } from "@/lib/doc-token";
import { getSite } from "@/lib/settings";
import { OrderDocument } from "@/components/order-document";

type P = { params: Promise<{ id: string }>; searchParams: Promise<{ doc?: string; t?: string }> };

export const metadata: Metadata = { title: "Order document", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// Customer copy of the invoice / delivery challan, opened from the signed link in SMS or tracking.
export default async function CustomerDocPage({ params, searchParams }: P) {
  const [{ id }, { doc, t }] = await Promise.all([params, searchParams]);
  if (!verifyDocToken(id, t)) notFound();
  const [order, site] = await Promise.all([db.order.findUnique({ where: { id }, include: { items: true, warranties: true } }), getSite()]);
  if (!order) notFound();
  // The challan only exists once the machine has been handed over.
  const kind = doc === "challan" && order.status === "handover" ? "challan" : "invoice";
  return <OrderDocument order={order} site={site} kind={kind} />;
}
