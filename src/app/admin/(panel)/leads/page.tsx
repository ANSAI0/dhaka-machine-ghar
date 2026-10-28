import type { Metadata } from "next";
import Link from "next/link";
import { Download, Phone } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { leadStatuses, type LeadStatus } from "@/lib/admin-status";
import type { ChatTurn } from "@/lib/chatbot";
import { db } from "@/lib/db";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { StatusNoteForm } from "@/components/admin/status-note-form";
import { WhatsappIcon } from "@/components/brand-icons";
import { updateLead } from "./actions";
import { AddLeadForm } from "./add-lead-form";

export const metadata: Metadata = { title: "Leads" };
export const dynamic = "force-dynamic";

const dt = (d: Date | string) => new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" });

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const { status = "" } = await searchParams;
  const filter = status in leadStatuses ? (status as LeadStatus) : undefined;
  const [leads, counts, chats30] = await Promise.all([
    db.lead.findMany({ where: filter ? { status: filter } : {}, orderBy: { createdAt: "desc" }, take: 100, include: { chat: true } }),
    db.lead.groupBy({ by: ["status"], _count: true }),
    db.chatSession.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 864e5) } } }),
  ]);
  const count = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;

  return (
    <>
      <PageHeader
        title="Leads (CRM)"
        sub={`From the chat assistant and manual entries · ${chats30} chat conversation${chats30 === 1 ? "" : "s"} in the last 30 days`}
        actions={<a href={`/admin/leads/export${filter ? `?status=${filter}` : ""}`} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50"><Download className="h-4 w-4" /> Export CSV</a>}
      />
      <Card title="Add a lead" className="mb-4"><AddLeadForm /></Card>

      <nav className="no-scrollbar mb-4 flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1" aria-label="Filter by status">
        {[["", "All"], ...Object.entries(leadStatuses).map(([k, v]) => [k, `${v.label} (${count(k)})`])].map(([k, label]) => (
          <Link key={k} href={k ? `/admin/leads?status=${k}` : "/admin/leads"} className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold ${status === k ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>{label}</Link>
        ))}
      </nav>

      <div className="space-y-3">
        {leads.map((l) => {
          const st = leadStatuses[l.status as LeadStatus] ?? leadStatuses.new;
          const turns = (l.chat?.messages as ChatTurn[] | undefined) ?? [];
          return (
            <article key={l.id} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="flex flex-wrap items-center gap-2 font-bold text-gray-900">{l.name} <Badge tone={st.tone}>{st.label}</Badge> <Badge>{l.source}</Badge></p>
                  <p className="text-xs text-gray-500">{dt(l.createdAt)}{l.chat?.page ? ` · started on ${l.chat.page}` : ""}</p>
                  {l.interest && <p className="mt-1 text-sm text-gray-700">Interested in: <strong>{l.interest}</strong></p>}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">{l.phone}</span>
                  <a href={`tel:${l.phone}`} aria-label="Call" className="rounded-lg border border-gray-200 p-1.5 text-brand-700 hover:bg-gray-50"><Phone className="h-4 w-4" /></a>
                  <a href={`https://wa.me/88${l.phone}`} target="_blank" rel="noopener" aria-label="WhatsApp" className="rounded-lg border border-gray-200 p-1.5 text-[#1fa855] hover:bg-gray-50"><WhatsappIcon className="h-4 w-4" /></a>
                </div>
              </div>
              {turns.length > 0 && (
                <details className="mt-3 rounded-xl bg-gray-50 p-3 text-sm">
                  <summary className="cursor-pointer font-semibold text-gray-700">Chat transcript ({turns.length} messages)</summary>
                  <ol className="mt-3 space-y-2">
                    {turns.map((t, i) => (
                      <li key={i} className={`max-w-[90%] whitespace-pre-line rounded-xl px-3 py-2 ${t.role === "user" ? "ml-auto bg-brand-600 text-white" : "bg-white text-gray-800"}`}>{t.text}</li>
                    ))}
                  </ol>
                </details>
              )}
              <div className="mt-4 border-t border-gray-100 pt-4">
                <StatusNoteForm key={`${l.status}|${l.adminNote}`} action={updateLead.bind(null, l.id)} statuses={leadStatuses} status={l.status} note={l.adminNote} />
              </div>
            </article>
          );
        })}
        {leads.length === 0 && <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">No leads yet.</p>}
      </div>
    </>
  );
}
