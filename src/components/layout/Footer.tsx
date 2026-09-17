"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowUp,
  Star,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";

import { ThemeIcon } from "@/components/ui/theme-icon";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import {
  VisaIcon,
  MastercardIcon,
  ApplePayIcon,
  GooglePayIcon,
  CodPaymentIcon,
  UaeFlagIcon,
} from "@/components/ui/payment-icons";
import { useFooterSettings } from "@/context/ThemeSettingsContext";

export const Footer: React.FC = () => {
  const settings = useFooterSettings();

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative mt-2 sm:mt-3 lg:mt-4 bg-card text-foreground font-sans border-t border-border/50" suppressHydrationWarning>
      {/* ── 1. Top Trust Features (Seamless Luxury Glassmorphic Banner) ──── */}
      <div className="py-6 sm:py-8 bg-muted/20 border-b border-border/50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-r from-card via-card/95 to-card border border-emerald-500/25 shadow-xl shadow-emerald-500/5 p-5 sm:p-7 lg:p-8">
            {/* Top Green Accent Glow Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/10 via-[#009966] to-emerald-500/10" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 divide-y sm:divide-y-0 lg:divide-x divide-border/60">
              {settings.trustItems.map((item, idx) => {
                const microBadges = [
                  "⚡ EXPRESS 2-HR",
                  "🛡️ 100% GENUINE",
                  "💳 COD & CARD",
                  "⏱️ 24/7 DISPATCH",
                ];
                const tag = microBadges[idx % microBadges.length];

                return (
                  <div
                    key={idx}
                    className="group relative flex items-center gap-4 lg:px-6 py-4 sm:py-2 first:pl-0 last:pr-0 transition-all duration-300"
                  >
                    {/* 3D Glowing Emerald Icon Container */}
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#009966] via-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/30 border border-emerald-400/40 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-emerald-500/50">
                      <ThemeIcon name={item.icon} className="h-6 w-6 sm:h-7 sm:w-7" />
                    </div>

                    {/* Content Details */}
                    <div className="min-w-0 flex-1">
                      <div className="inline-flex items-center gap-1 text-[9px] font-black tracking-widest text-[#009966] dark:text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 mb-1">
                        <span>{tag}</span>
                      </div>
                      <h4 className="text-sm sm:text-base font-black text-foreground tracking-tight leading-snug group-hover:text-[#009966] dark:group-hover:text-emerald-400 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs font-semibold text-muted-foreground mt-0.5 leading-snug">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Main Footer Directory (Organized & Balanced) ──── */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* Column 1: Brand Info & Support Box (4 cols) */}
          <div className="lg:col-span-4 bg-muted/20 border border-border/50 rounded-3xl p-6 space-y-5 shadow-xs">
            <Link href="/" className="inline-block transition-transform hover:scale-105">
              <Image
                src="/Vape%20Shop%20Dubai%20logo%201.png"
                alt="Vape Shop Dubai"
                width={220}
                height={40}
                className="h-10 w-auto cursor-pointer"
              />
            </Link>

            <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground font-semibold">
              {settings.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-border/40">
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <WhatsAppIcon className="h-4 w-4 fill-current" />
                <span>{settings.whatsappLabel}</span>
              </a>

              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-foreground">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-extrabold text-foreground">{settings.ratingText}</span>
              </div>
            </div>
          </div>

          {/* Link Columns (Merchant-defined) — Crisp Alignment */}
          {settings.columns.map((column, idx) => (
            <div
              key={idx}
              className={idx === 0 ? "lg:col-span-2 sm:col-span-1 space-y-4" : "lg:col-span-2 sm:col-span-1 space-y-4"}
            >
              <div className="pb-2 border-b-2 border-primary/30">
                <h4 className="text-xs sm:text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block shrink-0 shadow-xs" />
                  {column.heading}
                </h4>
              </div>

              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={`${link.label}-${link.href}`}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-1 text-xs sm:text-sm font-extrabold text-foreground/80 hover:text-primary transition-all duration-200"
                    >
                      <ChevronRight className="h-3.5 w-3.5 text-primary opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 shrink-0" />
                      <span className="group-hover:translate-x-1 transition-transform duration-200">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Column 4: Contact & Dubai Hub (4 cols) — Clean Unified Box */}
          <div className="lg:col-span-4 bg-card border border-border/60 rounded-3xl p-5 lg:p-6 space-y-4 shadow-xs">
            <div className="pb-2 border-b-2 border-primary/30">
              <h4 className="text-xs sm:text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary inline-block shrink-0 shadow-xs" />
                {settings.contactHeading}
              </h4>
            </div>

            <div className="space-y-3 text-xs sm:text-sm font-bold">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-muted/40 border border-border/40">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-muted-foreground leading-snug">
                  <strong className="text-foreground block font-black text-xs uppercase tracking-wide mb-0.5">
                    {settings.addressLabel}
                  </strong>
                  <span className="text-xs font-semibold">{settings.address}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-muted/40 border border-border/40 text-foreground hover:text-primary hover:border-primary/40 transition-colors truncate"
                >
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-black text-xs tracking-wider truncate">{settings.phone}</span>
                </a>

                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-muted/40 border border-border/40 text-foreground hover:text-primary hover:border-primary/40 transition-colors truncate"
                >
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-bold text-xs truncate">{settings.email}</span>
                </a>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                <Clock className="h-5 w-5 text-emerald-500 shrink-0" />
                <span className="text-xs font-extrabold uppercase tracking-wide">
                  {settings.hoursNote}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Regulatory & Payment Badges (Dual Balanced Cards) ── */}
        <div className="mt-12 pt-8 border-t border-border/60 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Health Warning Banner */}
          <div className="lg:col-span-6 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 text-amber-900 dark:text-amber-200 shadow-xs">
            <ShieldAlert className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-xs sm:text-sm font-extrabold leading-relaxed">{settings.healthWarning}</p>
          </div>

          {/* Real Payment Method & License Logos */}
          <div className="lg:col-span-6 bg-card border border-border/60 rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider px-1">
                Accepted:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <VisaIcon className="h-6 w-auto shadow-2xs hover:scale-105 transition-transform" />
                <MastercardIcon className="h-6 w-auto shadow-2xs hover:scale-105 transition-transform" />
                <ApplePayIcon className="h-6 w-auto shadow-2xs hover:scale-105 transition-transform" />
                <GooglePayIcon className="h-6 w-auto shadow-2xs hover:scale-105 transition-transform" />
                <CodPaymentIcon />
              </div>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black shrink-0">
              <UaeFlagIcon />
              <span>100% Licensed UAE Store</span>
            </div>
          </div>
        </div>

        {/* ── 4. Bottom Copyright & Back to Top ───────────── */}
        <div className="mt-8 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-muted-foreground text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <p suppressHydrationWarning className="font-extrabold text-foreground">{settings.copyright}</p>
            <span className="hidden sm:inline text-border">·</span>
            <p className="text-xs">
              Powered by{" "}
              <a
                href={settings.poweredByHref}
                target="_blank"
                rel="noopener noreferrer"
                className="font-black text-primary hover:underline underline-offset-4"
              >
                {settings.poweredByLabel}
              </a>
            </p>
          </div>

          <div className="flex items-center gap-6 font-extrabold">
            {settings.bottomLinks.map((link) => (
              <Link
                key={`${link.label}-${link.href}`}
                href={link.href}
                className="text-foreground/80 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 font-black cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all duration-300"
              aria-label="Back to top"
            >
              Top <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
