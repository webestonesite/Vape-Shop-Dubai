"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";

import { COLLECTION_FAMILY_KEYS } from "@/lib/theme/collection-families";
import { describeMatch, templateMatch, type Template } from "@/lib/theme/types";

/**
 * Template switcher, modelled on Shopify's: pick which page you're editing,
 * and create or delete per-handle overrides from the same menu.
 */

const TYPE_GROUPS: { type: string; label: string }[] = [
  { type: "index", label: "Home" },
  { type: "collection", label: "Collections" },
  { type: "product", label: "Products" },
  { type: "page", label: "Pages" },
];

export const TemplatePicker: React.FC<{
  templates: Record<string, Template>;
  activeKey: string;
  onSelect: (key: string) => void;
  onCreateOverride: (type: "collection" | "product") => void;
  onDeleteTemplate: (key: string) => void;
}> = ({ templates, activeKey, onSelect, onCreateOverride, onDeleteTemplate }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const active = templates[activeKey];
  const activeRule = active ? templateMatch(active) : undefined;

  const entries = Object.entries(templates);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-left transition-colors hover:border-slate-300"
      >
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-bold text-slate-800">
            {active?.label ?? "Select a template"}
          </span>
          {activeRule && (
            <span className="block truncate text-[10px] font-semibold text-orange-600">
              {describeMatch(activeRule)}
            </span>
          )}
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-[70vh] overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {TYPE_GROUPS.map((group) => {
            const groupEntries = entries.filter(
              ([, t]) => t.type === group.type
            );
            if (groupEntries.length === 0 && group.type !== "collection" && group.type !== "product") {
              return null;
            }

            return (
              <div key={group.type} className="py-1">
                <p className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {group.label}
                </p>

                {groupEntries.map(([key, t]) => {
                  const rule = templateMatch(t);
                  const isActive = key === activeKey;

                  return (
                    <div
                      key={key}
                      className={`group flex items-center gap-1 px-1 ${
                        isActive ? "bg-orange-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onSelect(key);
                          setOpen(false);
                        }}
                        className="min-w-0 flex-1 cursor-pointer px-2 py-2 text-left"
                      >
                        <span
                          className={`block truncate text-[13px] font-semibold ${
                            isActive ? "text-orange-700" : "text-slate-700"
                          }`}
                        >
                          {t.label}
                        </span>
                        {rule && (
                          <span className="block truncate text-[10px] text-slate-400">
                            {describeMatch(rule)}
                          </span>
                        )}
                      </button>

                      {/* Only merchant-made overrides are deletable. The type
                          defaults are the fallback every page relies on, and
                          the built-in families ship as defaults too — deleting
                          one would just bring it back on the next save. */}
                      {rule &&
                        !COLLECTION_FAMILY_KEYS.has(key) &&
                        (t.type === "collection" || t.type === "product") && (
                        <button
                          type="button"
                          onClick={() => onDeleteTemplate(key)}
                          aria-label={`Delete ${t.label} override`}
                          className="cursor-pointer rounded p-1.5 text-slate-300 opacity-0 transition-colors group-hover:opacity-100 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}

                {(group.type === "collection" || group.type === "product") && (
                  <button
                    type="button"
                    onClick={() => {
                      onCreateOverride(group.type as "collection" | "product");
                      setOpen(false);
                    }}
                    className="flex w-full cursor-pointer items-center gap-1.5 px-3 py-2 text-left text-[12px] font-bold text-slate-500 transition-colors hover:bg-slate-50 hover:text-orange-600"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    New {group.type} template…
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
