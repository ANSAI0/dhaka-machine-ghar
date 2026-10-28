import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Phone } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { paymentLabels } from "@/lib/orders";
import { brand as site, formatBDT } from "@/lib/site";
import { factorySteps } from "@/lib/tracking";
import { StepBadge } from "@/components/admin/step-badge";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Card, PageHeader } from "@/components/admin/ui";
import { WhatsappIcon } from "@/components/brand-icons";
import { customerDocUrl } from "@/lib/doc-token";
import { deleteOrder } from "../actions";
import { StepControl } from "./step-control";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return { title: (await params).id };
}

const dt = (d: Date) => d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" });

export default async function OrderDetail({ params }: Params) {
  const s = await requireAdmin();
  const { id } = await params;
  const o = await db.order.findUnique({
    where: { id },
    include: { items: true, events: { orderBy: { at: "desc" } }, warranties: { orderBy: { serial: "asc" } }, smsLogs: { orderBy: { createdAt: "desc" } } },
  });
  if (!o) notFound();
  const wa = `https://wa.me/88${o.phone}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${o.name}, ${site.name} থেকে বলছি — আপনার অর্ডার ${o.id} সম্পর্কে।`)}`;

  return (
    <>
      <Link href="/admin/orders" className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-700"><ArrowLeft className="h-4 w-4" /> Orders</Link>
      <PageHeader
        title={o.id}
        sub={`Placed ${dt(o.createdAt)} · source: ${o.source}`}
        actions={
          <div className="flex items-center gap-2">
            <StepBadge step={o.status} />
            <Link href={`/track?q=${o.id}`} target="_blank" className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"><ExternalLink className="h-4 w-4" /> Public tracking</Link>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card title="Customer">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-gray-500">Name</dt><dd className="font-semibold">{o.name}</dd></div>
              <div><dt className="text-gray-500">Phone</dt><dd className="flex items-center gap-3 font-semibold">{o.phone}
                <a href={`tel:${o.phone}`} aria-label="Call" className="text-brand-700"><Phone className="h-4 w-4" /></a>
                <a href={wa} target="_blank" rel="noopener" aria-label="WhatsApp" className="text-[#1fa855]"><WhatsappIcon className="h-4 w-4" /></a></dd></div>
              <div className="sm:col-span-2"><dt className="text-gray-500">Email</dt><dd className="font-semibold">{o.email ? <a href={`mailto:${o.email}`} className="text-brand-700 hover:underline">{o.email}</a> : <span className="font-normal text-gray-400">Not given — no order emails</span>}</dd></div>
              <div className="sm:col-span-2"><dt className="text-gray-500">Address</dt><dd className="font-semibold">{o.address}, {o.district}</dd></div>
              {o.note && <div className="sm:col-span-2"><dt className="text-gray-500">Customer note</dt><dd className="rounded-lg bg-amber-50 p-2 text-amber-900">{o.note}</dd></div>}
            </dl>
          </Card>

          <Card title="Items & payment">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {o.items.map((i) => (
                  <tr key={i.id}>
                    <td className="py-2"><Link href={`/product/${i.slug}`} target="_blank" className="font-semibold hover:text-brand-700">{i.name}</Link></td>
                    <td className="py-2 text-right text-gray-500">{formatBDT(i.price)} × {i.qty}</td>
                    <td className="py-2 text-right font-semibold">{formatBDT(i.price * i.qty)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-gray-200">
                <tr><td className="pt-3 font-bold" colSpan={2}>Total</td><td className="pt-3 text-right font-bold">{formatBDT(o.total)}</td></tr>
                <tr><td className="text-gray-500" colSpan={2}>{paymentLabels[o.payment]}</td><td className="text-right font-semibold text-accent-600">{o.payNow ? `${formatBDT(o.payNow)} now` : "after call"}</td></tr>
                <tr>
                  <td className="text-gray-500" colSpan={2}>Online payment{o.payMethod ? ` · ${o.payMethod}` : ""}</td>
                  <td className={`text-right font-semibold ${o.paymentStatus === "paid" ? "text-brand-700" : o.paymentStatus === "failed" ? "text-accent-600" : "text-gray-500"}`}>
                    {o.paymentStatus === "paid" ? `Paid ${formatBDT(o.paidAmount)}` : o.paymentStatus === "failed" ? "Last attempt failed" : "Not paid online"}
                  </td>
                </tr>
              </tfoot>
            </table>
          </Card>

          {o.warranties.length > 0 && (
            <Card title="Warranty serials">
              <ul className="grid gap-2 sm:grid-cols-2">
                {o.warranties.map((w) => (
                  <li key={w.serial} className="rounded-xl border border-gray-200 p-3 text-sm">
                    <p className="font-mono font-bold">{w.serial}</p>
                    <p className="text-gray-500">{w.productName} · {w.months} months</p>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-gray-500">Engrave/stick these on the machine plates. Customers verify them at /warranty.</p>
            </Card>
          )}

          <Card title="Factory history">
            <ol className="space-y-3">
              {o.events.map((e) => (
                <li key={e.id} className="flex gap-3 text-sm">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" />
                  <div>
                    <p className="font-semibold">{factorySteps.find((s) => s.key === e.step)?.en}</p>
                    <p className="text-xs text-gray-500">{dt(e.at)}{e.note ? ` · ${e.note}` : ""}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Update factory step">
            <StepControl orderId={o.id} current={o.status} />
          </Card>
          <Card title="Documents">
            <div className="grid gap-2">
              {(["invoice", "gatepass", "challan"] as const).map((d) => (
                <Link key={d} href={`/admin/print/${o.id}?doc=${d}`} target="_blank" className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50">
                  {d === "invoice" ? "Invoice" : d === "gatepass" ? "Gate pass" : "Delivery challan"} <ExternalLink className="h-4 w-4 text-gray-400" />
                </Link>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-500">Customer link (invoice{o.status === "handover" ? " / challan" : ""}) — share on WhatsApp:</p>
            <input readOnly value={customerDocUrl(o.id, o.status === "handover" ? "challan" : "invoice")} aria-label="Customer document link" className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 font-mono text-[11px]" />
          </Card>
          <Card title="SMS to customer">
            {o.smsLogs.length === 0 ? (
              <p className="text-sm text-gray-500">No SMS yet.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {o.smsLogs.map((m) => (
                  <li key={m.id}>
                    <p className="text-xs text-gray-500">{dt(m.createdAt)} · <span className={m.status === "sent" ? "text-brand-700" : "text-accent-600"}>{m.status}</span></p>
                    <p className="text-gray-700">{m.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          {s.role === "owner" && (
            <Card title="Danger zone">
              <form action={deleteOrder.bind(null, o.id)}>
                <p className="mb-3 text-sm text-gray-500">Delete spam or test orders. Warranty serials already issued stay valid.</p>
                <ConfirmButton message={`Delete order ${o.id}? This cannot be undone.`} className="w-full rounded-xl border-2 border-accent-600 py-2 text-sm font-bold text-accent-600 hover:bg-accent-50">
                  Delete order
                </ConfirmButton>
              </form>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
