"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useIsIdle } from "@/hooks/use-is-idle";
import { SECTION_CONTAINER } from "@/components/sections/SectionRenderer";

const CustomerReviewsSection = dynamic(
  () => import("@/components/sections/CustomerReviewsSection"),
  { ssr: false }
);

export function HomeCustomerReviewsSlot({ settings }: { settings: Record<string, unknown> }) {
  const isIdle = useIsIdle();

  return (
    <div className={SECTION_CONTAINER}>
      {isIdle ? <CustomerReviewsSection settings={settings as never} /> : <div style={{ height: "400px" }} />}
    </div>
  );
}
