import type { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";
import { heroImages } from "@/lib/hero-images";
import { PageHero } from "@/components/page-hero";
import { WarrantyPortal } from "@/components/warranty-portal";

export const metadata: Metadata = {
  title: "Warranty & Service",
  description: "Verify your Dhaka Machine Ghar machine's serial number and warranty, and request maintenance or service.",
};

export default function WarrantyPage() {
  return (
    <div className="container mx-auto px-3 pt-4 sm:px-4 lg:pt-6">
      <Breadcrumb items={[{ label: "Warranty & Service" }]} />
      <PageHero
        eyebrow="After-Sales"
        title="Warranty & Service"
        text="Check the serial number on the machine body to confirm it's genuine and under warranty — then send a service request."
        image={heroImages.lathe.src}
        center
      />
      <div className="mx-auto max-w-3xl">
        <WarrantyPortal />
      </div>
    </div>
  );
}
