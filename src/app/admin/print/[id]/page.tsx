import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSite } from "@/lib/settings";
import { OrderDocument, type DocKind } from "@/components/order-document";

type P = { params: Promise<{ id: string }>; searchParams: Promise<{ doc?: string }> };

export const metadata: Metadata = { title: "Print", robots: { index: false } };

// Outside the (panel) layout so only the document prints.
export default async function PrintPage({ params, searchParams }: P) {
  await requireAdmin();
  const [{ id }, { doc }] = await Promise.all([params, searchParams]);
  const kind: DocKind = doc === "gatepass" || doc === "challan" ? doc : "invoice";
  const [order, site] = await Promise.all([db.order.findUnique({ where: { id }, include: { items: true, warranties: true } }), getSite()]);
  if (!order) notFound();
  return <OrderDocument order={order} site={site} kind={kind} />;
}
