import type { Metadata } from "next";

const SHOPIFY_STORE = process.env.SHOPIFY_STORE || "vap-shop-dubai.myshopify.com";
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "";

const blogQuery = `
query getBlogSEO {
  blog(handle: "news") {
    title
    seo {
      title
      description
    }
  }
}
`;

export async function generateMetadata(): Promise<Metadata> {
  let title = "Vape Shop Dubai Blog & Expert Guides";
  let description = "Discover the latest vaping news, expert reviews, and authenticity guides in UAE.";

  if (STOREFRONT_TOKEN) {
    try {
      const res = await fetch(`https://${SHOPIFY_STORE}/api/2024-10/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
        },
        body: JSON.stringify({ query: blogQuery }),
        next: { revalidate: 300 }, // Cache for 5 mins
      });

      if (res.ok) {
        const json = await res.json();
        const blog = json.data?.blog;
        if (blog) {
          const rawTitle = blog.seo?.title || blog.title;
          if (rawTitle && rawTitle !== "News" && rawTitle.length >= 15) {
            title = rawTitle;
          } else {
            title = "Vape News & UAE Vaping Guides | Vape Shop Dubai";
          }
          if (blog.seo?.description) description = blog.seo.description;
        }
      }
    } catch (e) {
      // fallback
    }
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default function BlogNewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
