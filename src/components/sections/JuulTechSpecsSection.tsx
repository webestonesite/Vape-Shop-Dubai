"use client";

import React from "react";
import { ShieldCheck, Zap } from "lucide-react";

import { resolveIcon } from "@/lib/theme/icons";

import { ACCENT_TINTS } from "./accents";

interface JuulTechSpecsSectionProps {
  handle: string;
}

export interface JuulTechSpec {
  icon: string;
  accent: string;
  label: string;
  value: string;
}

export interface JuulTechSpecsSettings {
  badgeText: string;
  heading: string;
  description: string;
  certifiedNote: string;
  specs: JuulTechSpec[];
}

/**
 * JUUL 1 figures. The JUUL 2 collection template starts from its own set (see
 * `JUUL_2_TECH_SPECS`); these are the fallback for a placement with no saved
 * content at all, so the section is never empty.
 */
const FALLBACK_SPECS: JuulTechSpec[] = [
  { icon: "Battery", accent: "emerald", label: "BATTERY CAPACITY", value: "200 mAh (Classic)" },
  { icon: "Zap", accent: "amber", label: "CHARGING TYPE", value: "Magnetic USB Fast Dock" },
  { icon: "Droplet", accent: "blue", label: "POD CAPACITY", value: "0.7 mL per Pod" },
  { icon: "Cpu", accent: "purple", label: "CONNECTIVITY", value: "Draw-Activated (No Buttons)" },
  { icon: "Activity", accent: "rose", label: "DRAW TYPE", value: "MTL (Mouth to Lung)" },
  { icon: "Box", accent: "teal", label: "MATERIAL", value: "Premium Anodized Aluminum" },
];

export function JuulTechSpecsSection({
  handle,
  settings,
  techSpecsData,
}: JuulTechSpecsSectionProps & { settings?: JuulTechSpecsSettings; techSpecsData?: any }) {
  const isJuul2 = handle.toLowerCase().includes("juul-2");

  const dynamicSpecs: JuulTechSpec[] | null = techSpecsData
    ? ([
        techSpecsData.battery && { icon: "Battery", accent: "emerald", label: "BATTERY CAPACITY", value: techSpecsData.battery },
        techSpecsData.charging && { icon: "Zap", accent: "amber", label: "CHARGING SPEC", value: techSpecsData.charging },
        techSpecsData.capacity && { icon: "Droplet", accent: "blue", label: "POD / E-LIQUID CAPACITY", value: techSpecsData.capacity },
        techSpecsData.output && { icon: "Cpu", accent: "purple", label: "POWER OUTPUT", value: techSpecsData.output },
        techSpecsData.dimensions && { icon: "Box", accent: "teal", label: "DIMENSIONS & WEIGHT", value: techSpecsData.dimensions },
        techSpecsData.extra_notes && { icon: "Activity", accent: "rose", label: "TECHNICAL HIGHLIGHTS", value: techSpecsData.extra_notes },
      ].filter(Boolean) as JuulTechSpec[])
    : null;

  const specs =
    dynamicSpecs && dynamicSpecs.length > 0
      ? dynamicSpecs
      : settings?.specs && settings.specs.length > 0
      ? settings.specs
      : FALLBACK_SPECS;

  // The wording still falls back to the JUUL 1 / JUUL 2 split for placements
  // saved before this section had editable copy.
  const heading =
    settings?.heading || (isJuul2 ? "Next-Gen Smart Tech" : "Engineered for Excellence");
  const description =
    settings?.description ||
    (isJuul2
      ? "JUUL 2 Pod System features anti-counterfeit pod technology, smart battery indicators, and 1.2mL pre-filled nicotine salt pods."
      : "JUUL 1 Magnetic USB Charging Dock & Original USA Made JUUL Pods certified authentic in Dubai & UAE.");

  return (
    <div className="w-full">
      <div className="bg-card border border-border/60 rounded-[2.5rem] p-6 sm:p-10 lg:p-14 relative overflow-hidden shadow-md transition-all duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading & Description */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full">
              <Zap className="w-4 h-4 text-primary" />
              <span>{settings?.badgeText || "Technical Specifications"}</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-serif font-black text-foreground tracking-tight leading-tight">
              {heading}
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
              {description}
            </p>

            {(settings?.certifiedNote ?? "Official JUUL UAE Certified Hardware") && (
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {settings?.certifiedNote ?? "Official JUUL UAE Certified Hardware"}
                </span>
              </div>
            )}
          </div>

          {/* Right Column: spec cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {specs.map((spec, idx) => {
              const Icon = resolveIcon(spec.icon);

              return (
                <div
                  key={idx}
                  className="bg-background border border-border/80 hover:border-primary/50 rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:shadow-md group"
                >
                  <div
                    className={`w-12 h-12 rounded-xl border p-2.5 flex items-center justify-center shrink-0 ${
                      ACCENT_TINTS[spec.accent] ?? ACCENT_TINTS.emerald
                    } group-hover:scale-110 transition-transform duration-300 shadow-sm`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div>
                    <div className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider mb-0.5">
                      {spec.label}
                    </div>
                    <div className="text-sm sm:text-base font-serif font-black text-foreground group-hover:text-primary transition-colors">
                      {spec.value}
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
