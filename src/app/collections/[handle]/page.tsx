import type { Metadata } from "next";
import { fetchCollection } from "@/lib/shopify/collection";
import { getAllProducts } from "@/lib/shopify/products-fetch";
import ClientCollectionPage from "./ClientCollectionPage";
import { getItemListSchema, getBreadcrumbSchema } from "@/lib/seo-schemas";

export const revalidate = 3600; // Edge ISR cache for 1 hour

const CANONICAL_COLLECTION_ALIASES: Record<string, string> = {
  juul: "juul-vape-dubai",
  myle: "myle-vape-dubai",
  disposable: "disposable-vape",
  disposables: "disposable-vape",
  "e-liquid": "vape-e-juice",
  "e-liquids": "vape-e-juice",
  "e-juice": "vape-e-juice",
  "pod-systems": "pod-system",
  accessories: "pod-system",
};

const CANONICAL_HANDLE_TITLES: Record<string, string> = {
  "juul-vape-dubai": "Juul Vape Dubai",
  "juul-2-series": "Juul 2 Series",
  "juul-1-series": "Juul 1 Series",
  "juul-pods-offers": "Juul Pods Offers",
  "myle-vape-dubai": "Myle Vape Dubai",
  "myle-v5-pods": "Myle V5 Pods",
  "myle-v5-device": "Myle V5 Devices",
  "myle-disposable": "Myle Disposables",
  "disposable-vape": "Disposable Vape Dubai",
  "al-fakher-vape": "Al Fakher Vape",
  "elf-bar-vape": "Elf Bar Vape",
  "lost-mary-disposable": "Lost Mary Disposable",
  "tugboat-vape": "Tugboat Vape",
  "vozol-vape": "Vozol Vape",
  "vape-e-juice": "Vape E-Juice",
  "pod-system": "Pod Systems & Kits",
  all: "All Vape Products",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const hLower = (handle || "").toLowerCase();
  const meta = await fetchCollection(handle).catch(() => null);

  const fallbackTitle =
    CANONICAL_HANDLE_TITLES[hLower] ||
    handle
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const title = meta?.seo?.title || meta?.title || fallbackTitle;
  const description =
    meta?.seo?.description ||
    meta?.description ||
    `Shop authentic ${title} in Dubai, UAE with 2-hour express delivery. 100% original verified products at Vape Shop Dubai.`;

  const siteUrl = "https://vapeshopdubai.webestone.net";
  const canonicalUrl = `${siteUrl}/collections/${handle}`;

  return {
    title: `${title} | Vape Shop Dubai`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | Vape Shop Dubai`,
      description,
      url: canonicalUrl,
      images: meta?.image?.url ? [{ url: meta.image.url }] : [`${siteUrl}/hero_vape.png`],
      type: "website",
    },
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams?: Promise<{ preview?: string; __vs_preview?: string }>;
}) {
  const { handle } = await params;
  const sParams = searchParams ? await searchParams : undefined;
  const isPreview = sParams?.preview === "true" || sParams?.__vs_preview === "true";

  const [collectionMeta, allProducts] = await Promise.all([
    fetchCollection(handle, { preview: isPreview }).catch(() => null),
    getAllProducts().catch(() => []),
  ]);

  const hLower = (handle || "").toLowerCase().trim();
  const targetHandle = CANONICAL_COLLECTION_ALIASES[hLower] || hLower;

  // Filter matching products for this collection on the server
  const matchingProducts =
    !hLower || hLower === "all" || hLower === "shop"
      ? allProducts
      : allProducts.filter((p) => {
          const pCollections = (p.collections || []).map((c) => c.toLowerCase());
          return pCollections.includes(hLower) || pCollections.includes(targetHandle);
        });

  const collectionTitle =
    (collectionMeta as any)?.customHeading ||
    CANONICAL_HANDLE_TITLES[hLower] ||
    collectionMeta?.title ||
    handle
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  // Generate complete ItemList schema for 100% crawler indexation
  const itemListSchema = getItemListSchema(
    collectionTitle,
    matchingProducts.map((p) => ({
      name: p.name,
      handle: p.handle,
      price: p.price,
      image: p.image,
    }))
  );

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Collections", item: "/collections" },
    { name: collectionTitle, item: `/collections/${handle}` },
  ]);

  return (
    <>
      {/* Complete ItemList and Breadcrumb structured data in raw server HTML */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Client Interactive Section, initialized with server-fetched products */}
      <ClientCollectionPage
        handle={handle}
        initialMeta={collectionMeta}
        initialProducts={allProducts}
      />
    </>
  );
}
