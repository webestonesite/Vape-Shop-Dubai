import { NextResponse } from "next/server";
import { getRequestSiteUrl } from "@/lib/site-url";
import { headers } from "next/headers";
import { getAllProducts } from "@/lib/shopify/products-fetch";
import { BUILTIN_ARTICLES } from "../articles/route";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const headersList = await headers();
  const host = headersList.get('x-forwarded-host') || headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') || 'https';
  const siteUrl = getRequestSiteUrl(host, protocol);

  const collectionHandles = [
    "all",
    "disposable-vape",
    "juul-vape-dubai",
    "myle-vape-dubai",
    "vape-e-juice",
    "pod-system",
    "brand",
    "accessories",
    "disposables",
    "e-liquids",
    "juul",
    "juul-1-series",
    "juul-2-series",
    "juul-pods-offers",
    "myle",
    "myle-v5-pods",
    "myle-v5-device",
    "myle-disposable",
    "al-fakher-vape",
    "elf-bar-vape",
    "fummo-vape",
    "pod-salt-vape",
    "vapes-bars",
    "vozol-vape",
    "tugboat-vape",
    "hqd-vape",
    "lost-mary-disposable",
    "maskking-vape",
    "geek-bar-disposable",
    "yuoto-vape",
    "relx-vape",
    "nerd-vape",
    "vgod-stig",
    "silvaper-vape",
    "salt-nicotine",
    "freebase-e-liquid",
    "pod-kit",
    "pod-cartridge",
    "vape-coils",
    "oxva-vape",
    "uwell-vape",
    "vaporesso-vape",
    "smok-vape",
    "geek-vape",
    "voopoo-vape",
    "best-seller-vape",
    "flash-sale",
    "sprk",
    "buy-50mg-disposable-vape-in-uae",
    "buy-20mg-disposable-vape-uae",
    "buy-0mg-disposable-vape-in-uae",
  ];

  const staticPages = [
    "",
    "/products",
    "/shop",
    ...collectionHandles.map((h) => `/collections/${h}`),
    "/blogs/news",
    "/about-us",
    "/contact",
    "/shipping-delivery",
    "/terms-conditions",
    "/privacy-policy",
    "/refund-returns",
  ];

  let dynamicUrls: string[] = [];
  try {
    // Fetch products directly or via API
    const products = await getAllProducts().catch(() => []);
    if (Array.isArray(products) && products.length > 0) {
      products.forEach((p: any) => dynamicUrls.push(`/products/${p.handle}`));
    } else {
      const prodRes = await fetch(`${siteUrl}/api/products`, { next: { revalidate: 3600 } });
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (Array.isArray(prodData)) {
          prodData.forEach((p: any) => dynamicUrls.push(`/products/${p.handle}`));
        }
      }
    }

    // Fetch blog articles
    let articlesAdded = false;
    try {
      const blogRes = await fetch(`${siteUrl}/api/articles`, { next: { revalidate: 3600 } });
      if (blogRes.ok) {
        const blogData = await blogRes.json();
        if (blogData.articles && Array.isArray(blogData.articles)) {
          blogData.articles.forEach((a: any) => dynamicUrls.push(`/blogs/news/${a.handle}`));
          articlesAdded = true;
        }
      }
    } catch {
      // fallback
    }
    if (!articlesAdded) {
      BUILTIN_ARTICLES.forEach((a) => dynamicUrls.push(`/blogs/news/${a.handle}`));
    }
  } catch (e) {
    console.error("Sitemap generation error:", e);
  }

  const allUrls = Array.from(new Set([...staticPages, ...dynamicUrls]));

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
