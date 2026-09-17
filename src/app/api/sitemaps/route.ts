import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/seo-schemas";

export async function GET() {
  const siteUrl = SITE_URL;

  const staticPages = [
    "",
    "/products",
    "/shop",
    "/collections/all",
    "/collections/disposable-vape",
    "/collections/juul-vape-dubai",
    "/collections/myle-vape-dubai",
    "/collections/vape-e-juice",
    "/collections/pod-system",
    "/collections/brand",
    "/blogs/news",
    "/about-us",
    "/contact",
    "/shipping-delivery",
    "/terms-conditions",
    "/privacy-policy",
  ];

  let productUrls: string[] = [];
  try {
    const res = await fetch(`${siteUrl}/api/products`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const products = await res.json();
      if (Array.isArray(products)) {
        productUrls = products.map((p: any) => `/products/${p.handle}`);
      }
    }
  } catch {
    // Fallback if products endpoint fails during build
  }

  const allUrls = Array.from(new Set([...staticPages, ...productUrls]));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (path) => `  <url>
    <loc>${siteUrl}${path}</loc>
    <changefreq>${path === "" || path === "/products" ? "daily" : "weekly"}</changefreq>
    <priority>${path === "" ? "1.0" : path.startsWith("/products/") ? "0.8" : "0.7"}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
    },
  });
}
