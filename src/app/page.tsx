import { HomeStateProvider } from "@/context/HomeStateContext";
import { HomeNavbarConnector } from "@/components/layout/HomeNavbarConnector";
import { LazyFooter } from "@/components/layout/LazyFooter";
import { AgeGate } from "@/components/sections/AgeGate";
import { getThemeSettings } from "@/lib/theme/get-settings";
import { resolveTemplateKey, templateMatch } from "@/lib/theme/types";
import { getFAQSchema, getBreadcrumbSchema } from "@/lib/seo-schemas";
import type { FaqItem } from "@/components/sections/FAQSection";
import { TemplateSections, SECTION_CONTAINER } from "@/components/sections/SectionRenderer";
import { HomeProductFeedSlot } from "@/components/layout/HomeProductFeedSlot";
import { HomeCustomerReviewsSlot } from "@/components/layout/HomeCustomerReviewsSlot";
import { getAllProducts } from "@/lib/shopify/products-fetch";

export const revalidate = 3600; // Cache the full home page at the CDN edge for 1 hour

export default async function Home() {
  // Run both data fetches in parallel to minimize TTFB
  const [settings, initialProducts] = await Promise.all([
    getThemeSettings(),
    getAllProducts(),
  ]);
  const key = resolveTemplateKey(settings.templates, "index");
  const template = settings.templates[key];
  const instances = template.order
    .map((id) => template.instances[id])
    .filter(Boolean);
  const isOverride = Boolean(templateMatch(template));

  // On home page, pass featured products needed for the initial feed carousels and category tabs (saves ~130KB flight bloat)
  const feedInstance = instances.find((i) => i.type === "productFeed");
  const feedRows = (feedInstance?.settings?.rows as Array<{ collectionHandle?: string }> | undefined) ?? [];
  const rowHandles = new Set(
    feedRows.flatMap((r) =>
      (r.collectionHandle || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    )
  );

  const featuredProductIds = new Set<string>();
  // 1. Matches for homepage rows
  for (const p of initialProducts) {
    const ph = p.handle.toLowerCase();
    const isRowMatch = Array.from(rowHandles).some(
      (h) => ph.includes(h) || (p.collections || []).some((c) => c.toLowerCase() === h)
    );
    if (isRowMatch) featuredProductIds.add(p.id);
  }

  // 2. Top products for each category tab
  const categoryCounts: Record<string, number> = {};
  for (const p of initialProducts) {
    const cat = p.category || "other";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    if (categoryCounts[cat] <= 4) {
      featuredProductIds.add(p.id);
    }
  }

  const leanInitialProducts = initialProducts
    .filter((p) => featuredProductIds.has(p.id))
    .map((p) => ({
      id: p.id,
      name: p.name,
      handle: p.handle,
      variantId: p.variantId,
      category: p.category,
      price: p.price,
      originalPrice: p.originalPrice,
      rating: p.rating,
      reviews: p.reviews,
      image: p.image,
      hoverImage: p.hoverImage,
      tag: p.tag,
      tagColor: p.tagColor,
      isPopular: p.isPopular,
      isSoldOut: p.isSoldOut,
      collections: p.collections,
      tags: p.tags,
    }));

  const questions = instances
    .filter((i) => i.type === "faq" && i.enabled)
    .flatMap((i) => (i.settings.items as FaqItem[] | undefined) ?? [])
    .map(({ question, answer }) => ({ question, answer }));

  const heroInstance = instances.find((i) => i.type === "hero");
  const heroSettings = heroInstance?.settings as unknown as { slides?: Array<{ image?: string; fallbackImage?: string }> } | undefined;
  const firstHeroImage = heroSettings?.slides?.[0]?.image || heroSettings?.slides?.[0]?.fallbackImage || "/Slider/myle_slider.webp";

  const faqSchema = getFAQSchema(questions);
  const breadcrumbSchema = getBreadcrumbSchema([{ name: "Home", item: "/" }]);
  return (
    <HomeStateProvider>
      <div className="relative flex flex-col min-h-screen bg-background text-foreground">
        {/* Preload the Hero Slide LCP image with high priority for sub-2.5s LCP on mobile */}
        <link
          rel="preload"
          as="image"
          href={`/_next/image?url=${encodeURIComponent(firstHeroImage)}&w=1200&q=60`}
          imageSrcSet={`/_next/image?url=${encodeURIComponent(firstHeroImage)}&w=360&q=60 360w, /_next/image?url=${encodeURIComponent(firstHeroImage)}&w=480&q=60 480w, /_next/image?url=${encodeURIComponent(firstHeroImage)}&w=640&q=60 640w, /_next/image?url=${encodeURIComponent(firstHeroImage)}&w=750&q=60 750w, /_next/image?url=${encodeURIComponent(firstHeroImage)}&w=1200&q=60 1200w`}
          imageSizes="(max-width: 640px) 220px, (max-width: 1024px) 320px, 400px"
          fetchPriority="high"
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />

        <AgeGate />

        <HomeNavbarConnector />

        <main className="flex-grow space-y-0 pb-0">
          <h1 className="sr-only">Trusted JUUL &amp; Vape Seller in Dubai, UAE</h1>
          <TemplateSections
            instances={instances}
            isOverride={isOverride}
            context={{}}
            slots={{
              productFeed: (settings) => <HomeProductFeedSlot settings={settings} initialProducts={leanInitialProducts} />,
              customerReviews: (settings) => <HomeCustomerReviewsSlot settings={settings} />
            }}
            containerClassName={SECTION_CONTAINER}
          />
        </main>
        <LazyFooter />
      </div>
    </HomeStateProvider>
  );
}
