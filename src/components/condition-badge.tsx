import type { Condition } from "@/lib/catalog";

export function ConditionBadge({ condition, className = "" }: { condition: Condition; className?: string }) {
  return condition === "new" ? (
    <span className={`rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white ${className}`}>
      Brand New (Factory Made)
    </span>
  ) : (
    <span className={`rounded-full bg-steel-600 px-2 py-0.5 text-[10px] font-bold text-white ${className}`}>
      Foreign Reconditioned
    </span>
  );
}
