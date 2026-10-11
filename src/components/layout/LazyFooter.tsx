"use client";

import dynamic from "next/dynamic";

// Defer the 21KB Footer bundle from the initial JS payload.
// `ssr: true` keeps the HTML in the SSR output for SEO; the JS hydration is deferred.
const FooterInner = dynamic(
  () => import("@/components/layout/Footer"),
  {
    ssr: true,
    loading: () => (
      <footer
        aria-label="Site footer"
        style={{ minHeight: "280px", background: "var(--card)" }}
      />
    ),
  }
);

export function LazyFooter() {
  return <FooterInner />;
}
