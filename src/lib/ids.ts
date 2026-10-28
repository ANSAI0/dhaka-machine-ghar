// Human-readable ids, e.g. DMG-261027-4821. Collisions are retried by withUniqueId (db.ts).
export function makeId(prefix: string) {
  const d = new Date();
  const ymd = `${d.getFullYear() % 100}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `${prefix}-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`;
}
