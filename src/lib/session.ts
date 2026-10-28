import { jwtVerify, SignJWT } from "jose";

// Edge-safe (used by middleware too) — no Node or Prisma imports here.
// Admin and customer sessions use different cookies AND different JWT audiences,
// so a customer token can never be replayed as an admin one.
export const SESSION_COOKIE = "dmg_admin";
export const SESSION_DAYS = 7;
export const CUSTOMER_COOKIE = "dmg_customer";
export const CUSTOMER_DAYS = 30;

export type Session = { uid: string; name: string; role: "owner" | "staff" };
export type CustomerSession = { cid: string; name: string };

const key = () => {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET missing or too short");
  return new TextEncoder().encode(s);
};

export async function signSession(s: Session) {
  return new SignJWT({ ...s }).setProtectedHeader({ alg: "HS256" }).setAudience("admin").setIssuedAt().setExpirationTime(`${SESSION_DAYS}d`).sign(key());
}

export async function verifySession(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { audience: "admin" });
    return { uid: String(payload.uid), name: String(payload.name), role: payload.role === "owner" ? "owner" : "staff" };
  } catch {
    return null;
  }
}

export async function signCustomer(s: CustomerSession) {
  return new SignJWT({ ...s }).setProtectedHeader({ alg: "HS256" }).setAudience("customer").setIssuedAt().setExpirationTime(`${CUSTOMER_DAYS}d`).sign(key());
}

export async function verifyCustomer(token: string | undefined): Promise<CustomerSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { audience: "customer" });
    return { cid: String(payload.cid), name: String(payload.name) };
  } catch {
    return null;
  }
}
