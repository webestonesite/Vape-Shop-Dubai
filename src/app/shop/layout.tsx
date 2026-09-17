import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  let title = "All Products | Vape Shop Dubai";
  let description = "Explore our full catalog of authentic vapes, disposables, pod systems, and e-liquids with fast UAE delivery.";

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
            query getShopSEO {
              shop {
                name
                description
              }
            }
          `,
        }),
        next: { revalidate: 3600 }
      });

      if (res.ok) {
        const json = await res.json();
        if (json?.data?.shop?.name) {
          title = `${json.data.shop.name} - All Products`;
        }
      }
    }
  } catch (e) {
    // Fallback to defaults
  }

  return {
    title: { absolute: title },
    description,
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
