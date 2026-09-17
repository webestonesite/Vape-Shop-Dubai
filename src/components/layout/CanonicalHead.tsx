"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function CanonicalHead() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const siteUrl = window.location.origin;

    // Clean query parameters from canonical URL to prevent duplicate content indexing
    const cleanPath = (pathname || "/").split("?")[0];
    const canonicalUrl = `${siteUrl}${cleanPath === "/" ? "" : cleanPath}`;

    // 1. Update or create canonical link tag
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonicalUrl);

    // 2. Ensure sitemap reference tag is present in head for instant crawler discovery
    let sitemapLink = document.querySelector('link[rel="sitemap"]');
    if (!sitemapLink) {
      sitemapLink = document.createElement("link");
      sitemapLink.setAttribute("rel", "sitemap");
      sitemapLink.setAttribute("type", "application/xml");
      sitemapLink.setAttribute("href", `${siteUrl}/sitemap.xml`);
      document.head.appendChild(sitemapLink);
    }
  }, [pathname]);

  return null;
}
