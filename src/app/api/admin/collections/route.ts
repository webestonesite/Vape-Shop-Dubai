import { NextResponse } from "next/server";

import { listCollectionSections } from "@/lib/shopify/collection-sections";

const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const ADMIN_API_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;
const STOREFRONT_TOKEN =
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.SHOPIFY_API_KEY;

/**
 * Lists the store's collections so the customizer can offer a real picker
 * instead of asking merchants to type handles from memory.
 *
 * Storefront API first, Admin API as a fallback — the same order the
 * storefront's own collection route uses.
 */

const listQuery = `
query {
  collections(first: 250) {
    edges {
      node {
        handle
        title
      }
    }
  }
}
`;

interface CollectionOption {
  handle: string;
  title: string;
}

function parse(json: unknown): CollectionOption[] {
  const edges =
    (json as { data?: { collections?: { edges?: { node?: CollectionOption }[] } } })
      ?.data?.collections?.edges ?? [];

  return edges
    .map((edge) => edge?.node)
    .filter((node): node is CollectionOption => Boolean(node?.handle))
    .map((node) => ({ handle: node.handle, title: node.title || node.handle }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function GET(request: Request) {
  if (!SHOPIFY_STORE) {
    return NextResponse.json({ collections: [] });
  }

  // `?sections=1` adds each collection's product count and whether it carries
  // its own section layout — what the collections screen lists. It needs the
  // Admin API (metafields aren't reliably visible to the Storefront token), so
  // a failure here falls through to the plain list below rather than 500ing.
  if (new URL(request.url).searchParams.has("sections") && ADMIN_API_TOKEN) {
    try {
      return NextResponse.json({ collections: await listCollectionSections() });
    } catch (err) {
      console.error("[admin] could not list collection layouts:", err);
    }
  }

  try {
    if (STOREFRONT_TOKEN) {
      const res = await fetch(
        `https://${SHOPIFY_STORE}/api/2024-10/graphql.json`,
        {
          method: "POST",
          headers: {
            "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: listQuery }),
          next: { revalidate: 300 },
        }
      );
      if (res.ok) {
        const collections = parse(await res.json());
        if (collections.length > 0) return NextResponse.json({ collections });
      }
    }

    if (ADMIN_API_TOKEN) {
      const res = await fetch(
        `https://${SHOPIFY_STORE}/admin/api/2024-10/graphql.json`,
        {
          method: "POST",
          headers: {
            "X-Shopify-Access-Token": ADMIN_API_TOKEN,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: listQuery }),
          next: { revalidate: 300 },
        }
      );
      if (res.ok) {
        return NextResponse.json({ collections: parse(await res.json()) });
      }
    }

    return NextResponse.json({ collections: [] });
  } catch (err) {
    // The picker falls back to a free-text handle field, so an outage here is
    // an inconvenience rather than a blocker.
    console.error("[admin] could not list collections:", err);
    return NextResponse.json({ collections: [] });
  }
}
