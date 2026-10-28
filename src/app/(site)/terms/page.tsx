import type { Metadata } from "next";
import { getSite } from "@/lib/settings";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default async function TermsPage() {
  const site = await getSite();
  return (
    <LegalPage
      site={site}
      eyebrow="Legal"
      title="Terms & Conditions"
      intro={`The terms for buying machines and parts from ${site.name}.`}
      updated="28 October 2026"
      sections={[
        {
          h: "About us",
          p: [`${site.name} (${site.nameBn}) manufactures power press machines in its own factory at ${site.address}, and sells foreign and reconditioned workshop machines from its showroom at ${site.showroom}.`],
        },
        {
          h: "Prices and orders",
          p: [
            "All prices are in Bangladeshi Taka (BDT). Prices and stock may change; the price shown when you place your order is the price you pay.",
            `An order is confirmed after we receive the booking advance (${site.advancePercent}%) or full payment, and our representative confirms it by phone.`,
            "Product photos marked as representative show the type of machine; the delivered machine may look different while meeting the stated specification.",
          ],
        },
        {
          h: "Payment",
          p: [
            "You can pay online through SSLCommerz (bKash, Nagad, Rocket, Visa, Mastercard and other supported methods), or by bank transfer as advised by our representative.",
            "The remaining balance is payable before or at handover of the machine.",
          ],
        },
        {
          h: "Production and delivery",
          p: [
            "Production time depends on the machine and is confirmed with your order. You can follow each factory step on the Order Tracking page.",
            "Delivery is available across Bangladesh by transport or courier. Delivery charges, if any, are agreed with you before dispatch. Risk passes to you at handover.",
          ],
        },
        {
          h: "Warranty",
          p: ["Each machine carries the warranty stated at sale, linked to its serial number. Warranty does not cover damage from misuse, overloading, incorrect wiring or unauthorised repair."],
        },
        {
          h: "Cancellations and refunds",
          p: ["Cancellations and refunds follow our Return & Refund Policy."],
        },
        {
          h: "Governing law",
          p: ["These terms are governed by the laws of Bangladesh. Disputes are subject to the courts of Dhaka."],
        },
      ]}
    />
  );
}
