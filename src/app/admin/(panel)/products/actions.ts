"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { CATALOG_TAG } from "@/lib/catalog-server";
import { db } from "@/lib/db";
import { saveImage } from "@/lib/uploads";

export type ProductFormState = { error?: string; fieldErrors?: Record<string, string> };

// Catalog is cached and pages are pre-rendered — refresh both after any change.
function refreshCatalog() {
  revalidateTag(CATALOG_TAG);
  revalidatePath("/", "layout");
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const int = (fd: FormData, k: string) => {
  const v = str(fd, k).replace(/[,\s৳]/g, "");
  return v === "" ? null : Number.isInteger(Number(v)) ? Number(v) : NaN;
};
const lines = (s: string) => s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

// "Label: value" or "Label | value" per line.
function parseSpecs(s: string): [string, string][] {
  return lines(s).map((l) => {
    const i = l.search(/\s*[|:]\s*/);
    return i > 0 ? [l.slice(0, i).trim(), l.slice(i).replace(/^\s*[|:]\s*/, "").trim()] : [l, ""];
  });
}

// Accepts a YouTube URL or a bare 11-character id.
function parseVideo(s: string) {
  if (!s) return null;
  const m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/) ?? s.match(/^([\w-]{11})$/);
  return m ? m[1] : undefined;
}

export async function saveProduct(originalSlug: string | null, _: ProductFormState, fd: FormData): Promise<ProductFormState> {
  await requireAdmin();
  const e: Record<string, string> = {};

  const slug = str(fd, "slug").toLowerCase();
  const name = str(fd, "name");
  const nameBn = str(fd, "nameBn");
  const categorySlug = str(fd, "category");
  const subSlug = str(fd, "subcategory");
  const condition = str(fd, "condition");
  const price = int(fd, "price");
  const oldPrice = int(fd, "oldPrice");
  const videoId = parseVideo(str(fd, "video"));

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) e.slug = "Use lowercase letters, numbers and dashes";
  if (name.length < 3) e.name = "Required";
  if (!nameBn) e.nameBn = "Required";
  if (condition !== "new" && condition !== "reconditioned") e.condition = "Required";
  if (!price || Number.isNaN(price) || price <= 0) e.price = "Enter a price in taka";
  if (oldPrice !== null && (Number.isNaN(oldPrice) || oldPrice <= (price ?? 0))) e.oldPrice = "Must be higher than the price (or empty)";
  if (videoId === undefined) e.video = "Not a YouTube link or id";
  if (!str(fd, "capacity")) e.capacity = "Required";
  if (!str(fd, "short")) e.short = "Required";

  const category = await db.category.findUnique({ where: { slug: categorySlug }, include: { subcategories: true } });
  if (!category) e.category = "Choose a category";
  const sub = category?.subcategories.find((s) => s.slug === subSlug) ?? null;

  const roiFields = [str(fd, "roiProduct"), int(fd, "roiUnits"), Number(str(fd, "roiProfit")), int(fd, "roiCost")] as const;
  const roiFilled = roiFields.filter((v) => v !== "" && v !== null && !(typeof v === "number" && (Number.isNaN(v) || v === 0))).length;
  if (roiFilled > 0 && roiFilled < 4) e.roi = "Fill all four ROI fields, or leave all empty";

  const headline = str(fd, "landingHeadline");
  const sub2 = str(fd, "landingSub");
  if (Object.keys(e).length) return { error: "Please fix the highlighted fields.", fieldErrors: e };

  let image: string | null | undefined; // undefined = keep current
  const file = fd.get("image");
  try {
    if (file instanceof File && file.size > 0) image = await saveImage(file, "products", slug, { brand: fd.get("brandLogo") === "on" });
    else if (fd.get("removeImage") === "on") image = null;
  } catch (err) {
    return { error: (err as Error).message, fieldErrors: { image: (err as Error).message } };
  }

  const data = {
    slug,
    name,
    nameBn,
    categoryId: category!.id,
    subcategoryId: sub?.id ?? null,
    condition: condition as "new" | "reconditioned",
    price: price!,
    oldPrice,
    brand: str(fd, "brand") || "Dhaka Machine Ghar",
    capacity: str(fd, "capacity"),
    voltage: str(fd, "voltage") || "Manual",
    short: str(fd, "short"),
    highlights: lines(str(fd, "highlights")),
    specs: parseSpecs(str(fd, "specs")) as Prisma.InputJsonValue,
    roi: roiFilled === 4 ? { product: roiFields[0], unitsPerDay: roiFields[1], profitPerUnit: roiFields[2], monthlyCost: roiFields[3] } : Prisma.DbNull,
    videoId: videoId ?? null,
    featured: fd.get("featured") === "on",
    landing: fd.get("landing") === "on",
    landingCopy: headline && sub2 ? { headline, sub: sub2 } : Prisma.DbNull,
    active: fd.get("active") === "on",
    // A newly uploaded or removed photo is no longer the credited stock image.
    ...(image !== undefined ? { image, imageCredit: null, imageSource: null } : {}),
  };

  try {
    if (originalSlug) await db.product.update({ where: { slug: originalSlug }, data });
    else await db.product.create({ data: { ...data, sortOrder: (await db.product.count()) + 1 } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") return { error: "Slug already used by another product.", fieldErrors: { slug: "Already used" } };
    throw err;
  }

  refreshCatalog();
  redirect(`/admin/products?saved=${encodeURIComponent(slug)}`);
}

export async function toggleProduct(slug: string, field: "active" | "featured" | "landing") {
  await requireAdmin();
  const p = await db.product.findUnique({ where: { slug }, select: { active: true, featured: true, landing: true } });
  if (!p) return;
  await db.product.update({ where: { slug }, data: { [field]: !p[field] } });
  refreshCatalog();
  revalidatePath("/admin/products");
}

export async function deleteProduct(slug: string) {
  await requireAdmin("owner");
  // Order lines and warranties keep their name/slug snapshot; their product link becomes null.
  await db.product.delete({ where: { slug } });
  refreshCatalog();
  redirect("/admin/products?deleted=1");
}
