import "server-only";
import { db } from "./db";
import { checkUnsubscribe } from "./email-token";

export async function unsubscribe(cid: string, token: string) {
  if (!cid || !token || !checkUnsubscribe(cid, token)) return false;
  const r = await db.customer.updateMany({ where: { id: cid }, data: { newsletter: false, unsubscribedAt: new Date() } });
  return r.count > 0;
}
