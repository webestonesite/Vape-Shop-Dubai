import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchCollection } from "@/lib/shopify/collection";
import { getAllProducts } from "@/lib/shopify/products-fetch";
import { getThemeSettings } from "@/lib/theme/get-settings";
import { resolveTemplateKey } from "@/lib/theme/types";
import { PageTemplatesProvider } from "@/context/PageTemplatesContext";
import ClientCollectionPage from "./ClientCollectionPage";
import { getItemListSchema, getBreadcrumbSchema } from "@/lib/seo-schemas";
import {
  CANONICAL_COLLECTION_ALIASES,
  CANONICAL_HANDLE_TITLES,
  getMatchingCollectionProducts,
} from "@/lib/shopify/collection-matching";

export const revalidate = 60; // Edge ISR cache for 60 seconds

export async function generateStaticParams() {
  return Object.keys(CANONICAL_HANDLE_TITLES).map((handle) => ({
    handle,
  }));
}

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
    `Shop authentic ${title} in Dubai, UAE with 3-hour express delivery. 100% original verified products at Vape Shop Dubai.`;

  const canonicalPath = `/collections/${handle}`;

  return {
    title: `${title} | Vape Shop Dubai`,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${title} | Vape Shop Dubai`,
      description,
      url: canonicalPath,
      images: meta?.image?.url ? [{ url: meta.image.url }] : ["/hero_vape.png"],
      type: "website",
    },
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams?: Promise<{ preview?: string; __vs_preview?: string; sub?: string }>;
}) {
  const { handle } = await params;
  const sParams = searchParams ? await searchParams : undefined;
  const isPreview = sParams?.preview === "true" || sParams?.__vs_preview === "true";
  const subFilter = typeof sParams?.sub === "string" ? sParams.sub : undefined;

  const [collectionMeta, allProducts, themeSettings] = await Promise.all([
    fetchCollection(handle, { preview: isPreview }).catch(() => null),
    getAllProducts().catch(() => []),
    getThemeSettings().catch(() => null),
  ]);

  const hLower = (handle || "").toLowerCase().trim();

  // Filter matching products for this collection on the server
  const matchingProducts = getMatchingCollectionProducts(allProducts, handle);

  // For /shop (handle "all"), send first 48 items initially to keep initial payload < 500KB; ClientCollectionPage hydrates the rest in background
  const isShopAll = !hLower || hLower === "all" || hLower === "shop";
  const initialSlice = isShopAll ? matchingProducts.slice(0, 48) : matchingProducts;

  // Map to lean product structure without extra arrays to slash flight payload
  const leanMatchingProducts = initialSlice.map((p) => ({
    id: p.id,
    name: p.name,
    handle: p.handle,
    variantId: p.variantId,
    category: p.category,
    price: p.price,
    originalPrice: p.originalPrice,
    rating: p.rating,
    reviews: p.reviews,
    image: p.image,
    hoverImage: p.hoverImage,
    tag: p.tag,
    tagColor: p.tagColor,
    isPopular: p.isPopular,
    isSoldOut: p.isSoldOut,
    puffs: p.puffs,
    nicotine: p.nicotine,
    battery: p.battery,
    section: p.section,
    brand: p.brand,
    collections: p.collections,
    tags: p.tags,
  }));

  // Resolve ONLY the active collection template to save ~170KB in RSC flight payload
  const scopedTemplates: Record<string, any> = {};
  if (themeSettings?.templates) {
    const templateKey = resolveTemplateKey(themeSettings.templates, "collection", handle);
    const activeTemplate = themeSettings.templates[templateKey] || themeSettings.templates["collection"];
    if (activeTemplate) {
      scopedTemplates[templateKey] = activeTemplate;
    }
  }

  const collectionTitle =
    (collectionMeta as any)?.customHeading ||
    CANONICAL_HANDLE_TITLES[hLower] ||
    collectionMeta?.title ||
    handle
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  // Generate ItemList schema (capped at 20 items per Google Rich Results guidelines)
  const schemaProducts = matchingProducts.slice(0, 20);
  const itemListSchema =
    schemaProducts.length > 0
      ? getItemListSchema(
          collectionTitle,
          schemaProducts.map((p) => ({
            name: p.name,
            handle: p.handle,
            price: p.price,
            image: p.image,
          }))
        )
      : null;

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Collections", item: "/collections" },
    { name: collectionTitle, item: `/collections/${handle}` },
  ]);

  return (
    <>
      {/* Complete ItemList and Breadcrumb structured data in raw server HTML */}
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Crawlable Semantic Product Catalog for Search Engine Bots (Googlebot, Bingbot) */}
      {matchingProducts.length > 0 && (
        <section
          aria-label={`${collectionTitle} Complete Catalog`}
          className="sr-only"
        >
          <h2>All {collectionTitle} at Vape Shop Dubai</h2>
          <nav aria-label={`${collectionTitle} Products`}>
            <ul>
              {matchingProducts.map((p, idx) => (
                <li key={p.id || p.handle || idx}>
                  <a href={`/products/${p.handle}`}>
                    <span>{p.name}</span>
                    <span> - AED {p.price}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </section>
      )}

      {/* Client Interactive Section with Suspense Boundary and Scoped Templates */}
      <PageTemplatesProvider templates={scopedTemplates}>
        <Suspense fallback={null}>
          <ClientCollectionPage
            handle={handle}
            initialMeta={collectionMeta}
            initialProducts={leanMatchingProducts}
            initialSubFilter={subFilter}
          />
        </Suspense>
      </PageTemplatesProvider>
    </>
  );
}

