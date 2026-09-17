/**
 * Theme settings — Shopify's model, adapted to this headless storefront.
 *
 *   header / footer   shared "section groups" rendered on every page
 *   templates         one entry per page type, each an ordered list of
 *                     section *instances* with their own content
 *
 * A section instance is a placement: the FAQ on the homepage and the FAQ on a
 * collection page are two instances of the `faq` type with independent copy.
 * That's what lets the same section say different things in different places.
 *
 * Template keys
 * -------------
 *   index                          the homepage
 *   collection                     default for every /collections/[handle]
 *   collection:juul-1-series       exact-handle override
 *   collection:contains--juul      URL-rule override, covers a whole family
 *   product                        default for every /product/[handle]
 *   product:<rule>                 same rules, for product pages
 *   page:about-us                  a static page
 *
 * Overrides carry a `match` rule (exact / prefix / suffix / contains /
 * wildcard). Resolution is "most specific rule wins" — see
 * `resolveTemplateKey()`.
 */

import { CONDITION_LABELS, CONDITIONS } from "./conditions";

export type TemplateType = "index" | "collection" | "product" | "page";

/** A single placement of a section within a template. */
export interface SectionInstance {
  id: string;
  /** Key into the section registry — see `sections.ts`. */
  type: string;
  enabled: boolean;
  /**
   * Named predicate from `conditions.ts` gating this instance — how the
   * storefront's original "JUUL sections only on JUUL pages" rules are
   * expressed as data.
   *
   * Only honoured on *default* templates. A per-handle override is an explicit
   * statement of intent, so every enabled instance in one renders
   * unconditionally.
   */
  showWhen?: string;
  /** Content for this placement only. Shape is defined by the section's schema. */
  settings: Record<string, unknown>;
}

/**
 * How a template decides which URLs it applies to.
 *
 *   exact     handle === value                       juul-1-series
 *   prefix    handle starts with value               juul-
 *   suffix    handle ends with value                 -vape
 *   contains  handle contains value                  juul
 *   wildcard  glob against the whole handle          juul-*-series
 *   condition a named predicate from conditions.ts   handleIsJuul1
 *
 * `condition` exists because the real families aren't substrings: "JUUL but
 * not JUUL 2", or "juices, liquids and nic salts but not freebase". Those
 * rules were already written once, as the predicates that gate individual
 * sections; a condition match points a whole template at one.
 *
 * This is what lets one template cover a family of collections, the way the
 * storefront's original hard-coded `handle.includes("juul")` rules did.
 */
export type TemplateMatchType =
  | "exact"
  | "prefix"
  | "suffix"
  | "contains"
  | "wildcard"
  | "condition";

export interface TemplateMatch {
  type: TemplateMatchType;
  /** Compared against the collection/product handle, case-insensitively. */
  value: string;
}

export interface Template {
  type: TemplateType;
  /** Shown in the customizer's template picker. */
  label: string;
  /**
   * URL rule. Present on every override; absent on the type defaults, which
   * are the fallback when nothing matches.
   */
  match?: TemplateMatch;
  /**
   * Legacy exact-handle field, kept so older saved settings and existing
   * template keys still read correctly. `match` is authoritative.
   */
  handle?: string;
  /**
   * Tiebreaker when two equally specific rules both match a handle - higher
   * wins. Only condition rules really need it: "contains juul" is measurably
   * narrower than "contains vape", but `handleIncludesMyle` and
   * `handleIncludesDisposable` are not comparable, and `myle-disposable`
   * matches both. Defaults to 0.
   */
  priority?: number;
  /** URL the customizer previews this template at. */
  previewPath: string;
  /** Instance ids, in render order. */
  order: string[];
  instances: Record<string, SectionInstance>;
}

/* ── Shared section groups ────────────────────────────────────────── */

export interface NavSubItem {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  children: NavSubItem[];
}

export interface HeaderSettings {
  announcementEnabled: boolean;
  announcementText: string;
  logoText: string;
  logoSubText: string;
  menu: NavItem[];
}

export interface FooterTrustItem {
  icon: string;
  title: string;
  subtitle: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

export interface FooterSettings {
  trustItems: FooterTrustItem[];
  description: string;
  whatsappLabel: string;
  whatsappNumber: string;
  ratingText: string;
  columns: FooterColumn[];
  contactHeading: string;
  addressLabel: string;
  address: string;
  phone: string;
  email: string;
  hoursNote: string;
  healthWarning: string;
  paymentBadges: { icon: string; label: string }[];
  copyright: string;
  poweredByLabel: string;
  poweredByHref: string;
  bottomLinks: FooterLink[];
}

/* ── Root ─────────────────────────────────────────────────────────── */

export interface ThemeSettings {
  version: number;
  header: HeaderSettings;
  footer: FooterSettings;
  templates: Record<string, Template>;
}

export interface ThemeSettingsRecord {
  settings: ThemeSettings;
  updatedAt: string;
  updatedBy: string | null;
}

/* ── Template matching ────────────────────────────────────────────── */

export const TEMPLATE_KEYS = {
  index: "index",
  collection: "collection",
  product: "product",
} as const;

export function pageKey(slug: string): string {
  return `page:${slug}`;
}

/**
 * More specific rules win when several match the same URL.
 *
 * Conditions rank below every handle pattern on purpose. They cover the broad
 * built-in families, so anything a merchant writes by hand - even a loose
 * "contains" - is the more deliberate statement and takes the page.
 */
const MATCH_SPECIFICITY: Record<TemplateMatchType, number> = {
  exact: 4,
  wildcard: 3,
  prefix: 2,
  suffix: 2,
  contains: 1,
  condition: 0,
};

const REGEX_META = new Set([
  ".", "+", "^", "$", "{", "}", "(", ")", "|", "[", "]", "\\",
]);

function wildcardToRegExp(pattern: string): RegExp {
  // Translated character by character: `*` and `?` become regex wildcards,
  // every other metacharacter is escaped so it matches literally. Done as a
  // loop rather than a chain of .replace() calls because the escaping there is
  // notoriously easy to get subtly wrong.
  let source = "";
  for (const char of pattern) {
    if (char === "*") source += ".*";
    else if (char === "?") source += ".";
    else if (REGEX_META.has(char)) source += `\\${char}`;
    else source += char;
  }
  return new RegExp(`^${source}$`);
}

/** Does this rule apply to `handle`? Matching is case-insensitive. */
export function matchesHandle(match: TemplateMatch, handle: string): boolean {
  const value = match.value.trim().toLowerCase();
  const target = handle.trim().toLowerCase();
  if (!value) return false;

  switch (match.type) {
    case "exact":
      return target === value;
    case "prefix":
      return target.startsWith(value);
    case "suffix":
      return target.endsWith(value);
    case "contains":
      return target.includes(value);
    case "wildcard":
      try {
        return wildcardToRegExp(value).test(target);
      } catch {
        // A pattern that won't compile shouldn't take the storefront down.
        return false;
      }
    case "condition": {
      // The value is a predicate name, so it keeps its original casing.
      const predicate = CONDITIONS[match.value.trim()];
      // An unknown predicate matches nothing, dropping the page to the default
      // template - the same outcome as deleting the rule.
      return predicate ? predicate({ handle: target }) : false;
    }
    default:
      return false;
  }
}

/** The rule a template matches by, falling back to its legacy handle. */
export function templateMatch(template: Template): TemplateMatch | undefined {
  if (template.match) return template.match;
  if (template.handle) return { type: "exact", value: template.handle };
  return undefined;
}

/**
 * Pick the template a page renders with.
 *
 * Every rule for this template type is tested against the handle; the most
 * specific match wins, then the longest pattern, then the key alphabetically
 * so the outcome never depends on object insertion order. With no match, the
 * type default applies.
 */
export function resolveTemplateKey(
  templates: Record<string, Template>,
  type: TemplateType,
  handle?: string
): string {
  if (!handle) return type;

  let bestKey: string = type;
  let bestScore = -1;
  let bestPriority = Number.NEGATIVE_INFINITY;
  let bestLength = -1;

  for (const [key, template] of Object.entries(templates)) {
    if (template.type !== type) continue;

    const match = templateMatch(template);
    if (!match || !matchesHandle(match, handle)) continue;

    const score = MATCH_SPECIFICITY[match.type] ?? 0;
    const priority = template.priority ?? 0;
    const length = match.value.length;

    // Rule kind first, then the explicit tiebreaker, then the longer (narrower)
    // pattern, then the key - so the outcome never depends on object order.
    const better =
      score !== bestScore
        ? score > bestScore
        : priority !== bestPriority
          ? priority > bestPriority
          : length !== bestLength
            ? length > bestLength
            : key < bestKey;

    if (better) {
      bestKey = key;
      bestScore = score;
      bestPriority = priority;
      bestLength = length;
    }
  }

  return bestKey;
}

/** Split `"collection:juul-1-series"` into its parts. */
export function parseTemplateKey(key: string): {
  type: TemplateType;
  handle?: string;
} {
  const [type, ...rest] = key.split(":");
  return {
    type: type as TemplateType,
    handle: rest.length ? rest.join(":") : undefined,
  };
}

/** Human-readable summary of a rule, for the admin UI. */
export function describeMatch(match: TemplateMatch): string {
  switch (match.type) {
    case "exact":
      return `handle is “${match.value}”`;
    case "prefix":
      return `handle starts with “${match.value}”`;
    case "suffix":
      return `handle ends with “${match.value}”`;
    case "contains":
      return `handle contains “${match.value}”`;
    case "wildcard":
      return `handle matches “${match.value}”`;
    case "condition":
      return CONDITION_LABELS[match.value] ?? match.value;
    default:
      return match.value;
  }
}

/** Stable, URL-safe key for a rule-based template. */
export function templateKeyForMatch(
  type: TemplateType,
  match: TemplateMatch
): string {
  const slug = match.value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  // Exact rules keep the plain `type:handle` form used before rules existed,
  // so existing overrides and their keys stay stable.
  return match.type === "exact"
    ? `${type}:${slug}`
    : `${type}:${match.type}--${slug}`;
}
