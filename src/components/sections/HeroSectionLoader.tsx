"use client";

/**
 * HeroSectionLoader — performance wrapper for the HeroSection carousel.
 *
 * Strategy:
 *  1. On the server / first client paint: render a lightweight static shell
 *     that exactly matches the hero dimensions and includes the LCP image so
 *     Lighthouse sees the first-contentful paint immediately.
 *  2. After the browser is idle: swap in the full interactive HeroSection
 *     (Embla carousel, autoplay, swipe, promo-card router navigation).
 *
 * This defers ~40 KB of Embla + interaction JS from the critical path,
 * reducing TBT and improving Speed Index without hurting LCP or causing CLS.
 *
 * `ssr: false` is legal here because HeroSectionLoader IS a Client Component.
 */

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SlideHeadline, type HeroSettings } from "./HeroSection";

// Re-export so consumers (SectionRenderer) can import from one place.
export type { HeroSettings };

// ─── Lazy carousel — deferred until after first paint ──────────────────────
const HeroCarousel = dynamic(
  () => import("./HeroSection"),
  {
    ssr: false,   // Allowed: HeroSectionLoader is "use client"
    loading: () => null, // Static shell is already shown — no extra fallback needed
  }
);

const DEFAULT_SLIDE_IMAGES = [
  "/Slider/myle_slider.webp",
  "/Slider/disposable_slider.webp",
  "/Slider/pod_kits_slider.webp",
  "/Slider/e_liquid_slider.webp",
];
const DEFAULT_PROMO_IMAGES = [
  "/Slider/juul_1_slider.webp",
  "/Slider/juul_2_slider.webp",
];

/**
 * Lightweight first-slide shell rendered synchronously on first paint.
 * Structurally identical to the real carousel so there is zero CLS when
 * the interactive version swaps in.
 */
function HeroStaticShell({ settings }: { settings: HeroSettings }) {
  const slide = settings.slides?.[0];
  const cards = settings.promoCards ?? [];

  if (!slide) return null;

  const slideImg =
    slide.image ||
    slide.fallbackImage ||
    DEFAULT_SLIDE_IMAGES[0];

  return (
    <section className="relative pt-16 sm:pt-20 lg:pt-28 pb-4 overflow-hidden bg-transparent">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

          {/* ── Left panel — mirrors carousel dimensions exactly ── */}
          <div className="lg:col-span-8 relative bg-white dark:bg-card border border-border/60 rounded-[2.5rem] overflow-hidden card-shadow min-h-[420px] sm:min-h-[480px] lg:min-h-[520px] flex flex-col justify-between">
            {/* Single static slide */}
            <div className="p-6 sm:p-8 lg:p-10 min-h-[360px] sm:min-h-[420px] lg:min-h-[460px] flex flex-col justify-between flex-grow">
              {/* Badge */}
              <div className="mb-2 sm:mb-3">
                <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-primary badge-live flex-shrink-0" />
                  {slide.tag}
                </span>
              </div>

              {/* Content grid */}
              <div className="flex flex-col md:flex-row md:items-center gap-4 sm:gap-6 flex-grow py-1">
                {/* LCP image — mobile optimized 14KB asset with high priority */}
                <div className="md:w-[45%] md:order-2 flex items-center justify-center relative w-full h-[240px] sm:h-[320px] lg:h-[390px] py-1 select-none pointer-events-none">
                  {slideImg && (
                    <picture className="contents">
                      {slideImg.includes("myle_slider") && (
                        <source media="(max-width: 640px)" srcSet="/Slider/myle_slider_mobile.webp" />
                      )}
                      <Image
                        src={slideImg}
                        alt={slide.title}
                        width={400}
                        height={400}
                        priority
                        fetchPriority="high"
                        decoding="async"
                        quality={65}
                        sizes="(max-width: 640px) 240px, (max-width: 1024px) 320px, 400px"
                        className="sm:animate-float relative z-10 max-h-full w-auto max-w-full object-contain pointer-events-none"
                      />
                    </picture>
                  )}
                </div>

                {/* Text */}
                <div className="md:w-[55%] md:order-1 space-y-3 sm:space-y-4">
                  <div>
                    <p className="text-[11px] sm:text-xs font-bold tracking-[0.22em] text-primary uppercase mb-2 sm:mb-2.5">
                      {slide.accent}
                    </p>
                    <SlideHeadline title={slide.title} as="h2" />
                  </div>
                  <p className="text-xs sm:text-base text-muted-foreground leading-relaxed font-normal whitespace-pre-line max-w-xl line-clamp-3 sm:line-clamp-none">
                    {slide.description}
                  </p>

                  {/* Stats */}
                  <div className="flex gap-6 sm:gap-8 pt-1 sm:pt-2">
                    <div>
                      <p className="text-3xl sm:text-4xl font-serif text-foreground leading-none">{slide.stat1Value}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-0.5 sm:mt-1">{slide.stat1Label}</p>
                    </div>
                    <div className="w-px bg-border/60" />
                    <div>
                      <p className="text-3xl sm:text-4xl font-serif text-foreground leading-none">{slide.stat2Value}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-0.5 sm:mt-1">{slide.stat2Label}</p>
                    </div>
                  </div>

                  {/* CTA — plain Link (no router.push needed for static shell) */}
                  <div className="pt-2">
                    <Link
                      href={slide.ctaHref || "/shop"}
                      className="inline-flex items-center gap-2.5 bg-primary text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-xs sm:text-base font-extrabold tracking-wide hover:bg-gold-shimmer transition-all duration-300 primary-glow shadow-md"
                    >
                      {slide.buttonText} <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Dots placeholder — same height as the real dots bar */}
            <div className="relative z-20 px-8 sm:px-12 pb-4 sm:pb-5 border-t border-border/60 pt-3 bg-card rounded-b-[2.5rem]">
              <div className="flex items-center gap-4">
                {settings.slides.map((_, idx) => (
                  <div key={idx} className="flex items-center gap-2 py-1">
                    <div
                      className="h-[4px] rounded-full"
                      style={{
                        width: idx === 0 ? "56px" : "20px",
                        background: idx === 0 ? "var(--primary)" : "var(--border)",
                      }}
                    />
                    <span className={`text-xs font-bold uppercase tracking-widest ${idx === 0 ? "text-primary font-black" : "text-muted-foreground"}`}>
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Promo Cards static shell ── */}
          {cards.length > 0 && (
            <div className="lg:col-span-4 flex flex-col gap-5">
              {cards.map((card, idx) => {
                const isPrimary = card.style === "primary";
                const imgSrc = card.image || DEFAULT_PROMO_IMAGES[idx % DEFAULT_PROMO_IMAGES.length];
                return (
                  <Link
                    key={idx}
                    href={card.href || "/shop"}
                    className={`flex-1 border rounded-[2.5rem] p-6 sm:p-8 flex gap-5 items-center justify-between relative overflow-hidden card-shadow min-h-[260px] sm:min-h-[290px] ${
                      isPrimary ? "bg-primary border-primary" : "bg-white dark:bg-card border-border/60"
                    }`}
                  >
                    <div className="flex flex-col justify-center flex-grow min-w-0 z-10 gap-4 py-1">
                      <div>
                        <span className={`text-[10px] sm:text-[11px] font-bold tracking-[0.18em] uppercase block mb-2 ${isPrimary ? "text-white/80" : "text-primary"}`}>
                          {card.eyebrow}
                        </span>
                        <h3 className={`text-xl sm:text-2xl font-serif leading-[1.05] tracking-tight ${isPrimary ? "text-white" : "text-foreground"}`}>
                          {card.title}
                        </h3>
                        <p className={`text-sm mt-2 leading-relaxed ${isPrimary ? "text-white/85" : "text-muted-foreground"}`}>
                          {card.subtitle}
                        </p>
                      </div>
                      <div className={`inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full w-fit ${
                        isPrimary ? "bg-white text-primary shadow-md" : "bg-primary text-white primary-glow shadow-xs"
                      }`}>
                        {card.buttonText} <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                    {imgSrc && (
                      <div className="w-[120px] sm:w-[140px] h-[160px] sm:h-[190px] flex-shrink-0 relative flex items-center justify-center z-10 overflow-hidden">
                        <Image
                          src={imgSrc}
                          alt={card.title}
                          width={140}
                          height={190}
                          sizes="140px"
                          className="max-h-full max-w-full w-auto h-auto object-contain pointer-events-none"
                        />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Main export ────────────────────────────────────────────────────────────
export function HeroSectionLoader({ settings }: { settings: HeroSettings }) {
  const [carouselReady, setCarouselReady] = useState(false);

  useEffect(() => {
    // Defer carousel hydration until browser is idle (after LCP paint).
    // Falls back to setTimeout on browsers without requestIdleCallback.
    const schedule =
      typeof requestIdleCallback !== "undefined"
        ? requestIdleCallback
        : (cb: () => void) => setTimeout(cb, 200);

    const handle = schedule(() => setCarouselReady(true));

    return () => {
      if (typeof cancelIdleCallback !== "undefined") {
        cancelIdleCallback(handle as number);
      }
    };
  }, []);

  // Show full carousel once JS is ready; static shell is the SSR placeholder.
  return carouselReady
    ? <HeroCarousel settings={settings} />
    : <HeroStaticShell settings={settings} />;
}
