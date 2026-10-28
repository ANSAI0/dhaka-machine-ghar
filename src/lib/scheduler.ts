import { maybeSendWeekly } from "./newsletter";

const HOUR = 3600_000;

// Hourly check for the weekly product email. NewsletterRun.weekKey is unique, so extra
// instances or restarts can't double-send. Hosts that sleep between requests should call
// /api/cron/newsletter from an external cron instead.
export function startScheduler() {
  const g = globalThis as unknown as { __dmgScheduler?: boolean };
  if (g.__dmgScheduler) return; // dev hot-reload re-runs register()
  g.__dmgScheduler = true;
  const tick = () => maybeSendWeekly().catch((e) => console.error("Weekly email check failed", e));
  setTimeout(tick, 60_000);
  setInterval(tick, HOUR);
}
