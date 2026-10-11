"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SmartImage } from "@/components/ui/smart-image";

interface FlavorItem {
  name: string;
  img: string;
  color: string;
  query: string;
}

interface FlavorsWheelProps {
  eyebrow?: string;
  heading?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
  flavors?: FlavorItem[];
  onFlavorSelect?: (flavorLabel: string) => void;
}

const DEFAULT_FLAVORS: FlavorItem[] = [
  {
    name: "Mango",
    color: "#f59e0b",
    img: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/Mango_Vape_shop_dubai_result.jpg?v=1788119690",
    query: "Mango",
  },
  {
    name: "Strawberry",
    color: "#ef4444",
    img: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/Strawberry_vape_flavor.jpg?v=1788120037",
    query: "Strawberry",
  },
  {
    name: "CheeseCake",
    color: "#d4a574",
    img: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/cheesecake_vape_shop_dubai.jpg?v=1788119897",
    query: "Cheesecake",
  },
  {
    name: "Watermelon",
    color: "#ec4899",
    img: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/Watermelon-_vape_shop_dubai_result.jpg?v=1788120706",
    query: "Watermelon",
  },
  {
    name: "Mint & Menthol",
    color: "#06b6d4",
    img: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/mint_-_vape_shop_dubai_result.jpg?v=1788120314",
    query: "Mint",
  },
  {
    name: "Peach",
    color: "#f97316",
    img: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/Peach_flavour_showcase_image_2K_202608302024_result.jpg?v=1788120619",
    query: "Peach",
  },
  {
    name: "Grape",
    color: "#8b5cf6",
    img: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/Grape_flavor_vape_shop_dubai.jpg?v=1788119965",
    query: "Grape",
  },
  {
    name: "Blue Razz",
    color: "#3b82f6",
    img: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/Blue_Razz__vape_shop_dubai_result.jpg?v=1788120799",
    query: "Blueberry",
  },
  {
    name: "Pineapple",
    color: "#ca8a04",
    img: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/Pineapple_vape_flavor_thumbnail___202608310229_result.jpg?v=1788121829",
    query: "Pineapple",
  },
  {
    name: "Lychee",
    color: "#e879a0",
    img: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/lychee_vape_flavor_2K_202608310233_result.jpg?v=1788122094",
    query: "Lychee",
  },
  {
    name: "Berry",
    color: "#d946ef",
    img: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/berry_vape_flavor_image_202608310237.jpg?v=1788122292",
    query: "Berry",
  },
  {
    name: "Vanilla",
    color: "#a78b5c",
    img: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/Vanilla_vape_flavor_thumbnail_sh__202608310241_result.jpg?v=1788122579",
    query: "Vanilla",
  },
];

const FLAVOR_IMAGE_MAP: Record<string, string> = {
  mango: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/Mango_Vape_shop_dubai_result.jpg?v=1788119690",
  strawberry: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/Strawberry_vape_flavor.jpg?v=1788120037",
  cheesecake: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/cheesecake_vape_shop_dubai.jpg?v=1788119897",
  watermelon: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/Watermelon-_vape_shop_dubai_result.jpg?v=1788120706",
  mint: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/mint_-_vape_shop_dubai_result.jpg?v=1788120314",
  menthol: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/mint_-_vape_shop_dubai_result.jpg?v=1788120314",
  cool: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/mint_-_vape_shop_dubai_result.jpg?v=1788120314",
  frost: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/mint_-_vape_shop_dubai_result.jpg?v=1788120314",
  ice: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/mint_-_vape_shop_dubai_result.jpg?v=1788120314",
  peach: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/Peach_flavour_showcase_image_2K_202608302024_result.jpg?v=1788120619",
  grape: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/Grape_flavor_vape_shop_dubai.jpg?v=1788119965",
  blue: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/Blue_Razz__vape_shop_dubai_result.jpg?v=1788120799",
  razz: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/Blue_Razz__vape_shop_dubai_result.jpg?v=1788120799",
  pineapple: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/Pineapple_vape_flavor_thumbnail___202608310229_result.jpg?v=1788121829",
  lychee: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/lychee_vape_flavor_2K_202608310233_result.jpg?v=1788122094",
  berry: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/berry_vape_flavor_image_202608310237.jpg?v=1788122292",
  vanilla: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/Vanilla_vape_flavor_thumbnail_sh__202608310241_result.jpg?v=1788122579",
  apple: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/Mango_Vape_shop_dubai_result.jpg?v=1788119690",
  cherry: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/Strawberry_vape_flavor.jpg?v=1788120037",
  citrus: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/Pineapple_vape_flavor_thumbnail___202608310229_result.jpg?v=1788121829",
  lemon: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/Pineapple_vape_flavor_thumbnail___202608310229_result.jpg?v=1788121829",
  tobacco: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/Vanilla_vape_flavor_thumbnail_sh__202608310241_result.jpg?v=1788122579",
  virginia: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/Vanilla_vape_flavor_thumbnail_sh__202608310241_result.jpg?v=1788122579",
  candy: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/berry_vape_flavor_image_202608310237.jpg?v=1788122292",
  soda: "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/berry_vape_flavor_image_202608310237.jpg?v=1788122292",
};

function resolveFlavorImg(name: string, customImg?: string): string {
  if (customImg && customImg.trim()) {
    return customImg.trim();
  }
  const nameLower = (name || "").toLowerCase();
  for (const [key, url] of Object.entries(FLAVOR_IMAGE_MAP)) {
    if (nameLower.includes(key)) {
      return url;
    }
  }
  
  // Use a dynamic high-quality aesthetic fallback from DEFAULT_FLAVORS if no match
  const fallbackImages = DEFAULT_FLAVORS.map(f => f.img);
  // Simple hash to consistently pick the same image for the same flavor name
  const hash = nameLower.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return fallbackImages[hash % fallbackImages.length];
}

export function FlavorsWheel({ 
  eyebrow = "Taste the Difference",
  heading = "Best Flavours",
  description = "From fruity bursts to icy hits, Best Flavours bring your vibe to life with every puff.",
  buttonText = "Shop Now",
  buttonHref = "/collections/disposable-vape",
  flavors: customFlavors,
  onFlavorSelect 
}: FlavorsWheelProps) {
  const flavors = React.useMemo(() => {
    let list = Array.isArray(customFlavors) && customFlavors.length > 0 ? [...customFlavors] : [...DEFAULT_FLAVORS];
    list = list.map((item, idx) => {
      const fallback = DEFAULT_FLAVORS[idx % DEFAULT_FLAVORS.length];
      const flavorName = item.name || fallback.name;
      return {
        name: flavorName,
        color: item.color || fallback.color,
        img: resolveFlavorImg(flavorName, item.img),
        query: item.query || item.name || fallback.query,
      };
    });
    while (list.length < 10) {
      const fallback = DEFAULT_FLAVORS[list.length % DEFAULT_FLAVORS.length];
      list.push({
        ...fallback,
        img: resolveFlavorImg(fallback.name, fallback.img)
      });
    }
    return list;
  }, [customFlavors]);

  const [activeFlavor, setActiveFlavor] = useState(flavors[0]);
  const [isPaused, setIsPaused] = useState(false);
  const router = useRouter();

  const handleFlavorClick = (flavor: FlavorItem) => {
    setActiveFlavor(flavor);
    if (onFlavorSelect) {
      onFlavorSelect(flavor.name);
    } else {
      const url = new URL(buttonHref || "/collections/disposable-vape", "http://localhost");
      if (flavor.query) {
        url.searchParams.set("search", flavor.query);
      }
      router.push(url.pathname + url.search);
    }
  };

  return (
    <div className="w-full relative overflow-hidden" suppressHydrationWarning>
      {/* CSS for wheel spin animations */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes wheel-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes reverse-wheel-spin {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-wheel-spin {
          animation: wheel-spin 42s linear infinite;
        }
        .animate-reverse-wheel-spin {
          animation: reverse-wheel-spin 42s linear infinite;
        }
      `,
        }}
      />

      <div className="max-w-[1400px] mx-auto px-2 sm:px-8 md:px-16 lg:px-24 relative flex items-center justify-center min-h-[300px] sm:min-h-[460px] md:min-h-[580px]">
        {/* Center Text Block (Matching reference design) */}
        <div className="absolute z-10 text-center max-w-[150px] sm:max-w-xs md:max-w-md flex flex-col items-center justify-center pointer-events-none select-none">
          {eyebrow && (
            <span className="text-[8px] sm:text-xs md:text-sm font-extrabold tracking-[0.2em] sm:tracking-[0.25em] text-primary uppercase mb-0.5 sm:mb-1.5">
              {eyebrow}
            </span>
          )}
          {heading && (
            <h2 className="text-lg sm:text-3xl md:text-5xl lg:text-6xl font-serif font-black text-foreground tracking-tight leading-tight mb-1 sm:mb-2">
              {heading}
            </h2>
          )}
          {description && (
            <p className="hidden md:block text-muted-foreground text-xs sm:text-sm mb-3 px-4 leading-relaxed font-medium whitespace-pre-line">
              {description}
            </p>
          )}

          <div className="h-5 sm:h-7 md:h-8 mb-1.5 sm:mb-3 flex items-center justify-center">
            <p
              className="text-xs sm:text-base md:text-xl lg:text-2xl font-bold transition-all duration-300 ease-in-out truncate max-w-[140px] sm:max-w-none"
              style={{ color: activeFlavor.color }}
            >
              {activeFlavor.name}
            </p>
          </div>

          {buttonText && (
            <button
              onClick={() => handleFlavorClick(activeFlavor)}
              className="pointer-events-auto rounded-full border border-foreground/30 sm:border-2 px-3.5 sm:px-7 md:px-9 py-1 sm:py-2 md:py-3 text-[8px] sm:text-xs md:text-sm font-bold uppercase tracking-wider transition-all hover:bg-foreground hover:text-background active:scale-95 cursor-pointer shadow-md bg-card/70 backdrop-blur-xs"
            >
              {buttonText}
            </button>
          )}
        </div>

        {/* Dense Rotating Wheel with 14 Fruit Badges */}
        <div
          className="relative w-[230px] sm:w-[380px] md:w-[500px] lg:w-[580px] aspect-square rounded-full border border-foreground/10 pointer-events-none shrink-0 my-5 sm:my-8"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className="absolute inset-0 rounded-full animate-wheel-spin"
            style={{ animationPlayState: isPaused ? "paused" : "running" }}
          >
            {flavors.map((flavor, index) => {
              const angle = (index / flavors.length) * 360;
              return (
                <div
                  key={`${flavor.name}-${index}`}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                    <div
                      className="animate-reverse-wheel-spin"
                      style={{ animationPlayState: isPaused ? "paused" : "running" }}
                    >
                      <div
                        className={`w-9 h-9 sm:w-14 sm:h-14 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-full overflow-hidden border-2 sm:border-4 bg-background shadow-lg hover:scale-125 transition-all cursor-pointer relative z-20 ${activeFlavor.name === flavor.name
                          ? "ring-2 sm:ring-4 ring-offset-1 sm:ring-offset-2 ring-primary scale-115 sm:scale-125 border-primary shadow-primary/30"
                          : "border-background hover:border-primary/50"
                          }`}
                        style={{ transform: `rotate(-${angle}deg)` }}
                        onClick={() => handleFlavorClick(flavor)}
                        onMouseEnter={() => setActiveFlavor(flavor)}
                      >
                        <SmartImage
                          src={flavor.img}
                          fallbackSrc="https://cdn.shopify.com/s/files/1/0684/3488/6727/files/Mango_Vape_shop_dubai_result.jpg?v=1788119690"
                          alt={flavor.name}
                          width={80}
                          height={80}
                          sizes="(max-width: 640px) 40px, 80px"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlavorsWheel;
