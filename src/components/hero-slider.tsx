"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { dmgVideo } from "@/lib/hero-images";
import type { Banner } from "@/lib/settings";
import { brand } from "@/lib/site";

const INTERVAL = 3000;
const SLIDE_MS = 500;
const YT_ORIGIN = "https://www.youtube-nocookie.com";

// Phone hero, no text: the DMG factory video plays first, then the banners slide every 3 s inside a
// framed box (shown whole, never cropped), looping through the banners. Browsers only autoplay
// muted video, so sound turns on at the visitor's first tap anywhere (or with the speaker button).
// Only `transform` animates, and everything stops while the hero is off screen.
export function HeroSlider({ banners }: { banners: Banner[] }) {
  const n = banners.length; // slides: 0 = video, 1…n = banners, n+1 = copy of banner 1 (seamless loop)
  const [i, setI] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const [phone, setPhone] = useState(false);
  const [muted, setMuted] = useState(true);
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const touchX = useRef<number | null>(null);

  const yt = (func: string, args: unknown[] = []) =>
    frame.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), YT_ORIGIN);

  // The video player only exists on phones (this component is hidden, not unmounted, on desktop).
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setPhone(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // First tap anywhere on the page turns the sound on.
  useEffect(() => {
    if (!phone) return;
    const on = () => {
      yt("unMute");
      yt("setVolume", [100]);
      setMuted(false);
    };
    document.addEventListener("pointerdown", on, { once: true });
    return () => document.removeEventListener("pointerdown", on);
  }, [phone]);

  // When the video ends, move on to the banners.
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== YT_ORIGIN || typeof e.data !== "string") return;
      try {
        const d = JSON.parse(e.data);
        const state = d.event === "onStateChange" ? d.info : d.info?.playerState;
        if (state === 0) {
          setAnimate(true);
          setI((x) => (x === 0 ? 1 : x));
        }
      } catch {}
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  // Play only while the video slide is showing and the hero is on screen.
  useEffect(() => {
    if (!phone) return;
    yt(i === 0 && inView ? "playVideo" : "pauseVideo");
  }, [i, inView, phone]);

  // Banners advance every 3 s; the video slide waits for the video to end (or a swipe).
  useEffect(() => {
    if (i === 0 || n < 1 || paused || !inView) return;
    const t = setTimeout(() => {
      setAnimate(true);
      setI((x) => x + 1);
    }, INTERVAL);
    return () => clearTimeout(t);
  }, [i, n, paused, inView]);

  // After sliding onto the copy of banner 1, jump back to the real one without animating.
  useEffect(() => {
    if (i !== n + 1) return;
    const t = setTimeout(() => {
      setAnimate(false);
      setI(1);
    }, SLIDE_MS);
    return () => clearTimeout(t);
  }, [i, n]);

  const count = n + 1;
  const dot = i > n ? 1 : i;
  const go = (to: number) => {
    setAnimate(true);
    setI(((to % count) + count) % count);
  };
  const slides: (Banner | null)[] = [null, ...banners, ...(n ? [banners[0]] : [])];

  return (
    <section
      ref={root}
      aria-roledescription="carousel"
      aria-label="Dhaka Machine Ghar video and offers"
      className="relative rounded-2xl bg-white p-1.5 shadow-[0_10px_28px_-14px_rgba(16,24,40,0.45)] ring-1 ring-black/5 lux:bg-lux-800 lux:ring-white/10"
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
      <div className="relative aspect-video overflow-hidden rounded-xl bg-[#0e1a33] ring-1 ring-black/10">
        <ul
          className="flex h-full"
          style={{ transform: `translateX(-${i * 100}%)`, transition: animate ? `transform ${SLIDE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)` : "none" }}
        >
          {slides.map((b, idx) => {
            const hidden = idx !== i;
            return (
              <li key={b ? `${b.id}-${idx}` : "video"} className="relative h-full w-full shrink-0 overflow-hidden bg-black" aria-hidden={hidden}>
                {!b ? (
                  phone && (
                    // Oversized so YouTube's title/controls fall outside the box; taps pass through.
                    <iframe
                      ref={frame}
                      src={`${YT_ORIGIN}/embed/${dmgVideo.id}?${new URLSearchParams({
                        autoplay: "1",
                        mute: "1",
                        playsinline: "1",
                        controls: "0",
                        rel: "0",
                        modestbranding: "1",
                        iv_load_policy: "3",
                        disablekb: "1",
                        enablejsapi: "1",
                      })}`}
                      title="Dhaka Machine Ghar video"
                      allow="autoplay; encrypted-media"
                      tabIndex={-1}
                      onLoad={() => frame.current?.contentWindow?.postMessage(JSON.stringify({ event: "listening" }), YT_ORIGIN)}
                      className="pointer-events-none absolute left-1/2 top-1/2 h-[125%] w-[125%] -translate-x-1/2 -translate-y-1/2 border-0"
                    />
                  )
                ) : (
                  <BannerImage b={b} first={idx === 1} hidden={hidden} />
                )}
              </li>
            );
          })}
        </ul>

        {i === 0 && phone && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const next = !muted;
              yt(next ? "mute" : "unMute");
              if (!next) yt("setVolume", [100]);
              setMuted(next);
            }}
            aria-label={muted ? "Turn sound on" : "Mute"}
            className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white ring-1 ring-white/25"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        )}
      </div>

      <div className="flex justify-center gap-1.5 pb-0.5 pt-2">
        {Array.from({ length: count }, (_, idx) => (
          <button
            key={idx}
            onClick={() => go(idx)}
            aria-label={idx === 0 ? "Video" : `Banner ${idx}`}
            className={`h-1.5 w-1.5 rounded-full transition-[transform,background-color] duration-300 ${idx === dot ? "mx-1.5 scale-x-[3] bg-brand-700 lux:bg-gold-400" : "bg-gray-300 lux:bg-white/25"}`}
          />
        ))}
      </div>
    </section>
  );
}

function BannerImage({ b, first, hidden }: { b: Banner; first: boolean; hidden: boolean }) {
  const img = <Image src={b.image} alt={first ? `${brand.name} banner` : ""} fill sizes="100vw" className="object-contain" />;
  return b.link ? (
    <Link href={b.link} tabIndex={hidden ? -1 : undefined} className="absolute inset-0">
      {img}
    </Link>
  ) : (
    img
  );
}
