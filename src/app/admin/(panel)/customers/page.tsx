import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { normalizePhone } from "@/lib/orders";
import { Badge, PageHeader, shortDate } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Customers" };
export const dynamic = "force-dynamic";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const q = ((await searchParams).q ?? "").trim();
  const phone = normalizePhone(q);
  const where: Prisma.CustomerWhereInput = q
    ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q.toLowerCase() } }, ...(phone.length >= 4 ? [{ phone: { contains: phone } }] : [])] }
    : {};
  const [customers, total] = await Promise.all([
    db.customer.findMany({ where, orderBy: { createdAt: "desc" }, take: 100, include: { _count: { select: { orders: true } } } }),
    db.customer.count(),
  ]);

  return (
    <>
      <PageHeader title="Customers" sub={`${total} registered account${total === 1 ? "" : "s"}`} />
      <form className="mb-4 flex max-w-md items-center gap-2 rounded-xl border border-gray-200 bg-white px-3">
        <Search className="h-4 w-4 text-gray-400" />
        <input name="q" defaultValue={q} placeholder="Name, phone or email" aria-label="Search customers" className="min-w-0 flex-1 py-2 text-sm outline-none" />
      </form>
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
            <tr><th className="px-4 py-3">Customer</th><th className="px-3 py-3">Phone</th><th className="px-3 py-3">District</th><th className="px-3 py-3 text-right">Orders</th><th className="px-3 py-3">Joined</th><th className="px-4 py-3">Last login</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 font-semibold">{c.name}<span className="block text-xs font-normal text-gray-400">{c.email ?? "—"}</span></td>
                <td className="px-3 py-2.5">{c.phone} {c.phoneVerified ? <Badge tone="green">verified</Badge> : <Badge>unverified</Badge>}</td>
                <td className="px-3 py-2.5 text-gray-600">{c.district ?? "—"}</td>
                <td className="px-3 py-2.5 text-right">{c._count.orders ? <Link href={`/admin/orders?q=${c.phone}`} className="font-semibold text-brand-700 hover:underline">{c._count.orders}</Link> : 0}</td>
                <td className="px-3 py-2.5 text-gray-600">{shortDate(c.createdAt)}</td>
                <td className="px-4 py-2.5 text-gray-600">{c.lastLoginAt ? shortDate(c.lastLoginAt) : "—"}</td>
              </tr>
            ))}
            {customers.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">No customers{q ? " match" : " yet"}.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
