"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { SmartImage } from "@/components/ui/smart-image";

export interface CategoryItem {
  label: string;
  image: string;
  href: string;
}

export interface CategoriesSettings {
  eyebrow: string;
  heading: string;
  description?: string;
  seeAllLabel: string;
  seeAllHref: string;
  items: CategoryItem[];
}

export const Categories: React.FC<{ settings: CategoriesSettings }> = ({
  settings,
}) => {
  const router = useRouter();

  return (
    <div className="py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-border/5 relative">
        {/* Spacer for desktop to keep title perfectly centered */}
        <div className="hidden sm:block w-32" />

        {/* Centered Title */}
        <div className="text-center flex flex-col items-center flex-1">
          <span className="text-[11px] sm:text-xs font-bold tracking-[0.22em] text-primary uppercase mb-2">
            {settings.eyebrow}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-foreground tracking-tight leading-[0.95]">
            {settings.heading}
          </h2>
          {settings.description && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-xl text-center">
              {settings.description}
            </p>
          )}
          {/* Premium Divider */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="h-[1px] w-10 bg-gradient-to-r from-transparent to-primary/65" />
            <div className="w-1.5 h-1.5 rotate-45 border border-primary/40 bg-primary/10" />
            <div className="h-[1px] w-10 bg-gradient-to-l from-transparent to-primary/65" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center sm:justify-end gap-2.5 w-full sm:w-32">
          {settings.seeAllLabel && (
            <button
              onClick={() => router.push(settings.seeAllHref || "/shop")}
              className="text-[10px] sm:text-xs font-bold text-muted-foreground hover:text-primary border border-border px-3 py-1.5 rounded-md hover:border-primary/30 transition-all cursor-pointer uppercase tracking-wider"
            >
              {settings.seeAllLabel}
            </button>
          )}
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-3.5">
        {settings.items.map((section, idx) => (
          <div
            key={`${section.label}-${idx}`}
            onClick={() => router.push(section.href || "/shop")}
            className="group bg-card hover:bg-primary/[0.04] border-2 border-primary/20 hover:border-primary rounded-2xl p-2.5 sm:p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 active:scale-95 shadow-xs hover:shadow-md hover:shadow-primary/10"
          >
            {/* Image Container */}
            <div className="relative w-10 h-10 sm:w-16 sm:h-16 flex items-center justify-center bg-muted/20 border border-primary/15 group-hover:border-primary/40 rounded-xl p-1 sm:p-2 mb-2 transition-colors">
              <SmartImage
                src={section.image}
                fallbackSrc="/hero_vape.png"
                alt={section.label}
                width={64}
                height={64}
                sizes="(max-width: 640px) 40px, 64px"
                className="w-full h-full object-contain filter drop-shadow-xs transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            {/* Label */}
            <span className="text-[9px] sm:text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2">
              {section.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
