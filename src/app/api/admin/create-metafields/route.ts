import { NextRequest, NextResponse } from "next/server";

const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const ADMIN_API_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;

const CREATE_METAFIELD_MUTATION = `
mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
  metafieldDefinitionCreate(definition: $definition) {
    createdDefinition {
      id
      name
      namespace
      key
      type {
        name
      }
    }
    userErrors {
      field
      message
      code
    }
  }
}
`;

export async function GET(request: NextRequest) {
  return createVideoMetafields();
}

export async function POST(request: NextRequest) {
  return createVideoMetafields();
}

async function createVideoMetafields() {
  if (!SHOPIFY_STORE || !ADMIN_API_TOKEN) {
    return NextResponse.json(
      { error: "SHOPIFY_STORE or SHOPIFY_ADMIN_API_TOKEN missing in environment variables" },
      { status: 500 }
    );
  }

  const endpoint = `https://${SHOPIFY_STORE}/admin/api/2024-10/graphql.json`;

  const definitions = [
    {
      name: "Product Video URL",
      namespace: "custom",
      key: "video_url",
      description: "YouTube or MP4 video link for product demonstration and reviews",
      type: "url",
      ownerType: "PRODUCT",
    },
    {
      name: "YouTube Video URL",
      namespace: "custom",
      key: "youtube_video_url",
      description: "YouTube video link for product page showcase",
      type: "url",
      ownerType: "PRODUCT",
    },
  ];

  const results = [];

  for (const def of definitions) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": ADMIN_API_TOKEN,
        },
        body: JSON.stringify({
          query: CREATE_METAFIELD_MUTATION,
          variables: { definition: def },
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        results.push({ key: def.key, success: false, error: text });
        continue;
      }

      const json = await response.json();
      const userErrors = json?.data?.metafieldDefinitionCreate?.userErrors || [];
      const created = json?.data?.metafieldDefinitionCreate?.createdDefinition;

      if (userErrors.length > 0) {
        // If it already exists, report as already existing / success
        const alreadyExists = userErrors.some((e: any) => e.code === "TAKEN" || e.message?.includes("already exists") || e.message?.includes("taken"));
        results.push({
          key: def.key,
          success: true,
          status: alreadyExists ? "ALREADY_EXISTS" : "USER_ERROR",
          errors: userErrors,
          definition: created,
        });
      } else {
        results.push({
          key: def.key,
          success: true,
          status: "CREATED",
          definition: created,
        });
      }
    } catch (err: any) {
      results.push({ key: def.key, success: false, error: err.message });
    }
  }

  return NextResponse.json({
    message: "Shopify Metafields Setup Triggered",
    results,
  });
}
