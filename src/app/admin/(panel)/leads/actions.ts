"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { leadStatuses } from "@/lib/admin-status";
import { db } from "@/lib/db";
import { isValidBDPhone, normalizePhone } from "@/lib/orders";

type State = { ok?: boolean; error?: string };
type AddState = { ok?: string; error?: string };

export async function updateLead(id: string, _: State, fd: FormData): Promise<State> {
  await requireAdmin();
  const status = String(fd.get("status") ?? "");
  if (!(status in leadStatuses)) return { error: "Invalid status" };
  await db.lead.update({ where: { id }, data: { status, adminNote: String(fd.get("note") ?? "").trim().slice(0, 500) || null } });
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return { ok: true };
}

// Walk-in / phone-call enquiries the owner wants in the same list.
export async function addLead(_: AddState, fd: FormData): Promise<AddState> {
  await requireAdmin();
  const name = String(fd.get("name") ?? "").trim();
  const phone = String(fd.get("phone") ?? "");
  const interest = String(fd.get("interest") ?? "").trim();
  if (name.length < 2) return { error: "Name required" };
  if (!isValidBDPhone(phone)) return { error: "Valid mobile number required (01XXXXXXXXX)" };
  await db.lead.create({ data: { name, phone: normalizePhone(phone), interest: interest.slice(0, 200), source: String(fd.get("source") ?? "manual") } });
  revalidatePath("/admin/leads");
  return { ok: "Lead added" };
}
