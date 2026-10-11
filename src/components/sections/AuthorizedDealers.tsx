"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter, useParams } from "next/navigation";
import { useCollectionImages, getHandleFromUrl } from "@/hooks/useCollectionImages";
import { SmartImage } from "@/components/ui/smart-image";

const FlavorsWheel = dynamic(
  () => import("./FlavorsWheel"),
  { ssr: false }
);

export interface BrandItem {
  name: string;
  image: string;
  href: string;
}

export interface FlavorItem {
  name: string;
  img: string;
  color: string;
  query: string;
}

export interface BrandsSettings {
  eyebrow: string;
  heading: string;
  seeAllLabel: string;
  seeAllHref: string;
  showFlavorWheel: boolean;
  flavorWheelEyebrow?: string;
  flavorWheelHeading?: string;
  flavorWheelDescription?: string;
  flavorWheelButtonText?: string;
  flavorWheelButtonHref?: string;
  flavorItems?: FlavorItem[];
  items: BrandItem[];
}

interface AuthorizedDealersProps {
  settings: BrandsSettings;
  onBrandSelect?: (brand: string) => void;
  onFlavorSelect?: (flavor: string) => void;
}

const DEFAULT_BRANDS: BrandItem[] = [
  { name: "JUUL", image: "", href: "/collections/juul-vape-dubai" },
  { name: "MYLE", image: "", href: "/collections/myle-vape-dubai" },
  { name: "GeekVape", image: "", href: "/collections/geek-vape" },
  { name: "Uwell", image: "", href: "/collections/uwell-vape" },
  { name: "Vaporesso", image: "", href: "/collections/vaporesso-vape" },
  { name: "VooPoo", image: "", href: "/collections/voopoo-vape" },
  { name: "Smok", image: "", href: "/collections/smok-vape" },
  { name: "Oxva", image: "", href: "/collections/oxva-vape" },
  { name: "Elf Bar", image: "", href: "/collections/elf-bar-vape" },
  { name: "Lost Mary", image: "", href: "/collections/lost-mary-disposable" },
  { name: "Tugboat", image: "", href: "/collections/tugboat-vape" },
  { name: "Maskking Vape", image: "", href: "/collections/maskking-vape" },
  { name: "Pod Salt", image: "", href: "/collections/pod-salt-vape" },
  { name: "Yuoto", image: "", href: "/collections/yuoto-vape" },
  { name: "Silvaper", image: "", href: "/collections/silvaper-vape" },
  { name: "Al Fakher", image: "", href: "/collections/al-fakher-vape" },
];

export const AuthorizedDealers: React.FC<AuthorizedDealersProps> = ({
  settings,
  onBrandSelect,
  onFlavorSelect,
}) => {
  const router = useRouter();
  const params = useParams();
  
  const collectionImages = useCollectionImages();

  const handle = (params?.handle as string) || "";
  const isJuul1Or2 =
    handle.toLowerCase().includes("juul-1") ||
    handle.toLowerCase().includes("juul-2") ||
    handle.toLowerCase().includes("juul1") ||
    handle.toLowerCase().includes("juul2");

  const eyebrow = settings?.eyebrow || "Taste the Difference";
  const heading = settings?.heading || "Best Vape Brands in Dubai";
  const items = Array.isArray(settings?.items) && settings.items.length > 0 ? settings.items : DEFAULT_BRANDS;

  const handleBrandClick = (brand: BrandItem) => {
    if (onBrandSelect) {
      onBrandSelect(brand.name);
    } else {
      router.push(brand.href || "/shop");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6" suppressHydrationWarning>
      {/* ── Shop by Brands — Beautiful Grid ── */}
      <div className="bg-card border border-primary/20 rounded-[2rem] p-5 sm:p-7 lg:p-8 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 relative overflow-hidden" suppressHydrationWarning>
        {/* Decorative gold shimmer strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-border/5 relative">
          {/* Spacer for desktop to keep title perfectly centered */}
          <div className="hidden sm:block w-32" />

          {/* Centered Title */}
          <div className="text-center flex flex-col items-center flex-1">
            <span className="text-[11px] sm:text-xs font-bold tracking-[0.22em] text-primary uppercase mb-2">
              TRUSTED BRANDS
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-foreground tracking-tight">
              {heading || "Popular Vaping Brands"}
            </h2>
            {/* Premium Divider */}
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="h-[1px] w-10 bg-gradient-to-r from-transparent to-primary/65" />
              <div className="w-1.5 h-1.5 rotate-45 border border-primary/40 bg-primary/10" />
              <div className="h-[1px] w-10 bg-gradient-to-l from-transparent to-primary/65" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center sm:justify-end">
            <Link
              href={settings?.seeAllHref || "/shop"}
              className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-all hover:bg-foreground hover:text-background active:scale-95 cursor-pointer"
            >
              {settings?.seeAllLabel || "SEE ALL"}
            </Link>
          </div>
        </div>

        {/* Grid matching category style */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-3.5">
          {items.map((brand, idx) => {
            const cardContent = (
              <>
                {/* Image Container */}
                <div className="relative w-10 h-10 sm:w-16 sm:h-16 flex items-center justify-center bg-muted/20 border border-primary/15 group-hover:border-primary/40 rounded-xl p-1 sm:p-2 mb-2 transition-colors">
                  <SmartImage
                    src={(getHandleFromUrl(brand.href) ? collectionImages[getHandleFromUrl(brand.href)!] : undefined) || brand.image}
                    fallbackSrc=""
                    alt={brand.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-contain filter drop-shadow-xs transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                {/* Label */}
                <span className="text-[9px] sm:text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2">
                  {brand.name}
                </span>
              </>
            );

            const cardClassName = "group bg-card hover:bg-primary/[0.04] border-2 border-primary/20 hover:border-primary rounded-2xl p-2.5 sm:p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 active:scale-95 shadow-xs hover:shadow-md hover:shadow-primary/10";

            return onBrandSelect ? (
              <button
                key={`${brand.name}-${idx}`}
                onClick={() => onBrandSelect(brand.name)}
                className={cardClassName}
              >
                {cardContent}
              </button>
            ) : (
              <Link
                key={`${brand.name}-${idx}`}
                href={brand.href || "/shop"}
                className={cardClassName}
              >
                {cardContent}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Shop by Flavor — Interactive Rotating Wheel ──
          Hidden on JUUL 1 & 2 collection pages, and switchable from the
          theme customizer. */}
      {settings?.showFlavorWheel === true && !isJuul1Or2 && (
        <div className="bg-card border border-border/40 rounded-[2.5rem] p-2 sm:p-6 md:p-8 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10" />
          <FlavorsWheel 
            onFlavorSelect={onFlavorSelect} 
            eyebrow={settings.flavorWheelEyebrow}
            heading={settings.flavorWheelHeading}
            description={settings.flavorWheelDescription}
            buttonText={settings.flavorWheelButtonText}
            buttonHref={settings.flavorWheelButtonHref}
            flavors={settings.flavorItems}
          />
        </div>
      )}
    </div>
  );
};
