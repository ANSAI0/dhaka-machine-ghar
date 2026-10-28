// Browser-side conversion events. The same eventId is sent server-side via CAPI (lib/capi.ts)
// so Meta de-duplicates the pair.

type Fbq = (cmd: "track", event: string, params?: Record<string, unknown>, opts?: { eventID?: string }) => void;

export function trackConversion(event: "Purchase" | "Lead" | "AddToCart" | "InitiateCheckout", params: Record<string, unknown>, eventId?: string) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { fbq?: Fbq; dataLayer?: unknown[] };
  w.fbq?.("track", event, params, eventId ? { eventID: eventId } : undefined);
  (w.dataLayer ??= []).push({ event: `dmg_${event.toLowerCase()}`, event_id: eventId, ...params });
}
