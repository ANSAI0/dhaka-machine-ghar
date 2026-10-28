"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const SRC = "/hero/dmg-factory.mp4";
const POSTER = "/hero/dmg-factory-poster.webp";

// Phone hero: only the DMG factory video, playing inside the framed box by itself (self-hosted MP4,
// so no YouTube player or tap needed). It tries to start with sound; where the browser blocks that,
// it starts muted and the sound comes on at the first tap, or with the speaker button. Loops; pauses
// while off screen.
export function HeroSlider() {
  const box = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [phone, setPhone] = useState(false);
  const [muted, setMuted] = useState(true);

  // The video only loads on phones (this component is hidden, not unmounted, on desktop).
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setPhone(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Try to start with sound; browsers usually refuse until the visitor has interacted with the page,
  // in which case it plays muted and the first tap/click/key turns the sound on.
  useEffect(() => {
    const v = video.current;
    if (!phone || !v) return;
    v.muted = false;
    v.play()
      .then(() => setMuted(false))
      .catch(() => {
        v.muted = true;
        setMuted(true);
        v.play().catch(() => {});
      });
    const unmute = () => {
      v.muted = false;
      v.play().catch(() => {});
      setMuted(false);
      off();
    };
    // Gestures that count as a user activation (a touch's pointerdown does not).
    const events = ["pointerup", "touchend", "click", "keydown"] as const;
    const off = () => events.forEach((t) => document.removeEventListener(t, unmute, true));
    events.forEach((t) => document.addEventListener(t, unmute, true));
    return off;
  }, [phone]);

  // Pause while scrolled away, resume when back.
  useEffect(() => {
    const el = box.current;
    const v = video.current;
    if (!el || !v) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()));
    io.observe(el);
    return () => io.disconnect();
  }, [phone]);

  return (
    <section
      ref={box}
      aria-label="Dhaka Machine Ghar factory video"
      className="relative rounded-2xl bg-white p-1.5 shadow-[0_10px_28px_-14px_rgba(16,24,40,0.45)] ring-1 ring-black/5 lux:bg-lux-800 lux:ring-white/10"
    >
      <div className="relative aspect-video overflow-hidden rounded-xl bg-black ring-1 ring-black/10">
        {phone ? (
          <video
            ref={video}
            src={SRC}
            poster={POSTER}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
            className="pointer-events-none h-full w-full object-cover"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- tiny poster placeholder off phones
          <img src={POSTER} alt="" className="h-full w-full object-cover" />
        )}
        {phone && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const v = video.current;
              if (!v) return;
              v.muted = !muted;
              if (muted) v.play().catch(() => {});
              setMuted(!muted);
            }}
            aria-label={muted ? "Turn sound on" : "Mute"}
            className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white ring-1 ring-white/25"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        )}
      </div>
    </section>
  );
}
