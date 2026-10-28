// npm run db:seed          → load/refresh the catalog from prisma/seed-data
// npm run db:seed -- --demo → also add a demo order + warranties for trying /track and /warranty
import { PrismaClient, type Prisma } from "@prisma/client";
import { readFileSync } from "node:fs";
import path from "node:path";
import { seedCategories, seedProducts } from "./seed-data/catalog";

// Representative photos (Wikimedia Commons, free licences) — see prisma/seed-data/image-credits.json.
const photos: Record<string, { image: string; credit: string; source: string }> = JSON.parse(
  readFileSync(path.join(__dirname, "seed-data", "image-credits.json"), "utf8"),
);

const db = new PrismaClient();

async function seedCatalog() {
  for (const [ci, c] of seedCategories.entries()) {
    const cat = await db.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, nameBn: c.nameBn, icon: c.icon, sortOrder: ci },
      create: { slug: c.slug, name: c.name, nameBn: c.nameBn, icon: c.icon, sortOrder: ci },
    });
    for (const [si, s] of c.subcategories.entries()) {
      await db.subcategory.upsert({
        where: { categoryId_slug: { categoryId: cat.id, slug: s.slug } },
        update: { name: s.name, sortOrder: si },
        create: { slug: s.slug, name: s.name, sortOrder: si, categoryId: cat.id },
      });
    }
  }

  for (const [i, p] of seedProducts.entries()) {
    const cat = await db.category.findUniqueOrThrow({ where: { slug: p.category } });
    const sub = await db.subcategory.findUnique({ where: { categoryId_slug: { categoryId: cat.id, slug: p.subcategory } } });
    const data = {
      name: p.name,
      nameBn: p.nameBn,
      categoryId: cat.id,
      subcategoryId: sub?.id ?? null,
      condition: p.condition,
      price: p.price,
      oldPrice: p.oldPrice ?? null,
      image: photos[p.slug]?.image ?? p.image ?? null,
      imageCredit: photos[p.slug]?.credit ?? null,
      imageSource: photos[p.slug]?.source ?? null,
      brand: p.brand,
      capacity: p.capacity,
      voltage: p.voltage,
      short: p.short,
      highlights: p.highlights,
      specs: p.specs as Prisma.InputJsonValue,
      roi: (p.roi as Prisma.InputJsonValue) ?? undefined,
      videoId: p.videoId ?? null,
      featured: !!p.featured,
      landing: !!p.landing,
      landingCopy: (p.landingCopy as Prisma.InputJsonValue) ?? undefined,
      sortOrder: i,
    };
    // Existing products are left alone so admin edits (prices, specs) aren't overwritten by a re-seed.
    await db.product.upsert({ where: { slug: p.slug }, update: {}, create: { slug: p.slug, ...data } });
  }
  console.log(`Catalog: ${seedCategories.length} categories, ${seedProducts.length} products`);
}

async function seedDemo() {
  const daysAgo = (d: number) => new Date(Date.now() - d * 864e5);
  const press = await db.product.findUniqueOrThrow({ where: { slug: "channel-body-power-press-25-ton" } });
  const lathe = await db.product.findUniqueOrThrow({ where: { slug: "reconditioned-lathe-6ft" } });

  await db.order.deleteMany({ where: { id: { contains: "DEMO" } } });
  await db.order.create({
    data: {
      id: "DMG-DEMO-0001",
      createdAt: daysAgo(9),
      status: "load_test",
      name: "Demo Customer",
      phone: "01700000000",
      address: "Demo address",
      district: "Gazipur",
      payment: "advance",
      source: "demo",
      total: press.price,
      payNow: Math.round(press.price * 0.2),
      items: { create: [{ productId: press.id, slug: press.slug, name: press.name, qty: 1, price: press.price }] },
      events: {
        create: [
          { step: "registered", at: daysAgo(9) },
          { step: "fabrication", at: daysAgo(7), note: "চেসিস ওয়েল্ডিং শুরু" },
          { step: "motor_panel", at: daysAgo(3) },
          { step: "load_test", at: daysAgo(1), note: "ট্রায়াল রান চলছে" },
        ],
      },
    },
  });

  await db.serviceRequest.deleteMany({ where: { serial: { contains: "DEMO" } } });
  await db.warranty.deleteMany({ where: { serial: { contains: "DEMO" } } });
  await db.warranty.createMany({
    data: [
      { serial: "DMG-PP25-DEMO-0001", productId: press.id, slug: press.slug, productName: press.name, owner: "Demo Customer", phone: "01700000000", purchasedAt: daysAgo(60), months: 12 },
      { serial: "DMG-LT06-DEMO-0002", productId: lathe.id, slug: lathe.slug, productName: lathe.name, owner: "Old Customer", phone: "01800000000", purchasedAt: daysAgo(500), months: 6 },
    ],
  });
  console.log("Demo: /track?q=DMG-DEMO-0001 (phone 01700000000); warranty serials DMG-PP25-DEMO-0001 (active), DMG-LT06-DEMO-0002 (expired)");
}

seedCatalog()
  .then(() => (process.argv.includes("--demo") ? seedDemo() : undefined))
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
