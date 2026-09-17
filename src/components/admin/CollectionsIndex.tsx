"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Layers,
  Loader2,
  Search,
} from "lucide-react";

import type { PublicUser } from "@/lib/auth/users";

import { AdminUserMenu } from "./AdminUserMenu";

export interface CollectionRow {
  handle: string;
  title: string;
  productsCount: number | null;
  customized: boolean;
  updatedAt: string | null;
}

/** "3 days ago" — enough precision for a list of edit times. */
export function relativeTime(iso: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 60) return "just now";

  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.35, "week"],
    [12, "month"],
  ];

  let value = seconds / 60;
  let unit: Intl.RelativeTimeFormatUnit = "minute";
  for (const [step, next] of units) {
    if (Math.abs(value) < step) break;
    value /= step;
    unit = next;
  }

  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    -Math.round(value),
    unit
  );
}

/**
 * Picks the collection to customise.
 *
 * Collections that already carry their own layout are flagged and sorted first,
 * so the page doubles as the list of what has been customised — the question
 * merchants actually ask ("which ones have I already done?").
 */
export const CollectionsIndex: React.FC<{ user: PublicUser }> = ({ user }) => {
  const [rows, setRows] = useState<CollectionRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/admin/collections?sections=1");
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error ?? "Could not load collections.");
        setRows(data.collections ?? []);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = (rows ?? []).filter(
      (row) =>
        !needle ||
        row.title.toLowerCase().includes(needle) ||
        row.handle.toLowerCase().includes(needle)
    );
    // Customised first, then alphabetically — Shopify already sorted by title.
    return [...matches].sort(
      (a, b) => Number(b.customized) - Number(a.customized)
    );
  }, [rows, query]);

  const customizedCount = (rows ?? []).filter((row) => row.customized).length;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100">
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/admin"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-[12px] font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Theme customizer
          </Link>
          <span className="h-5 w-px bg-slate-200" />
          <h1 className="truncate text-[13px] font-black text-slate-800">
            Collection pages
          </h1>
        </div>
        <AdminUserMenu user={user} />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="mb-6">
            <h2 className="text-[20px] font-black tracking-tight text-slate-900">
              Customise a collection page
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
              Pick a collection to arrange its sections and edit their content.
              Each one is saved onto that collection in Shopify, so it stays with
              the collection and leaves every other page untouched.
            </p>
          </div>

          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search collections by name or handle…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-[13px] text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-orange-400"
            />
          </div>

          {rows && rows.length > 0 && (
            <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {customizedCount > 0
                ? `${customizedCount} customised · ${rows.length} collections`
                : `${rows.length} collections`}
            </p>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] font-semibold text-red-700">
              <AlertCircle className="mt-px h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {!rows && !error && (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-16 text-[13px] font-semibold text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading collections from Shopify…
            </div>
          )}

          {rows && filtered.length === 0 && !error && (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center text-[13px] text-slate-400">
              {rows.length === 0
                ? "No collections came back from Shopify. Check the store connection."
                : `Nothing matches “${query}”.`}
            </p>
          )}

          <div className="space-y-1.5">
            {filtered.map((row) => (
              <Link
                key={row.handle}
                href={`/admin/collections/${encodeURIComponent(row.handle)}`}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-colors hover:border-orange-300 hover:bg-orange-50/40"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    row.customized
                      ? "bg-orange-100 text-orange-600"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <Layers className="h-4 w-4" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-bold text-slate-800">
                    {row.title}
                  </span>
                  <span className="block truncate text-[11.5px] text-slate-400">
                    /collections/{row.handle}
                    {row.productsCount !== null && ` · ${row.productsCount} products`}
                  </span>
                </span>

                {row.customized ? (
                  <span className="hidden shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10.5px] font-black uppercase tracking-wide text-emerald-700 sm:inline-flex">
                    <Check className="h-3 w-3" />
                    Custom layout
                  </span>
                ) : (
                  <span className="hidden shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-slate-400 sm:inline-block">
                    Theme default
                  </span>
                )}

                <span className="hidden w-20 shrink-0 text-right text-[11px] text-slate-400 md:block">
                  {relativeTime(row.updatedAt)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
