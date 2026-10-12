"use client";

import React, { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from "@/components/ui/carousel";
import {
  ProductCard,
  type Product,
  FlashSaleTimer,
  type FlashSaleTimerSettings,
} from "./ProductFeed";

export interface FlashSaleSettings {
  enabled: boolean;
  badgeText: string;
  description: string;
  showTimer: boolean;
  timer: FlashSaleTimerSettings;
}

interface ProductSectionCarouselProps {
  flashSale?: FlashSaleSettings;
  sectionName: string;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onViewAll?: (sectionName: string, products: Product[]) => void;
}

export const ProductSectionCarousel: React.FC<ProductSectionCarouselProps> = ({
  sectionName,
  products,
  onAddToCart,
  onBuyNow,
  onViewAll,
  flashSale,
}) => {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  useEffect(() => {
    if (!api) return;
    
    // Force Embla to recalculate slides/snaps when products load/change
    api.reInit();
    
    const updateSnaps = () => {
      setScrollSnaps(api.scrollSnapList());
      setSelectedIndex(api.selectedScrollSnap());
    };

    updateSnaps();

    api.on("select", updateSnaps);
    api.on("reInit", updateSnaps);
    return () => {
      api.off("select", updateSnaps);
      api.off("reInit", updateSnaps);
    };
  }, [api, products]);

  useEffect(() => {
    if (!api) return;

    let intervalId: NodeJS.Timeout;
    let isHovered = false;

    const startAutoScroll = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        if (isHovered) return;
        if (api.canScrollNext()) {
          api.scrollNext();
        } else {
          api.scrollTo(0);
        }
      }, 4000); // 4 seconds interval is perfect for visibility and readability
    };

    startAutoScroll();

    const handlePointerDown = () => {
      if (intervalId) clearInterval(intervalId);
    };
    
    const handlePointerUp = () => {
      startAutoScroll();
    };

    api.on("pointerDown", handlePointerDown);
    api.on("pointerUp", handlePointerUp);

    const onMouseEnter = () => {
      isHovered = true;
    };
    
    const onMouseLeave = () => {
      isHovered = false;
    };

    const emblaRoot = api.rootNode();
    emblaRoot.addEventListener("mouseenter", onMouseEnter);
    emblaRoot.addEventListener("mouseleave", onMouseLeave);

    return () => {
      clearInterval(intervalId);
      api.off("pointerDown", handlePointerDown);
      api.off("pointerUp", handlePointerUp);
      emblaRoot.removeEventListener("mouseenter", onMouseEnter);
      emblaRoot.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [api]);

  // Driven by the row's own setting rather than its title, so renaming a
  // flash-sale row no longer silently drops the banner and countdown.
  const isFlashSale = flashSale?.enabled ?? sectionName === "Flash Sale";

  return (
    <div
      className={`transition-all duration-300 relative overflow-hidden ${
        isFlashSale
          ? "bg-gradient-to-b from-amber-500/[0.08] via-card to-card border-2 border-primary/40 rounded-[2.5rem] p-4 sm:p-7 lg:p-8 shadow-2xl shadow-primary/10 ring-1 ring-primary/20"
          : "bg-transparent sm:bg-card/70 backdrop-blur-none sm:backdrop-blur-md border-none sm:border sm:border-primary/20 rounded-none sm:rounded-[2.2rem] p-0 sm:p-8 shadow-none sm:shadow-[var(--shadow-card)] hover:shadow-none sm:hover:shadow-[var(--shadow-hover)]"
      }`}
    >
      {/* Ambient background light for Flash Sale */}
      {isFlashSale && (
        <>
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-amber-400 to-primary animate-pulse" />
          <div className="hidden sm:block absolute -top-24 -right-24 w-96 h-96 bg-primary/15 blur-[120px] rounded-full pointer-events-none" />
          <div className="hidden sm:block absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
        </>
      )}

      {/* Subtle top decoration for normal sections */}
      {!isFlashSale && (
        <div className="hidden sm:block absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10" />
      )}

      <Carousel
        setApi={setApi}
        opts={{
          align: "center",
          loop: false,
          dragFree: false,
          containScroll: "trimSnaps",
          breakpoints: {
            "(min-width: 640px)": { align: "start" },
          },
        }}
        className="w-full"
      >
        {/* Flash Sale Custom High-Impact Banner Header (Highlighted Warm-Amber Luxury Theme) */}
        {isFlashSale ? (
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-7 p-5 sm:p-7 bg-gradient-to-r from-amber-500/15 via-primary/10 to-orange-500/20 text-foreground rounded-[2rem] border-2 border-primary/40 shadow-lg shadow-primary/5 relative overflow-hidden">
            {/* Ambient inner glow */}
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary/15 blur-[70px] rounded-full pointer-events-none" />

            {/* Left: Branding & Copy */}
            <div className="space-y-2 max-w-xl z-10">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span>{flashSale?.badgeText || "⚡ Limited Time Dubai Flash Deals"}</span>
              </div>

              <h2 className="text-xl sm:text-3xl lg:text-4xl font-serif text-foreground tracking-tight leading-snug">
                {sectionName}
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                {flashSale?.description ||
                  "Exclusive wholesale price drops on JUUL, MYLE & top disposable vapes. 3-hour express Dubai delivery!"}
              </p>
            </div>

            {/* Right: Integrated Countdown & Controls */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 z-10">
              {flashSale?.showTimer !== false && (
                <FlashSaleTimer settings={flashSale?.timer} />
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pt-1">
                {onViewAll && (
                  <button
                    onClick={() => onViewAll(sectionName, products)}
                    className="text-xs font-bold uppercase tracking-[0.08em] text-foreground hover:text-primary transition-colors underline decoration-primary/40 hover:decoration-primary underline-offset-4 cursor-pointer"
                  >
                    View All ({products.length})
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <CarouselPrevious className="relative left-auto right-auto top-auto bottom-auto translate-x-0 translate-y-0 w-8 h-8 border border-border/80 bg-card hover:bg-primary text-foreground hover:text-white active:scale-95 flex items-center justify-center rounded-full transition-all shadow-xs" />
                  <CarouselNext className="relative left-auto right-auto top-auto bottom-auto translate-x-0 translate-y-0 w-8 h-8 border border-border/80 bg-card hover:bg-primary text-foreground hover:text-white active:scale-95 flex items-center justify-center rounded-full transition-all shadow-xs" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Standard Section Header */
          <div className="px-4 sm:px-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-border/5 relative">
            <div className="hidden sm:block w-32" />

            <div className="text-center flex flex-col items-center flex-1">
              <span className="text-xs font-extrabold tracking-[0.25em] text-primary uppercase mb-1.5 flex items-center gap-2 justify-center">
                Curated Selection
              </span>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif text-foreground tracking-tight leading-snug">
                {sectionName}
              </h2>

              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="h-[1px] w-10 bg-gradient-to-r from-transparent to-primary/65" />
                <div className="w-1.5 h-1.5 rotate-45 border border-primary/40 bg-primary/10" />
                <div className="h-[1px] w-10 bg-gradient-to-l from-transparent to-primary/65" />
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-end gap-2.5 w-full sm:w-32">
              {onViewAll && (
                <button
                  onClick={() => onViewAll(sectionName, products)}
                  className="text-[11px] font-bold text-primary hover:underline cursor-pointer mr-1 uppercase tracking-wider"
                >
                  View All
                </button>
              )}
              <CarouselPrevious className="relative left-auto right-auto top-auto bottom-auto translate-x-0 translate-y-0 w-8 h-8 border border-border/60 bg-background/50 hover:bg-background text-muted-foreground hover:text-primary active:scale-95 flex items-center justify-center rounded-full" />
              <CarouselNext className="relative left-auto right-auto top-auto bottom-auto translate-x-0 translate-y-0 w-8 h-8 border border-border/60 bg-background/50 hover:bg-background text-muted-foreground hover:text-primary active:scale-95 flex items-center justify-center rounded-full" />
            </div>
          </div>
        )}

        <div className="-mx-4 sm:mx-0">
          {/*
            Embla's viewport is `overflow-hidden` (required to mask the
            off-screen slides), and the cards sit flush against its top edge, so
            ProductCard's `hover:-translate-y-1.5` lift was being sliced off.
            Padding the track keeps the lift inside the clip box.
          */}
          <CarouselContent className="px-4 sm:px-0 py-3">
            {products.map((product) => (
              <CarouselItem key={product.id} className="pl-3 sm:pl-4 basis-[82%] xs:basis-[72%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 flex">
                <ProductCard product={product} onAddToCart={onAddToCart} onBuyNow={onBuyNow} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>

        {/* Pagination Dots (Mobile Only) */}
        {scrollSnaps.length > 1 && (
          <div className="flex sm:hidden justify-center gap-1.5 mt-4 pb-2">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === selectedIndex ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </Carousel>
    </div>
  );
};
