/**
 * Shopify side of per-collection section layouts.
 *
 * Everything here talks to the Admin API: reading a collection's
 * `custom.page_sections` metafield, writing it back, and listing which
 * collections have one. The storefront reads the same metafield through the
 * public collection route — this module is for the admin editor, which needs
 * the collection's id to write and needs the read to be uncached.
 */

import {
  COLLECTION_SECTIONS_KEY,
  COLLECTION_SECTIONS_NAMESPACE,
  parseCollectionSections,
  type CollectionSectionsConfig,
} from "@/lib/theme/collection-sections";

const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const ADMIN_API_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;
const API_VERSION = "2024-10";

export class ShopifyConfigError extends Error {}
export class ShopifyRequestError extends Error {}

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

async function adminQuery<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  if (!SHOPIFY_STORE || !ADMIN_API_TOKEN) {
    throw new ShopifyConfigError(
      "Shopify is not connected. Set SHOPIFY_STORE and SHOPIFY_ADMIN_API_TOKEN."
    );
  }

  const res = await fetch(
    `https://${SHOPIFY_STORE}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ADMIN_API_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new ShopifyRequestError(
      `Shopify returned ${res.status} ${res.statusText}.`
    );
  }

  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    throw new ShopifyRequestError(json.errors.map((e) => e.message).join("; "));
  }
  if (!json.data) {
    throw new ShopifyRequestError("Shopify returned an empty response.");
  }
  return json.data;
}

/** Turn the first user error into a message, or null when the write went through. */
function firstUserError(
  errors: { field?: string[] | null; message: string }[] | undefined
): string | null {
  const error = errors?.[0];
  if (!error) return null;
  const field = error.field?.filter((part) => part !== "metafields")?.join(".");
  return field ? `${field}: ${error.message}` : error.message;
}

/* ── Read ─────────────────────────────────────────────────────────── */

export interface CollectionSectionsRecord {
  id: string;
  handle: string;
  title: string;
  /** Null when the collection has never been customised. */
  config: CollectionSectionsConfig | null;
  updatedAt: string | null;
}

const readQuery = /* GraphQL */ `
  query CollectionSections($handle: String!, $namespace: String!, $key: String!) {
    collectionByHandle(handle: $handle) {
      id
      handle
      title
      metafield(namespace: $namespace, key: $key) {
        value
        updatedAt
      }
    }
  }
`;

/** The collection and its saved layout, or null when the handle doesn't exist. */
export async function fetchCollectionSections(
  handle: string
): Promise<CollectionSectionsRecord | null> {
  const data = await adminQuery<{
    collectionByHandle: {
      id: string;
      handle: string;
      title: string;
      metafield: { value: string; updatedAt: string } | null;
    } | null;
  }>(readQuery, {
    handle,
    namespace: COLLECTION_SECTIONS_NAMESPACE,
    key: COLLECTION_SECTIONS_KEY,
  });

  const collection = data.collectionByHandle;
  if (!collection) return null;

  return {
    id: collection.id,
    handle: collection.handle,
    title: collection.title || collection.handle,
    config: parseCollectionSections(collection.metafield?.value),
    updatedAt: collection.metafield?.updatedAt ?? null,
  };
}

/* ── Write ────────────────────────────────────────────────────────── */

const saveMutation = /* GraphQL */ `
  mutation SaveCollectionSections($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        updatedAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/** Write the layout onto the collection. Returns when Shopify has accepted it. */
export async function saveCollectionSections(
  collectionId: string,
  value: string
): Promise<string | null> {
  const data = await adminQuery<{
    metafieldsSet: {
      metafields: { updatedAt: string }[] | null;
      userErrors: { field?: string[] | null; message: string }[];
    };
  }>(saveMutation, {
    metafields: [
      {
        ownerId: collectionId,
        namespace: COLLECTION_SECTIONS_NAMESPACE,
        key: COLLECTION_SECTIONS_KEY,
        type: "json",
        value,
      },
    ],
  });

  const error = firstUserError(data.metafieldsSet.userErrors);
  if (error) throw new ShopifyRequestError(error);

  return data.metafieldsSet.metafields?.[0]?.updatedAt ?? null;
}

const deleteMutation = /* GraphQL */ `
  mutation DeleteCollectionSections($metafields: [MetafieldIdentifierInput!]!) {
    metafieldsDelete(metafields: $metafields) {
      deletedMetafields {
        key
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/** Remove the layout, putting the collection back on the theme template. */
export async function deleteCollectionSections(collectionId: string): Promise<void> {
  const data = await adminQuery<{
    metafieldsDelete: {
      userErrors: { field?: string[] | null; message: string }[];
    };
  }>(deleteMutation, {
    metafields: [
      {
        ownerId: collectionId,
        namespace: COLLECTION_SECTIONS_NAMESPACE,
        key: COLLECTION_SECTIONS_KEY,
      },
    ],
  });

  const error = firstUserError(data.metafieldsDelete.userErrors);
  if (error) throw new ShopifyRequestError(error);
}

/* ── Metafield definition ─────────────────────────────────────────── */

const definitionQuery = /* GraphQL */ `
  query CollectionSectionsDefinition($namespace: String!, $key: String!) {
    metafieldDefinitions(
      first: 1
      namespace: $namespace
      key: $key
      ownerType: COLLECTION
    ) {
      nodes {
        id
        access {
          storefront
        }
      }
    }
  }
`;

const defineMutation = /* GraphQL */ `
  mutation DefineCollectionSections($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) {
      createdDefinition {
        id
      }
      userErrors {
        code
        message
      }
    }
  }
`;

const redefineMutation = /* GraphQL */ `
  mutation OpenCollectionSectionsToStorefront(
    $definition: MetafieldDefinitionUpdateInput!
  ) {
    metafieldDefinitionUpdate(definition: $definition) {
      updatedDefinition {
        id
      }
      userErrors {
        code
        message
      }
    }
  }
`;

const DEFINITION_NAME = "Page sections";
const DEFINITION_DESCRIPTION =
  "Section layout for this collection page, managed from the theme customizer.";

/** Checked once per server process, not once per save. */
let definitionReady: Promise<string | null> | null = null;

async function checkDefinition(): Promise<string | null> {
  const existing = await adminQuery<{
    metafieldDefinitions: {
      nodes: { id: string; access: { storefront: string | null } | null }[];
    };
  }>(definitionQuery, {
    namespace: COLLECTION_SECTIONS_NAMESPACE,
    key: COLLECTION_SECTIONS_KEY,
  });

  const definition = existing.metafieldDefinitions.nodes[0];

  if (!definition) {
    const created = await adminQuery<{
      metafieldDefinitionCreate: {
        userErrors: { code?: string | null; message: string }[];
      };
    }>(defineMutation, {
      definition: {
        name: DEFINITION_NAME,
        description: DEFINITION_DESCRIPTION,
        namespace: COLLECTION_SECTIONS_NAMESPACE,
        key: COLLECTION_SECTIONS_KEY,
        type: "json",
        ownerType: "COLLECTION",
        access: { storefront: "PUBLIC_READ" },
      },
    });

    const error = created.metafieldDefinitionCreate.userErrors[0];
    // TAKEN means another request won the race — the definition exists either way.
    if (error && error.code !== "TAKEN") return error.message;
    return null;
  }

  if (definition.access?.storefront === "PUBLIC_READ") return null;

  // A definition someone created by hand, without storefront access. The
  // storefront would read it as null, so open it up.
  const updated = await adminQuery<{
    metafieldDefinitionUpdate: {
      userErrors: { code?: string | null; message: string }[];
    };
  }>(redefineMutation, {
    definition: {
      namespace: COLLECTION_SECTIONS_NAMESPACE,
      key: COLLECTION_SECTIONS_KEY,
      ownerType: "COLLECTION",
      access: { storefront: "PUBLIC_READ" },
    },
  });

  return updated.metafieldDefinitionUpdate.userErrors[0]?.message ?? null;
}

/**
 * Make sure Shopify knows about the metafield before anything is written to it.
 *
 * Two things follow from the definition existing: the layout appears as a named
 * field on the collection in Shopify admin rather than hidden unstructured
 * data, and the Storefront API is allowed to return it.
 *
 * Resolves to null when everything is in order, or to a sentence explaining
 * what to fix — a token without `write_metafield_definitions` is the usual
 * cause. Never throws: the save itself still works, and this storefront reads
 * collections through the Admin API anyway, so a failure here is a warning
 * rather than a blocked save.
 */
export async function ensureCollectionSectionsDefinition(): Promise<string | null> {
  definitionReady ??= checkDefinition().catch((err: unknown) => {
    // Let the next save try again rather than caching a transient outage.
    definitionReady = null;
    return err instanceof Error ? err.message : String(err);
  });

  const problem = await definitionReady;
  if (problem) {
    console.warn("[collections] metafield definition not ready:", problem);
    return `Saved, but Shopify would not set up the “${COLLECTION_SECTIONS_NAMESPACE}.${COLLECTION_SECTIONS_KEY}” metafield definition (${problem}). Add it in Shopify under Settings → Custom data → Collections, as a JSON field with Storefront API access.`;
  }
  return null;
}

/* ── Listing ──────────────────────────────────────────────────────── */

export interface CollectionSummary {
  handle: string;
  title: string;
  productsCount: number | null;
  /** True when this collection carries its own layout. */
  customized: boolean;
  updatedAt: string | null;
}

const listQuery = /* GraphQL */ `
  query ListCollectionSections(
    $cursor: String
    $namespace: String!
    $key: String!
  ) {
    collections(first: 250, after: $cursor, sortKey: TITLE) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        handle
        title
        productsCount {
          count
        }
        metafield(namespace: $namespace, key: $key) {
          updatedAt
        }
      }
    }
  }
`;

/**
 * Every collection in the store, flagged with whether it has been customised.
 *
 * Paged to the end: a store with more than 250 collections should still show
 * all of them in the picker.
 */
export async function listCollectionSections(): Promise<CollectionSummary[]> {
  const summaries: CollectionSummary[] = [];
  let cursor: string | null = null;

  // A hard page ceiling, so a cursor Shopify never advances can't spin forever.
  for (let page = 0; page < 20; page += 1) {
    const data: {
      collections: {
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
        nodes: {
          handle: string;
          title: string;
          productsCount: { count: number } | null;
          metafield: { updatedAt: string } | null;
        }[];
      };
    } = await adminQuery(listQuery, {
      cursor,
      namespace: COLLECTION_SECTIONS_NAMESPACE,
      key: COLLECTION_SECTIONS_KEY,
    });

    for (const node of data.collections.nodes) {
      if (!node.handle) continue;
      summaries.push({
        handle: node.handle,
        title: node.title || node.handle,
        productsCount: node.productsCount?.count ?? null,
        customized: Boolean(node.metafield),
        updatedAt: node.metafield?.updatedAt ?? null,
      });
    }

    if (!data.collections.pageInfo.hasNextPage) break;
    cursor = data.collections.pageInfo.endCursor;
    if (!cursor) break;
  }

  return summaries;
}
