"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { ProductImage } from "./product-image";

const SPEED = 0.32; // cards per second, right to left

// 3D coverflow that drifts endlessly right-to-left: the centre card faces the viewer and the
// rest turn away and sink back. Transforms are written straight to the DOM each frame (no
// re-renders). Hover pauses; reduced-motion users get a still row. Desktop/tablet only — phones
// get the flat ribbon below.
export function ProductMarquee({ title, subtitle, items, href }: { title: string; subtitle: string; items: Product[]; href: string }) {
  // Enough cards that the edges never run dry.
  const base = Array.from({ length: Math.max(1, Math.ceil(9 / Math.max(items.length, 1))) }, () => items).flat();
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLAnchorElement | null)[]>([]);
  const paused = useRef(false);

  useEffect(() => {
    const n = base.length;
    const el = stage.current;
    if (!n || !el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let offset = 0;
    let last = 0;
    let raf = 0;
    let visible = false;
    // Sizes are measured on resize only — reading them every frame forces a layout per frame.
    let gap = 150;
    const measure = () => {
      const card = cards.current[0]?.offsetWidth ?? 240;
      gap = Math.min(card * 0.62, el.clientWidth / 6.2);
    };

    // Only transform and opacity change per frame, both cheap for the GPU. The side cards are
    // dimmed with an overlay's opacity rather than a CSS filter (filters repaint every frame).
    const layout = () => {
      cards.current.forEach((card, i) => {
        if (!card) return;
        // Signed distance from the centre slot, wrapped into [-n/2, n/2).
        let d = (((i - offset) % n) + n) % n;
        if (d >= n / 2) d -= n;
        const a = Math.abs(d);
        if (a > 4.4) {
          card.style.visibility = "hidden";
          return;
        }
        const rot = Math.max(-55, Math.min(55, -d * 32));
        const z = -Math.min(a, 4) * 140;
        card.style.visibility = "visible";
        card.style.transform = `translate(-50%, -50%) translateX(${d * gap}px) translateZ(${z}px) rotateY(${rot}deg)`;
        card.style.zIndex = String(100 - Math.round(a * 10));
        card.style.opacity = a > 3.6 ? String(Math.max(0, 4.4 - a)) : "1";
        card.style.pointerEvents = a > 3.5 ? "none" : "auto";
        const shade = card.lastElementChild as HTMLElement | null;
        if (shade) shade.style.opacity = a < 0.5 ? "0" : String(Math.min(0.28, a * 0.09));
      });
    };

    const tick = (t: number) => {
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
      last = t;
      if (!paused.current && !still) offset = (offset + SPEED * dt) % n;
      layout();
      raf = visible && !still ? requestAnimationFrame(tick) : 0;
    };

    // Animate only while the ribbon is on screen.
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(el);
    const ro = new ResizeObserver(() => {
      measure();
      layout();
    });
    ro.observe(el);
    measure();
    layout();
    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [base.length]);

  if (!items.length) return null;

  return (
    <section className="py-2">
      <div className="mb-2 flex items-end justify-between gap-3">
        <div className="flex items-stretch gap-3">
          <span className="w-1 rounded-full bg-gradient-to-b from-accent-600 to-brand-600 max-md:bg-gold-gradient" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400 max-md:text-gold-400/80">{subtitle}</p>
            <h2 className="text-lg font-bold text-gray-900 sm:text-2xl max-md:text-white">{title}</h2>
          </div>
        </div>
        <Link href={href} className="flex shrink-0 items-center gap-1 rounded-full border border-brand-100 bg-white px-3.5 py-1.5 text-xs font-bold text-brand-700 shadow-sm hover:border-brand-600 hover:bg-brand-600 hover:text-white max-md:border-gold-400/30 max-md:bg-white/[0.04] max-md:text-gold-300 max-md:shadow-none">
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Phones: a flat ribbon moved by one CSS transform (GPU only) — the 3D stage is too heavy
          to animate while the page scrolls. */}
      <div className="group/ribbon relative -mx-3 overflow-hidden py-3 [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)] md:hidden">
        <ul className="flex w-max animate-marquee gap-3 group-active/ribbon:[animation-play-state:paused]" style={{ ["--marquee-duration" as string]: `${items.length * 5}s` }}>
          {[0, 1].map((copy) =>
            items.map((p) => (
              <li key={`${copy}-${p.slug}`} aria-hidden={copy === 1} className="w-40 shrink-0">
                <Link href={`/product/${p.slug}`} tabIndex={copy === 1 ? -1 : undefined} className="relative block overflow-hidden rounded-[20px] bg-lux-800 shadow-[0_16px_30px_-14px_rgba(0,0,0,0.9)] ring-1 ring-white/[0.08]">
                  <span aria-hidden className="pointer-events-none absolute inset-x-4 top-0 z-20 h-px bg-gradient-to-r from-transparent via-gold-300/70 to-transparent" />
                  <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
                    {p.image ? <Image src={p.image} alt={p.name} fill sizes="160px" className="object-cover" /> : <ProductImage product={p} sizes="160px" />}
                    {p.capacity && <span className="absolute left-2 top-2 z-10 rounded-full bg-lux-950/80 px-2 py-0.5 text-[10px] font-bold text-gold-300 ring-1 ring-gold-400/30">{p.capacity}</span>}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-lux-800 to-transparent" />
                  </div>
                  <div className="px-3 py-2.5">
                    <p className="line-clamp-1 text-[13px] font-bold text-white">{p.name}</p>
                    <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-400/70">{p.condition === "new" ? "Factory Made" : "Reconditioned"}</p>
                  </div>
                </Link>
              </li>
            )),
          )}
        </ul>
      </div>

      <div
        ref={stage}
        className="relative hidden h-[400px] overflow-hidden [perspective:1100px] md:block lg:h-[430px]"
        onMouseEnter={() => (paused.current = true)}
        onMouseLeave={() => (paused.current = false)}
      >
        {/* soft floor shadow under the centre card */}
        <div className="pointer-events-none absolute bottom-10 left-1/2 h-6 w-1/3 -translate-x-1/2 rounded-[50%] bg-black/15 blur-xl" />
        <div className="absolute inset-0 [transform-style:preserve-3d]">
          {base.map((p, i) => (
            <Link
              key={`${i}-${p.slug}`}
              ref={(el) => {
                cards.current[i] = el;
              }}
              href={`/product/${p.slug}`}
              aria-hidden={i >= items.length}
              tabIndex={i >= items.length ? -1 : undefined}
              className="group absolute left-1/2 top-[48%] w-56 overflow-hidden rounded-2xl bg-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/5 will-change-transform lg:w-60"
              style={{ transform: "translate(-50%, -50%)" }}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
                {p.image ? (
                  <Image src={p.image} alt={p.name} fill sizes="(min-width: 1024px) 240px, 224px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <ProductImage product={p} sizes="240px" />
                )}
                {p.capacity && (
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold text-gray-800 shadow-sm md:backdrop-blur sm:text-[11px]">{p.capacity}</span>
                )}
              </div>
              <div className="px-3.5 py-3">
                <p className="line-clamp-1 text-[13px] font-bold text-gray-900 group-hover:text-brand-700 sm:text-sm">{p.name}</p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:text-[11px]">{p.condition === "new" ? "Factory Made" : "Reconditioned"}</p>
              </div>
              {/* dims the side cards; must stay the last child (see layout()) */}
              <span aria-hidden className="pointer-events-none absolute inset-0 bg-black opacity-0" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
