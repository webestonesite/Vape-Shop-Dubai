/**
 * Instant Product Caching & Prefetching Utility
 * Gives 0ms instant page loads when navigating products across the store.
 */

const productMemoryCache = new Map<string, any>();

export function getCachedProduct(handle: string): any | null {
  if (!handle) return null;
  const lower = handle.toLowerCase();
  if (productMemoryCache.has(lower)) {
    const mem = productMemoryCache.get(lower);
    if (mem && mem.cachedAt && Date.now() - mem.cachedAt < 30 * 1000) {
      return mem.data;
    }
  }
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem(`prod_cache_${lower}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.cachedAt && Date.now() - parsed.cachedAt < 30 * 1000) {
          productMemoryCache.set(lower, parsed);
          return parsed.data;
        }
      }
    } catch {
      // Ignore storage errors
    }
  }
  return null;
}

export function setCachedProduct(handle: string, data: any) {
  if (!handle || !data) return;
  const lower = handle.toLowerCase();
  const entry = { data, cachedAt: Date.now() };
  productMemoryCache.set(lower, entry);
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(`prod_cache_${lower}`, JSON.stringify(entry));
    } catch {
      // Ignore storage quota errors
    }
  }
}

export function prefetchProduct(handle: string) {
  if (typeof window === "undefined" || !handle) return;
  const lower = handle.toLowerCase();
  if (getCachedProduct(lower)) return;

  fetch(`/api/products/${lower}`)
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data && data.handle) {
        setCachedProduct(data.handle, data);
      }
    })
    .catch(() => {});
}
