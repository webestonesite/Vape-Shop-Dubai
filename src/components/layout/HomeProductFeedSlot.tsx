"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useHomeState } from "@/context/HomeStateContext";
import { useIsIdle } from "@/hooks/use-is-idle";
import { SECTION_CONTAINER } from "@/components/sections/SectionRenderer";

const ProductFeed = dynamic(
  () => import("@/components/sections/ProductFeed").then((m) => ({ default: m.ProductFeed })),
  { ssr: false }
);

export function HomeProductFeedSlot({ settings }: { settings: Record<string, unknown> }) {
  const { searchQuery, activeCategory, setActiveCategory } = useHomeState();
  const isIdle = useIsIdle();

  return (
    <div id="products-section" className={SECTION_CONTAINER}>
      {isIdle ? (
        <ProductFeed
          searchQuery={searchQuery}
          activeCategory={activeCategory}
          onCategorySelect={setActiveCategory}
          settings={settings as never}
        />
      ) : (
        <div style={{ height: "400px" }} />
      )}
    </div>
  );
}
