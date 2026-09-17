"use client";

import React, { useState } from "react";
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Layers, ShieldCheck, Award } from "lucide-react";

export interface PackagingPoint {
  label: string;
  text: string;
}

export interface JuulPackagingCompareSettings {
  heading: string;
  description: string;

  oldTabLabel: string;
  oldTitle: string;
  oldBadge: string;
  oldImage: string;
  oldPoints: PackagingPoint[];

  newTabLabel: string;
  newTitle: string;
  newBadge: string;
  newImage: string;
  newPoints: PackagingPoint[];
}

const FALLBACK_OLD_POINTS: PackagingPoint[] = [
  {
    label: "Cardboard Sleeve:",
    text: "Plain white matte paper box. Wears, tears, and fades with light handling.",
  },
  {
    label: "Branding & Font:",
    text: "Basic minimalist type. No clear generation label. The box does not always say \u201cJUUL 1\u201d outright.",
  },
  {
    label: "Security Tracking:",
    text: "No 3D holographic sticker on the top flap. High risk of convincing clones.",
  },
  {
    label: "Batch Codes:",
    text: "Printed lightly and often smudged. Hard to read and easy to fake.",
  },
];

const FALLBACK_NEW_POINTS: PackagingPoint[] = [
  {
    label: "Cardboard Sleeve:",
    text: "Premium glossy reinforced foil-laminated box. Scratch-resistant surface.",
  },
  {
    label: "Branding & Font:",
    text: "Bold embossed JUUL logo with explicit generation badges and nicotine concentration callouts.",
  },
  {
    label: "Security Tracking:",
    text: "High-security 3D holographic authentication sticker with QR code scan verification.",
  },
  {
    label: "Batch Codes:",
    text: "Laser-etched high-density QR code and crisp batch numbers on top & bottom flaps.",
  },
];

export function JuulPackagingCompareSection({
  settings,
}: { settings?: JuulPackagingCompareSettings } = {}) {
  const [activeTab, setActiveTab] = useState<"old" | "new">("old");

  const isNew = activeTab === "new";

  // Everything that differs between the two tabs, picked once.
  const side = isNew
    ? {
        tabLabel: settings?.newTabLabel || "NEW PACKAGING",
        title: settings?.newTitle || "New Packaging Specifications",
        badge: settings?.newBadge || "NEW DESIGN",
        image: settings?.newImage || "/juul_device.png",
        points:
          settings?.newPoints && settings.newPoints.length > 0
            ? settings.newPoints
            : FALLBACK_NEW_POINTS,
      }
    : {
        tabLabel: settings?.oldTabLabel || "OLD PACKAGING",
        title: settings?.oldTitle || "Old Packaging Specifications",
        badge: settings?.oldBadge || "OLD DESIGN",
        image: settings?.oldImage || "/juul_device.png",
        points:
          settings?.oldPoints && settings.oldPoints.length > 0
            ? settings.oldPoints
            : FALLBACK_OLD_POINTS,
      };

  return (
    <div className="w-full">
      <div className="bg-card border border-border/60 rounded-[2.5rem] p-6 sm:p-10 lg:p-12 shadow-md relative overflow-hidden transition-all duration-300">
        {/* Dynamic Top Ambient Bar (Primary Brand Color for Old, Green for New) */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 transition-colors duration-500 ${
            isNew ? "bg-emerald-500" : "bg-primary"
          }`}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
          
          {/* Left Column: Header, Tabs & Specifications */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl border flex items-center justify-center shadow-xs transition-colors duration-300 ${
                    isNew ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-primary/10 border-primary/20 text-primary"
                  }`}
                >
                  <Layers className="w-5 h-5" />
                </div>
                <h2 className="text-2xl sm:text-4xl font-serif font-black tracking-tight text-foreground">
                  {settings?.heading || "JUUL 1 Packaging: Old vs New"}
                </h2>
              </div>

              <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed max-w-2xl">
                {settings?.description ||
                  "To make fake JUUL products harder to sell in the UAE, JUUL redesigned the box. Here is what changed and what to look for before you buy."}
              </p>
            </div>

            {/* Toggle Pills (Site Primary for Old, Green for New) */}
            <div className="flex items-center gap-3 bg-muted/30 p-1.5 rounded-2xl w-fit border border-border/50">
              <button
                onClick={() => setActiveTab("old")}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeTab === "old"
                    ? "bg-primary text-white shadow-md scale-105"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {settings?.oldTabLabel || "OLD PACKAGING"}
              </button>
              <button
                onClick={() => setActiveTab("new")}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeTab === "new"
                    ? "bg-emerald-600 text-white shadow-md scale-105"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {settings?.newTabLabel || "NEW PACKAGING"}
              </button>
            </div>

            {/* Dynamic Specifications Card (Site Primary for Old, Green for New) */}
            <div
              className={`rounded-3xl p-6 sm:p-8 border transition-all duration-500 space-y-4 shadow-sm ${
                isNew
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                  : "bg-primary/10 border-primary/30 text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5 font-serif font-black text-lg sm:text-xl">
                {isNew ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 animate-bounce" />
                    <span className="text-emerald-600 dark:text-emerald-400">{side.title}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-primary">{side.title}</span>
                  </>
                )}
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed">
                {side.points.map((point, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        isNew ? "bg-emerald-500" : "bg-primary"
                      }`}
                    />
                    <div>
                      {point.label && (
                        <strong className="font-bold text-foreground">{point.label}</strong>
                      )}{" "}
                      {point.text}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Right Column: Visual Box Display Frame (Site Primary for Old, Green for New) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div
              className={`w-full max-w-md bg-background border-2 rounded-[2.5rem] p-6 sm:p-8 relative shadow-xl transition-all duration-500 flex flex-col items-center justify-center ${
                isNew ? "border-emerald-500/50 shadow-emerald-500/10" : "border-primary/40 shadow-primary/10"
              }`}
            >
              {/* Carousel Left / Right Arrows */}
              <button
                onClick={() => setActiveTab(isNew ? "old" : "new")}
                className={`absolute left-3 sm:-left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full text-white flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer hover:scale-110 z-20 ${
                  isNew ? "bg-emerald-600 hover:bg-emerald-700" : "bg-primary hover:bg-gold-shimmer"
                }`}
                aria-label="Previous design"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => setActiveTab(isNew ? "old" : "new")}
                className={`absolute right-3 sm:-right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full text-white flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer hover:scale-110 z-20 ${
                  isNew ? "bg-emerald-600 hover:bg-emerald-700" : "bg-primary hover:bg-gold-shimmer"
                }`}
                aria-label="Next design"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* JUUL Pod Packaging Product Visual */}
              <div className="relative w-48 sm:w-56 h-64 sm:h-72 my-4 flex flex-col items-center justify-center p-4 bg-muted/20 rounded-2xl border border-border/40 group">
                <img
                  src={side.image}
                  alt={side.badge}
                  className="w-full h-full object-contain filter drop-shadow-xl transition-all duration-500 transform group-hover:scale-105"
                />
                
                {/* Reflection effect graphic */}
                <div className="w-36 h-4 bg-black/10 blur-md rounded-full mt-2" />
              </div>

              {/* Bottom Design Badge */}
              <div className="mt-2 text-center">
                <span
                  className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full text-white shadow-sm inline-block transition-all duration-300 ${
                    isNew ? "bg-emerald-600" : "bg-primary"
                  }`}
                >
                  {side.badge}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
