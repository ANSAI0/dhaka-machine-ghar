"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";

// 1080p for wide screens, 720p for phones (half the download).
const SRC_HD = "/hero/dmg-workshop-1080.mp4";
const SRC_SD = "/hero/dmg-workshop-720.mp4";
const POSTER = "/hero/dmg-workshop-poster.webp";

// Home hero: a muted loop of metal work (grinding sparks, welding) dimmed behind a short headline. Plays only while on screen.
export function HeroSlider() {
  const box = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = box.current;
    const v = video.current;
    if (!el || !v) return;
    v.src = window.matchMedia("(min-width: 768px)").matches ? SRC_HD : SRC_SD;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={box} aria-label="Dhaka Machine Ghar workshop" className="relative isolate overflow-hidden rounded-2xl bg-ink shadow-lg sm:rounded-3xl">
      <video
        ref={video}
        poster={POSTER}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/85 via-ink/45 to-brand-900/20" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-ink/70 to-transparent" />

      <div className="flex h-[280px] flex-col justify-center px-5 sm:h-[400px] sm:px-10 lg:h-[460px] lg:px-14">
        <p className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/70 sm:text-xs">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-white/70" /> Dhaka Machine Ghar
        </p>
        <h2 className="mt-3 max-w-xl font-display text-[30px] font-bold leading-[1.15] text-white sm:text-5xl lg:text-[58px]">
          নিজস্ব কারখানায় তৈরি <span className="text-brand-200">শক্তিশালী মেশিন</span>
        </h2>
        <p className="mt-3 text-sm font-medium tracking-wide text-white/75 sm:text-base">Power Press · AC Stand · Workshop Machines</p>
        <Link
          href="/shop"
          className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-brand-800 shadow-lg transition hover:bg-brand-50 sm:px-6 sm:py-3"
        >
          মেশিন দেখুন <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
