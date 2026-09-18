import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Vape Shop Dubai",
  description: "Get in touch with Vape Shop Dubai. Have questions about products, orders, or fast delivery? Contact us via WhatsApp or email 7 days a week.",
  openGraph: {
    title: "Contact Us | Vape Shop Dubai",
    description: "Get in touch with Vape Shop Dubai. Have questions about products, orders, or fast delivery? Contact us via WhatsApp or email 7 days a week.",
    type: "website",
  },
  twitter: {
    title: "Contact Us | Vape Shop Dubai",
    description: "Get in touch with Vape Shop Dubai. Have questions about products, orders, or fast delivery? Contact us via WhatsApp or email 7 days a week.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
