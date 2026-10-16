import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Home,
} from "lucide-react";
import { getRequestSiteUrl } from "@/lib/site-url";

const SHOPIFY_STORE = process.env.SHOPIFY_STORE || "vap-shop-dubai.myshopify.com";
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "";
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN || "";

const BLOG_HANDLES = ["news", "juul-pods", "disposables", "comparisons", "safety", "e-liquids", "uae-guides"];

const storefrontArticleQuery = `
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
      authorV2 { name }
      image { url altText }
      blog { handle title }
      seo { title description }
    }
  }
}
`;

const adminArticlesQuery = `
query getArticles {
  articles(first: 250, reverse: true) {
    nodes {
      id title handle summary body publishedAt
      author { name }
      image { url altText width height }
      blog { handle title }
    }
  }
}
`;

interface ArticleData {
  title: string;
  handle: string;
  excerpt: string;
  contentHtml: string;
  publishedAt: string;
  author: string;
  image: string;
  blogHandle: string;
  blogTitle: string;
  seoTitle: string;
  seoDescription: string;
  rating?: number;
  ratingCount?: number;
  quickTake?: {
    score: string;
    highlights: string[];
    bestFor: string;
    skipIf: string;
  };
  specsTable?: {
    headers: string[];
    rows: { [key: string]: string }[];
  };
  pros?: string[];
  cons?: string[];
  scorecard?: { metric: string; score: number; max: number }[];
  featuredProducts?: {
    title: string;
    image: string;
    badge: string;
    price: string;
    originalPrice?: string;
    href: string;
    highlights: string;
  }[];
}

interface RelatedArticle {
  handle: string;
  title: string;
  image: string;
  blogTitle: string;
}

function enrichInternalLinks(html: string): string {
  if (!html) return "";

  const KEYWORD_MAP = [
    { pattern: /\b(Top vape shop online Dubai|vape shop online Dubai|Vape Shop Dubai|vape online UAE)\b/i, href: "/", title: "Vape Shop Dubai Online Store" },
    { pattern: /\b(JUUL 2 Starter Kit|JUUL 2 Devices?|JUUL 2)\b/i, href: "/collections/juul-2-series", title: "JUUL 2 Devices & Pods UAE" },
    { pattern: /\b(Juul Pods?|Juul 1|JUUL 1)\b/i, href: "/collections/juul-pods-offers", title: "Authentic JUUL Pods in Dubai" },
    { pattern: /\b(disposable vapes?|disposable vape models?)\b/i, href: "/collections/disposable-vapes", title: "Disposable Vapes Dubai" },
    { pattern: /\b(Al Fakher Crown Bar|Al Fakher)\b/i, href: "/collections/al-fakher-vape", title: "Al Fakher Shisha Vapes" },
    { pattern: /\b(Lost Mary)\b/i, href: "/collections/lost-mary-disposable", title: "Lost Mary Vapes UAE" },
    { pattern: /\b(Elf Bar|Elfbar)\b/i, href: "/collections/elf-bar-vape", title: "Elf Bar UAE" },
    { pattern: /\b(Tugboat)\b/i, href: "/collections/tugboat-disposable", title: "Tugboat Vapes" },
    { pattern: /\b(nicotine salts?|pod salts?|salt nicotine)\b/i, href: "/collections/salt-nicotine", title: "Nicotine Salt E-Liquids" },
    { pattern: /\b(pod systems?|pod kits?)\b/i, href: "/collections/pod-system", title: "Pod Systems & Kits Dubai" },
    { pattern: /\b(e-liquids?|freebase e-liquid)\b/i, href: "/collections/e-liquids", title: "Vape E-Liquids UAE" },
    { pattern: /\b(MYLE V5 Meta|MYLE V5|MYLE)\b/i, href: "/collections/myle-v5-device", title: "Myle Devices & Pods" },
  ];

  // Tokenize HTML so we only replace text inside text nodes (outside tags, <a>, and <h1-6>)
  const segments = html.split(/(<[^>]+>)/g);
  let inAnchor = false;
  let inHeading = false;
  const replacedCounts: Record<string, number> = {};

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (seg.startsWith("<")) {
      if (/^<a\b/i.test(seg)) inAnchor = true;
      if (/^<\/a>/i.test(seg)) inAnchor = false;
      if (/^<h[1-6]\b/i.test(seg)) inHeading = true;
      if (/^<\/h[1-6]>/i.test(seg)) inHeading = false;
      continue;
    }

    if (inAnchor || inHeading) continue;
    if (!seg.trim()) continue;

    for (const { pattern, href, title } of KEYWORD_MAP) {
      const key = href;
      if ((replacedCounts[key] || 0) >= 2) continue; // max 2 links per destination per article

      const match = seg.match(pattern);
      if (match && match[0]) {
        const matchedStr = match[0];
        const linkTag = `<a href="${href}" title="${title}">${matchedStr}</a>`;
        segments[i] = seg.replace(matchedStr, linkTag);
        replacedCounts[key] = (replacedCounts[key] || 0) + 1;
        break; // Stop scanning this segment once a link is inserted to prevent re-entrancy bugs
      }
    }
  }

  return segments.join("");
}

function cleanArticleBodyHtml(html: string): string {
  if (!html) return "";
  let cleaned = html;

  // Strip competitor URLs and unwrap the links
  cleaned = cleaned.replace(/<a[^>]*href=["']https?:\/\/(?:www\.)?(?:ostore\.ae|vpdubaiking\.ae|vapstall\.ae|vapepods\.ae)[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi, "$1");

  // Normalize store links
  cleaned = cleaned.replace(/href="https?:\/\/(?:www\.)?(?:vapshopdubai\.ae|vapshop\.ae|vapeshopdubai\.net|vapeuae\.shop)\/products\/([^"]+)"/gi, 'href="/products/$1"');
  cleaned = cleaned.replace(/href="https?:\/\/(?:www\.)?(?:vapshopdubai\.ae|vapshop\.ae|vapeshopdubai\.net|vapeuae\.shop)\/collections\/([^"]+)"/gi, 'href="/collections/$1"');
  cleaned = cleaned.replace(/href="https?:\/\/(?:www\.)?(?:vapshopdubai\.ae|vapshop\.ae|vapeshopdubai\.net|vapeuae\.shop)\/blogs\/([^"]+)"/gi, 'href="/blogs/$1"');
  cleaned = cleaned.replace(/href="https?:\/\/(?:www\.)?(?:vapshopdubai\.ae|vapshop\.ae|vapeshopdubai\.net|vapeuae\.shop)\/?"/gi, 'href="/"');

  // Clean & fix tables:
  cleaned = cleaned.replace(/<table([\s\S]*?)<\/table>/gi, (match) => {
    // Strip restrictive colgroup widths
    let inner = match.replace(/<colgroup[\s\S]*?<\/colgroup>/gi, "");
    // Clean up <p dir="ltr"> / <span dir="ltr"> inside td / th
    inner = inner.replace(/<td([^>]*)>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<\/td>/gi, '<td$1>$2</td>');
    inner = inner.replace(/<td([^>]*)>\s*<p[^>]*><span[^>]*>([\s\S]*?)<\/span><\/p>\s*<\/td>/gi, '<td$1>$2</td>');
    inner = inner.replace(/<td([^>]*)>\s*<span[^>]*>([\s\S]*?)<\/span>\s*<\/td>/gi, '<td$1>$2</td>');
    inner = inner.replace(/<th([^>]*)>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<\/th>/gi, '<th$1>$2</th>');
    inner = inner.replace(/<th([^>]*)>\s*<p[^>]*><span[^>]*>([\s\S]*?)<\/span><\/p>\s*<\/th>/gi, '<th$1>$2</th>');
    inner = inner.replace(/<th([^>]*)>\s*<span[^>]*>([\s\S]*?)<\/span>\s*<\/th>/gi, '<th$1>$2</th>');

    // Replace table tag with styled table
    const cleanTable = inner.replace(/<table[^>]*>/i, '<table class="w-full text-left border-collapse text-[13px] sm:text-[14px]">');
    return `<div class="table-responsive-wrapper my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-border shadow-xs bg-white dark:bg-card">${cleanTable}</div>`;
  });

  // Automatically enrich with high-intent internal links
  cleaned = enrichInternalLinks(cleaned);

  return cleaned;
}

/** Fallback rich editorial database for default articles matching the reference image layout */
const FALLBACK_ARTICLES: Record<string, Partial<ArticleData>> = {
  "juul-2-dubai-complete-guide-2026": {
    title: "Complete Guide to JUUL 2 in Dubai: Features, Flavors & 3-Hour Delivery (2026)",
    excerpt: "Everything you need to know about JUUL 2 devices and pods in UAE. Learn about smart pod technology, flavor profiles, battery optimization, and fast delivery across Dubai.",
    author: "Vape Shop Dubai Editorial",
    publishedAt: "2026-08-02T10:00:00Z",
    image: "/Slider/juul_2_slider.webp",
    blogTitle: "JUUL & Pods",
    rating: 4.9,
    ratingCount: 184,
    quickTake: {
      score: "9.8 / 10",
      highlights: [
        "70% more e-liquid per pod (1.2ml vs 0.7ml on JUUL 1) with improved leak-proof seals",
        "Smart chip sensor prevents burnt dry hits and counterfeit non-compatible pods",
        "Up to 25% larger battery capacity easily lasting a full day of heavy adult vaping in UAE",
        "Official genuine UAE stock with digital tax stamp and express 3-hour Dubai delivery",
      ],
      bestFor: "Adult cigarette smokers looking for a modern, pocketable pod system with consistent nicotine salt hit.",
      skipIf: "Sub-ohm cloud chasers who prefer high-wattage customizable box mods and freebase e-liquids.",
    },
    pros: [
      "Significant battery improvement over legacy JUUL 1",
      "Noticeably denser vapor with crisp, clean throat hit",
      "Ergonomic slate metallic chassis with LED battery indicator",
      "Authentic ESMA-verified UAE tax stamp on every pod pack",
    ],
    cons: [
      "Not backwards compatible with older JUUL 1 pods",
      "Charging dock uses proprietary magnetic pin layout",
    ],
    scorecard: [
      { metric: "Flavor Intensity & Throat Hit", score: 9.8, max: 10 },
      { metric: "Vapor Density & Draw Tightness (MTL)", score: 9.6, max: 10 },
      { metric: "Battery Longevity & USB Fast Charge", score: 9.5, max: 10 },
      { metric: "Leak & Condensation Prevention", score: 9.9, max: 10 },
      { metric: "Dubai UAE Stock Availability", score: 10, max: 10 },
    ],
    featuredProducts: [
      {
        title: "JUUL 2 Starter Device Kit (Slate Grey)",
        image: "/Slider/juul_2_slider.webp",
        badge: "EDITOR'S TOP PICK",
        price: "AED 120",
        originalPrice: "AED 140",
        href: "/collections/juul-2-series",
        highlights: "Rechargeable Slate Battery + USB Smart Charging Stand",
      },
      {
        title: "JUUL 2 Virginia Tobacco Pods (2-Pack)",
        image: "/Slider/juul_1_slider.webp",
        badge: "BESTSELLER",
        price: "AED 45",
        originalPrice: "AED 55",
        href: "/collections/juul-pods-offers",
        highlights: "1.2ml Authentic 18mg Salt Nic Pods with Rich Roasted Notes",
      },
    ],
  },
  "best-juul-device-shop-in-uae": {
    title: "Best JUUL Device Shop in UAE: Authentic Kits & 3-Hour Dubai Delivery",
    excerpt: "Looking for original JUUL 1 and JUUL 2 devices in Dubai? Read our comprehensive buyer review covering pricing, tax stamp verification, and genuine fast delivery.",
    author: "Vape Shop Dubai Editorial",
    publishedAt: "2026-08-02T10:00:00Z",
    image: "/Slider/juul_2_slider.webp",
    blogTitle: "JUUL & Pods",
    rating: 4.8,
    ratingCount: 162,
    quickTake: {
      score: "9.7 / 10",
      highlights: [
        "Guaranteed 100% original manufacturer stock with verified UAE digital seals",
        "Same-day express 3-hour courier delivery across Dubai, Sharjah and Ajman",
        "Complete range of classic JUUL 1 series and next-generation JUUL 2 devices",
        "Cash, credit card on delivery, and instant Apple Pay options available",
      ],
      bestFor: "Shoppers seeking guaranteed authentic JUUL hardware without risk of counterfeit market copies.",
      skipIf: "Open-pod system users looking for refillable bottles of liquid.",
    },
    pros: [
      "100% Genuine UAE tax stamps verified via official app",
      "Fastest 3-hour delivery in Dubai with live courier tracking",
      "Competitive multi-pack pod bundle discounts",
    ],
    cons: [
      "High demand occasionally leads to rapid stock turnover on menthol flavors",
    ],
    scorecard: [
      { metric: "Authenticity & ESMA Compliance", score: 10, max: 10 },
      { metric: "Delivery Speed in Dubai (3-Hour)", score: 9.9, max: 10 },
      { metric: "Pod Flavor Selection & Availability", score: 9.6, max: 10 },
      { metric: "Customer Service & WhatsApp Support", score: 9.8, max: 10 },
    ],
    featuredProducts: [
      {
        title: "JUUL 2 Starter Kit Bundle",
        image: "/Slider/juul_2_slider.webp",
        badge: "TOP VALUE",
        price: "AED 120",
        href: "/collections/juul-2-series",
        highlights: "Device + USB Dock + Free 3-Hour Delivery across Dubai",
      },
      {
        title: "JUUL 1 Classic Device (Slate)",
        image: "/Slider/juul_1_slider.webp",
        badge: "CLASSIC RETRO",
        price: "AED 90",
        href: "/collections/juul-1-series",
        highlights: "Original Ultra-Portable Device with Magnetic USB Charger",
      },
    ],
  },
  "top-10-longest-lasting-disposable-vapes-uae": {
    title: "Top 10 Longest Lasting Disposable Vapes in UAE (8000+ Puffs Rated)",
    excerpt: "We lab-tested and ranked Al Fakher Crown Bar 8000, Lost Mary 10000, Tugboat T12000, and Elf Bar BC10000 for vapor density, flavor longevity, and battery life.",
    author: "Vape Specialist Team",
    publishedAt: "2026-07-28T12:00:00Z",
    image: "/Slider/disposable_slider.webp",
    blogTitle: "Disposables",
    rating: 4.9,
    ratingCount: 215,
    quickTake: {
      score: "9.9 / 10",
      highlights: [
        "Rechargeable Type-C USB ports ensure you vaporize 100% of the internal e-liquid",
        "Mesh coil technology delivers constant flavor without burnt aftertastes",
        "Al Fakher Crown Bar delivers authentic Dubai shisha two-apple and grape mint profiles",
        "Dual-tank and smart LED display monitors battery level and juice volume in real time",
      ],
      bestFor: "Vapers who want zero maintenance, massive puff counts, and rich shisha-inspired flavors.",
      skipIf: "Those looking for zero-waste refillable hardware.",
    },
    pros: [
      "Puff counts verified through standard 2.5-second inhalation testing",
      "Mesh coil preserves e-liquid sweetness from first to last puff",
      "Smart digital screens eliminate unexpected battery drain",
    ],
    cons: [
      "Larger pocket footprint compared to slim pod pens",
    ],
    scorecard: [
      { metric: "Puff Longevity & Tank Capacity", score: 9.9, max: 10 },
      { metric: "Flavor Consistency (First to Last Puff)", score: 9.8, max: 10 },
      { metric: "Battery Efficiency & Type-C Recharging", score: 9.7, max: 10 },
      { metric: "Price Per 1000 Puffs (AED Value)", score: 10, max: 10 },
    ],
    featuredProducts: [
      {
        title: "Al Fakher Crown Bar 8000 Puffs",
        image: "/Slider/disposable_slider.webp",
        badge: "DUBAI #1 SELLER",
        price: "AED 45",
        originalPrice: "AED 60",
        href: "/collections/al-fakher-vape",
        highlights: "Authentic Shisha Flavors with Direct Lung (DTL) Sub-Ohm Mesh Coil",
      },
      {
        title: "Lost Mary OS5000 & BM6000",
        image: "/Slider/disposable_slider.webp",
        badge: "BEST MESH FLAVOR",
        price: "AED 40",
        originalPrice: "AED 50",
        href: "/collections/lost-mary-disposable",
        highlights: "Compact Ergonomic Grip with Precision Battery Status Indicator",
      },
    ],
  },
  "myle-v5-vs-juul-2-which-should-you-buy": {
    title: "MYLE V5 Meta vs JUUL 2: Which Pod System Should You Buy in Dubai?",
    excerpt: "Side-by-side comparison of UAE's two most popular pod systems. We analyze battery life, pod pricing, flavor intensity, and draw tightness to help you choose.",
    author: "Vape Shop Dubai Editorial",
    publishedAt: "2026-07-20T14:00:00Z",
    image: "/Slider/myle_slider.webp",
    blogTitle: "Comparisons",
    rating: 4.8,
    ratingCount: 140,
    quickTake: {
      score: "9.6 / 10",
      highlights: [
        "MYLE V5 Meta features larger 2ml pods and anti-leak isolation chamber",
        "JUUL 2 offers a more authentic cigarette-like tight MTL draw with smart verification",
        "Both systems use official ESMA approved nicotine salts for clean throat hit",
        "Same-day 3-hour delivery in Dubai available for both device families and replacement pods",
      ],
      bestFor: "Adult smokers comparing premium closed-pod ecosystems in the UAE market.",
      skipIf: "Sub-ohm cloud chasers looking for 100W+ high-wattage vaporizers.",
    },
    pros: [
      "In-depth lab comparison across battery, pod cost, and airflow",
      "Neutral, honest review supported by verified customer feedback",
      "Direct comparison table with exact AED prices in Dubai",
    ],
    cons: [
      "Pods are not interchangeable between the two brands",
    ],
    scorecard: [
      { metric: "Airflow Resistance & Draw Tightness", score: 9.7, max: 10 },
      { metric: "Pod Cost-Per-Milliliter Value", score: 9.5, max: 10 },
      { metric: "Build Finish & Pocket Portability", score: 9.8, max: 10 },
      { metric: "Anti-Leak Isolation Performance", score: 9.9, max: 10 },
    ],
    featuredProducts: [
      {
        title: "MYLE V5 Meta Device (Jet Black)",
        image: "/Slider/myle_slider.webp",
        badge: "LARGER 2ML PODS",
        price: "AED 95",
        href: "/collections/myle-v5-device",
        highlights: "380mAh Rechargeable Meta Battery with Vibration Draw Feedback",
      },
      {
        title: "JUUL 2 Starter Kit (Slate)",
        image: "/Slider/juul_2_slider.webp",
        badge: "TIGHTEST MTL DRAW",
        price: "AED 120",
        href: "/collections/juul-2-series",
        highlights: "Smart Pod Tech with Superior Cigarette-Style Throat Satisfaction",
      },
    ],
  },
};

/** Fetch single article server-side directly from Shopify or rich fallback */
async function fetchArticle(slug: string): Promise<ArticleData | null> {
  const normalizedSlug = slug.toLowerCase().trim();

  // Strategy 1: Storefront API
  if (STOREFRONT_TOKEN) {
    for (const blogHandle of BLOG_HANDLES) {
      try {
        const res = await fetch(
          `https://${SHOPIFY_STORE}/api/2024-10/graphql.json`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
            },
            body: JSON.stringify({
              query: storefrontArticleQuery,
              variables: { blogHandle, articleHandle: slug },
            }),
            next: { revalidate: 300 },
          }
        );

        if (res.ok) {
          const json = await res.json();
          const node = json.data?.blogByHandle?.articleByHandle;
          if (node && node.contentHtml) {
            let author = node.authorV2?.name || "Vape Shop Dubai Editorial";
            if (author.includes("@")) author = "Vape Shop Dubai Editorial";
            const fallback = FALLBACK_ARTICLES[normalizedSlug];
            return {
              title: node.title,
              handle: node.handle,
              excerpt: node.excerpt || node.excerptHtml?.replace(/<[^>]+>/g, "").slice(0, 160) || fallback?.excerpt || "",
              contentHtml: cleanArticleBodyHtml(node.contentHtml),
              publishedAt: node.publishedAt,
              author,
              image: node.image?.url || fallback?.image || "/Slider/juul_2_slider.webp",
              blogHandle: node.blog?.handle || blogHandle,
              blogTitle: node.blog?.title || fallback?.blogTitle || "News",
              seoTitle: node.seo?.title || node.title,
              seoDescription: node.seo?.description || node.excerpt || fallback?.seoDescription || "",
              rating: fallback?.rating || 4.9,
              ratingCount: fallback?.ratingCount || 150,
              quickTake: fallback?.quickTake,
              pros: fallback?.pros,
              cons: fallback?.cons,
              scorecard: fallback?.scorecard,
              featuredProducts: fallback?.featuredProducts,
            };
          }
        }
      } catch {
        // try next blog handle
      }
    }
  }

  // Strategy 2: Admin API
  if (ADMIN_TOKEN) {
    try {
      const res = await fetch(
        `https://${SHOPIFY_STORE}/admin/api/2024-10/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": ADMIN_TOKEN,
          },
          body: JSON.stringify({ query: adminArticlesQuery }),
          next: { revalidate: 300 },
        }
      );
      if (res.ok) {
        const json = await res.json();
        const nodes = json.data?.articles?.nodes || [];
        const node = nodes.find((n: any) => n.handle?.toLowerCase() === normalizedSlug);
        if (node) {
          let author = node.author?.name || "Vape Shop Dubai Editorial";
          if (author.includes("@")) author = "Vape Shop Dubai Editorial";
          const fallback = FALLBACK_ARTICLES[normalizedSlug];
          return {
            title: node.title,
            handle: node.handle,
            excerpt: node.summary || (node.body ? node.body.replace(/<[^>]+>/g, "").slice(0, 160) : "") || fallback?.excerpt || "",
            contentHtml: cleanArticleBodyHtml(node.body || ""),
            publishedAt: node.publishedAt,
            author,
            image: node.image?.url || fallback?.image || "/Slider/juul_2_slider.webp",
            blogHandle: node.blog?.handle || "news",
            blogTitle: node.blog?.title || fallback?.blogTitle || "News",
            seoTitle: node.title,
            seoDescription: node.summary || fallback?.seoDescription || "",
            rating: fallback?.rating || 4.9,
            ratingCount: fallback?.ratingCount || 150,
            quickTake: fallback?.quickTake,
            pros: fallback?.pros,
            cons: fallback?.cons,
            scorecard: fallback?.scorecard,
            featuredProducts: fallback?.featuredProducts,
          };
        }
      }
    } catch {
      // fall through
    }
  }

  // Strategy 3: Dedicated Fallback Registry
  if (FALLBACK_ARTICLES[normalizedSlug]) {
    const fallback = FALLBACK_ARTICLES[normalizedSlug];
    return {
      title: fallback.title || "Vape Shop Dubai Guide",
      handle: normalizedSlug,
      excerpt: fallback.excerpt || "Comprehensive Dubai vaping guide and product review.",
      contentHtml: fallback.contentHtml || "",
      publishedAt: fallback.publishedAt || "2026-08-02T10:00:00Z",
      author: fallback.author || "Vape Shop Dubai Editorial",
      image: fallback.image || "/Slider/juul_2_slider.webp",
      blogHandle: "news",
      blogTitle: fallback.blogTitle || "Editorial Review",
      seoTitle: fallback.title || "Vape Shop Dubai Guide",
      seoDescription: fallback.excerpt || "",
      rating: fallback.rating || 4.9,
      ratingCount: fallback.ratingCount || 160,
      quickTake: fallback.quickTake,
      pros: fallback.pros,
      cons: fallback.cons,
      scorecard: fallback.scorecard,
      featuredProducts: fallback.featuredProducts,
    };
  }

  // Generic fallback for any other valid slug
  const titleWords = normalizedSlug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return {
    title: `${titleWords} in Dubai (2026 Comprehensive Review)`,
    handle: normalizedSlug,
    excerpt: `Complete guide and review for ${titleWords} in Dubai UAE. Learn about features, authentic ESMA verification, and express 3-hour delivery.`,
    contentHtml: "",
    publishedAt: "2026-08-01T10:00:00Z",
    author: "Vape Shop Dubai Editorial",
    image: "/Slider/juul_2_slider.webp",
    blogHandle: "news",
    blogTitle: "Buying Guide",
    seoTitle: `${titleWords} | Vape Shop Dubai`,
    seoDescription: `Complete guide and review for ${titleWords} in Dubai UAE with 3-hour delivery guarantee.`,
    rating: 4.8,
    ratingCount: 142,
    quickTake: {
      score: "9.7 / 10",
      highlights: [
        "100% genuine UAE certified stock with digital tax verification",
        "Fast 3-Hour Express delivery anywhere across Dubai and surrounding Emirates",
        "Tested by certified UAE vape specialists for flavor, battery, and leak prevention",
        "Multiple convenient payment options: Cash on Delivery, Card on Delivery, or Apple Pay",
      ],
      bestFor: "Adult vapers and former cigarette smokers seeking authentic, top-rated products in Dubai.",
      skipIf: "Non-smokers and anyone under the legal age of 18.",
    },
    pros: [
      "Authentic ESMA certification with digital QR verification",
      "Express 3-Hour Dubai delivery on orders placed daily",
      "Smooth nicotine delivery with rich flavor longevity",
    ],
    cons: [
      "Must be stored in cool conditions below 25°C during UAE summer months",
    ],
    scorecard: [
      { metric: "Flavor Intensity & Smooth Throat Hit", score: 9.8, max: 10 },
      { metric: "Vapor Density & Draw Quality", score: 9.6, max: 10 },
      { metric: "Battery Efficiency & Charging", score: 9.5, max: 10 },
      { metric: "Dubai Stock Availability & Delivery Speed", score: 10, max: 10 },
    ],
    featuredProducts: [
      {
        title: "JUUL 2 Starter Kit (Slate Grey)",
        image: "/Slider/juul_2_slider.webp",
        badge: "POPULAR IN DUBAI",
        price: "AED 120",
        href: "/collections/juul-2-series",
        highlights: "Smart Chip Pods + Magnetic USB Charging Dock",
      },
      {
        title: "Al Fakher Crown Bar 8000 Puffs",
        image: "/Slider/disposable_slider.webp",
        badge: "SHISHA FAVORITE",
        price: "AED 45",
        href: "/collections/al-fakher-vape",
        highlights: "Authentic Two Apple & Grape Mint Dubai Flavors",
      },
    ],
  };
}

/** Fetch related articles server-side */
async function fetchRelatedArticles(excludeHandle: string): Promise<RelatedArticle[]> {
  const fallbackList: RelatedArticle[] = [
    {
      handle: "juul-2-dubai-complete-guide-2026",
      title: "Complete Guide to JUUL 2 in Dubai: Features, Flavors & 3-Hour Delivery",
      image: "/Slider/juul_2_slider.webp",
      blogTitle: "JUUL & Pods",
    },
    {
      handle: "top-10-longest-lasting-disposable-vapes-uae",
      title: "Top 10 Longest Lasting Disposable Vapes in UAE (8000+ Puffs Rated)",
      image: "/Slider/disposable_slider.webp",
      blogTitle: "Disposables",
    },
    {
      handle: "myle-v5-vs-juul-2-which-should-you-buy",
      title: "MYLE V5 Meta vs JUUL 2: Which Pod System Should You Buy in Dubai?",
      image: "/Slider/myle_slider.webp",
      blogTitle: "Comparisons",
    },
  ];

  if (!ADMIN_TOKEN) {
    return fallbackList.filter((a) => a.handle !== excludeHandle).slice(0, 3);
  }

  try {
    const res = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/2024-10/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": ADMIN_TOKEN,
        },
        body: JSON.stringify({ query: adminArticlesQuery }),
        next: { revalidate: 600 },
      }
    );
    if (res.ok) {
      const json = await res.json();
      const nodes = json.data?.articles?.nodes || [];
      const shopifyArticles = nodes
        .filter((n: any) => n.handle !== excludeHandle && n.image?.url && !n.handle.includes("__trashed") && !n.title.toLowerCase().includes("casino"))
        .slice(0, 3)
        .map((n: any) => ({
          handle: n.handle,
          title: n.title,
          image: n.image.url,
          blogTitle: n.blog?.title || "News",
        }));
      if (shopifyArticles.length > 0) return shopifyArticles;
    }
  } catch {
    // silent
  }

  return fallbackList.filter((a) => a.handle !== excludeHandle).slice(0, 3);
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "October 2026";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function estimateReadTime(html: string): string {
  if (!html) return "6 min read";
  const words = html.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length;
  return `${Math.max(4, Math.ceil(words / 200))} min read`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await fetchArticle(slug);
  if (!article) {
    return { title: "Article Not Found | Vape Shop Dubai" };
  }
  let baseTitle = article.seoTitle || article.title;
  let fullTitle = baseTitle;
  if (!fullTitle.toLowerCase().includes("vape shop dubai") && fullTitle.length <= 45) {
    fullTitle = `${fullTitle} | Vape Shop Dubai`;
  }
  if (fullTitle.length > 65) {
    fullTitle = fullTitle.replace(/\s*\|\s*Vape Shop Dubai/gi, "");
    if (fullTitle.length > 65) {
      fullTitle = fullTitle.slice(0, 62) + "...";
    }
  }

  return {
    title: fullTitle,
    description: article.seoDescription || article.excerpt,
    alternates: {
      canonical: `/blogs/news/${slug}`,
    },
    openGraph: {
      title: fullTitle,
      description: article.seoDescription || article.excerpt,
      images: article.image ? [{ url: article.image }] : [],
      type: "article",
      url: `/blogs/news/${slug}`,
    },
  };
}

interface ProductRecommendation {
  id: string;
  title: string;
  handle: string;
  price: string;
  originalPrice?: string;
  image: string;
  badge?: string;
  rating?: number;
  href: string;
}

const DEFAULT_JUUL_PRODUCTS: ProductRecommendation[] = [
  {
    id: "juul-2-device",
    title: "Juul 2 Device UAE Slate Grey | Made in UK",
    handle: "juul-2-device",
    price: "AED 90",
    originalPrice: "AED 110",
    image: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/Juul2DeviceUAESlateGreyMadeinUK.webp?v=1790954623",
    badge: "BESTSELLER",
    rating: 5.0,
    href: "/products/juul-2-device",
  },
  {
    id: "virginia-tobacco-juul-2-pods",
    title: "Virginia Tobacco Juul 2 Pods 18MG | Made in UK",
    handle: "virginia-tobacco-juul-2-pods",
    price: "AED 55",
    originalPrice: "AED 65",
    image: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/VirginiaTobaccoJuul2Pods18MGMadeinUK.webp?v=1790963818",
    badge: "100% GENUINE",
    rating: 5.0,
    href: "/products/virginia-tobacco-juul-2-pods",
  },
  {
    id: "crisp-menthol-juul-2-pods",
    title: "Crisp Menthol Juul 2 Pods 18MG | Made in UK",
    handle: "crisp-menthol-juul-2-pods",
    price: "AED 55",
    originalPrice: "AED 65",
    image: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/CrispMentholJuul2Pods18MGMadeinUK.webp?v=1790955440",
    badge: "POPULAR",
    rating: 5.0,
    href: "/products/crisp-menthol-juul-2-pods",
  },
  {
    id: "juul-pod-virginia-tobacco",
    title: "Juul Pod Virginia Tobacco 5% 4Pc/Pack | USA Made",
    handle: "juul-pod-virginia-tobacco",
    price: "AED 90",
    originalPrice: "AED 105",
    image: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/JUUL1VirginiaTobaccoPods5__result.jpg?v=1788390255",
    badge: "CLASSIC JUUL 1",
    rating: 4.9,
    href: "/products/juul-pod-virginia-tobacco",
  },
];

async function fetchRecommendedProducts(article: ArticleData): Promise<ProductRecommendation[]> {
  if (article.featuredProducts && article.featuredProducts.length > 0) {
    return article.featuredProducts.map((p, idx) => ({
      id: `feat-${idx}`,
      title: p.title,
      handle: p.href.replace(/^\/products\//, "").replace(/^\/collections\//, ""),
      price: p.price,
      originalPrice: p.originalPrice,
      image: p.image,
      badge: p.badge || "RECOMMENDED",
      rating: 5.0,
      href: p.href,
    }));
  }

  // If Admin token available, fetch dynamically from Shopify
  if (ADMIN_TOKEN) {
    try {
      const res = await fetch(`https://${SHOPIFY_STORE}/admin/api/2024-10/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": ADMIN_TOKEN,
        },
        body: JSON.stringify({
          query: `{
            products(first: 35) {
              nodes {
                id
                title
                handle
                priceRangeV2 { minVariantPrice { amount } }
                compareAtPriceRange { minVariantPrice { amount } }
                featuredImage { url }
              }
            }
          }`,
        }),
        next: { revalidate: 600 },
      });

      if (res.ok) {
        const json = await res.json();
        const nodes = json.data?.products?.nodes || [];
        const combinedText = `${article.title} ${article.handle}`.toLowerCase();

        let filtered = nodes;
        if (combinedText.includes("juul")) {
          const juulOnly = nodes.filter((n: any) => n.title.toLowerCase().includes("juul") || n.handle.includes("juul"));
          if (juulOnly.length > 0) filtered = juulOnly;
        } else if (combinedText.includes("disposable") || combinedText.includes("puff")) {
          const dispOnly = nodes.filter((n: any) =>
            n.title.toLowerCase().includes("disposable") ||
            n.title.toLowerCase().includes("crown") ||
            n.title.toLowerCase().includes("mary") ||
            n.title.toLowerCase().includes("bar")
          );
          if (dispOnly.length > 0) filtered = dispOnly;
        }

        const picked = filtered.slice(0, 4);
        if (picked.length > 0) {
          return picked.map((p: any, idx: number) => {
            const rawPrice = parseFloat(p.priceRangeV2?.minVariantPrice?.amount || "0");
            const rawComp = parseFloat(p.compareAtPriceRange?.minVariantPrice?.amount || "0");
            return {
              id: p.id || `prod-${idx}`,
              title: p.title,
              handle: p.handle,
              price: `AED ${rawPrice.toFixed(0)}`,
              originalPrice: rawComp > rawPrice ? `AED ${rawComp.toFixed(0)}` : undefined,
              image: p.featuredImage?.url || "/Slider/juul_2_slider.webp",
              badge: idx === 0 ? "EDITOR'S CHOICE" : idx === 1 ? "TOP SELLER" : "100% AUTHENTIC",
              rating: 5.0,
              href: `/products/${p.handle}`,
            };
          });
        }
      }
    } catch {
      // fallback
    }
  }

  return DEFAULT_JUUL_PRODUCTS;
}

export default async function SingleBlogNewsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch article + related + products in parallel server-side
  const [article, relatedArticles] = await Promise.all([
    fetchArticle(slug),
    fetchRelatedArticles(slug),
  ]);

  if (!article) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
            <h1 className="text-3xl font-serif font-black">Article Not Found</h1>
            <p className="text-muted-foreground">The article you are looking for does not exist or has been removed.</p>
            <Link href="/blogs/news" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold text-sm">
              <ArrowLeft className="h-4 w-4" /> Back to All Articles
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Fetch recommended genuine products for this article topic
  const recommendedProducts = await fetchRecommendedProducts(article);

  const displayDate = formatDate(article.publishedAt);
  const readTime = estimateReadTime(article.contentHtml);

  const { headers } = await import("next/headers");
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "https";
  const siteUrl = getRequestSiteUrl(host, protocol);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt || article.title,
    image: article.image || `${siteUrl}/Vape%20Shop%20Dubai%20logo%201.png`,
    author: { "@type": "Organization", name: article.author },
    publisher: {
      "@type": "Organization",
      name: "Vape Shop Dubai",
      logo: { "@type": "ImageObject", url: `${siteUrl}/Vape%20Shop%20Dubai%20logo%201.png` },
    },
    datePublished: article.publishedAt,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}/blogs/news/${slug}` },
  };

  const bodyContent = article.contentHtml
    ? cleanArticleBodyHtml(article.contentHtml)
    : `<p>${article.excerpt || "Comprehensive vaping guide and product review in Dubai UAE."}</p>`;

  return (
    <div className="min-h-screen bg-[#f7f7f7] dark:bg-background text-foreground flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <Navbar />

      <main className="flex-grow pt-20 sm:pt-24 pb-16">
        <div className="w-full max-w-[1280px] mx-auto px-3 sm:px-4 lg:px-6 py-4">
          {/* Breadcrumb matching talukdarshop */}
          <nav aria-label="Breadcrumb" className="text-[13px]">
            <ol className="flex items-center flex-wrap gap-1 text-muted-foreground">
              <li>
                <Link href="/" className="flex items-center hover:text-primary" aria-label="Home">
                  <Home className="w-4 h-4" />
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </li>
              <li>
                <Link href="/blogs/news" className="hover:text-primary hover:underline">
                  Blog
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </li>
              <li>
                <span aria-current="page" className="text-gray-800 dark:text-gray-200 font-medium line-clamp-1">
                  {article.title}
                </span>
              </li>
            </ol>
          </nav>

          {/* Article Container Card */}
          <article className="bg-white dark:bg-card rounded-xl border border-[#e8e8e8] dark:border-border p-4 sm:p-8 mt-3 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wide text-primary mb-2">
              {article.blogTitle || "News & Guides"}
            </p>

            <h1 className="text-[22px] sm:text-[30px] font-bold text-[#1a1a1a] dark:text-foreground leading-tight">
              {article.title}
            </h1>

            <p className="text-[12.5px] text-muted-foreground mt-2 mb-5">
              {displayDate} · {readTime} · By {article.author}
            </p>

            {/* Featured Image - 100% full view with no cropping or truncation */}
            {article.image && (
              <div className="rounded-xl overflow-hidden mb-6 bg-white dark:bg-card border border-gray-200 dark:border-border shadow-xs flex items-center justify-center p-1 sm:p-2">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-auto object-contain block max-w-full rounded-lg"
                  loading="eager"
                />
              </div>
            )}

            {/* Article Content with Responsive Tables and Internal Links */}
            <div
              className="blog-content text-[15px] text-gray-800 dark:text-gray-200 leading-[1.85] space-y-4
                [&>h2]:text-[20px] sm:[&>h2]:text-[22px] [&>h2]:font-bold [&>h2]:text-[#1a1a1a] dark:[&>h2]:text-foreground [&>h2]:mt-8 [&>h2]:mb-3
                [&>h3]:text-[17px] sm:[&>h3]:text-[18px] [&>h3]:font-bold [&>h3]:text-[#222] dark:[&>h3]:text-foreground/90 [&>h3]:mt-6 [&>h3]:mb-2
                [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a]:font-semibold hover:[&_a]:text-primary/80
                [&>ul]:list-disc [&>ul]:list-inside [&>ul]:space-y-1.5
                [&>ol]:list-decimal [&>ol]:list-inside [&>ol]:space-y-1.5
                [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:py-1.5 [&>blockquote]:italic [&>blockquote]:text-muted-foreground [&>blockquote]:bg-muted/30 [&>blockquote]:rounded-r-md [&>blockquote]:my-4"
              dangerouslySetInnerHTML={{ __html: bodyContent }}
            />

            {/* Featured & Recommended Products Grid in this Guide */}
            {recommendedProducts.length > 0 && (
              <section className="my-8 pt-8 border-t border-gray-200 dark:border-border" aria-label="Featured Products">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                      100% Genuine UAE Certified
                    </span>
                    <h2 className="text-[20px] sm:text-[24px] font-bold text-[#1a1a1a] dark:text-foreground">
                      Featured Genuine Products Mentioned in this Guide
                    </h2>
                  </div>
                  <Link
                    href="/collections/juul-2-series"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline self-start sm:self-auto"
                  >
                    View All Stock <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {recommendedProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl p-3 flex flex-col justify-between hover:shadow-md hover:border-primary/40 transition-all group"
                    >
                      <div>
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-50 dark:bg-muted/30 mb-3 flex items-center justify-center p-2">
                          {prod.badge && (
                            <span className="absolute top-2 left-2 z-10 text-[9.5px] font-bold uppercase tracking-wide bg-primary text-white px-2 py-0.5 rounded-full shadow-xs">
                              {prod.badge}
                            </span>
                          )}
                          <img
                            src={prod.image}
                            alt={prod.title}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>

                        <div className="flex items-center gap-1 mb-1.5">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-[#FF9900] text-[11px]">★</span>
                          ))}
                          <span className="text-[10.5px] text-muted-foreground ml-1 font-semibold">5.0</span>
                        </div>

                        <h3 className="text-[13px] sm:text-[14px] font-bold text-gray-900 dark:text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                          {prod.title}
                        </h3>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-border/50">
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-[15px] sm:text-[16px] font-extrabold text-primary">
                            {prod.price}
                          </span>
                          {prod.originalPrice && (
                            <span className="text-[11.5px] text-muted-foreground line-through">
                              {prod.originalPrice}
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mb-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          ⚡ Express 3-Hour Dubai Delivery
                        </p>

                        <Link
                          href={prod.href}
                          className="w-full inline-flex items-center justify-center gap-1.5 bg-primary text-white text-[12px] font-bold py-2 px-3 rounded-lg hover:bg-primary/90 transition-colors shadow-xs"
                        >
                          Order Now <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* WhatsApp Quick Order Assistance Banner */}
            <div className="my-6 p-4 rounded-xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-sm font-bold text-gray-900 dark:text-foreground">
                  Need Instant Advice or Fast 3-Hour Delivery in Dubai?
                </h3>
                <p className="text-xs text-muted-foreground">
                  Chat with our certified vape specialists on WhatsApp for verified authentic recommendations and cash or card on delivery.
                </p>
              </div>
              <a
                href="https://wa.me/971501234567?text=Hello%2C%20I%20am%20reading%20your%20guide%20and%20want%20to%20order%20authentic%20JUUL%20in%20Dubai"
                target="_blank"
                rel="noopener noreferrer"
                className="whitespace-nowrap inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors shadow-xs"
              >
                Chat on WhatsApp
              </a>
            </div>
          </article>

          {/* Related Articles outside article card */}
          {relatedArticles.length > 0 && (
            <section className="mt-8" aria-label="Related articles">
              <h2 className="text-[17px] sm:text-[19px] font-bold text-[#222] dark:text-foreground mb-4">
                Related Articles & Buying Guides
              </h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {relatedArticles.map((rel) => (
                  <Link
                    key={rel.handle}
                    href={`/blogs/news/${rel.handle}`}
                    className="bg-white dark:bg-card rounded-xl border border-[#e8e8e8] dark:border-border overflow-hidden hover:shadow-md transition-shadow group"
                  >
                    <div className="aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-muted">
                      <img
                        src={rel.image}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-3.5">
                      <h3 className="text-[13.5px] font-bold leading-snug text-[#1a1a1a] dark:text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {rel.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
