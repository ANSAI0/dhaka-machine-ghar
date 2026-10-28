import type { Metadata } from "next";
import Link from "next/link";
import { Phone } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { quoteStatuses, type QuoteStatus } from "@/lib/admin-status";
import { db } from "@/lib/db";
import { Badge, PageHeader } from "@/components/admin/ui";
import { StatusNoteForm } from "@/components/admin/status-note-form";
import { WhatsappIcon } from "@/components/brand-icons";
import { updateQuote } from "./actions";

export const metadata: Metadata = { title: "Quotations" };
export const dynamic = "force-dynamic";

const dt = (d: Date) => d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" });

export default async function QuotesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const { status = "" } = await searchParams;
  const filter = status in quoteStatuses ? (status as QuoteStatus) : undefined;

  const [quotes, counts, categories] = await Promise.all([
    db.quote.findMany({ where: filter ? { status: filter } : {}, orderBy: { createdAt: "desc" }, take: 100 }),
    db.quote.groupBy({ by: ["status"], _count: true }),
    db.category.findMany({ select: { slug: true, name: true } }),
  ]);
  const count = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  const typeName = (t: string) => categories.find((c) => c.slug === t)?.name ?? "Other";

  return (
    <>
      <PageHeader title="Custom quotations" sub="Requests from the /quotation form" />
      <nav className="no-scrollbar mb-4 flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1" aria-label="Filter by status">
        {[["", "All"], ...Object.entries(quoteStatuses).map(([k, v]) => [k, `${v.label} (${count(k)})`])].map(([k, label]) => (
          <Link key={k} href={k ? `/admin/quotes?status=${k}` : "/admin/quotes"} className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold ${status === k ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>{label}</Link>
        ))}
      </nav>

      <div className="space-y-3">
        {quotes.map((q) => {
          const st = quoteStatuses[q.status as QuoteStatus] ?? quoteStatuses.new;
          const wa = `https://wa.me/88${q.phone}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${q.name}, ঢাকা মেশিন ঘর থেকে আপনার কোটেশন (${q.id}) সম্পর্কে বলছি।`)}`;
          return (
            <article key={q.id} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 font-bold text-gray-900">{q.name} <Badge tone={st.tone}>{st.label}</Badge></p>
                  <p className="text-xs text-gray-500">{q.id} · {dt(q.createdAt)} · {q.district}{q.company ? ` · ${q.company}` : ""}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">{q.phone}</span>
                  <a href={`tel:${q.phone}`} aria-label="Call" className="rounded-lg border border-gray-200 p-1.5 text-brand-700 hover:bg-gray-50"><Phone className="h-4 w-4" /></a>
                  <a href={wa} target="_blank" rel="noopener" aria-label="WhatsApp" className="rounded-lg border border-gray-200 p-1.5 text-[#1fa855] hover:bg-gray-50"><WhatsappIcon className="h-4 w-4" /></a>
                  <Badge>{q.contactBy === "whatsapp" ? "prefers WhatsApp" : "prefers call"}</Badge>
                </div>
              </div>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-4">
                <div><dt className="text-xs text-gray-500">Machine type</dt><dd className="font-semibold">{typeName(q.machineType)}</dd></div>
                <div><dt className="text-xs text-gray-500">Capacity / size</dt><dd className="font-semibold">{q.capacity}</dd></div>
                <div><dt className="text-xs text-gray-500">Quantity</dt><dd className="font-semibold">{q.quantity}</dd></div>
                <div><dt className="text-xs text-gray-500">Budget</dt><dd className="font-semibold">{q.budget ?? "—"}</dd></div>
              </dl>
              <p className="mt-3 whitespace-pre-line rounded-xl bg-gray-50 p-3 text-sm text-gray-700">{q.details}</p>
              {q.productSlug && <p className="mt-2 text-xs text-gray-500">Came from: <Link href={`/product/${q.productSlug}`} target="_blank" className="text-brand-700 hover:underline">{q.productSlug}</Link></p>}
              <div className="mt-4 border-t border-gray-100 pt-4">
                <StatusNoteForm key={`${q.status}|${q.adminNote}`} action={updateQuote.bind(null, q.id)} statuses={quoteStatuses} status={q.status} note={q.adminNote} />
              </div>
            </article>
          );
        })}
        {quotes.length === 0 && <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">No quotation requests{filter ? ` with status "${quoteStatuses[filter].label}"` : ""}.</p>}
      </div>
    </>
  );
}
