import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { SESSION_COOKIE, verifySession, type Session } from "./session";

export async function getSession() {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}

// Every admin page and server action calls this — middleware alone is not the security boundary.
// The user is re-read from the DB so removed users and role changes take effect immediately.
export async function requireAdmin(role?: Session["role"]): Promise<Session> {
  const s = await getSession();
  const user = s ? await db.adminUser.findUnique({ where: { id: s.uid }, select: { id: true, name: true, role: true } }) : null;
  if (!user) redirect("/admin/login");
  if (role === "owner" && user.role !== "owner") redirect("/admin?denied=1");
  return { uid: user.id, name: user.name, role: user.role };
}
