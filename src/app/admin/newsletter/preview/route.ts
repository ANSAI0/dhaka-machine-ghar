import { requireAdmin } from "@/lib/auth";
import { renderWeekly, weeklyItems } from "@/lib/newsletter";
import { getEmailSettings, getSite } from "@/lib/settings";
import { siteUrl } from "@/lib/url";

// Shows exactly what this week's update email will look like (sample recipient).
export async function GET() {
  await requireAdmin("owner");
  const [site, items, cfg] = await Promise.all([getSite(), weeklyItems(), getEmailSettings()]);
  const { html } = renderWeekly({ name: "গ্রাহক", items, note: cfg.weeklyNote, site, unsubscribe: `${siteUrl()}/unsubscribe` });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
