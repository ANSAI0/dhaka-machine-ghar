"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type GallerySlide = { src: string; alt: string; similar?: { name: string; href: string } };

// Product photos: swipe sideways on phones, arrows / thumbnails on larger screens. The first slide is the
// product itself; the rest are look-alike machines, labelled so nobody mistakes them for this one.
export function ProductGallery({ slides, badge }: { slides: GallerySlide[]; badge?: React.ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const go = (n: number) => {
    const el = track.current;
    if (!el) return;
    const k = Math.max(0, Math.min(slides.length - 1, n));
    el.scrollTo({ left: k * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div>
      <div data-product-image className="group relative aspect-square overflow-hidden rounded-2xl border border-gray-100 bg-studio shadow-sm">
        {badge}
        <div
          ref={track}
          onScroll={(e) => setI(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((s, k) => (
            <div key={s.src + k} className="relative h-full w-full shrink-0 snap-center" aria-roledescription="slide" aria-label={`${k + 1} / ${slides.length}`}>
              <Image src={s.src} alt={s.alt} fill sizes="(max-width: 1024px) 100vw, 600px" priority={k === 0} className="object-contain p-1.5 drop-shadow-[0_12px_14px_rgba(15,23,42,0.18)]" />
              {s.similar && (
                <Link prefetch={false} href={s.similar.href} className="absolute inset-x-3 bottom-3 rounded-xl bg-white/90 px-3 py-2 text-xs shadow-sm backdrop-blur">
                  <span className="font-bold text-brand-700">একই ধরনের মেশিন</span>
                  <span className="block truncate text-gray-600">{s.similar.name} →</span>
                </Link>
              )}
            </div>
          ))}
        </div>
        {slides.length > 1 && (
          <>
            <button type="button" onClick={() => go(i - 1)} disabled={i === 0} aria-label="Previous photo" className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow disabled:opacity-0">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => go(i + 1)} disabled={i === slides.length - 1} aria-label="Next photo" className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow disabled:opacity-0">
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-bold text-white">{i + 1}/{slides.length}</span>
          </>
        )}
      </div>
      {slides.length > 1 && (
        <div className="mt-2 flex gap-2">
          {slides.map((s, k) => (
            <button key={s.src + k} type="button" onClick={() => go(k)} aria-label={`Photo ${k + 1}`} className={`relative h-14 w-14 overflow-hidden rounded-lg border-2 bg-studio ${i === k ? "border-brand-600" : "border-gray-200"}`}>
              <Image src={s.src} alt="" fill sizes="56px" className="object-contain p-0.5" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
