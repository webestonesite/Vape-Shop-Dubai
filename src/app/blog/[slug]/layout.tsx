import { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let title = "Blog | Vape Shop Dubai";
  let description = "Read the latest vaping guides, news, and tips at Vape Shop Dubai.";

  try {
    const SHOPIFY_STORE = process.env.SHOPIFY_STORE!;
    const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;

    if (SHOPIFY_STORE && ADMIN_TOKEN) {
      const res = await fetch(`https://${SHOPIFY_STORE}/admin/api/2024-10/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": ADMIN_TOKEN,
        },
        body: JSON.stringify({
          query: `
            query getArticleSEO($query: String!) {
              articles(first: 1, query: $query) {
                edges {
                  node {
                    title
                    seo {
                      title
                      description
                    }
                  }
                }
              }
            }
          `,
          variables: { query: `handle:${slug}` },
        }),
        next: { revalidate: 60 }
      });

      if (res.ok) {
        const json = await res.json();
        const articleNode = json?.data?.articles?.edges?.[0]?.node;
        if (articleNode) {
          title = articleNode.seo?.title || articleNode.title;
          description = articleNode.seo?.description || description;
        }
      }
    }
  } catch (error) {
    console.error("Error fetching article SEO metadata:", error);
  }

  return {
    title: { absolute: title },
    description,
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default function SingleBlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
