import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { heroImages } from "@/lib/hero-images";
import { PageHero } from "@/components/page-hero";
import { TrackPortal } from "@/components/track-portal";

export const metadata: Metadata = {
  title: "Live Factory Order Tracking",
  description: "Track your Dhaka Machine Ghar machine through all 6 factory steps — from order registration to handover — with your invoice or phone number.",
};

export default function TrackPage() {
  return (
    <div className="container mx-auto px-3 pt-4 sm:px-4 lg:pt-6">
      <Breadcrumb items={[{ label: "Order Tracking" }]} />
      <PageHero
        eyebrow="Live Tracking"
        title="Factory Order Tracking"
        text="Enter your invoice number or the mobile number used for the order to see which factory step your machine is at."
        image={heroImages.workshop.src}
        center
      />
      <div className="mx-auto max-w-3xl">
        <Suspense>
          <TrackPortal />
        </Suspense>
      </div>
    </div>
  );
}
