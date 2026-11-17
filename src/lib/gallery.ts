// Extra photos of the same product (same machine / colour / price), shown after its main photo.
// Keys are product slugs; files live in public/products/gallery/. Only photos the owner sent for that product.
export const productGallery: Record<string, string[]> = {
  "dmg-ac-outdoor-stand": ["/products/gallery/powder-coated-stand-making.webp"], // powder coated angle stand, ৳700
  "ac-stand-black": ["/products/gallery/ac-stand-black-truck.webp"], // black stands loaded for delivery
  "join-nut": ["/products/gallery/join-nut-sorting.webp"], // join nuts being sorted at the factory
};
