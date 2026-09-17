"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronDown,
  Cloud,
  ExternalLink,
  Eye,
  EyeOff,
  GripVertical,
  Layers,
  Loader2,
  Lock,
  Minus,
  Monitor,
  RotateCcw,
  Search,
  Smartphone,
  Tablet,
  Trash2,
  Undo2,
} from "lucide-react";

import { PREVIEW_MESSAGES, PREVIEW_PARAM } from "@/context/ThemeSettingsContext";
import type { PublicUser } from "@/lib/auth/users";
import {
  newCollectionInstanceId,
  type CollectionSectionsConfig,
} from "@/lib/theme/collection-sections";
import { SECTION_REGISTRY } from "@/lib/theme/sections";
import type { SectionInstance } from "@/lib/theme/types";

import { AddSectionMenu } from "./AddSectionMenu";
import { AdminUserMenu } from "./AdminUserMenu";
import { relativeTime, type CollectionRow } from "./CollectionsIndex";
import { FieldRenderer } from "./FieldRenderer";
import { useDragList } from "./use-drag-list";

const DEVICES = {
  desktop: { label: "Desktop", icon: Monitor, width: "100%" },
  tablet: { label: "Tablet", icon: Tablet, width: "834px" },
  mobile: { label: "Mobile", icon: Smartphone, width: "390px" },
} as const;

type DeviceKey = keyof typeof DEVICES;
type SaveState = "idle" | "saving" | "saved" | "error";
type Panel = { kind: "sections" } | { kind: "instance"; id: string };

/** A collection template from the theme, offered as a starting point. */
interface TemplateOption {
  key: string;
  label: string;
  /** Which pages it covers, e.g. "Only on JUUL 2 collections". */
  rule: string | null;
}

function sameConfig(
  a: CollectionSectionsConfig | null,
  b: CollectionSectionsConfig | null
): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/* ── Collection switcher ──────────────────────────────────────────── */

const CollectionSwitcher: React.FC<{
  handle: string;
  title: string;
  onNavigate: (handle: string) => void;
}> = ({ handle, title, onNavigate }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<CollectionRow[] | null>(null);
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

  // Loaded on first open: the list is only needed if the merchant switches.
  useEffect(() => {
    if (!open || rows) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/collections?sections=1");
        const data = await res.json();
        if (!cancelled && res.ok) setRows(data.collections ?? []);
      } catch {
        if (!cancelled) setRows([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, rows]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (rows ?? []).filter(
      (row) =>
        !needle ||
        row.title.toLowerCase().includes(needle) ||
        row.handle.toLowerCase().includes(needle)
    );
  }, [rows, query]);

  return (
    <div className="relative min-w-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full min-w-0 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-left transition-colors hover:bg-slate-50"
      >
        <Layers className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-slate-800">
          {title || handle}
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-[320px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="relative border-b border-slate-100 p-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search collections…"
              className="w-full rounded-lg bg-slate-50 py-2 pl-8 pr-2 text-[12.5px] text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="max-h-80 overflow-y-auto py-1">
            {!rows && (
              <p className="flex items-center justify-center gap-2 px-3 py-6 text-[12px] text-slate-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading…
              </p>
            )}
            {rows && filtered.length === 0 && (
              <p className="px-3 py-6 text-center text-[12px] text-slate-400">
                No collections match.
              </p>
            )}
            {filtered.map((row) => (
              <button
                key={row.handle}
                type="button"
                role="option"
                aria-selected={row.handle === handle}
                onClick={() => {
                  setOpen(false);
                  if (row.handle !== handle) onNavigate(row.handle);
                }}
                className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-slate-50 ${
                  row.handle === handle ? "bg-orange-50/60" : ""
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-semibold text-slate-700">
                    {row.title}
                  </span>
                  <span className="block truncate text-[11px] text-slate-400">
                    /{row.handle}
                  </span>
                </span>
                {row.customized && (
                  <span className="shrink-0 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9.5px] font-black uppercase tracking-wide text-emerald-700">
                    Custom
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Save indicator ───────────────────────────────────────────────── */

const SaveIndicator: React.FC<{
  state: SaveState;
  edited: boolean;
  hasLayout: boolean;
  savedAt: string | null;
}> = ({ state, edited, hasLayout, savedAt }) => {
  if (state === "saving") {
    return (
      <span className="hidden items-center gap-1.5 text-[11.5px] font-bold text-slate-400 sm:inline-flex">
        <Loader2 className="h-3 w-3 animate-spin" />
        Saving to Shopify…
      </span>
    );
  }
  if (edited) {
    return (
      <span className="hidden items-center gap-1.5 text-[11.5px] font-bold text-amber-600 sm:inline-flex">
        <Cloud className="h-3 w-3" />
        Unsaved changes
      </span>
    );
  }
  if (hasLayout) {
    return (
      <span className="hidden items-center gap-1.5 text-[11.5px] font-bold text-emerald-600 sm:inline-flex">
        <Check className="h-3 w-3" />
        Saved {relativeTime(savedAt) || "just now"}
      </span>
    );
  }
  return (
    <span className="hidden items-center gap-1.5 text-[11.5px] font-bold text-slate-400 sm:inline-flex">
      Following theme template
    </span>
  );
};

/* ── Editor ───────────────────────────────────────────────────────── */

export const CollectionCustomizer: React.FC<{
  user: PublicUser;
  handle: string;
}> = ({ user, handle }) => {
  const [config, setConfig] = useState<CollectionSectionsConfig | null>(null);
  /** Last state known to be in Shopify — the baseline for "unsaved changes". */
  const [savedConfig, setSavedConfig] = useState<CollectionSectionsConfig | null>(
    null
  );
  const [title, setTitle] = useState(handle);
  const [templateLabel, setTemplateLabel] = useState("Collection pages");
  const [templateKey, setTemplateKey] = useState("collection");
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  /** The template this handle resolves to on its own, before any choice. */
  const [matchedTemplateKey, setMatchedTemplateKey] = useState<string | null>(null);
  const [hasLayout, setHasLayout] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [busy, setBusy] = useState(false);

  const [panel, setPanel] = useState<Panel>({ kind: "sections" });
  const [device, setDevice] = useState<DeviceKey>("desktop");

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  /** What the server last handed back — where "Discard" returns to. */
  const [baseline, setBaseline] = useState<CollectionSectionsConfig | null>(null);

  /**
   * Two questions with different answers, which is why they're separate flags:
   *
   *   edited    has the merchant touched anything since it was loaded or saved?
   *             Drives the warnings and the Discard button.
   *   canSave   would saving change what's in Shopify? Also true for an
   *             untouched collection that has no layout yet — saving it as-is
   *             is exactly how a collection adopts one.
   */
  const edited = useMemo(
    () => Boolean(config) && !sameConfig(config, savedConfig ?? baseline),
    [config, savedConfig, baseline]
  );
  const canSave = useMemo(
    () => Boolean(config) && !sameConfig(config, savedConfig),
    [config, savedConfig]
  );

  /* ── Load ─────────────────────────────────────────────────────── */

  useEffect(() => {
    // The storefront's age gate is a fixed overlay that would otherwise cover
    // the preview. Admin and storefront share an origin, so the flag set here
    // also satisfies the gate inside the iframe.
    try {
      localStorage.setItem("vapedubai_age_verified", "true");
    } catch {
      // Storage disabled (private browsing) — the gate stays. Inconvenient,
      // not broken.
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    (async () => {
      try {
        const res = await fetch(
          `/api/admin/collections/${encodeURIComponent(handle)}/sections`
        );
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error ?? "Could not load this collection.");

        setBaseline(data.config);
        setConfig(data.config);
        // Nothing is in Shopify until the merchant saves, so an inherited
        // layout has no saved counterpart — that's what keeps Save live.
        setSavedConfig(data.saved ? data.config : null);
        setHasLayout(Boolean(data.saved));
        setSavedAt(data.updatedAt ?? null);
        setTitle(data.collection?.title ?? handle);
        setTemplateKey(data.templateKey ?? "collection");
        setTemplateLabel(data.templateLabel ?? "Collection pages");
        setTemplates(data.templates ?? []);
        setMatchedTemplateKey(data.matchedTemplateKey ?? null);
      } catch (err) {
        if (!cancelled) setLoadError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [handle]);

  /* ── Preview bridge ───────────────────────────────────────────── */

  const pushToPreview = useCallback(
    (next: CollectionSectionsConfig | null) => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: PREVIEW_MESSAGES.collectionSections, handle, config: next },
        window.location.origin
      );
    },
    [handle]
  );

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if ((event.data as { type?: string })?.type === PREVIEW_MESSAGES.ready) {
        pushToPreview(configRef.current);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [pushToPreview]);

  useEffect(() => {
    pushToPreview(config);
  }, [config, pushToPreview]);

  const scrollPreviewTo = useCallback((instanceId: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: PREVIEW_MESSAGES.scrollTo, sectionId: instanceId },
      window.location.origin
    );
  }, []);

  /* ── Leaving with unsaved work ────────────────────────────────── */

  useEffect(() => {
    if (!edited) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      // Nothing reaches Shopify until Save, so a closed tab really does lose it.
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [edited]);

  const leaveGuard = useCallback(
    (message: string) => !edited || window.confirm(message),
    [edited]
  );

  /* ── Editing ──────────────────────────────────────────────────── */

  const mutate = (
    change: (current: CollectionSectionsConfig) => CollectionSectionsConfig
  ) => {
    setConfig((prev) => (prev ? change(prev) : prev));
  };

  const updateInstanceField = (
    instanceId: string,
    fieldKey: string,
    value: unknown
  ) => {
    mutate((current) => ({
      ...current,
      instances: {
        ...current.instances,
        [instanceId]: {
          ...current.instances[instanceId],
          settings: {
            ...current.instances[instanceId].settings,
            [fieldKey]: value,
          },
        },
      },
    }));
  };

  const toggleInstance = (instanceId: string) => {
    mutate((current) => ({
      ...current,
      instances: {
        ...current.instances,
        [instanceId]: {
          ...current.instances[instanceId],
          enabled: !current.instances[instanceId].enabled,
        },
      },
    }));
  };

  const removeInstance = (instanceId: string) => {
    mutate((current) => {
      const instances = { ...current.instances };
      delete instances[instanceId];
      return {
        ...current,
        instances,
        order: current.order.filter((id) => id !== instanceId),
      };
    });
    setPanel({ kind: "sections" });
  };

  const addSection = (sectionType: string) => {
    const def = SECTION_REGISTRY[sectionType];
    if (!def || !config) return;

    const id = newCollectionInstanceId(
      sectionType,
      new Set(Object.keys(config.instances))
    );
    const instance: SectionInstance = {
      id,
      type: sectionType,
      enabled: true,
      settings: structuredClone(def.defaults),
    };

    mutate((current) => ({
      ...current,
      instances: { ...current.instances, [id]: instance },
      order: [...current.order, id],
    }));
    setPanel({ kind: "instance", id });
  };

  const setOrder = useCallback((order: string[]) => {
    setConfig((prev) => (prev ? { ...prev, order } : prev));
  }, []);

  const orderedIds = useMemo(() => config?.order ?? [], [config]);
  const { overIndex, dragIndex, itemProps, handleProps } = useDragList(
    orderedIds,
    setOrder
  );

  /* ── Saving ───────────────────────────────────────────────────── */

  const save = async () => {
    if (!config) return;
    setBusy(true);
    setSaveState("saving");
    setErrorMessage(null);
    setWarning(null);

    try {
      const res = await fetch(
        `/api/admin/collections/${encodeURIComponent(handle)}/sections`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ config }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save.");

      setSavedConfig(config);
      setHasLayout(true);
      setSavedAt(data.updatedAt ?? new Date().toISOString());
      setSaveState("saved");
      if (data.warning) setWarning(data.warning);
    } catch (err) {
      setSaveState("error");
      setErrorMessage((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const resetToTheme = async () => {
    if (
      !window.confirm(
        `Remove this collection's own layout? “${title}” will go back to following the theme's ${templateLabel} template, and the saved copy is deleted from Shopify.`
      )
    ) {
      return;
    }

    setBusy(true);
    setSaveState("saving");
    setErrorMessage(null);
    setWarning(null);

    try {
      const res = await fetch(
        `/api/admin/collections/${encodeURIComponent(handle)}/sections`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not reset.");

      setBaseline(data.config);
      setConfig(data.config);
      setSavedConfig(null);
      setHasLayout(false);
      if (data.templateKey) setTemplateKey(data.templateKey);
      if (data.templateLabel) setTemplateLabel(data.templateLabel);
      setSavedAt(null);
      setSaveState("idle");
      setPanel({ kind: "sections" });
    } catch (err) {
      setSaveState("error");
      setErrorMessage((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /**
   * Replace the working layout with a copy of a theme template's sections.
   *
   * A copy, not an assignment: after saving, the collection owns these sections
   * outright and later edits to the template won't reach it. That's the whole
   * point of per-collection layouts, but it's the opposite of what "template"
   * implies elsewhere, so the UI says "start over from" rather than "use".
   */
  const applyTemplate = async (key: string) => {
    const option = templates.find((t) => t.key === key);
    if (!option || busy) return;
    if (
      edited &&
      !window.confirm(
        `Replace the sections on screen with a copy of “${option.label}”? Your unsaved changes are lost.`
      )
    ) {
      return;
    }

    setBusy(true);
    setErrorMessage(null);
    try {
      const res = await fetch(
        `/api/admin/collections/${encodeURIComponent(handle)}/sections?template=${encodeURIComponent(key)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load that template.");

      setConfig(data.config);
      setTemplateKey(data.templateKey ?? key);
      setTemplateLabel(data.templateLabel ?? option.label);
      setPanel({ kind: "sections" });
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const discard = () => {
    const target = savedConfig ?? baseline;
    if (!target) return;
    if (
      !window.confirm(
        savedConfig
          ? "Discard every change made since the last save?"
          : "Discard your changes and go back to the theme template's sections?"
      )
    ) {
      return;
    }
    setConfig(target);
    setPanel({ kind: "sections" });
    setSaveState("idle");
  };

  /* ── Render ───────────────────────────────────────────────────── */

  const previewSrc = `/collections/${encodeURIComponent(handle)}?${PREVIEW_PARAM}=1`;
  const activeInstance =
    panel.kind === "instance" ? config?.instances[panel.id] : undefined;
  const activeDef = activeInstance
    ? SECTION_REGISTRY[activeInstance.type]
    : undefined;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100">
      {/* ── Top bar ───────────────────────────────────────────────── */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Link
            href="/admin/collections"
            onClick={(event) => {
              if (!leaveGuard("Leave without saving? Your changes will be lost.")) {
                event.preventDefault();
              }
            }}
            title="All collections"
            className="shrink-0 cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="w-60 shrink-0">
            <CollectionSwitcher
              handle={handle}
              title={title}
              onNavigate={(next) => {
                if (!leaveGuard("Leave without saving? Your changes will be lost.")) {
                  return;
                }
                window.location.href = `/admin/collections/${encodeURIComponent(next)}`;
              }}
            />
          </div>

          <span
            className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-black uppercase tracking-wide lg:inline-block ${
              hasLayout
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {hasLayout ? "Custom layout" : "Theme default"}
          </span>
        </div>

        <div className="hidden items-center gap-0.5 rounded-lg bg-slate-100 p-0.5 md:flex">
          {(Object.keys(DEVICES) as DeviceKey[]).map((key) => {
            const { label, icon: Icon } = DEVICES[key];
            const active = device === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setDevice(key)}
                aria-pressed={active}
                title={label}
                className={`cursor-pointer rounded-md px-2.5 py-1.5 transition-colors ${
                  active
                    ? "bg-white text-orange-600 shadow-xs"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <SaveIndicator
            state={saveState}
            edited={edited}
            hasLayout={hasLayout}
            savedAt={savedAt}
          />

          <a
            href={`/collections/${encodeURIComponent(handle)}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open the live page in a new tab"
            className="hidden cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 sm:block"
          >
            <ExternalLink className="h-4 w-4" />
          </a>

          {hasLayout && (
            <button
              type="button"
              onClick={resetToTheme}
              disabled={busy}
              title="Delete this collection's layout and follow the theme template again"
              className="hidden cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-bold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 lg:inline-flex"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          )}

          <button
            type="button"
            onClick={discard}
            disabled={busy || !edited}
            className="hidden cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-bold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:inline-flex"
          >
            <Undo2 className="h-3.5 w-3.5" />
            Discard
          </button>

          <button
            type="button"
            onClick={save}
            disabled={busy || !canSave}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-1.5 text-[12px] font-black uppercase tracking-wide text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            Save
          </button>

          <AdminUserMenu user={user} />
        </div>
      </header>

      {errorMessage && (
        <div className="flex shrink-0 items-center gap-2 border-b border-red-200 bg-red-50 px-4 py-2 text-[12px] font-semibold text-red-700">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {errorMessage}
        </div>
      )}
      {warning && (
        <div className="flex shrink-0 items-start gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-[12px] font-semibold text-amber-800">
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
          {warning}
        </div>
      )}

      {/* ── Body ──────────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[340px] shrink-0 flex-col border-r border-slate-200 bg-white">
          {loading ? (
            <p className="flex flex-1 items-center justify-center gap-2 text-[12.5px] font-semibold text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading from Shopify…
            </p>
          ) : loadError ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-[12.5px] font-semibold text-slate-600">{loadError}</p>
              <Link
                href="/admin/collections"
                className="text-[12px] font-bold text-orange-600 hover:underline"
              >
                Back to all collections
              </Link>
            </div>
          ) : panel.kind === "instance" && activeInstance && activeDef ? (
            <>
              <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 px-3 py-2.5">
                <button
                  type="button"
                  onClick={() => setPanel({ kind: "sections" })}
                  className="cursor-pointer rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Back to sections"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <h2 className="min-w-0 flex-1 truncate text-[13px] font-black text-slate-800">
                  {activeDef.label}
                </h2>
                {!activeDef.required && (
                  <button
                    type="button"
                    onClick={() => toggleInstance(activeInstance.id)}
                    title={activeInstance.enabled ? "Hide section" : "Show section"}
                    className="cursor-pointer rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    {activeInstance.enabled ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-slate-300" />
                    )}
                  </button>
                )}
              </div>

              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3.5 py-4">
                <p className="text-[11px] leading-relaxed text-slate-400">
                  {activeDef.description}
                </p>

                {activeDef.contentInCode && activeDef.fields.length > 0 && (
                  <p className="rounded-lg border border-dashed border-slate-200 px-3 py-2.5 text-[11px] leading-relaxed text-slate-400">
                    This section&apos;s body is built from live store data. The
                    settings below control its wording.
                  </p>
                )}

                {activeDef.fields.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-[12px] leading-relaxed text-slate-400">
                    This section has no editable content. You can still reorder or
                    hide it.
                  </p>
                ) : (
                  activeDef.fields.map((field) => (
                    <FieldRenderer
                      key={field.key}
                      field={field}
                      values={activeInstance.settings}
                      onChange={(key, value) =>
                        updateInstanceField(activeInstance.id, key, value)
                      }
                    />
                  ))
                )}

                {!activeDef.required && (
                  <button
                    type="button"
                    onClick={() => removeInstance(activeInstance.id)}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove section
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="shrink-0 border-b border-slate-200 px-3.5 py-2.5">
                <h2 className="text-[13px] font-black text-slate-800">Sections</h2>
                <p className="text-[11px] text-slate-400">
                  Drag to reorder · click to edit
                </p>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-2">
                {!hasLayout && (
                  <p className="mb-2 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-2 text-[11px] leading-snug text-sky-800">
                    Starting from the theme&apos;s{" "}
                    <strong className="font-bold">{templateLabel}</strong> template,
                    with the sections that apply to this collection. Save to give{" "}
                    <strong className="font-bold">{title}</strong> its own layout —
                    other collections keep following the theme.
                  </p>
                )}

                <div className="mb-2 rounded-lg border border-slate-200 px-2.5 py-2">
                  <label
                    htmlFor="start-from-template"
                    className="block text-[10px] font-black uppercase tracking-wider text-slate-400"
                  >
                    Start over from a template
                  </label>
                  <select
                    id="start-from-template"
                    value={templateKey}
                    disabled={busy || templates.length === 0}
                    onChange={(event) => void applyTemplate(event.target.value)}
                    className="mt-1 w-full cursor-pointer rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[12.5px] font-semibold text-slate-700 outline-none transition-colors hover:border-slate-300 focus:border-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {templates.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label}
                        {option.key === matchedTemplateKey ? "  (this collection)" : ""}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[10.5px] leading-snug text-slate-400">
                    Copies that template&apos;s sections in, replacing what&apos;s
                    below. Editing them here only ever changes this collection.
                  </p>
                </div>

                <div className="space-y-1">
                  {orderedIds.map((id, index) => {
                    const instance = config?.instances[id];
                    if (!instance) return null;
                    const def = SECTION_REGISTRY[instance.type];
                    if (!def) return null;

                    const isActive = panel.kind === "instance" && panel.id === id;
                    // The product grid is rendered by the page above everything
                    // else, so it neither drags nor accepts a drop — offering a
                    // handle that can't move it would be a lie.
                    const fixed = Boolean(def.required);

                    return (
                      <div
                        key={id}
                        {...(fixed ? {} : itemProps(index))}
                        className={`flex items-center gap-1 rounded-lg border transition-colors ${
                          !fixed &&
                          overIndex === index &&
                          dragIndex !== null &&
                          dragIndex !== index
                            ? "border-orange-400"
                            : isActive
                              ? "border-orange-300 bg-orange-50/60"
                              : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                        } ${dragIndex === index ? "opacity-50" : ""}`}
                      >
                        {fixed ? (
                          <span
                            title="The product grid always sits at the top of the page."
                            className="p-1.5 text-slate-200"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <span
                            {...handleProps(index)}
                            className="cursor-grab rounded p-1.5 text-slate-300 transition-colors hover:text-slate-500 active:cursor-grabbing"
                            aria-label={`Reorder ${def.label}`}
                          >
                            <GripVertical className="h-3.5 w-3.5" />
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setPanel({ kind: "instance", id });
                            scrollPreviewTo(id);
                          }}
                          className="min-w-0 flex-1 cursor-pointer py-2 text-left"
                        >
                          <span
                            className={`block truncate text-[13px] font-bold ${
                              instance.enabled ? "text-slate-700" : "text-slate-300"
                            }`}
                          >
                            {def.label}
                          </span>
                        </button>

                        {fixed ? (
                          <span
                            title="The product grid is the collection page — it can't be hidden or moved."
                            className="p-1.5 text-slate-300"
                          >
                            <Lock className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleInstance(id)}
                            title={instance.enabled ? "Hide section" : "Show section"}
                            className="cursor-pointer rounded p-1.5 text-slate-300 transition-colors hover:text-slate-600"
                          >
                            {instance.enabled ? (
                              <Eye className="h-3.5 w-3.5" />
                            ) : (
                              <EyeOff className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <AddSectionMenu templateType="collection" onAdd={addSection} />
                </div>

                <p className="px-1 pb-1 pt-4 text-[10.5px] leading-relaxed text-slate-400">
                  Saved on the collection in Shopify as{" "}
                  <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[10px] text-slate-500">
                    custom.page_sections
                  </code>
                  . Header, footer and every other page stay with the theme
                  customizer.
                </p>
              </div>
            </>
          )}
        </aside>

        {/* ── Preview ─────────────────────────────────────────────── */}
        <main className="min-w-0 flex-1 overflow-hidden bg-slate-200/70 p-3">
          <div
            className="mx-auto h-full overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300"
            style={{ width: DEVICES[device].width, maxWidth: "100%" }}
          >
            <iframe
              ref={iframeRef}
              src={previewSrc}
              title={`${title} preview`}
              className="h-full w-full border-0"
            />
          </div>
        </main>
      </div>
    </div>
  );
};
