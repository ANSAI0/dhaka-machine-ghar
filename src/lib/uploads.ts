import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import sharp from "sharp";

// Uploaded files live outside /public (Next only serves /public files that existed at build time)
// and are served by app/uploads/[...path]/route.ts. On Vercel (BLOB_READ_WRITE_TOKEN set) they go
// to Vercel Blob instead, because the server's disk there is wiped on every deploy.
export const UPLOAD_DIR = path.join(process.cwd(), "uploads");
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const LOGO = path.join(process.cwd(), "public", "brand", "dmg-logo-transparent.png");

const signatures: { ext: string; type: string; test: (b: Buffer) => boolean }[] = [
  { ext: "jpg", type: "image/jpeg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: "png", type: "image/png", test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { ext: "webp", type: "image/webp", test: (b) => b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP" },
];

export const mimeFor = (file: string) => signatures.find((s) => file.endsWith(`.${s.ext}`))?.type;

// Shrinks to max 1600px and stamps the DMG logo, on a frosted (semi-clear) tab, in the bottom-right corner.
async function brandImage(buf: Buffer): Promise<Buffer> {
  const base = await sharp(buf).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).toBuffer({ resolveWithObject: true });
  const { width, height } = base.info;
  const logoW = Math.max(110, Math.round(Math.min(width, height) * 0.22));
  const pad = Math.round(logoW * 0.08);
  const mark = await sharp(LOGO).resize({ width: logoW }).png().toBuffer({ resolveWithObject: true });
  const tabW = mark.info.width + pad * 2;
  const tabH = mark.info.height + pad * 2;
  const tab = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${tabW}" height="${tabH}"><rect width="100%" height="100%" rx="${pad * 1.5}" fill="#fff" fill-opacity="0.72"/></svg>`,
  );
  const logo = await sharp(tab)
    .composite([{ input: mark.data, left: pad, top: pad }])
    .png()
    .toBuffer({ resolveWithObject: true });
  const margin = Math.round(Math.min(width, height) * 0.03);
  return sharp(base.data)
    .composite([{ input: logo.data, left: width - logo.info.width - margin, top: height - logo.info.height - margin }])
    .webp({ quality: 85 })
    .toBuffer();
}

// Saves an uploaded image after checking its real type from the file bytes. Returns the public URL.
// With `brand`, the photo is resized and gets the DMG logo (saved as WebP).
export async function saveImage(file: File, folder: string, baseName: string, opts: { brand?: boolean } = {}): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Image must be 5 MB or smaller");
  let buf: Buffer = Buffer.from(await file.arrayBuffer());
  const sig = signatures.find((s) => s.test(buf));
  if (!sig) throw new Error("Only JPG, PNG or WebP images are allowed");
  let ext = sig.ext;
  if (opts.brand) {
    buf = await brandImage(buf);
    ext = "webp";
  }
  const safe = baseName.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 60) || "image";
  const name = `${safe}-${randomBytes(4).toString("hex")}.${ext}`;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`${folder}/${name}`, buf, { access: "public", contentType: ext === "webp" ? "image/webp" : sig.type });
    return blob.url;
  }
  const dir = path.join(UPLOAD_DIR, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buf);
  return `/uploads/${folder}/${name}`;
}
