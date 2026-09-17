import { NextResponse } from "next/server";

const SHOPIFY_STORE = process.env.SHOPIFY_STORE || "vap-shop-dubai.myshopify.com";
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "";
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN || "";

const storefrontArticlesQuery = `
query getArticles {
  blogs(first: 10) {
    nodes {
      handle
      title
      seo {
        title
        description
      }
      articles(first: 100, sortKey: PUBLISHED_AT, reverse: true) {
        nodes {
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
            width
            height
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
  }
}
`;

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

export interface ShopifyArticle {
  id: string;
  title: string;
  handle: string;
  excerpt: string;
  excerptHtml: string;
  contentHtml: string;
  publishedAt: string;
  author: string;
  image: string;
  blogHandle: string;
  blogTitle: string;
  seoTitle?: string;
  seoDescription?: string;
}

export const BUILTIN_ARTICLES: ShopifyArticle[] = [
  {
    id: "art-1",
    title: "Best JUUL Device Shop in UAE",
    handle: "best-juul-device-shop-in-uae",
    excerpt: "Everything you need to know about JUUL 2 devices and pods in UAE. Learn about smart pod technology, flavor profiles, and fast delivery across Dubai.",
    excerptHtml: "",
    contentHtml: "",
    publishedAt: "2026-08-02T00:00:00Z",
    author: "Vape Shop Dubai Editorial",
    image: "",
    blogHandle: "news",
    blogTitle: "News & Vaping Guides",
    seoTitle: "Best JUUL Device Shop in UAE",
    seoDescription: "Everything you need to know about JUUL 2 devices and pods in UAE.",
  },
  {
    id: "art-2",
    title: "Top 10 Premium & Authentic Vape Shop in UAE",
    handle: "top-10-premium-and-authentic-vape-shop-in-uae",
    excerpt: "Looking for authentic vapes in UAE? We review top vape products and authentic delivery services across Dubai.",
    excerptHtml: "",
    contentHtml: "",
    publishedAt: "2026-07-28T00:00:00Z",
    author: "Vape Specialist Team",
    image: "",
    blogHandle: "news",
    blogTitle: "News & Vaping Guides",
    seoTitle: "Top 10 Premium & Authentic Vape Shop in UAE",
    seoDescription: "Authentic vape products and fast delivery in UAE.",
  },
  {
    id: "art-3",
    title: "Best Places to Buy JUUL 1 Series",
    handle: "best-places-to-buy-juul-1-series",
    excerpt: "Complete guide on buying original JUUL 1 series pods and kits in Dubai with cash on delivery.",
    excerptHtml: "",
    contentHtml: "",
    publishedAt: "2026-07-20T00:00:00Z",
    author: "Vape Shop Dubai Editorial",
    image: "",
    blogHandle: "news",
    blogTitle: "News & Vaping Guides",
    seoTitle: "Best Places to Buy JUUL 1 Series",
    seoDescription: "Guide on buying original JUUL 1 series pods and kits in Dubai.",
  },
  {
    id: "art-4",
    title: "Complete Guide to JUUL 2 in Dubai: Features, Flavors & 2-Hour Delivery (2026)",
    handle: "juul-2-dubai-complete-guide-2026",
    excerpt: "Everything you need to know about JUUL 2 devices and pods in UAE. Learn about smart pod technology, flavor profiles, battery optimization, and fast delivery across Dubai.",
    excerptHtml: "",
    contentHtml: "",
    publishedAt: "2026-08-02T00:00:00Z",
    author: "Vape Shop Dubai Editorial",
    image: "",
    blogHandle: "juul-pods",
    blogTitle: "JUUL & Pods",
    seoTitle: "Complete Guide to JUUL 2 in Dubai (2026)",
    seoDescription: "Everything you need to know about JUUL 2 devices and pods in UAE.",
  },
  {
    id: "art-5",
    title: "Top 10 Longest Lasting Disposable Vapes in UAE (8000+ Puffs Rated)",
    handle: "top-10-longest-lasting-disposable-vapes-uae",
    excerpt: "Looking for high puff capacity disposables? We test and rank Al Fakher Crown Bar 8000, Lost Mary 10000, Tugboat T12000, and Elf Bar BC10000 for flavor and longevity.",
    excerptHtml: "",
    contentHtml: "",
    publishedAt: "2026-07-28T00:00:00Z",
    author: "Vape Specialist Team",
    image: "",
    blogHandle: "disposables",
    blogTitle: "Disposables",
    seoTitle: "Top 10 Longest Lasting Disposable Vapes in UAE",
    seoDescription: "High puff capacity disposables review in Dubai.",
  },
  {
    id: "art-6",
    title: "MYLE V5 Meta vs JUUL 2: Which Pod System Should You Buy in Dubai?",
    handle: "myle-v5-vs-juul-2-which-should-you-buy",
    excerpt: "Side-by-side comparison of UAE's two most popular pod systems. We analyze battery life, pod pricing, flavor intensity, and draw tightness to help you choose.",
    excerptHtml: "",
    contentHtml: "",
    publishedAt: "2026-07-20T00:00:00Z",
    author: "Vape Shop Dubai Editorial",
    image: "",
    blogHandle: "comparisons",
    blogTitle: "Comparisons",
    seoTitle: "MYLE V5 Meta vs JUUL 2 Comparison",
    seoDescription: "Side-by-side comparison of UAE's two most popular pod systems.",
  },
  {
    id: "art-7",
    title: "How to Verify Authentic Vape Products in UAE & Avoid Counterfeits",
    handle: "how-to-verify-authentic-vape-products-dubai",
    excerpt: "Step-by-step guide to scanning QR codes, checking security seals, and verifying official distributor serial numbers on JUUL, MYLE, and Al Fakher products.",
    excerptHtml: "",
    contentHtml: "",
    publishedAt: "2026-07-15T00:00:00Z",
    author: "Quality Assurance Team",
    image: "",
    blogHandle: "safety",
    blogTitle: "Safety & Authenticity",
    seoTitle: "How to Verify Authentic Vape Products in UAE",
    seoDescription: "Step-by-step guide to scanning QR codes and security seals.",
  },
  {
    id: "art-8",
    title: "Best Salt Nicotine E-Liquid Flavors for Summer 2026 in Dubai",
    handle: "best-salt-nicotine-e-liquids-dubai-summer-2026",
    excerpt: "Beat the UAE heat with our curated list of top cooling menthol, icy mango, fruit blends, and premium tobacco salt nics available for express delivery.",
    excerptHtml: "",
    contentHtml: "",
    publishedAt: "2026-07-10T00:00:00Z",
    author: "Flavor Sommelier",
    image: "",
    blogHandle: "e-liquids",
    blogTitle: "E-Liquids",
    seoTitle: "Best Salt Nicotine E-Liquid Flavors for Summer 2026",
    seoDescription: "Top cooling menthol, icy mango, and fruit blends in Dubai.",
  },
  {
    id: "art-9",
    title: "Vaping Regulations & Delivery Guidelines in Dubai & UAE (2026 Update)",
    handle: "vaping-regulations-delivery-guidelines-uae-2026",
    excerpt: "Important legal updates regarding legal age requirements, ESMA certification standards, customs regulations, and cash-on-delivery rules in Dubai.",
    excerptHtml: "",
    contentHtml: "",
    publishedAt: "2026-07-01T00:00:00Z",
    author: "Compliance Team",
    image: "",
    blogHandle: "uae-guides",
    blogTitle: "UAE Guides",
    seoTitle: "Vaping Regulations & Delivery Guidelines in Dubai (2026)",
    seoDescription: "Important legal updates regarding legal age requirements and ESMA.",
  },
];

let articlesCache: { data: ShopifyArticle[]; blogMeta: any; timestamp: number } | null = null;
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

export async function GET() {
  if (articlesCache && Date.now() - articlesCache.timestamp < CACHE_DURATION_MS) {
    return NextResponse.json(
      { articles: articlesCache.data, blog: articlesCache.blogMeta },
      { headers: { "Cache-Control": "public, max-age=600, stale-while-revalidate=1200" } }
    );
  }

  try {
    let articles: ShopifyArticle[] = [];
    let blogMeta = { title: "Vape Guides & News", seoTitle: "", seoDescription: "" };

    // Try Storefront API first
    if (STOREFRONT_TOKEN) {
      try {
        const url = `https://${SHOPIFY_STORE}/api/2024-10/graphql.json`;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
          },
          body: JSON.stringify({ query: storefrontArticlesQuery }),
          next: { revalidate: 300 },
        });

        if (res.ok) {
          const json = await res.json();
          const blogNodes = json.data?.blogs?.nodes || [];
          for (const bNode of blogNodes) {
            if (bNode.handle === "news" || !blogMeta.seoTitle) {
               blogMeta = {
                 title: bNode.title,
                 seoTitle: bNode.seo?.title || "",
                 seoDescription: bNode.seo?.description || "",
               };
            }
            const artNodes = bNode.articles?.nodes || [];
            for (const node of artNodes) {
              articles.push({
                id: node.id,
                title: node.title,
                handle: node.handle,
                excerpt: node.excerpt || node.excerptHtml?.replace(/<[^>]+>/g, "").slice(0, 160) || "",
                excerptHtml: node.excerptHtml || "",
                contentHtml: node.contentHtml || "",
                publishedAt: node.publishedAt,
                author: node.authorV2?.name || "Vape Shop Dubai Editorial",
                image: node.image?.url || "",
                blogHandle: node.blog?.handle || bNode.handle || "news",
                blogTitle: node.blog?.title || bNode.title || "News & Vaping Guides",
                seoTitle: node.seo?.title || node.title,
                seoDescription: node.seo?.description || node.excerpt,
              });
            }
          }
        }
      } catch (e) {
        console.warn("Storefront articles fetch error:", e);
      }
    }

    // Try Admin API if storefront returned empty
    if (articles.length === 0 && ADMIN_TOKEN) {
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
          if (nodes.length > 0) {
            articles = nodes.map((node: any) => ({
              id: node.id,
              title: node.title,
              handle: node.handle,
              excerpt: node.summary || (node.body ? node.body.replace(/<[^>]+>/g, "").slice(0, 160) : "") || "",
              excerptHtml: node.summary || "",
              contentHtml: node.body || "",
              publishedAt: node.publishedAt,
              author: node.author?.name || "Vape Shop Dubai Editorial",
              image: node.image?.url || "",
              blogHandle: node.blog?.handle || "news",
              blogTitle: node.blog?.title || "News & Vaping Guides",
              seoTitle: node.title,
              seoDescription: node.summary || "",
            }));
          }
        }
      } catch (e) {
        console.warn("Admin articles fetch error:", e);
      }
    }

    // --- Filter spam/trashed articles ---
    const SPAM_KEYWORDS = ["__trashed", "casino", "gambling", "poker", "blackjack", "sportsbook", "slots"];
    articles = articles.filter((a) => {
      const h = a.handle.toLowerCase();
      const t = a.title.toLowerCase();
      return !SPAM_KEYWORDS.some((kw) => h.includes(kw) || t.includes(kw));
    });

    // --- Deduplicate by handle (keep version with image) ---
    const handleMap = new Map<string, ShopifyArticle>();
    for (const a of articles) {
      const key = a.handle.toLowerCase();
      const existing = handleMap.get(key);
      if (!existing) {
        handleMap.set(key, a);
      } else if (!existing.image && a.image) {
        handleMap.set(key, a); // prefer version with image
      }
    }
    articles = Array.from(handleMap.values());

    // --- Sanitize author (hide emails) ---
    for (const a of articles) {
      if (a.author.includes("@")) {
        a.author = "Vape Shop Dubai Editorial";
      }
    }

    // Merge built-in guides into the articles list (avoiding duplicate handles)
    const existingHandles = new Set(articles.map((a) => a.handle.toLowerCase()));
    for (const builtin of BUILTIN_ARTICLES) {
      if (!existingHandles.has(builtin.handle.toLowerCase())) {
        articles.push(builtin);
      }
    }

    articlesCache = { data: articles, blogMeta, timestamp: Date.now() };

    return NextResponse.json(
      { articles, blog: blogMeta },
      { headers: { "Cache-Control": "public, max-age=600, stale-while-revalidate=1200" } }
    );
  } catch (error: any) {
    console.error("Articles API error:", error?.message || error);
    return NextResponse.json({ articles: BUILTIN_ARTICLES, blog: null }, { status: 500 });
  }
}
