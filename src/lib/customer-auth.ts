import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { CUSTOMER_COOKIE, CUSTOMER_DAYS, signCustomer, verifyCustomer } from "./session";

// Re-reads the customer from the DB so deleted accounts are signed out immediately.
export async function getCustomer() {
  const s = await verifyCustomer((await cookies()).get(CUSTOMER_COOKIE)?.value);
  if (!s) return null;
  return db.customer.findUnique({ where: { id: s.cid } });
}

export async function requireCustomer(next = "/account") {
  const c = await getCustomer();
  if (!c) redirect(`/account/login?next=${encodeURIComponent(next)}`);
  return c;
}

export async function startCustomerSession(c: { id: string; name: string }) {
  (await cookies()).set(CUSTOMER_COOKIE, await signCustomer({ cid: c.id, name: c.name }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CUSTOMER_DAYS * 86400,
  });
}

export async function endCustomerSession() {
  (await cookies()).delete(CUSTOMER_COOKIE);
}

// Only allow same-site relative redirects after login.
export const safeNext = (n: string | null | undefined) => (n && n.startsWith("/") && !n.startsWith("//") && !n.startsWith("/admin") ? n : "/account");
