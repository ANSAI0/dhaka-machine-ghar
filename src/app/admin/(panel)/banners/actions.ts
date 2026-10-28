"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getBanners, SETTINGS_TAG, type Banner } from "@/lib/settings";
import { saveImage } from "@/lib/uploads";

export type BannerState = { ok?: string; error?: string };

const MAX_BANNERS = 6;

async function store(items: Banner[]) {
  await db.setting.upsert({ where: { key: "banners" }, update: { value: { items } }, create: { key: "banners", value: { items } } });
  revalidateTag(SETTINGS_TAG);
  revalidatePath("/", "layout");
  revalidatePath("/admin/banners");
}

// A link must stay on this site ("/shop") or be a full https:// address.
function cleanLink(raw: string) {
  const v = raw.trim();
  if (!v) return "";
  if (v.startsWith("/") && !v.startsWith("//")) return v;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

export async function addBanner(_: BannerState, fd: FormData): Promise<BannerState> {
  await requireAdmin();
  const items = await getBanners();
  if (items.length >= MAX_BANNERS) return { error: `Up to ${MAX_BANNERS} banners — delete one first.` };
  const file = fd.get("image");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose an image" };
  const link = cleanLink(String(fd.get("link") ?? ""));
  if (link === null) return { error: "Link must start with / (a page on this site) or https://" };
  try {
    const image = await saveImage(file, "banners", "banner");
    await store([...items, { id: randomBytes(6).toString("hex"), image, link }]);
    return { ok: "Banner added." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }
}

export async function moveBanner(id: string, dir: -1 | 1) {
  await requireAdmin();
  const items = [...(await getBanners())];
  const i = items.findIndex((b) => b.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= items.length) return;
  [items[i], items[j]] = [items[j], items[i]];
  await store(items);
}

export async function deleteBanner(id: string) {
  await requireAdmin();
  await store((await getBanners()).filter((b) => b.id !== id));
}
