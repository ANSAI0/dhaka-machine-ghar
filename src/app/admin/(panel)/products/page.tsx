import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { ExternalLink, Plus, Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatBDT } from "@/lib/site";
import { CategoryIcon } from "@/components/category-icon";
import { Badge, PageHeader } from "@/components/admin/ui";
import { toggleProduct } from "./actions";

export const metadata: Metadata = { title: "Products" };
export const dynamic = "force-dynamic";

type SP = Promise<{ q?: string; category?: string; saved?: string; deleted?: string }>;

export default async function ProductsPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const { q = "", category = "", saved, deleted } = await searchParams;
  const where: Prisma.ProductWhereInput = {};
  if (category) where.category = { slug: category };
  if (q.trim()) where.OR = [{ name: { contains: q.trim(), mode: "insensitive" } }, { nameBn: { contains: q.trim() } }, { slug: { contains: q.trim().toLowerCase() } }];

  const [products, categories] = await Promise.all([
    db.product.findMany({ where, orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }], include: { category: true, subcategory: true } }),
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <>
      <PageHeader
        title="Products"
        sub={`${products.length} product${products.length === 1 ? "" : "s"}`}
        actions={<Link href="/admin/products/new" className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700"><Plus className="h-4 w-4" /> New product</Link>}
      />
      {saved && <p className="mb-4 rounded-xl bg-brand-50 p-3 text-sm text-brand-800">Saved <strong>{saved}</strong>. The website is updated.</p>}
      {deleted && <p className="mb-4 rounded-xl bg-brand-50 p-3 text-sm text-brand-800">Product deleted.</p>}

      <form className="mb-4 flex flex-wrap gap-3">
        <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3">
          <Search className="h-4 w-4 text-gray-400" />
          <input name="q" defaultValue={q} placeholder="Search name or slug" aria-label="Search products" className="min-w-0 flex-1 py-2 text-sm outline-none" />
        </div>
        <select name="category" defaultValue={category} aria-label="Category" className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <button className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50">Filter</button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
            <tr><th className="px-4 py-3">Product</th><th className="px-3 py-3">Category</th><th className="px-3 py-3 text-right">Price</th><th className="px-3 py-3 text-center">Active</th><th className="px-3 py-3 text-center">Featured</th><th className="px-3 py-3 text-center">Landing page</th><th className="px-4 py-3" /></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => (
              <tr key={p.id} className={p.active ? "hover:bg-gray-50" : "bg-gray-50/60 text-gray-400"}>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-white">
                      {p.image ? <Image src={p.image} alt="" fill sizes="48px" className="object-contain p-1" /> : <CategoryIcon name={p.category.icon} className="h-6 w-6 text-brand-600/60" />}
                    </span>
                    <div className="min-w-0">
                      <Link href={`/admin/products/${p.slug}`} className="font-semibold text-gray-900 hover:text-brand-700">{p.name}</Link>
                      <p className="flex items-center gap-2 text-xs text-gray-500">
                        {p.capacity} · <Badge tone={p.condition === "new" ? "green" : "blue"}>{p.condition === "new" ? "New" : "Reconditioned"}</Badge>
                        {!p.image && <Badge tone="amber">no photo</Badge>}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-xs text-gray-600">{p.category.name}{p.subcategory && <span className="block text-gray-400">{p.subcategory.name}</span>}</td>
                <td className="px-3 py-2.5 text-right font-semibold">{formatBDT(p.price)}{p.oldPrice && <span className="block text-xs font-normal text-gray-400 line-through">{formatBDT(p.oldPrice)}</span>}</td>
                {(["active", "featured", "landing"] as const).map((f) => (
                  <td key={f} className="px-3 py-2.5 text-center">
                    <form action={toggleProduct.bind(null, p.slug, f)} className="inline">
                      <button aria-label={`Toggle ${f} for ${p.name}`} aria-pressed={p[f]} className={`relative h-6 w-11 rounded-full transition-colors ${p[f] ? "bg-brand-600" : "bg-gray-300"}`}>
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${p[f] ? "left-[22px]" : "left-0.5"}`} />
                      </button>
                    </form>
                    {f === "landing" && p.landing && (
                      <Link href={`/lp/${p.slug}`} target="_blank" aria-label="Open landing page" className="ml-2 inline-block align-middle text-brand-700"><ExternalLink className="h-4 w-4" /></Link>
                    )}
                  </td>
                ))}
                <td className="px-4 py-2.5 text-right"><Link href={`/admin/products/${p.slug}`} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold hover:bg-gray-50">Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
