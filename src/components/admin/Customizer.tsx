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
  ExternalLink,
  Eye,
  EyeOff,
  GripVertical,
  Info,
  Layers,
  Loader2,
  Lock,
  MessageSquare,
  Monitor,
  PanelsTopLeft,
  RotateCcw,
  Smartphone,
  Tablet,
  Trash2,
  Undo2,
} from "lucide-react";

import { ReviewsManagerDialog } from "./ReviewsManagerDialog";

import {
  PREVIEW_MESSAGES,
  PREVIEW_PARAM,
} from "@/context/ThemeSettingsContext";
import type { PublicUser } from "@/lib/auth/users";
import {
  CONDITION_LABELS,
  MERCHANT_CONDITION_PRIORITY,
} from "@/lib/theme/conditions";
import { SECTION_REGISTRY } from "@/lib/theme/sections";
import {
  describeMatch,
  templateKeyForMatch,
  templateMatch,
  type SectionInstance,
  type Template,
  type TemplateMatch,
  type ThemeSettings,
} from "@/lib/theme/types";

import { AddSectionMenu } from "./AddSectionMenu";
import { AdminUserMenu } from "./AdminUserMenu";
import { FieldRenderer } from "./FieldRenderer";
import { HeaderFooterPanel } from "./HeaderFooterPanel";
import { TemplatePicker } from "./TemplatePicker";
import { TemplateRuleDialog } from "./TemplateRuleDialog";
import { useDragList } from "./use-drag-list";

const DEVICES = {
  desktop: { label: "Desktop", icon: Monitor, width: "100%" },
  tablet: { label: "Tablet", icon: Tablet, width: "834px" },
  mobile: { label: "Mobile", icon: Smartphone, width: "390px" },
} as const;

type DeviceKey = keyof typeof DEVICES;
type SaveState = "idle" | "saving" | "saved" | "error";
/** Which editor the sidebar is showing. */
type Panel =
  | { kind: "sections" }
  | { kind: "instance"; id: string }
  | { kind: "header" }
  | { kind: "footer" };

const AUTOSAVE_DELAY_MS = 1200;

function sameSettings(a: ThemeSettings, b: ThemeSettings): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Readable, collision-resistant instance id without pulling in a uuid dep. */
function newInstanceId(type: string, taken: Set<string>): string {
  let n = 1;
  let id = `${type}-${n}`;
  while (taken.has(id)) {
    n += 1;
    id = `${type}-${n}`;
  }
  return id;
}

export const Customizer: React.FC<{
  user: PublicUser;
  initialDraft: ThemeSettings;
  initialPublished: ThemeSettings;
}> = ({ user, initialDraft, initialPublished }) => {
  const [settings, setSettings] = useState<ThemeSettings>(initialDraft);
  const [published, setPublished] = useState<ThemeSettings>(initialPublished);
  const [templateKey, setTemplateKey] = useState("index");
  const [panel, setPanel] = useState<Panel>({ kind: "sections" });
  const [device, setDevice] = useState<DeviceKey>("desktop");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [ruleDialogFor, setRuleDialogFor] = useState<"collection" | "product" | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);

  // Lets the long-lived `message` listener read the newest settings without
  // resubscribing on every keystroke.
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // The storefront's age gate is a fixed overlay that would otherwise cover
  // the preview. Admin and storefront share an origin, so setting the flag
  // here also satisfies the gate inside the iframe.
  useEffect(() => {
    try {
      localStorage.setItem("vapedubai_age_verified", "true");
    } catch {
      // Storage disabled (private browsing) — the gate stays. Inconvenient,
      // not broken.
    }
  }, []);

  const template: Template | undefined = settings.templates[templateKey];
  // Templates with a URL rule are overrides: their sections render
  // unconditionally, so the “conditional” hints don't apply.
  const templateRule = template ? templateMatch(template) : undefined;

  const hasUnpublished = useMemo(
    () => !sameSettings(settings, published),
    [settings, published]
  );

  /* ── Preview bridge ─────────────────────────────────────────────── */

  const pushToPreview = useCallback((next: ThemeSettings) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: PREVIEW_MESSAGES.settings, settings: next },
      window.location.origin
    );
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if ((event.data as { type?: string })?.type === PREVIEW_MESSAGES.ready) {
        pushToPreview(settingsRef.current);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [pushToPreview]);

  useEffect(() => {
    pushToPreview(settings);
  }, [settings, pushToPreview]);

  const scrollPreviewTo = useCallback((instanceId: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: PREVIEW_MESSAGES.scrollTo, sectionId: instanceId },
      window.location.origin
    );
  }, []);

  /* ── Persistence ────────────────────────────────────────────────── */

  const saveDraft = useCallback(async (next: ThemeSettings) => {
    setSaveState("saving");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save.");
      setSaveState("saved");
    } catch (err) {
      setSaveState("error");
      setErrorMessage((err as Error).message);
    }
  }, []);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => void saveDraft(settings), AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [settings, saveDraft]);

  const runAction = async (
    action: "publish" | "discard" | "reset",
    confirmMessage?: string
  ) => {
    if (confirmMessage && !window.confirm(confirmMessage)) return;

    setPublishing(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          settings: action === "publish" ? settings : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Action failed.");

      if (data.draft?.settings) setSettings(data.draft.settings);
      if (data.published?.settings) setPublished(data.published.settings);
      setSaveState("saved");
      setPanel({ kind: "sections" });
    } catch (err) {
      setSaveState("error");
      setErrorMessage((err as Error).message);
    } finally {
      setPublishing(false);
    }
  };

  /* ── Template editing ───────────────────────────────────────────── */

  const updateTemplate = (key: string, mutate: (t: Template) => Template) => {
    setSettings((prev) => {
      const current = prev.templates[key];
      if (!current) return prev;
      return {
        ...prev,
        templates: { ...prev.templates, [key]: mutate(current) },
      };
    });
  };

  const updateInstanceField = (instanceId: string, fieldKey: string, value: unknown) => {
    updateTemplate(templateKey, (t) => ({
      ...t,
      instances: {
        ...t.instances,
        [instanceId]: {
          ...t.instances[instanceId],
          settings: { ...t.instances[instanceId].settings, [fieldKey]: value },
        },
      },
    }));
  };

  const toggleInstance = (instanceId: string) => {
    updateTemplate(templateKey, (t) => ({
      ...t,
      instances: {
        ...t.instances,
        [instanceId]: {
          ...t.instances[instanceId],
          enabled: !t.instances[instanceId].enabled,
        },
      },
    }));
  };

  const removeInstance = (instanceId: string) => {
    updateTemplate(templateKey, (t) => {
      const instances = { ...t.instances };
      delete instances[instanceId];
      return { ...t, instances, order: t.order.filter((id) => id !== instanceId) };
    });
    setPanel({ kind: "sections" });
  };

  const addSection = (sectionType: string) => {
    const def = SECTION_REGISTRY[sectionType];
    if (!def || !template) return;

    const id = newInstanceId(sectionType, new Set(Object.keys(template.instances)));
    const instance: SectionInstance = {
      id,
      type: sectionType,
      enabled: true,
      settings: structuredClone(def.defaults),
    };

    updateTemplate(templateKey, (t) => ({
      ...t,
      instances: { ...t.instances, [id]: instance },
      order: [...t.order, id],
    }));
    setPanel({ kind: "instance", id });
  };

  const setOrder = (order: string[]) => {
    updateTemplate(templateKey, (t) => ({ ...t, order }));
  };

  /**
   * Create a template driven by a URL rule, seeded from the type default so
   * the merchant starts from what that page already looks like.
   */
  const createRuleTemplate = (
    type: "collection" | "product",
    match: TemplateMatch,
    previewPath: string,
    label: string
  ) => {
    const base = settings.templates[type];
    if (!base) return;

    const key = templateKeyForMatch(type, match);
    setSettings((prev) => ({
      ...prev,
      templates: {
        ...prev.templates,
        [key]: {
          ...structuredClone(base),
          label,
          match,
          ...(match.type === "exact" ? { handle: match.value } : {}),
          // A family rule the merchant wrote is a deliberate choice, so it wins
          // wherever it overlaps one of the built-in family templates.
          ...(match.type === "condition"
            ? { priority: MERCHANT_CONDITION_PRIORITY }
            : {}),
          previewPath: previewPath || base.previewPath,
        },
      },
    }));
    setTemplateKey(key);
    setPanel({ kind: "sections" });
    setRuleDialogFor(null);
  };

  const deleteTemplate = (key: string) => {
    const t = settings.templates[key];
    const rule = t ? templateMatch(t) : undefined;
    if (!t || !rule) return;
    if (
      !window.confirm(
        `Delete "${t.label}" (${describeMatch(rule)})? Those pages will fall back to the default ${t.type} template.`
      )
    ) {
      return;
    }
    setSettings((prev) => {
      const templates = { ...prev.templates };
      delete templates[key];
      return { ...prev, templates };
    });
    if (templateKey === key) setTemplateKey(t.type);
    setPanel({ kind: "sections" });
  };

  const orderedIds = template?.order ?? [];
  const { overIndex, dragIndex, itemProps, handleProps } = useDragList(
    orderedIds,
    setOrder
  );

  /* ── Preview URL ────────────────────────────────────────────────── */

  const previewSrc = useMemo(() => {
    const path = template?.previewPath ?? "/";
    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}${PREVIEW_PARAM}=1`;
  }, [template?.previewPath]);

  const activeInstance =
    panel.kind === "instance" ? template?.instances[panel.id] : undefined;
  const activeDef = activeInstance
    ? SECTION_REGISTRY[activeInstance.type]
    : undefined;

  /* ── Render ─────────────────────────────────────────────────────── */

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100">
      {/* ── Top bar ───────────────────────────────────────────────── */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-[13px] font-black text-white">
            V
          </span>
          <div className="w-56 shrink-0">
            <TemplatePicker
              templates={settings.templates}
              activeKey={templateKey}
              onSelect={(key) => {
                setTemplateKey(key);
                setPanel({ kind: "sections" });
              }}
              onCreateOverride={setRuleDialogFor}
              onDeleteTemplate={deleteTemplate}
            />
          </div>
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

        <div className="flex items-center gap-2">
          <SaveIndicator state={saveState} hasUnpublished={hasUnpublished} />

          <a
            href={template?.previewPath ?? "/"}
            target="_blank"
            rel="noopener noreferrer"
            title="Open this page in a new tab"
            className="hidden cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 sm:block"
          >
            <ExternalLink className="h-4 w-4" />
          </a>

          <Link
            href="/admin/collections"
            title="Customise a single collection page, saved onto that collection in Shopify"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <Layers className="h-3.5 w-3.5 text-orange-500" />
            Collections
          </Link>

          <button
            type="button"
            onClick={() => setIsReviewsOpen(true)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:border-slate-300"
          >
            <MessageSquare className="h-3.5 w-3.5 text-amber-500" />
            Reviews
          </button>

          <button
            type="button"
            onClick={() =>
              runAction(
                "discard",
                "Discard all unpublished changes across every template and revert to the live version?"
              )
            }
            disabled={publishing || !hasUnpublished}
            className="hidden cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-bold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:inline-flex"
          >
            <Undo2 className="h-3.5 w-3.5" />
            Discard
          </button>

          <button
            type="button"
            onClick={() => runAction("publish")}
            disabled={publishing || !hasUnpublished}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-1.5 text-[12px] font-black uppercase tracking-wide text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {publishing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            Publish
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

      {/* ── Body ──────────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[340px] shrink-0 flex-col border-r border-slate-200 bg-white">
          {panel.kind === "instance" && activeInstance && activeDef ? (
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

                {activeInstance.showWhen && (
                  <div className="flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-2 text-[11px] leading-snug text-sky-800">
                    <Info className="mt-px h-3.5 w-3.5 shrink-0" />
                    <span>
                      {CONDITION_LABELS[activeInstance.showWhen] ??
                        "This section only appears on some pages."}{" "}
                      {templateRule
                        ? "It stays conditional inside this template because the family covers pages on both sides of that rule."
                        : "Create an override for a specific handle to control it directly."}
                    </span>
                  </div>
                )}

                {activeDef.contentInCode && activeDef.fields.length > 0 && (
                  <p className="rounded-lg border border-dashed border-slate-200 px-3 py-2.5 text-[11px] leading-relaxed text-slate-400">
                    This section&apos;s body is built from live store data. The
                    settings below control its wording.
                  </p>
                )}

                {activeDef.fields.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-[12px] leading-relaxed text-slate-400">
                    This section has no editable content.
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
          ) : panel.kind === "header" || panel.kind === "footer" ? (
            <HeaderFooterPanel
              which={panel.kind}
              settings={settings}
              onBack={() => setPanel({ kind: "sections" })}
              onChange={setSettings}
            />
          ) : (
            <>
              <div className="shrink-0 border-b border-slate-200 px-3.5 py-2.5">
                <h2 className="text-[13px] font-black text-slate-800">Sections</h2>
                <p className="text-[11px] text-slate-400">
                  Drag to reorder · click to edit
                </p>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-2">
                {/* Shared across every page */}
                <p className="px-1 pb-1 pt-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  All pages
                </p>
                {(["header", "footer"] as const).map((which) => (
                  <button
                    key={which}
                    type="button"
                    onClick={() => setPanel({ kind: which })}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-transparent px-2 py-2 text-left transition-colors hover:border-slate-200 hover:bg-slate-50"
                  >
                    <PanelsTopLeft className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[13px] font-bold capitalize text-slate-700">
                      {which}
                    </span>
                  </button>
                ))}

                <p className="px-1 pb-1 pt-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {template?.label ?? "Template"}
                </p>

                <div className="space-y-1">
                  {orderedIds.map((id, index) => {
                    const instance = template?.instances[id];
                    if (!instance) return null;
                    const def = SECTION_REGISTRY[instance.type];
                    if (!def) return null;

                    return (
                      <div
                        key={id}
                        {...itemProps(index)}
                        className={`flex items-center gap-1 rounded-lg border transition-colors ${
                          overIndex === index && dragIndex !== null && dragIndex !== index
                            ? "border-orange-400 bg-orange-50/40"
                            : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                        } ${dragIndex === index ? "opacity-50" : ""}`}
                      >
                        <span
                          {...handleProps(index)}
                          className="cursor-grab rounded p-1.5 text-slate-300 transition-colors hover:text-slate-500 active:cursor-grabbing"
                          aria-label={`Reorder ${def.label}`}
                        >
                          <GripVertical className="h-3.5 w-3.5" />
                        </span>

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
                          {instance.showWhen && !templateRule && (
                            <span className="block truncate text-[10px] font-semibold text-sky-600">
                              conditional
                            </span>
                          )}
                        </button>

                        {def.required ? (
                          <span
                            title="This section is required on this template"
                            className="p-1.5 text-slate-300"
                          >
                            <Lock className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleInstance(id)}
                            title={instance.enabled ? "Hide section" : "Show section"}
                            className="cursor-pointer rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                          >
                            {instance.enabled ? (
                              <Eye className="h-3.5 w-3.5" />
                            ) : (
                              <EyeOff className="h-3.5 w-3.5 text-slate-300" />
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {template && (
                  <div className="pt-2">
                    <AddSectionMenu templateType={template.type} onAdd={addSection} />
                  </div>
                )}
              </div>

              <div className="shrink-0 border-t border-slate-200 p-2.5">
                <button
                  type="button"
                  onClick={() =>
                    runAction(
                      "reset",
                      "Restore every template, plus the header and footer, to their original content? This affects the draft only — you still need to publish."
                    )
                  }
                  disabled={publishing}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset to defaults
                </button>
              </div>
            </>
          )}
        </aside>

        <main className="min-w-0 flex-1 overflow-auto bg-slate-200/70 p-4">
          <div
            className="mx-auto h-full overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm transition-[width] duration-300"
            style={{ width: DEVICES[device].width, maxWidth: "100%" }}
          >
            <iframe
              // Remount when the template changes so the frame navigates to
              // that template's preview URL.
              key={previewSrc}
              ref={iframeRef}
              src={previewSrc}
              title="Storefront preview"
              className="h-full w-full border-0"
            />
          </div>
        </main>
      </div>

      {ruleDialogFor && (
        <TemplateRuleDialog
          type={ruleDialogFor}
          templates={settings.templates}
          menu={settings.header.menu}
          onCancel={() => setRuleDialogFor(null)}
          onCreate={(match, previewPath, label) =>
            createRuleTemplate(ruleDialogFor, match, previewPath, label)
          }
        />
      )}

      <ReviewsManagerDialog
        isOpen={isReviewsOpen}
        onClose={() => setIsReviewsOpen(false)}
      />
    </div>
  );
};

/* ── Save status pill ─────────────────────────────────────────────── */

const SaveIndicator: React.FC<{ state: SaveState; hasUnpublished: boolean }> = ({
  state,
  hasUnpublished,
}) => {
  if (state === "saving") {
    return (
      <span className="hidden items-center gap-1.5 text-[11px] font-bold text-slate-400 sm:inline-flex">
        <Loader2 className="h-3 w-3 animate-spin" />
        Saving…
      </span>
    );
  }
  if (state === "error") {
    return (
      <span className="hidden items-center gap-1.5 text-[11px] font-bold text-red-600 sm:inline-flex">
        <AlertCircle className="h-3 w-3" />
        Not saved
      </span>
    );
  }
  if (hasUnpublished) {
    return (
      <span className="hidden items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 sm:inline-flex">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Unpublished changes
      </span>
    );
  }
  return (
    <span className="hidden items-center gap-1.5 text-[11px] font-bold text-emerald-600 sm:inline-flex">
      <Check className="h-3 w-3" />
      Live
    </span>
  );
};
