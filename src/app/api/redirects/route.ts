import { NextResponse } from "next/server";
import { getRedirects } from "@/lib/redirects/store";

export async function GET() {
  const redirects = await getRedirects();
  return NextResponse.json({ redirects });
}
