"use client";

import { createContext, useContext } from "react";
import { findProduct, type Catalog } from "@/lib/catalog";

// Server layouts load the catalog from the database and hand it down here,
// so client components (cart, compare, header) can look products up synchronously.
const Ctx = createContext<Catalog | null>(null);

export function CatalogProvider({ catalog, children }: { catalog: Catalog; children: React.ReactNode }) {
  return <Ctx.Provider value={catalog}>{children}</Ctx.Provider>;
}

export function useCatalog() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCatalog must be used inside <CatalogProvider>");
  return { ...c, getProduct: (slug: string) => findProduct(c, slug) };
}
