import { getCatalog } from "@/lib/catalog-server";
import { AnnouncementBar } from "@/components/announcement-bar";
import { CatalogProvider } from "@/components/catalog-provider";
import { CompareBar } from "@/components/compare";
import { CustomerProvider } from "@/components/customer-provider";
import { FloatingContact } from "@/components/floating-contact";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { TrackingScripts } from "@/components/tracking-scripts";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const catalog = await getCatalog();
  return (
    <CatalogProvider catalog={catalog}>
      <CustomerProvider>
      <Header categories={catalog.categories} announcement={<AnnouncementBar />} />
      <main className="min-h-[60vh]">{children}</main>
      <Footer categories={catalog.categories} />
      <MobileNav />
      <FloatingContact />
      <CompareBar />
      <TrackingScripts />
      </CustomerProvider>
    </CatalogProvider>
  );
}
