import "server-only";

const GOOGLE_HOSTS = new Set(["maps.app.goo.gl", "goo.gl", "maps.google.com", "www.google.com", "google.com", "www.google.com.bd", "google.com.bd"]);

// Pull a pin out of a Google Maps URL. Prefers the place pin (!3d…!4d…) over the viewport centre (@…).
function coordsFrom(url: string): string | null {
  const pin = url.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (pin) return `${pin[1]},${pin[2]}`;
  const q = url.match(/[?&](?:q|query|ll|destination)=(-?\d+(?:\.\d+)?)(?:,|%2C)\s*(-?\d+(?:\.\d+)?)/i);
  if (q) return `${q[1]},${q[2]}`;
  const at = url.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (at) return `${at[1]},${at[2]}`;
  const place = url.match(/\/place\/([^/@?]+)/);
  if (place) return decodeURIComponent(place[1].replace(/\+/g, " "));
  return null;
}

/**
 * Accepts a place name, "lat,lng", or a Google Maps link (including maps.app.goo.gl short links,
 * which are followed — Google hosts only). Returns what the embed's ?q= needs, or null if a link
 * couldn't be understood.
 */
export async function resolveMapQuery(input: string): Promise<string | null> {
  const v = input.trim();
  if (!/^https?:\/\//i.test(v)) return v;
  let url = v;
  for (let hop = 0; hop < 4; hop++) {
    const found = coordsFrom(url);
    if (found) return found;
    let host: string;
    try {
      host = new URL(url).hostname.toLowerCase();
    } catch {
      return null;
    }
    if (!GOOGLE_HOSTS.has(host)) return null;
    const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(8000) }).catch(() => null);
    const next = res?.headers.get("location");
    if (!next) return null;
    url = new URL(next, url).toString();
  }
  return coordsFrom(url);
}
