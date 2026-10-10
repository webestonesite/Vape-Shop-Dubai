import { unstable_cache } from "next/cache";

import { readPublishedRecord } from "./store";
import type { ThemeSettings } from "./types";

/** Cache tag invalidated whenever the merchant publishes. */
export const THEME_CACHE_TAG = "theme-settings";

/**
 * Published settings for the storefront.
 *
 * Wrapped in the data cache so reading settings doesn't force every page to
 * render dynamically — pages stay statically optimised and are refreshed by
 * `revalidateTag(THEME_CACHE_TAG)` when the admin hits Publish.
 */
const getCachedPublishedSettings = unstable_cache(
  async () => {
    const record = await readPublishedRecord();
    return record.settings;
  },
  ["published-theme-settings"],
  { tags: [THEME_CACHE_TAG] }
);

export async function getThemeSettings(): Promise<ThemeSettings> {
  return getCachedPublishedSettings();
}

