/**
 * Collection pages, split into one template per family.
 *
 * Collections used to share a single template carrying every section any
 * collection might need, each gated by a `showWhen` condition. It rendered
 * correctly but read as a list of fifteen sections where ten were invisible on
 * any given page, and a merchant editing "Collection pages" could not tell what
 * they were looking at.
 *
 * The same rules now sit one level up: each family is its own template, matched
 * by the condition that used to gate its sections. A JUUL template holds the
 * JUUL sections and nothing else; the default collection template holds only
 * what every collection shows. Nothing about which sections appear on which
 * page changes — the conditions were moved, not rewritten.
 *
 * Everything is derived from one base template listing every section, by the
 * function below. `defaults.ts` derives the factory copy from it, and
 * `normalize.ts` derives an existing store's templates from whatever that
 * merchant has already edited, so the split costs them no content.
 */

import { CONDITIONS } from "./conditions";
import {
  BOTTOM_GRID_CARDS,
  JUUL_2_FLAVORS,
  JUUL_2_TECH_SPECS,
} from "./sections";
import type { SectionInstance, Template } from "./types";

export interface CollectionFamily {
  /** Template key, matching `templateKeyForMatch("collection", match)`. */
  key: string;
  label: string;
  /** Predicate from `conditions.ts` that decides which collections land here. */
  condition: string;
  /**
   * A handle in this family. Its only job is to work out which of the base
   * template's conditional sections belong to the family — the family is
   * defined by its condition, not by this handle.
   */
  sample: string;
  previewPath: string;
  /** Breaks ties when a handle belongs to two families. Higher wins. */
  priority: number;
  /**
   * Conditions carried into the template still gated, rather than resolved.
   *
   * For handles that genuinely belong to two families at once. `myle-disposable`
   * is both a MYLE collection and a disposable one; it resolves to the MYLE
   * template (higher priority), which therefore has to keep the disposable
   * sections conditional so that page keeps them and `myle-v5-pods` doesn't.
   */
  keepConditional?: string[];
  /**
   * Settings this family starts a section from, by instance id.
   *
   * For sections whose content genuinely differs between families: the tech
   * spec table says 200 mAh on a JUUL 1 page and 250 mAh on a JUUL 2 one. The
   * section registry can only hold one set of defaults, so the other lives
   * here — merged over the base, key by key, leaving anything the merchant
   * edited elsewhere in that section alone.
   */
  settingsOverrides?: Record<string, Record<string, unknown>>;
}

/**
 * Ordered most specific first, which is also the priority order.
 *
 * Only MYLE and Disposables actually overlap today; the rest are disjoint, so
 * their relative priorities never come into play.
 *
 * A collection belongs to exactly one family — the highest priority one that
 * matches. If a future handle spans two families whose overlap isn't listed in
 * `keepConditional` (a "juul-disposable", say), it takes the higher-priority
 * template and shows only that family's sections; the other family's can be
 * added back on that one collection from Admin → Collections.
 */
export const COLLECTION_FAMILIES: CollectionFamily[] = [
  {
    key: "collection:condition--isbranddirectory",
    label: "Brand directory",
    condition: "isBrandDirectory",
    sample: "brand",
    previewPath: "/collections/brand",
    priority: 50,
  },
  {
    key: "collection:condition--handleisjuul2",
    label: "JUUL 2 collections",
    condition: "handleIsJuul2",
    sample: "juul-2-series",
    previewPath: "/collections/juul-2-series",
    priority: 40,
    settingsOverrides: {
      "col-juul-specs": { ...JUUL_2_TECH_SPECS },
      "col-juul-flavors": { ...JUUL_2_FLAVORS },
      "col-bottom-grid": { cards: BOTTOM_GRID_CARDS.juul },
    },
  },
  {
    key: "collection:condition--handleisjuul1",
    label: "JUUL collections",
    condition: "handleIsJuul1",
    sample: "juul-1-series",
    previewPath: "/collections/juul-1-series",
    priority: 30,
    settingsOverrides: {
      "col-bottom-grid": { cards: BOTTOM_GRID_CARDS.juul },
    },
  },
  {
    key: "collection:condition--handleincludesmyle",
    label: "MYLE collections",
    condition: "handleIncludesMyle",
    sample: "myle-vape-dubai",
    previewPath: "/collections/myle-vape-dubai",
    priority: 20,
    keepConditional: ["handleIncludesDisposable"],
    settingsOverrides: {
      "col-bottom-grid": { cards: BOTTOM_GRID_CARDS.myle },
    },
  },
  {
    key: "collection:condition--handleincludesdisposable",
    label: "Disposable collections",
    condition: "handleIncludesDisposable",
    sample: "disposable-vape",
    previewPath: "/collections/disposable-vape",
    priority: 10,
    settingsOverrides: {
      "col-bottom-grid": { cards: BOTTOM_GRID_CARDS.disposable },
    },
  },
  {
    key: "collection:condition--handleisejuice",
    label: "E-liquid collections",
    condition: "handleIsEJuice",
    sample: "vape-e-juice",
    previewPath: "/collections/vape-e-juice",
    priority: 10,
    settingsOverrides: {
      "col-bottom-grid": { cards: BOTTOM_GRID_CARDS.ejuice },
    },
  },
];

/**
 * A handle that belongs to no family, used to derive the default collection
 * template. Every family's sections drop away, leaving what all collections
 * share.
 */
export const GENERIC_COLLECTION_SAMPLE = "vape-collection";

/**
 * Conditions the default template keeps gated rather than resolving.
 *
 * Collections outside every family still disagree among themselves here:
 * `notBrandDirectoryAndNotEJuice` hides the brand strip on freebase e-liquid
 * pages, and freebase is deliberately *not* part of the e-liquid family. No
 * single sample handle can answer for both, so the section stays conditional.
 */
const GENERIC_KEEP_CONDITIONAL = ["notBrandDirectoryAndNotEJuice"];

function instancesFor(
  base: Template,
  sample: string,
  keepConditional: string[] = [],
  settingsOverrides: Record<string, Record<string, unknown>> = {}
): { order: string[]; instances: Record<string, SectionInstance> } {
  const order: string[] = [];
  const instances: Record<string, SectionInstance> = {};

  for (const id of base.order) {
    const instance = base.instances[id];
    if (!instance) continue;

    const { showWhen } = instance;

    const override = settingsOverrides[id];
    const withOverride = (next: SectionInstance): SectionInstance =>
      override ? { ...next, settings: { ...next.settings, ...override } } : next;

    if (showWhen && keepConditional.includes(showWhen)) {
      // Stays gated: this family contains pages on both sides of the condition.
      order.push(id);
      instances[id] = withOverride(structuredClone(instance));
      continue;
    }

    if (showWhen) {
      const predicate = CONDITIONS[showWhen];
      // An unknown condition is stale data. Keeping the section matches the
      // storefront's own bias — a missing section is harder to notice.
      if (predicate && !predicate({ handle: sample })) continue;
    }

    // The condition is now the template's own rule, so the section no longer
    // needs to ask: every page reaching this template has already answered.
    const { showWhen: _dropped, ...rest } = structuredClone(instance);
    void _dropped;
    order.push(id);
    instances[id] = withOverride(rest);
  }

  return { order, instances };
}

/** The default collection template: what a collection in no family shows. */
export function deriveDefaultCollectionTemplate(base: Template): Template {
  return {
    ...base,
    label: "Collection pages",
    ...instancesFor(base, GENERIC_COLLECTION_SAMPLE, GENERIC_KEEP_CONDITIONAL),
  };
}

/** One template per family, derived from the same base. */
export function deriveCollectionFamilyTemplates(
  base: Template
): Record<string, Template> {
  const templates: Record<string, Template> = {};

  for (const family of COLLECTION_FAMILIES) {
    templates[family.key] = {
      type: "collection",
      label: family.label,
      match: { type: "condition", value: family.condition },
      priority: family.priority,
      previewPath: family.previewPath,
      ...instancesFor(
        base,
        family.sample,
        family.keepConditional,
        family.settingsOverrides
      ),
    };
  }

  return templates;
}

/**
 * Re-apply a family's content to a template that predates it.
 *
 * A store that reached v3 before the family content existed has, say, the JUUL 1
 * spec table sitting on the JUUL 2 template. Each overridden key is restored
 * only where the stored value is still the section's own default — that is what
 * distinguishes "this came from the un-overridden derivation" from "the merchant
 * wrote this". Anything they touched is left exactly as it is.
 */
export function backfillFamilyContent(
  template: Template,
  family: CollectionFamily,
  sectionDefaults: (type: string) => Record<string, unknown> | undefined
): Template {
  const overrides = family.settingsOverrides;
  if (!overrides) return template;

  const instances = { ...template.instances };
  let changed = false;

  for (const [id, override] of Object.entries(overrides)) {
    const instance = instances[id];
    if (!instance) continue;

    const defaults = sectionDefaults(instance.type);
    if (!defaults) continue;

    const settings = { ...instance.settings };
    let touched = false;

    for (const [key, value] of Object.entries(override)) {
      const isUntouched =
        JSON.stringify(settings[key]) === JSON.stringify(defaults[key]);
      if (isUntouched) {
        settings[key] = structuredClone(value);
        touched = true;
      }
    }

    if (touched) {
      instances[id] = { ...instance, settings };
      changed = true;
    }
  }

  return changed ? { ...template, instances } : template;
}

/**
 * Keys of the built-in family templates.
 *
 * They ship as defaults, so deleting one only makes it reappear on the next
 * save — the customizer hides the delete action for these and offers hiding
 * their sections instead.
 */
export const COLLECTION_FAMILY_KEYS: ReadonlySet<string> = new Set(
  COLLECTION_FAMILIES.map((family) => family.key)
);
