"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { AgeGate } from "@/components/sections/AgeGate";
import {
  SECTION_CONTAINER,
  TemplateSections,
} from "@/components/sections/SectionRenderer";
import { useResolvedTemplate } from "@/context/ThemeSettingsContext";
import { getFAQSchema, getBreadcrumbSchema } from "@/lib/seo-schemas";
import { useIsIdle } from "@/hooks/use-is-idle";
import type { FaqItem } from "@/components/sections/FAQSection";

const ProductFeed = dynamic(
  () => import("@/components/sections/ProductFeed").then((m) => ({ default: m.ProductFeed })),
  { ssr: false }
);
const CustomerReviewsSection = dynamic(
  () =>
    import("@/components/sections/CustomerReviewsSection").then((m) => ({
      default: m.CustomerReviewsSection,
    })),
  { ssr: false }
);

export function HomeClientShell() {
  const [searchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const { instances, isOverride } = useResolvedTemplate("index");
  const isIdle = useIsIdle();

  const faqSchema = useMemo(() => {
    const questions = instances
      .filter((i) => i.type === "faq" && i.enabled)
      .flatMap((i) => (i.settings.items as FaqItem[] | undefined) ?? [])
      .map(({ question, answer }) => ({ question, answer }));
    return getFAQSchema(questions);
  }, [instances]);

  const breadcrumbSchema = getBreadcrumbSchema([{ name: "Home", item: "/" }]);

  const slots = {
    productFeed: (settings: Record<string, unknown>) => (
      <div id="products-section" className={SECTION_CONTAINER}>
        {isIdle ? (
          searchQuery ? (
            <ProductFeed
              searchQuery={searchQuery}
              activeCategory={activeCategory}
              onCategorySelect={setActiveCategory}
              settings={settings as never}
            />
          ) : (
            <ProductFeed
              searchQuery={searchQuery}
              activeCategory={activeCategory}
              onCategorySelect={setActiveCategory}
              settings={settings as never}
            />
          )
        ) : <div style={{ height: "400px" }} />}
      </div>
    ),
    customerReviews: (settings: Record<string, unknown>) => (
      <div className={SECTION_CONTAINER}>
        {isIdle ? (
          <CustomerReviewsSection
            collectionName="Vape Products"
            settings={settings as never}
          />
        ) : <div style={{ height: "300px" }} />}
      </div>
    ),
  };

  return (
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

      <Navbar onCategorySelect={setActiveCategory} activeCategory={activeCategory} />

      <main className="flex-grow space-y-0 pb-0">
        <h1 className="sr-only">TRUSTED JUUL SELLER IN UAE</h1>
        <TemplateSections
          instances={instances}
          isOverride={isOverride}
          context={{}}
          slots={slots}
          containerClassName={SECTION_CONTAINER}
        />
      </main>

      <CartDrawer />
      <Footer />
    </div>
  );
}
