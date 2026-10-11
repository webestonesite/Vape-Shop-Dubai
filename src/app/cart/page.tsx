import React from "react";
import type { Metadata } from "next";
import { getAllProducts } from "@/lib/shopify/products-fetch";
import CartPageClient from "./CartPageClient";

export const metadata: Metadata = {
  title: "Shopping Cart | Vape Shop Dubai",
  description:
    "Review your selected disposable vapes, pods, and accessories. Fast same-day express delivery across Dubai and UAE.",
  robots: {
    index: false,
    follow: true,
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CartPage() {
  const allProducts = await getAllProducts().catch(() => []);
  // Pick 4 popular or top-rated products for cross-sell recommendations
  const recommendedProducts = allProducts
    .filter((p) => !p.isSoldOut)
    .slice(0, 4);

  return <CartPageClient recommendedProducts={recommendedProducts} />;
}
