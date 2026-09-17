"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Layers, ChevronLeft, ChevronRight, Truck } from "lucide-react";
import { useCollectionImages, getHandleFromUrl } from "@/hooks/useCollectionImages";
import { SmartImage } from "@/components/ui/smart-image";

interface BrandInfo {
  id?: string;
  handle: string;
  name: string;
  tagline: string;
  image: string;
  description: string;
  /** Where the card links. Defaults to the collection filter it always used. */
  href?: string;
  tags?: string[];
  popularModel?: string;
}

const FALLBACK_BRANDS: BrandInfo[] = [
  {
    id: "al-fakher",
    handle: "al-fakher-vape",
    name: "Al Fakher",
    tagline: "Authentic Shisha Flavors & Massive Puffs",
    image: "/premium_liquid.png",
    tags: ["Shisha Flavors", "Up to 60,000 Puffs", "Crown Bar Series"],
    description: "Al Fakher Crown Bar and E-Hose disposable vape devices bring traditional shisha-inspired flavors into a modern portable vape format.",
    popularModel: "Crown Bar 8000 / E-Hose X 60000",
  },
  {
    id: "vozol",
    handle: "vozol-vape",
    name: "Vozol",
    tagline: "Smart Display & Advanced Vapor Tech",
    image: "/lost_mary.png",
    tags: ["Smart LED Screen", "Dual Mesh Coil", "Extended Battery"],
    description: "Vozol disposable vapes combine sleek futuristic styling with robust battery life and advanced dual mesh coil technology.",
    popularModel: "Vozol Vista 20000 / Gear Power 20000",
  },
  {
    id: "tugboat",
    handle: "tugboat-vape",
    name: "Tugboat",
    tagline: "Dependable Performance & Everyday Comfort",
    image: "/lost_mary.png",
    tags: ["Mesh Coil", "Type-C Charging", "Lightweight Build"],
    description: "Tugboat disposable vape devices are engineered for practical performance and simple operation with reliable flavor consistency.",
    popularModel: "Tugboat T12000 / EVO 4500",
  },
  {
    id: "lost-mary",
    handle: "lost-mary-disposable",
    name: "Lost Mary",
    tagline: "Compact Ergonomics & Rich Fruit Profiles",
    image: "/lost_mary.png",
    tags: ["Compact Design", "Smooth Salt Nic", "Style Gradient"],
    description: "Lost Mary disposable vapes are celebrated for their compact ergonomic feel, stylish color gradient looks, and unique salt nicotine blends.",
    popularModel: "Lost Mary BC10000 / OS5000",
  },
  {
    id: "hqd",
    handle: "hqd-vape",
    name: "HQD",
    tagline: "Ultra-Reliable Daily Vaping & Zero Upkeep",
    image: "/vape_kit.png",
    tags: ["Zero Maintenance", "Fruit & Mint", "Long Battery"],
    description: "HQD provides reliable disposable e-cigarettes popular across Dubai for daily vaping with zero upkeep required.",
    popularModel: "HQD Cuvie Slick 6000 / HBAR",
  },
  {
    id: "geek-bar",
    handle: "geek-bar-disposable",
    name: "Geek Bar",
    tagline: "Pulse Boost Mode & Full Screen Displays",
    image: "/lost_mary.png",
    tags: ["Pulse Boost Mode", "Full Curved Screen", "Instant Vapor"],
    description: "Geek Bar disposable vape products are designed for flavor-focused vapers seeking smooth airflow and modern device styling.",
    popularModel: "Geek Bar Pulse 15000 / Skyview",
  },
  {
    id: "elf-bar",
    handle: "elf-bar-vape",
    name: "Elf Bar",
    tagline: "World-Renowned Flavor Consistency & Quality",
    image: "/lost_mary.png",
    tags: ["Global Favorite", "Smart Battery Screen", "Quaq Tech"],
    description: "Elf Bar disposables set industry standards for flavor delivery and draw smoothness built with advanced Quaq mesh coil tech.",
    popularModel: "Elf Bar BC10000 / Ice King 40000",
  },
  {
    id: "maskking",
    handle: "maskking-vape",
    name: "Maskking",
    tagline: "Premium Metallic Finish & Intense Flavor Output",
    image: "/vape_kit.png",
    tags: ["Metallic Shell", "Draw Activated", "Super Smooth"],
    description: "Maskking disposable vapes feature premium alloy construction and instant draw-activated heating beloved in Dubai.",
    popularModel: "Maskking Aroma 6000 / High Pro",
  },
];

export interface BrandShowcaseSettings {
  badgeText: string;
  heading: string;
  description: string;
  brands: BrandInfo[];
  ctaLabel: string;
}

export function DisposableBrandsShowcase({
  settings,
}: { settings?: BrandShowcaseSettings } = {}) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const collectionImages = useCollectionImages();

  // Saved brands win; the built-in list keeps a placement made before this
  // section had editable content from rendering an empty carousel.
  const brands =
    settings?.brands && settings.brands.length > 0
      ? settings.brands
      : FALLBACK_BRANDS;
  const ctaLabel = settings?.ctaLabel || "View Collection";

  // Auto-scroll loop (pauses on mouse hover or drag)
  useEffect(() => {
    if (isHovered || isDragging) return;

    const interval = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          sliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
          setActiveIndex(0);
        } else {
          sliderRef.current.scrollBy({ left: 340, behavior: "smooth" });
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovered, isDragging]);

  // Track active slide index on scroll
  const handleScrollTrack = () => {
    if (sliderRef.current) {
      const scrollLeft = sliderRef.current.scrollLeft;
      const index = Math.round(scrollLeft / 340);
      if (index !== activeIndex && index < brands.length) {
        setActiveIndex(index);
      }
    }
  };

  const scrollToSlide = (index: number) => {
    if (sliderRef.current) {
      sliderRef.current.scrollTo({
        left: index * 340,
        behavior: "smooth",
      });
      setActiveIndex(index);
    }
  };

  // Mouse Drag / Swipe Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current!.offsetLeft);
    setScrollLeftPos(sliderRef.current!.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsHovered(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.6;
    sliderRef.current.scrollLeft = scrollLeftPos - walk;
  };

  const handleScroll = (dir: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = dir === "left" ? -340 : 340;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-card border border-border/60 rounded-[2rem] p-5 sm:p-7 relative overflow-hidden shadow-md transition-all duration-300">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10" />

      {/* Centered Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4 mb-5 relative">
        {/* Spacer for desktop optical centering */}
        <div className="hidden sm:block w-48" />

        {/* Centered Title & Badge */}
        <div className="text-center flex flex-col items-center flex-1">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.2em] px-3.5 py-1 rounded-full mb-2">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>{settings?.badgeText || "Disposable Brand Guide"}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-serif font-black text-foreground tracking-tight leading-tight">
            {settings?.heading || "Popular Disposable Vape Brands in Dubai"}
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-semibold max-w-xl">
            {settings?.description ||
              "Explore leading disposable vape manufacturers in the UAE. Compare flagship models, puff capacities, and signature nicotine salt flavor profiles."}
          </p>

          {/* Premium Centered Line Divider */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="h-[1px] w-10 bg-gradient-to-r from-transparent to-primary/65" />
            <div className="w-1.5 h-1.5 rotate-45 border border-primary/40 bg-primary/10" />
            <div className="h-[1px] w-10 bg-gradient-to-l from-transparent to-primary/65" />
          </div>
        </div>

        {/* Right Slider Controls & Express Pill */}
        <div className="flex items-center justify-center sm:justify-end gap-3 w-full sm:w-48">
          <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-extrabold text-primary uppercase tracking-wider bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full shrink-0">
            <Truck className="w-3.5 h-3.5 text-primary" />
            <span>2-Hour Express</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleScroll("left")}
              aria-label="Scroll left"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-muted/60 hover:bg-primary border border-border/60 hover:border-primary text-foreground hover:text-white flex items-center justify-center transition-all duration-300 cursor-pointer shadow-xs active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll("right")}
              aria-label="Scroll right"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-muted/60 hover:bg-primary border border-border/60 hover:border-primary text-foreground hover:text-white flex items-center justify-center transition-all duration-300 cursor-pointer shadow-xs active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Horizontal Brand Slider Track */}
      <div
        ref={sliderRef}
        onScroll={handleScrollTrack}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none py-3 px-1 select-none transform-gpu transition-all ${
          isDragging
            ? "cursor-grabbing scroll-auto"
            : "cursor-grab scroll-smooth snap-x snap-mandatory"
        }`}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {brands.map((brand) => (
          <Link
            key={brand.handle || brand.name}
            href={brand.href || `/collections/disposable-vape?sub=${encodeURIComponent(brand.name)}`}
            draggable={false}
            className="w-[260px] sm:w-[300px] lg:w-[330px] snap-start flex-shrink-0 group relative bg-background border border-border/70 hover:border-primary/60 rounded-3xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-xl overflow-hidden"
          >
            {/* Top Product Image Display Area - Full Cover Banner */}
            <div className="w-full h-40 sm:h-48 rounded-2xl bg-slate-950 border border-border/40 relative mb-3.5 overflow-hidden shrink-0 group-hover:border-primary/40 transition-all duration-300">
              <SmartImage
                src={collectionImages[brand.handle] || brand.image}
                fallbackSrc="/hero_vape.png"
                alt={brand.name}
                width={330}
                height={192}
                sizes="(max-width: 640px) 260px, 330px"
                draggable={false}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 pointer-events-none opacity-90 group-hover:opacity-100"
              />
            </div>

            {/* Title & Short Description */}
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-serif font-black text-foreground group-hover:text-primary transition-colors leading-snug">
                {brand.name}
              </h3>
              <p className="text-xs text-muted-foreground font-normal leading-relaxed line-clamp-2">
                {brand.tagline} — {brand.description}
              </p>
            </div>

            {/* Bottom CTA Bar: VIEW COLLECTION */}
            <div className="mt-4 pt-3.5 border-t border-border/40 flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-foreground uppercase tracking-wider group-hover:text-primary transition-colors">
                {ctaLabel}
              </span>

              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-110 group-hover:bg-gold-shimmer transition-all duration-300">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination Dots Indicator */}
      {brands.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4 pt-2">
          {brands.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                idx === activeIndex
                  ? "bg-primary w-6 h-2 shadow-xs"
                  : "bg-muted-foreground/30 hover:bg-primary/50 w-2 h-2"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
