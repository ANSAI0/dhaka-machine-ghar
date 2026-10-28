import type { Metadata } from "next";
import Image from "next/image";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getBanners } from "@/lib/settings";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Card, PageHeader } from "@/components/admin/ui";
import { deleteBanner, moveBanner } from "./actions";
import { BannerForm } from "./banner-form";

export const metadata: Metadata = { title: "Hero Banners" };
export const dynamic = "force-dynamic";

const MAX = 6;

export default async function BannersPage() {
  await requireAdmin();
  const banners = await getBanners();

  return (
    <>
      <PageHeader title="Hero Banners" sub="The sliding banners at the top of the home page — they change every 3 seconds, in this order." />
      <Card title={`Add a banner (${banners.length}/${MAX})`} className="mb-6">
        <BannerForm full={banners.length >= MAX} />
      </Card>

      {banners.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-sm text-gray-500">
          No banners uploaded — the home page shows the 5 built-in DMG banners until you add your own.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {banners.map((b, i) => (
            <li key={b.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="relative aspect-video bg-gray-100">
                <Image src={b.image} alt="" fill sizes="400px" className="object-cover" />
                <span className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-0.5 text-xs font-bold text-white">#{i + 1}</span>
              </div>
              <div className="flex items-center gap-2 p-3 text-sm">
                <span className="min-w-0 flex-1 truncate text-gray-600">{b.link || <span className="text-gray-400">No link</span>}</span>
                <form action={moveBanner.bind(null, b.id, -1)}>
                  <button disabled={i === 0} aria-label="Move up" className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                </form>
                <form action={moveBanner.bind(null, b.id, 1)}>
                  <button disabled={i === banners.length - 1} aria-label="Move down" className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                </form>
                <form action={deleteBanner.bind(null, b.id)}>
                  <ConfirmButton message="Delete this banner?" className="rounded-md p-1.5 text-accent-600 hover:bg-accent-50">
                    <Trash2 className="h-4 w-4" />
                  </ConfirmButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
