import type { Metadata } from "next";
import { getSite } from "@/lib/settings";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Data Deletion" };

// Linked from the Meta app settings ("User data deletion"): how to have chat data removed.
export default async function DataDeletionPage() {
  const site = await getSite();
  return (
    <LegalPage
      site={site}
      eyebrow="Legal"
      title="Data Deletion Instructions"
      intro={`How to ask ${site.name} to delete the information you shared through Facebook Messenger, the website chat or an order.`}
      updated="16 November 2026"
      sections={[
        {
          h: "What we keep from Messenger and chat",
          p: [
            "When you message our Facebook Page or use the website chat, our assistant keeps the conversation so it can answer you and so our team can follow up. If you give your name, mobile number or delivery address, it is saved with the conversation, the call-back request or the order you place.",
            "We do not receive your Facebook password, friends list or anything outside the conversation with our Page.",
          ],
        },
        {
          h: "How to request deletion",
          p: [
            [
              `Send "Delete my data" to our Facebook Page on Messenger, or`,
              `Email ${site.email} with the subject "Delete my data", or`,
              `Call ${site.phone}.`,
            ],
            "Tell us the name or mobile number you used so we can find your records. We delete the conversation and your contact details within 7 days and confirm when it is done.",
          ],
        },
        {
          h: "What we may need to keep",
          p: ["If you placed an order, we keep the invoice and warranty records required for accounting, warranty and after-sales service, but remove the chat conversation itself."],
        },
      ]}
    />
  );
}
