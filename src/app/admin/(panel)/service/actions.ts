"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { serviceStatuses } from "@/lib/admin-status";
import { db } from "@/lib/db";
import { makeId } from "@/lib/ids";
import { isValidBDPhone, normalizePhone } from "@/lib/orders";
import { normalizeSerial } from "@/lib/tracking";

type State = { ok?: boolean; error?: string };

export async function updateService(id: string, _: State, fd: FormData): Promise<State> {
  await requireAdmin();
  const status = String(fd.get("status") ?? "");
  if (!(status in serviceStatuses)) return { error: "Invalid status" };
  await db.serviceRequest.update({ where: { id }, data: { status, adminNote: String(fd.get("note") ?? "").trim().slice(0, 500) || null } });
  revalidatePath("/admin/service");
  revalidatePath("/admin");
  return { ok: true };
}

export type WarrantyState = { error?: string; ok?: string };

// For machines sold before the website (or off-line) — registers a serial customers can verify.
export async function addWarranty(_: WarrantyState, fd: FormData): Promise<WarrantyState> {
  await requireAdmin();
  const slug = String(fd.get("product") ?? "");
  const owner = String(fd.get("owner") ?? "").trim();
  const phone = String(fd.get("phone") ?? "");
  const months = Number(fd.get("months"));
  const date = new Date(String(fd.get("purchasedAt") ?? ""));
  const serial = normalizeSerial(String(fd.get("serial") ?? "")) || makeId("DMG-M");

  const product = await db.product.findUnique({ where: { slug } });
  if (!product) return { error: "Choose the machine" };
  if (owner.length < 2) return { error: "Owner name is required" };
  if (!isValidBDPhone(phone)) return { error: "Valid owner phone is required (01XXXXXXXXX)" };
  if (!Number.isInteger(months) || months < 0 || months > 120) return { error: "Warranty months must be 0–120" };
  if (Number.isNaN(date.getTime()) || date > new Date()) return { error: "Purchase date is invalid" };
  if (!/^[A-Z0-9-]{4,40}$/.test(serial)) return { error: "Serial may use letters, numbers and dashes only" };

  try {
    await db.warranty.create({
      data: { serial, productId: product.id, slug: product.slug, productName: product.name, owner, phone: normalizePhone(phone), purchasedAt: date, months },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return { error: `Serial ${serial} already exists` };
    throw e;
  }
  revalidatePath("/admin/service");
  return { ok: `Registered ${serial}` };
}
