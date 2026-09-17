"use client";

import React from "react";
import { ExternalLink, ShieldCheck, CheckCircle2 } from "lucide-react";

export interface SectionHeadingSettings {
  badgeText: string;
  heading: string;
  description: string;
}

export function MyleVerificationSection({
  settings,
  authenticityData,
}: { settings?: SectionHeadingSettings; authenticityData?: any } = {}) {
  const badgeText = authenticityData?.badge || settings?.badgeText || "Official UAE Verification";
  const headingText = authenticityData?.heading || settings?.heading || "ANTI-COUNTERFEIT SYSTEM";
  return (
    <div className="w-full">
      <div className="bg-card border border-border/60 rounded-[2.5rem] p-6 sm:p-10 lg:p-14 relative overflow-hidden shadow-md transition-all duration-300">
        {/* Glow Ambient Top Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10" />

        {/* Section Header (Exact Reference Match) */}
        <div className="text-center mb-10 sm:mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>{badgeText}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black tracking-[0.2em] uppercase text-foreground">
            {headingText}
          </h2>
        </div>

        {/* 3 White Vertical Cards Grid (Exact Reference Match) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">

          {/* CARD 1: FIND QR CODE */}
          <div className="bg-card border border-border/80 hover:border-primary/50 rounded-3xl p-7 sm:p-8 flex flex-col items-center text-center justify-between transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1.5 group">
            {/* Vector Illustration 1: Hand Peeling MYLE Box Tab */}
            <div className="w-full h-48 sm:h-52 flex items-center justify-center my-2 p-3 bg-muted/20 rounded-2xl border border-border/40 group-hover:scale-105 transition-transform duration-300">
              <svg viewBox="0 0 200 220" className="w-full h-full max-h-44 stroke-foreground fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {/* MYLE Box Outline */}
                <rect x="75" y="45" width="50" height="130" rx="4" className="stroke-foreground fill-card" />
                {/* Box Details & MYLE Text */}
                <line x1="75" y1="65" x2="125" y2="65" />
                <text x="100" y="105" textAnchor="middle" className="fill-foreground font-sans font-black text-[11px] tracking-widest stroke-none">MYLÉ</text>
                <text x="100" y="122" textAnchor="middle" className="fill-muted-foreground font-sans font-bold text-[8px] tracking-widest stroke-none">META V5</text>

                {/* Security Tab & Peeling Hand */}
                <path d="M125 75 L145 70 L145 95 L125 90 Z" className="fill-amber-500/20 stroke-amber-500" strokeDasharray="3 3" />
                {/* Hand Peeling Finger Icon */}
                <path d="M145 82 C 160 78, 175 80, 180 95 C 175 110, 155 105, 140 92" className="stroke-primary" strokeWidth="3" />
                <circle cx="110" cy="82" r="6" className="fill-primary stroke-none animate-ping" />
              </svg>
            </div>

            <div className="space-y-2 mt-4">
              <h3 className="text-xl font-serif font-black text-foreground group-hover:text-primary transition-colors uppercase tracking-wider">
                FIND QR CODE
              </h3>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Find the security code on your package by peeling off the tab on the side of the package to reveal the QR code.
              </p>
            </div>
          </div>

          {/* CARD 2: SCAN CODE */}
          <div className="bg-card border border-border/80 hover:border-primary/50 rounded-3xl p-7 sm:p-8 flex flex-col items-center text-center justify-between transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1.5 group">
            {/* Vector Illustration 2: Desktop iMac Monitor Screen */}
            <div className="w-full h-48 sm:h-52 flex items-center justify-center my-2 p-3 bg-muted/20 rounded-2xl border border-border/40 group-hover:scale-105 transition-transform duration-300">
              <svg viewBox="0 0 200 180" className="w-full h-full max-h-44 stroke-foreground fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {/* Desktop Monitor Screen Frame */}
                <rect x="25" y="20" width="150" height="105" rx="8" className="stroke-foreground fill-slate-900" />
                {/* Monitor Stand Base */}
                <path d="M85 125 L75 155 L125 155 L115 125 Z" className="fill-slate-800 stroke-foreground" />
                <line x1="65" y1="155" x2="135" y2="155" strokeWidth="3" />
                <circle cx="100" cy="117" r="3" className="fill-slate-500 stroke-none" />

                {/* Screen Content: ANTI-COUNTERFEIT SYSTEM */}
                <text x="100" y="60" textAnchor="middle" className="fill-white font-serif font-black text-[9px] tracking-widest stroke-none uppercase">
                  ANTI-COUNTERFEIT
                </text>
                <text x="100" y="75" textAnchor="middle" className="fill-primary font-sans font-bold text-[8px] tracking-widest stroke-none uppercase">
                  SYSTEM
                </text>
                {/* Input box graphic */}
                <rect x="55" y="85" width="90" height="16" rx="4" className="stroke-primary fill-slate-800" strokeWidth="1.5" />
                <text x="100" y="96" textAnchor="middle" className="fill-slate-300 font-mono text-[7px] stroke-none">
                  ac.mylevape.com
                </text>
              </svg>
            </div>

            <div className="space-y-2 mt-4">
              <h3 className="text-xl font-serif font-black text-foreground group-hover:text-primary transition-colors uppercase tracking-wider">
                SCAN CODE
              </h3>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Go online to <span className="font-bold text-foreground">ac.mylevape.com</span> or scan the QR code in your phone with a QR code scanner and enter the 16 digit authenticity number in the fields provided. Please submit.
              </p>
            </div>
          </div>

          {/* CARD 3: RECEIVE REWARD POINTS */}
          <div className="bg-card border border-border/80 hover:border-primary/50 rounded-3xl p-7 sm:p-8 flex flex-col items-center text-center justify-between transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1.5 group">
            {/* Vector Illustration 3: Circular MYLE REWARDS Medal Badge */}
            <div className="w-full h-48 sm:h-52 flex items-center justify-center my-2 p-3 bg-muted/20 rounded-2xl border border-border/40 group-hover:scale-105 transition-transform duration-300">
              <svg viewBox="0 0 180 180" className="w-full h-full max-h-44 stroke-foreground fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {/* Outer Serrated Medal Circle */}
                <circle cx="90" cy="90" r="70" className="stroke-foreground fill-slate-900" strokeWidth="3" />
                <circle cx="90" cy="90" r="62" className="stroke-amber-500/60" strokeDasharray="6 4" strokeWidth="2" />
                <circle cx="90" cy="90" r="52" className="stroke-slate-700 fill-slate-800" strokeWidth="2" />

                {/* Center Badge Content: MYLE REWARDS */}
                <text x="90" y="80" textAnchor="middle" className="fill-white font-serif font-black text-[12px] tracking-widest stroke-none">
                  MYLÉ
                </text>
                <text x="90" y="96" textAnchor="middle" className="fill-amber-400 font-sans font-bold text-[9px] tracking-widest stroke-none">
                  REWARDS
                </text>

                {/* Cloud & Stars graphic inside seal */}
                <path d="M78 112 C78 108, 83 105, 88 107 C91 104, 98 104, 101 107 C105 107, 107 110, 105 114 Z" className="fill-white/80 stroke-none" />
              </svg>
            </div>

            <div className="space-y-2 mt-4">
              <h3 className="text-xl font-serif font-black text-foreground group-hover:text-primary transition-colors uppercase tracking-wider">
                RECEIVE REWARD POINTS
              </h3>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                For each product you authenticate, you will receive 5 Myle rewards point(s). After you scan your products QR code, your rewards point(s) will be automatically added to your rewards account.
              </p>
            </div>
          </div>

        </div>

        {/* Direct Authentication Action Button Link */}
        <div className="mt-10 pt-6 border-t border-border/40 text-center">
          <a
            href="https://ac.mylevape.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-primary text-white hover:bg-gold-shimmer py-3.5 px-8 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md hover:scale-105 cursor-pointer"
          >
            <span>Authenticate MYLE Product at ac.mylevape.com</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
