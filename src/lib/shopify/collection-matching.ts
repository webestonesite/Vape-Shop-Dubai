import { Product } from "@/components/sections/ProductFeed";

export const CANONICAL_COLLECTION_ALIASES: Record<string, string> = {
  juul: "juul-vape-dubai",
  myle: "myle-vape-dubai",
  disposable: "disposable-vape",
  disposables: "disposable-vape",
  "e-liquid": "vape-e-juice",
  "e-liquids": "vape-e-juice",
  "e-juice": "vape-e-juice",
  "pod-systems": "pod-system",
  accessories: "pod-system",
  "50mg-disposable": "buy-50mg-disposable-vape-in-uae",
  "20mg-disposable": "buy-20mg-disposable-vape-uae",
  "0mg-disposable": "buy-0mg-disposable-vape-in-uae",
  "50mg": "buy-50mg-disposable-vape-in-uae",
  "20mg": "buy-20mg-disposable-vape-uae",
  "0mg": "buy-0mg-disposable-vape-in-uae",
};

export const CANONICAL_HANDLE_TITLES: Record<string, string> = {
  "juul-vape-dubai": "Juul Vape Dubai",
  "juul-2-series": "Juul 2 Series",
  "juul-1-series": "Juul 1 Series",
  "juul-pods-offers": "Juul Pods Offers",
  "myle-vape-dubai": "Myle Vape Dubai",
  "myle-v5-pods": "Myle V5 Pods",
  "myle-v5-device": "Myle V5 Devices",
  "myle-disposable": "Myle Disposables",
  "disposable-vape": "Disposable Vape Dubai",
  "buy-50mg-disposable-vape-in-uae": "50MG Disposable",
  "buy-20mg-disposable-vape-uae": "20MG Disposable",
  "buy-0mg-disposable-vape-in-uae": "0MG Disposable",
  "al-fakher-vape": "Al Fakher Vape",
  "elf-bar-vape": "Elf Bar Vape",
  "lost-mary-disposable": "Lost Mary Disposable",
  "tugboat-vape": "Tugboat Vape",
  "vozol-vape": "Vozol Vape",
  "vape-e-juice": "Vape E-Juice",
  "pod-system": "Pod Systems & Kits",
  brand: "Certified Vape Brands",
  all: "All Vape Products",
  shop: "All Vape Products",
};

/**
 * Filter products strictly for a given collection handle.
 * Strictly adheres to Shopify backend assignment.
 * If backend has 0 products for a collection, returns empty array — NO fallback products.
 */
export function getMatchingCollectionProducts(
  products: Product[],
  handle: string
): Product[] {
  if (!products || products.length === 0) return [];

  const hLower = (handle || "").toLowerCase().trim();

  // Root or all products
  if (!hLower || hLower === "all" || hLower === "shop") {
    return products;
  }

  const targetHandle = CANONICAL_COLLECTION_ALIASES[hLower] || hLower;

  // Strictly match only products assigned to this collection in Shopify backend
  return products.filter((p) => {
    const pCollections = (p.collections || []).map((c) => c.toLowerCase());
    return pCollections.includes(hLower) || pCollections.includes(targetHandle);
  });
}
