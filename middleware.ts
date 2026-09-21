import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  
  // Skip API routes, static files, and admin routes for redirects
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/admin") ||
    url.pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  try {
    // Fetch active redirects from the public API
    // Using a short cache revalidation so we don't fetch on every single page load
    const redirectsRes = await fetch(`${url.origin}/api/redirects`, {
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    
    if (redirectsRes.ok) {
      const data = await redirectsRes.json();
      const redirects = data.redirects || [];
      
      const match = redirects.find((r: any) => r.source === url.pathname);
      if (match) {
        return NextResponse.redirect(new URL(match.destination, request.url), 301);
      }
    }
  } catch (error) {
    // If fetch fails, just continue normal routing so the site doesn't break
    console.error("Middleware redirects check failed:", error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
