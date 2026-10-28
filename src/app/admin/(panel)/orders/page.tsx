import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { normalizePhone, paymentLabels } from "@/lib/orders";
import { factorySteps, type StepKey } from "@/lib/tracking";
import { StepBadge } from "@/components/admin/step-badge";
import { PageHeader, compactBDT, shortDate } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

const PAGE = 30;
type SP = Promise<{ status?: string; q?: string; page?: string; deleted?: string }>;

export default async function OrdersPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const { status = "", q = "", page = "1", deleted } = await searchParams;
  const p = Math.max(1, Number(page) || 1);

  const where: Prisma.OrderWhereInput = {};
  if (status === "active") where.status = { not: "handover" };
  else if (factorySteps.some((s) => s.key === status)) where.status = status as StepKey;
  const term = q.trim();
  if (term) {
    const phone = normalizePhone(term);
    where.OR = [
      { id: { contains: term, mode: "insensitive" } },
      { name: { contains: term, mode: "insensitive" } },
      ...(phone.length >= 4 ? [{ phone: { contains: phone } }] : []),
    ];
  }

  const [orders, total] = await Promise.all([
    db.order.findMany({ where, orderBy: { createdAt: "desc" }, skip: (p - 1) * PAGE, take: PAGE, include: { items: true } }),
    db.order.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const qs = (o: Record<string, string>) => "?" + new URLSearchParams(Object.entries({ status, q, ...o }).filter(([, v]) => v)).toString();

  const tabs = [{ key: "", label: "All" }, { key: "active", label: "Active builds" }, ...factorySteps.map((s, i) => ({ key: s.key, label: `${i + 1}. ${s.en.split(" ")[0]}` }))];

  return (
    <>
      <PageHeader title="Orders & Factory" sub={`${total} order${total === 1 ? "" : "s"}`} />
      {deleted && <p className="mb-4 rounded-xl bg-brand-50 p-3 text-sm text-brand-800">Order deleted.</p>}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <nav className="no-scrollbar flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1" aria-label="Filter by step">
          {tabs.map((t) => (
            <Link key={t.key} href={`/admin/orders${qs({ status: t.key, page: "" })}`} className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold ${status === t.key ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
              {t.label}
            </Link>
          ))}
        </nav>
        <form className="ml-auto flex min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 sm:flex-none">
          <input type="hidden" name="status" value={status} />
          <Search className="h-4 w-4 text-gray-400" />
          <input name="q" defaultValue={q} placeholder="Invoice, name or phone" aria-label="Search orders" className="min-w-0 flex-1 py-2 text-sm outline-none" />
        </form>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
            <tr><th className="px-4 py-3">Invoice</th><th className="px-3 py-3">Customer</th><th className="px-3 py-3">Machines</th><th className="px-3 py-3 text-right">Total</th><th className="px-3 py-3">Payment</th><th className="px-3 py-3">Source</th><th className="px-4 py-3">Step</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} className="font-semibold text-brand-700 hover:underline">{o.id}</Link><span className="block text-xs text-gray-400">{shortDate(o.createdAt)}</span></td>
                <td className="px-3 py-3">{o.name}<span className="block text-xs text-gray-400">{o.phone} · {o.district}</span></td>
                <td className="max-w-[240px] px-3 py-3 text-gray-600"><span className="line-clamp-2">{o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</span></td>
                <td className="px-3 py-3 text-right font-semibold">{compactBDT(o.total)}<span className="block text-xs font-normal text-gray-400">now {compactBDT(o.payNow)}</span>{o.paymentStatus === "paid" && <span className="block text-xs font-bold text-brand-700">Paid online</span>}</td>
                <td className="px-3 py-3 text-xs text-gray-600">{paymentLabels[o.payment].split(" (")[0]}</td>
                <td className="px-3 py-3 text-xs text-gray-500">{o.source}</td>
                <td className="px-4 py-3"><StepBadge step={o.status} /></td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">No orders match.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <nav className="mt-4 flex items-center justify-center gap-2 text-sm" aria-label="Pagination">
          {p > 1 && <Link href={`/admin/orders${qs({ page: String(p - 1) })}`} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 hover:bg-gray-50">← Prev</Link>}
          <span className="text-gray-500">Page {p} of {pages}</span>
          {p < pages && <Link href={`/admin/orders${qs({ page: String(p + 1) })}`} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 hover:bg-gray-50">Next →</Link>}
        </nav>
      )}
    </>
  );
}
