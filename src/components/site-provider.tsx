"use client";

import { createContext, useContext } from "react";
import type { SiteInfo } from "@/lib/site";

// Business settings from Admin → Settings, loaded by the root layout.
const Ctx = createContext<SiteInfo | null>(null);

export function SiteProvider({ site, children }: { site: SiteInfo; children: React.ReactNode }) {
  return <Ctx.Provider value={site}>{children}</Ctx.Provider>;
}

export function useSite() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useSite must be used inside <SiteProvider>");
  return s;
}
