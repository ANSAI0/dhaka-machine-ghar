import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatBDT } from "@/lib/site";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Badge, Card, PageHeader, shortDate } from "@/components/admin/ui";
import { deleteOffer, toggleOffer } from "./actions";
import { OfferForm } from "./offer-form";

export const metadata: Metadata = { title: "Offers" };
export const dynamic = "force-dynamic";

export default async function OffersPage() {
  await requireAdmin();
  const now = new Date();
  const [offers, products] = await Promise.all([
    db.offer.findMany({ orderBy: { createdAt: "desc" }, include: { product: { select: { name: true, slug: true, price: true } } } }),
    db.product.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { slug: true, name: true, price: true } }),
  ]);
  const state = (o: (typeof offers)[number]) =>
    !o.active ? { label: "Off", tone: "gray" as const } : o.endsAt && o.endsAt <= now ? { label: "Ended", tone: "gray" as const } : o.startsAt && o.startsAt > now ? { label: "Scheduled", tone: "amber" as const } : { label: "Live", tone: "green" as const };
  const live = offers.filter((o) => state(o).label === "Live").length;

  return (
    <>
      <PageHeader title="Offers" sub={`${live} live — shown in the “অফার চলছে” box on the home page and priced into checkout`} />
      <Card title="Add an offer" className="mb-6"><OfferForm products={products} /></Card>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
            <tr><th className="px-4 py-3">Machine</th><th className="px-3 py-3">Title</th><th className="px-3 py-3 text-right">Regular</th><th className="px-3 py-3 text-right">Offer</th><th className="px-3 py-3">Dates</th><th className="px-3 py-3">Status</th><th className="px-4 py-3" /></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {offers.map((o) => {
              const st = state(o);
              const pct = Math.round(((o.product.price - o.offerPrice) / o.product.price) * 100);
              return (
                <tr key={o.id}>
                  <td className="px-4 py-2.5 font-semibold"><Link href={`/product/${o.product.slug}`} target="_blank" className="hover:text-brand-700">{o.product.name}</Link></td>
                  <td className="px-3 py-2.5 text-gray-600">{o.title ?? "—"}</td>
                  <td className="px-3 py-2.5 text-right text-gray-500 line-through">{formatBDT(o.product.price)}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-accent-600">{formatBDT(o.offerPrice)} <span className="text-xs font-semibold">(-{pct}%)</span></td>
                  <td className="px-3 py-2.5 text-xs text-gray-600">{o.startsAt ? shortDate(o.startsAt) : "now"} → {o.endsAt ? shortDate(o.endsAt) : "until switched off"}</td>
                  <td className="px-3 py-2.5"><Badge tone={st.tone}>{st.label}</Badge></td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-3">
                      <form action={toggleOffer.bind(null, o.id)}><button className="text-xs font-semibold text-brand-700 hover:underline">{o.active ? "Switch off" : "Switch on"}</button></form>
                      <form action={deleteOffer.bind(null, o.id)}><ConfirmButton message="Delete this offer?" className="text-xs font-semibold text-accent-600 hover:underline">Delete</ConfirmButton></form>
                    </div>
                  </td>
                </tr>
              );
            })}
            {offers.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-500">No offers yet — the home page shows “এই মুহূর্তে কোনো অফার নেই”.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
