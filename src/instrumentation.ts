// Runs once when the Next.js server starts. The runtime check must wrap the import so the
// Node-only scheduler (nodemailer, Prisma) is left out of the edge bundle.
export async function register() {
  // On Vercel the server sleeps between requests; Vercel Cron calls /api/cron/newsletter instead.
  if (process.env.NEXT_RUNTIME === "nodejs" && !process.env.VERCEL) {
    const { startScheduler } = await import("./lib/scheduler");
    startScheduler();
  }
}
