import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { THEME_CACHE_TAG } from "@/lib/theme/get-settings";
import { clearProductsCache } from "@/lib/shopify/products-fetch";
import { clearProductCache } from "@/lib/shopify/product";

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || "vape_dubai_revalidate_secret_2026";

/**
 * Universal On-Demand ISR Revalidation Endpoint
 * 
 * Supports:
 * 1. Manual Admin triggers: GET /api/revalidate?secret=...&path=/collections/juul-vape-dubai
 * 2. Shopify Webhook triggers: POST /api/revalidate?secret=... with body containing product/collection handle
 * 3. Tag-based revalidation: GET /api/revalidate?secret=...&tag=theme
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const path = searchParams.get("path");
  const tag = searchParams.get("tag");

  // Validate secret
  if (secret !== REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid revalidation secret" }, { status: 401 });
  }

  try {
    const revalidated: string[] = [];

    // Clear server in-memory caches
    clearProductsCache();
    clearProductCache();

    if (tag) {
      revalidateTag(tag, "max");
      revalidated.push(`tag:${tag}`);
    }

    if (path) {
      revalidatePath(path, "page");
      revalidated.push(`path:${path}`);
    }

    // Default: If no path or tag given, revalidate core layout & homepage
    if (!path && !tag) {
      revalidatePath("/", "layout");
      revalidatePath("/", "page");
      revalidatePath("/collections/[handle]", "page");
      revalidatePath("/products/[handle]", "page");
      revalidateTag("products", "max");
      revalidateTag(THEME_CACHE_TAG, "max");
      revalidated.push("site:core-pages");
    }

    return NextResponse.json({
      revalidated: true,
      timestamp: new Date().toISOString(),
      targets: revalidated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  if (secret !== REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid revalidation secret" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const revalidated: string[] = [];

    clearProductsCache();
    if (body?.handle) {
      clearProductCache(body.handle);
      revalidatePath(`/products/${body.handle}`, "page");
      revalidateTag(`product-${body.handle}`, "max");
      revalidated.push(`/products/${body.handle}`);
    } else {
      clearProductCache();
    }

    revalidateTag("products", "max");

    // Always keep catalog lists and homepage fresh on catalog updates
    revalidatePath("/", "page");
    revalidatePath("/collections/all", "page");
    revalidatePath("/shop", "page");
    revalidated.push("/", "/collections/all", "/shop");

    return NextResponse.json({
      revalidated: true,
      timestamp: new Date().toISOString(),
      targets: revalidated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
