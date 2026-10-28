"use client";

import { useId } from "react";

// Illustrated support agent wearing a headset — used for the chat assistant.
export function SupportAvatar({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, ""); // unique gradient/clip ids when two avatars share a page
  return (
    <svg viewBox="9 10 46 46" className={className} role="img" aria-label="Support agent with headset">
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e8f3ee" />
          <stop offset="1" stopColor="#cfe3f2" />
        </linearGradient>
        <clipPath id={`${id}clip`}>
          <circle cx="32" cy="32" r="32" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}clip)`}>
        <rect width="64" height="64" fill={`url(#${id}bg)`} />
        {/* shirt & collar */}
        <path d="M8 64c1.5-11 10.5-17.5 24-17.5S54.5 53 56 64z" fill="var(--color-brand-600, #2e5e47)" />
        <path d="M25.5 47.5 32 55l6.5-7.5c-2-.7-4.2-1-6.5-1s-4.5.3-6.5 1z" fill="#fff" />
        {/* neck */}
        <path d="M27.5 40h9v8.5c-1.4 1.2-2.9 1.8-4.5 1.8s-3.1-.6-4.5-1.8z" fill="#e3ab84" />
        {/* face */}
        <ellipse cx="32" cy="30" rx="11.5" ry="13" fill="#f2c4a0" />
        {/* hair */}
        <path d="M20.3 29.5c-.9-9 4.4-15 11.9-15s12.6 5.3 11.6 14.6c-1.6-4.3-4.2-6.8-7.6-7.7-3.7 2.8-9.3 3.8-15.9 8.1z" fill="#2b1d14" />
        {/* eyes & smile */}
        <circle cx="27.6" cy="30.5" r="1.3" fill="#2b1d14" />
        <circle cx="36.4" cy="30.5" r="1.3" fill="#2b1d14" />
        <path d="M28.2 36.2c2.3 2 5.3 2 7.6 0" stroke="#b85c3c" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        {/* headset band */}
        <path d="M18.6 31c0-9.2 6-15.8 13.4-15.8S45.4 21.8 45.4 31" stroke="#1f2937" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        {/* ear cups */}
        <rect x="15.2" y="26.6" width="6.4" height="10.4" rx="3" fill="var(--color-accent-600, #98000f)" />
        <rect x="42.4" y="26.6" width="6.4" height="10.4" rx="3" fill="var(--color-accent-600, #98000f)" />
        {/* microphone */}
        <path d="M18.4 36.4c0 4.6 3.3 7.2 8.6 7.4" stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
        <rect x="26.2" y="42" width="5" height="3.4" rx="1.7" fill="#1f2937" />
      </g>
    </svg>
  );
}

// Green "online" dot with a soft pulse.
export function OnlineDot({ className = "" }: { className?: string }) {
  return (
    <span className={`absolute flex h-3.5 w-3.5 ${className}`} aria-hidden>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
    </span>
  );
}
