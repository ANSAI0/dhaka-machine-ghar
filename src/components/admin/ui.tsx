import Link from "next/link";

// Small shared building blocks for admin pages.

export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {sub && <p className="text-sm text-gray-500">{sub}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Card({ title, action, children, className = "" }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-gray-200 bg-white ${className}`}>
      {title && (
        <header className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h2 className="font-bold text-gray-800">{title}</h2>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

// Stat tile: label · value · optional delta vs a named period (up is good unless invert).
export function StatTile({ label, value, delta, href }: { label: string; value: string; delta?: { pct: number | null; period: string; invert?: boolean }; href?: string }) {
  const body = (
    <>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{value}</p>
      {delta && (
        <p className="mt-1 text-xs text-gray-500">
          {delta.pct === null ? (
            "—"
          ) : (
            <span className={(delta.pct >= 0) !== !!delta.invert ? "font-semibold text-brand-700" : "font-semibold text-accent-600"}>
              {delta.pct >= 0 ? "▲" : "▼"} {Math.abs(delta.pct)}%
            </span>
          )}{" "}
          vs {delta.period}
        </p>
      )}
    </>
  );
  const cls = "block rounded-2xl border border-gray-200 bg-white p-5";
  return href ? <Link href={href} className={`${cls} hover:border-brand-200`}>{body}</Link> : <div className={cls}>{body}</div>;
}

export function Badge({ children, tone = "gray" }: { children: React.ReactNode; tone?: "gray" | "green" | "red" | "blue" | "amber" }) {
  const tones = {
    gray: "bg-gray-100 text-gray-700",
    green: "bg-brand-50 text-brand-700",
    red: "bg-accent-50 text-accent-700",
    blue: "bg-steel-50 text-steel-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export const compactBDT = (n: number) =>
  n >= 1e7 ? `৳${(n / 1e7).toFixed(2)} কোটি` : n >= 1e5 ? `৳${(n / 1e5).toFixed(1)} লাখ` : `৳${n.toLocaleString("en-IN")}`;

export const shortDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Dhaka" });
