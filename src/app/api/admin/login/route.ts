import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth/session";
import rateLimit from "@/lib/rate-limit";

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500,
});

export async function POST(request: Request) {
  // Strict rate limit for admin login (5 attempts per minute)
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  try {
    await limiter.check(5, ip);
  } catch {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 }
    );
  }

  let body: { idToken?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const idToken = body.idToken;

  if (!idToken) {
    return NextResponse.json(
      { error: "Firebase ID token is required." },
      { status: 400 }
    );
  }

  try {
    // We let the session cookie function handle verification
    await setSessionCookie(idToken);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin] login failed:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Sign-in failed." },
      { status: 401 }
    );
  }
}
