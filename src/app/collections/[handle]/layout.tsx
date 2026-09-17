import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { handle: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const handle = params.handle;
  let title = "Collection | Vape Shop Dubai";
  let description = "Shop our premium collection of vapes, pods, and e-liquids at Vape Shop Dubai.";

  try {
    const SHOPIFY_STORE = process.env.SHOPIFY_STORE!;
    const TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.SHOPIFY_API_KEY;

    if (SHOPIFY_STORE && TOKEN) {
      const res = await fetch(`https://${SHOPIFY_STORE}/api/2024-01/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": TOKEN,
        },
        body: JSON.stringify({
          query: `
            query getCollectionSEO($handle: String!) {
              collectionByHandle(handle: $handle) {
                title
                seo {
                  title
                  description
                }
              }
            }
          `,
          variables: { handle },
        }),
        next: { revalidate: 3600 }
      });

      if (res.ok) {
        const json = await res.json();
        const collection = json?.data?.collectionByHandle;
        if (collection) {
          title = collection.seo?.title || collection.title;
          description = collection.seo?.description || description;
        }
      }
    }
  } catch (error) {
    console.error("Error fetching collection SEO metadata:", error);
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    twitter: {
      title,
      description,
    }
  };
}

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
