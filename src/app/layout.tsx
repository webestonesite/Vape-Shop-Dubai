import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ThemeSettingsProvider } from "@/context/ThemeSettingsContext";
import { getThemeSettings } from "@/lib/theme/get-settings";
import { LazyWhatsApp } from "@/components/layout/LazyWhatsApp";
import { headers } from "next/headers";
import { CanonicalHead } from "@/components/layout/CanonicalHead";
import {
  getOrganizationSchema,
  getWebSiteSchema,
  getLocalBusinessSchema,
  FALLBACK_SITE_URL,
} from "@/lib/seo-schemas";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') || 'https';
  const SITE_URL = host ? `${protocol}://${host}` : FALLBACK_SITE_URL;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "Juul Dubai, UAE | Buy Juul Online | Vape Shop Dubai",
      template: "%s",
    },
    description: "Buy original Juul online in Dubai, UAE at the best price. Fast and same-day delivery across Dubai, UAE. Shop at the Vape Shop Dubai now.",
    keywords: [
      "Vape Shop Dubai",
      "Buy Vape UAE",
      "JUUL 2 Dubai",
      "Disposable Vape Dubai",
      "Myle Dubai",
      "Vape Delivery Dubai",
      "Al Fakher Crown Bar",
      "Pod Salt Dubai",
      "E-Juice Dubai"
    ],
    authors: [{ name: "Vape Shop Dubai" }],
    creator: "Vape Shop Dubai",
    publisher: "Vape Shop Dubai",
    icons: {
      icon: "/favicon_v2.png",
      apple: "/favicon_v2.png",
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: SITE_URL,
      siteName: "Vape Shop Dubai",
      title: "Juul Dubai, UAE | Buy Juul Online | Vape Shop Dubai",
      description: "Buy original Juul online in Dubai, UAE at the best price. Fast and same-day delivery across Dubai, UAE. Shop at the Vape Shop Dubai now.",
      images: [
        {
          url: `${SITE_URL}/hero_vape.png`,
          width: 1200,
          height: 630,
          alt: "Vape Shop Dubai",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Juul Dubai, UAE | Buy Juul Online | Vape Shop Dubai",
      description: "Buy original Juul online in Dubai, UAE at the best price. Fast and same-day delivery across Dubai, UAE. Shop at the Vape Shop Dubai now.",
      images: [`${SITE_URL}/hero_vape.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Use the constant site URL so the layout can be statically optimised.
  // CanonicalHead (client component) will correct the canonical URL at runtime.
  const siteUrl = FALLBACK_SITE_URL;

  const orgSchema = getOrganizationSchema(siteUrl);
  const websiteSchema = getWebSiteSchema(siteUrl);
  const storeSchema = getLocalBusinessSchema(siteUrl);
  const themeSettings = await getThemeSettings();

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased overflow-x-hidden max-w-full`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://cdn.shopify.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.shopify.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        {/* Preload LCP hero images for instant first paint */}
        <link rel="preload" as="image" type="image/webp" href="/Slider/myle_slider_mobile.webp" media="(max-width: 640px)" fetchPriority="high" />
        <link rel="preload" as="image" type="image/webp" href="/Slider/myle_slider.webp" media="(min-width: 641px)" fetchPriority="high" />
        {/* Root Google JSON-LD Schemas */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200 overflow-x-hidden max-w-full w-full"
        suppressHydrationWarning
      >
        <CanonicalHead />
        <ThemeSettingsProvider initial={themeSettings}>
          <ThemeProvider>
            <CartProvider>
              {children}
              <LazyWhatsApp />
            </CartProvider>
          </ThemeProvider>
        </ThemeSettingsProvider>
      </body>
    </html>
  );
}
