"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Banner } from "@/lib/settings";
import { brand } from "@/lib/site";

const INTERVAL = 3000;
const SLIDE_MS = 500;

// Home hero banner carousel (desktop and phones): banners slide right-to-left every 3 s inside a framed
// box, shown whole (never cropped), with prev/next arrows, dots and swipe. Loops seamlessly (a copy of
// the first banner sits at the end) and stops while off screen. Only `transform` animates.
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

  const dot = i % n;
  const go = (to: number) => {
    setAnimate(true);
    setI(((to % n) + n) % n);
  };

  if (!n) return null;
  const slides = n > 1 ? [...banners, banners[0]] : banners;
  const arrow =
    "absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md ring-1 ring-black/5 transition hover:bg-white sm:h-11 sm:w-11";

  return (
    <section
      ref={root}
      aria-roledescription="carousel"
      aria-label="Offers and highlights"
      className="relative rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-gray-100 sm:p-2 lux:bg-lux-800 lux:ring-white/10"
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
      <div className="relative aspect-video overflow-hidden rounded-xl bg-[#0e1a33]">
        <ul
          className="flex h-full"
          style={{ transform: `translateX(-${i * 100}%)`, transition: animate ? `transform ${SLIDE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)` : "none" }}
        >
          {slides.map((b, idx) => {
            const hidden = idx % n !== dot || idx === n;
            const img = <Image src={b.image} alt={idx === 0 ? `${brand.name} banner` : ""} fill priority={idx === 0} sizes="(min-width: 1024px) 75vw, 100vw" className="object-contain" />;
            return (
              <li key={`${b.id}-${idx}`} className="relative h-full w-full shrink-0" aria-hidden={hidden}>
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

        {n > 1 && (
          <>
            <button type="button" onClick={() => go(dot - 1)} aria-label="Previous banner" className={`${arrow} left-2 sm:left-3`}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => go(dot + 1)} aria-label="Next banner" className={`${arrow} right-2 sm:right-3`}>
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5 sm:bottom-3">
              {banners.map((b, idx) => (
                <button
                  key={b.id}
                  onClick={() => go(idx)}
                  aria-label={`Banner ${idx + 1}`}
                  className={`h-1.5 w-1.5 rounded-full shadow-[0_0_0_1px_rgba(0,0,0,0.2)] transition-[transform,background-color] duration-300 ${idx === dot ? "mx-1.5 scale-x-[3] bg-white" : "bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
