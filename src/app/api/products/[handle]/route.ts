import { NextRequest, NextResponse } from "next/server";
import { getProductByHandle } from "@/lib/shopify/product";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ handle: string }> }
) {
  const { handle } = await props.params;
  const product = await getProductByHandle(handle);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
