import type { Metadata } from "next";
import { getSite } from "@/lib/settings";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Privacy Policy" };

export default async function PrivacyPage() {
  const site = await getSite();
  return (
    <LegalPage
      site={site}
      eyebrow="Legal"
      title="Privacy Policy"
      intro={`How ${site.name} collects, uses and protects your information.`}
      updated="28 October 2026"
      sections={[
        {
          h: "Information we collect",
          p: [
            "When you place an order, request a quotation, register a warranty or create an account, we collect:",
            ["Your name, mobile number, email address and delivery address", "Order details, machine serial numbers and service requests", "Messages you send through the website chat or contact forms"],
            "We do not collect or store your card, bKash, Nagad or bank account details. Online payments are processed by SSLCommerz on their secure payment page.",
          ],
        },
        {
          h: "How we use your information",
          p: [["To process orders, deliveries, warranty and after-sales service", "To send order and factory-progress updates by SMS or phone", "To send our weekly product update email, only if you opt in (you can unsubscribe from any email)", "To answer your questions and quotations"]],
        },
        {
          h: "Sharing",
          p: [
            "We never sell your information. We share only what is needed with our payment partner (SSLCommerz), SMS and email providers, and the transport or courier company delivering your machine.",
          ],
        },
        {
          h: "Cookies and analytics",
          p: ["The website uses cookies to keep your cart and login session. We may use Facebook Pixel and Google Tag Manager to measure ads; these do not receive your payment details."],
        },
        {
          h: "Security and retention",
          p: ["Passwords are stored encrypted. We keep order and warranty records for as long as needed for warranty, service and legal accounting purposes."],
        },
        {
          h: "Your choices",
          p: [`You can update your account details, unsubscribe from emails, or ask us to delete your account by contacting us at ${site.email} or ${site.phone}.`],
        },
      ]}
    />
  );
}
