"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { CATALOG_TAG } from "@/lib/catalog-server";
import { db } from "@/lib/db";

export type OfferState = { ok?: string; error?: string };

function refresh() {
  revalidateTag(CATALOG_TAG);
  revalidatePath("/", "layout");
  revalidatePath("/admin/offers");
}

// Dates come from <input type="date"> as Dhaka-local days: starts at 00:00, ends after 23:59 of that day.
const dhakaDay = (v: string, endOfDay: boolean) => (v ? new Date(`${v}T${endOfDay ? "23:59:59" : "00:00:00"}+06:00`) : null);

export async function addOffer(_: OfferState, fd: FormData): Promise<OfferState> {
  await requireAdmin();
  const slug = String(fd.get("product") ?? "");
  const offerPrice = Number(String(fd.get("offerPrice") ?? "").replace(/[,\s৳]/g, ""));
  const title = String(fd.get("title") ?? "").trim().slice(0, 60) || null;
  const startsAt = dhakaDay(String(fd.get("startsAt") ?? ""), false);
  const endsAt = dhakaDay(String(fd.get("endsAt") ?? ""), true);

  const product = await db.product.findUnique({ where: { slug } });
  if (!product) return { error: "Choose a machine" };
  if (!Number.isInteger(offerPrice) || offerPrice <= 0) return { error: "Enter the offer price in taka" };
  if (offerPrice >= product.price) return { error: `Offer price must be lower than the regular price (৳${product.price.toLocaleString("en-IN")})` };
  if (startsAt && endsAt && endsAt <= startsAt) return { error: "End date must be after the start date" };
  if (endsAt && endsAt < new Date()) return { error: "End date is already past" };

  await db.offer.create({ data: { productId: product.id, offerPrice, title, startsAt, endsAt } });
  refresh();
  return { ok: `Offer added for ${product.name}.` };
}

export async function toggleOffer(id: string) {
  await requireAdmin();
  const o = await db.offer.findUnique({ where: { id } });
  if (!o) return;
  await db.offer.update({ where: { id }, data: { active: !o.active } });
  refresh();
}

export async function deleteOffer(id: string) {
  await requireAdmin();
  await db.offer.deleteMany({ where: { id } });
  refresh();
}
