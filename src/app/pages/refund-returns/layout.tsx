import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Refunds Policy | Vape Shop Dubai",
  description: "Read Vape Shop Dubai's Returns and Refunds policy. Learn about 24-hour warranty terms, returns eligibility, and exchange processes in the UAE.",
  openGraph: {
    title: "Returns & Refunds Policy | Vape Shop Dubai",
    description: "Read Vape Shop Dubai's Returns and Refunds policy. Learn about 24-hour warranty terms, returns eligibility, and exchange processes in the UAE.",
    type: "website",
  },
  twitter: {
    title: "Returns & Refunds Policy | Vape Shop Dubai",
    description: "Read Vape Shop Dubai's Returns and Refunds policy. Learn about 24-hour warranty terms, returns eligibility, and exchange processes in the UAE.",
  },
};

export default function RefundReturnsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
