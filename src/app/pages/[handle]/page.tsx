import { notFound } from "next/navigation";
import { Metadata } from "next";

// Force dynamic since pages might update, or we could generate static params if preferred.
// For now, let's keep it revalidated dynamically.
export const revalidate = 300; // 5 minutes

async function getPageByHandle(handle: string) {
  const SHOPIFY_STORE = process.env.SHOPIFY_STORE || "vap-shop-dubai.myshopify.com";
  const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "";

  const query = `
    query getPage($handle: String!) {
      page(handle: $handle) {
        id
        title
        handle
        body
        bodySummary
        seo {
          title
          description
        }
      }
    }
  `;

  try {
    const url = `https://${SHOPIFY_STORE}/api/2024-10/graphql.json`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables: { handle } }),
      next: { revalidate: 300 },
    });

    if (res.ok) {
      const json = await res.json();
      return json.data?.page || null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching page:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  const page = await getPageByHandle(params.handle);
  if (!page) return { title: "Page Not Found" };

  return {
    title: page.seo?.title || `${page.title} | Vape Shop Dubai`,
    description: page.seo?.description || page.bodySummary || `${page.title} page for Vape Shop Dubai.`,
  };
}

export default async function ShopifyPage({ params }: { params: { handle: string } }) {
  const page = await getPageByHandle(params.handle);

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Header Section */}
      <div className="relative py-16 sm:py-24 bg-card border-b border-border/50 overflow-hidden">
        {/* Subtle glow effect */}
        <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] rounded-full bg-primary/5 filter blur-[100px] pointer-events-none" />
        
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 relative z-10 text-center">
          <h1 className="text-3xl sm:text-5xl font-serif text-foreground leading-tight tracking-tight mb-4">
            {page.title}
          </h1>
          <div className="w-16 h-1 bg-primary rounded-full mx-auto" />
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div 
          className="
            text-base sm:text-lg leading-relaxed text-muted-foreground
            [&>h1]:text-3xl [&>h1]:font-serif [&>h1]:text-foreground [&>h1]:mb-6 [&>h1]:mt-10
            [&>h2]:text-2xl [&>h2]:font-serif [&>h2]:text-foreground [&>h2]:mb-4 [&>h2]:mt-8
            [&>h3]:text-xl [&>h3]:font-serif [&>h3]:text-foreground [&>h3]:mb-3 [&>h3]:mt-6
            [&>p]:mb-6
            [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul>li]:mb-2
            [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>ol>li]:mb-2
            [&>a]:text-primary [&>a]:underline [&>a:hover]:text-primary/80
            [&>img]:rounded-2xl [&>img]:shadow-md [&>img]:border [&>img]:border-border/50 [&>img]:mb-6
            [&>strong]:text-foreground [&>b]:text-foreground
          "
          dangerouslySetInnerHTML={{ __html: page.body }}
        />
      </div>
    </div>
  );
}
