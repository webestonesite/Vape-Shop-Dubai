"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Layers, ChevronLeft, ChevronRight, Truck } from "lucide-react";
import { useCollectionImages } from "@/hooks/useCollectionImages";
import { SmartImage } from "@/components/ui/smart-image";

interface EJuiceBrand {
  id?: string;
  handle?: string;
  name: string;
  tagline: string;
  image: string;
  description: string;
  /** Where the card links. Defaults to the collection filter it always used. */
  href?: string;
  tags?: string[];
  popularLineup?: string;
}

const FALLBACK_BRANDS: EJuiceBrand[] = [
  {
    id: "pod-salt",
    handle: "pod-salt-vape",
    name: "Pod Salt",
    tagline: "British Nicotine Salt Specialists & Hit Blends",
    image: "/premium_liquid.png",
    tags: ["25mg / 50mg Salt Nic", "50/50 VG/PG Ratio", "Nexus Series"],
    description: "Pod Salt is an award-winning British e-liquid brand renowned for its smooth nicotine salt formulation.",
    popularLineup: "Pod Salt Core / Nexus / Fusion Series",
  },
  {
    id: "vgod",
    handle: "vgod-stig",
    name: "VGOD",
    tagline: "USA Premium SaltNic & Signature Cubano Tobaccos",
    image: "/premium_liquid.png",
    tags: ["Cubano Series", "LushIce Classic", "Made in USA"],
    description: "VGOD E-Liquids deliver high-potency flavor profiles and dense clouds. Famous for Cubano cigar tobacco.",
    popularLineup: "VGOD SaltNic / TrickTank E-Liquids",
  },
  {
    id: "dr-vapes",
    handle: "dr-vapes",
    name: "Dr Vapes",
    tagline: "Panther Series & Award-Winning Fruit Liquids",
    image: "/premium_liquid.png",
    tags: ["Pink Panther", "Blue Panther", "30ml & 60ml Bottles"],
    description: "Dr Vapes UK creates iconic flavor blends like Pink Panther blackcurrant cotton candy and Blue Panther.",
    popularLineup: "Pink Panther / Black Panther / Gems Series",
  },
  {
    id: "nasty-juice",
    handle: "nasty-juice",
    name: "Nasty Juice",
    tagline: "Low Mint Signature Aluminum Tin Liquids",
    image: "/premium_liquid.png",
    tags: ["Asap Grape", "Slow Blow", "Low Mint Blast"],
    description: "Nasty Juice is globally celebrated for signature low-mint fruity e-liquids like Asap Grape and Slow Blow.",
    popularLineup: "Nasty Salt / Nasty ModMate / 50ml Shortfills",
  },
  {
    id: "silvaper",
    handle: "silvaper-vape",
    name: "Silvaper",
    tagline: "Luxury Craft E-Liquids & Pure Flavor Extract",
    image: "/premium_liquid.png",
    tags: ["Ultra Smooth", "Double Apple Shisha", "Premium Salt"],
    description: "Silvaper offers handcrafted e-liquids featuring rich shisha double apple, icy grape mint, and berry fruit.",
    popularLineup: "Silvaper Salt Nic 30ml / Shisha Series",
  },
  {
    id: "vape-pink",
    handle: "vape-pink",
    name: "Vape Pink & Propaganda",
    tagline: "Gourmet Dessert & Candy Fruit E-Juice",
    image: "/premium_liquid.png",
    tags: ["Swirl & Cookie", "Gourmet Blends", "Rich Vapor"],
    description: "Gourmet e-liquids crafted for flavor enthusiasts seeking sweet dessert pastries and fruit chews.",
    popularLineup: "Vape Pink Cookie Butter / Sweet Surprise",
  },
];

export interface EJuiceShowcaseSettings {
  badgeText: string;
  heading: string;
  description: string;
  brands: EJuiceBrand[];
  ctaLabel: string;
}

export function EJuiceBrandsShowcase({
  settings,
}: { settings?: EJuiceShowcaseSettings } = {}) {
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
            <span>{settings?.badgeText || "E-Juice Brand Directory"}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-serif font-black text-foreground tracking-tight leading-tight">
            {settings?.heading || "Popular E-Juice & Nicotine Salt Brands in Dubai"}
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-semibold max-w-xl">
            {settings?.description ||
              "Explore authentic imported e-liquids across UAE. Compare nicotine strengths, VG/PG ratios, and signature fruit, menthol & tobacco flavors."}
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
            href={brand.href || `/collections/e-liquids?sub=${encodeURIComponent(brand.name)}`}
            draggable={false}
            className="w-[260px] sm:w-[300px] lg:w-[330px] snap-start flex-shrink-0 group relative bg-background border border-border/70 hover:border-primary/60 rounded-3xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-xl overflow-hidden"
          >
            {/* Top Product Image Display Area - Full Cover Banner */}
            <div className="w-full h-40 sm:h-48 rounded-2xl bg-slate-950 border border-border/40 relative mb-3.5 overflow-hidden shrink-0 group-hover:border-primary/40 transition-all duration-300">
              <SmartImage
                src={brand.handle && collectionImages[brand.handle] ? collectionImages[brand.handle] : brand.image}
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
