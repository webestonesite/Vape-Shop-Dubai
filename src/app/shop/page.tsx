import type { Metadata } from "next";
import CollectionPage from "../collections/[handle]/page";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Shop All Vape Products | Vape Shop Dubai",
  description:
    "Explore Dubai's complete range of authentic vape kits, JUUL pods, MYLE systems, disposable vapes, and premium e-liquids with 2-hour express delivery across UAE.",
  alternates: {
    canonical: "https://vapeshopdubai.webestone.net/shop",
  },
  openGraph: {
    title: "Shop All Vape Products | Vape Shop Dubai",
    description:
      "Explore Dubai's complete range of authentic vape kits, JUUL pods, MYLE systems, disposable vapes, and premium e-liquids with 2-hour express delivery across UAE.",
    url: "https://vapeshopdubai.webestone.net/shop",
    type: "website",
  },
};

export default function ShopPage() {
  return <CollectionPage params={Promise.resolve({ handle: "all" })} />;
}
