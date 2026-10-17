import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { THEME_CACHE_TAG } from "@/lib/theme/get-settings";
import { clearProductsCache } from "@/lib/shopify/products-fetch";
import { clearProductCache } from "@/lib/shopify/product";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Clear server-side in-memory cache
  clearProductsCache();
  clearProductCache();

  revalidatePath("/", "layout");
  revalidatePath("/", "page");
  revalidatePath("/collections/[handle]", "page");
  revalidatePath("/products/[handle]", "page");
  revalidateTag("products", "max");
  revalidateTag(THEME_CACHE_TAG, "max");
  return NextResponse.json({ success: true, message: "Cache busted!" });
}
