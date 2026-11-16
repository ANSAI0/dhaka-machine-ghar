// Wipe test/demo records so the admin panel starts empty: orders, quotes, warranties, service
// requests, chats, leads, SMS logs, customers, OTPs and newsletter runs.
// Keeps products, categories, settings, offers and admin users.
//   npx tsx scripts/clean-admin.ts          -> shows counts only
//   npx tsx scripts/clean-admin.ts --yes    -> deletes
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const counts = {
    orders: await db.order.count(),
    quotes: await db.quote.count(),
    warranties: await db.warranty.count(),
    serviceRequests: await db.serviceRequest.count(),
    chats: await db.chatSession.count(),
    leads: await db.lead.count(),
    smsLogs: await db.smsLog.count(),
    customers: await db.customer.count(),
    otpCodes: await db.otpCode.count(),
    newsletterRuns: await db.newsletterRun.count(),
  };
  console.log(counts);
  if (!process.argv.includes("--yes")) return console.log("Dry run. Add --yes to delete.");

  // Children first so foreign keys never block a delete.
  await db.$transaction([
    db.orderEvent.deleteMany(),
    db.orderItem.deleteMany(),
    db.serviceRequest.deleteMany(),
    db.warranty.deleteMany(),
    db.order.deleteMany(),
    db.quote.deleteMany(),
    db.lead.deleteMany(),
    db.chatSession.deleteMany(),
    db.smsLog.deleteMany(),
    db.otpCode.deleteMany(),
    db.newsletterRun.deleteMany(),
    db.customer.deleteMany(),
  ]);
  console.log("Deleted. Admin panel is clean.");
}

main().finally(() => db.$disconnect());
