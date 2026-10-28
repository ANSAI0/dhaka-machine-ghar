import Image from "next/image";
import type { LucideIcon } from "lucide-react";

// Title banner for inner pages: near-black panel over a faint workshop photo, a soft brand glow
// and a dot grid. Keeps every page's heading in one premium style.
export function PageHero({
  eyebrow,
  title,
  text,
  image,
  Icon,
  center = false,
  children,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  image?: string;
  Icon?: LucideIcon;
  center?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative mb-6 overflow-hidden rounded-2xl bg-ink text-white shadow-lg ring-1 ring-black/5 sm:rounded-3xl max-md:ring-gold-400/20">
      {image && <Image src={image} alt="" fill sizes="100vw" className="object-cover opacity-30 grayscale-[35%]" />}
      <div className={`absolute inset-0 ${center ? "bg-ink/75" : "bg-gradient-to-r from-ink via-ink/85 to-ink/40"}`} />
      <div className="pointer-events-none absolute -left-24 -top-28 h-72 w-72 rounded-full bg-brand-600/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-10 h-64 w-64 rounded-full bg-steel-600/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      {Icon && !center && <Icon className="pointer-events-none absolute -right-6 top-1/2 hidden h-48 w-48 -translate-y-1/2 text-white/[0.06] sm:block" strokeWidth={1} />}

      <div className={`relative px-5 py-7 sm:px-10 sm:py-10 ${center ? "text-center" : ""}`}>
        <p className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/60 ${center ? "justify-center" : ""}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-accent-500 shadow-[0_0_0_3px_rgba(179,18,31,0.3)] max-md:bg-gold-400 max-md:shadow-[0_0_0_3px_rgba(214,174,85,0.25)]" /> {eyebrow}
        </p>
        <h1 className="mt-2 text-[26px] font-bold leading-tight sm:text-4xl">{title}</h1>
        {text && <p className={`mt-2 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base ${center ? "mx-auto" : ""}`}>{text}</p>}
        {children && <div className="mt-5">{children}</div>}
      </div>
    </section>
  );
}
