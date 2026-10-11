"use client";

import React, { useState } from "react";
import { CheckCircle2, Flame, Check, Table, HelpCircle, ChevronDown, Palette } from "lucide-react";

export interface FlavorVariant {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  availableForSale: boolean;
  inventoryQuantity?: number;
  [key: string]: any;
}

interface ProductAvailableFlavorsSectionProps {
  variants?: any[];
  productName: string;
  productCategory?: string;
  selectedVariantId?: string | null;
  productFlavorNotes?: FlavorNote[];
  onSelectVariant?: (variant: any) => void;
  className?: string;
  settings?: ProductFlavorsSettings;
  hideIfEmpty?: boolean;
  optionName?: string;
}

// Preset flavor descriptions dictionary to match popular vape & shisha flavors in UAE
const KNOWN_FLAVOR_DESCRIPTIONS: Record<string, string> = {
  "blue razz lemonade": "Fresh and tangy blend of blue raspberry with a citrus lemonade twist",
  "lemon mint": "Crisp lemon notes balanced with cooling mint freshness",
  "mango pineapple": "Tropical sweetness with balanced tang and icy finish",
  "peach ice": "Juicy peach layered with a refreshing icy finish",
  "mixed berry": "Sweet and tart medley of assorted forest berries",
  "cherry fiesta": "Bold cherry flavour with a smooth exhaling finish",
  "cool mango": "Chilled mango with cooling menthol sensation",
  "grape mint": "Traditional shisha favourite with grape sweetness and mint coolness",
  "gum mint": "Sweet spearmint gum base blended with mint freshness",
  "space dream": "Exotic fruity blend with a unique refreshing twist",
  "strawberry cherry": "Sweet strawberry paired with rich cherry notes",
  "strawberry punch": "Punchy strawberry flavour with a bold fruity kick",
  "watermelon kiwi": "Refreshing fusion of juicy watermelon and tangy kiwi for a balanced vape",
  "mint": "Classic invigorating mint with crisp icy exhales",
  "virginia tobacco": "Rich American tobacco leaves with subtle toasted caramel warmth",
  "menthol": "Pure cooling menthol blast for maximum icy throat hit",
  "mango": "Sun-ripened Alphonso mango nectar with tropical sweetness",
  "crisp menthol": "Ultra-clean menthol with intense cooling icy finish",
  "polar menthol": "Sub-zero Arctic menthol frost with deep cooling power",
  "ruby red grapefruit": "Zesty pink grapefruit with balanced tart and sweet notes",
  "summer menthol": "Refreshing blend of summer fruits with a cool icy breeze",
  "autumn tobacco": "Full-bodied toasted tobacco with subtle spice accents",
  "watermelon ice": "Sweet juicy watermelon slices served over crushed ice",
  "double apple": "Classic Arabic shisha sweet red and crisp green apple fusion",
  "lush ice": "Sweet watermelon candy blend layered with icy menthol",
  "blueberry ice": "Plump blueberries infused with a chilled menthol breeze",
  "strawberry ice cream": "Creamy vanilla gelato swirled with sweet ripe strawberries",
  "cubano": "Full-flavored Cuban cigar tobacco with vanilla cream finish",
  "sweet apple": "Crisp orchard red apples with natural juicy sweetness"
};

// Preset device color finish descriptions dictionary to match popular hardware finishes in UAE
const KNOWN_COLOR_DESCRIPTIONS: Record<string, string> = {
  "vital orange": "Vibrant metallic orange finish with dynamic gradient contrast and modern ergonomic styling.",
  "silver": "Clean brushed metallic silver chassis with sleek minimalist aesthetics.",
  "rose pink": "Elegant rose pink anodized coating with soft satin sheen and luxury touch.",
  "olive green": "Tactical matte olive green exterior with military-grade durable finish.",
  "navy blue": "Deep nautical navy blue satin coating with scratch-resistant surface.",
  "black": "Classic stealth matte black finish with fingerprint-resistant premium coating.",
  "space grey": "Sophisticated space grey metallic chassis delivering clean executive styling.",
  "bondi blue": "Vivid coastal bondi blue anodized finish with vibrant metallic luster.",
  "lemon yellow": "Energetic lemon yellow chassis with bright contemporary accents.",
  "lilac purple": "Delicate lilac purple pastel finish with smooth satin texture.",
  "gunmetal": "Rugged industrial gunmetal brushed alloy finish with dark metallic accents.",
  "red": "Bold crimson red anodized chassis with premium high-gloss finish.",
  "gold": "Prestigious champagne gold metallic finish with radiant luxury luster.",
  "white": "Pristine pearl white finish with clean modern minimalist aesthetics.",
  "aurora": "Mesmerizing iridescent chameleon gradient shifting across different light angles.",
  "rainbow": "Prismatic multi-hue spectrum finish with dazzling reflective color shifts.",
  "blue": "Rich royal blue metallic finish with durable protective coating.",
  "green": "Lush emerald green anodized surface with subtle satin sheen.",
  "purple": "Deep royal purple metallic finish with refined dark undertones.",
  "grey": "Understated industrial slate grey finish engineered for everyday durability.",
  "gray": "Understated industrial slate grey finish engineered for everyday durability.",
  "carbon fiber": "High-tech woven carbon fiber texture with lightweight racing aesthetics.",
  "leather": "Ergonomic stitched luxury leather inlay providing comfortable tactile grip.",
  "phantom gold": "Opulent brushed gold edition with mirror-polished metallic trim.",
  "cherry red": "Lustrous cherry red metallic coating with deep lacquer finish.",
  "midnight black": "Deep midnight black alloy with silky matte anodized finish."
};

// Fallback flavor list when product does not have individual variant items
const DEFAULT_FALLBACK_FLAVORS = [
  { title: "Blue Razz Lemonade", desc: "Fresh and tangy blend of blue raspberry with a citrus lemonade twist" },
  { title: "Lemon Mint", desc: "Crisp lemon notes balanced with cooling mint freshness" },
  { title: "Mango Pineapple", desc: "Tropical sweetness with balanced tang" },
  { title: "Peach Ice", desc: "Juicy peach layered with a refreshing icy finish" },
  { title: "Mixed Berry", desc: "Sweet and tart medley of assorted berries" },
  { title: "Cherry Fiesta", desc: "Bold cherry flavour with a smooth exhale" },
  { title: "Cool Mango", desc: "Chilled mango with cooling sensation" },
  { title: "Grape Mint", desc: "Traditional shisha favourite with grape sweetness and mint coolness" },
  { title: "Gum Mint", desc: "Sweet gum base blended with mint freshness" },
  { title: "Space Dream", desc: "Exotic fruity blend with a unique twist" },
  { title: "Strawberry Cherry", desc: "Sweet strawberry paired with rich cherry notes" },
  { title: "Strawberry Punch", desc: "Punchy strawberry flavour with a bold kick" },
  { title: "Watermelon Kiwi", desc: "Refreshing fusion of juicy watermelon and tangy kiwi for a balanced sweet-and-sour vape" }
];

function getColorDescription(variantTitle: string, productName: string): string {
  const cleanTitle = variantTitle.toLowerCase().trim();
  const baseColor = cleanTitle.replace(/\s*\/\s*(single|1pc|10pc|5pc|3pc|20pc|50pc|100pc|1box|10pcs|pack)[\s/]?.*/i, "").trim();

  if (KNOWN_COLOR_DESCRIPTIONS[baseColor]) {
    return KNOWN_COLOR_DESCRIPTIONS[baseColor];
  }

  for (const [key, desc] of Object.entries(KNOWN_COLOR_DESCRIPTIONS)) {
    if (baseColor.includes(key) || key.includes(baseColor)) {
      return desc;
    }
  }

  return `Premium ${variantTitle} finish with durable anodized coating and sleek styling for ${productName}.`;
}

function getVariantDescription(
  variantTitle: string,
  productName: string,
  optionType: "color" | "flavor" | "other",
  notes: FlavorNote[] = []
): string {
  const cleanTitle = variantTitle.toLowerCase().trim();
  // Strip pack size suffix for matching ("Grape Ice / 1Pc/1Device" -> "grape ice")
  const baseVariant = cleanTitle.replace(/\s*\/\s*(1pc|10pc|5pc|3pc|20pc|50pc|100pc)\/[^\s].*$/i, "").trim();

  // A note typed in the customizer or from metafield
  const authored = notes.find((note) => {
    const noteKey = note.flavor?.toLowerCase().trim();
    return noteKey && note.description && (noteKey === cleanTitle || noteKey === baseVariant || baseVariant.includes(noteKey) || noteKey.includes(baseVariant));
  });

  if (authored) {
    if (optionType === "color" && /flavou?r|tasting notes|exhaling/i.test(authored.description)) {
      // Flavor description erroneously applied to a color variant
      return getColorDescription(variantTitle, productName);
    }
    if (optionType === "other" && /flavou?r|tasting notes|exhaling/i.test(authored.description)) {
      if (/(\d+(\.\d+)?\s*(ohm|ω))/i.test(variantTitle)) {
        return `${variantTitle} coil configuration optimized for exceptional vapor density and clean draw.`;
      }
      return `Authentic ${variantTitle} specification engineered for optimal performance with ${productName}.`;
    }
    return authored.description;
  }

  if (optionType === "color") {
    return getColorDescription(variantTitle, productName);
  }

  if (optionType === "flavor") {
    // Exact match in known dictionary
    if (KNOWN_FLAVOR_DESCRIPTIONS[baseVariant]) {
      return KNOWN_FLAVOR_DESCRIPTIONS[baseVariant];
    }

    // Partial match search
    for (const [key, desc] of Object.entries(KNOWN_FLAVOR_DESCRIPTIONS)) {
      if (baseVariant.includes(key) || key.includes(baseVariant)) {
        return desc;
      }
    }

    // Generate clean fallback description
    return `Authentic ${variantTitle} blend with rich flavor profile, smooth throat hit, and refreshing finish.`;
  }

  // Other option types (e.g. Resistance, Size, Edition)
  if (/(\d+(\.\d+)?\s*(ohm|ω))/i.test(variantTitle)) {
    return `${variantTitle} coil configuration optimized for exceptional flavor extraction and vapor density.`;
  }

  return `Authentic ${variantTitle} specification engineered for optimal performance and reliability with ${productName}.`;
}

export interface FlavorNote {
  /** Variant name this note belongs to. Matched case-insensitively. */
  flavor: string;
  description: string;
}

export interface ProductFlavorsSettings {
  heading: string;
  /** `{product}` is replaced with the product name. */
  subheadingTemplate: string;
  /** `{count}` is replaced with the number of flavours. Blank hides the badge. */
  countBadgeTemplate: string;
  nameColumnLabel: string;
  profileColumnLabel: string;
  availabilityColumnLabel: string;
  inStockLabel: string;
  outOfStockLabel: string;
  selectedLabel: string;
  /** Show the variant price in place of the in-stock label. */
  showPrices: boolean;
  /** Merchant overrides for individual flavours. */
  flavorNotes: FlavorNote[];
  footnote: string;
}

export function ProductAvailableFlavorsSection({
  settings,
  variants = [],
  productName,
  productCategory,
  selectedVariantId,
  productFlavorNotes,
  onSelectVariant,
  className = "",
  hideIfEmpty = false,
  optionName,
}: ProductAvailableFlavorsSectionProps) {
  
  const notes = [...(productFlavorNotes || []), ...(settings?.flavorNotes ?? [])];

  // Filter valid variants (ignore single default variant if titled "Default Title")
  const validVariants = variants.filter(
    (v) => v.title && v.title.toLowerCase() !== "default title" && v.title.toLowerCase() !== "default"
  );

  const hasVariantData = validVariants.length > 1 || (productFlavorNotes && productFlavorNotes.length > 0);

  if (hideIfEmpty && !hasVariantData) {
    return null;
  }

  // Detect option name and type (Color vs Flavor vs other)
  const rawOption = (optionName || "").trim();
  const hasColorVariants = validVariants.some((v) =>
    /(orange|silver|pink|green|blue|black|grey|gray|red|gold|white|purple|yellow|gunmetal|bronze|copper|titanium|cyan|teal|magenta)/i.test(
      v.title
    )
  );
  const hasFlavorVariants = validVariants.some((v) =>
    /(mint|ice|lemon|grape|mango|berry|apple|watermelon|tobacco|peach|cherry|strawberry|vanilla|cola|punch|coffee)/i.test(
      v.title
    )
  );

  // If rawOption specifies color, or if variants clearly contain colors without flavors
  const isColor =
    (rawOption && /colou?r/i.test(rawOption)) ||
    (!rawOption && hasColorVariants && !hasFlavorVariants) ||
    (rawOption && /flavou?r/i.test(rawOption) && hasColorVariants && !hasFlavorVariants);

  const isFlavor =
    !isColor &&
    ((rawOption && /flavou?r/i.test(rawOption)) ||
      (!rawOption && (hasFlavorVariants || !hasColorVariants)));

  const singularLabel = isColor
    ? "Color"
    : isFlavor
    ? "Flavour"
    : rawOption && rawOption.toLowerCase() !== "title"
    ? rawOption
    : "Option";

  const pluralLabel = isColor
    ? "Colors"
    : isFlavor
    ? "Flavours"
    : singularLabel.endsWith("s")
    ? singularLabel
    : `${singularLabel}s`;

  const optionType: "color" | "flavor" | "other" = isColor
    ? "color"
    : isFlavor
    ? "flavor"
    : "other";

  // Group variants by base variant name (strip pack size suffixes)
  // Handles: "/ 1Pc/1Device", "/ 10Pc/1Box", "/ SINGLE/1PC", "/ 1BOX/10PCS", "/ Single Pack", "/ 10Pack/1Box"
  function extractBaseVariant(title: string): string {
    return title
      .replace(/\s*\/\s*(SINGLE|1PC|1Pc|10Pc|5Pc|3Pc|20Pc|50Pc|100Pc|1BOX|10PCS|Single Pack|10Pack)[\s/]?.*/i, "")
      .trim();
  }

  interface VariantGroup {
    baseName: string;
    variants: typeof validVariants;
    desc: string;
    anyAvailable: boolean;
  }

  const groupedVariants: VariantGroup[] = [];
  const seenVariants = new Map<string, VariantGroup>();

  for (const v of validVariants) {
    const baseName = extractBaseVariant(v.title);
    const key = baseName.toLowerCase();

    if (seenVariants.has(key)) {
      seenVariants.get(key)!.variants.push(v);
      if (v.availableForSale) seenVariants.get(key)!.anyAvailable = true;
    } else {
      const group: VariantGroup = {
        baseName,
        variants: [v],
        desc: getVariantDescription(baseName, productName, optionType, notes),
        anyAvailable: v.availableForSale,
      };
      seenVariants.set(key, group);
      groupedVariants.push(group);
    }
  }

  function extractNameFromProductName(name: string): string {
    let cleaned = name
      .replace(/juul\s*\d*\s*(pods|device|kit|starter kit)?/gi, "")
      .replace(/myle\s*(meta|v5|v4|micro|drip)?\s*(pods|device|kit)?/gi, "")
      .replace(/disposable\s*(vape|device|pod)?/gi, "")
      .replace(/\d+\s*(mg|puffs|puff|k|ml|pack|pcs|pc)/gi, "")
      .replace(/\|?\s*made in [a-z]+/gi, "")
      .replace(/\b(in uae|dubai|uae|vape|pods|pod|kit|device)\b/gi, "")
      .trim();

    return cleaned || name;
  }

  // Determine variant list to display
  const fallbackTitle = isColor ? "Standard Edition" : extractNameFromProductName(productName);
  const itemsList = groupedVariants.length > 0
    ? groupedVariants.map((group) => ({
        id: group.variants[0].id,
        variantObj: group.variants[0],
        allVariants: group.variants,
        title: group.baseName,
        desc: group.desc,
        available: group.anyAvailable,
        price: group.variants[0].price,
      }))
    : [
        {
          id: variants[0]?.id || "single-variant",
          variantObj: variants[0] || null,
          allVariants: variants,
          title: fallbackTitle,
          desc: getVariantDescription(fallbackTitle, productName, optionType, notes),
          available: variants[0]?.availableForSale ?? true,
          price: variants[0]?.price ?? null,
        },
      ];

  // Dynamic Section Heading
  let heading = settings?.heading;
  if (!heading || heading === "Available Flavours" || heading === "Available Flavors") {
    heading = `Available ${pluralLabel}`;
  } else if (!isFlavor && /flavou?rs?/i.test(heading)) {
    heading = heading.replace(/flavou?rs?/gi, pluralLabel);
  }

  // Dynamic Subheading
  let subheadingTemplate = settings?.subheadingTemplate;
  if (!subheadingTemplate || subheadingTemplate === "Complete flavor profile spreadsheet table for {product}") {
    if (isColor) {
      subheadingTemplate = "Complete color options spreadsheet table for {product}";
    } else if (isFlavor) {
      subheadingTemplate = "Complete flavor profile spreadsheet table for {product}";
    } else {
      subheadingTemplate = `Complete ${singularLabel.toLowerCase()} options spreadsheet table for {product}`;
    }
  } else if (!isFlavor && /flavor profile/i.test(subheadingTemplate)) {
    subheadingTemplate = subheadingTemplate.replace(
      /flavor profile/gi,
      isColor ? "color options" : `${singularLabel.toLowerCase()} options`
    );
  }
  const subheading = subheadingTemplate.split("{product}").join(productName);

  // Dynamic Count Badge
  let countBadgeTemplate = settings?.countBadgeTemplate || "{count} Signature Options";
  if (!isFlavor && /flavou?rs?/i.test(countBadgeTemplate)) {
    countBadgeTemplate = countBadgeTemplate.replace(/flavou?rs?/gi, pluralLabel);
  }
  const countBadge = countBadgeTemplate.split("{count}").join(String(itemsList.length));

  // Dynamic Column 1 (Name)
  let nameColumnLabel = settings?.nameColumnLabel;
  if (!nameColumnLabel || /flavou?r name/i.test(nameColumnLabel)) {
    nameColumnLabel = `${singularLabel} Name`;
  }

  // Dynamic Column 2 (Profile / Details)
  let profileColumnLabel = settings?.profileColumnLabel;
  if (!profileColumnLabel || /flavou?r profile/i.test(profileColumnLabel)) {
    if (isColor) {
      profileColumnLabel = "Color Finish & Details";
    } else if (isFlavor) {
      profileColumnLabel = "Flavour Profile & Tasting Notes";
    } else {
      profileColumnLabel = `${singularLabel} Specifications & Details`;
    }
  }

  // Dynamic Footnote
  let footnote = settings?.footnote ?? "";
  const isDefaultFlavorFootnote =
    !footnote ||
    footnote.includes("Each blend is crafted to replicate authentic shisha & vape flavours");
  if (!isFlavor && isDefaultFlavorFootnote) {
    if (isColor) {
      footnote =
        "Each color finish is precision engineered with premium scratch-resistant coating and durable ergonomic styling.";
    } else {
      footnote = `Each ${singularLabel.toLowerCase()} is 100% authentic and engineered for optimal compatibility with ${productName}.`;
    }
  }

  const inStockLabel = settings?.inStockLabel || "IN STOCK";
  const outOfStockLabel = settings?.outOfStockLabel || "OUT OF STOCK";
  const selectedLabel = settings?.selectedLabel || "SELECTED";
  const showPrices = settings?.showPrices !== false;

  const [showAllItems, setShowAllItems] = useState(false);
  const visibleItems = showAllItems ? itemsList : itemsList.slice(0, 5);

  return (
    <section className={`w-full ${className}`}>
      <div className="bg-card border border-border/60 rounded-[2.5rem] p-6 sm:p-10 lg:p-12 shadow-sm relative overflow-hidden transition-all duration-300">
        
        {/* Top Accent Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-7 bg-primary rounded-full shrink-0 shadow-sm" />
            <div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-serif text-foreground tracking-tight flex items-center gap-2">
                <span>{heading}</span>
                <Table className="w-5 h-5 sm:w-6 sm:h-6 text-primary opacity-80" />
              </h3>
              {subheading && (
                <p className="text-xs sm:text-sm text-muted-foreground font-semibold mt-0.5">{subheading}</p>
              )}
            </div>
          </div>

          {countBadge && (
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full self-start sm:self-auto">
              {isColor ? (
                <Palette className="w-3.5 h-3.5 text-primary" />
              ) : (
                <Flame className="w-3.5 h-3.5 text-primary" />
              )}
              <span>{countBadge}</span>
            </div>
          )}
        </div>

        {/* Excel Spreadsheet-Style Table Container */}
        <div className="overflow-x-auto rounded-2xl border border-primary/30 shadow-md bg-card scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[640px]">
            {/* Excel Header Row */}
            <thead className="bg-primary text-white uppercase text-[11px] font-black tracking-wider shadow-sm">
              <tr>
                <th scope="col" className="py-3.5 px-4 text-center w-12 border-r border-white/20 font-mono">
                  #
                </th>
                <th scope="col" className="py-3.5 px-5 w-1/3 border-r border-white/20">
                  {nameColumnLabel}
                </th>
                <th scope="col" className="py-3.5 px-5 border-r border-white/20">
                  {profileColumnLabel}
                </th>
                <th scope="col" className="py-3.5 px-5 text-center w-36">
                  {settings?.availabilityColumnLabel || "Availability"}
                </th>
              </tr>
            </thead>

            {/* Excel Rows */}
            <tbody className="divide-y divide-border/50 text-xs font-medium text-foreground">
              {visibleItems.map((item, index) => {
                const isSelected = item.allVariants?.some((v: any) => selectedVariantId === v.id) || selectedVariantId === item.id;

                return (
                  <tr
                    key={item.id}
                    onClick={() => {
                      if (item.variantObj && onSelectVariant && item.available) {
                        onSelectVariant(item.variantObj);
                      }
                    }}
                    className={`transition-colors duration-150 group cursor-pointer ${
                      !item.available
                        ? "opacity-40 bg-muted/30 cursor-not-allowed"
                        : isSelected
                        ? "bg-primary/15 font-bold text-foreground ring-1 ring-primary/40"
                        : "even:bg-muted/15 odd:bg-card hover:bg-primary/5"
                    }`}
                  >
                    {/* Index Cell */}
                    <td className="py-3.5 px-4 text-center font-mono text-[11px] text-muted-foreground border-r border-border/40 group-hover:text-primary font-bold">
                      {String(index + 1).padStart(2, "0")}
                    </td>

                    {/* Variant Name Cell */}
                    <td className="py-3.5 px-5 border-r border-border/40">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            isSelected ? "bg-primary ring-4 ring-primary/20" : "bg-primary/80 group-hover:scale-125 transition-transform"
                          }`}
                        />
                        <span className={`font-bold text-xs sm:text-sm ${isSelected ? "text-primary font-black" : "text-foreground group-hover:text-primary"}`}>
                          {item.title}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-primary shrink-0 ml-auto" />}
                      </div>
                    </td>

                    {/* Description Cell */}
                    <td className="py-3.5 px-5 border-r border-border/40 text-muted-foreground leading-relaxed text-xs">
                      {item.desc}
                    </td>

                    {/* Availability / Pack Options Cell */}
                    <td className="py-3.5 px-5 text-center">
                      {item.available ? (
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                          {item.allVariants && item.allVariants.length > 1 ? (
                            item.allVariants.map((v: any) => {
                              // Extract pack label from variant title suffix
                              let packLabel = "1Pc";
                              const t = v.title || "";
                              if (/1BOX|10PCS|10Pc|10Pack/i.test(t)) packLabel = "Box";
                              else if (/SINGLE|1PC|1Pc|Single Pack/i.test(t)) packLabel = "1Pc";
                              else if (/5Pc|5Pack/i.test(t)) packLabel = "5Pc";
                              else if (/3Pc|3Pack/i.test(t)) packLabel = "3Pc";
                              else if (/20Pc/i.test(t)) packLabel = "20Pc";
                              const isThisSelected = selectedVariantId === v.id;
                              return (
                                <button
                                  key={v.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (v.availableForSale && onSelectVariant) onSelectVariant(v);
                                  }}
                                  disabled={!v.availableForSale}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-colors whitespace-nowrap ${
                                    isThisSelected
                                      ? "bg-primary text-white shadow-xs"
                                      : v.availableForSale
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-primary hover:text-white hover:border-primary"
                                      : "bg-muted text-muted-foreground line-through opacity-50 cursor-not-allowed"
                                  }`}
                                >
                                  {isThisSelected ? `✓ ${packLabel}` : showPrices && v.price ? `${packLabel}: Dhs. ${v.price}` : `${packLabel}: ${inStockLabel}`}
                                </button>
                              );
                            })
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isSelected
                                ? "bg-primary text-white shadow-xs"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors"
                            }`}>
                              {isSelected
                                ? selectedLabel
                                : showPrices && item.price
                                ? `Dhs. ${item.price}`
                                : inStockLabel}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider line-through">
                          {outOfStockLabel}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* See More Items Button */}
        {itemsList.length > 5 && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAllItems((prev) => !prev)}
              className="inline-flex items-center gap-2 bg-primary hover:bg-gold-shimmer text-white px-8 py-3.5 rounded-full text-xs font-sans font-extrabold uppercase tracking-wider transition-all duration-300 shadow-md hover:scale-105 cursor-pointer"
            >
              {isColor ? (
                <Palette className="w-4 h-4 text-white" />
              ) : (
                <Flame className="w-4 h-4 text-white" />
              )}
              <span>
                {showAllItems
                  ? `Show Less ${pluralLabel}`
                  : `See More ${pluralLabel} (${itemsList.length - 5} More)`}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAllItems ? "rotate-180" : ""}`} />
            </button>
          </div>
        )}

        {/* Section Footer Note */}
        {footnote && (
          <div className="mt-6 pt-5 border-t border-border/40 flex items-center gap-2.5 text-xs text-muted-foreground font-medium">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span>{footnote}</span>
          </div>
        )}

      </div>
    </section>
  );
}

