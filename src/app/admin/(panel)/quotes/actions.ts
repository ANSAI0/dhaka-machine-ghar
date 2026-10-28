"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { quoteStatuses } from "@/lib/admin-status";
import { db } from "@/lib/db";

type State = { ok?: boolean; error?: string };

export async function updateQuote(id: string, _: State, fd: FormData): Promise<State> {
  await requireAdmin();
  const status = String(fd.get("status") ?? "");
  if (!(status in quoteStatuses)) return { error: "Invalid status" };
  await db.quote.update({ where: { id }, data: { status, adminNote: String(fd.get("note") ?? "").trim().slice(0, 500) || null } });
  revalidatePath("/admin/quotes");
  revalidatePath("/admin");
  return { ok: true };
}
