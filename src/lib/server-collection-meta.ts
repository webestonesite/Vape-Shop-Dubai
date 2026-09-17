const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const ADMIN_API_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.SHOPIFY_API_KEY;

export interface ServerCollectionMeta {
  title: string;
  description: string;
  descriptionHtml: string;
  image: { url: string; altText: string; width: number; height: number } | null;
  seo: { title: string; description: string } | null;
  customHeading?: string | null;
  pageSections?: any;
}

export async function getCollectionMetaServer(handle: string): Promise<ServerCollectionMeta | null> {
  if (!handle || handle === "brand" || handle === "brands") return null;

  try {
    if (SHOPIFY_STORE && ADMIN_API_TOKEN) {
      const url = `https://${SHOPIFY_STORE}/admin/api/2024-10/graphql.json`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": ADMIN_API_TOKEN,
        },
        body: JSON.stringify({
          query: `
            query getCollectionMeta($handle: String!) {
              collectionByHandle(handle: $handle) {
                title
                description
                descriptionHtml
                image {
                  url
                  altText
                  width
                  height
                }
                seo {
                  title
                  description
                }
                customHeading: metafield(namespace: "custom", key: "custom_heading") { value }
              }
            }
          `,
          variables: { handle },
        }),
        next: { revalidate: 60 },
      });

      if (res.ok) {
        const json = await res.json();
        const col = json?.data?.collectionByHandle;
        if (col) {
          return {
            title: col.title || "",
            description: col.description || "",
            descriptionHtml: col.descriptionHtml || "",
            image: col.image || null,
            seo: col.seo || null,
            customHeading: col.customHeading?.value || null,
          };
        }
      }
    }

    // Fallback Storefront API
    if (SHOPIFY_STORE && STOREFRONT_TOKEN) {
      const url = `https://${SHOPIFY_STORE}/api/2024-10/graphql.json`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
        },
        body: JSON.stringify({
          query: `
            query getCollectionMetaStorefront($handle: String!) {
              collection(handle: $handle) {
                title
                description
                descriptionHtml
                image {
                  url
                  altText
                  width
                  height
                }
                seo {
                  title
                  description
                }
              }
            }
          `,
          variables: { handle },
        }),
        next: { revalidate: 60 },
      });

      if (res.ok) {
        const json = await res.json();
        const col = json?.data?.collection;
        if (col) {
          return {
            title: col.title || "",
            description: col.description || "",
            descriptionHtml: col.descriptionHtml || "",
            image: col.image || null,
            seo: col.seo || null,
          };
        }
      }
    }
  } catch (error) {
    console.error("Error in getCollectionMetaServer:", error);
  }

  return null;
}
