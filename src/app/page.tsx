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

  // On home page, pass featured products needed for the initial 2 feed carousels (saves ~100KB flight bloat)
  const feedInstance = instances.find((i) => i.type === "productFeed");
  const feedRows = (feedInstance?.settings?.rows as Array<{ collectionHandle?: string }> | undefined) ?? [];
  const initialFeedRows = feedRows.slice(0, 2);
  const rowHandles = new Set(
    initialFeedRows.flatMap((r) =>
      (r.collectionHandle || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    )
  );

  const featuredProductIds = new Set<string>();
  // 1. Matches for initial 2 homepage rows (capped at 24 items)
  for (const p of initialProducts) {
    const ph = p.handle.toLowerCase();
    const isRowMatch = Array.from(rowHandles).some(
      (h) => ph.includes(h) || (p.collections || []).some((c) => c.toLowerCase() === h)
    );
    if (isRowMatch) {
      featuredProductIds.add(p.id);
      if (featuredProductIds.size >= 24) break;
    }
  }

  // 2. Top products for each category tab
  const categoryCounts: Record<string, number> = {};
  for (const p of initialProducts) {
    if (featuredProductIds.size >= 28) break;
    const cat = p.category || "other";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    if (categoryCounts[cat] <= 2) {
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

  const faqSchema = getFAQSchema(questions);
  const breadcrumbSchema = getBreadcrumbSchema([{ name: "Home", item: "/" }]);
  return (
    <HomeStateProvider>
      <div className="relative flex flex-col min-h-screen bg-background text-foreground">

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
