import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { THEME_CACHE_TAG } from "@/lib/theme/get-settings";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidatePath("/", "layout");
  revalidateTag(THEME_CACHE_TAG, "max");
  return NextResponse.json({ success: true, message: "Cache busted!" });
}
