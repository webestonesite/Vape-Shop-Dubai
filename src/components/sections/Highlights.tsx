"use client";

import React from "react";
import { Truck, ShieldCheck, CreditCard, RefreshCw } from "lucide-react";

const POINTS = [
  {
    icon: Truck,
    title: "3-Hour Express Delivery",
    description: "Dubai, Sharjah & Ajman express",
    badge: "⚡ EXPRESS 3-HR",
  },
  {
    icon: ShieldCheck,
    title: "100% Authentic UAE",
    description: "Scratch-code verified products",
    badge: "🛡️ 100% GENUINE",
  },
  {
    icon: CreditCard,
    title: "Cash, Card & Online Link Payment on Delivery",
    description: "Pay at your doorstep easily with cash, card or link",
    badge: "💳 COD, CARD & LINK",
  },
  {
    icon: RefreshCw,
    title: "24/7 Instant Dispatch",
    description: "365 days non-stop service",
    badge: "⏱️ 24/7 DISPATCH",
  },
];

export const Highlights: React.FC = () => {
  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-r from-card via-card/95 to-card border border-emerald-500/25 shadow-xl shadow-emerald-500/5 p-5 sm:p-7 lg:p-8">
        {/* Top Green Accent Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/10 via-[#009966] to-emerald-500/10" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 divide-y sm:divide-y-0 lg:divide-x divide-border/60">
          {POINTS.map((point, i) => {
            const Icon = point.icon;
            return (
              <div
                key={i}
                className="group relative flex items-center gap-4 lg:px-6 py-4 sm:py-2 first:pl-0 last:pr-0 transition-all duration-300"
              >
                {/* 3D Glowing Emerald Icon Container */}
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#009966] via-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/30 border border-emerald-400/40 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-emerald-500/50">
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>

                {/* Content Details */}
                <div className="min-w-0 flex-1">
                  <div className="inline-flex items-center gap-1 text-[9px] font-black tracking-widest text-[#009966] dark:text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 mb-1">
                    <span>{point.badge}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-foreground tracking-tight leading-snug group-hover:text-[#009966] dark:group-hover:text-emerald-400 transition-colors">
                    {point.title}
                  </h3>
                  <p className="text-xs font-semibold text-muted-foreground mt-0.5 leading-snug">
                    {point.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
