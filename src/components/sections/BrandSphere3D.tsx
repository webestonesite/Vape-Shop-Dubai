"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  SlidersHorizontal,
  CheckCircle2,
  Star,
  Award,
  Truck,
  CreditCard,
  Search,
} from "lucide-react";

import { useCollectionImages } from "@/hooks/useCollectionImages";

export interface BrandData {
  id: number;
  name: string;
  handle: string;
  category: "disposable" | "pod-system" | "e-liquid" | "juul-myle";
  image: string;
  tag: string;
  badge?: string;
  color: string;
  description: string;
  productCount: number;
  isFeatured?: boolean;
}

export const BRANDS_DATA: BrandData[] = [
  {
    id: 1,
    name: "JUUL",
    handle: "juul-vape-dubai",
    category: "juul-myle",
    image: "",
    tag: "JUUL 1 & JUUL 2 Series",
    badge: "Official Bestseller",
    color: "from-blue-500/20 via-indigo-500/10 to-transparent",
    description: "Official JUUL devices, replacement pods, and starter kits with 2-hour express delivery in Dubai.",
    productCount: 18,
    isFeatured: true,
  },
  {
    id: 2,
    name: "MYLE",
    handle: "myle-vape-dubai",
    category: "juul-myle",
    image: "",
    tag: "Meta V5 Pods & Micro",
    badge: "Top Rated",
    color: "from-amber-500/20 via-orange-500/10 to-transparent",
    description: "MYLE Meta V5, Micro, and Drip disposables sourced directly from regional certified importers.",
    productCount: 24,
    isFeatured: true,
  },
  {
    id: 3,
    name: "Elf Bar",
    handle: "elf-bar-vape",
    category: "disposable",
    image: "",
    tag: "BC5000 & Lowit Series",
    badge: "Trending #1",
    color: "from-emerald-500/20 via-teal-500/10 to-transparent",
    description: "Authentic Elf Bar disposable vapes with QR code security authentication.",
    productCount: 32,
    isFeatured: true,
  },
  {
    id: 4,
    name: "Al Fakher",
    handle: "al-fakher-vape",
    category: "disposable",
    image: "",
    tag: "Crown Bar 8000 & 10000",
    badge: "Shisha Edition",
    color: "from-purple-500/20 via-pink-500/10 to-transparent",
    description: "Al Fakher Crown Bar shisha-style rechargeable disposables featuring signature flavors.",
    productCount: 16,
    isFeatured: true,
  },
  {
    id: 5,
    name: "GeekVape",
    handle: "geek-vape",
    category: "pod-system",
    image: "",
    tag: "Aegis, Sonder & Coils",
    color: "from-red-500/15 to-transparent",
    description: "Heavy duty shockproof vape kits, sub-ohm tanks, and replacement mesh coils.",
    productCount: 22,
  },
  {
    id: 6,
    name: "Uwell",
    handle: "uwell-vape",
    category: "pod-system",
    image: "",
    tag: "Caliburn G3 & AK3 Kits",
    color: "from-cyan-500/15 to-transparent",
    description: "Industry leading Caliburn pod systems with Pro-FOCS flavor technology.",
    productCount: 19,
  },
  {
    id: 7,
    name: "Vaporesso",
    handle: "vaporesso-vape",
    category: "pod-system",
    image: "",
    tag: "XROS 3 & Luxe Series",
    color: "from-sky-500/15 to-transparent",
    description: "Precision airflow pod systems and leak-resistant COREX pods.",
    productCount: 26,
  },
  {
    id: 8,
    name: "Lost Mary",
    handle: "lost-mary-disposable",
    category: "disposable",
    image: "",
    tag: "BM6000 & MO5000 Puffs",
    color: "from-pink-500/15 to-transparent",
    description: "Premium Lost Mary fruity burst disposables with dual-mesh coil design.",
    productCount: 20,
  },
  {
    id: 9,
    name: "VooPoo",
    handle: "voopoo-vape",
    category: "pod-system",
    image: "",
    tag: "Drag 4 & Argus Pods",
    color: "from-amber-500/15 to-transparent",
    description: "Gene-chip powered mod kits and Argus series refillable pod systems.",
    productCount: 17,
  },
  {
    id: 10,
    name: "Smok",
    handle: "smok-vape",
    category: "pod-system",
    image: "",
    tag: "Nord & Novo Series",
    color: "from-red-600/15 to-transparent",
    description: "Classic Smok Nord and Novo refillable pod kits and RPM coils.",
    productCount: 21,
  },
  {
    id: 11,
    name: "OXVA",
    handle: "oxva-vape",
    category: "pod-system",
    image: "",
    tag: "Xlim Pro & SQ Series",
    color: "from-violet-500/15 to-transparent",
    description: "Top-rated OXVA Xlim pod systems with OLED display screen.",
    productCount: 15,
  },
  {
    id: 12,
    name: "Tugboat",
    handle: "tugboat-vape",
    category: "disposable",
    image: "",
    tag: "Super 12000 & Evo",
    color: "from-teal-500/15 to-transparent",
    description: "Tugboat Super 12000 puffs rechargeable disposable vapes.",
    productCount: 25,
  },
  {
    id: 13,
    name: "Pod Salt",
    handle: "pod-salt-vape",
    category: "e-liquid",
    image: "",
    tag: "Core & Nexus Nic Salts",
    color: "from-blue-600/15 to-transparent",
    description: "British-engineered nic salt liquids in 11mg & 20mg strengths.",
    productCount: 28,
  },
  {
    id: 14,
    name: "HQD",
    handle: "hqd-vape",
    category: "disposable",
    image: "",
    tag: "Cuvie & Ultimate Series",
    color: "from-yellow-600/15 to-transparent",
    description: "HQD Cuvie Bar and Cuvie Plus long-lasting disposables.",
    productCount: 14,
  },
  {
    id: 15,
    name: "Fummo",
    handle: "fummo-vape",
    category: "disposable",
    image: "",
    tag: "Target 10000 Puffs",
    color: "from-emerald-600/15 to-transparent",
    description: "Fummo Target and King mesh-coil rechargeable vapes.",
    productCount: 18,
  },
  {
    id: 16,
    name: "Vozol",
    handle: "vozol-vape",
    category: "disposable",
    image: "",
    tag: "Gear 10000 & Star Series",
    color: "from-purple-600/15 to-transparent",
    description: "Vozol Gear 10000 outdoorsy carabiner disposables.",
    productCount: 19,
  },
  {
    id: 17,
    name: "Relx",
    handle: "relx-vape",
    category: "pod-system",
    image: "",
    tag: "Infinity & Essential",
    color: "from-slate-600/15 to-transparent",
    description: "Relx pre-filled ceramic pod systems with smooth cotton flavor.",
    productCount: 12,
  },
  {
    id: 18,
    name: "Geek Bar",
    handle: "geek-bar-disposable",
    category: "disposable",
    image: "",
    tag: "Pulse 15000 & DF9000",
    color: "from-rose-500/15 to-transparent",
    description: "Geek Bar Pulse dual-mesh 15,000 puffs disposables with full screen.",
    productCount: 22,
  },
  {
    id: 19,
    name: "Yuoto",
    handle: "yuoto-vape",
    category: "disposable",
    image: "",
    tag: "Thanatos & XXL",
    color: "from-orange-600/15 to-transparent",
    description: "Long-lasting Yuoto Thanatos 5000 puffs disposables.",
    productCount: 16,
  },
  {
    id: 20,
    name: "Nerd Vape",
    handle: "nerd-vape",
    category: "disposable",
    image: "",
    tag: "Nerd Bar 3000 & 5000",
    color: "from-lime-600/15 to-transparent",
    description: "Nerd Bar mesh coil disposable pods in delicious fruit blends.",
    productCount: 13,
  },
  {
    id: 21,
    name: "VGOD",
    handle: "vgod-stig",
    category: "e-liquid",
    image: "",
    tag: "Stig & Cubano Salts",
    color: "from-red-700/15 to-transparent",
    description: "World famous VGOD Cubano and Mighty Mint nic salt e-liquids.",
    productCount: 15,
  },
  {
    id: 22,
    name: "Silvaper",
    handle: "silvaper-vape",
    category: "e-liquid",
    image: "",
    tag: "Premium E-Liquids",
    color: "from-teal-600/15 to-transparent",
    description: "Silvaper handcrafted UAE e-liquids with intense flavor profiles.",
    productCount: 11,
  },
  {
    id: 23,
    name: "Vapes Bars",
    handle: "vapes-bars",
    category: "disposable",
    image: "",
    tag: "Ghost Pro 3500",
    color: "from-indigo-600/15 to-transparent",
    description: "Vapes Bars Ghost Pro 3500 puffs disposables in metallic finish.",
    productCount: 17,
  },
  {
    id: 24,
    name: "Maskking",
    handle: "maskking-vape",
    category: "disposable",
    image: "",
    tag: "High Pro & Jam",
    color: "from-fuchsia-600/15 to-transparent",
    description: "Maskking High Pro compact disposable pods.",
    productCount: 14,
  },
];

export interface BrandSphereSettings {
  flagshipHeading?: string;
  flagshipSubtitle?: string;
  directoryHeading?: string;
  directorySubtitle?: string;
  featuredBrands?: any[];
}

export function BrandSphere3D({
  settings,
}: { settings?: BrandSphereSettings } = {}) {
  const router = useRouter();
  const collectionImages = useCollectionImages();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredBrands = BRANDS_DATA.filter((b) => {
    const matchCategory = activeCategory === "all" || b.category === activeCategory;
    const matchQuery =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchQuery;
  });

  const featuredBrands =
    settings?.featuredBrands && settings.featuredBrands.length > 0
      ? settings.featuredBrands.map((b, idx) => ({
          id: idx + 1,
          name: b.name || "Brand",
          handle: b.handle || "all",
          category: b.category || "juul-myle",
          image: b.image || "",
          tag: b.tag || "",
          badge: b.badge || "Certified Brand",
          color: b.color || "from-blue-500/20 via-indigo-500/10 to-transparent",
          description: b.description || "",
          productCount: b.productCount || 20,
          isFeatured: true,
        }))
      : BRANDS_DATA.filter((b) => b.isFeatured);

  return (
    <div className="w-full space-y-10 my-4">
      {/* Hero Showcase Banner Header */}
      <div className="relative bg-card border border-border/50 rounded-[2.5rem] p-8 sm:p-12 overflow-hidden shadow-sm transition-all duration-300">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-xs font-black tracking-[0.2em] text-primary uppercase">
              100% Certified UAE Distributors
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-black text-foreground tracking-tight leading-tight">
            Explore Official <span className="text-primary">Vape Brands</span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Select any certified brand to view 100% authentic devices, pods, and e-liquids with 2-hour express delivery across Dubai and same-day delivery in UAE.
          </p>

          {/* Search & Filter bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search brand name (e.g. JUUL, MYLE)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-background border border-border/60 rounded-2xl text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar py-1">
              {[
                { label: "All Brands (24)", id: "all" },
                { label: "JUUL & MYLE", id: "juul-myle" },
                { label: "Disposables", id: "disposable" },
                { label: "Pod Systems", id: "pod-system" },
                { label: "E-Liquids", id: "e-liquid" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold tracking-wide uppercase transition-all duration-300 cursor-pointer whitespace-nowrap ${
                    activeCategory === tab.id
                      ? "bg-primary text-white shadow-md shadow-primary/25 scale-105"
                      : "bg-background border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Flagship Brands (JUUL, MYLE, Elf Bar, Al Fakher) */}
      {!searchQuery && activeCategory === "all" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl sm:text-2xl font-serif font-black text-foreground flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              {settings?.flagshipHeading || "Flagship Certified Brands"}
            </h2>
            <span className="text-xs font-bold text-primary tracking-wider uppercase">
              {settings?.flagshipSubtitle || "Most Popular in Dubai"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredBrands.map((b) => {
              const brandImg = collectionImages[b.handle] || b.image || "";
              return (
                <div
                  key={b.handle}
                  onClick={() => router.push(`/collections/${b.handle}`)}
                  className="group relative bg-card border border-primary/30 rounded-3xl p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden"
                >
                  {/* Background Accent Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${b.color} opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                  {/* Top Badge */}
                  <div className="relative z-10 flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {b.badge}
                    </span>
                    <span className="text-xs font-extrabold text-muted-foreground flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> 4.9
                    </span>
                  </div>

                  {/* Brand Logo & Details */}
                  <div className="relative z-10 flex items-center gap-4 my-2">
                    <div className="w-16 h-16 rounded-2xl bg-background/80 border border-border/40 p-2.5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      <img src={brandImg} alt={b.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-serif font-black text-foreground group-hover:text-primary transition-colors">
                        {b.name}
                      </h3>
                      <p className="text-xs font-semibold text-primary">{b.tag}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                        {b.productCount}+ Products Available
                      </p>
                    </div>
                  </div>

                  {/* Button */}
                  <div className="relative z-10 mt-6 pt-4 border-t border-border/30 flex items-center justify-between text-xs font-bold text-primary group-hover:translate-x-1 transition-all uppercase tracking-wider">
                    <span>Explore Collection</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Brands Directory Grid (24 Certified Brands) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl sm:text-2xl font-serif font-black text-foreground flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
            {settings?.directoryHeading || "All Certified Brands"} ({filteredBrands.length})
          </h2>
          <span className="text-xs font-bold text-muted-foreground">
            {settings?.directorySubtitle || "Showing 100% Verified Importers"}
          </span>
        </div>

        {filteredBrands.length === 0 ? (
          <div className="bg-card border border-border/40 rounded-3xl p-12 text-center space-y-3">
            <p className="text-base font-bold text-foreground">No brands matched your search.</p>
            <button
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
              }}
              className="text-xs font-extrabold text-primary uppercase underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
            {filteredBrands.map((b) => {
              const brandImg = collectionImages[b.handle] || b.image || "";
              return (
                <div
                  key={b.handle}
                  onClick={() => router.push(`/collections/${b.handle}`)}
                  className="group relative bg-card hover:bg-muted/30 border border-border/50 rounded-3xl p-5 flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/40 overflow-hidden"
                >
                  {/* Glow Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${b.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                  {/* Brand Logo Container */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-muted/20 border border-border/40 p-2.5 mb-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner">
                    <img
                      src={brandImg}
                      alt={b.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.opacity = "0";
                      }}
                    />
                  </div>

                  {/* Brand Title */}
                  <h3 className="text-lg sm:text-xl font-serif font-black text-foreground group-hover:text-primary transition-colors tracking-tight">
                    {b.name}
                  </h3>

                  {/* Subtag */}
                  <span className="text-[11px] font-semibold text-muted-foreground mt-1 line-clamp-1">
                    {b.tag}
                  </span>

                  {/* Action Link */}
                  <div className="mt-4 pt-3 border-t border-border/30 w-full flex items-center justify-center gap-1 text-[11px] font-bold text-primary group-hover:scale-105 transition-transform uppercase tracking-wider">
                    <span>Browse Collection</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="bg-card border border-border/50 rounded-[2rem] p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">2-Hour Dubai Express</h4>
            <p className="text-xs text-muted-foreground">Order before 10 PM for rapid delivery</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">100% QR Authentic</h4>
            <p className="text-xs text-muted-foreground">Direct from certified UAE importers</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">Card Machine on Delivery</h4>
            <p className="text-xs text-muted-foreground">Pay cash or card when driver arrives</p>
          </div>
        </div>
      </div>
    </div>
  );
}
