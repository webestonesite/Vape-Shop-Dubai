import { HomeStateProvider } from "@/context/HomeStateContext";
import { HomeNavbarConnector } from "@/components/layout/HomeNavbarConnector";
import { LazyFooter } from "@/components/layout/LazyFooter";
import { CartDrawer } from "@/components/layout/CartDrawer";
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
          <h1 className="sr-only">TRUSTED JUUL SELLER IN UAE</h1>
          <TemplateSections
            instances={instances}
            isOverride={isOverride}
            context={{}}
            slots={{
              productFeed: (settings) => <HomeProductFeedSlot settings={settings} initialProducts={initialProducts} />,
              customerReviews: (settings) => <HomeCustomerReviewsSlot settings={settings} />
            }}
            containerClassName={SECTION_CONTAINER}
          />
        </main>

        <CartDrawer />
        <LazyFooter />
      </div>
    </HomeStateProvider>
  );
}
