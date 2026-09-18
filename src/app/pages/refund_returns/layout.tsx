import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refunds & Returns Guidelines | Vape Shop Dubai",
  description: "Detailed returns, exchanges, and warranty policy for Vape Shop Dubai customers across Dubai, Abu Dhabi, and the UAE.",
  openGraph: {
    title: "Refunds & Returns Guidelines | Vape Shop Dubai",
    description: "Detailed returns, exchanges, and warranty policy for Vape Shop Dubai customers across Dubai, Abu Dhabi, and the UAE.",
    type: "website",
  },
  twitter: {
    title: "Refunds & Returns Guidelines | Vape Shop Dubai",
    description: "Detailed returns, exchanges, and warranty policy for Vape Shop Dubai customers across Dubai, Abu Dhabi, and the UAE.",
  },
};

export default function RefundReturnsUnderscoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
