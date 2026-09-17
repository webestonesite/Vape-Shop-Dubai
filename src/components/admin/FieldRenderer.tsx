"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  Copy,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";

import type { FieldDef, RepeaterFieldDef } from "@/lib/theme/field-types";

import {
  ArticleInput,
  CollectionInput,
  ColorInput,
  DateTimeInput,
  IconInput,
  ImageInput,
  NumberInput,
  SelectInput,
  TextAreaInput,
  TextInput,
  ToggleInput,
} from "./fields";
import { useDragList } from "./use-drag-list";

type Values = Record<string, unknown>;

interface FieldRendererProps {
  field: FieldDef;
  /** The object this field's `key` is read from and written back into. */
  values: Values;
  onChange: (key: string, value: unknown) => void;
}

/* ── Repeater ─────────────────────────────────────────────────────── */

const RepeaterField: React.FC<{
  field: RepeaterFieldDef;
  items: Values[];
  onChange: (items: Values[]) => void;
}> = ({ field, items, onChange }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { overIndex, dragIndex, itemProps, handleProps } = useDragList(items, onChange);

  const atMin = items.length <= (field.min ?? 0);
  const atMax = items.length >= (field.max ?? Number.POSITIVE_INFINITY);

  const updateItem = (index: number, key: string, value: unknown) => {
    onChange(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
    setOpenIndex(null);
  };

  const duplicateItem = (index: number) => {
    const next = [...items];
    next.splice(index + 1, 0, structuredClone(items[index]));
    onChange(next);
    setOpenIndex(index + 1);
  };

  const addItem = () => {
    onChange([...items, structuredClone(field.defaultItem) as Values]);
    setOpenIndex(items.length);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {field.label}
        </span>
        <span className="text-[11px] font-semibold text-slate-400">
          {items.length}
          {field.max ? ` / ${field.max}` : ""}
        </span>
      </div>
      {field.help && <p className="text-[11px] text-slate-400">{field.help}</p>}

      <div className="space-y-1.5">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          const title = String(item[field.itemLabelKey] ?? "").trim();

          return (
            <div
              key={index}
              {...itemProps(index)}
              className={`overflow-hidden rounded-lg border bg-white transition-colors ${
                overIndex === index && dragIndex !== null && dragIndex !== index
                  ? "border-orange-400"
                  : "border-slate-200"
              } ${dragIndex === index ? "opacity-50" : ""}`}
            >
              <div className="flex items-center gap-1 px-1.5 py-1.5">
                <span
                  {...handleProps(index)}
                  className="cursor-grab rounded p-1 text-slate-300 transition-colors hover:text-slate-500 active:cursor-grabbing"
                  aria-label={`Reorder ${field.itemNoun} ${index + 1}`}
                >
                  <GripVertical className="h-3.5 w-3.5" />
                </span>

                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded px-1 py-1 text-left"
                >
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                  <span className="truncate text-[13px] font-semibold text-slate-700">
                    {title || `${field.itemNoun} ${index + 1}`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => duplicateItem(index)}
                  disabled={atMax}
                  aria-label={`Duplicate ${field.itemNoun} ${index + 1}`}
                  className="cursor-pointer rounded p-1.5 text-slate-300 transition-colors hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={atMin}
                  aria-label={`Delete ${field.itemNoun} ${index + 1}`}
                  className="cursor-pointer rounded p-1.5 text-slate-300 transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {isOpen && (
                <div className="space-y-3 border-t border-slate-100 bg-slate-50/60 px-3 py-3">
                  {field.fields.map((subField) => (
                    <FieldRenderer
                      key={subField.key}
                      field={subField}
                      values={item}
                      onChange={(key, value) => updateItem(index, key, value)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addItem}
        disabled={atMax}
        className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2 text-[12px] font-bold text-slate-500 transition-colors hover:border-orange-400 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="h-3.5 w-3.5" />
        Add {field.itemNoun}
      </button>
    </div>
  );
};

/* ── Dispatcher ───────────────────────────────────────────────────── */

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  values,
  onChange,
}) => {
  // A field gated on a sibling's value simply isn't rendered when the gate
  // is closed; its stored value is left untouched so switching back restores it.
  if (field.showIf) {
    const gate = String(values[field.showIf.key] ?? "");
    if (!field.showIf.equals.includes(gate)) return null;
  }

  const raw = values[field.key];

  switch (field.type) {
    case "text":
      return (
        <TextInput
          label={field.label}
          help={field.help}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          value={String(raw ?? "")}
          onChange={(value) => onChange(field.key, value)}
        />
      );

    case "textarea":
      return (
        <TextAreaInput
          label={field.label}
          help={field.help}
          placeholder={field.placeholder}
          rows={field.rows}
          maxLength={field.maxLength}
          value={String(raw ?? "")}
          onChange={(value) => onChange(field.key, value)}
        />
      );

    // Multi-paragraph body copy. Still a plain textarea — merchant copy is
    // rendered as text nodes, never as HTML — just a taller one by default.
    case "richtext":
      return (
        <TextAreaInput
          label={field.label}
          help={field.help}
          placeholder={field.placeholder}
          rows={field.rows ?? 8}
          value={String(raw ?? "")}
          onChange={(value) => onChange(field.key, value)}
        />
      );

    case "link":
      return (
        <TextInput
          label={field.label}
          help={field.help}
          placeholder={field.placeholder ?? "/collections/..."}
          value={String(raw ?? "")}
          onChange={(value) => onChange(field.key, value)}
        />
      );

    case "image":
      return (
        <ImageInput
          label={field.label}
          help={field.help}
          placeholder={field.placeholder}
          value={String(raw ?? "")}
          onChange={(value) => onChange(field.key, value)}
        />
      );

    case "toggle":
      return (
        <ToggleInput
          label={field.label}
          help={field.help}
          value={Boolean(raw)}
          onChange={(value) => onChange(field.key, value)}
        />
      );

    case "select":
      return (
        <SelectInput
          label={field.label}
          help={field.help}
          options={field.options}
          value={String(raw ?? field.options[0]?.value ?? "")}
          onChange={(value) => onChange(field.key, value)}
        />
      );

    case "collection":
      return (
        <CollectionInput
          label={field.label}
          help={field.help}
          placeholder={field.placeholder}
          value={String(raw ?? "")}
          onChange={(value) => onChange(field.key, value)}
        />
      );

    case "articles":
      return (
        <ArticleInput
          label={field.label}
          help={field.help}
          placeholder={field.placeholder}
          value={String(raw ?? "")}
          onChange={(value) => onChange(field.key, value)}
        />
      );

    case "datetime":
      return (
        <DateTimeInput
          label={field.label}
          help={field.help}
          value={String(raw ?? "")}
          onChange={(value) => onChange(field.key, value)}
        />
      );

    case "color":
      return (
        <ColorInput
          label={field.label}
          help={field.help}
          value={String(raw ?? "")}
          onChange={(value) => onChange(field.key, value)}
        />
      );

    case "icon":
      return (
        <IconInput
          label={field.label}
          help={field.help}
          value={String(raw ?? "")}
          onChange={(value) => onChange(field.key, value)}
        />
      );

    case "number":
      return (
        <NumberInput
          label={field.label}
          help={field.help}
          min={field.min}
          max={field.max}
          step={field.step}
          suffix={field.suffix}
          value={Number(raw ?? 0)}
          onChange={(value) => onChange(field.key, value)}
        />
      );

    case "repeater":
      return (
        <RepeaterField
          field={field}
          items={Array.isArray(raw) ? (raw as Values[]) : []}
          onChange={(items) => onChange(field.key, items)}
        />
      );

    default:
      return null;
  }
};
