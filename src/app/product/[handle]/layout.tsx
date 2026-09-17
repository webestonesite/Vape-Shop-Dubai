import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { handle: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const handle = params.handle;
  let title = "Product | Vape Shop Dubai";
  let description = "Shop premium products at Vape Shop Dubai. Fast delivery across the UAE.";

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
            query getProductSEO($handle: String!) {
              productByHandle(handle: $handle) {
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
        console.log("GraphQL Response:", JSON.stringify(json).slice(0, 200));
        const product = json?.data?.productByHandle;
        if (product) {
          title = product.seo?.title || product.title;
          description = product.seo?.description || description;
          console.log("Setting SEO title to:", title);
        }
      } else {
        console.error("Shopify fetch failed:", res.status, res.statusText);
      }
    } else {
      console.error("Missing SHOPIFY_STORE or TOKEN in env!");
    }
  } catch (error) {
    console.error("Error fetching product SEO metadata:", error);
  }

  return {
    title: {
      absolute: title,
    },
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

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
