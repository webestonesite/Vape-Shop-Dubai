import { Product } from "@/components/sections/ProductFeed";
import { getDeterministicReviews } from "./smart-specs";

const SHOPIFY_STORE = process.env.SHOPIFY_STORE!;
const ADMIN_API_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.SHOPIFY_API_KEY;

const storefrontQuery = `
query {
  products(first: 250) {
    edges {
      node {
        id
        title
        handle
        productType
        vendor
        tags
        collections(first: 50) {
          edges {
            node {
              id
              title
              handle
            }
          }
        }
        images(first: 5) {
          edges {
            node {
              url
            }
          }
        }
        variants(first: 10) {
          edges {
            node {
              id
              title
              price {
                amount
              }
              compareAtPrice {
                amount
              }
              availableForSale
            }
          }
        }
      }
    }
  }
}
`;

const adminQuery = `
query {
  products(first: 250) {
    edges {
      node {
        id
        title
        handle
        productType
        vendor
        tags
        status
        collections(first: 50) {
          edges {
            node {
              id
              title
              handle
            }
          }
        }
        images(first: 5) {
          edges {
            node {
              url
            }
          }
        }
        variants(first: 10) {
          edges {
            node {
              id
              title
              price
              compareAtPrice
              availableForSale
            }
          }
        }
      }
    }
  }
}
`;

async function fetchShopifyProducts() {
  if (!SHOPIFY_STORE) {
    throw new Error("SHOPIFY_STORE is not configured");
  }

  // Try Storefront API first
  if (STOREFRONT_TOKEN) {
    try {
      const url = `https://${SHOPIFY_STORE}/api/2024-10/graphql.json`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: storefrontQuery }),
        next: { revalidate: 3600 },
      });

      if (response.ok) {
        const json = await response.json();
        if (json.data?.products?.edges) {
          return json.data.products.edges.map((edge: any) => edge.node);
        }
      }
    } catch (err) {
      console.warn("Storefront API fetch failed, trying Admin API:", err);
    }
  }

  // Fallback to Admin API
  if (ADMIN_API_TOKEN) {
    const url = `https://${SHOPIFY_STORE}/admin/api/2024-10/graphql.json`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": ADMIN_API_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: adminQuery }),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`);
    }

    const json = await response.json();
    if (json.errors) {
      throw new Error(`Shopify GraphQL errors: ${JSON.stringify(json.errors)}`);
    }

    return json.data.products.edges.map((edge: any) => edge.node);
  }

  throw new Error("No valid Shopify credentials found");
}

function detectBrand(title: string, vendor: string): string {
  const titleLower = title.toLowerCase();
  
  const brands = [
    { name: "Al Fakher", keywords: ["al fakher", "alfakher", "crown bar"] },
    { name: "JUUL", keywords: ["juul"] },
    { name: "BECO", keywords: ["beco"] },
    { name: "MYLE", keywords: ["myle"] },
    { name: "Pod Salt", keywords: ["pod salt", "podsalt"] },
    { name: "Vaporesso", keywords: ["vaporesso"] },
    { name: "Tugboat", keywords: ["tugboat"] },
    { name: "Yuoto", keywords: ["yuoto"] },
    { name: "Nasty", keywords: ["nasty"] },
    { name: "Waka", keywords: ["waka"] },
    { name: "Elf Bar", keywords: ["elf bar", "elfbar"] },
    { name: "Lost Mary", keywords: ["lost mary"] },
    { name: "ISGO", keywords: ["isgo"] },
    { name: "Terea", keywords: ["terea"] },
    { name: "Heets", keywords: ["heets"] },
    { name: "Dr Vapes", keywords: ["dr vapes", "dr. vapes", "dr.vapes"] },
    { name: "Vozol", keywords: ["vozol"] },
    { name: "Oxva", keywords: ["oxva"] },
    { name: "Geekvape", keywords: ["geekvape", "geek vape"] },
    { name: "Voopoo", keywords: ["voopoo"] },
    { name: "Uwell", keywords: ["uwell"] },
    { name: "Smok", keywords: ["smok"] },
    { name: "Tokyo", keywords: ["tokyo"] },
    { name: "Ruthless", keywords: ["ruthless"] },
    { name: "Vapetasia", keywords: ["vapetasia"] },
    { name: "Grand Vapes", keywords: ["grand vapes", "grand e-liquids"] },
  ];

  for (const b of brands) {
    if (b.keywords.some(kw => titleLower.includes(kw))) {
      return b.name;
    }
  }

  if (vendor && vendor.toLowerCase() !== "vapshop" && vendor.toLowerCase() !== "vape shop") {
    return vendor;
  }

  const firstWord = title.trim().split(/\s+/)[0];
  if (firstWord && firstWord.length > 2) {
    const cleaned = firstWord.replace(/[^a-zA-Z0-9]/g, "");
    if (cleaned) return cleaned;
  }

  return "Vape Shop";
}

function cleanProductTitle(title: string): string {
  let cleaned = title;
  if (cleaned.startsWith("Buy ") || cleaned.startsWith("buy ")) {
    cleaned = cleaned.substring(4);
  }
  cleaned = cleaned.replace(/Get\s+(.+?)\s+Free/gi, "+ $1 Bundle");
  cleaned = cleaned.replace(/Get\s+(.+?)\s+FREE/gi, "+ $1 Bundle");
  cleaned = cleaned.replace(/\s+Free\s*/gi, " ");
  return cleaned.trim();
}

export async function getAllProducts(): Promise<Product[]> {
  const rawProducts = await fetchShopifyProducts();

  return rawProducts.map((node: any): Product => {
    const firstVariant = node.variants?.edges?.[0]?.node;
    
    const priceVal = typeof firstVariant?.price === 'object' ? firstVariant?.price?.amount : firstVariant?.price;
    const price = parseFloat(priceVal || "0");

    const comparePriceVal = typeof firstVariant?.compareAtPrice === 'object' ? firstVariant?.compareAtPrice?.amount : firstVariant?.compareAtPrice;
    const comparePrice = comparePriceVal ? parseFloat(comparePriceVal) : 0;
    
    const isSoldOut = !node.variants?.edges?.some((v: any) => v.node?.availableForSale);

    const typeLower = (node.productType || "").toLowerCase();
    const titleLower = (node.title || "").toLowerCase();
    const tagsLower = (node.tags || []).map((t: string) => t.toLowerCase());

    let category = "accessories";
    if (typeLower.includes("juul") || tagsLower.includes("juul") || titleLower.includes("juul")) {
      category = "juul";
    } else if (typeLower.includes("disposable") || tagsLower.includes("disposable") || titleLower.includes("disposable")) {
      category = "disposables";
    } else if (typeLower.includes("e-juice") || typeLower.includes("e-liquid") || tagsLower.includes("e-juice") || tagsLower.includes("saltnic") || titleLower.includes("salt") || titleLower.includes("liquid")) {
      category = "e-liquids";
    } else if (typeLower.includes("kit") || typeLower.includes("pod system") || tagsLower.includes("pod system") || titleLower.includes("kit") || titleLower.includes("device")) {
      category = "accessories";
    }

    let section = "Pod Systems";
    if (category === "juul") {
      section = titleLower.includes("juul 2") || titleLower.includes("juul2") ? "JUUL 2 Series" : "JUUL 1 Series";
    } else if (category === "disposables") {
      section = "Disposables";
    } else if (category === "e-liquids") {
      section = "E-Liquids";
    }

    if (comparePrice > price) {
      section = "Flash Sale";
    }

    const allImages = node.images?.edges?.map((img: any) => img.node?.url).filter(Boolean) || [];
    const image = allImages[0] || "";
    const hoverImage = allImages.length > 1 ? allImages[1] : undefined;

    const isPopular = node.tags?.includes("Popular") || node.tags?.includes("popular");
    const detReviews = getDeterministicReviews(node.handle || node.id, isPopular);

    return {
      id: node.id,
      name: cleanProductTitle(node.title),
      handle: node.handle,
      variantId: firstVariant?.id || "",
      category,
      price,
      originalPrice: comparePrice > price ? comparePrice : undefined,
      rating: node.rating?.value ? parseFloat(node.rating.value) : detReviews.rating,
      reviews: node.reviews?.value ? parseInt(node.reviews.value) : detReviews.reviews,
      image,
      hoverImage,
      images: allImages,
      tag: node.badge?.value || (isSoldOut ? "Sold Out" : comparePrice > price ? "Sale" : undefined),
      tagColor: comparePrice > price ? "sale" : undefined,
      isPopular,
      isSoldOut,
      puffs: node.puffs?.value || undefined,
      nicotine: node.nicotine?.value || undefined,
      battery: node.battery?.value || undefined,
      section,
      brand: detectBrand(node.title, node.vendor),
      collections: node.collections?.edges?.map((c: any) => c.node?.handle).filter(Boolean) || [],
      tags: Array.isArray(node.tags) ? node.tags : [],
    };
  });
}
