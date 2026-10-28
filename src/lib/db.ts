import "server-only";
import { PrismaClient } from "@prisma/client";

// One client per process; dev hot-reload would otherwise open a new pool on every edit.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Retry an insert whose random human-readable id (DMG-…, QT-…) collided with an existing one.
export async function withUniqueId<T>(make: () => string, create: (id: string) => Promise<T>, tries = 5): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await create(make());
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code !== "P2002" || i >= tries - 1) throw e;
    }
  }
}
