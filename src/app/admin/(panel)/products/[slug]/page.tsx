import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { PageHeader } from "@/components/admin/ui";
import { deleteProduct } from "../actions";
import { getAdminCategories, getAdminProduct } from "../data";
import { ProductForm } from "../product-form";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return { title: `Edit ${(await params).slug}` };
}

export default async function EditProductPage({ params }: Params) {
  const s = await requireAdmin();
  const { slug } = await params;
  const [product, categories] = await Promise.all([getAdminProduct(slug), getAdminCategories()]);
  if (!product) notFound();

  return (
    <>
      <Link href="/admin/products" className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-700"><ArrowLeft className="h-4 w-4" /> Products</Link>
      <PageHeader
        title={product.name}
        sub={product.nameBn}
        actions={
          <div className="flex items-center gap-2">
            {product.active && <Link href={`/product/${product.slug}`} target="_blank" className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"><ExternalLink className="h-4 w-4" /> View</Link>}
            {s.role === "owner" && (
              <form action={deleteProduct.bind(null, product.slug)}>
                <ConfirmButton message={`Delete "${product.name}"? Past orders keep their copy of the name. Tip: untick "Visible on website" to just hide it.`} className="rounded-lg border border-accent-600 px-3 py-1.5 text-sm font-semibold text-accent-600 hover:bg-accent-50">
                  Delete
                </ConfirmButton>
              </form>
            )}
          </div>
        }
      />
      <ProductForm categories={categories} initial={product} />
    </>
  );
}
