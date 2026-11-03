// npx tsx scripts/sync-catalog.ts
// Replaces the whole catalog with prisma/seed-data/catalog.ts: removes every product and category not
// in it (their offers go too; past orders and warranties keep their item names) and writes the rest.
import { PrismaClient, type Prisma } from "@prisma/client";
import { seedCategories, seedProducts } from "../prisma/seed-data/catalog";

const db = new PrismaClient();

async function main() {
  const slugs = seedProducts.map((p) => p.slug);
  const removed = await db.product.deleteMany({ where: { slug: { notIn: slugs } } });
  const catSlugs = seedCategories.map((c) => c.slug);
  const removedCats = await db.category.deleteMany({ where: { slug: { notIn: catSlugs } } });

  for (const [ci, c] of seedCategories.entries()) {
    const cat = await db.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, nameBn: c.nameBn, icon: c.icon, sortOrder: ci },
      create: { slug: c.slug, name: c.name, nameBn: c.nameBn, icon: c.icon, sortOrder: ci },
    });
    await db.subcategory.deleteMany({ where: { categoryId: cat.id, slug: { notIn: c.subcategories.map((s) => s.slug) } } });
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
      oldPrice: null,
      image: p.image ?? null,
      imageCredit: null,
      imageSource: null,
      brand: p.brand,
      capacity: p.capacity,
      voltage: p.voltage,
      short: p.short,
      highlights: p.highlights,
      specs: p.specs as Prisma.InputJsonValue,
      featured: !!p.featured,
      landing: false,
      active: true,
      sortOrder: i,
    };
    await db.product.upsert({ where: { slug: p.slug }, update: data, create: { slug: p.slug, ...data } });
  }
  console.log(`Removed ${removed.count} products and ${removedCats.count} categories; catalog now ${seedProducts.length} products in ${seedCategories.length} categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
