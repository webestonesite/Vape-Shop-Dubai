import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Vape Shop Dubai",
  description: "Learn about Vape Shop Dubai — 100% authentic vapes, express 2-hour delivery in Dubai, cash on delivery, and genuine brands guarantee.",
  openGraph: {
    title: "About Us | Vape Shop Dubai",
    description: "Learn about Vape Shop Dubai — 100% authentic vapes, express 2-hour delivery in Dubai, cash on delivery, and genuine brands guarantee.",
    type: "website",
  },
  twitter: {
    title: "About Us | Vape Shop Dubai",
    description: "Learn about Vape Shop Dubai — 100% authentic vapes, express 2-hour delivery in Dubai, cash on delivery, and genuine brands guarantee.",
  },
};

export default function AboutUsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
