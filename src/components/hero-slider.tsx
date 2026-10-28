"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { heroImages, heroVideo } from "@/lib/hero-images";

type Media = { src: string; credit: string; source: string };

type Slide = {
  kicker: string;
  title: string; // Bangla headline, set in the display face
  text: string;
  cta: { href: string; label: string };
  alt: { href: string; label: string };
  image?: Media;
  video?: Media & { poster: string };
  position?: string; // object-position, keeps the subject clear of the text
  duration?: number; // ms on screen
};

const slides: Slide[] = [
  {
    kicker: "Workshop Machines",
    title: "লেদ, শেপার, মিলিং ও ড্রিল মেশিন",
    text: "Foreign & reconditioned workshop machines — serviced, tested and covered by warranty.",
    cta: { href: "/category/workshop", label: "Workshop Machines" },
    alt: { href: "/contact", label: "Visit Showroom" },
    video: heroVideo,
    duration: 9000,
  },
  {
    kicker: "Factory Made",
    title: "পাওয়ার প্রেস মেশিন ১০ – ১০০ টন",
    text: "Channel body, C-frame and hydraulic presses — built in our own Keraniganj factory.",
    cta: { href: "/category/power-press", label: "Shop Power Press" },
    alt: { href: "/quotation", label: "Get a Quote" },
    image: heroImages.sparks,
    position: "70% center",
  },
  {
    kicker: "Metalworking",
    title: "প্রেস ব্রেক, শিয়ার ও বেন্ডার",
    text: "Sheet-metal fabrication machines with local service support across Bangladesh.",
    cta: { href: "/category/fabrication", label: "View Fabrication" },
    alt: { href: "/shop", label: "All Machines" },
    image: heroImages.welding,
    position: "75% center",
  },
  {
    kicker: "Custom Build",
    title: "আপনার মাপে, আপনার টনেজে",
    text: "From design to delivery — follow every step online. Book with a small advance.",
    cta: { href: "/quotation", label: "Custom Quotation" },
    alt: { href: "/track", label: "Track Order" },
    image: heroImages.workshop,
  },
];

const DURATION = 4500;
const durationOf = (n: number) => slides[n].duration ?? DURATION;

export function HeroSlider() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const video = useRef<HTMLVideoElement>(null);
  const root = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(true);
  // Phones get the poster still instead of the video (and no zoom): lighter to scroll and saves data.
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const go = (n: number) => setI((n + slides.length) % slides.length);
  const media = (slides[i].image ?? slides[i].video) as Media;

  useEffect(() => {
    if (paused || !inView) return;
    const t = setTimeout(() => setI((x) => (x + 1) % slides.length), durationOf(i));
    return () => clearTimeout(t);
  }, [i, paused, inView]);

  // Off screen: stop the video, the slide timer and the zoom so scrolling stays smooth on phones.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The clip only plays while its slide is showing, and restarts each time it comes back.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (slides[i].video && inView) {
      v.currentTime = 0;
      v.play().catch(() => {});
    } else v.pause();
  }, [i, inView, wide]);

  return (
    <section
      ref={root}
      className={`group/hero relative overflow-hidden rounded-2xl bg-ink shadow-xl ring-1 ring-black/5 sm:rounded-3xl ${inView ? "" : "[&_*]:[animation-play-state:paused]"}`}
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1);
        touchX.current = null;
      }}
    >
      <div className="relative h-[300px] sm:h-[440px] lg:h-[520px]">
        {slides.map((s, idx) => {
          const on = idx === i;
          return (
            <div
              key={s.title}
              className={`absolute inset-0 transition-opacity duration-700 ${on ? "opacity-100" : "pointer-events-none opacity-0"}`}
              aria-hidden={!on}
            >
              {s.video && wide ? (
                <video
                  ref={video}
                  src={s.video.src}
                  poster={s.video.poster}
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload="auto"
                  aria-hidden
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className={`absolute inset-0 ${on ? "md:animate-kenburns" : ""}`}>
                  <Image
                    src={s.image?.src ?? s.video!.poster}
                    alt=""
                    fill
                    priority={idx === 0}
                    sizes="(min-width: 1024px) 75vw, 100vw"
                    className="object-cover"
                    style={{ objectPosition: s.position ?? "center" }}
                  />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-black/20 sm:hidden" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />

              <div className="relative z-10 flex h-full max-w-[640px] flex-col justify-center gap-2.5 px-5 pb-9 sm:gap-4 sm:px-10 lg:px-14">
                <span className={`flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur sm:text-xs ${on ? "animate-rise" : ""}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-500 shadow-[0_0_0_3px_rgba(179,18,31,0.35)] lux:bg-gold-400 lux:shadow-[0_0_0_3px_rgba(214,174,85,0.3)]" /> {s.kicker}
                </span>
                <h2 className={`font-display text-balance text-[27px] font-bold leading-[1.25] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] sm:text-[42px] lg:text-[54px] ${on ? "animate-rise [animation-delay:120ms]" : ""}`}>{s.title}</h2>
                <p className={`hidden max-w-md text-sm leading-relaxed sm:block text-white/90 drop-shadow sm:text-base ${on ? "animate-rise [animation-delay:240ms]" : ""}`}>{s.text}</p>
                <div className={`mt-1 flex gap-2 sm:gap-3 ${on ? "animate-rise [animation-delay:360ms]" : ""}`}>
                  <Link href={s.cta.href} tabIndex={on ? 0 : -1} className="flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-accent-600 px-3.5 py-2 text-[13px] font-bold sm:gap-2 sm:text-sm text-white shadow-lg shadow-accent-600/30 transition hover:bg-accent-500 sm:px-6 sm:py-3 lux:bg-gold-gradient lux:text-lux-950 lux:shadow-gold-500/40">
                    {s.cta.label} <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href={s.alt.href} tabIndex={on ? 0 : -1} className="whitespace-nowrap rounded-xl border border-white/30 bg-white/10 px-3.5 py-2 text-[13px] font-bold sm:text-sm text-white backdrop-blur transition hover:bg-white/20 sm:px-6 sm:py-3">
                    {s.alt.label}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Counter + progress */}
      <div className="absolute bottom-4 left-5 z-20 flex items-center gap-3 sm:bottom-6 sm:left-10 lg:left-14">
        <span className="font-mono text-xs font-bold text-white/90">
          {String(i + 1).padStart(2, "0")}<span className="text-white/40"> / {String(slides.length).padStart(2, "0")}</span>
        </span>
        <div className="flex gap-1.5">
          {slides.map((s, idx) => (
            <button key={s.title} onClick={() => setI(idx)} aria-label={`Slide ${idx + 1}`} className="relative h-1 w-7 overflow-hidden rounded-full bg-white/25 sm:w-10">
              {idx < i && <span className="absolute inset-0 bg-white" />}
              {idx === i && (
                <span
                  key={`${i}-${paused}`}
                  className="absolute inset-0 origin-left bg-accent-500 lux:bg-gold-400"
                  style={
                    paused
                      ? undefined
                      : { animation: `hero-progress ${durationOf(i)}ms linear forwards`, animationPlayState: inView ? "running" : "paused" }
                  }
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="absolute bottom-3 right-3 z-20 hidden gap-2 sm:bottom-5 sm:right-5 sm:flex">
        <button onClick={() => go(i - 1)} aria-label="Previous slide" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur transition hover:bg-white hover:text-ink">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={() => go(i + 1)} aria-label="Next slide" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur transition hover:bg-white hover:text-ink">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <a href={media.source} target="_blank" rel="noopener nofollow" className="absolute right-3 top-2 z-20 hidden text-[9px] text-white/45 hover:text-white/80 sm:right-5 sm:block">
        {slides[i].video ? "Video" : "Photo"}: {media.credit}
      </a>
    </section>
  );
}
