import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a production build sit beside the dev server's .next (NEXT_DIST_DIR=.next-prod).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Product image uploads go through server actions (images capped at 5 MB in lib/uploads.ts).
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
  // Admin-uploaded photos on Vercel Blob.
  images: { remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }] },
};

export default nextConfig;
