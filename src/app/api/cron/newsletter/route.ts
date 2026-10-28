import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { maybeSendWeekly } from "@/lib/newsletter";

// For external cron (e.g. hourly): GET /api/cron/newsletter with header "Authorization: Bearer <CRON_SECRET>".
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const got = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secret || got.length !== secret.length || !timingSafeEqual(Buffer.from(got), Buffer.from(secret))) return new NextResponse("Not found", { status: 404 });
  await maybeSendWeekly();
  return NextResponse.json({ ok: true });
}
