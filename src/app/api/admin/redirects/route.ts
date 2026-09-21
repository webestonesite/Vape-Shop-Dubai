import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";
import { getRedirects, saveRedirects, Redirect } from "@/lib/redirects/store";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await findUserById(session.sub);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const redirects = await getRedirects();
  return NextResponse.json({ redirects });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await findUserById(session.sub);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { redirects } = await req.json();
    if (!Array.isArray(redirects)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    // Validate that all redirects have id, source, and destination
    const validRedirects: Redirect[] = redirects.map((r: any) => ({
      id: r.id || crypto.randomUUID(),
      source: (r.source || "").trim(),
      destination: (r.destination || "").trim(),
    })).filter(r => r.source && r.destination);

    await saveRedirects(validRedirects);
    return NextResponse.json({ success: true, redirects: validRedirects });
  } catch (error) {
    console.error("Failed to save redirects:", error);
    return NextResponse.json({ error: "Failed to save redirects" }, { status: 500 });
  }
}
