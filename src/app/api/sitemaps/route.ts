import { NextResponse } from "next/server";
import { FALLBACK_SITE_URL } from "@/lib/seo-schemas";
import { headers } from "next/headers";

export async function GET(req: Request) {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') || 'https';
  const siteUrl = host ? `${protocol}://${host}` : FALLBACK_SITE_URL;

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

  let dynamicUrls: string[] = [];
  try {
    // Fetch products
    const prodRes = await fetch(`${siteUrl}/api/products`, { next: { revalidate: 3600 } });
    if (prodRes.ok) {
      const products = await prodRes.json();
      if (Array.isArray(products)) {
        products.forEach((p: any) => dynamicUrls.push(`/products/${p.handle}`));
      }
    }

    // Fetch blog articles
    const blogRes = await fetch(`${siteUrl}/api/articles`, { next: { revalidate: 3600 } });
    if (blogRes.ok) {
      const blogData = await blogRes.json();
      if (blogData.articles && Array.isArray(blogData.articles)) {
        blogData.articles.forEach((a: any) => dynamicUrls.push(`/blogs/news/${a.handle}`));
      }
    }
  } catch (e) {
    console.error("Sitemap fetch error:", e);
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
