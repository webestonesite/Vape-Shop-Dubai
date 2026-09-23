import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/shopify/products-fetch";

export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json(products);
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
