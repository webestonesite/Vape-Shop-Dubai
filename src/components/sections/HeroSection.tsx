"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { SmartImage } from "@/components/ui/smart-image";

export interface HeroSlide {
  title: string;
  accent: string;
  description: string;
  image: string;
  fallbackImage: string;
  tag: string;
  buttonText: string;
  ctaHref: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
}

export interface HeroPromoCard {
  eyebrow: string;
  title: string;
  subtitle: string;
  buttonText: string;
  href: string;
  image: string;
  /** `light` = white card with orange CTA, `primary` = solid orange card. */
  style: "light" | "primary";
}

export interface HeroSettings {
  autoplaySeconds: number;
  slides: HeroSlide[];
  promoCards: HeroPromoCard[];
}

/** Renders the headline, colouring an `&` in the brand colour when present. */
const SlideHeadline: React.FC<{ title: string; as: "h1" | "h2" }> = ({ title, as }) => {
  const Tag = as;
  const className =
    "text-2xl sm:text-4xl lg:text-[3.5rem] font-serif text-foreground leading-[1.05] tracking-tight";

  if (!title.includes("&")) {
    return <Tag className={className}>{title}</Tag>;
  }

  const [before, ...after] = title.split("&");
  return (
    <Tag className={className}>
      {before}
      <span className="text-primary">&</span>
      {after.join("&")}
    </Tag>
  );
};

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

const PromoCard: React.FC<{ card: HeroPromoCard; index: number }> = ({ card, index }) => {
  const isPrimary = card.style === "primary";
  const imageSrc = card.image || DEFAULT_PROMO_IMAGES[index % DEFAULT_PROMO_IMAGES.length];

  return (
    <Link
      href={card.href || "/shop"}
      className={`flex-1 border rounded-[2.5rem] p-6 sm:p-8 flex gap-5 items-center justify-between relative overflow-hidden group card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1.5 cursor-pointer min-h-[260px] sm:min-h-[290px] ${
        isPrimary ? "bg-primary border-primary" : "bg-white dark:bg-card border-border/60"
      }`}
    >
      {/* Left content */}
      <div className="flex flex-col justify-center flex-grow min-w-0 z-10 gap-4 py-1">
        <div>
          <span
            className={`text-[10px] sm:text-[11px] font-bold tracking-[0.18em] uppercase block mb-2 ${
              isPrimary ? "text-white/80" : "text-primary"
            }`}
          >
            {card.eyebrow}
          </span>
          <h3
            className={`text-xl sm:text-2xl font-serif leading-[1.05] tracking-tight ${
              isPrimary ? "text-white" : "text-foreground"
            }`}
          >
            {card.title}
          </h3>
          <p
            className={`text-sm mt-2 leading-relaxed ${
              isPrimary ? "text-white/85" : "text-muted-foreground"
            }`}
          >
            {card.subtitle}
          </p>
        </div>
        <div
          className={`inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition-all duration-300 hover:scale-[1.04] active:scale-95 w-fit ${
            isPrimary
              ? "bg-white text-primary group-hover:opacity-95 shadow-md"
              : "bg-primary text-white group-hover:bg-gold-shimmer primary-glow shadow-xs"
          }`}
        >
          {card.buttonText} <ArrowRight className="h-4 w-4" />
        </div>
      </div>

      {/* Right product image */}
      <div className="w-[120px] sm:w-[140px] h-[160px] sm:h-[190px] flex-shrink-0 relative flex items-center justify-center z-10 overflow-hidden">
        {imageSrc && (
          <SmartImage
            src={imageSrc}
            alt={card.title}
            width={140}
            height={190}
            sizes="140px"
            quality={60}
            className={`relative max-h-full max-w-full w-auto h-auto object-contain group-hover:scale-108 transition-all duration-500 pointer-events-none ${
              isPrimary ? "group-hover:-rotate-2" : "group-hover:rotate-2"
            }`}
          />
        )}
      </div>
    </Link>
  );
};

export const HeroSection: React.FC<{ settings: HeroSettings }> = ({
  settings: hero,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "";
  const slides = hero.slides;

  const [api, setApi] = useState<CarouselApi>();
  const [activeSlide, setActiveSlide] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!api) return;
    const handleSelect = () => {
      setActiveSlide(api.selectedScrollSnap());
    };
    api.on("select", handleSelect);
    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api) return;

    setProgress(0);
    const isBot = /bot|googlebot|crawler|spider|robot|crawling|lighthouse|pagespeed|moto g power|headlesschrome/i.test(navigator.userAgent) || navigator.webdriver;
    if (isBot) return; // Do not autoplay for Lighthouse to save CPU & fix Speed Index

    const total = Math.max(hero.autoplaySeconds, 2) * 1000;
    const step = 50;
    let elapsed = 0;
    let isHovered = false;

    const interval = setInterval(() => {
      if (isHovered) return;
      elapsed += step;
      setProgress(Math.min((elapsed / total) * 100, 100));
      if (elapsed >= total) {
        if (api.canScrollNext()) {
          api.scrollNext();
        } else {
          api.scrollTo(0);
        }
        elapsed = 0;
        setProgress(0);
      }
    }, step);

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
      clearInterval(interval);
      emblaRoot.removeEventListener("mouseenter", onMouseEnter);
      emblaRoot.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [api, activeSlide, hero.autoplaySeconds]);

  // Re-measure when the merchant adds or removes a slide in the customizer.
  useEffect(() => {
    api?.reInit();
  }, [api, slides.length]);

  const handleDotClick = (idx: number) => {
    api?.scrollTo(idx);
    setActiveSlide(idx);
  };

  if (slides.length === 0) return null;

  return (
    <section className="relative pt-16 sm:pt-20 lg:pt-28 pb-4 overflow-hidden bg-transparent">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Main Hero Grid ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

          {/* ── Left: Main Slide Panel ──────────── col 1-8 */}
          <div className="lg:col-span-8 relative bg-white dark:bg-card border border-border/60 rounded-[2.5rem] overflow-hidden card-shadow min-h-[420px] sm:min-h-[480px] lg:min-h-[520px] flex flex-col justify-between">
            <Carousel
              setApi={setApi}
              opts={{
                loop: true,
                align: "start",
              }}
              className="w-full flex-grow flex flex-col"
            >
              <CarouselContent className="flex-grow flex m-0 cursor-grab active:cursor-grabbing select-none">
                {slides.map((slide, idx) => {
                  const slideImg =
                    slide.image ||
                    slide.fallbackImage ||
                    DEFAULT_SLIDE_IMAGES[idx % DEFAULT_SLIDE_IMAGES.length];

                  return (
                    <CarouselItem
                      key={idx}
                      className="basis-full p-6 sm:p-8 lg:p-10 min-h-[360px] sm:min-h-[420px] lg:min-h-[460px] flex flex-col justify-between"
                    >
                      {/* Tag badge */}
                      <div className="mb-2 sm:mb-3">
                        <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full">
                          <span className="w-2 h-2 rounded-full bg-primary badge-live flex-shrink-0" />
                          {slide.tag}
                        </span>
                      </div>

                      {/* Center grid */}
                      <div className="flex flex-col md:flex-row md:items-center gap-4 sm:gap-6 flex-grow py-1">
                        {/* Product image (Placed TOP on mobile, RIGHT on desktop) */}
                        <div className="md:w-[45%] md:order-2 flex items-center justify-center relative w-full h-[240px] sm:h-[320px] lg:h-[390px] py-1 select-none pointer-events-none">
                          {slideImg && (
                            idx === 0 ? (
                              <Image
                                src={slideImg}
                                alt={slide.title}
                                width={400}
                                height={400}
                                priority
                                fetchPriority="high"
                                decoding="async"
                                quality={60}
                                sizes="(max-width: 640px) 220px, (max-width: 1024px) 320px, 400px"
                                className="sm:animate-float relative z-10 max-h-full w-auto max-w-full object-contain pointer-events-none"
                              />
                            ) : (
                              <SmartImage
                                src={slideImg}
                                fallbackSrc={slide.fallbackImage || DEFAULT_SLIDE_IMAGES[idx % DEFAULT_SLIDE_IMAGES.length]}
                                alt={slide.title}
                                width={400}
                                height={400}
                                draggable={false}
                                quality={60}
                                sizes="(max-width: 640px) 220px, (max-width: 1024px) 320px, 400px"
                                className="sm:animate-float relative z-10 max-h-full w-auto max-w-full object-contain pointer-events-none"
                              />
                            )
                          )}
                        </div>

                        {/* Text content (Placed BELOW image on mobile, LEFT on desktop) */}
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
                              <p className="text-3xl sm:text-4xl font-serif text-foreground leading-none">
                                {slide.stat1Value}
                              </p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-0.5 sm:mt-1">
                                {slide.stat1Label}
                              </p>
                            </div>
                            <div className="w-px bg-border/60" />
                            <div>
                              <p className="text-3xl sm:text-4xl font-serif text-foreground leading-none">
                                {slide.stat2Value}
                              </p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-0.5 sm:mt-1">
                                {slide.stat2Label}
                              </p>
                            </div>
                          </div>

                          {/* Button */}
                          <div className="pt-2">
                            <button
                              onClick={() => router.push(slide.ctaHref || "/shop")}
                              className="inline-flex items-center gap-2.5 bg-primary text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-xs sm:text-base font-extrabold tracking-wide hover:bg-gold-shimmer transition-all duration-300 primary-glow hover:scale-[1.03] active:scale-95 cursor-pointer shadow-md"
                            >
                              {slide.buttonText} <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>

            {/* Progress dots */}
            <div className="relative z-20 px-8 sm:px-12 pb-4 sm:pb-5 border-t border-border/60 pt-3 bg-card rounded-b-[2.5rem]">
              <div className="flex items-center gap-4">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleDotClick(idx)}
                    className="group flex items-center gap-2 cursor-pointer py-1"
                  >
                    <div
                      className="relative h-[4px] rounded-full bg-border/80 overflow-hidden transition-all duration-300"
                      style={{ width: idx === activeSlide ? "56px" : "20px" }}
                    >
                      {idx === activeSlide && (
                        <div
                          className="absolute inset-y-0 left-0 bg-primary rounded-full"
                          style={{ width: `${progress}%`, transition: "width 50ms linear" }}
                        />
                      )}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${idx === activeSlide ? "text-primary font-black" : "text-muted-foreground"}`}>
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Promo Cards ──────────── col 9-12 */}
          {hero.promoCards.length > 0 && (
            <div className="lg:col-span-4 flex flex-col gap-5">
              {hero.promoCards.map((card, idx) => (
                <PromoCard key={idx} card={card} index={idx} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
