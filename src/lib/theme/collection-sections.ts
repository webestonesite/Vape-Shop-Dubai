/**
 * Per-collection section layouts, stored on the Shopify collection itself.
 *
 * The theme customizer answers "what do collection pages look like?" — one
 * template for all of them, plus rule-based overrides. This module answers the
 * narrower question "what does *this* collection look like?", and keeps the
 * answer where the rest of that collection's content already lives: a metafield
 * on the collection, `custom.page_sections`.
 *
 * Why the collection and not the theme record:
 *
 *   - the layout travels with the collection, visible in Shopify admin, and
 *     survives a theme reset
 *   - merchants edit one collection without touching every other one
 *   - no template rule to reason about — the page is configured directly
 *
 * A collection with no metafield falls back to the theme's collection template,
 * exactly as before. Saving one is an explicit statement of what that page
 * contains, so its sections render unconditionally — the `showWhen` rules are
 * resolved once, at seed time, against that handle.
 *
 * This file is data only — no React, no Shopify calls — so route handlers, the
 * admin UI and the storefront can all import it.
 */

import { CONDITIONS } from "./conditions";
import { fillMissing } from "./normalize";
import { SECTION_REGISTRY } from "./sections";
import type { SectionInstance, Template } from "./types";

/** Where the layout lives on the collection. Visible in Shopify admin. */
export const COLLECTION_SECTIONS_NAMESPACE = "custom";
export const COLLECTION_SECTIONS_KEY = "page_sections";
export const COLLECTION_SECTIONS_VERSION = 1;

/**
 * Shopify caps a metafield value well above this, but a layout that large means
 * an entire SEO article has been pasted into a section. Checking here turns a
 * raw GraphQL rejection into a sentence the merchant can act on.
 */
export const COLLECTION_SECTIONS_MAX_BYTES = 60_000;

export interface CollectionSectionsConfig {
  version: number;
  /** Instance ids, in render order. */
  order: string[];
  instances: Record<string, SectionInstance>;
  updatedAt?: string;
  updatedBy?: string;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/* ── Reading stored JSON ──────────────────────────────────────────── */

function normalizeInstance(raw: unknown, fallbackId: string): SectionInstance | null {
  if (!isPlainObject(raw)) return null;

  const type = typeof raw.type === "string" ? raw.type : "";
  const def = SECTION_REGISTRY[type];
  // Section type no longer exists in the codebase, or was never valid here.
  if (!def || !def.templates.includes("collection")) return null;

  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : fallbackId,
    type,
    enabled: raw.enabled !== false,
    // Only the keys the merchant changed are stored; the rest come from the
    // section's current defaults, so improvements to those are inherited.
    settings: fillMissing(structuredClone(def.defaults), raw.settings),
  };
}

/**
 * Turn whatever the metafield holds into a renderable layout.
 *
 * Returns null — meaning "fall back to the theme template" — for anything that
 * can't produce at least one section, so a hand-edited or truncated metafield
 * degrades to the default page instead of a blank one.
 */
export function parseCollectionSections(raw: unknown): CollectionSectionsConfig | null {
  let source: unknown = raw;
  if (typeof source === "string") {
    if (!source.trim()) return null;
    try {
      source = JSON.parse(source);
    } catch {
      return null;
    }
  }
  if (!isPlainObject(source)) return null;

  const rawInstances = isPlainObject(source.instances) ? source.instances : {};
  const instances: Record<string, SectionInstance> = {};
  for (const [id, value] of Object.entries(rawInstances)) {
    const instance = normalizeInstance(value, id);
    if (instance) instances[instance.id] = instance;
  }

  // `order` is the source of truth for what the page contains: ids with no
  // instance are dropped, and instances the order omits are pruned.
  const rawOrder = Array.isArray(source.order) ? source.order : [];
  const seen = new Set<string>();
  const order: string[] = [];
  for (const id of rawOrder) {
    if (typeof id === "string" && instances[id] && !seen.has(id)) {
      seen.add(id);
      order.push(id);
    }
  }
  for (const id of Object.keys(instances)) {
    if (!seen.has(id)) delete instances[id];
  }

  if (order.length === 0) return null;

  return {
    version: COLLECTION_SECTIONS_VERSION,
    order,
    instances,
    ...(typeof source.updatedAt === "string" ? { updatedAt: source.updatedAt } : {}),
    ...(typeof source.updatedBy === "string" ? { updatedBy: source.updatedBy } : {}),
  };
}

/* ── Seeding a new layout ─────────────────────────────────────────── */

/**
 * The layout a collection starts from: what that page renders today.
 *
 * Conditional sections are resolved against this handle here and now — the
 * JUUL spec table is kept on a JUUL collection and dropped everywhere else —
 * so the editor shows the real page rather than every section that *might*
 * appear on some collection. After this the layout is literal: what's listed
 * is what renders.
 */
export function seedCollectionSections(
  template: Template | undefined,
  handle: string
): CollectionSectionsConfig {
  const order: string[] = [];
  const instances: Record<string, SectionInstance> = {};

  for (const id of template?.order ?? []) {
    const instance = template?.instances[id];
    if (!instance) continue;

    const def = SECTION_REGISTRY[instance.type];
    if (!def) continue;

    if (instance.showWhen) {
      const predicate = CONDITIONS[instance.showWhen];
      // An unknown predicate is stale data. Keeping the section matches the
      // storefront's own bias: a missing section is harder to notice.
      if (predicate && !predicate({ handle })) continue;
    }

    order.push(id);
    instances[id] = {
      id,
      type: instance.type,
      enabled: instance.enabled,
      settings: fillMissing(structuredClone(def.defaults), instance.settings),
    };
  }

  // The product grid *is* the collection page; a layout without it would render
  // a collection that shows no products.
  if (!order.some((id) => instances[id]?.type === "collectionMain")) {
    const def = SECTION_REGISTRY.collectionMain;
    instances["col-main"] = {
      id: "col-main",
      type: "collectionMain",
      enabled: true,
      settings: structuredClone(def.defaults),
    };
    order.unshift("col-main");
  }

  return { version: COLLECTION_SECTIONS_VERSION, order, instances };
}

/* ── Writing back ─────────────────────────────────────────────────── */

/**
 * Drop settings that still match the section's defaults.
 *
 * Keeps the metafield small and readable — a collection that only changed one
 * heading stores one heading — and lets later default changes flow through to
 * every collection that never overrode them.
 */
function pruneToChanges(
  defaults: Record<string, unknown>,
  settings: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(settings)) {
    const base = defaults[key];
    if (base === undefined) {
      out[key] = value;
      continue;
    }
    if (isPlainObject(base) && isPlainObject(value)) {
      const nested = pruneToChanges(base, value);
      if (Object.keys(nested).length > 0) out[key] = nested;
      continue;
    }
    // Arrays and scalars compare whole: a repeater the merchant reordered or
    // emptied differs from its default and is stored in full.
    if (JSON.stringify(base) !== JSON.stringify(value)) out[key] = value;
  }
  return out;
}

/** The exact JSON written to the metafield. */
export function serializeCollectionSections(
  config: CollectionSectionsConfig,
  updatedBy?: string | null
): string {
  const instances: Record<string, unknown> = {};
  for (const id of config.order) {
    const instance = config.instances[id];
    if (!instance) continue;
    const def = SECTION_REGISTRY[instance.type];
    if (!def) continue;

    instances[id] = {
      type: instance.type,
      enabled: instance.enabled,
      settings: pruneToChanges(def.defaults, instance.settings),
    };
  }

  return JSON.stringify({
    version: COLLECTION_SECTIONS_VERSION,
    order: config.order.filter((id) => instances[id]),
    instances,
    updatedAt: new Date().toISOString(),
    ...(updatedBy ? { updatedBy } : {}),
  });
}

/* ── Rendering ────────────────────────────────────────────────────── */

export interface ResolvedCollectionSections {
  instances: SectionInstance[];
  /**
   * True when the collection carries its own layout. The storefront reads this
   * as "render every enabled section as listed" — the conditions were already
   * settled when the layout was created.
   */
  isOverride: boolean;
}

/**
 * The sections a collection page should render: its own layout when it has
 * one, otherwise whatever the theme template resolved to.
 */
export function resolveCollectionSections(
  config: CollectionSectionsConfig | null | undefined,
  templateInstances: SectionInstance[],
  templateIsOverride: boolean
): ResolvedCollectionSections {
  if (!config || config.order.length === 0) {
    return { instances: templateInstances, isOverride: templateIsOverride };
  }

  return {
    instances: config.order
      .map((id) => config.instances[id])
      .filter((instance): instance is SectionInstance => Boolean(instance)),
    isOverride: true,
  };
}

/** Readable, collision-resistant instance id for a newly added section. */
export function newCollectionInstanceId(type: string, taken: Set<string>): string {
  let n = 1;
  let id = `${type}-${n}`;
  while (taken.has(id)) {
    n += 1;
    id = `${type}-${n}`;
  }
  return id;
}
