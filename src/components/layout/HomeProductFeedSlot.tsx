"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useHomeState } from "@/context/HomeStateContext";
import { SECTION_CONTAINER } from "@/components/sections/SectionRenderer";
import type { Product } from "@/components/sections/ProductFeed";

import { ProductFeed } from "@/components/sections/ProductFeed";

export function HomeProductFeedSlot({ settings, initialProducts }: { settings: Record<string, unknown>, initialProducts?: Product[] }) {
  const { searchQuery, activeCategory, setActiveCategory } = useHomeState();

  return (
    <div id="products-section" className={SECTION_CONTAINER}>
      <ProductFeed
        searchQuery={searchQuery}
        activeCategory={activeCategory}
        onCategorySelect={setActiveCategory}
        settings={settings as never}
        initialProducts={initialProducts}
      />
    </div>
  );
}
