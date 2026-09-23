"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useHomeState } from "@/context/HomeStateContext";
import { SECTION_CONTAINER } from "@/components/sections/SectionRenderer";

const ProductFeed = dynamic(
  () => import("@/components/sections/ProductFeed").then((m) => ({ default: m.ProductFeed })),
  { ssr: false }
);

export function HomeProductFeedSlot({ settings }: { settings: Record<string, unknown> }) {
  const { searchQuery, activeCategory, setActiveCategory } = useHomeState();

  return (
    <div id="products-section" className={SECTION_CONTAINER}>
      <ProductFeed
        searchQuery={searchQuery}
        activeCategory={activeCategory}
        onCategorySelect={setActiveCategory}
        settings={settings as never}
      />
    </div>
  );
}
