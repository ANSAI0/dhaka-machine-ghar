import type { Metadata } from "next";
import { getSite } from "@/lib/settings";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Return & Refund Policy" };

export default async function RefundPage() {
  const site = await getSite();
  return (
    <LegalPage
      site={site}
      eyebrow="Legal"
      title="Return & Refund Policy"
      intro="Our rules for cancellations, returns and refunds on machines and spare parts."
      updated="28 October 2026"
      sections={[
        {
          h: "Booking advance",
          p: [
            `Orders are confirmed with a ${site.advancePercent}% advance. You may cancel and receive a full refund of the advance before fabrication of your machine starts (the order status is still "Registered").`,
            "Once fabrication has started, the advance covers materials and labour already used and is not refundable, except where we are unable to deliver the machine.",
          ],
        },
        {
          h: "Custom-made machines and dies",
          p: ["Machines, dies and parts made to your drawing, size or tonnage are built only for you and cannot be returned once production has started."],
        },
        {
          h: "Defective or damaged machines",
          p: [
            "Please inspect the machine at handover. If it is damaged in transport or does not match the agreed specification, tell us within 3 days of delivery with photos or video.",
            "We will repair, replace the faulty part, or — if neither is possible — refund the amount paid for the affected item.",
            "Faults that appear later are handled under the machine's warranty (see Warranty & Service).",
          ],
        },
        {
          h: "Reconditioned machines",
          p: ["Reconditioned machines are sold after testing and come with their stated warranty. They are not returnable for change of mind."],
        },
        {
          h: "How refunds are paid",
          p: [
            "Approved refunds are paid within 7–10 working days to the original payment method (bKash, Nagad, card or bank) where possible, or by bank transfer.",
            "Payments made online through SSLCommerz are refunded through SSLCommerz to the same account or card.",
          ],
        },
      ]}
    />
  );
}
