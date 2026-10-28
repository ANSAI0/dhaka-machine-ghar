import Image from "next/image";
import type { Product } from "@/lib/catalog";
import { CategoryIcon } from "./category-icon";

// Real photo when we have one; otherwise a branded placeholder until the admin uploads images.
// `cover` fills the whole box (cards); the default keeps the full machine in view.
export function ProductImage({ product, sizes, priority, cover = false }: { product: Product; sizes: string; priority?: boolean; cover?: boolean }) {
  if (product.image) {
    return (
      <Image
        src={product.image}
        alt={product.name}
        fill
        sizes={sizes}
        priority={priority}
        className={`transition-transform duration-500 group-hover:scale-105 ${cover ? "object-cover" : "object-contain p-3"}`}
      />
    );
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-brand-50 to-steel-50 p-4 text-center max-md:from-lux-700 max-md:to-lux-900">
      <CategoryIcon name={product.icon} className="h-14 w-14 text-brand-600/70 max-md:text-gold-400/70" strokeWidth={1.25} />
      <span className="text-xs font-semibold text-brand-700/80 max-md:text-gold-300/70">{product.capacity}</span>
    </div>
  );
}
