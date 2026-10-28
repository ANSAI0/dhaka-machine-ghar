"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

export type Me = { name: string; phone: string; email: string | null; address: string | null; district: string | null; verified: boolean };

// Loaded client-side so storefront pages stay static; refreshed on every navigation (login/logout).
const Ctx = createContext<{ me: Me | null; ready: boolean }>({ me: null, ready: false });

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [state, setState] = useState<{ me: Me | null; ready: boolean }>({ me: null, ready: false });
  useEffect(() => {
    let cancelled = false;
    fetch("/api/account/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((me: Me | null) => !cancelled && setState({ me, ready: true }))
      .catch(() => !cancelled && setState({ me: null, ready: true }));
    return () => {
      cancelled = true;
    };
  }, [path]);
  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

// Safe outside the provider (ad landing pages): just returns "not signed in".
export const useCustomer = () => useContext(Ctx);
