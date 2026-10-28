import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { factorySteps } from "@/lib/tracking";
import { paymentLabels } from "@/lib/orders";
import { StepBadge } from "@/components/admin/step-badge";
import { Card, PageHeader, StatTile, compactBDT, shortDate } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const DAY = 864e5;
const pctChange = (cur: number, prev: number) => (prev === 0 ? null : Math.round(((cur - prev) / prev) * 100));

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  await requireAdmin();
  const { denied } = await searchParams;
  const now = Date.now();
  const d30 = new Date(now - 30 * DAY);
  const d60 = new Date(now - 60 * DAY);

  const [cur, prev, active, newQuotes, openService, byStep, recent, newLeads] = await Promise.all([
    db.order.aggregate({ where: { createdAt: { gte: d30 } }, _count: true, _sum: { total: true, payNow: true } }),
    db.order.aggregate({ where: { createdAt: { gte: d60, lt: d30 } }, _count: true, _sum: { total: true } }),
    db.order.count({ where: { status: { not: "handover" } } }),
    db.quote.count({ where: { status: "new" } }),
    db.serviceRequest.count({ where: { status: "open" } }),
    db.order.groupBy({ by: ["status"], _count: true }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { items: true } }),
    db.lead.count({ where: { status: "new" } }),
  ]);

  const revenue = cur._sum.total ?? 0;
  const counts = Object.fromEntries(byStep.map((g) => [g.status, g._count]));
  const maxStep = Math.max(1, ...factorySteps.map((s) => counts[s.key] ?? 0));

  return (
    <>
      <PageHeader title="Dashboard" sub="গত ৩০ দিনের সারসংক্ষেপ" />
      {denied && <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">এই পেজটি শুধুমাত্র Owner দেখতে পারবেন।</p>}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
        <StatTile label="Orders (30 days)" value={cur._count.toLocaleString("en-IN")} delta={{ pct: pctChange(cur._count, prev._count), period: "previous 30 days" }} href="/admin/orders" />
        <StatTile label="Order value (30 days)" value={compactBDT(revenue)} delta={{ pct: pctChange(revenue, prev._sum.total ?? 0), period: "previous 30 days" }} />
        <StatTile label="Active factory builds" value={String(active)} href="/admin/orders?status=active" />
        <StatTile label="New quotation requests" value={String(newQuotes)} href="/admin/quotes" />
        <StatTile label="Open service requests" value={String(openService)} href="/admin/service" />
        <StatTile label="New leads (chat & CRM)" value={String(newLeads)} href="/admin/leads?status=new" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Card title="Factory pipeline" className="xl:col-span-2">
          <ul className="space-y-3">
            {factorySteps.map((s, i) => {
              const n = counts[s.key] ?? 0;
              return (
                <li key={s.key}>
                  <Link href={`/admin/orders?status=${s.key}`} className="group block" title={`${s.en}: ${n} order${n === 1 ? "" : "s"}`}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-gray-700 group-hover:text-brand-700">{i + 1}. {s.en}</span>
                      <span className="font-semibold text-gray-900">{n}</span>
                    </div>
                    <div className="h-2 rounded-full bg-brand-50">
                      <div className="h-2 rounded-full bg-brand-600" style={{ width: `${(n / maxStep) * 100}%`, minWidth: n ? 8 : 0 }} />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card title="Recent orders" action={<Link href="/admin/orders" className="text-sm font-semibold text-brand-700 hover:underline">View all</Link>} className="xl:col-span-3">
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">এখনো কোনো অর্ডার আসেনি।</p>
          ) : (
            <div className="-mx-5 -my-5 overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                  <tr><th className="px-5 py-2">Invoice</th><th className="px-3 py-2">Customer</th><th className="px-3 py-2">Machine</th><th className="px-3 py-2 text-right">Total</th><th className="px-5 py-2">Step</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recent.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-5 py-2.5"><Link href={`/admin/orders/${o.id}`} className="font-semibold text-brand-700 hover:underline">{o.id}</Link><span className="block text-xs text-gray-400">{shortDate(o.createdAt)}</span></td>
                      <td className="px-3 py-2.5">{o.name}<span className="block text-xs text-gray-400">{o.phone}</span></td>
                      <td className="max-w-[200px] truncate px-3 py-2.5 text-gray-600">{o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</td>
                      <td className="px-3 py-2.5 text-right font-semibold">{compactBDT(o.total)}<span className="block text-xs font-normal text-gray-400">{paymentLabels[o.payment].split(" (")[0]}</span></td>
                      <td className="px-5 py-2.5"><StepBadge step={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
