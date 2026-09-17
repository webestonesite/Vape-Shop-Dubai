import {
  backfillFamilyContent,
  COLLECTION_FAMILIES,
  deriveCollectionFamilyTemplates,
  deriveDefaultCollectionTemplate,
} from "./collection-families";
import { COLLECTION_BASE, createDefaultSettings, THEME_VERSION } from "./defaults";
import { SECTION_REGISTRY } from "./sections";
import type {
  SectionInstance,
  Template,
  TemplateMatch,
  ThemeSettings,
} from "./types";

/** Rule kinds the normaliser will accept from stored JSON. */
const MATCH_TYPES = new Set(["exact", "prefix", "suffix", "contains", "wildcard"]);

/**
 * Turns arbitrary stored JSON into a complete, renderable `ThemeSettings`.
 *
 * Two jobs:
 *   1. migrate older versions forward
 *   2. backfill anything missing from the current defaults
 *
 * Anything unrecognised is dropped rather than passed through — a stale
 * section type would otherwise reach the renderer and throw.
 */

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Fill keys absent from `override` using `base`.
 *
 * Arrays are taken verbatim — merging them element-wise would resurrect
 * repeater rows the merchant deliberately deleted.
 */
export function fillMissing<T>(base: T, override: unknown): T {
  if (!isPlainObject(base)) return override === undefined ? base : (override as T);
  if (!isPlainObject(override)) return base;

  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(base)) {
    const value = override[key];
    if (value === undefined) continue;

    const baseValue = (base as Record<string, unknown>)[key];
    if (Array.isArray(baseValue)) {
      out[key] = Array.isArray(value) ? value : baseValue;
    } else if (isPlainObject(baseValue)) {
      out[key] = fillMissing(baseValue, value);
    } else {
      out[key] = value;
    }
  }
  return out as T;
}

/* ── v1 → v2 migration ────────────────────────────────────────────── */

/** v1 section keys → v2 registry types. */
const V1_TYPE_MAP: Record<string, string> = {
  hero: "hero",
  categories: "categories",
  products: "productFeed",
  brands: "brands",
  whyShop: "whyShop",
  faq: "faq",
  whatsapp: "whatsapp",
  blog: "blogPosts",
};

/**
 * v1 stored a single global section per type plus one homepage order. Those
 * become instances on the `index` template; every other template starts from
 * defaults, since v1 had no concept of them.
 */
function migrateV1(stored: Record<string, unknown>): ThemeSettings {
  const next = createDefaultSettings();
  const v1Sections = isPlainObject(stored.sections) ? stored.sections : {};
  const v1Order = Array.isArray(stored.sectionOrder) ? stored.sectionOrder : [];

  const index = next.templates.index;
  const instances: Record<string, SectionInstance> = {};
  const order: string[] = [];

  const orderedKeys = [
    ...v1Order.filter((k): k is string => typeof k === "string"),
    ...Object.keys(V1_TYPE_MAP).filter((k) => !v1Order.includes(k)),
  ];

  for (const v1Key of orderedKeys) {
    const type = V1_TYPE_MAP[v1Key];
    const def = type ? SECTION_REGISTRY[type] : undefined;
    if (!def) continue;

    const saved = isPlainObject(v1Sections[v1Key]) ? v1Sections[v1Key] : {};
    const { enabled, ...content } = saved as Record<string, unknown> & {
      enabled?: boolean;
    };

    const id = `index-${type}`;
    instances[id] = {
      id,
      type,
      enabled: enabled !== false,
      settings: fillMissing(structuredClone(def.defaults), content),
    };
    order.push(id);
  }

  if (order.length > 0) {
    next.templates.index = { ...index, order, instances };
  }
  return next;
}

/* ── v2 normalisation ─────────────────────────────────────────────── */

function normalizeInstance(
  raw: unknown,
  fallbackId: string,
  fallbackInst?: SectionInstance
): SectionInstance | null {
  if (!isPlainObject(raw)) return null;

  const type = typeof raw.type === "string" ? raw.type : (fallbackInst?.type ?? "");
  const def = SECTION_REGISTRY[type];
  if (!def) return null; // section type removed from the codebase

  let showWhen = typeof raw.showWhen === "string" ? raw.showWhen : fallbackInst?.showWhen;
  if (!showWhen) {
    if (type === "myleVerification") showWhen = "handleIncludesMyle";
    else if (type === "juulAppIntegration") showWhen = "handleIsJuul2";
    else if (type === "juulSignatureFlavors") showWhen = "handleIncludesJuul";
    else if (type === "juulPackagingCompare") showWhen = "handleIsJuul1";
    else if (type === "juulTechSpecs") showWhen = "handleIncludesJuul";
    else if (type === "disposableShowcase" || type === "disposableComparison") showWhen = "handleIncludesDisposable";
    else if (type === "ejuiceShowcase") showWhen = "handleIsEJuice";
  }

  if (type === "brands" && (showWhen === "notBrandDirectory" || !showWhen)) {
    showWhen = "notBrandDirectoryAndNotEJuice";
  }

  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : fallbackId,
    type,
    enabled: raw.enabled !== false,
    ...(showWhen ? { showWhen } : {}),
    settings: fillMissing(structuredClone(def.defaults), raw.settings),
  };
}

/**
 * Work out a template's URL rule.
 *
 * Overrides saved before rules existed only carried an exact `handle`; those
 * are promoted to `{ type: "exact" }` so old and new data resolve through the
 * same code path. Templates with neither are the type defaults, which match
 * nothing and act as the fallback.
 */
function normalizeMatch(
  raw: Record<string, unknown>,
  fallback: Template | undefined
): { match: TemplateMatch; handle?: string } | null {
  const rawMatch = isPlainObject(raw.match) ? raw.match : null;
  const legacyHandle =
    typeof raw.handle === "string" && raw.handle
      ? raw.handle
      : fallback?.handle;

  if (rawMatch) {
    const type = rawMatch.type;
    const value = rawMatch.value;
    if (MATCH_TYPES.has(type as string) && typeof value === "string" && value.trim()) {
      return {
        match: { type: type as TemplateMatch["type"], value: value.trim() },
        ...(type === "exact" ? { handle: value.trim() } : {}),
      };
    }
  }

  if (legacyHandle) {
    return { match: { type: "exact", value: legacyHandle }, handle: legacyHandle };
  }
  if (fallback?.match) return { match: fallback.match };
  return null;
}

function normalizeTemplate(raw: unknown, fallback: Template | undefined): Template | null {
  if (!isPlainObject(raw)) return fallback ?? null;

  const rawInstances = isPlainObject(raw.instances) ? raw.instances : {};
  const instances: Record<string, SectionInstance> = {};

  for (const [id, value] of Object.entries(rawInstances)) {
    const fallbackInst = fallback?.instances[id];
    const instance = normalizeInstance(value, id, fallbackInst);
    if (instance) instances[instance.id] = instance;
  }

  // Backfill missing fallback default instances (e.g. newly added system sections)
  if (fallback) {
    for (const [id, fallbackInst] of Object.entries(fallback.instances)) {
      if (!instances[id]) {
        instances[id] = structuredClone(fallbackInst);
      }
    }
  }

  // `order` is the source of truth for what the template contains: keep its
  // sequence, drop ids with no matching instance, and prune instances the
  // order omits. Appending orphans instead would silently resurrect sections
  // the merchant removed, and let dropped instances accumulate forever.
  const savedOrder = Array.isArray(raw.order) ? raw.order : [];
  const seen = new Set<string>();
  const order: string[] = [];
  for (const id of savedOrder) {
    if (typeof id === "string" && instances[id] && !seen.has(id)) {
      seen.add(id);
      order.push(id);
    }
  }

  // Backfill any missing default order items from fallback definition
  if (fallback) {
    for (const id of fallback.order) {
      if (instances[id] && !seen.has(id)) {
        seen.add(id);
        order.push(id);
      }
    }
  }

  if (order.length === 0) {
    // No usable order at all (legacy or corrupt data). Falling back to every
    // instance beats rendering a blank page.
    for (const id of Object.keys(instances)) order.push(id);
  } else {
    for (const id of Object.keys(instances)) {
      if (!seen.has(id)) delete instances[id];
    }
  }

  const type = (typeof raw.type === "string" ? raw.type : fallback?.type) ?? "page";
  return {
    type: type as Template["type"],
    label: typeof raw.label === "string" ? raw.label : (fallback?.label ?? type),
    ...(normalizeMatch(raw, fallback) ?? {}),
    previewPath:
      typeof raw.previewPath === "string" && raw.previewPath
        ? raw.previewPath
        : (fallback?.previewPath ?? "/"),
    order,
    instances,
  };
}

/* ── v2 → v3 migration ────────────────────────────────────────────── */

/**
 * Split a v2 store's single collection template into the v3 set.
 *
 * v2 had one collection template carrying every section, each gated by a
 * `showWhen` condition. v3 promotes those conditions to templates: one per
 * family, plus a default holding what every collection shows.
 *
 * The merchant's own template is the source, not the factory copy, so headings
 * they rewrote, sections they disabled and the order they chose all survive —
 * each lands in the families where its condition applied. Which sections render
 * on which page is unchanged; only which template owns them moves.
 */
function splitStoredCollectionTemplate(
  rawTemplates: Record<string, unknown>
): Record<string, Template> {
  // Filled in against the pre-split base, not against the new default template:
  // that one has already had the family sections taken out of it, so a store
  // whose saved template is partial would derive families with nothing in them.
  const base = normalizeTemplate(rawTemplates.collection, COLLECTION_BASE);
  if (!base) return {};

  return {
    collection: deriveDefaultCollectionTemplate(base),
    ...deriveCollectionFamilyTemplates(base),
  };
}

/* ── v3 → v4 migration ────────────────────────────────────────────── */

/**
 * Give family templates the content that belongs to their family.
 *
 * Only reaches templates written between the split and the content landing;
 * a store migrating straight from v2 already has it, and anything the merchant
 * has edited is left alone.
 */
function backfillCollectionFamilies(templates: Record<string, Template>): void {
  const sectionDefaults = (type: string) => SECTION_REGISTRY[type]?.defaults;

  for (const family of COLLECTION_FAMILIES) {
    const template = templates[family.key];
    if (!template) continue;
    templates[family.key] = backfillFamilyContent(template, family, sectionDefaults);
  }
}

export function normalizeSettings(stored: unknown): ThemeSettings {
  if (!isPlainObject(stored)) return createDefaultSettings();

  const version = typeof stored.version === "number" ? stored.version : 1;
  if (version < 2) return migrateV1(stored);

  const defaults = createDefaultSettings();
  const rawTemplates = isPlainObject(stored.templates) ? stored.templates : {};

  const templates: Record<string, Template> = {};
  const split = version < 3 ? splitStoredCollectionTemplate(rawTemplates) : null;

  // Defaults first, so a template the merchant never touched still exists.
  for (const [key, defaultTemplate] of Object.entries(defaults.templates)) {
    // A collection template produced by the v2 → v3 split is already built from
    // the merchant's own content, so it replaces the stored copy outright
    // rather than being merged back into the template it came from.
    const migrated = split?.[key];
    if (migrated) {
      templates[key] = migrated;
      continue;
    }

    const normalized = normalizeTemplate(rawTemplates[key], defaultTemplate);
    templates[key] = normalized ?? defaultTemplate;
  }
  // v3 shipped the family templates before the content that distinguishes them.
  if (version === 3) backfillCollectionFamilies(templates);

  // Then merchant-created per-handle overrides.
  for (const [key, raw] of Object.entries(rawTemplates)) {
    if (templates[key]) continue;
    const normalized = normalizeTemplate(raw, undefined);
    if (normalized && normalized.order.length > 0) templates[key] = normalized;
  }

  return {
    version: THEME_VERSION,
    header: fillMissing(defaults.header, stored.header),
    footer: fillMissing(defaults.footer, stored.footer),
    templates,
  };
}
