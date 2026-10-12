import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Guidelines & Delivery | Vape Shop Dubai",
  description: "Express 3-hour vape delivery in Dubai & same-day shipping across Abu Dhabi, Sharjah, and UAE. Cash, card & online link payment on delivery available.",
  openGraph: {
    title: "Shipping Guidelines & Delivery | Vape Shop Dubai",
    description: "Express 3-hour vape delivery in Dubai & same-day shipping across Abu Dhabi, Sharjah, and UAE. Cash, card & online link payment on delivery available.",
    type: "website",
  },
  twitter: {
    title: "Shipping Guidelines & Delivery | Vape Shop Dubai",
    description: "Express 3-hour vape delivery in Dubai & same-day shipping across Abu Dhabi, Sharjah, and UAE. Cash, card & online link payment on delivery available.",
  },
};

export default function ShippingGuidelinesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
