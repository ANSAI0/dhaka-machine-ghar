import type { Prisma } from "@prisma/client";

// An offer counts when it's switched on and today is inside its (optional) start/end dates.
export const activeOfferWhere = (now = new Date()): Prisma.OfferWhereInput => ({
  active: true,
  AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }, { OR: [{ endsAt: null }, { endsAt: { gt: now } }] }],
});

// Include the cheapest live offer with a product query.
export const liveOfferInclude = () => ({ where: activeOfferWhere(), orderBy: { offerPrice: "asc" as const }, take: 1 });

// The price a customer actually pays.
export const effectivePrice = (p: { price: number; offers?: { offerPrice: number }[] }) => {
  const o = p.offers?.[0];
  return o && o.offerPrice > 0 && o.offerPrice < p.price ? o.offerPrice : p.price;
};
