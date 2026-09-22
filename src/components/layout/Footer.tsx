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
  const [pages, setPages] = React.useState<any[]>([]);
  const footerRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (!footerRef.current) return;
    let fetched = false;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !fetched) {
          fetched = true;
          observer.disconnect();
          fetch("/api/pages")
            .then((res) => (res.ok ? res.json() : { pages: [] }))
            .then((data) => setPages(data.pages || []))
            .catch(() => {});
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer ref={footerRef} className="relative mt-2 sm:mt-3 lg:mt-4 bg-card text-foreground font-sans border-t border-border/50" suppressHydrationWarning>
      {/* ── Top Trust Features removed per user request ──── */}

      {/* ── 2. Main Footer Directory (Organized & Balanced) ──── */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 items-start relative z-10">

          {/* Column 1: Brand Info & Support Box (3 cols) */}
          <div className="lg:col-span-3 space-y-5">
            <Link href="/" className="inline-block group relative">
              <Image
                src="/Vape Shop Dubai logo 1.png"
                alt="Vape Shop Dubai"
                width={200}
                height={50}
                className="h-9 w-auto relative z-10 drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300"
              />
              <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Link>

            <p className="text-muted-foreground text-xs font-semibold leading-relaxed max-w-xs">
              {settings.description}
            </p>

            <div className="flex flex-col gap-3 pt-2">
              <a
                href={`https://wa.me/${settings.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 cursor-pointer w-fit"
              >
                <WhatsAppIcon className="h-4 w-4 fill-current" />
                <span>{settings.whatsappLabel}</span>
              </a>

              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-foreground w-fit">
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
              className="lg:col-span-2 sm:col-span-1 space-y-4"
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

          {/* Useful Links Column (Hardcoded) */}
          <div className="lg:col-span-2 sm:col-span-1 space-y-4">
            <div className="pb-2 border-b-2 border-primary/30">
              <h4 className="text-xs sm:text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary inline-block shrink-0 shadow-xs" />
                Useful Links
              </h4>
            </div>

            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/shop"
                  className="group flex items-center gap-1 text-xs sm:text-sm font-extrabold text-foreground/80 hover:text-primary transition-all duration-200"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-primary opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 shrink-0" />
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    Shop
                  </span>
                </Link>
              </li>
              
              {[
                { title: "About Us", handle: "about-us" },
                { title: "Contact Us", handle: "contact" },
                { title: "Refund & Return Policy", handle: "refund-returns" },
                { title: "Shipping Guidelines", handle: "shipping-guidelines" },
                ...pages.filter(p => !["about-us", "contact", "refund-returns", "refund_returns", "shipping-guidelines"].includes(p.handle))
              ].map((page) => (
                <li key={page.handle}>
                  <Link
                    href={`/pages/${page.handle}`}
                    className="group flex items-center gap-1 text-xs sm:text-sm font-extrabold text-foreground/80 hover:text-primary transition-all duration-200"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-primary opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 shrink-0" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {page.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Dubai Hub (3 cols) — Clean Unified Box */}
          <div className="lg:col-span-3 bg-card border border-border/60 rounded-3xl p-5 lg:p-6 space-y-4 shadow-xs">
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

              <div className="flex flex-col gap-2.5">
                <a
                  href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 border border-border/40 text-foreground hover:text-primary hover:border-primary/40 transition-colors"
                >
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-black text-xs tracking-wider break-all sm:break-normal">{settings.phone}</span>
                </a>

                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 border border-border/40 text-foreground hover:text-primary hover:border-primary/40 transition-colors"
                >
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-bold text-xs break-all sm:break-normal">{settings.email}</span>
                </a>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                <Clock className="h-5 w-5 text-emerald-500 shrink-0" />
                <span className="text-xs font-extrabold uppercase tracking-wide">
                  {settings.hoursNote}
                </span>
              </div>

              {/* Social Media Links */}
              <div className="pt-2">
                <h5 className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2.5 px-1">
                  {settings.socialHeading || "Connect With Us"}
                </h5>
                <div className="flex items-center gap-2.5">
                  {(settings.facebookUrl !== "" && (settings.facebookUrl || "https://www.facebook.com/juuldubai")) && (
                    <a
                      href={settings.facebookUrl || "https://www.facebook.com/juuldubai"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-muted/50 border border-border/50 text-foreground hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                      aria-label="Facebook"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                  )}
                  {(settings.instagramUrl !== "" && (settings.instagramUrl || "https://www.instagram.com/vape_shops_dubai/?hl=en")) && (
                    <a
                      href={settings.instagramUrl || "https://www.instagram.com/vape_shops_dubai/?hl=en"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-muted/50 border border-border/50 text-foreground hover:bg-pink-600 hover:text-white hover:border-pink-600 transition-all"
                      aria-label="Instagram"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                    </a>
                  )}
                  {(settings.twitterUrl !== "" && (settings.twitterUrl || "https://x.com/vapshopdubai")) && (
                    <a
                      href={settings.twitterUrl || "https://x.com/vapshopdubai"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-muted/50 border border-border/50 text-foreground hover:bg-black hover:text-white hover:border-black transition-all"
                      aria-label="X (Twitter)"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                  )}
                  {(settings.pinterestUrl !== "" && (settings.pinterestUrl || "https://www.pinterest.com/juuldubai/")) && (
                    <a
                      href={settings.pinterestUrl || "https://www.pinterest.com/juuldubai/"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-muted/50 border border-border/50 text-foreground hover:bg-[#E60023] hover:text-white hover:border-[#E60023] transition-all"
                      aria-label="Pinterest"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.182 0 7.436 2.982 7.436 6.966 0 4.156-2.618 7.502-6.257 7.502-1.222 0-2.372-.635-2.766-1.385 0 0-.606 2.308-.752 2.875-.272 1.053-1.009 2.368-1.503 3.176 1.493.46 3.085.707 4.739.707 6.621 0 11.988-5.365 11.988-11.985C24.005 5.367 18.638 0 12.017 0z"/></svg>
                    </a>
                  )}
                  {(settings.youtubeUrl !== "" && (settings.youtubeUrl || "https://youtube.com/@vapshopdubai")) && (
                    <a
                      href={settings.youtubeUrl || "https://youtube.com/@vapshopdubai"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-muted/50 border border-border/50 text-foreground hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000] transition-all"
                      aria-label="YouTube"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.015 3.015 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    </a>
                  )}
                </div>
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
