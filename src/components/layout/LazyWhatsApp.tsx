"use client";

import dynamic from "next/dynamic";

const WhatsAppFloating = dynamic(
  () =>
    import("@/components/layout/WhatsAppFloating").then((m) => ({
      default: m.WhatsAppFloating,
    })),
  { ssr: false }
);

export function LazyWhatsApp() {
  return <WhatsAppFloating />;
}
