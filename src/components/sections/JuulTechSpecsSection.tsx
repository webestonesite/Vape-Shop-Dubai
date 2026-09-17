"use client";

import React from "react";
import { Zap, Battery, Droplet, Cpu, Activity, Box, ShieldCheck, CheckCircle2 } from "lucide-react";

interface JuulTechSpecsSectionProps {
  handle: string;
}

export interface SectionHeadingSettings {
  badgeText: string;
  heading: string;
  description: string;
}

export function JuulTechSpecsSection({
  handle,
  settings,
  techSpecsData,
}: JuulTechSpecsSectionProps & { settings?: SectionHeadingSettings; techSpecsData?: any }) {
  const isJuul2 = handle.toLowerCase().includes("juul-2");

  const dynamicSpecs = techSpecsData
    ? [
        techSpecsData.battery && {
          icon: Battery,
          label: "BATTERY CAPACITY",
          value: techSpecsData.battery,
          iconBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        },
        techSpecsData.charging && {
          icon: Zap,
          label: "CHARGING SPEC",
          value: techSpecsData.charging,
          iconBg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        },
        techSpecsData.capacity && {
          icon: Droplet,
          label: "POD / E-LIQUID CAPACITY",
          value: techSpecsData.capacity,
          iconBg: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        },
        techSpecsData.output && {
          icon: Cpu,
          label: "POWER OUTPUT",
          value: techSpecsData.output,
          iconBg: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        },
        techSpecsData.dimensions && {
          icon: Box,
          label: "DIMENSIONS & WEIGHT",
          value: techSpecsData.dimensions,
          iconBg: "bg-teal-500/10 text-teal-500 border-teal-500/20",
        },
        techSpecsData.extra_notes && {
          icon: Activity,
          label: "TECHNICAL HIGHLIGHTS",
          value: techSpecsData.extra_notes,
          iconBg: "bg-rose-500/10 text-rose-500 border-rose-500/20",
        },
      ].filter(Boolean)
    : null;

  const specs = dynamicSpecs && dynamicSpecs.length > 0
    ? dynamicSpecs
    : isJuul2
    ? [
        {
          icon: Battery,
          label: "BATTERY CAPACITY",
          value: "250 mAh (Rechargeable)",
          iconBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        },
        {
          icon: Zap,
          label: "CHARGING TYPE",
          value: "JUUL 2 Magnetic USB Dock",
          iconBg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        },
        {
          icon: Droplet,
          label: "POD CAPACITY",
          value: "1.2 mL (+70% E-Liquid)",
          iconBg: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        },
        {
          icon: Cpu,
          label: "SMART FEATURES",
          value: "LED Battery & Pod Level Indicator",
          iconBg: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        },
        {
          icon: Activity,
          label: "NICOTINE STRENGTH",
          value: "18 mg/ml (1.8% Salt Nic)",
          iconBg: "bg-rose-500/10 text-rose-500 border-rose-500/20",
        },
        {
          icon: Box,
          label: "MATERIAL & FINISH",
          value: "Slate Anodized Metal Body",
          iconBg: "bg-teal-500/10 text-teal-500 border-teal-500/20",
        },
      ]
    : [
        {
          icon: Battery,
          label: "BATTERY CAPACITY",
          value: "200 mAh (Classic)",
          iconBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        },
        {
          icon: Zap,
          label: "CHARGING TYPE",
          value: "Magnetic USB Fast Dock",
          iconBg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        },
        {
          icon: Droplet,
          label: "POD CAPACITY",
          value: "0.7 mL per Pod",
          iconBg: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        },
        {
          icon: Cpu,
          label: "CONNECTIVITY",
          value: "Draw-Activated (No Buttons)",
          iconBg: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        },
        {
          icon: Activity,
          label: "DRAW TYPE",
          value: "MTL (Mouth to Lung)",
          iconBg: "bg-rose-500/10 text-rose-500 border-rose-500/20",
        },
        {
          icon: Box,
          label: "MATERIAL",
          value: "Premium Anodized Aluminum",
          iconBg: "bg-teal-500/10 text-teal-500 border-teal-500/20",
        },
      ];

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
              {settings?.heading ||
                (isJuul2 ? "Next-Gen Smart Tech" : "Engineered for Excellence")}
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
              {isJuul2
                ? "JUUL 2 Pod System features anti-counterfeit pod technology, smart battery indicators, and 1.2mL pre-filled nicotine salt pods."
                : "JUUL 1 Magnetic USB Charging Dock & Original USA Made JUUL Pods certified authentic in Dubai & UAE."}
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Official JUUL UAE Certified Hardware</span>
            </div>
          </div>

          {/* Right Column: 6 Grid Spec Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {specs.map((spec, idx) => {
              const Icon = spec.icon;

              return (
                <div
                  key={idx}
                  className="bg-background border border-border/80 hover:border-primary/50 rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:shadow-md group"
                >
                  <div
                    className={`w-12 h-12 rounded-xl border p-2.5 flex items-center justify-center shrink-0 ${spec.iconBg} group-hover:scale-110 transition-transform duration-300 shadow-sm`}
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
