import { NextResponse } from "next/server";
import { BUILTIN_ARTICLES } from "../route";

const SHOPIFY_STORE = process.env.SHOPIFY_STORE || "vap-shop-dubai.myshopify.com";
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "";
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN || "";

const storefrontArticleByHandleQuery = `
query getArticleByHandle($blogHandle: String!, $articleHandle: String!) {
  blogByHandle(handle: $blogHandle) {
    articleByHandle(handle: $articleHandle) {
      id
      title
      handle
      excerpt
      excerptHtml
      contentHtml
      publishedAt
      authorV2 {
        name
      }
      image {
        url
        altText
      }
      blog {
        handle
        title
      }
      seo {
        title
        description
      }
    }
  }
}
`;

// Admin API: fetch single article by searching all articles
const adminArticlesQuery = `
query getArticles {
  articles(first: 250, reverse: true) {
    nodes {
      id
      title
      handle
      summary
      body
      publishedAt
      author {
        name
      }
      image {
        url
        altText
        width
        height
      }
      blog {
        handle
        title
      }
    }
  }
}
`;

const singleArticleCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000;

// Blog handles to try for Storefront API lookups
const BLOG_HANDLES = ["news", "juul-pods", "disposables", "comparisons", "safety", "e-liquids", "uae-guides"];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params;
    if (!handle) {
      return NextResponse.json({ error: "Article handle is required" }, { status: 400 });
    }

    const cached = singleArticleCache.get(handle);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data, {
        headers: { "Cache-Control": "public, max-age=600, stale-while-revalidate=1200" },
      });
    }

    // --- Strategy 1: Storefront API by handle (try multiple blog handles) ---
    if (STOREFRONT_TOKEN) {
      for (const blogHandle of BLOG_HANDLES) {
        try {
          const url = `https://${SHOPIFY_STORE}/api/2024-10/graphql.json`;
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
            },
            body: JSON.stringify({
              query: storefrontArticleByHandleQuery,
              variables: { blogHandle, articleHandle: handle },
            }),
            next: { revalidate: 300 },
          });

          if (res.ok) {
            const json = await res.json();
            const node = json.data?.blogByHandle?.articleByHandle;
            if (node && node.contentHtml) {
              const articleData = {
                id: node.id,
                title: node.title,
                handle: node.handle,
                excerpt: node.excerpt || node.excerptHtml?.replace(/<[^>]+>/g, "").slice(0, 160) || "",
                contentHtml: node.contentHtml || "",
                publishedAt: node.publishedAt,
                author: node.authorV2?.name || "Vape Shop Dubai Editorial",
                image: node.image?.url || "",
                blogHandle: node.blog?.handle || blogHandle,
                blogTitle: node.blog?.title || "News & Vaping Guides",
                seoTitle: node.seo?.title || node.title,
                seoDescription: node.seo?.description || node.excerpt,
              };

              // Sanitize email authors
              if (articleData.author.includes("@")) {
                articleData.author = "Vape Shop Dubai Editorial";
              }

              singleArticleCache.set(handle, { data: articleData, timestamp: Date.now() });

              return NextResponse.json(articleData, {
                headers: { "Cache-Control": "public, max-age=600, stale-while-revalidate=1200" },
              });
            }
          }
        } catch (e) {
          console.warn(`Storefront single article fetch error (blog: ${blogHandle}):`, e);
        }
      }
    }

    // --- Strategy 2: Admin API bulk fetch + find matching handle ---
    if (ADMIN_TOKEN) {
      try {
        const url = `https://${SHOPIFY_STORE}/admin/api/2024-10/graphql.json`;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": ADMIN_TOKEN,
          },
          body: JSON.stringify({ query: adminArticlesQuery }),
          next: { revalidate: 0 },
        });

        if (res.ok) {
          const json = await res.json();
          const nodes = json.data?.articles?.nodes || [];
          const node = nodes.find((n: any) => n.handle?.toLowerCase() === handle.toLowerCase());
          if (node) {
            const articleData = {
              id: node.id,
              title: node.title,
              handle: node.handle,
              excerpt: node.summary || (node.body ? node.body.replace(/<[^>]+>/g, "").slice(0, 160) : "") || "",
              contentHtml: node.body || "",
              publishedAt: node.publishedAt,
              author: node.author?.name || "Vape Shop Dubai Editorial",
              image: node.image?.url || "",
              blogHandle: node.blog?.handle || "news",
              blogTitle: node.blog?.title || "News & Vaping Guides",
              seoTitle: node.title,
              seoDescription: node.summary || "",
            };

            // Sanitize email authors
            if (articleData.author.includes("@")) {
              articleData.author = "Vape Shop Dubai Editorial";
            }

            singleArticleCache.set(handle, { data: articleData, timestamp: Date.now() });

            return NextResponse.json(articleData, {
              headers: { "Cache-Control": "public, max-age=600, stale-while-revalidate=1200" },
            });
          }
        }
      } catch (e) {
        console.warn("Admin single article fetch error:", e);
      }
    }

    // --- Strategy 3: Fallback to BUILTIN_ARTICLES ---
    const builtin = BUILTIN_ARTICLES.find(
      (a) => a.handle.toLowerCase() === handle.toLowerCase()
    );

    if (builtin) {
      singleArticleCache.set(handle, { data: builtin, timestamp: Date.now() });
      return NextResponse.json(builtin, {
        headers: { "Cache-Control": "public, max-age=600, stale-while-revalidate=1200" },
      });
    }

    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unknown error" }, { status: 500 });
  }
}

