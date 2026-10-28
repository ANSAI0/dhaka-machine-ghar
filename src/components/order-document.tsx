import Image from "next/image";
import type { Order, OrderItem, Warranty } from "@prisma/client";
import { paymentLabels } from "@/lib/orders";
import { formatBDT, type SiteInfo } from "@/lib/site";
import { PrintButton } from "./print-button";

export type DocKind = "invoice" | "gatepass" | "challan";
type Full = Order & { items: OrderItem[]; warranties: Warranty[] };

const titles: Record<DocKind, { en: string; bn: string; prefix: string }> = {
  invoice: { en: "INVOICE", bn: "ইনভয়েস", prefix: "" },
  gatepass: { en: "GATE PASS", bn: "গেট পাস", prefix: "GP-" },
  challan: { en: "DELIVERY CHALLAN", bn: "ডেলিভারি চালান", prefix: "CH-" },
};

const day = (d: Date) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Dhaka" });

// A4 printable document. Browsers' "Save as PDF" keeps Bangla shaping intact, which PDF libraries don't.
export function OrderDocument({ order: o, site, kind }: { order: Full; site: SiteInfo; kind: DocKind }) {
  const t = titles[kind];
  const serialsFor = (slug: string) => o.warranties.filter((w) => w.slug === slug).map((w) => w.serial);
  const due = o.total - o.payNow;

  return (
    <div className="min-h-screen bg-gray-100 py-6 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-[210mm] justify-end gap-2 px-4 print:hidden">
        <PrintButton />
      </div>
      <article className="mx-auto max-w-[210mm] bg-white p-[14mm] text-[13px] leading-relaxed text-gray-900 shadow print:max-w-none print:p-[10mm] print:shadow-none">
        <header className="flex items-start justify-between gap-6 border-b-4 border-brand-600 pb-4">
          <div className="flex items-center gap-3">
            <Image src="/brand/dmg-logo-transparent.png" alt="DMG" width={1057} height={400} className="h-12 w-auto" />
            <div>
              <p className="text-lg font-bold text-brand-700">{site.name}</p>
              <p className="font-semibold">{site.nameBn}</p>
              <p className="text-xs text-gray-600">{site.address}</p>
              <p className="text-xs text-gray-600">Hotline {site.phone} · {site.email}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold tracking-wide text-accent-600">{t.en}</p>
            <p className="font-semibold">{t.bn}</p>
            <p className="mt-2 font-mono font-bold">{t.prefix}{o.id}</p>
            <p className="text-xs text-gray-600">Date: {day(kind === "invoice" ? o.createdAt : new Date())}</p>
            {kind !== "invoice" && <p className="text-xs text-gray-600">Invoice: {o.id}</p>}
          </div>
        </header>

        <section className="mt-5 grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{kind === "invoice" ? "Bill to" : "Deliver to"}</p>
            <p className="font-bold">{o.name}</p>
            <p>{o.phone}</p>
            <p>{o.address}, {o.district}</p>
          </div>
          {kind === "gatepass" ? (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Transport</p>
              <p>Vehicle / Transport: ______________________</p>
              <p>Driver & mobile: _________________________</p>
              <p>Time out: _______________________________</p>
            </div>
          ) : (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Payment</p>
              <p>{paymentLabels[o.payment]}</p>
            </div>
          )}
        </section>

        <table className="mt-6 w-full border-collapse">
          <thead>
            <tr className="bg-brand-600 text-left text-white print:bg-brand-600">
              <th className="p-2">#</th>
              <th className="p-2">Machine / Description</th>
              {kind !== "invoice" && <th className="p-2">Serial no.</th>}
              <th className="p-2 text-right">Qty</th>
              {kind === "invoice" && <th className="p-2 text-right">Unit price</th>}
              {kind === "invoice" && <th className="p-2 text-right">Amount</th>}
            </tr>
          </thead>
          <tbody>
            {o.items.map((it, i) => (
              <tr key={it.id} className="border-b border-gray-200 align-top">
                <td className="p-2">{i + 1}</td>
                <td className="p-2 font-semibold">{it.name}</td>
                {kind !== "invoice" && <td className="p-2 font-mono text-xs">{serialsFor(it.slug).join(", ") || "—"}</td>}
                <td className="p-2 text-right">{it.qty}</td>
                {kind === "invoice" && <td className="p-2 text-right">{formatBDT(it.price)}</td>}
                {kind === "invoice" && <td className="p-2 text-right font-semibold">{formatBDT(it.price * it.qty)}</td>}
              </tr>
            ))}
          </tbody>
          {kind === "invoice" && (
            <tfoot>
              <tr><td colSpan={4} className="p-2 text-right font-bold">Total</td><td className="p-2 text-right font-bold">{formatBDT(o.total)}</td></tr>
              <tr><td colSpan={4} className="p-2 text-right text-gray-600">{o.payment === "cod_booking" ? "Advance" : "Payable now / advance"}</td><td className="p-2 text-right">{formatBDT(o.payNow)}</td></tr>
              <tr className="bg-gray-100"><td colSpan={4} className="p-2 text-right font-bold">Due at delivery</td><td className="p-2 text-right font-bold text-accent-600">{formatBDT(due)}</td></tr>
            </tfoot>
          )}
        </table>

        {kind === "invoice" && (
          <ul className="mt-6 list-disc space-y-1 pl-5 text-xs text-gray-600">
            <li>Track the factory progress of this order at the website’s Order Tracking page with invoice {o.id}.</li>
            <li>Delivery and installation charges, if any, are confirmed by phone.</li>
            <li>Warranty is registered against each machine’s serial number at handover.</li>
          </ul>
        )}
        {kind === "challan" && <p className="mt-6 text-xs text-gray-600">Received the above machine(s) in good condition. Warranty can be verified with the serial number on the website’s Warranty &amp; Service page.</p>}

        <footer className="mt-16 grid grid-cols-3 gap-8 text-center text-xs">
          {(kind === "gatepass" ? ["Prepared by", "Store / Security", "Authorised signature"] : kind === "challan" ? ["Delivered by", "Customer signature", "Authorised signature"] : ["Customer signature", "", "Authorised signature"]).map((l, i) => (
            <div key={i} className={l ? "border-t border-gray-400 pt-1" : ""}>{l}</div>
          ))}
        </footer>
      </article>
    </div>
  );
}
