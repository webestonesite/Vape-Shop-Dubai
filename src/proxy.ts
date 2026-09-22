import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { adminAuth } from "@/lib/firebase/admin";
import fs from "fs/promises";
import path from "path";

/** Reachable while signed out — everything else under /admin requires a session. */
const PUBLIC_PATHS = new Set([
  "/admin/login",
  "/api/admin/login",
  "/api/admin/logout",
]);

let cachedRedirects: Array<{ source: string; destination: string }> | null = null;
let lastMtime = 0;

async function getRedirectsList(): Promise<Array<{ source: string; destination: string }>> {
  try {
    const filePath = path.join(process.cwd(), "data", "redirects.json");
    const stats = await fs.stat(filePath);
    const mtime = stats.mtimeMs;
    if (cachedRedirects && mtime === lastMtime) {
      return cachedRedirects;
    }
    const content = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed.redirects)) {
      cachedRedirects = parsed.redirects;
      lastMtime = mtime;
      return parsed.redirects;
    }
  } catch (error) {
    console.error("Failed to read redirects.json in proxy:", error);
  }
  return [];
}

function normalizePath(pathStr: string): string {
  if (!pathStr) return "";
  let p = pathStr.trim().toLowerCase();
  if (p.length > 1 && p.endsWith("/")) {
    p = p.slice(0, -1);
  }
  return p;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // --- Redirects Logic ---
  // Skip API routes, static files, and admin routes for redirects
  if (
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/admin") &&
    pathname !== "/favicon.ico" &&
    !/\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|woff2?|map)$/i.test(pathname)
  ) {
    const redirects = await getRedirectsList();
    if (redirects.length > 0) {
      const currentPath = normalizePath(pathname);
      const match = redirects.find((r) => normalizePath(r.source) === currentPath);
      if (match && match.destination) {
        const destNormalized = normalizePath(match.destination);
        if (destNormalized !== currentPath) {
          let destUrl: URL;
          if (match.destination.startsWith("http://") || match.destination.startsWith("https://")) {
            destUrl = new URL(match.destination);
          } else {
            const destPath = match.destination.startsWith("/") ? match.destination : "/" + match.destination;
            destUrl = new URL(destPath + search, request.url);
          }
          return NextResponse.redirect(destUrl, 301);
        }
      }
    }
  }

  // --- Admin Auth Logic ---
  // Only process auth for /admin and /api/admin
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  let session = null;
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
    if (sessionCookie) {
      session = await adminAuth.verifySessionCookie(sessionCookie, true);
    }
  } catch (err) {
    console.error("[admin] session verification unavailable:", err);
  }

  if (PUBLIC_PATHS.has(pathname)) {
    // Don't show the login form to someone who is already signed in.
    if (pathname === "/admin/login" && session) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (session) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Not signed in." },
      { status: 401 }
    );
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
