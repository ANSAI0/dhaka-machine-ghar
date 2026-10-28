"use client";

import { useState } from "react";

export function ProductTabs({ tabs }: { tabs: { id: string; label: string; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  return (
    <section>
      <div role="tablist" className="no-scrollbar mb-5 flex gap-1 overflow-x-auto border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setActive(t.id)}
            className={`shrink-0 border-b-[3px] px-4 pb-3 text-sm font-bold sm:px-6 sm:text-base ${
              active === t.id ? "border-accent-600 text-brand-700" : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={active !== t.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
          {t.content}
        </div>
      ))}
    </section>
  );
}
