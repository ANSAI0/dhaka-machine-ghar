import { NextResponse } from "next/server";
import { unsubscribe } from "@/lib/unsubscribe";

// RFC 8058 one-click unsubscribe (mail apps POST here). A GET from a person goes to the confirm page.
export async function POST(req: Request) {
  const u = new URL(req.url);
  const ok = await unsubscribe(u.searchParams.get("c") ?? "", u.searchParams.get("t") ?? "");
  return NextResponse.json({ ok }, { status: ok ? 200 : 400 });
}

export async function GET(req: Request) {
  const u = new URL(req.url);
  return NextResponse.redirect(new URL(`/unsubscribe${u.search}`, req.url));
}
