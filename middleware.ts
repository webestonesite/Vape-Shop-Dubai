import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import staticData from "./data/redirects.json";

export const runtime = "nodejs";

let cachedRedirects: Array<{ source: string; destination: string }> | null = null;
let lastMtime = 0;

function getRedirectsList(): Array<{ source: string; destination: string }> {
  try {
    const filePath = path.join(process.cwd(), "data", "redirects.json");
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const mtime = stats.mtimeMs;
      if (cachedRedirects && mtime === lastMtime) {
        return cachedRedirects;
      }
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.redirects)) {
        const redirectsArr: Array<{ source: string; destination: string }> = parsed.redirects;
        cachedRedirects = redirectsArr;
        lastMtime = mtime;
        return cachedRedirects;
      }
    }
  } catch (error) {
    console.error("Failed to read redirects.json in middleware:", error);
  }
  const fallback = (staticData as { redirects: Array<{ source: string; destination: string }> })?.redirects;
  return Array.isArray(fallback) ? fallback : [];
}

function normalizePath(pathStr: string): string {
  if (!pathStr) return "";
  let p = pathStr.trim().toLowerCase();
  if (p.length > 1 && p.endsWith("/")) {
    p = p.slice(0, -1);
  }
  return p;
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  
  // Skip API routes, static files, and admin routes for redirects
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/admin") ||
    url.pathname === "/favicon.ico" ||
    /\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|woff2?|map)$/i.test(url.pathname)
  ) {
    return NextResponse.next();
  }

  const redirects = getRedirectsList();
  if (redirects.length === 0) {
    return NextResponse.next();
  }

  const currentPath = normalizePath(url.pathname);
  const match = redirects.find((r) => normalizePath(r.source) === currentPath);

  if (match && match.destination) {
    const destNormalized = normalizePath(match.destination);
    // Prevent infinite redirect loop if source and destination are identical
    if (destNormalized !== currentPath) {
      let destUrl: URL;
      if (match.destination.startsWith("http://") || match.destination.startsWith("https://")) {
        destUrl = new URL(match.destination);
      } else {
        const destPath = match.destination.startsWith("/") ? match.destination : "/" + match.destination;
        destUrl = new URL(destPath + url.search, request.url);
      }
      return NextResponse.redirect(destUrl, 301);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

