import { readFile } from "node:fs/promises";
import path from "node:path";
import { mimeFor, UPLOAD_DIR } from "@/lib/uploads";

// Serves admin-uploaded images from /uploads (outside /public).
export async function GET(_: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = (await params).path;
  const file = path.join(UPLOAD_DIR, ...parts);
  const type = mimeFor(file);
  // Block traversal and anything that isn't one of our image types.
  if (!type || !file.startsWith(UPLOAD_DIR + path.sep) || parts.some((p) => p.startsWith("."))) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(file);
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
