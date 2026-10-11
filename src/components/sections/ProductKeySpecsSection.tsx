"use client";

import React from "react";
import { Cpu, ShieldCheck } from "lucide-react";
import { isInvalidValue } from "@/lib/shopify/smart-specs";

export interface SpecRow {
  feature: string;
  details: string;
}

interface ProductKeySpecsSectionProps {
  productName: string;
  category?: string;
  brand?: string;
  puffs?: string;
  nicotine?: string;
  battery?: string;
  specsTable?: SpecRow[] | Record<string, string>;
  className?: string;
  settings?: ProductKeySpecsSettings;
  hideIfEmpty?: boolean;
}

export interface ProductKeySpecsSettings {
  heading: string;
  /** `{product}` is replaced with the product name. */
  subheadingTemplate: string;
  /** Blank hides the badge. */
  badgeText: string;
  featureColumnLabel: string;
  detailsColumnLabel: string;
  /** Merchant-authored rows. Empty keeps the automatic table. */
  rows: SpecRow[];
}

/**
 * The table the section falls back to when neither the merchant nor Shopify
 * supplied rows — generates accurate category specifications.
 */
function autoRows(
  productName: string,
  category: string,
  brand: string,
  puffs: string,
  nicotine: string,
  battery: string
): SpecRow[] {
  const rows: SpecRow[] = [];
  if (brand && !isInvalidValue(brand)) rows.push({ feature: "Brand", details: brand });
  if (category && !isInvalidValue(category)) rows.push({ feature: "Product Category", details: category });
  if (puffs && !isInvalidValue(puffs)) rows.push({ feature: "Puff Count", details: puffs });
  if (nicotine && !isInvalidValue(nicotine)) rows.push({ feature: "Nicotine Strength", details: nicotine });
  if (battery && !isInvalidValue(battery)) rows.push({ feature: "Battery Capacity", details: battery });
  rows.push({ feature: "Authenticity", details: "100% Genuine UAE Verified" });
  return rows;
}

export function ProductKeySpecsSection({
  settings,
  productName,
  category = "",
  brand = "",
  puffs = "",
  nicotine = "",
  battery = "",
  specsTable,
  className = "",
  hideIfEmpty = false,
}: ProductKeySpecsSectionProps) {
  // Precedence: what the merchant typed in the customizer, then what Shopify
  // holds on the product, then the generated fallback.
  const authored = (settings?.rows ?? []).filter((row) => row.feature && row.details && !isInvalidValue(row.details));

  const hasShopifySpecs =
    (Array.isArray(specsTable) && specsTable.length > 0 && specsTable.some((r) => r.details && !isInvalidValue(r.details))) ||
    (specsTable && typeof specsTable === "object" && !Array.isArray(specsTable) && Object.keys(specsTable).length > 0);

  if (hideIfEmpty && !hasShopifySpecs && authored.length === 0) {
    return null;
  }

  let rawRows: SpecRow[];
  if (authored.length > 0) {
    rawRows = authored;
  } else if (Array.isArray(specsTable) && specsTable.length > 0 && hasShopifySpecs) {
    rawRows = specsTable;
  } else if (specsTable && typeof specsTable === "object") {
    rawRows = Object.entries(specsTable).map(([feature, details]) => ({ feature, details }));
  } else {
    rawRows = autoRows(productName, category, brand, puffs, nicotine, battery);
  }

  const seen = new Set<string>();
  const rows: SpecRow[] = [];
  for (const r of rawRows) {
    const feature = (r.feature || (r as any).label || "").trim();
    const details = (r.details || (r as any).value || "").trim();
    if (!feature || !details || isInvalidValue(details)) continue;
    const key = feature.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ feature, details });
  }

  if (rows.length === 0) {
    return null;
  }

  const heading = settings?.heading || "Key Features & Specifications";
  const subheading = (
    settings?.subheadingTemplate ?? "Technical overview and hardware specs for {product}"
  )
    .split("{product}")
    .join(productName);
  const badgeText = settings?.badgeText ?? "100% Authentic UAE Certified";

  return (
    <section className={`w-full ${className}`} suppressHydrationWarning>
      <div
        className="bg-card border border-border/60 rounded-[2.5rem] p-6 sm:p-10 lg:p-12 shadow-sm relative overflow-hidden transition-all duration-300"
        suppressHydrationWarning
      >

        {/* Top Accent Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-7 bg-primary rounded-full shrink-0 shadow-sm" />
            <div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-serif text-foreground tracking-tight flex items-center gap-2">
                <span>{heading}</span>
                <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-primary opacity-80" />
              </h3>
              {subheading && (
                <p className="text-xs sm:text-sm text-muted-foreground font-semibold mt-0.5">{subheading}</p>
              )}
            </div>
          </div>

          {badgeText && (
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full self-start sm:self-auto">
              <ShieldCheck className="w-4 h-4" />
              <span>{badgeText}</span>
            </div>
          )}
        </div>

        {/* Specifications Table */}
        <div className="overflow-x-auto rounded-2xl border border-primary/30 shadow-md bg-card scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[550px]">

            {/* Header Row (Matches site primary brand theme) */}
            <thead className="bg-primary text-white uppercase text-[11px] sm:text-xs font-black tracking-wider shadow-sm">
              <tr>
                <th scope="col" className="py-4 px-6 w-1/3 text-center border-r border-white/20">
                  {settings?.featureColumnLabel || "Feature"}
                </th>
                <th scope="col" className="py-4 px-6 text-center">
                  {settings?.detailsColumnLabel || "Details"}
                </th>
              </tr>
            </thead>

            {/* Table Rows */}
            <tbody className="divide-y divide-border/50 text-xs sm:text-sm font-medium text-foreground">
              {rows.map((row, idx) => (
                <tr
                  key={idx}
                  className="even:bg-muted/15 odd:bg-card hover:bg-primary/5 transition-colors duration-150"
                >
                  {/* Feature Cell */}
                  <td className="py-3.5 px-6 font-bold text-foreground border-r border-border/40 text-center sm:text-center bg-muted/10 w-1/3">
                    {row.feature}
                  </td>

                  {/* Details Cell */}
                  <td className="py-3.5 px-6 text-foreground/90 font-semibold leading-relaxed text-center">
                    {row.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </section>
  );
}
