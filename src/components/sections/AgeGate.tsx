"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export const AgeGate: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem("vapedubai_age_verified");
    const isBot =
      /bot|googlebot|crawler|spider|robot|crawling|lighthouse|pagespeed|moto g power|headlesschrome/i.test(
        navigator.userAgent
      ) || navigator.webdriver;
    if (!verified && !isBot) {
      setShowModal(true);
    }
  }, []);

  const handleVerify = () => {
    localStorage.setItem("vapedubai_age_verified", "true");
    setShowModal(false);
  };

  const handleDeny = () => {
    // Redirect underage users to google
    window.location.href = "https://www.google.com";
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-[440px]">
        {/* Ambient subtle glow backlight */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/25 via-orange-500/20 to-amber-500/15 rounded-[2.5rem] blur-xl opacity-80 -z-10" />

        {/* Modal Card */}
        <div className="w-full bg-white dark:bg-zinc-950 border border-slate-200/90 dark:border-zinc-800/90 p-6 sm:p-8 rounded-[2.25rem] shadow-2xl space-y-4.5 text-left">
          
          {/* Header: Logo on left, Shield badge on right */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center">
              <Image
                src="/Vape%20Shop%20Dubai%20logo%201.png"
                alt="Vape Shop Dubai"
                width={170}
                height={34}
                priority
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </div>

            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/15 via-orange-500/15 to-amber-500/10 border border-primary/30 flex items-center justify-center text-primary shadow-xs">
              <ShieldCheck className="h-5 w-5 stroke-[2.2]" />
            </div>
          </div>

          {/* Subtitle Tagline */}
          <p className="text-[11px] font-bold tracking-[0.18em] text-slate-500 dark:text-slate-400 uppercase">
            AGE VERIFICATION · CHALLENGE 18
          </p>

          {/* Main Headline */}
          <h2 className="text-[26px] sm:text-[30px] font-black text-slate-900 dark:text-white tracking-tight leading-tight font-sans">
            Are you{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E8521A] via-orange-500 to-[#F97316] font-black">
              18 or over
            </span>
            ?
          </h2>

          {/* Description Body - High Contrast & Crisp */}
          <p className="text-[13.5px] sm:text-sm font-medium text-slate-700 dark:text-slate-200 leading-[1.65]">
            This site sells nicotine-containing products and is strictly for adults. By entering you confirm you are at least 18 years old. Age is verified again on every order and at delivery.
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleVerify}
              className="w-full bg-gradient-to-r from-[#E8521A] via-orange-500 to-[#F97316] hover:brightness-105 active:scale-[0.98] text-white font-bold py-3.5 px-5 rounded-full text-sm tracking-wide shadow-[0_6px_20px_rgba(232,82,26,0.32)] hover:shadow-[0_8px_25px_rgba(232,82,26,0.42)] transition-all cursor-pointer flex items-center justify-center text-center"
            >
              Yes, I&apos;m 18+
            </button>
            <button
              onClick={handleDeny}
              className="w-full bg-slate-100 hover:bg-slate-200/90 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-300/90 dark:border-zinc-700/80 text-slate-800 dark:text-slate-200 font-bold py-3.5 px-5 rounded-full text-sm tracking-wide transition-all cursor-pointer flex items-center justify-center text-center"
            >
              No, I&apos;m under 18
            </button>
          </div>

          {/* Warning Inset Box - High Contrast Notice */}
          <div className="rounded-2xl border border-slate-300/80 dark:border-zinc-800 bg-slate-100/90 dark:bg-zinc-900/90 p-3.5 sm:p-4 text-left shadow-2xs mt-3">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
              This website contains nicotine products. Nicotine is a highly addictive substance.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
