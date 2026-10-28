"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSite } from "@/lib/settings";
import { notifyOrderStep } from "@/lib/sms";
import { factorySteps, type StepKey } from "@/lib/tracking";

export type StepState = { error?: string; ok?: string };

export async function setOrderStep(orderId: string, _: StepState, fd: FormData): Promise<StepState> {
  await requireAdmin();
  const step = String(fd.get("step") ?? "") as StepKey;
  const note = String(fd.get("note") ?? "").trim().slice(0, 200) || null;
  if (!factorySteps.some((s) => s.key === step)) return { error: "Invalid step" };

  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: { include: { product: true } }, warranties: true } });
  if (!order) return { error: "Order not found" };
  if (order.status === step && !note) return { error: "Order is already at this step — add a note to log an update." };

  const { warrantyNewMonths, warrantyReconMonths } = await getSite();
  await db.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: step } });
    await tx.orderEvent.create({ data: { orderId, step, note } });

    // On handover, register one warranty serial per machine unit (idempotent).
    if (step === "handover" && order.warranties.length === 0) {
      const base = orderId.replace(/^DMG-/, "");
      let n = 0;
      const rows = order.items.flatMap((it) =>
        Array.from({ length: it.qty }, () => ({
          serial: `DMG-${base}-${++n}`,
          productId: it.productId,
          slug: it.slug,
          productName: it.name,
          orderId,
          owner: order.name,
          phone: order.phone,
          purchasedAt: new Date(),
          months: it.product?.condition === "reconditioned" ? warrantyReconMonths : warrantyNewMonths,
        })),
      );
      await tx.warranty.createMany({ data: rows });
    }
  });

  after(() => notifyOrderStep(order, step, note));
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  const label = factorySteps.find((s) => s.key === step)!.en;
  return { ok: step === "handover" && order.warranties.length === 0 ? `Moved to "${label}" — warranty serials created.` : `Moved to "${label}".` };
}

export async function deleteOrder(orderId: string) {
  await requireAdmin("owner");
  // Warranties keep their serial (orderId set null) so a handed-over machine stays verifiable.
  await db.order.delete({ where: { id: orderId } });
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  redirect("/admin/orders?deleted=1");
}
