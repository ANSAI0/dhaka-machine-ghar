"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Banner } from "@/lib/settings";
import { brand } from "@/lib/site";

const INTERVAL = 3000;
const SLIDE_MS = 500;

// App-style banner carousel: images slide inside a framed box and are shown whole (never cropped): admin-uploaded images slide right-to-left every 3 s, loop
// seamlessly (a copy of the first banner sits at the end), swipe on phones, and stop while off
// screen. Only `transform` animates, so it stays smooth while the page scrolls.
export function HeroSlider({ banners }: { banners: Banner[] }) {
  const n = banners.length;
  const [i, setI] = useState(0); // 0…n, where n is the copy of the first banner
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const root = useRef<HTMLElement>(null);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (n < 2 || paused || !inView) return;
    const t = setTimeout(() => {
      setAnimate(true);
      setI((x) => x + 1);
    }, INTERVAL);
    return () => clearTimeout(t);
  }, [i, n, paused, inView]);

  // After sliding onto the copy of the first banner, jump back to the real one without animating.
  useEffect(() => {
    if (i !== n || n < 2) return;
    const t = setTimeout(() => {
      setAnimate(false);
      setI(0);
    }, SLIDE_MS);
    return () => clearTimeout(t);
  }, [i, n]);

  const go = (to: number) => {
    setAnimate(true);
    setI(((to % n) + n) % n);
  };

  if (!n) return <BrandBanner />;
  const slides = n > 1 ? [...banners, banners[0]] : banners;
  const dot = i % n;

  return (
    <section
      ref={root}
      aria-roledescription="carousel"
      aria-label="Offers and highlights"
      className="relative rounded-2xl bg-white p-1.5 shadow-[0_10px_28px_-14px_rgba(16,24,40,0.45)] ring-1 ring-black/5 lux:bg-lux-800 lux:ring-white/10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
        setPaused(true);
      }}
      onTouchEnd={(e) => {
        setPaused(false);
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? dot + 1 : dot - 1);
        touchX.current = null;
      }}
    >
      <div className="aspect-video overflow-hidden rounded-xl bg-[#0e1a33] ring-1 ring-black/10">
        <ul
          className="flex h-full"
          style={{ transform: `translateX(-${i * 100}%)`, transition: animate ? `transform ${SLIDE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)` : "none" }}
        >
          {slides.map((b, idx) => {
            const img = (
              <Image
                src={b.image}
                alt={idx === 0 ? `${brand.name} banner` : ""}
                fill
                priority={idx === 0}
                sizes="(min-width: 1024px) 75vw, 100vw"
                className="object-contain"
              />
            );
            const hidden = idx % n !== dot;
            return (
              <li key={`${b.id}-${idx}`} className="relative h-full w-full shrink-0" aria-hidden={hidden || idx === n}>
                {b.link ? (
                  <Link href={b.link} tabIndex={hidden ? -1 : undefined} className="absolute inset-0">
                    {img}
                  </Link>
                ) : (
                  img
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {n > 1 && (
        <div className="flex justify-center gap-1.5 pb-0.5 pt-2">
          {banners.map((b, idx) => (
            <button
              key={b.id}
              onClick={() => go(idx)}
              aria-label={`Banner ${idx + 1}`}
              className={`h-1.5 w-1.5 rounded-full transition-[transform,background-color] duration-300 ${idx === dot ? "mx-1.5 scale-x-[3] bg-brand-700 lux:bg-gold-400" : "bg-gray-300 lux:bg-white/25"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// Shown until the admin uploads banners.
function BrandBanner() {
  return (
    <section className="relative aspect-[2/1] overflow-hidden rounded-2xl bg-gradient-to-br from-ink via-brand-900 to-brand-700 shadow-lg max-md:rounded-md">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="relative flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-white">
        <Image src="/brand/dmg-logo-on-dark.png" alt={`${brand.name} logo`} width={1057} height={400} priority className="h-12 w-auto sm:h-20" />
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/80 sm:text-base">{brand.name}</p>
        <p className="text-xs text-white/60 sm:text-sm">Power Press &amp; Workshop Machinery · Keraniganj, Dhaka</p>
      </div>
    </section>
  );
}
