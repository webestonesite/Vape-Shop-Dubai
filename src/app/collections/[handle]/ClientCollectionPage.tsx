"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { useCart } from "@/context/CartContext";
import { Product, ProductCard } from "@/components/sections/ProductFeed";
import { AuthorizedDealers } from "@/components/sections/AuthorizedDealers";
import { WhatsAppContactSection } from "@/components/sections/WhatsAppContactSection";
import { BrandSphere3D } from "@/components/sections/BrandSphere3D";
import { FlavorsWheel } from "@/components/sections/FlavorsWheel";
import { BottomCollectionGrid } from "@/components/sections/BottomCollectionGrid";
import { FAQSection } from "@/components/sections/FAQSection";
import { WhyShopWithUs } from "@/components/sections/WhyShopWithUs";
import { CustomerReviewsSection } from "@/components/sections/CustomerReviewsSection";
import { JuulTechSpecsSection } from "@/components/sections/JuulTechSpecsSection";
import { JuulSignatureFlavorsSection } from "@/components/sections/JuulSignatureFlavorsSection";
import { JuulPackagingCompareSection } from "@/components/sections/JuulPackagingCompareSection";
import { JuulCrispMentholSections } from "@/components/sections/JuulCrispMentholSections";
import { JuulCustomFeatureSection } from "@/components/sections/JuulCustomFeatureSection";
import { JuulAppIntegrationSection } from "@/components/sections/JuulAppIntegrationSection";
import { MyleVerificationSection } from "@/components/sections/MyleVerificationSection";
import { DisposableComparisonSections } from "@/components/sections/DisposableComparisonSections";
import { DisposableBrandsShowcase } from "@/components/sections/DisposableBrandsShowcase";
import { EJuiceBrandsShowcase } from "@/components/sections/EJuiceBrandsShowcase";
import {
  instanceSettings,
  TemplateSections,
} from "@/components/sections/SectionRenderer";
import {
  useCollectionSectionsDraft,
  useResolvedTemplate,
} from "@/context/ThemeSettingsContext";
import {
  parseCollectionSections,
  resolveCollectionSections,
} from "@/lib/theme/collection-sections";
import { parseSubPills } from "@/lib/shopify/collection";
import {
  Star,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  SlidersHorizontal,
  ChevronDown,
  Tag,
  X,
  Check,
  Zap,
  ShieldCheck,
  Home
} from "lucide-react";
import { getItemListSchema, getBreadcrumbSchema } from "@/lib/seo-schemas";
import { getMatchingCollectionProducts } from "@/lib/shopify/collection-matching";

function cleanDescriptionHtml(html: string): string {
  if (!html) return "";
  let cleaned = html;

  // Preserve <style> tags so custom collection designs (.vsd-*, etc.) render with full designed styles
  // 1. Remove leading/trailing quotes or whitespace
  cleaned = cleaned.replace(/^\s*["';\s\}]+/g, "");
  cleaned = cleaned.replace(/["';\s\}]+\s*$/g, "");

  // Output raw Shopify backend HTML untouched without regex heading mutations

  // Process tables: promote first <tr> to <thead><th> if table lacks <thead>
  cleaned = cleaned.replace(/<table[\s\S]*?<\/table>/gi, (tableHtml) => {
    let updatedTable = tableHtml;
    if (!/<thead/i.test(updatedTable)) {
      updatedTable = updatedTable.replace(/<tr[\s\S]*?>([\s\S]*?)<\/tr>/i, (_match, innerTr) => {
        const ths = innerTr.replace(/<td([\s\S]*?)>([\s\S]*?)<\/td>/gi, '<th$1>$2</th>');
        return `<thead><tr>${ths}</tr></thead>`;
      });
    }
    return `<div class="overflow-x-auto my-8 rounded-2xl border border-primary/30 shadow-md bg-card">${updatedTable}</div>`;
  });

  cleaned = cleaned.replace(/href="https?:\/\/(www\.)?(vapeuae\.shop|vapshopdubai\.ae|vapshop\.ae)?\/product\/([^"]+)"/gi, 'href="/products/$3"');
  cleaned = cleaned.replace(/href="\/product\/([^"]+)"/gi, 'href="/products/$1"');
  cleaned = cleaned.replace(/href="https?:\/\/(www\.)?(vapeuae\.shop|vapshopdubai\.ae|vapshop\.ae)\/collections\/([^"]+)"/gi, 'href="/collections/$3"');
  cleaned = cleaned.replace(/href="https?:\/\/(www\.)?(vapeuae\.shop|vapshopdubai\.ae|vapshop\.ae)\/brand\/([^"]+)"/gi, 'href="/collections/$3"');

  return cleaned.trim();
}

const ALL_BRANDS_COLLECTION = [
  { name: "JUUL", handle: "juul-vape-dubai", image: "", tag: "Devices & Pods", color: "from-blue-500/10 to-indigo-500/10" },
  { name: "MYLE", handle: "myle-vape-dubai", image: "", tag: "V5, Disposables & Pods", color: "from-amber-500/10 to-orange-500/10" },
  { name: "Elf Bar", handle: "elf-bar-vape", image: "", tag: "Disposables & Pods", color: "from-emerald-500/10 to-teal-500/10" },
  { name: "Al Fakher", handle: "al-fakher-vape", image: "", tag: "Crown Bar Disposables", color: "from-purple-500/10 to-pink-500/10" },
  { name: "GeekVape", handle: "geek-vape", image: "", tag: "Kits, Mods & Coils", color: "from-red-500/10 to-rose-500/10" },
  { name: "Uwell", handle: "uwell-vape", image: "", tag: "Caliburn Pod Systems", color: "from-cyan-500/10 to-blue-500/10" },
  { name: "Vaporesso", handle: "vaporesso-vape", image: "", tag: "XROS & Pod Kits", color: "from-sky-500/10 to-indigo-500/10" },
  { name: "Lost Mary", handle: "lost-mary-disposable", image: "", tag: "BM6000 & Disposables", color: "from-pink-500/10 to-rose-500/10" },
  { name: "VooPoo", handle: "voopoo-vape", image: "", tag: "Drag & Argus Kits", color: "from-amber-500/10 to-yellow-500/10" },
  { name: "Smok", handle: "smok-vape", image: "", tag: "Nord & Novo Pod Systems", color: "from-red-500/10 to-orange-500/10" },
  { name: "OXVA", handle: "oxva-vape", image: "", tag: "Xlim Pod Systems", color: "from-violet-500/10 to-purple-500/10" },
  { name: "Tugboat", handle: "tugboat-vape", image: "", tag: "Super 12000 & Evo", color: "from-teal-500/10 to-cyan-500/10" },
  { name: "Pod Salt", handle: "pod-salt-vape", image: "", tag: "Nicotine Salts & Liquids", color: "from-blue-500/10 to-sky-500/10" },
  { name: "HQD", handle: "hqd-vape", image: "", tag: "Cuvie & Cuvie Plus", color: "from-yellow-500/10 to-amber-500/10" },
  { name: "Fummo", handle: "fummo-vape", image: "", tag: "Target & King Disposables", color: "from-emerald-500/10 to-green-500/10" },
  { name: "Vozol", handle: "vozol-vape", image: "", tag: "Gear 10000 & Star", color: "from-purple-500/10 to-indigo-500/10" },
  { name: "Relx", handle: "relx-vape", image: "", tag: "Infinity & Essential", color: "from-slate-500/10 to-gray-500/10" },
  { name: "Geek Bar", handle: "geek-bar-disposable", image: "", tag: "Pulse & DF9000", color: "from-rose-500/10 to-pink-500/10" },
  { name: "Yuoto", handle: "yuoto-vape", image: "", tag: "Thanatos & XXL", color: "from-orange-500/10 to-amber-500/10" },
  { name: "Nerd Vape", handle: "nerd-vape", image: "", tag: "5000 Puffs Disposables", color: "from-lime-500/10 to-emerald-500/10" },
  { name: "VGOD", handle: "vgod-stig", image: "", tag: "Stig & Cubano E-Liquids", color: "from-red-500/10 to-amber-500/10" },
  { name: "Silvaper", handle: "silvaper-vape", image: "", tag: "Premium E-Liquids", color: "from-teal-500/10 to-emerald-500/10" },
  { name: "Vapes Bars", handle: "vapes-bars", image: "", tag: "Ghost Pro Disposables", color: "from-indigo-500/10 to-purple-500/10" },
];

const DEFAULT_COLLECTION_SUB_PILLS: Record<string, { label: string; query: string }[]> = {
  "myle-vape-dubai": [
    { label: "All MYLE", query: "all" },
    { label: "MYLE Meta V5", query: "v5" },
    { label: "MYLE Pods", query: "pods" },
    { label: "MYLE Devices", query: "device" },
    { label: "Flash Sale", query: "flash-sale" },
  ],
  "myle": [
    { label: "All MYLE", query: "all" },
    { label: "MYLE Meta V5", query: "v5" },
    { label: "MYLE Pods", query: "pods" },
    { label: "MYLE Devices", query: "device" },
  ],
  "juul-vape-dubai": [
    { label: "All JUUL", query: "all" },
    { label: "JUUL 2 Series", query: "juul 2" },
    { label: "JUUL 1 Series", query: "juul 1" },
    { label: "Menthol Pods", query: "menthol" },
    { label: "Virginia Tobacco", query: "tobacco" },
  ],
  "juul": [
    { label: "All JUUL", query: "all" },
    { label: "JUUL 2 Series", query: "juul 2" },
    { label: "JUUL 1 Series", query: "juul 1" },
    { label: "Menthol Pods", query: "menthol" },
  ],
  "disposable-vape": [
    { label: "All Disposables", query: "all" },
    { label: "Elf Bar", query: "elf bar" },
    { label: "Pod Salt", query: "pod salt" },
    { label: "Al Fakher", query: "al fakher" },
    { label: "Vozol", query: "vozol" },
    { label: "Lost Mary", query: "lost mary" },
    { label: "Yuoto", query: "yuoto" },
    { label: "Tugboat", query: "tugboat" },
  ],
  "disposables": [
    { label: "All Disposables", query: "all" },
    { label: "Elf Bar", query: "elf bar" },
    { label: "Pod Salt", query: "pod salt" },
    { label: "Al Fakher", query: "al fakher" },
    { label: "Vozol", query: "vozol" },
  ],
  "vape-e-juice": [
    { label: "All E-Juice", query: "all" },
    { label: "Ruthless", query: "ruthless" },
    { label: "Nasty Juice", query: "nasty" },
    { label: "Salt Nicotine", query: "salt" },
    { label: "Freebase", query: "freebase" },
  ],
  "pod-system": [
    { label: "All Pod Systems", query: "all" },
    { label: "Vaporesso", query: "vaporesso" },
    { label: "Uwell Caliburn", query: "uwell" },
    { label: "Oxva Xlim", query: "oxva" },
    { label: "Geekvape", query: "geekvape" },
    { label: "Voopoo", query: "voopoo" },
  ],
};

export function detectProductNicotines(p: { name?: string; nicotine?: string; tags?: string[] }): string[] {
  const result = new Set<string>();

  if (p.nicotine && p.nicotine.trim()) {
    const raw = p.nicotine.trim();
    if (raw.includes("50mg") || raw.includes("5%")) result.add("5.0% (50mg)");
    else if (raw.includes("20mg") || raw.includes("2%")) result.add("2.0% (20mg)");
    else if (raw.includes("18mg") || raw.includes("1.8%")) result.add("1.8% (18mg)");
    else if (raw.includes("30mg") || raw.includes("3%")) result.add("3.0% (30mg)");
    else if (raw.includes("35mg") || raw.includes("3.5%")) result.add("3.5% (35mg)");
    else if (raw.includes("25mg") || raw.includes("2.5%")) result.add("2.5% (25mg)");
    else if (raw.includes("60mg") || raw.includes("6%")) result.add("6.0% (60mg)");
    else if (raw.includes("3mg")) result.add("3mg");
    else if (raw.includes("6mg")) result.add("6mg");
    else if (raw.includes("12mg")) result.add("12mg");
    else if (raw.includes("0mg") || raw.includes("0%")) result.add("0mg (Zero Nicotine)");
    else result.add(raw);
  }

  const text = ((p.name || "") + " " + (p.tags || []).join(" ")).toLowerCase();

  // 5% or 50mg
  if (/(?:^|[^\w.])(?:50\s*mg|5(?:\.0)?%)(?![0-9a-z])/i.test(text)) result.add("5.0% (50mg)");
  // 2% or 20mg
  if (/(?:^|[^\w.])(?:20\s*mg|2(?:\.0)?%)(?![0-9a-z])/i.test(text)) result.add("2.0% (20mg)");
  // 1.8% or 18mg (e.g. Juul 2)
  if (/(?:^|[^\w.])(?:18\s*mg|1\.8%)(?![0-9a-z])/i.test(text)) result.add("1.8% (18mg)");
  // 3% or 30mg
  if (/(?:^|[^\w.])(?:30\s*mg|3(?:\.0)?%)(?![0-9a-z])/i.test(text)) result.add("3.0% (30mg)");
  // 3.5% or 35mg
  if (/(?:^|[^\w.])(?:35\s*mg|3\.5%)(?![0-9a-z])/i.test(text)) result.add("3.5% (35mg)");
  // 2.5% or 25mg
  if (/(?:^|[^\w.])(?:25\s*mg|2\.5%)(?![0-9a-z])/i.test(text)) result.add("2.5% (25mg)");
  // 6% or 60mg
  if (/(?:^|[^\w.])(?:60\s*mg|6(?:\.0)?%)(?![0-9a-z])/i.test(text)) result.add("6.0% (60mg)");
  // Freebase 3mg, 6mg, 12mg
  if (/(?:^|[^\w.])3\s*mg(?![0-9a-z])/i.test(text)) result.add("3mg");
  if (/(?:^|[^\w.])6\s*mg(?![0-9a-z])/i.test(text)) result.add("6mg");
  if (/(?:^|[^\w.])12\s*mg(?![0-9a-z])/i.test(text)) result.add("12mg");
  // 0mg or 0%
  if (/(?:^|[^\w.])(?:0\s*mg|0%|zero\s*nicotine|nicotine\s*free)(?![0-9a-z])/i.test(text)) result.add("0mg (Zero Nicotine)");

  return Array.from(result);
}

export function detectProductNicotine(p: { name?: string; nicotine?: string; tags?: string[] }): string | null {
  const all = detectProductNicotines(p);
  return all.length > 0 ? all[0] : null;
}

export function productMatchesNicotine(
  p: { name?: string; nicotine?: string; tags?: string[] },
  selectedOptions: string[]
): boolean {
  if (!selectedOptions || selectedOptions.length === 0) return true;
  const detectedList = detectProductNicotines(p);
  const text = ((p.name || "") + " " + (p.tags || []).join(" ") + " " + (p.nicotine || "")).toLowerCase();

  return selectedOptions.some((opt) => {
    const optTrimmed = opt.trim();
    if (!optTrimmed) return false;
    const optLower = optTrimmed.toLowerCase();

    // 1. Exact match with any detected canonical strengths
    if (detectedList.some((det) => det.toLowerCase() === optLower)) return true;

    // 2. Substring match inside detected canonical strength (e.g. opt="50mg" or "5%" matches "5.0% (50mg)")
    if (detectedList.some((det) => det.toLowerCase().includes(optLower))) return true;

    // 3. Regex matching for mg values (e.g. opt="50mg" or "3mg")
    const mgMatch = optLower.match(/(\d+(?:\.\d+)?)\s*mg/);
    if (mgMatch) {
      const val = mgMatch[1];
      const rx = new RegExp(`(?:^|[^\\w.])${val}\\s*mg(?![0-9a-z])`, "i");
      if (rx.test(text)) return true;
    }

    // 4. Regex matching for % values (e.g. opt="5%" or "2%")
    const pctMatch = optLower.match(/(\d+(?:\.\d+)?)\s*%/);
    if (pctMatch) {
      const val = pctMatch[1];
      const rx = new RegExp(`(?:^|[^\\w.])${val}(?:\\.0)?%(?![0-9a-z])`, "i");
      if (rx.test(text)) return true;
    }

    return text.includes(optLower);
  });
}

export const NICOTINE_SORT_ORDER = [
  "0mg (Zero Nicotine)",
  "0mg",
  "1.8% (18mg)",
  "18mg",
  "2.0% (20mg)",
  "20mg",
  "2%",
  "2.5% (25mg)",
  "25mg",
  "3mg",
  "3.0% (30mg)",
  "30mg",
  "3%",
  "3.5% (35mg)",
  "35mg",
  "5.0% (50mg)",
  "50mg",
  "5%",
  "6mg",
  "6.0% (60mg)",
  "60mg",
  "12mg",
];

export function sortNicotines(list: string[]): string[] {
  return [...list].sort((a, b) => {
    const idxA = NICOTINE_SORT_ORDER.indexOf(a);
    const idxB = NICOTINE_SORT_ORDER.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });
}

export function detectProductCapacities(p: { name?: string; tags?: string[] }): string[] {
  const text = ((p.name || "") + " " + (p.tags || []).join(" ")).toLowerCase();
  const regex = /(?:^|[^\w.])(\d+(?:\.\d+)?)\s*ml(?![0-9a-z])/gi;
  const found = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const num = parseFloat(match[1]);
    if (num > 0 && num <= 500) {
      found.add(`${num}ml`);
    }
  }
  return Array.from(found);
}

export function sortCapacities(list: string[]): string[] {
  return [...list].sort((a, b) => {
    const numA = parseFloat(a) || 0;
    const numB = parseFloat(b) || 0;
    return numA - numB;
  });
}

export function productMatchesCapacity(
  p: { name?: string; tags?: string[] },
  selectedOptions: string[]
): boolean {
  if (!selectedOptions || selectedOptions.length === 0) return true;
  const detectedList = detectProductCapacities(p);
  const text = ((p.name || "") + " " + (p.tags || []).join(" ")).toLowerCase();

  return selectedOptions.some((opt) => {
    const optTrimmed = opt.trim().toLowerCase();
    if (!optTrimmed) return false;

    // 1. Direct match with detected values (e.g. "30ml", "2ml")
    if (detectedList.some((det) => det.toLowerCase() === optTrimmed)) return true;

    // 2. Number extracted match (e.g. opt="30" or "30ml")
    const match = optTrimmed.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      const num = match[1];
      const rx = new RegExp(`(?:^|[^\\w.])${num}\\s*ml(?![0-9a-z])`, "i");
      if (rx.test(text)) return true;
    }

    return text.includes(optTrimmed);
  });
}

interface SearchParamsSyncData {
  sub: string;
  brand: string;
  search: string;
}

function SearchParamsListener({ onSync }: { onSync: (data: SearchParamsSyncData) => void }) {
  const searchParams = useSearchParams();
  const sub = searchParams?.get("sub") || "";
  const brand = searchParams?.get("brand") || "";
  const search = searchParams?.get("search") || searchParams?.get("q") || "";

  useEffect(() => {
    onSync({ sub, brand, search });
  }, [sub, brand, search, onSync]);

  return null;
}

function CollectionPageContent({
  initialMeta,
  initialProducts,
  handle: propHandle,
  initialSubFilter = "",
}: {
  initialMeta?: any;
  initialProducts?: Product[];
  handle?: string;
  initialSubFilter?: string;
}) {
  const params = useParams();
  const rawHandle = propHandle || params?.handle;
  const handle = (typeof rawHandle === "string" ? rawHandle : Array.isArray(rawHandle) ? rawHandle[0] : "") || "";
  const router = useRouter();
  const [subFilter, setSubFilter] = useState<string>(initialSubFilter);
  const handleSearchParamsSync = React.useCallback(
    ({ sub, brand, search }: SearchParamsSyncData) => {
      if (sub) setSubFilter(sub);
      if (brand) setSelectedBrands([brand]);
      if (search) setSearchQuery(search);
    },
    []
  );

  const { addToCart, setIsCartOpen } = useCart();
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [loading, setLoading] = useState<boolean>(!initialProducts || initialProducts.length === 0);
  const [error, setError] = useState("");

  // Filter States (Checkbox arrays for multi-select)
  const [selectedNicotines, setSelectedNicotines] = useState<string[]>([]);
  const [selectedCapacities, setSelectedCapacities] = useState<string[]>([]);
  const [selectedPuffs, setSelectedPuffs] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [sortBy, setSortBy] = useState<string>("popular");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isGuideExpanded, setIsGuideExpanded] = useState(false);
  const [activePillFilter, setActivePillFilter] = useState<string>("all");

  // Shopify collection metadata
  const [collectionMeta, setCollectionMeta] = useState<{
    title: string;
    description: string;
    descriptionHtml: string;
    image: { url: string; altText: string; width: number; height: number } | null;
    seo: { title: string; description: string } | null;
  } | null>(initialMeta || null);

  // Global search & navbar states
  const [searchQuery, setSearchQuery] = useState("");
  const activeCategory = handle || "all";

  useEffect(() => {
    if (!initialProducts || initialProducts.length === 0) {
      async function loadProducts() {
        setLoading(true);
        setError("");
        try {
          const res = await fetch("/api/products");
          if (!res.ok) throw new Error("Failed to load products");
          const data = await res.json();
          setProducts(data);
        } catch (err: any) {
          console.error("Error loading products:", err);
          setError(err.message || "Failed to load products");
        } finally {
          setLoading(false);
        }
      }
      loadProducts();
    }
    setCurrentPage(1);
    setSelectedNicotines([]);
    setSelectedPuffs([]);
    setSelectedBrands([]);
    setIsGuideExpanded(false);
  }, [handle, initialProducts]);

  // Fetch Shopify collection metadata
  useEffect(() => {
    if (initialMeta) {
      setCollectionMeta(initialMeta);
    }
    if (!handle) return;
    async function loadCollectionMeta() {
      try {
        const res = await fetch(`/api/collections/${encodeURIComponent(handle)}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setCollectionMeta(data);
        } else if (!initialMeta) {
          setCollectionMeta(null);
        }
      } catch {
        if (!initialMeta) setCollectionMeta(null);
      }
    }
    loadCollectionMeta();
  }, [handle, initialMeta]);


  // Collection info — use Shopify data if available, otherwise fallback
  const { instances: templateInstances, isOverride: templateIsOverride } =
    useResolvedTemplate("collection", handle);

  /*
   * A collection can carry its own section layout in the `custom.page_sections`
   * metafield, saved from the admin's collections editor. When it does, that
   * layout replaces the theme's collection template for this page alone — order,
   * visibility and copy all come from the collection itself.
   *
   * The preview draft wins over the saved metafield, so the editor shows unsaved
   * edits live; with neither, the page renders the theme template exactly as it
   * always has.
   */
  const previewSections = useCollectionSectionsDraft(handle);
  const savedSections = useMemo(
    () => parseCollectionSections((collectionMeta as any)?.pageSections),
    [collectionMeta]
  );
  const { instances: sectionInstances, isOverride: sectionsAreOverride } = useMemo(
    () =>
      resolveCollectionSections(
        previewSections ?? savedSections,
        templateInstances,
        templateIsOverride
      ),
    [previewSections, savedSections, templateInstances, templateIsOverride]
  );

  const mainSettings = useMemo(
    () => instanceSettings(sectionInstances, "collectionMain"),
    [sectionInstances]
  );

  const CANONICAL_HANDLE_TITLES: Record<string, string> = {
    "juul-vape-dubai": "Juul Vape Dubai",
    "myle-vape-dubai": "Myle Vape Dubai",
    "disposable-vape": "Disposable Vape",
    "buy-50mg-disposable-vape-in-uae": "50MG Disposable",
    "buy-20mg-disposable-vape-uae": "20MG Disposable",
    "buy-0mg-disposable-vape-in-uae": "0MG Disposable",
    "50mg-disposable": "50MG Disposable",
    "20mg-disposable": "20MG Disposable",
    "0mg-disposable": "0MG Disposable",
    "vape-e-juice": "Vape E-Juice",
    "pod-system": "Pod System",
    "juul-1-series": "JUUL 1 Series",
    "juul-2-series": "JUUL 2 Series",
    "juul-pods-offers": "JUUL Pods Offers",
    "myle-v5-pods": "Myle V5 Pods",
    "myle-v5-device": "Myle V5 Device",
    "myle-disposable": "Myle Disposable",
    "al-fakher-vape": "Al Fakher Vape",
    "elf-bar-vape": "Elf Bar Vape",
    "fummo-vape": "Fummo Vape",
    "pod-salt-vape": "Pod Salt Vape",
    "vapes-bars": "Vapes Bars",
    "vozol-vape": "Vozol Vape",
    "tugboat-vape": "Tugboat Vape",
    "hqd-vape": "HQD Vape",
    "lost-mary-disposable": "Lost Mary Vape",
    "maskking-vape": "Maskking Vape",
    "geek-bar-disposable": "Geek Bar Vape",
    "yuoto-vape": "Yuoto Vape",
    "relx-vape": "Relx Vape",
    "nerd-vape": "Nerd Vape",
    "vgod-stig": "VGOD Stig Vape",
    "silvaper-vape": "Silvaper Vape",
    "salt-nicotine": "Salt Nicotine",
    "freebase-e-liquid": "Freebase E-Liquid",
    "pod-kit": "Pod Kit",
    "pod-cartridge": "Pod Cartridges",
    "vape-coils": "Vape Coils",
    "oxva-vape": "OXVA Vape",
    "uwell-vape": "Uwell Vape",
    "vaporesso-vape": "Vaporesso Vape",
    "smok-vape": "Smok Vape",
    "geek-vape": "GeekVape",
    "voopoo-vape": "VooPoo Vape",
    "best-seller-vape": "Best Sellers",
    "flash-sale": "Flash Sale",
    "brand": "Certified Vape Brands",
    "juul": "Juul Vape Dubai",
    "myle": "Myle Vape Dubai",
    "disposables": "Disposable Vape",
    "disposable": "Disposable Vape",
    "e-liquids": "Vape E-Juice",
    "e-liquid": "Vape E-Juice",
    "e-juice": "Vape E-Juice",
    "accessories": "Pod System",
    "pod-systems": "Pod System",
    "vape": "Vape Shop Dubai",
  };

  const collectionInfo = useMemo(() => {
    const hKey = (handle || "").toLowerCase();
    const defaultTitle = CANONICAL_HANDLE_TITLES[hKey]
      ? CANONICAL_HANDLE_TITLES[hKey]
      : handle
        ? handle.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
        : "Premium Vape Collections";

    // Determine categoryKey from handle
    let categoryKey = (handle || "all").toLowerCase();
    const hLower = (handle || "").toLowerCase();
    if (hLower.includes("juul")) categoryKey = "juul";
    else if (hLower.includes("myle")) categoryKey = "myle";
    else if (hLower.includes("disposable") || hLower.includes("fakher") || hLower.includes("elf-bar") || hLower.includes("tugboat") || hLower.includes("lost-mary") || hLower.includes("fummo") || hLower.includes("pod-salt") || hLower.includes("vapes-bars") || hLower.includes("vozol") || hLower.includes("hqd") || hLower.includes("geek-bar") || hLower.includes("yuoto") || hLower.includes("relx") || hLower.includes("nerd") || hLower.includes("vgod") || hLower.includes("silvaper") || hLower.includes("maskking")) categoryKey = "disposables";
    else if (hLower.includes("e-juice") || hLower.includes("e-liquid") || hLower.includes("salt-nicotine") || hLower.includes("freebase")) categoryKey = "e-liquids";
    else if (hLower.includes("pod-system") || hLower.includes("pod-kit") || hLower.includes("pod-cartridge") || hLower.includes("vape-coils")) categoryKey = "accessories";

    // Read collectionMain settings from Admin Customizer
    const defaultPillsForHandle = DEFAULT_COLLECTION_SUB_PILLS[hKey] || null;
    const configuredSubPills =
      (mainSettings.subPills ? parseSubPills(mainSettings.subPills as string) : null) ||
      (collectionMeta as any)?.subPillsJson ||
      defaultPillsForHandle ||
      null;

    // If Shopify data loaded, use it merged with customizer overrides
    if (collectionMeta && (collectionMeta.title || (collectionMeta as any).customHeading)) {
      const displayTitle = (mainSettings.customHeading as string) || CANONICAL_HANDLE_TITLES[hKey] || (collectionMeta as any).customHeading || collectionMeta.title || defaultTitle;
      let shortDesc = `Shop authentic ${displayTitle} devices, pods, and e-liquids at Vape Shop Dubai. 2-Hour fast delivery in Dubai.`;
      if (collectionMeta.description) {
        const firstSentence = collectionMeta.description.split(". ")[0];
        if (firstSentence && firstSentence.length > 15 && firstSentence.length < 180) {
          shortDesc = firstSentence.endsWith(".") ? firstSentence : `${firstSentence}.`;
        } else {
          shortDesc = collectionMeta.description.slice(0, 150).trim() + "...";
        }
      }

      let rawTitle = displayTitle;
      if (typeof rawTitle === "string" && rawTitle.trim().startsWith("{")) {
        rawTitle = CANONICAL_HANDLE_TITLES[hKey] || collectionMeta.title || defaultTitle;
      }

      return {
        title: rawTitle,
        description: shortDesc,
        descriptionHtml: (collectionMeta as any).seoGuideHtml || (mainSettings.seoGuideContent as string) || collectionMeta.descriptionHtml || "",
        image: collectionMeta.image,
        bannerImage: (collectionMeta as any).bannerImage || collectionMeta.image?.url || null,
        eyebrowText: (collectionMeta as any).eyebrowText || (mainSettings.customEyebrow as string) || null,
        flavorsWheelJson: (collectionMeta as any).flavorsWheelJson || (mainSettings.flavorsList ? (mainSettings.flavorsList as string).split(",").map(s => ({ name: s.trim(), query: s.trim() })) : null),
        faqsJson: (collectionMeta as any).faqsJson || null,
        subPillsJson: configuredSubPills,
        seo: collectionMeta.seo,
        categoryKey,
      };
    }

    // Fallback: hardcoded defaults per collection
    let fallbackTitle = defaultTitle;
    let fallbackDesc = `Shop authentic ${defaultTitle} devices, pods, and e-liquids at Vape Shop Dubai. 2-Hour fast delivery in Dubai.`;
    let fallbackDescHtml = "";
    let fallbackFaqsJson: Array<{ question: string; answer: string }> | null = null;

    return {
      title: fallbackTitle,
      description: fallbackDesc,
      descriptionHtml: fallbackDescHtml,
      faqsJson: (collectionMeta as any)?.faqsJson || fallbackFaqsJson,
      subPillsJson: configuredSubPills,
      image: null as { url: string; altText: string; width: number; height: number } | null,
      seo: null as { title: string; description: string } | null,
      categoryKey,
    };
  }, [handle, collectionMeta, sectionInstances]);

  // Canonical collection alias mapping for shorthand URLs to their exact Shopify backend collection handle
  const CANONICAL_COLLECTION_ALIASES: Record<string, string> = {
    juul: "juul-vape-dubai",
    myle: "myle-vape-dubai",
    disposable: "disposable-vape",
    disposables: "disposable-vape",
    "e-liquid": "vape-e-juice",
    "e-liquids": "vape-e-juice",
    "e-juice": "vape-e-juice",
    "pod-systems": "pod-system",
    accessories: "pod-system",
    "50mg-disposable": "buy-50mg-disposable-vape-in-uae",
    "20mg-disposable": "buy-20mg-disposable-vape-uae",
    "0mg-disposable": "buy-0mg-disposable-vape-in-uae",
    "50mg": "buy-50mg-disposable-vape-in-uae",
    "20mg": "buy-20mg-disposable-vape-uae",
    "0mg": "buy-0mg-disposable-vape-in-uae",
  };

  // Base collection products for THIS specific page/handle — resolved via shared matching engine
  const collectionProducts = useMemo(() => {
    return getMatchingCollectionProducts(products, handle);
  }, [products, handle]);

  const toggleSeries = (s: string) => {
    setSelectedSeries((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  // Dynamic filter options generated ONLY from products present inside this specific collection
  const filterOptions = useMemo(() => {
    const puffsSet = new Set<string>();
    const brandsSet = new Set<string>();
    const categoriesSet = new Set<string>();
    const seriesSet = new Set<string>();
    let maxP = 0;

    // Manual admin override from Theme Customizer or Shopify metafield for Nicotines
    const customNicsSetting =
      (typeof mainSettings.customNicotines === "string" ? mainSettings.customNicotines.trim() : "") ||
      (typeof (collectionMeta as any)?.customNicotines === "string" ? (collectionMeta as any).customNicotines.trim() : "");

    let nicotineOptions: string[] = [];

    if (customNicsSetting) {
      nicotineOptions = customNicsSetting
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    } else {
      const nicsSet = new Set<string>();
      collectionProducts.forEach((p) => {
        const detected = detectProductNicotines(p);
        detected.forEach((n) => nicsSet.add(n));
      });
      nicotineOptions = sortNicotines(Array.from(nicsSet));
    }

    // Manual admin override from Theme Customizer or Shopify metafield for Capacities / ML
    const customCapsSetting =
      (typeof mainSettings.customCapacities === "string" ? mainSettings.customCapacities.trim() : "") ||
      (typeof (collectionMeta as any)?.customCapacities === "string" ? (collectionMeta as any).customCapacities.trim() : "");

    let capacityOptions: string[] = [];

    if (customCapsSetting) {
      capacityOptions = customCapsSetting
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    } else {
      const capsSet = new Set<string>();
      collectionProducts.forEach((p) => {
        const detected = detectProductCapacities(p);
        detected.forEach((c) => capsSet.add(c));
      });
      capacityOptions = sortCapacities(Array.from(capsSet));
    }

    collectionProducts.forEach((p) => {
      const nameL = p.name.toLowerCase();

      // Auto Series / Product Line Detection for JUUL & MYLE
      if (nameL.includes("juul 1") || (nameL.includes("juul") && !nameL.includes("juul 2") && !nameL.includes("juul2"))) {
        seriesSet.add("JUUL 1 Series");
      }
      if (nameL.includes("juul 2") || nameL.includes("juul2")) {
        seriesSet.add("JUUL 2 Series");
      }
      if (nameL.includes("v5") || nameL.includes("meta v5")) {
        seriesSet.add("MYLE Meta V5");
      }
      if (nameL.includes("micro")) {
        seriesSet.add("MYLE Micro");
      }
      if (nameL.includes("drip")) {
        seriesSet.add("MYLE Drip");
      }
      if (nameL.includes("meta box") || nameL.includes("myle box")) {
        seriesSet.add("MYLE Meta Box");
      }

      if (p.puffs) puffsSet.add(p.puffs);
      if (p.brand) brandsSet.add(p.brand);
      if (p.category) categoriesSet.add(p.category);
      if (p.price > maxP) maxP = p.price;
    });

    return {
      nicotines: nicotineOptions,
      capacities: capacityOptions,
      puffs: Array.from(puffsSet).filter(Boolean),
      brands: Array.from(brandsSet).filter(Boolean),
      categories: Array.from(categoriesSet).filter(Boolean),
      series: Array.from(seriesSet).filter(Boolean),
      maxFoundPrice: maxP || 2000
    };
  }, [collectionProducts, mainSettings.customNicotines, mainSettings.customCapacities, collectionMeta]);

  // Initialize maxPrice slider default
  useEffect(() => {
    if (filterOptions.maxFoundPrice > 0) {
      setMaxPrice(filterOptions.maxFoundPrice);
    }
  }, [filterOptions]);

  // Filter and Sort logic
  const filteredProducts = useMemo(() => {
    let result = collectionProducts.filter((p) => {
      const prodNameLower = p.name.toLowerCase();
      const prodBrandLower = (p.brand || "").toLowerCase();
      const prodSectionLower = (p.section || "").toLowerCase();
      const prodCatLower = (p.category || "").toLowerCase();

      // Series filter
      let matchSeries = true;
      if (selectedSeries.length > 0) {
        matchSeries = selectedSeries.some((ser) => {
          const serL = ser.toLowerCase();
          if (serL.includes("juul 1")) return prodNameLower.includes("juul") && !prodNameLower.includes("juul 2") && !prodNameLower.includes("juul2");
          if (serL.includes("juul 2")) return prodNameLower.includes("juul 2") || prodNameLower.includes("juul2");
          if (serL.includes("meta v5")) return prodNameLower.includes("v5") || prodNameLower.includes("meta");
          if (serL.includes("micro")) return prodNameLower.includes("micro");
          if (serL.includes("drip")) return prodNameLower.includes("drip");
          if (serL.includes("box")) return prodNameLower.includes("box");
          return prodNameLower.includes(serL);
        });
      }

      // Nicotine filter
      const matchNic = productMatchesNicotine(p, selectedNicotines);

      // Capacity (ml) filter
      const matchCapacity = productMatchesCapacity(p, selectedCapacities);

      // Puffs filter
      const matchPuff = selectedPuffs.length === 0 || (p.puffs && selectedPuffs.includes(p.puffs));

      // Brand filter
      const matchBrand = selectedBrands.length === 0 || (p.brand && selectedBrands.includes(p.brand));

      // Category filter
      const matchCategory = selectedCategories.length === 0 || (p.category && selectedCategories.includes(p.category));

      // In stock filter
      const matchStock = !inStockOnly || !p.isSoldOut;

      // Price filter
      const matchPrice = p.price <= maxPrice;

      // Sub-item filter from URL
      let matchSub = true;
      if (subFilter) {
        const subLower = subFilter.toLowerCase();
        const cleanSub = subLower.replace("vape", "").replace("bar", "").trim();
        matchSub = prodBrandLower.includes(cleanSub) || prodNameLower.includes(cleanSub) || prodSectionLower.includes(cleanSub);
      }

      // Active Pill Filter (In-Page State)
      let matchPill = true;
      if (activePillFilter && activePillFilter !== "all") {
        const cleanPill = activePillFilter.toLowerCase().replace("all", "").trim();
        if (cleanPill) {
          const pillInCollections = (p.collections || []).some((c) => {
            const cLower = c.toLowerCase();
            return cLower === cleanPill || cLower.includes(cleanPill);
          });
          const pillInTags = (p.tags || []).some((t: string) => {
            const tLower = t.toLowerCase();
            return tLower === cleanPill || tLower.includes(cleanPill);
          });
          const matchSpecial =
            (cleanPill === "device" && (prodNameLower.includes("kit") || prodNameLower.includes("device"))) ||
            (cleanPill === "pods" && (prodNameLower.includes("pod") || prodNameLower.includes("cartridge"))) ||
            (cleanPill === "flash-sale" && ((p.originalPrice ?? 0) > p.price || prodSectionLower.includes("flash") || (p.collections || []).includes("flash-sale"))) ||
            (cleanPill === "juul 1" && prodNameLower.includes("juul") && !prodNameLower.includes("juul 2") && !prodNameLower.includes("juul2")) ||
            (cleanPill === "juul 2" && (prodNameLower.includes("juul 2") || prodNameLower.includes("juul2")));

          matchPill = pillInCollections ||
            pillInTags ||
            matchSpecial ||
            prodNameLower.includes(cleanPill) ||
            prodBrandLower.includes(cleanPill) ||
            prodSectionLower.includes(cleanPill) ||
            prodCatLower.includes(cleanPill);
        }
      }

      // Search query filter
      const matchSearch = !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchSeries && matchNic && matchCapacity && matchPuff && matchBrand && matchCategory && matchStock && matchPrice && matchSub && matchPill && matchSearch;
    });

    // Sorting
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      result.sort((a, b) => {
        if (a.isPopular && !b.isPopular) return -1;
        if (!a.isPopular && b.isPopular) return 1;
        return b.reviews - a.reviews;
      });
    }

    return result;
  }, [collectionProducts, selectedSeries, selectedNicotines, selectedCapacities, selectedPuffs, selectedBrands, selectedCategories, inStockOnly, maxPrice, sortBy, subFilter, searchQuery, activePillFilter]);

  // Both come from the collection template's Product Grid section.
  const ITEMS_PER_PAGE = Number(mainSettings.itemsPerPage) || 12;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedNicotines, selectedCapacities, selectedPuffs, selectedBrands, selectedCategories, inStockOnly, maxPrice, sortBy, subFilter, searchQuery, activePillFilter, handle]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const toggleNicotine = (nic: string) => {
    setSelectedNicotines((prev) =>
      prev.includes(nic) ? prev.filter((item) => item !== nic) : [...prev, nic]
    );
  };

  const toggleCapacity = (cap: string) => {
    setSelectedCapacities((prev) =>
      prev.includes(cap) ? prev.filter((item) => item !== cap) : [...prev, cap]
    );
  };

  const togglePuff = (puff: string) => {
    setSelectedPuffs((prev) =>
      prev.includes(puff) ? prev.filter((item) => item !== puff) : [...prev, puff]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((item) => item !== brand) : [...prev, brand]
    );
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((item) => item !== cat) : [...prev, cat]
    );
  };

  const handleClearFilters = () => {
    setSelectedNicotines([]);
    setSelectedCapacities([]);
    setSelectedPuffs([]);
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedSeries([]);
    setInStockOnly(false);
    setMaxPrice(filterOptions.maxFoundPrice);
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      variantId: product.variantId,
      handle: product.handle,
    });
  };

  const handleBuyNow = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      variantId: product.variantId,
      handle: product.handle,
    });
    setIsCartOpen(false);
    router.push("/checkout");
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground" suppressHydrationWarning>
      <Suspense fallback={null}>
        <SearchParamsListener onSync={handleSearchParamsSync} />
      </Suspense>
      {/* Navbar */}
      <Navbar
        onCategorySelect={(c) => {
          router.push(c === "all" ? "/shop" : `/collections/${c}`);
        }}
        activeCategory={activeCategory}
      />

      <main className="flex-grow pb-24 pt-[92px]" suppressHydrationWarning>
        {/* Slim Collection Header Bar (Exact Reference Match) */}
        {!(handle === "brand" || handle === "brands") && (
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
            <div className="bg-card border border-border/50 rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-xs">

              {/* Top Row: Breadcrumb & Title Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3">
                <nav className="flex flex-wrap items-center gap-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Link href="/" className="hover:text-primary transition-colors shrink-0">
                    HOME
                  </Link>
                  <span className="text-muted-foreground/40 shrink-0 font-light">/</span>
                  <Link href="/shop" className="hover:text-primary transition-colors shrink-0">
                    PRODUCTS
                  </Link>
                  <span className="text-muted-foreground/40 shrink-0 font-light">/</span>
                  <span className="text-foreground font-bold shrink-0">{collectionInfo.title}</span>
                </nav>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-widest border border-primary/20">
                    Products Of {collectionInfo.title}
                  </span>
                </div>
              </div>

              {/* Main Collection Heading H1 (from Shopify Backend) */}
              <div className="pt-1 pb-1">
                {/<h1[^>]*>/i.test(collectionInfo.descriptionHtml || "") ? (
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-foreground tracking-tight m-0">
                    {collectionInfo.title}
                  </div>
                ) : (
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-foreground tracking-tight m-0">
                    {collectionInfo.title}
                  </h1>
                )}
              </div>

              {/* Bottom Row: Horizontal Scrollable Sub-Category & Brand Filter Pills (Configured in Shopify Backend) */}
              {collectionInfo.subPillsJson && collectionInfo.subPillsJson.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-0.5 pb-0.5">
                  {collectionInfo.subPillsJson.map((pill: any, idx: number) => {
                    const isActive = activePillFilter === pill.query || (activePillFilter === "all" && pill.query === "all");
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setActivePillFilter(pill.query);
                        }}
                        className={`shrink-0 text-xs font-bold px-4 py-1.5 rounded-full transition-all duration-300 cursor-pointer shadow-2xs ${isActive
                          ? "bg-primary text-white font-black scale-105 shadow-md border border-primary"
                          : "bg-background border border-border/70 text-foreground hover:border-primary hover:bg-primary/10 hover:text-primary hover:scale-105"
                          }`}
                      >
                        {pill.label}
                      </button>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        )}

        {/* Catalog Section (For product collections; Brand Directory renders via brandDirectoryShowcase template section) */}
        {!(handle === "brand" || handle === "brands") && (
          <div id="catalog-top" className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

              {/* Filter Sidebar (Desktop) */}
              <div className="hidden lg:block space-y-6">
                <div className="bg-card border border-border/40 rounded-3xl p-6 space-y-6 shadow-sm sticky top-28">

                  <div className="flex items-center justify-between pb-4 border-b border-border/40">
                    <h3 className="font-serif font-bold text-lg flex items-center gap-2 text-foreground">
                      <SlidersHorizontal className="h-4 w-4 text-primary" /> Filters
                    </h3>
                    {(selectedNicotines.length > 0 ||
                      selectedCapacities.length > 0 ||
                      selectedPuffs.length > 0 ||
                      selectedBrands.length > 0 ||
                      selectedCategories.length > 0 ||
                      selectedSeries.length > 0 ||
                      inStockOnly ||
                      maxPrice !== filterOptions.maxFoundPrice) && (
                        <button
                          onClick={handleClearFilters}
                          className="text-[10px] font-bold text-primary uppercase hover:underline cursor-pointer"
                        >
                          Clear All
                        </button>
                      )}
                  </div>

                  {/* Filters Content */}
                  <div className="space-y-6">
                    {/* Price range filter */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
                        <span>Max Price:</span>
                        <span className="text-primary font-bold">Dhs. {maxPrice}</span>
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={filterOptions.maxFoundPrice}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                        <span>0 AED</span>
                        <span>{filterOptions.maxFoundPrice} AED</span>
                      </div>
                    </div>

                    {/* Availability Toggle */}
                    <div className="space-y-3 pt-4 border-t border-border/40">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Availability:</p>
                      <label className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer text-foreground group">
                        <input
                          type="checkbox"
                          checked={inStockOnly}
                          onChange={(e) => setInStockOnly(e.target.checked)}
                          className="accent-primary h-4 w-4 rounded border-border focus:ring-0 cursor-pointer"
                        />
                        <span className="group-hover:text-primary transition-colors">In Stock Only</span>
                      </label>
                    </div>

                    {/* Category List (Only displayed if handle is "all" or general shop page) */}
                    {collectionInfo.categoryKey === "all" && filterOptions.categories.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-border/40">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category:</p>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {filterOptions.categories.map((cat) => {
                            const label = cat === "juul" ? "JUUL Pods & Kits" : cat === "disposables" ? "Disposables" : cat === "e-liquids" ? "Premium E-Liquids" : "Kits & Hardware";
                            return (
                              <label key={cat} className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer text-foreground group">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.includes(cat)}
                                  onChange={() => toggleCategory(cat)}
                                  className="accent-primary h-4 w-4 rounded border-border focus:ring-0 cursor-pointer"
                                />
                                <span className="group-hover:text-primary transition-colors capitalize">{label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Series / Sub-Model Checklist (JUUL 1, JUUL 2, MYLE V5, etc.) */}
                    {filterOptions.series.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-border/40">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Series / Model:</p>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {filterOptions.series.map((ser) => (
                            <label key={ser} className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer text-foreground group">
                              <input
                                type="checkbox"
                                checked={selectedSeries.includes(ser)}
                                onChange={() => toggleSeries(ser)}
                                className="accent-primary h-4 w-4 rounded border-border focus:ring-0 cursor-pointer"
                              />
                              <span className="group-hover:text-primary transition-colors">{ser}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Brand Checklist (Only shown if current collection has multiple brands) */}
                    {filterOptions.brands.length > 1 && (
                      <div className="space-y-3 pt-4 border-t border-border/40">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Brand:</p>
                        <div className="space-y-2 max-h-44 overflow-y-auto pr-1 scrollbar-thin">
                          {filterOptions.brands.map((brand) => (
                            <label key={brand} className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer text-foreground group">
                              <input
                                type="checkbox"
                                checked={selectedBrands.includes(brand)}
                                onChange={() => toggleBrand(brand)}
                                className="accent-primary h-4 w-4 rounded border-border focus:ring-0 cursor-pointer"
                              />
                              <span className="group-hover:text-primary transition-colors">{brand}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Nicotine strengths Checklist */}
                    {filterOptions.nicotines.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-border/40">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nicotine Strength:</p>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {filterOptions.nicotines.map((nic) => (
                            <label key={nic} className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer text-foreground group">
                              <input
                                type="checkbox"
                                checked={selectedNicotines.includes(nic)}
                                onChange={() => toggleNicotine(nic)}
                                className="accent-primary h-4 w-4 rounded border-border focus:ring-0 cursor-pointer"
                              />
                              <span className="group-hover:text-primary transition-colors">{nic}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Capacity / Size (ml) Checklist */}
                    {filterOptions.capacities.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-border/40">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Capacity / Size (ml):</p>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {filterOptions.capacities.map((cap) => (
                            <label key={cap} className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer text-foreground group">
                              <input
                                type="checkbox"
                                checked={selectedCapacities.includes(cap)}
                                onChange={() => toggleCapacity(cap)}
                                className="accent-primary h-4 w-4 rounded border-border focus:ring-0 cursor-pointer"
                              />
                              <span className="group-hover:text-primary transition-colors">{cap}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Puffs list Checklist */}
                    {filterOptions.puffs.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-border/40">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Puffs Capacity:</p>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {filterOptions.puffs.map((puff) => (
                            <label key={puff} className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer text-foreground group">
                              <input
                                type="checkbox"
                                checked={selectedPuffs.includes(puff)}
                                onChange={() => togglePuff(puff)}
                                className="accent-primary h-4 w-4 rounded border-border focus:ring-0 cursor-pointer"
                              />
                              <span className="group-hover:text-primary transition-colors">{puff}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Products Feed & Toolbar */}
              <div className="lg:col-span-3 space-y-6">

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/40 px-4 sm:px-6 py-4 rounded-3xl shadow-sm">
                  <p className="text-xs font-bold text-foreground text-center sm:text-left">
                    Showing <span className="text-primary">{paginatedProducts.length}</span> of {filteredProducts.length} premium products
                  </p>

                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                    {/* Mobile Filters Trigger */}
                    <button
                      onClick={() => setIsMobileFiltersOpen(true)}
                      className="lg:hidden flex items-center justify-center gap-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95 flex-grow sm:flex-grow-0"
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
                      {(selectedNicotines.length > 0 ||
                        selectedCapacities.length > 0 ||
                        selectedPuffs.length > 0 ||
                        selectedBrands.length > 0 ||
                        selectedCategories.length > 0 ||
                        selectedSeries.length > 0 ||
                        inStockOnly ||
                        maxPrice !== filterOptions.maxFoundPrice) && (
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                    </button>

                    {/* Sort selector */}
                    <div className="flex items-center gap-2 flex-grow sm:flex-grow-0 justify-end">
                      <span className="text-xs text-muted-foreground font-semibold hidden sm:inline">Sort By:</span>
                      <div className="relative w-full sm:w-auto">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl text-xs font-bold px-3.5 py-2 pr-8 appearance-none cursor-pointer hover:border-primary focus:outline-none text-foreground"
                        >
                          <option value="popular">Popularity</option>
                          <option value="price-low">Price: Low to High</option>
                          <option value="price-high">Price: High to Low</option>
                          <option value="rating">Average Rating</option>
                        </select>
                        <ChevronDown className="h-3 w-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid content */}
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="animate-pulse bg-card border border-border/40 rounded-[2rem] p-5 flex flex-col gap-4 min-h-[350px]">
                        <div className="bg-muted rounded-[1.5rem] h-48 w-full animate-pulse" />
                        <div className="h-3 bg-muted rounded w-1/4 animate-pulse" />
                        <div className="h-5 bg-muted rounded w-3/4 animate-pulse" />
                        <div className="h-10 bg-muted rounded-full w-full mt-auto animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="bg-card border border-border/40 rounded-[2rem] p-12 text-center flex flex-col items-center justify-center">
                    <p className="text-base font-bold text-foreground">No Products Found</p>
                    <p className="text-xs text-muted-foreground mt-2 max-w-xs">
                      Try adjusting your filters or search keywords to view matching premium vapes.
                    </p>
                    <button
                      onClick={handleClearFilters}
                      className="mt-6 text-xs uppercase tracking-widest bg-primary text-white font-bold px-5 py-3 rounded-full hover:bg-gold-shimmer transition-all cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                      {paginatedProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onAddToCart={handleAddToCart}
                          onBuyNow={handleBuyNow}
                        />
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-10 pb-4">
                        <button
                          onClick={() => {
                            if (currentPage > 1) {
                              setCurrentPage((prev) => prev - 1);
                              const el = document.getElementById("catalog-top");
                              if (el) {
                                const yOffset = -100;
                                const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                                window.scrollTo({ top: y, behavior: "smooth" });
                              }
                            }
                          }}
                          disabled={currentPage === 1}
                          className="p-2 sm:p-2.5 rounded-xl border border-border bg-card text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary hover:text-white transition-colors cursor-pointer"
                          aria-label="Previous page"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>

                        {(() => {
                          const pages: (number | string)[] = [];
                          if (totalPages <= 5) {
                            for (let i = 1; i <= totalPages; i++) pages.push(i);
                          } else if (currentPage <= 3) {
                            pages.push(1, 2, 3, 4, "...", totalPages);
                          } else if (currentPage >= totalPages - 2) {
                            pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                          } else {
                            pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
                          }

                          return pages.map((item, idx) =>
                            typeof item === "number" ? (
                              <button
                                key={idx}
                                onClick={() => {
                                  setCurrentPage(item);
                                  const el = document.getElementById("catalog-top");
                                  if (el) {
                                    const yOffset = -100;
                                    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                                    window.scrollTo({ top: y, behavior: "smooth" });
                                  }
                                }}
                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-xs font-bold transition-all cursor-pointer ${item === currentPage
                                  ? "bg-primary text-white shadow-md scale-105 font-black"
                                  : "bg-card border border-border text-foreground hover:bg-primary/10 hover:text-primary"
                                  }`}
                              >
                                {item}
                              </button>
                            ) : (
                              <span key={idx} className="px-1 text-xs text-muted-foreground font-bold select-none">
                                ...
                              </span>
                            )
                          );
                        })()}

                        <button
                          onClick={() => {
                            if (currentPage < totalPages) {
                              setCurrentPage((prev) => prev + 1);
                              const el = document.getElementById("catalog-top");
                              if (el) {
                                const yOffset = -100;
                                const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                                window.scrollTo({ top: y, behavior: "smooth" });
                              }
                            }
                          }}
                          disabled={currentPage === totalPages}
                          className="p-2 sm:p-2.5 rounded-xl border border-border bg-card text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary hover:text-white transition-colors cursor-pointer"
                          aria-label="Next page"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}

              </div>

            </div>
          </div>
        )}



        {/* Collection Description (from Shopify) — Buying Guide & FAQs placed above dynamic sections for normal collections */}
        {!(handle === "brand" || handle === "brands" || handle === "vape-brands" || handle.includes("vape-brands")) && collectionInfo.descriptionHtml && (
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3">
            <div className="bg-card border border-border/50 rounded-[2rem] p-5 sm:p-7 lg:p-8 relative overflow-hidden shadow-sm transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10" />

              {/* Header Badges & Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-border/40">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase px-3.5 py-1 rounded-full">
                    Buying Guide &amp; FAQs
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Updated Guide</span>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-black text-foreground tracking-tight mb-4">
                About {collectionInfo.title}
              </h2>

              {/* Full Unclamped Guide Content */}
              <div>
                <div
                  className="product-description-content text-sm sm:text-base text-foreground leading-relaxed prose prose-sm sm:prose-base max-w-none 
                    [&_h1]:text-xl [&_h1]:sm:text-2xl [&_h1]:font-serif [&_h1]:font-black [&_h1]:text-foreground [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:border-l-4 [&_h1]:border-primary [&_h1]:pl-3.5
                    [&_h2]:text-lg [&_h2]:sm:text-xl [&_h2]:font-serif [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:border-l-4 [&_h2]:border-primary [&_h2]:pl-3
                    [&_h3]:text-base [&_h3]:sm:text-lg [&_h3]:font-serif [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:border-l-4 [&_h3]:border-primary/70 [&_h3]:pl-2.5
                    [&_h4]:text-sm [&_h4]:font-bold [&_h4]:text-foreground [&_h4]:mt-4 [&_h4]:mb-1.5
                    [&_p]:mb-4 [&_p]:text-foreground/95 [&_p]:leading-relaxed [&_p]:text-justify [&_p]:[text-align-last:left]
                    [&_li]:text-foreground/95 [&_li]:text-justify [&_li]:[text-align-last:left]
                    [&_a]:text-primary [&_a]:font-bold [&_a]:underline [&_a]:decoration-primary/60 [&_a]:underline-offset-4 hover:[&_a]:decoration-primary hover:[&_a]:text-primary/80 transition-all
                    [&_strong]:font-bold [&_strong]:text-foreground
                    [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:mb-4
                    [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ol]:mb-4
                    [&_table]:w-full [&_table]:text-left [&_table]:border-collapse
                    [&_thead]:bg-primary [&_thead]:text-white
                    [&_th]:p-4 [&_th]:sm:p-5 [&_th]:text-xs [&_th]:sm:text-sm [&_th]:font-extrabold [&_th]:tracking-wider [&_th]:uppercase [&_th]:text-white [&_th]:border-b [&_th]:border-white/20
                    [&_td]:p-3.5 [&_td]:sm:p-4 [&_td]:text-xs [&_td]:sm:text-sm [&_td]:border-b [&_td]:border-border/30 [&_td]:text-foreground [&_tr:last-child_td]:border-b-0
                    [&_td:first-child]:font-bold [&_td:first-child]:text-foreground
                    [&_tr:nth-child(even)]:bg-primary/5 hover:[&_tr]:bg-primary/10 [&_tr]:transition-colors
                    [&_img]:rounded-2xl [&_img]:p-1.5 [&_img]:sm:p-2 [&_img]:bg-muted/20 [&_img]:border [&_img]:border-border/40 [&_img]:shadow-sm [&_img]:my-6 [&_img]:mx-auto [&_img]:w-full [&_img]:h-auto"
                  dangerouslySetInnerHTML={{ __html: cleanDescriptionHtml(collectionInfo.descriptionHtml) }}
                />
              </div>

            </div>
          </div>
        )}

        {/* Everything below the product grid is controlled by this collection's
            own layout when it has one (Admin → Collections, saved to the
            collection's metafield), and by the theme's collection template
            otherwise. Sections needing page data are passed in as slots. */}
        <TemplateSections
          instances={sectionInstances}
          isOverride={sectionsAreOverride}
          context={{ handle, collectionTitle: collectionInfo.title }}
          slots={{
            collectionMain: null,
            brandDirectoryShowcase: (settings: Record<string, unknown>) => (
              <BrandSphere3D settings={settings as never} />
            ),
            whyShop: (settings: Record<string, unknown>) => (
              <>
                {(handle === "brand" || handle === "brands" || handle === "vape-brands" || handle.includes("vape-brands")) && collectionInfo.descriptionHtml && (
                  <div className="mb-6">
                    <div className="bg-card border border-border/50 rounded-[2rem] p-5 sm:p-7 lg:p-8 relative overflow-hidden shadow-sm transition-all duration-300">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10" />

                      {/* Header Badges & Title */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-border/40">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase px-3.5 py-1 rounded-full">
                            Buying Guide &amp; FAQs
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Updated Guide</span>
                        </div>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-serif font-black text-foreground tracking-tight mb-4">
                        About {collectionInfo.title}
                      </h2>

                      {/* Full Unclamped Guide Content */}
                      <div>
                        <div
                          className="product-description-content text-sm sm:text-base text-foreground leading-relaxed prose prose-sm sm:prose-base max-w-none 
                            [&_h1]:text-xl [&_h1]:sm:text-2xl [&_h1]:font-serif [&_h1]:font-black [&_h1]:text-foreground [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:border-l-4 [&_h1]:border-primary [&_h1]:pl-3.5
                            [&_h2]:text-lg [&_h2]:sm:text-xl [&_h2]:font-serif [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:border-l-4 [&_h2]:border-primary [&_h2]:pl-3
                            [&_h3]:text-base [&_h3]:sm:text-lg [&_h3]:font-serif [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:border-l-4 [&_h3]:border-primary/70 [&_h3]:pl-2.5
                            [&_h4]:text-sm [&_h4]:font-bold [&_h4]:text-foreground [&_h4]:mt-4 [&_h4]:mb-1.5
                            [&_p]:mb-4 [&_p]:text-foreground/95 [&_p]:leading-relaxed [&_p]:text-justify [&_p]:[text-align-last:left]
                            [&_li]:text-foreground/95 [&_li]:text-justify [&_li]:[text-align-last:left]
                            [&_a]:text-primary [&_a]:font-bold [&_a]:underline [&_a]:decoration-primary/60 [&_a]:underline-offset-4 hover:[&_a]:decoration-primary hover:[&_a]:text-primary/80 transition-all
                            [&_strong]:font-bold [&_strong]:text-foreground
                            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:mb-4
                            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ol]:mb-4
                            [&_table]:w-full [&_table]:text-left [&_table]:border-collapse
                            [&_thead]:bg-primary [&_thead]:text-white
                            [&_th]:p-4 [&_th]:sm:p-5 [&_th]:text-xs [&_th]:sm:text-sm [&_th]:font-extrabold [&_th]:tracking-wider [&_th]:uppercase [&_th]:text-white [&_th]:border-b [&_th]:border-white/20
                            [&_td]:p-3.5 [&_td]:sm:p-4 [&_td]:text-xs [&_td]:sm:text-sm [&_td]:border-b [&_td]:border-border/30 [&_td]:text-foreground [&_tr:last-child_td]:border-b-0
                            [&_td:first-child]:font-bold [&_td:first-child]:text-foreground
                            [&_tr:nth-child(even)]:bg-primary/5 hover:[&_tr]:bg-primary/10 [&_tr]:transition-colors
                            [&_img]:rounded-2xl [&_img]:p-1.5 [&_img]:sm:p-2 [&_img]:bg-muted/20 [&_img]:border [&_img]:border-border/40 [&_img]:shadow-sm [&_img]:my-6 [&_img]:mx-auto [&_img]:w-full [&_img]:h-auto"
                          dangerouslySetInnerHTML={{ __html: cleanDescriptionHtml(collectionInfo.descriptionHtml) }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                <WhyShopWithUs settings={settings as never} />
              </>
            ),
            disposableShowcase: (settings: Record<string, unknown>) => (
              <DisposableBrandsShowcase settings={settings as never} />
            ),
            disposableComparison: (settings: Record<string, unknown>) => (
              <DisposableComparisonSections settings={settings as never} />
            ),
            ejuiceShowcase: (settings: Record<string, unknown>) => (
              <EJuiceBrandsShowcase settings={settings as never} />
            ),
            juulSignatureFlavors: (settings: Record<string, unknown>) => (
              <JuulSignatureFlavorsSection handle={handle} settings={settings as never} />
            ),
            juulPackagingCompare: (settings: Record<string, unknown>) => (
              <JuulPackagingCompareSection settings={settings as never} />
            ),
            juulTechSpecs: (settings: Record<string, unknown>) => (
              <JuulTechSpecsSection handle={handle} settings={settings as never} />
            ),
            juulCrispMenthol: (settings: Record<string, unknown>) => (
              <JuulCrispMentholSections productName={collectionInfo.title} settings={settings as never} />
            ),
            juulCollectionFeature1: (settings: Record<string, unknown>) => (
              <JuulCustomFeatureSection settings={settings as never} />
            ),
            juulCollectionFeature2: (settings: Record<string, unknown>) => (
              <JuulCustomFeatureSection settings={settings as never} reverseLayout />
            ),
            bottomCollectionGrid: (settings: Record<string, unknown>) => (
              <BottomCollectionGrid handle={handle} settings={settings as never} />
            ),
            flavorsWheel: (settings: Record<string, unknown>) => (
              <FlavorsWheel
                eyebrow={typeof settings?.eyebrow === "string" ? settings.eyebrow : undefined}
                heading={typeof settings?.heading === "string" ? settings.heading : undefined}
                description={typeof settings?.description === "string" ? settings.description : undefined}
                buttonText={typeof settings?.buttonText === "string" ? settings.buttonText : undefined}
                buttonHref={typeof settings?.buttonHref === "string" ? settings.buttonHref : undefined}
                flavors={Array.isArray((collectionInfo as any)?.flavorsWheelJson) ? (collectionInfo as any).flavorsWheelJson : Array.isArray(settings?.flavors) ? (settings.flavors as any) : undefined}
              />
            ),
            faq: (settings: Record<string, unknown>) => (
              <FAQSection
                settings={settings as never}
                collectionFaqs={(collectionInfo as any)?.faqsJson || undefined}
                hideIfEmpty={true}
              />
            ),
            juulAppIntegration: (settings: Record<string, unknown>) => (
              <JuulAppIntegrationSection settings={settings as never} />
            ),
            myleVerification: (settings: Record<string, unknown>) => (
              <MyleVerificationSection settings={settings as never} />
            ),
            customerReviews: (settings: Record<string, unknown>) => (
              <CustomerReviewsSection
                collectionName={collectionInfo.title}
                settings={settings as never}
              />
            ),
          }}
        />

      </main>

      {/* Mobile Filters Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileFiltersOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          />

          {/* Drawer Body */}
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm h-full bg-background flex flex-col shadow-2xl transition-transform duration-300 translate-x-0 border-l border-border">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h3 className="font-serif font-bold text-lg flex items-center gap-2 text-foreground">
                <SlidersHorizontal className="h-4 w-4 text-primary" /> Filters
              </h3>
              <div className="flex items-center gap-4">
                {(selectedNicotines.length > 0 ||
                  selectedCapacities.length > 0 ||
                  selectedPuffs.length > 0 ||
                  selectedBrands.length > 0 ||
                  selectedCategories.length > 0 ||
                  selectedSeries.length > 0 ||
                  inStockOnly ||
                  maxPrice !== filterOptions.maxFoundPrice) && (
                    <button
                      onClick={handleClearFilters}
                      className="text-[10px] font-bold text-primary uppercase hover:underline"
                    >
                      Clear
                    </button>
                  )}
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Filters List */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Price range filter */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
                  <span>Max Price:</span>
                  <span className="text-primary font-bold">Dhs. {maxPrice}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={filterOptions.maxFoundPrice}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                  <span>0 AED</span>
                  <span>{filterOptions.maxFoundPrice} AED</span>
                </div>
              </div>

              {/* Availability Toggle */}
              <div className="space-y-3 pt-4 border-t border-border/40">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Availability:</p>
                <label className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer text-foreground group">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="accent-primary h-4 w-4 rounded border-border focus:ring-0 cursor-pointer"
                  />
                  <span className="group-hover:text-primary transition-colors">In Stock Only</span>
                </label>
              </div>

              {/* Category List */}
              {collectionInfo.categoryKey === "all" && filterOptions.categories.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-border/40">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category:</p>
                  <div className="space-y-2">
                    {filterOptions.categories.map((cat) => {
                      const label = cat === "juul" ? "JUUL Pods & Kits" : cat === "disposables" ? "Disposables" : cat === "e-liquids" ? "Premium E-Liquids" : "Kits & Hardware";
                      return (
                        <label key={cat} className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer text-foreground group">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat)}
                            onChange={() => toggleCategory(cat)}
                            className="accent-primary h-4 w-4 rounded border-border focus:ring-0 cursor-pointer"
                          />
                          <span className="group-hover:text-primary transition-colors capitalize">{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Brand Checklist */}
              {filterOptions.brands.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-border/40">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Brand:</p>
                  <div className="space-y-2">
                    {filterOptions.brands.map((brand) => (
                      <label key={brand} className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer text-foreground group">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="accent-primary h-4 w-4 rounded border-border focus:ring-0 cursor-pointer"
                        />
                        <span className="group-hover:text-primary transition-colors">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Nicotine strengths Checklist */}
              {filterOptions.nicotines.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-border/40">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nicotine Strength:</p>
                  <div className="space-y-2">
                    {filterOptions.nicotines.map((nic) => (
                      <label key={nic} className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer text-foreground group">
                        <input
                          type="checkbox"
                          checked={selectedNicotines.includes(nic)}
                          onChange={() => toggleNicotine(nic)}
                          className="accent-primary h-4 w-4 rounded border-border focus:ring-0 cursor-pointer"
                        />
                        <span className="group-hover:text-primary transition-colors">{nic}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Capacity / Size (ml) Checklist */}
              {filterOptions.capacities.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-border/40">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Capacity / Size (ml):</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {filterOptions.capacities.map((cap) => (
                      <label key={cap} className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer text-foreground group">
                        <input
                          type="checkbox"
                          checked={selectedCapacities.includes(cap)}
                          onChange={() => toggleCapacity(cap)}
                          className="accent-primary h-4 w-4 rounded border-border focus:ring-0 cursor-pointer"
                        />
                        <span className="group-hover:text-primary transition-colors">{cap}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Puffs list Checklist */}
              {filterOptions.puffs.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-border/40">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Puffs Capacity:</p>
                  <div className="space-y-2">
                    {filterOptions.puffs.map((puff) => (
                      <label key={puff} className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer text-foreground group">
                        <input
                          type="checkbox"
                          checked={selectedPuffs.includes(puff)}
                          onChange={() => togglePuff(puff)}
                          className="accent-primary h-4 w-4 rounded border-border focus:ring-0 cursor-pointer"
                        />
                        <span className="group-hover:text-primary transition-colors">{puff}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer / Apply */}
            <div className="p-6 border-t border-border bg-card">
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full text-center py-3 bg-primary hover:bg-gold-shimmer text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 active:scale-95"
              >
                Show {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}

      <CartDrawer />
      <Footer />
    </div>
  );
}

export default function ClientCollectionPage(props: {
  handle?: string;
  initialMeta?: any;
  initialProducts?: Product[];
  initialSubFilter?: string;
}) {
  return (
    <Suspense fallback={null}>
      <CollectionPageContent {...props} />
    </Suspense>
  );
}

