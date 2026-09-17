"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, X } from "lucide-react";

import { CONDITION_LABELS, TEMPLATE_CONDITIONS } from "@/lib/theme/conditions";
import {
  matchesHandle,
  templateKeyForMatch,
  templateMatch,
  type Template,
  type TemplateMatch,
  type TemplateMatchType,
} from "@/lib/theme/types";

/**
 * Creates a template that applies to a *set* of URLs rather than one handle —
 * "every collection containing juul", "everything ending in -vape".
 *
 * The live match list is the point of the dialog: a rule is abstract until you
 * can see which of your actual URLs it will take over.
 */

const MATCH_OPTIONS: {
  value: TemplateMatchType;
  label: string;
  hint: string;
  example: string;
}[] = [
  { value: "exact", label: "Is exactly", hint: "One specific page.", example: "juul-1-series" },
  { value: "prefix", label: "Starts with", hint: "A family sharing a prefix.", example: "juul-" },
  { value: "suffix", label: "Ends with", hint: "A family sharing a suffix.", example: "-vape" },
  { value: "contains", label: "Contains", hint: "Anywhere in the handle.", example: "juul" },
  {
    value: "wildcard",
    label: "Matches pattern",
    hint: "* is any run of characters, ? is one.",
    example: "juul-*-series",
  },
  {
    value: "condition",
    label: "Is a family",
    hint: "A built-in group, for families a handle pattern can't describe.",
    example: "",
  },
];

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15";
const labelClass =
  "block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5";

/** Collection handles referenced by the merchant's own navigation menu. */
function handlesFromMenu(menu: { href: string; children: { href: string }[] }[]): string[] {
  const out = new Set<string>();
  const add = (href: string) => {
    const m = href.match(/^\/collections\/([^/?#]+)/);
    if (m) out.add(m[1].toLowerCase());
  };
  for (const item of menu) {
    add(item.href);
    for (const child of item.children) add(child.href);
  }
  return [...out].sort();
}

export const TemplateRuleDialog: React.FC<{
  type: "collection" | "product";
  templates: Record<string, Template>;
  menu: { href: string; children: { href: string }[] }[];
  onCancel: () => void;
  onCreate: (match: TemplateMatch, previewPath: string, label: string) => void;
}> = ({ type, templates, menu, onCancel, onCreate }) => {
  const [matchType, setMatchType] = useState<TemplateMatchType>("contains");
  const [value, setValue] = useState("");
  /** null until the merchant types their own preview URL. */
  const [previewOverride, setPreviewOverride] = useState<string | null>(null);
  const [productHandles, setProductHandles] = useState<string[]>([]);

  const basePath = type === "collection" ? "/collections/" : "/product/";

  // Collections have no list endpoint, but the merchant's own menu is a good
  // sample of real handles. Products do, so fetch a sample of those.
  useEffect(() => {
    if (type !== "product") return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !Array.isArray(data)) return;
        setProductHandles(
          data
            .map((p: { handle?: string }) => p.handle)
            .filter((h: unknown): h is string => typeof h === "string")
            .map((h) => h.toLowerCase())
        );
      } catch {
        // Sample list is a convenience; the rule still saves without it.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [type]);

  const knownHandles = useMemo(
    () => (type === "collection" ? handlesFromMenu(menu) : productHandles),
    [type, menu, productHandles]
  );

  const match: TemplateMatch = { type: matchType, value: value.trim() };

  const matched = useMemo(() => {
    if (!match.value) return [];
    return knownHandles.filter((h) => matchesHandle(match, h));
  }, [knownHandles, match.type, match.value]); // eslint-disable-line react-hooks/exhaustive-deps

  // The preview URL tracks the rule until the merchant types their own, so
  // it's derived rather than synced from an effect.
  const suggestedPreview = useMemo(() => {
    const sample = matched[0] ?? (matchType === "exact" ? value.trim() : "");
    return sample ? `${basePath}${sample}` : "";
  }, [matched, matchType, value, basePath]);
  const previewPath = previewOverride ?? suggestedPreview;

  const key = match.value ? templateKeyForMatch(type, match) : "";
  const keyTaken = Boolean(key && templates[key]);

  /** Another rule that would fight this one for the same URLs. */
  const overlapping = useMemo(() => {
    if (!match.value || matched.length === 0) return [];
    return Object.entries(templates)
      .filter(([k, t]) => {
        if (t.type !== type || k === key) return false;
        const other = templateMatch(t);
        return Boolean(other) && matched.some((h) => matchesHandle(other!, h));
      })
      .map(([, t]) => t.label);
  }, [templates, type, matched, key, match.value]);

  const canSubmit = Boolean(match.value) && !keyTaken;

  const submit = () => {
    if (!canSubmit) return;
    const noun = type === "collection" ? "Collection" : "Product";
    const option = MATCH_OPTIONS.find((o) => o.value === matchType);
    const label =
      matchType === "exact"
        ? `${noun}: ${match.value}`
        : matchType === "condition"
          ? `${noun}: ${CONDITION_LABELS[match.value] ?? match.value}`
          : `${noun}: ${option?.label.toLowerCase()} “${match.value}”`;
    onCreate(match, previewPath || `${basePath}${matched[0] ?? match.value}`, label);
  };

  const activeOption = MATCH_OPTIONS.find((o) => o.value === matchType);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`New ${type} template`}
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl"
        onKeyDown={(e) => {
          if (e.key === "Escape") onCancel();
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
        }}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
          <div>
            <h2 className="text-[14px] font-black text-slate-800">
              New {type} template
            </h2>
            <p className="text-[11px] text-slate-400">
              Applies to every URL whose handle matches your rule.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="cursor-pointer rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <span className={labelClass}>Apply when the handle…</span>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {MATCH_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMatchType(option.value)}
                  aria-pressed={matchType === option.value}
                  className={`cursor-pointer rounded-lg border px-2.5 py-2 text-[12px] font-bold transition-colors ${
                    matchType === option.value
                      ? "border-orange-400 bg-orange-50 text-orange-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {activeOption && (
              <p className="mt-1.5 text-[11px] text-slate-400">{activeOption.hint}</p>
            )}
          </div>

          <div>
            <label htmlFor="rule-value" className={labelClass}>
              {matchType === "condition" ? "Family" : "Value"}
            </label>
            {matchType === "condition" ? (
              <select
                id="rule-value"
                autoFocus
                className={inputClass}
                value={value}
                onChange={(e) => setValue(e.target.value)}
              >
                <option value="">Choose a family…</option>
                {(TEMPLATE_CONDITIONS[type] ?? []).map((condition) => (
                  <option key={condition} value={condition}>
                    {CONDITION_LABELS[condition] ?? condition}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-[12px] font-semibold text-slate-400">
                  {basePath}
                </span>
                <input
                  id="rule-value"
                  autoFocus
                  className={inputClass}
                  placeholder={activeOption?.example}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
            )}
            {keyTaken && (
              <p className="mt-1.5 text-[11px] font-bold text-red-600">
                A template with this exact rule already exists.
              </p>
            )}
          </div>

          {/* The whole point: show which real URLs this rule captures. */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {match.value
                ? `Matches ${matched.length} known ${type === "collection" ? "collection" : "product"}${matched.length === 1 ? "" : "s"}`
                : "Matches"}
            </p>
            {!match.value ? (
              <p className="mt-1 text-[12px] text-slate-400">
                Type a value to see which URLs this covers.
              </p>
            ) : matched.length === 0 ? (
              <p className="mt-1 text-[12px] text-slate-400">
                Nothing in your {type === "collection" ? "menu" : "catalogue"} matches
                yet — the rule still works for URLs added later.
              </p>
            ) : (
              <ul className="mt-1.5 max-h-28 space-y-0.5 overflow-y-auto">
                {matched.slice(0, 40).map((handle) => (
                  <li key={handle} className="truncate text-[12px] text-slate-600">
                    <span className="text-slate-300">{basePath}</span>
                    {handle}
                  </li>
                ))}
                {matched.length > 40 && (
                  <li className="text-[11px] text-slate-400">
                    …and {matched.length - 40} more
                  </li>
                )}
              </ul>
            )}
          </div>

          {overlapping.length > 0 && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-snug text-amber-800">
              <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
              <span>
                Also matched by {overlapping.join(", ")}. The more specific rule
                wins per URL — exact, then pattern, then starts/ends with, then
                contains, then family. A rule you write by hand always beats a
                built-in family template.
              </span>
            </div>
          )}

          <div>
            <label htmlFor="rule-preview" className={labelClass}>
              Preview URL
            </label>
            <input
              id="rule-preview"
              className={inputClass}
              placeholder={`${basePath}example`}
              value={previewPath}
              onChange={(e) => setPreviewOverride(e.target.value)}
            />
            <p className="mt-1.5 text-[11px] text-slate-400">
              Which page the customizer shows while you edit this template.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-lg border border-slate-200 px-3.5 py-1.5 text-[12px] font-bold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-1.5 text-[12px] font-black uppercase tracking-wide text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Check className="h-3.5 w-3.5" />
            Create template
          </button>
        </div>
      </div>
    </div>
  );
};
