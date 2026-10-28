"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const embed = (id: string, params: Record<string, string>) =>
  `https://www.youtube-nocookie.com/embed/${id}?${new URLSearchParams({ rel: "0", modestbranding: "1", playsinline: "1", ...params })}`;

// Muted, looping YouTube video sized to cover its box (like object-fit: cover), oversized so YouTube's
// title and control bars fall outside the box. Plays only while `active`; fades in after the player's
// start-up overlay has gone, so the poster underneath shows until then.
export function YouTubeBackground({ id, active }: { id: string; active: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      const w = Math.max(width, (height * 16) / 9) * 1.3;
      setSize({ w, h: (w * 9) / 16 });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const cmd = active ? "playVideo" : "pauseVideo";
    frame.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func: cmd, args: [] }), "*");
  }, [active, ready]);

  return (
    <div ref={box} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {size.w > 0 && (
        <iframe
          ref={frame}
          src={embed(id, { autoplay: "1", mute: "1", loop: "1", playlist: id, controls: "0", disablekb: "1", iv_load_policy: "3", enablejsapi: "1" })}
          title="Dhaka Machine Ghar video"
          allow="autoplay; encrypted-media"
          tabIndex={-1}
          onLoad={() => setTimeout(() => setReady(true), 4000)}
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
          style={{ width: size.w, height: size.h, border: 0 }}
        />
      )}
    </div>
  );
}

// Full-screen player with sound, opened from a button.
export function YouTubeModal({ id, onClose }: { id: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Video" className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-3" onClick={onClose}>
      <button onClick={onClose} aria-label="Close video" className="absolute right-3 top-3 rounded-full bg-white/10 p-2 text-white ring-1 ring-white/20 hover:bg-white/20">
        <X className="h-6 w-6" />
      </button>
      <div className="aspect-video w-full max-w-4xl overflow-hidden rounded-xl bg-black shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <iframe src={embed(id, { autoplay: "1" })} title="Dhaka Machine Ghar video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen className="h-full w-full border-0" />
      </div>
    </div>,
    document.body,
  );
}
