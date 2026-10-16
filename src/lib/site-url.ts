/**
 * Canonical Site URL Resolver
 * Resolves the active production or custom domain dynamically.
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL or SITE_URL environment variable (when real custom domain is configured)
 * 2. VERCEL_PROJECT_PRODUCTION_URL (Vercel automatically sets this for the production domain)
 * 3. VERCEL_URL (Vercel deployment URL)
 * 4. Fallback to current domain
 */
export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (envUrl) {
    const trimmed = envUrl.trim().replace(/\/$/, "");
    return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim().replace(/\/$/, "")}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.trim().replace(/\/$/, "")}`;
  }
  return "https://vapeshopdubai.webestone.net";
}

/**
 * Request-aware Site URL Resolver (for Server Components, route handlers, robots, sitemap)
 * Automatically picks up the custom domain from incoming request headers.
 */
export function getRequestSiteUrl(hostHeader?: string | null, protoHeader?: string | null): string {
  if (hostHeader) {
    const host = hostHeader.trim().replace(/\/$/, "");
    const proto = protoHeader || (host.includes("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }
  return getSiteUrl();
}
