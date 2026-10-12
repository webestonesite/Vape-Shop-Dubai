import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Vape Products in Dubai | Vape Shop Dubai",
  description: "Browse our complete catalog of authentic disposable vapes, pod systems, e-liquids, coils, and vape kits in Dubai, UAE. Express 3-hour delivery across Dubai.",
  openGraph: {
    title: "Shop All Vape Products in Dubai | Vape Shop Dubai",
    description: "Browse our complete catalog of authentic disposable vapes, pod systems, e-liquids, coils, and vape kits in Dubai, UAE.",
    type: "website",
  },
  twitter: {
    title: "Shop All Vape Products in Dubai | Vape Shop Dubai",
    description: "Browse our complete catalog of authentic disposable vapes, pod systems, e-liquids, coils, and vape kits in Dubai, UAE.",
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
