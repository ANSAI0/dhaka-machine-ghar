import "server-only";
import { createHash } from "node:crypto";
import { cookies, headers } from "next/headers";
import { getMarketing } from "./settings";

const sha = (s: string) => createHash("sha256").update(s.trim().toLowerCase()).digest("hex");

// Meta Conversions API. No-op unless a pixel id and access token are configured.
// Personal data is SHA-256 hashed before it leaves the server, as Meta requires.
export async function sendCapiEvent(e: { name: "Purchase" | "Lead"; eventId: string; phone?: string; value?: number; url?: string }) {
  const { pixelId, capiToken, capiTestCode } = await getMarketing();
  if (!pixelId || !capiToken) return;

  const h = await headers();
  const c = await cookies();
  const phoneDigits = e.phone?.replace(/\D/g, "");
  const body = {
    data: [
      {
        event_name: e.name,
        event_time: Math.floor(Date.now() / 1000),
        event_id: e.eventId,
        action_source: "website",
        event_source_url: e.url ?? h.get("referer") ?? undefined,
        user_data: {
          ph: phoneDigits ? [sha(phoneDigits.startsWith("880") ? phoneDigits : `88${phoneDigits}`)] : undefined,
          country: [sha("bd")],
          client_ip_address: h.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
          client_user_agent: h.get("user-agent") ?? undefined,
          fbp: c.get("_fbp")?.value,
          fbc: c.get("_fbc")?.value,
        },
        custom_data: e.value ? { currency: "BDT", value: e.value } : undefined,
      },
    ],
    ...(capiTestCode ? { test_event_code: capiTestCode } : {}),
  };

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${encodeURIComponent(capiToken)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error("CAPI error", res.status, await res.text());
  } catch (err) {
    console.error("CAPI request failed", err);
  }
}
