// npm run db:seed          → load/refresh the catalog from prisma/seed-data
// npm run db:seed -- --demo → also add a demo order + warranties for trying /track and /warranty
import { PrismaClient, type Prisma } from "@prisma/client";
import { seedCategories, seedProducts } from "./seed-data/catalog";

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
      image: p.image ?? null,
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

seedCatalog()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
