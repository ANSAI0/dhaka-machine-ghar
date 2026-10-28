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
// re-renders). Hover pauses; reduced-motion users get a still row.
export function ProductMarquee({ title, subtitle, items, href }: { title: string; subtitle: string; items: Product[]; href: string }) {
  // Enough cards that the edges never run dry.
  const base = Array.from({ length: Math.max(1, Math.ceil(9 / Math.max(items.length, 1))) }, () => items).flat();
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLAnchorElement | null)[]>([]);
  const paused = useRef(false);

  useEffect(() => {
    const n = base.length;
    if (!n || !stage.current) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let offset = 0;
    let last = performance.now();
    let raf = 0;

    const layout = () => {
      const w = stage.current?.clientWidth ?? 900;
      const card = cards.current[0]?.offsetWidth ?? 240;
      const gap = Math.min(card * 0.62, w / 6.2);
      cards.current.forEach((el, i) => {
        if (!el) return;
        // Signed distance from the centre slot, wrapped into [-n/2, n/2).
        let d = (((i - offset) % n) + n) % n;
        if (d >= n / 2) d -= n;
        const a = Math.abs(d);
        const rot = Math.max(-55, Math.min(55, -d * 32));
        const z = -Math.min(a, 4) * 140;
        el.style.transform = `translate(-50%, -50%) translateX(${d * gap}px) translateZ(${z}px) rotateY(${rot}deg)`;
        el.style.zIndex = String(100 - Math.round(a * 10));
        el.style.opacity = a > 3.6 ? String(Math.max(0, 4.4 - a)) : "1";
        el.style.filter = a < 0.5 ? "none" : `brightness(${Math.max(0.72, 1 - a * 0.09)})`;
        el.style.pointerEvents = a > 3.5 ? "none" : "auto";
      });
    };

    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      if (!paused.current && !still) offset = (offset + SPEED * dt) % n;
      layout();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [base.length]);

  if (!items.length) return null;

  return (
    <section className="py-2">
      <div className="mb-2 flex items-end justify-between gap-3">
        <div className="flex items-stretch gap-3">
          <span className="w-1 rounded-full bg-gradient-to-b from-accent-600 to-brand-600" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">{subtitle}</p>
            <h2 className="text-lg font-extrabold text-gray-900 sm:text-2xl">{title}</h2>
          </div>
        </div>
        <Link href={href} className="flex shrink-0 items-center gap-1 rounded-full border border-brand-100 bg-white px-3.5 py-1.5 text-xs font-bold text-brand-700 shadow-sm hover:border-brand-600 hover:bg-brand-600 hover:text-white">
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div
        ref={stage}
        className="relative h-[330px] overflow-hidden [perspective:1100px] sm:h-[400px] lg:h-[430px]"
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
              className="group absolute left-1/2 top-[48%] w-44 overflow-hidden rounded-2xl bg-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/5 will-change-transform sm:w-56 lg:w-60"
              style={{ transform: "translate(-50%, -50%)" }}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
                {p.image ? (
                  <Image src={p.image} alt={p.name} fill sizes="(min-width: 1024px) 240px, (min-width: 640px) 224px, 176px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <ProductImage product={p} sizes="240px" />
                )}
                {p.capacity && (
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold text-gray-800 shadow-sm backdrop-blur sm:text-[11px]">{p.capacity}</span>
                )}
              </div>
              <div className="px-3.5 py-3">
                <p className="line-clamp-1 text-[13px] font-bold text-gray-900 group-hover:text-brand-700 sm:text-sm">{p.name}</p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:text-[11px]">{p.condition === "new" ? "Factory Made" : "Reconditioned"}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
