"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, ShoppingCart, Package, Zap, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { instanceSettings } from "./SectionRenderer";
import { prefetchProduct } from "@/lib/product-cache";
import { useCart } from "@/context/CartContext";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { ProductSectionCarousel } from "./ProductSectionCarousel";

export interface Product {
  id: string;
  name: string;
  handle: string;
  variantId: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  hoverImage?: string;
  images?: string[];
  tag?: string;
  tagColor?: string;
  isPopular?: boolean;
  isSoldOut?: boolean;
  puffs?: string;
  nicotine?: string;
  battery?: string;
  section?: string;
  brand?: string;
  collections?: string[];
}




export interface FlashSaleTimerSettings {
  label: string;
  /** `endOfDay` restarts every midnight; `fixedDate` counts to one moment. */
  mode: "endOfDay" | "fixedDate";
  /** Local `YYYY-MM-DDTHH:mm`, used by `fixedDate`. */
  endsAt: string;
  /** Hide the whole block once the deadline passes. */
  hideWhenExpired: boolean;
}

export const FlashSaleTimer: React.FC<{ settings?: FlashSaleTimerSettings }> = ({
  settings,
}) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isMounted, setIsMounted] = useState(false);

  const mode = settings?.mode ?? "endOfDay";
  const endsAt = settings?.endsAt ?? "";

  useEffect(() => {
    setIsMounted(true);

    const targetTime = () => {
      if (mode === "fixedDate" && endsAt) {
        const parsed = new Date(endsAt).getTime();
        // An unparseable date falls back to end-of-day rather than freezing
        // the countdown at zero.
        if (!Number.isNaN(parsed)) return parsed;
      }
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      return endOfDay.getTime();
    };

    const calculateTimeLeft = () => {
      const diff = targetTime() - Date.now();
      if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
      return {
        // Hours accumulate past 24 so a multi-day countdown reads correctly.
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, endsAt]);

  // Derived rather than tracked in state: all-zero after mount *is* expiry,
  // and the isMounted guard keeps the server render from hiding the block
  // before the first tick has run.
  const expired =
    isMounted &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0;

  if (expired && settings?.hideWhenExpired !== false) return null;

  const format = (num: number) => String(num).padStart(2, "0");

  return (
    <div className="flex flex-col items-start sm:items-center lg:items-end gap-2">
      <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        <span>{settings?.label || "Flash Sale Ends In"}</span>
      </span>

      {/* Timer digits */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Hours */}
        <div className="flex flex-col items-center">
          <div className="bg-card border-2 border-primary/30 rounded-xl px-3 py-1.5 sm:px-3.5 sm:py-2 min-w-[50px] sm:min-w-[56px] text-center shadow-md">
            <span className="text-xl sm:text-2xl font-black font-mono text-foreground tracking-tight">
              {!isMounted ? "00" : format(timeLeft.hours)}
            </span>
          </div>
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground mt-1">Hours</span>
        </div>

        <span className="text-xl font-bold text-primary -mt-4">:</span>

        {/* Minutes */}
        <div className="flex flex-col items-center">
          <div className="bg-card border-2 border-primary/30 rounded-xl px-3 py-1.5 sm:px-3.5 sm:py-2 min-w-[50px] sm:min-w-[56px] text-center shadow-md">
            <span className="text-xl sm:text-2xl font-black font-mono text-foreground tracking-tight">
              {!isMounted ? "00" : format(timeLeft.minutes)}
            </span>
          </div>
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground mt-1">Mins</span>
        </div>

        <span className="text-xl font-bold text-primary -mt-4">:</span>

        {/* Seconds */}
        <div className="flex flex-col items-center">
          <div className="bg-card border-2 border-primary rounded-xl px-3 py-1.5 sm:px-3.5 sm:py-2 min-w-[50px] sm:min-w-[56px] text-center shadow-md shadow-primary/10">
            <span className="text-xl sm:text-2xl font-black font-mono text-primary tracking-tight">
              {!isMounted ? "00" : format(timeLeft.seconds)}
            </span>
          </div>
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-primary mt-1">Secs</span>
        </div>
      </div>
    </div>
  );
};

interface ProductFeedProps {
  searchQuery: string;
  activeCategory: string;
  onCategorySelect: (category: string) => void;
}

export function ProductCard({ product, onAddToCart, onBuyNow }: { product: Product; onAddToCart: (p: Product) => void; onBuyNow: (p: Product) => void }) {
  const [hovered, setHovered] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const isSale = product.tagColor === "sale";

  const allImagesList = useMemo(() => {
    if (product.images && product.images.length > 0) return product.images;
    if (product.hoverImage) return [product.image, product.hoverImage];
    return [product.image];
  }, [product]);

  const displayedImage = allImagesList[activeImageIndex] || product.image;

  // Preload variant images only when user hovers card
  useEffect(() => {
    if (hovered && typeof window !== "undefined" && allImagesList.length > 1) {
      allImagesList.slice(1).forEach((url) => {
        const img = new globalThis.Image();
        img.src = url;
      });
    }
  }, [hovered, allImagesList]);

  return (
    <div
      onMouseEnter={() => {
        setHovered(true);
        if (activeImageIndex === 0 && allImagesList.length > 1) {
          setActiveImageIndex(1);
        }
      }}
      onMouseLeave={() => {
        setHovered(false);
        setActiveImageIndex(0);
      }}
      className="group relative bg-card border-2 border-primary/20 hover:border-primary rounded-[1.8rem] sm:rounded-[2.2rem] p-3 sm:p-5 shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1.5 flex flex-col w-full h-full overflow-hidden"
    >
      {/* Large Image Area */}
      <div className="relative bg-muted/20 rounded-[1.3rem] sm:rounded-[1.8rem] h-52 sm:h-72 lg:h-80 p-1 sm:p-5 flex items-center justify-center overflow-hidden border border-primary/15 group-hover:border-primary/40 transition-all duration-300">
        <div className="hidden sm:block absolute w-56 h-56 rounded-full bg-primary/5 filter blur-2xl pointer-events-none" />

        <Link
          href={`/products/${product.handle}`}
          prefetch={true}
          onMouseEnter={() => prefetchProduct(product.handle)}
          className="block relative z-10 w-full h-full flex items-center justify-center p-2 sm:p-0"
        >
          <Image
            key={displayedImage}
            src={displayedImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 230px, 260px"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.opacity = "0";
            }}
            className={`object-contain filter drop-shadow-md transition-all duration-300 ${
              hovered ? "scale-105" : "scale-100"
            }`}
          />
        </Link>

        {/* Multi-Variant Image Swatch Dots Bar */}
        {allImagesList.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full z-20 border border-white/20 shadow-md transition-all duration-300 opacity-80 group-hover:opacity-100">
            {allImagesList.slice(0, 6).map((_, idx) => (
              <button
                key={idx}
                onMouseEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveImageIndex(idx);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveImageIndex(idx);
                }}
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all cursor-pointer ${
                  activeImageIndex === idx
                    ? "bg-primary scale-125 ring-2 ring-primary/40 shadow-sm"
                    : "bg-white/60 hover:bg-white hover:scale-110"
                }`}
                aria-label={`View variant image ${idx + 1}`}
              />
            ))}
            {allImagesList.length > 6 && (
              <span className="text-[9px] font-extrabold text-white/90 pl-1">
                +{allImagesList.length - 6}
              </span>
            )}
          </div>
        )}

        {/* Top-Left Tag / Sold Out Badge */}
        {(product.isSoldOut || product.tag) && (
          <div className={`absolute top-3 left-3 text-[10px] font-bold tracking-wide px-3 py-1.5 rounded-full pointer-events-none z-20 shadow-xs ${
            product.isSoldOut
              ? "bg-[#2D2A26] text-white"
              : isSale
              ? "bg-primary text-white"
              : "bg-card/95 text-primary border border-primary/20"
          }`}>
            {product.isSoldOut ? "Sold out" : product.tag}
          </div>
        )}

        {/* Hover Quick Add Icon */}
        {!product.isSoldOut && (
          <button
            onClick={() => onAddToCart(product)}
            className={`absolute bottom-3 right-3 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-md transition-all duration-300 cursor-pointer hover:bg-gold-shimmer z-20 ${hovered ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
            aria-label="Quick add"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Info Section */}
      <div className="flex flex-col gap-2 flex-grow pt-4 px-1">
        {/* Section / Category tag */}
        <span className="text-[10px] sm:text-[11px] font-bold tracking-wide text-primary">
          {product.section || product.category}
        </span>

        {/* Product Title */}
        <Link
          href={`/products/${product.handle}`}
          prefetch={true}
          onMouseEnter={() => prefetchProduct(product.handle)}
          className="hover:text-primary transition-colors block"
        >
          <h3 className="text-base sm:text-lg font-body text-foreground group-hover:text-primary transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Specs Badges */}
        {(product.puffs || product.nicotine) && (
          <div className="flex flex-wrap gap-1.5 my-0.5">
            {product.puffs && product.puffs !== "Refillable" && (
              <span className="text-[10px] bg-muted/70 text-muted-foreground px-2.5 py-1 rounded-full font-semibold">{product.puffs}</span>
            )}
            {product.nicotine && product.nicotine !== "Universal" && (
              <span className="text-[10px] bg-muted/70 text-muted-foreground px-2.5 py-1 rounded-full font-semibold">{product.nicotine}</span>
            )}
          </div>
        )}

        {/* Rating & Price Row */}
        <div className="flex items-end justify-between mt-auto pt-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400 flex-shrink-0" />
            <span className="text-xs font-bold text-foreground">{product.rating}</span>
            <span className="text-[11px] text-muted-foreground">({product.reviews})</span>
          </div>

          <div className="text-right">
            {product.originalPrice && (
              <p className="text-[11px] text-muted-foreground line-through mb-1">Dhs. {product.originalPrice.toFixed(2)}</p>
            )}
            <p className="text-lg sm:text-xl font-serif text-primary leading-none tracking-tight">
              Dhs. {product.price.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Full-width Action Pill Button (Matches Screenshot) */}
        <div className="pt-3 mt-1">
          {product.isSoldOut ? (
            <div className="w-full py-3 rounded-full bg-[#E5DFD5] dark:bg-[#2A241E] text-muted-foreground text-xs font-bold text-center cursor-not-allowed border border-border/30">
              Sold out
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onAddToCart(product)}
                className="py-3 rounded-full bg-card hover:bg-muted/40 border border-border/80 text-foreground text-xs font-bold text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 active:scale-98"
              >
                <ShoppingCart className="h-3.5 w-3.5" /> Cart
              </button>
              <button
                onClick={() => onBuyNow(product)}
                className="py-3 rounded-full bg-gradient-to-r from-primary to-orange-500 hover:brightness-105 text-white text-xs font-bold text-center shadow cursor-pointer transition-all flex items-center justify-center gap-1.5 active:scale-98"
              >
                <Zap className="h-3.5 w-3.5" /> Buy Now
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/**
 * One merchant-defined row of the feed: a Shopify collection, shown as a
 * carousel. The collection supplies both the products and the "view all"
 * destination.
 */
export interface ProductFeedRow {
  title: string;
  collectionHandle: string;
  productHandles?: string[];
  /** Overrides the collection's own URL for "view all". */
  viewAllHref: string;
  limit: number;
  /** `flashSale` swaps in the countdown banner. */
  style: "standard" | "flashSale";
  flashBadgeText: string;
  flashDescription: string;
  showTimer: boolean;
  timerLabel: string;
  timerMode: "endOfDay" | "fixedDate";
  timerEndsAt: string;
  hideTimerWhenExpired: boolean;
}

function parseHandlesFromInput(input: string): { type: "collection" | "products"; handles: string[] } {
  if (!input) return { type: "collection", handles: [] };

  const raw = input.trim();
  const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);

  const cleanHandles: string[] = [];
  let isProductMode = false;

  for (const part of parts) {
    if (part.includes("/products/")) {
      isProductMode = true;
      const h = part.split("/products/").pop()?.split("?")[0]?.split("#")[0] || "";
      if (h) cleanHandles.push(h.toLowerCase());
    } else if (part.includes("/product/")) {
      isProductMode = true;
      const h = part.split("/product/").pop()?.split("?")[0]?.split("#")[0] || "";
      if (h) cleanHandles.push(h.toLowerCase());
    } else if (part.includes("/collections/")) {
      const h = part.split("/collections/").pop()?.split("?")[0]?.split("#")[0] || "";
      if (h) cleanHandles.push(h.toLowerCase());
    } else if (part.includes("/brand/")) {
      const h = part.split("/brand/").pop()?.split("?")[0]?.split("#")[0] || "";
      if (h) cleanHandles.push(h.toLowerCase());
    } else {
      cleanHandles.push(part.toLowerCase());
    }
  }

  if (isProductMode || parts.length > 1) {
    return { type: "products", handles: cleanHandles };
  }

  return { type: "collection", handles: cleanHandles };
}

/** Where a row's "view all" goes: explicit link, else its own collection/product. */
function rowViewAllHref(row: ProductFeedRow): string {
  if (row.viewAllHref) return row.viewAllHref;
  const target = (row.collectionHandle || "").trim();
  if (!target) return "";

  if (target.startsWith("/") && !target.includes("/products/") && !target.includes("/product/")) return target;

  const parsed = parseHandlesFromInput(target);
  if (parsed.type === "products" && parsed.handles.length === 1) {
    return `/products/${parsed.handles[0]}`;
  }
  if (parsed.type === "products" && parsed.handles.length > 1) {
    return `/collections/all`;
  }
  if (parsed.handles.length > 0) {
    return `/collections/${parsed.handles[0]}`;
  }
  return "";
}

function productMatchesRow(product: Product, row: ProductFeedRow, allProducts: Product[] = []): boolean {
  if (row.productHandles && row.productHandles.length > 0) {
    const targetHandles = row.productHandles
      .map((h) => (h.includes("/products/") ? h.split("/products/").pop()?.split("?")[0] || h : h.includes("/product/") ? h.split("/product/").pop()?.split("?")[0] || h : h))
      .map((h) => h.trim().toLowerCase());

    const prodHandle = (product.handle || "").toLowerCase();
    const prodId = (product.id || "").toLowerCase();
    return targetHandles.includes(prodHandle) || targetHandles.includes(prodId);
  }

  const target = (row.collectionHandle || "").trim();
  if (!target) return false;

  const rawParts = target.split(",").map((s) => s.trim()).filter(Boolean);
  const cleanHandles: string[] = [];
  let containsProductUrl = false;

  for (const part of rawParts) {
    if (part.includes("/products/")) {
      containsProductUrl = true;
      const h = part.split("/products/").pop()?.split("?")[0]?.split("#")[0] || "";
      if (h) cleanHandles.push(h.toLowerCase());
    } else if (part.includes("/product/")) {
      containsProductUrl = true;
      const h = part.split("/product/").pop()?.split("?")[0]?.split("#")[0] || "";
      if (h) cleanHandles.push(h.toLowerCase());
    } else if (part.includes("/collections/")) {
      const h = part.split("/collections/").pop()?.split("?")[0]?.split("#")[0] || "";
      if (h) cleanHandles.push(h.toLowerCase());
    } else {
      cleanHandles.push(part.toLowerCase());
    }
  }

  if (cleanHandles.length === 0) return false;

  const prodHandle = (product.handle || "").toLowerCase();
  const prodId = (product.id || "").toLowerCase();

  // 1. Direct product handle match
  const isProductMatch = cleanHandles.some((h) => h === prodHandle || h === prodId);
  if (isProductMatch) return true;

  // 2. Multi-product or explicit product URL
  if (containsProductUrl || rawParts.length > 1) return false;

  // 3. If target handle exists anywhere as a product in catalogue, treat strictly as product filter
  const existsAsProductInCatalogue = allProducts.some((p) => {
    const ph = (p.handle || "").toLowerCase();
    const pid = (p.id || "").toLowerCase();
    return cleanHandles.some((h) => h === ph || h === pid);
  });

  if (existsAsProductInCatalogue) {
    return false;
  }

  // 4. Fallback to collection handle matching
  const colHandle = cleanHandles[0];
  return (product.collections ?? []).some((c) => c.toLowerCase() === colHandle);
}

export interface ProductFeedSettings {
  eyebrow: string;
  heading: string;
  description: string;
  rows: ProductFeedRow[];
  productsPerPage: number;
}


export const ProductFeed: React.FC<
  ProductFeedProps & { settings?: ProductFeedSettings }
> = ({
  settings,
  searchQuery,
  activeCategory,
  onCategorySelect,
}) => {
  const { addToCart, setIsCartOpen } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        if (data && data.length > 0) {
          setProducts(data);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Error loading products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const activeProductsList = products;

  const filteredProducts = useMemo(() => {
    return activeProductsList.filter((p) => {
      const matchCat = activeCategory === "all" || p.category === activeCategory;
      const matchSearch = searchQuery === "" || p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeProductsList, activeCategory, searchQuery]);

  const ITEMS_PER_PAGE = Number(settings?.productsPerPage) || 12;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Rows come from the section's settings; each one filters the live catalogue
  // with its own rule. Falls back to nothing when a row matches no products,
  // so an empty row never renders an empty carousel.
  const sections = useMemo(() => {
    if (activeCategory !== "all" || searchQuery) return null;

    const rows = settings?.rows ?? [];
    return rows
      .map((row) => ({
        row,
        products: activeProductsList.filter((p) => productMatchesRow(p, row, activeProductsList)),
      }))
      .filter((entry) => entry.products.length > 0);
  }, [activeProductsList, activeCategory, searchQuery, settings?.rows]);

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

  const router = useRouter();
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

  const handleViewAll = (sectionName: string, sectionProducts: Product[]) => {
    if (sectionName === "JUUL 1 Series") {
      router.push("/collections/juul?sub=JUUL%201%20Series");
    } else if (sectionName === "JUUL 2 Series") {
      router.push("/collections/juul?sub=JUUL%202%20Series");
    } else if (sectionName === "Flash Sale") {
      router.push("/collections/all");
    } else {
      const category = sectionProducts[0]?.category || "all";
      if (category === "all") {
        router.push("/collections/all");
      } else {
        router.push(`/collections/${category}`);
      }
    }
  };

  return (
<div className="space-y-8 sm:space-y-10 relative">
      {/* Section header - clean and standalone */}
      <div className="text-center flex flex-col items-center justify-center px-4 sm:px-6 mb-8">
        <span className="text-[11px] sm:text-xs font-bold tracking-[0.22em] text-primary uppercase mb-2 flex items-center gap-2 justify-center">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          {settings?.eyebrow || "Live Catalog"}
        </span>
        
        <h3 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-foreground tracking-tight leading-snug">
          {settings?.heading || "Explore Our Collection"}
        </h3>

        {/* Premium Divider */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="h-[1px] w-10 bg-gradient-to-r from-transparent to-primary/65" />
          <div className="w-1.5 h-1.5 rotate-45 border border-primary/40 bg-primary/10" />
          <div className="h-[1px] w-10 bg-gradient-to-l from-transparent to-primary/65" />
        </div>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mt-3 max-w-md mx-auto">
          {settings?.description ||
            "Premium vape products. Authentic brands. 2-hour Dubai delivery."}
        </p>
      </div>

      {searchQuery && (
        <div className="px-4 sm:px-6">
          <p className="text-xs text-muted-foreground">
            Search results for{" "}
            <span className="font-semibold text-foreground">&quot;{searchQuery}&quot;</span> ({filteredProducts.length} items found)
          </p>
        </div>
      )}

      {/* ── Loading state or product displays ── */}
      {loading ? (
        <div className="bg-card/70 backdrop-blur-md border border-border/40 rounded-[2.2rem] p-6 sm:p-8 shadow-[var(--shadow-card)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-card border border-border/40 rounded-[2rem] p-5 flex flex-col gap-4 min-h-[350px]">
                <div className="bg-muted rounded-[1.5rem] h-48 w-full animate-pulse" />
                <div className="h-3 bg-muted rounded w-1/4 animate-pulse" />
                <div className="h-5 bg-muted rounded w-3/4 animate-pulse" />
                <div className="h-3.5 bg-muted rounded w-1/2 animate-pulse" />
                <div className="h-10 bg-muted rounded-full w-full mt-auto animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ) : sections && sections.length > 0 ? (
        <div className="space-y-8 sm:space-y-10">
          {sections.map(({ row, products }) => (
            <ProductSectionCarousel
              key={row.title}
              sectionName={row.title}
              products={products.slice(0, Math.max(1, Number(row.limit) || 10))}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onViewAll={(name, sectionProducts) => {
                const href = rowViewAllHref(row);
                if (href) router.push(href);
                else handleViewAll(name, sectionProducts);
              }}
              flashSale={{
                enabled: row.style === "flashSale",
                badgeText: row.flashBadgeText,
                description: row.flashDescription,
                showTimer: row.showTimer !== false,
                timer: {
                  label: row.timerLabel,
                  mode: row.timerMode ?? "endOfDay",
                  endsAt: row.timerEndsAt ?? "",
                  hideWhenExpired: row.hideTimerWhenExpired !== false,
                },
              }}
            />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-card/70 backdrop-blur-md border border-border/40 rounded-[2.2rem] p-8 sm:p-12 shadow-[var(--shadow-card)] flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Package className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="font-serif text-xl font-bold text-foreground mb-2">No products found</h3>
          <p className="text-sm text-muted-foreground mb-6">Try a different category or search term.</p>
          <button
            onClick={() => onCategorySelect("all")}
            className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-bold cursor-pointer hover:bg-gold-shimmer transition-all"
          >
            View All Products
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-card/70 backdrop-blur-md border border-border/40 rounded-[2.2rem] p-6 sm:p-8 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-all duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />
              ))}
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-6 pb-2">
              <button
                onClick={() => {
                  if (currentPage > 1) {
                    setCurrentPage((prev) => prev - 1);
                    document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
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
                        document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        item === currentPage
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
                    document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
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
        </div>
      )}
    </div>
  );
};
