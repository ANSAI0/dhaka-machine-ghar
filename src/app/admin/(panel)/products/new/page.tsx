import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getAdminCategories } from "../data";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "../product-form";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <>
      <Link href="/admin/products" className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-700"><ArrowLeft className="h-4 w-4" /> Products</Link>
      <PageHeader title="New product" />
      <ProductForm categories={await getAdminCategories()} />
    </>
  );
}
