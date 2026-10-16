import type { Metadata } from "next";
import CollectionPage from "../collections/[handle]/page";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Shop All Vape Products | Vape Shop Dubai",
  description:
    "Explore Dubai's complete range of authentic vape kits, JUUL pods, MYLE systems, disposable vapes, and premium e-liquids with 3-hour express delivery across UAE.",
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: "Shop All Vape Products | Vape Shop Dubai",
    description:
      "Explore Dubai's complete range of authentic vape kits, JUUL pods, MYLE systems, disposable vapes, and premium e-liquids with 3-hour express delivery across UAE.",
    url: "/shop",
    type: "website",
  },
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams?: Promise<{ preview?: string; __vs_preview?: string; sub?: string }>;
}) {
  return await CollectionPage({
    params: Promise.resolve({ handle: "all" }),
    searchParams,
  });
}
