"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Droplet, ShoppingCart, Flame } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface JuulSignatureFlavorsSectionProps {
  handle: string;
}

export interface JuulFlavorItem {
  id: string;
  name: string;
  color: string;
  podsPerPack: string;
  strength: string;
  price: number;
  description: string;
  image: string;
}

const JUUL1_FLAVORS: JuulFlavorItem[] = [
  {
    id: "juul-menthol-5",
    name: "Menthol 5%",
    color: "#06b6d4",
    podsPerPack: "4 PODS PER PACK",
    strength: "STRENGTH: 5%",
    price: 85.0,
    description:
      '"The JUUL 1 Menthol 5% delivers a crisp, cool menthol profile that stays clean and balanced from start to finish. Menthol lovers mostly prefer this flavour for its strong salt nicotine hit."',
    image: "/juul_device.png",
  },
  {
    id: "juul-virginia-5",
    name: "Virginia Tobacco 5%",
    color: "#d97706",
    podsPerPack: "4 PODS PER PACK",
    strength: "STRENGTH: 5%",
    price: 90.0,
    description:
      '"Tobacco flavors in the vaping market are a mixed bag. The JUUL Virginia Tobacco pod cartridge 5% is slightly sweet, slightly earthy and doesn\'t get harsh or flat as the pod runs down."',
    image: "/juul_device.png",
  },
  {
    id: "juul-menthol-3",
    name: "Menthol 3%",
    color: "#0284c7",
    podsPerPack: "4 PODS PER PACK",
    strength: "STRENGTH: 3%",
    price: 85.0,
    description:
      '"JUUL 1 pod refill cartridge is well appreciated among cooling effect lovers. Every puff delivers a subtle icy sensation of cool mint. Never tastes chemically or overpowered."',
    image: "/juul_device.png",
  },
  {
    id: "juul-virginia-3",
    name: "Virginia Tobacco 3%",
    color: "#b45309",
    podsPerPack: "4 PODS PER PACK",
    strength: "STRENGTH: 3%",
    price: 90.0,
    description:
      '"JUUL Classic tobacco vape flavor is designed to deliver a consistent, grounded tobacco experience from start to finish. A perfect choice for cigarette smokers looking for a clean alternative."',
    image: "/juul_device.png",
  },
  {
    id: "juul-mint-5",
    name: "Classic Mint 5%",
    color: "#10b981",
    podsPerPack: "4 PODS PER PACK",
    strength: "STRENGTH: 5%",
    price: 85.0,
    description:
      '"Refreshing peppermint flavor with a soothing icy exhale. One of the most popular JUUL pod flavors in Dubai for all-day vaping."',
    image: "/juul_device.png",
  },
  {
    id: "juul-mango-5",
    name: "Mango 5% (Limited)",
    color: "#f59e0b",
    podsPerPack: "4 PODS PER PACK",
    strength: "STRENGTH: 5%",
    price: 120.0,
    description:
      '"Ripe tropical sweet mango flavor pod cartridge. Highly sought-after original flavor with rich nicotine salt satisfaction."',
    image: "/juul_device.png",
  },
];

const JUUL2_FLAVORS: JuulFlavorItem[] = [
  {
    id: "juul2-crisp-menthol",
    name: "Crisp Menthol 18mg",
    color: "#06b6d4",
    podsPerPack: "2 PODS PER PACK",
    strength: "STRENGTH: 18mg/ml",
    price: 85.0,
    description:
      '"JUUL 2 Crisp Menthol features fresh green menthol flavor with a brisk cooling exhale. Engineered with anti-counterfeit chip technology."',
    image: "/juul_device.png",
  },
  {
    id: "juul2-virginia-tobacco",
    name: "Virginia Tobacco 18mg",
    color: "#d97706",
    podsPerPack: "2 PODS PER PACK",
    strength: "STRENGTH: 18mg/ml",
    price: 90.0,
    description:
      '"Subtle, toasted tobacco flavor with sweet aromatic notes. Specially blended for JUUL 2 next-gen pod system."',
    image: "/juul_device.png",
  },
  {
    id: "juul2-ruby-scheme",
    name: "Ruby Scheme 18mg",
    color: "#ec4899",
    podsPerPack: "2 PODS PER PACK",
    strength: "STRENGTH: 18mg/ml",
    price: 85.0,
    description:
      '"JUUL 2 Ruby Scheme combines wild red berry notes with a crisp cooling finish. Unique signature blend."',
    image: "/juul_device.png",
  },
  {
    id: "juul2-polar-menthol",
    name: "Polar Menthol 18mg",
    color: "#3b82f6",
    podsPerPack: "2 PODS PER PACK",
    strength: "STRENGTH: 18mg/ml",
    price: 85.0,
    description:
      '"Deep, intense freezing menthol flavor with a powerful cooling hit designed for maximum satisfaction."',
    image: "/juul_device.png",
  },
];

export interface JuulSignatureFlavorsSettings {
  badgeText: string;
  heading: string;
  flavors: JuulFlavorItem[];
}

export function JuulSignatureFlavorsSection({
  handle,
  settings,
}: JuulSignatureFlavorsSectionProps & { settings?: JuulSignatureFlavorsSettings }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { addToCart, setIsCartOpen } = useCart();
  const isJuul2 = (handle || "").toLowerCase().includes("juul-2");

  // Saved flavours win. The JUUL 1 / JUUL 2 split stays as the fallback for a
  // placement saved before this section had editable content.
  const flavorList =
    settings?.flavors && settings.flavors.length > 0
      ? settings.flavors
      : isJuul2
        ? JUUL2_FLAVORS
        : JUUL1_FLAVORS;

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: "smooth" });
    }
  };

  const handleAddToCart = (item: JuulFlavorItem) => {
    addToCart({
      id: item.id,
      name: `JUUL Pods - ${item.name}`,
      price: item.price,
      image: item.image,
      category: "juul",
      variantId: item.strength,
    });
    setIsCartOpen(true);
  };

  return (
    <div className="w-full">
      <div className="bg-card border border-border/60 rounded-[2.5rem] p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-md transition-all duration-300">
        {/* Glow Ambient Top Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10" />

        {/* Header Bar with Carousel Arrow Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full mb-2">
              <Droplet className="w-4 h-4 text-primary" />
              <span>{settings?.badgeText || "Official JUUL Flavor Lineup"}</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-serif font-black text-foreground tracking-tight flex items-center gap-3">
              <span>{settings?.heading || "Signature Flavors"}</span>
            </h2>
          </div>

          {/* Carousel Control Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={scrollLeft}
              className="w-11 h-11 rounded-full border border-border bg-background hover:bg-primary hover:text-white text-foreground flex items-center justify-center transition-all duration-300 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollRight}
              className="w-11 h-11 rounded-full border border-border bg-background hover:bg-primary hover:text-white text-foreground flex items-center justify-center transition-all duration-300 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Carousel Container */}
        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-6 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1"
        >
          {flavorList.map((flavor) => (
            <div
              key={flavor.id}
              className="w-[280px] sm:w-[320px] shrink-0 bg-background border border-border/80 hover:border-primary rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10 group relative"
            >
              {/* Top Pods Per Pack Badge */}
              <div className="text-center mb-4">
                <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest bg-muted/30 px-3 py-1 rounded-full border border-border/40">
                  {flavor.podsPerPack}
                </span>
              </div>

              {/* JUUL Pod Graphic */}
              <div className="relative w-28 h-28 mx-auto mb-4 flex items-center justify-center bg-card rounded-2xl border border-border/40 p-3 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <div
                  className="absolute top-3 w-16 h-4 rounded-t-md"
                  style={{ backgroundColor: flavor.color }}
                />
                <img
                  src={flavor.image}
                  alt={flavor.name}
                  className="w-full h-full object-contain relative z-10"
                />
              </div>

              {/* Title & Description (Matching Screenshot Typography) */}
              <div className="text-center space-y-2 flex-grow mb-6">
                <h3 className="text-xl sm:text-2xl font-serif font-black text-foreground group-hover:text-primary transition-colors tracking-tight">
                  {flavor.name}
                </h3>

                <p className="text-xs text-muted-foreground italic leading-relaxed font-medium line-clamp-4 px-1">
                  {flavor.description}
                </p>
              </div>

              {/* Bottom Footer: Strength & Price */}
              <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                    {flavor.strength}
                  </div>
                  <div className="text-xl sm:text-2xl font-serif font-black text-foreground">
                    Dhs. {flavor.price.toFixed(2)}
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(flavor)}
                  className="inline-flex items-center gap-1.5 bg-primary text-white hover:bg-gold-shimmer px-4 py-2.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all duration-300 shadow-md hover:scale-105 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
