import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { serviceStatuses, type ServiceStatus } from "@/lib/admin-status";
import { db } from "@/lib/db";
import { normalizePhone } from "@/lib/orders";
import { warrantyStatus } from "@/lib/tracking";
import { Badge, Card, PageHeader, shortDate } from "@/components/admin/ui";
import { StatusNoteForm } from "@/components/admin/status-note-form";
import { updateService } from "./actions";
import { WarrantyForm } from "./warranty-form";

export const metadata: Metadata = { title: "Warranty & Service" };
export const dynamic = "force-dynamic";

const dt = (d: Date) => d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" });

export default async function ServicePage({ searchParams }: { searchParams: Promise<{ status?: string; w?: string }> }) {
  await requireAdmin();
  const { status = "open", w = "" } = await searchParams;
  const filter = status in serviceStatuses ? (status as ServiceStatus) : undefined;
  const term = w.trim();
  const phone = normalizePhone(term);

  const [requests, counts, warranties, products] = await Promise.all([
    db.serviceRequest.findMany({ where: filter ? { status: filter } : {}, orderBy: { createdAt: "desc" }, take: 100, include: { warranty: true } }),
    db.serviceRequest.groupBy({ by: ["status"], _count: true }),
    db.warranty.findMany({
      where: term ? { OR: [{ serial: { contains: term.toUpperCase() } }, { owner: { contains: term, mode: "insensitive" } }, ...(phone.length >= 4 ? [{ phone: { contains: phone } }] : [])] } : {},
      orderBy: { purchasedAt: "desc" },
      take: 50,
    }),
    db.product.findMany({ orderBy: { name: "asc" }, select: { slug: true, name: true, condition: true } }),
  ]);
  const count = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;

  return (
    <>
      <PageHeader title="Warranty & Service" />

      <h2 className="mb-3 text-lg font-bold text-gray-800">Service requests</h2>
      <nav className="no-scrollbar mb-4 flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1" aria-label="Filter by status">
        {[...Object.entries(serviceStatuses).map(([k, v]) => [k, `${v.label} (${count(k)})`]), ["all", "All"]].map(([k, label]) => (
          <Link key={k} href={`/admin/service?status=${k}`} className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold ${status === k ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>{label}</Link>
        ))}
      </nav>
      <div className="mb-10 space-y-3">
        {requests.map((r) => {
          const st = serviceStatuses[r.status as ServiceStatus] ?? serviceStatuses.open;
          return (
            <article key={r.id} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="flex flex-wrap items-center gap-2 font-bold text-gray-900">
                    {r.issue} <Badge tone={st.tone}>{st.label}</Badge>
                    <Badge tone={r.underWarranty ? "green" : "amber"}>{r.underWarranty ? "Under warranty" : "Paid service"}</Badge>
                    <Badge>{r.visit === "onsite" ? "On-site visit" : "Bring to workshop"}</Badge>
                  </p>
                  <p className="text-xs text-gray-500">{r.id} · {dt(r.createdAt)} · <span className="font-mono">{r.serial}</span> · {r.warranty.productName}</p>
                </div>
                <a href={`tel:${r.phone}`} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50"><Phone className="h-4 w-4 text-brand-700" /> {r.name} · {r.phone}</a>
              </div>
              <p className="mt-3 whitespace-pre-line rounded-xl bg-gray-50 p-3 text-sm text-gray-700">{r.details}</p>
              <div className="mt-4 border-t border-gray-100 pt-4">
                <StatusNoteForm key={`${r.status}|${r.adminNote}`} action={updateService.bind(null, r.id)} statuses={serviceStatuses} status={r.status} note={r.adminNote} />
              </div>
            </article>
          );
        })}
        {requests.length === 0 && <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">No service requests here.</p>}
      </div>

      <h2 className="mb-3 text-lg font-bold text-gray-800">Warranty serials</h2>
      <Card title="Register a machine sold outside the website" className="mb-4">
        <WarrantyForm products={products} />
      </Card>

      <form className="mb-3 flex max-w-md items-center gap-2 rounded-xl border border-gray-200 bg-white px-3">
        <input type="hidden" name="status" value={status} />
        <Search className="h-4 w-4 text-gray-400" />
        <input name="w" defaultValue={w} placeholder="Serial, owner or phone" aria-label="Search warranties" className="min-w-0 flex-1 py-2 text-sm outline-none" />
      </form>
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
            <tr><th className="px-4 py-3">Serial</th><th className="px-3 py-3">Machine</th><th className="px-3 py-3">Owner</th><th className="px-3 py-3">Purchased</th><th className="px-4 py-3">Warranty</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {warranties.map((x) => {
              const { expires, active } = warrantyStatus(x);
              return (
                <tr key={x.serial}>
                  <td className="px-4 py-2.5 font-mono font-semibold">{x.serial}{x.orderId && <Link href={`/admin/orders/${x.orderId}`} className="block font-sans text-xs font-normal text-brand-700 hover:underline">{x.orderId}</Link>}</td>
                  <td className="px-3 py-2.5">{x.productName}</td>
                  <td className="px-3 py-2.5">{x.owner}<span className="block text-xs text-gray-400">{x.phone}</span></td>
                  <td className="px-3 py-2.5">{shortDate(x.purchasedAt)} {x.purchasedAt.getFullYear()}</td>
                  <td className="px-4 py-2.5"><Badge tone={active ? "green" : "gray"}>{active ? "Active" : "Expired"} · until {shortDate(expires)} {expires.getFullYear()}</Badge></td>
                </tr>
              );
            })}
            {warranties.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">No warranties found.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
