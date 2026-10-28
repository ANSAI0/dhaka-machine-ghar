import type { Metadata, Viewport } from "next";
import { Anek_Bangla, Hind_Siliguri, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart";
import { CompareProvider } from "@/components/compare";
import { SiteProvider } from "@/components/site-provider";
import { getSite, getTheme } from "@/lib/settings";
import { themeCss } from "@/lib/theme";
import { brand } from "@/lib/site";

const hind = Hind_Siliguri({ variable: "--font-hind", subsets: ["bengali", "latin"], weight: ["400", "500", "600", "700"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
// Display face for big Bangla headlines (hero).
const anek = Anek_Bangla({ variable: "--font-anek", subsets: ["bengali", "latin"], weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  title: { default: `${brand.name} (${brand.nameBn}) — Power Press & Workshop Machinery`, template: `%s | ${brand.name}` },
  description:
    "Dhaka Machine Ghar — power press manufacturer in Keraniganj, Dhaka and supplier of lathe, shaper, milling, drill, press brake, shear and construction machinery in Bangladesh.",
  icons: { icon: "/brand/dmg-logo-square.png" },
};

// Fixed scale on phones (owner's request): no pinch / double-tap zoom.
export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false, themeColor: "#070a09" };

// Shell only. The storefront chrome lives in (site)/layout; ad landing pages in (landing) stay distraction-free.
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [site, theme] = await Promise.all([getSite(), getTheme()]);
  const css = themeCss(theme);
  return (
    <html lang="bn">
      <body className={`${hind.variable} ${inter.variable} ${anek.variable} antialiased`}>
        {/* Brand colours from Admin → Settings (only when changed from the logo defaults). */}
        {css && <style>{css}</style>}
        <SiteProvider site={site}>
          <CartProvider>
            <CompareProvider>{children}</CompareProvider>
          </CartProvider>
        </SiteProvider>
      </body>
    </html>
  );
}
