import { requireAdmin } from "@/lib/auth";
import { leadStatuses } from "@/lib/admin-status";
import { db } from "@/lib/db";

// CSV of leads (name, phone, interested machine…) — opens in Excel with Bangla intact (UTF-8 BOM).
export async function GET(req: Request) {
  await requireAdmin();
  const status = new URL(req.url).searchParams.get("status") ?? "";
  const leads = await db.lead.findMany({ where: status in leadStatuses ? { status } : {}, orderBy: { createdAt: "desc" } });

  // Quote every cell; neutralise leading =,+,-,@ so spreadsheets don't run them as formulas.
  const cell = (v: unknown) => {
    let s = String(v ?? "");
    if (/^[=+\-@]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const rows = [
    ["Date", "Name", "Phone", "Interested in", "Source", "Status", "Note"],
    ...leads.map((l) => [l.createdAt.toISOString().slice(0, 16).replace("T", " "), l.name, l.phone, l.interest, l.source, l.status, l.adminNote]),
  ];
  const csv = "﻿" + rows.map((r) => r.map(cell).join(",")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="dmg-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
