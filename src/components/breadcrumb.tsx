import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1 text-xs text-gray-500 sm:text-sm max-md:text-white/45">
      <Link href="/" className="hover:text-brand-700">
        Home
      </Link>
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5" />
          {it.href ? (
            <Link href={it.href} className="hover:text-brand-700">
              {it.label}
            </Link>
          ) : (
            <span className="font-semibold text-gray-800 max-md:text-gold-300">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
