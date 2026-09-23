"use client";

import React, { useState, useEffect, useRef, Suspense, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Menu,
  X,
  Search,
  ChevronDown,
  MessageCircle,
  ShieldAlert,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useHeaderSettings } from "@/context/ThemeSettingsContext";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface NavbarProps {
  onSearchChange?: (query: string) => void;
  onCategorySelect?: (category: string) => void;
  activeCategory?: string;
}

const NavbarContent: React.FC<NavbarProps> = ({
  onSearchChange,
  onCategorySelect,
  activeCategory = "all",
}) => {
  const header = useHeaderSettings();
  const { cartCount, setIsCartOpen } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const dropdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnterNav = (id: string) => {
    if (dropdownTimerRef.current) {
      clearTimeout(dropdownTimerRef.current);
      dropdownTimerRef.current = null;
    }
    setOpenDropdown(id);
  };

  const handleMouseLeaveNav = () => {
    if (dropdownTimerRef.current) {
      clearTimeout(dropdownTimerRef.current);
    }
    dropdownTimerRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 200);
  };

  // Suggestions states & refs
  const [products, setProducts] = useState<any[]>([]);
  const [hasFetchedProducts, setHasFetchedProducts] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLFormElement>(null);
  const mobileSearchRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const q = searchParams?.get("search") || searchParams?.get("q") || "";
    setSearchQuery(q);
    if (q) {
      setIsSearchOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideDesktopNav = dropdownRef.current?.contains(target);
      const insideMobileNav = mobileNavRef.current?.contains(target);
      if (!insideDesktopNav && !insideMobileNav) {
        setOpenDropdown(null);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchProductsForSuggestions = async () => {
    if (hasFetchedProducts) return;
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data || []);
        setHasFetchedProducts(true);
      }
    } catch (err) {
      console.error("Error fetching products for suggestions:", err);
    }
  };

  const suggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query.length < 2) return [];
    return products
      .filter((p: any) => p.name.toLowerCase().includes(query) || (p.brand && p.brand.toLowerCase().includes(query)))
      .slice(0, 5);
  }, [products, searchQuery]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (onSearchChange) {
      onSearchChange(query);
    } else {
      if (!query) {
        router.push("/collections/all");
      } else {
        router.push(`/collections/all?search=${encodeURIComponent(query)}`);
      }
    }
    setIsMobileMenuOpen(false);
  };

  /**
   * Highlight the menu item matching the current URL.
   *
   * Derived from the menu itself rather than a hard-coded id list, so it keeps
   * working when a merchant renames or re-points an item: a parent lights up
   * when the URL is its own link *or* any of its dropdown links — which is how
   * /collections/juul-1-series highlights "JUUL".
   */
  const getActiveState = (linkId: string) => {
    const currentPath = pathname || (typeof window !== "undefined" ? window.location.pathname : "/");
    const normalizedPath = currentPath === "/" ? "/" : currentPath.replace(/\/$/, "");

    const href = hrefById[linkId];
    if (!href) return activeCategory === linkId;

    if (normalizedPath === "/") return href === "/";
    if (href !== "/" && normalizedPath === href.replace(/\/$/, "")) return true;

    // /shop and /collections/all are the same destination.
    if (
      (normalizedPath === "/shop" || normalizedPath === "/collections/all") &&
      (href === "/shop" || href === "/collections/all")
    ) {
      return true;
    }

    const childPrefix = `${linkId}::`;
    for (const [key, childHref] of Object.entries(hrefBySubKey)) {
      if (key.startsWith(childPrefix) && childHref.replace(/\/$/, "") === normalizedPath) {
        return true;
      }
    }

    return false;
  };

  /**
   * The menu is merchant-editable, but the rest of this component was built
   * around `{ id, label, sub: string[] }` plus handle lookup maps. Deriving
   * those shapes from settings keeps every existing behaviour — active-state
   * highlighting, the "scroll to products" home/shop shortcuts, dropdown
   * timers — working untouched.
   */
  const { navLinks, hrefById, hrefBySubKey } = useMemo(() => {
    const deriveId = (href: string): string => {
      if (href === "/") return "home";
      if (href === "/shop") return "all";
      if (href === "/blog") return "blog";
      const collection = href.match(/^\/collections\/([^/?#]+)/);
      return collection ? collection[1] : href;
    };

    const links: { label: string; id: string; sub?: string[] }[] = [];
    const byId: Record<string, string> = {};
    // Keyed by parent so two menus can reuse a child label without colliding.
    const bySubKey: Record<string, string> = {};

    for (const item of header.menu) {
      const id = deriveId(item.href);
      byId[id] = item.href;
      for (const child of item.children) {
        bySubKey[`${id}::${child.label}`] = child.href;
      }
      links.push({
        label: item.label,
        id,
        sub: item.children.length > 0 ? item.children.map((c) => c.label) : undefined,
      });
    }

    return { navLinks: links, hrefById: byId, hrefBySubKey: bySubKey };
  }, [header.menu]);

  const getNavLinkHref = (id: string, subItem?: string): string => {
    if (subItem) {
      return hrefBySubKey[`${id}::${subItem}`] ?? hrefById[id] ?? "/shop";
    }
    return hrefById[id] ?? "/shop";
  };

  const handleSubNavigate = (targetHref: string) => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
    if (targetHref === "/" && pathname === "/") {
      onCategorySelect?.("all");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push(targetHref);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleNavClick = (id: string, subItem?: string) => {
    if (id === "home") {
      if (pathname === "/") {
        onCategorySelect?.("all");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        router.push("/");
      }
    } else if (id === "blog") {
      router.push("/blog");
    } else if (id === "all") {
      if (pathname === "/") {
        onCategorySelect?.("all");
        document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
      } else {
        router.push("/shop");
      }
    } else {
      const href = getNavLinkHref(id, subItem);
      router.push(href);
    }
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  return (
    <header
      suppressHydrationWarning
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "shadow-md" : ""}`}
    >

      {/* ── Announcement Bar ──────────────────────────── */}
      {header.announcementEnabled && (
        <div
          suppressHydrationWarning
          className={`hidden sm:block bg-primary text-white transition-all duration-300 overflow-hidden ${isScrolled ? "h-0 opacity-0" : "h-8 opacity-100"}`}
        >
          <div suppressHydrationWarning className="max-w-[1600px] mx-auto px-4 h-full flex items-center justify-center">
            <p className="text-[10px] sm:text-xs font-semibold tracking-wider text-center">
              {header.announcementText}
            </p>
          </div>
        </div>
      )}

      {/* ── Main Navbar ───────────────────────────────── */}
      <div suppressHydrationWarning className={`glass-strong border-b border-border transition-all duration-300 ${isScrolled ? "py-2.5" : "py-3"}`}>
        <div suppressHydrationWarning className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div suppressHydrationWarning className="flex items-center justify-between gap-4">

            {/* Logo */}
            <div
              suppressHydrationWarning
              className="flex-shrink-0 cursor-pointer select-none flex items-center gap-2"
              onClick={() => {
                if (pathname === "/") {
                  onCategorySelect?.("all");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                } else {
                  router.push("/");
                }
              }}
            >
              {header.logoImage ? (
                <img
                  src={header.logoImage}
                  alt={header.logoText || "Vape Shop Dubai"}
                  className="h-8 w-auto sm:h-10 object-contain"
                />
              ) : (
                <Image
                  src="/Vape%20Shop%20Dubai%20logo%201.png"
                  alt={header.logoText || "Vape Shop Dubai"}
                  width={219}
                  height={40}
                  priority
                  className="h-8 w-auto sm:h-10"
                />
              )}
              {header.logoText && !header.logoImage && (
                <span className="font-bold text-lg hidden sm:block">{header.logoText}</span>
              )}
            </div>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2" ref={dropdownRef}>
              {navLinks.map((link) => {
                const mainHref = getNavLinkHref(link.id);

                return (
                  <div 
                    key={link.id} 
                    suppressHydrationWarning
                    className="relative group"
                    onMouseEnter={() => link.sub && handleMouseEnterNav(link.id)}
                    onMouseLeave={() => link.sub && handleMouseLeaveNav()}
                  >
                    <div
                      suppressHydrationWarning
                      className={`flex items-center rounded-xl text-xs xl:text-[13px] font-extrabold tracking-wider whitespace-nowrap transition-all duration-200 ${
                        getActiveState(link.id) || openDropdown === link.id
                          ? "text-primary bg-primary/10 font-black shadow-xs"
                          : "text-foreground/85 hover:text-primary hover:bg-muted/70"
                      }`}
                    >
                      <Link
                        href={mainHref}
                        onClick={(e) => {
                          if (link.id === "home" && pathname === "/") {
                            onCategorySelect?.("all");
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          } else if (link.id === "all" && pathname === "/") {
                            onCategorySelect?.("all");
                            document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
                          }
                          setOpenDropdown(null);
                        }}
                        className="px-2.5 xl:px-3 py-2 text-left hover:text-primary transition-colors cursor-pointer"
                      >
                        {link.label}
                      </Link>

                      {link.sub && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === link.id ? null : link.id);
                          }}
                          className="pr-2.5 xl:pr-3 py-2 pl-0.5 hover:text-primary transition-all cursor-pointer flex items-center justify-center"
                          aria-label={`Toggle ${link.label} menu`}
                        >
                          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${openDropdown === link.id ? "rotate-180 text-primary" : ""}`} />
                        </button>
                      )}
                    </div>

                    {/* Dropdown (Shows on Hover & Click with Pseudo-Bridge Gap Filler) */}
                    {link.sub && openDropdown === link.id && (
                      <div
                        onMouseEnter={() => handleMouseEnterNav(link.id)}
                        onMouseLeave={handleMouseLeaveNav}
                        className="absolute top-full left-0 mt-1 bg-card/98 backdrop-blur-md border border-border/70 rounded-2xl shadow-xl p-2 min-w-[220px] max-h-96 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-150 before:absolute before:-top-4 before:left-0 before:right-0 before:h-4 before:content-['']"
                      >
                        {link.sub.map((s) => {
                          const subHref = getNavLinkHref(link.id, s);
                          return (
                            <Link
                              key={s}
                              href={subHref}
                              onClick={() => {
                                setOpenDropdown(null);
                              }}
                              className="w-full text-left px-4 py-3 text-sm font-extrabold text-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer flex items-center justify-between group/sub"
                            >
                              <span>{s}</span>
                              <span className="opacity-0 group-hover/sub:opacity-100 text-primary transition-opacity font-bold">→</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div suppressHydrationWarning className="flex items-center gap-2">
              {/* Search (desktop expandable) */}
              <div suppressHydrationWarning className="hidden md:flex items-center gap-2 relative">
                {isSearchOpen ? (
                  <form 
                    ref={searchRef}
                    onSubmit={handleSearchSubmit} 
                    className="flex items-center gap-2 relative"
                  >
                    <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        handleSearchChange(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => {
                        fetchProductsForSuggestions();
                        setShowSuggestions(true);
                      }}
                      placeholder="Search products..."
                      className="w-48 bg-muted border border-border rounded-full px-4 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all"
                    />
                    <button type="submit" className="p-1.5 text-foreground/75 hover:text-primary cursor-pointer">
                      <Search className="h-4 w-4" />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { 
                        setIsSearchOpen(false); 
                        setSearchQuery(""); 
                        setShowSuggestions(false);
                      }} 
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && searchQuery.trim().length >= 2 && (
                      <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-card/95 backdrop-blur-md border border-border/80 rounded-2xl shadow-xl py-2 z-50 overflow-hidden">
                        <div className="px-4 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/30">
                          Search Suggestions
                        </div>
                        <div className="max-h-64 overflow-y-auto divide-y divide-border/20">
                          {suggestions.length > 0 ? (
                            suggestions.map((product) => (
                              <button
                                key={product.id}
                                type="button"
                                onClick={() => {
                                  router.push(`/products/${product.handle}`);
                                  setShowSuggestions(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-muted/60 transition-colors cursor-pointer text-left"
                              >
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-9 h-9 rounded-lg object-contain bg-white dark:bg-muted p-1 flex-shrink-0"
                                  onError={(e) => { e.currentTarget.style.opacity = "0"; }}
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-foreground truncate">{product.name}</p>
                                  <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                    <span className="capitalize">{product.category}</span>
                                    <span>•</span>
                                    <span className="font-semibold text-foreground">Dhs. {product.price}</span>
                                    {product.originalPrice && (
                                      <span className="line-through text-muted-foreground/60 text-[9px]">Dhs. {product.originalPrice}</span>
                                    )}
                                  </p>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-xs text-muted-foreground text-center">
                              No products found for "{searchQuery}"
                            </div>
                          )}
                        </div>
                        <button
                          type="submit"
                          className="w-full text-center py-2.5 border-t border-border/40 text-xs font-bold text-primary hover:bg-primary/5 transition-all block cursor-pointer"
                        >
                          View all results for "{searchQuery}"
                        </button>
                      </div>
                    )}
                  </form>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 text-foreground/70 hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-muted/60"
                    aria-label="Search"
                  >
                    <Search className="h-4.5 w-4.5" />
                  </button>
                )}
              </div>



              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-foreground/70 hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-muted/60"
                aria-label="Cart"
                id="cart-btn"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-background leading-none">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-foreground/70 hover:text-primary transition-colors cursor-pointer"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ───────────────────────────────── */}
      {isMobileMenuOpen && (
        <div ref={mobileNavRef} className="lg:hidden glass-strong border-b border-border shadow-2xl max-h-[calc(100vh-75px)] overflow-y-auto pb-8">
          {/* Mobile search */}
          <div className="px-4 pt-4 pb-2 relative">
            <form 
              ref={mobileSearchRef}
              onSubmit={handleSearchSubmit} 
              className="relative"
            >
              <button type="submit" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary cursor-pointer">
                <Search className="h-4 w-4" />
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  handleSearchChange(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  fetchProductsForSuggestions();
                  setShowSuggestions(true);
                }}
                placeholder="Search products..."
                className="w-full bg-muted border border-border rounded-full pl-10 pr-10 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => {
                    setSearchQuery("");
                    setShowSuggestions(false);
                  }} 
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Suggestions Dropdown (Mobile) */}
              {showSuggestions && searchQuery.trim().length >= 2 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-card border border-border rounded-2xl shadow-xl py-2 z-50 max-h-80 overflow-hidden">
                  <div className="px-4 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/30">
                    Search Suggestions
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-border/20">
                    {suggestions.length > 0 ? (
                      suggestions.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            router.push(`/products/${product.handle}`);
                            setShowSuggestions(false);
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/60 transition-colors cursor-pointer text-left"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-9 h-9 rounded-lg object-contain bg-white dark:bg-muted p-1 flex-shrink-0"
                            onError={(e) => { e.currentTarget.style.opacity = "0"; }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-foreground truncate">{product.name}</p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                              <span className="capitalize">{product.category}</span>
                              <span>•</span>
                              <span className="font-semibold text-foreground">Dhs. {product.price}</span>
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-xs text-muted-foreground text-center">
                        No products found for "{searchQuery}"
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full text-center py-2.5 border-t border-border/40 text-xs font-bold text-primary hover:bg-primary/5 transition-all block cursor-pointer"
                  >
                    View all results for "{searchQuery}"
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Nav items */}
          <nav className="px-4 py-2 space-y-1">
            {navLinks.map((link) => {
              const hasSub = !!link.sub;
              const isSubOpen = openDropdown === link.id;
              const mainHref = getNavLinkHref(link.id);

              return (
                <div key={link.id} className="space-y-1">
                  <div className="flex items-center justify-between w-full">
                    {hasSub ? (
                      <button
                        type="button"
                        onClick={() => setOpenDropdown(isSubOpen ? null : link.id)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-extrabold tracking-wider transition-all cursor-pointer flex items-center justify-between ${
                          getActiveState(link.id) || isSubOpen
                            ? "bg-primary/10 text-primary font-black"
                            : "text-foreground/80 hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <span>{link.label}</span>
                        <ChevronDown className={`h-4.5 w-4.5 transition-transform duration-200 ${isSubOpen ? "rotate-180 text-primary" : "text-muted-foreground"}`} />
                      </button>
                    ) : (
                      <Link
                        href={mainHref}
                        onClick={() => {
                          if (link.id === "home" && pathname === "/") {
                            onCategorySelect?.("all");
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          } else if (link.id === "all" && pathname === "/") {
                            onCategorySelect?.("all");
                            document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
                          }
                          setIsMobileMenuOpen(false);
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-extrabold tracking-wider transition-all ${
                          getActiveState(link.id)
                            ? "bg-primary/10 text-primary font-black"
                            : "text-foreground/80 hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        {link.label}
                      </Link>
                    )}
                  </div>
                  
                  {hasSub && isSubOpen && (
                    <div className="pl-4 pr-2 py-2 space-y-1 border-l-2 border-primary ml-3 bg-muted/20 rounded-r-2xl my-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                      <Link
                        href={mainHref}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setOpenDropdown(null);
                        }}
                        className="w-full text-left px-3.5 py-2.5 text-xs font-black tracking-wider text-primary uppercase hover:bg-primary/10 rounded-xl transition-all flex items-center justify-between cursor-pointer"
                      >
                        <span>View All {link.label}</span>
                        <span>→</span>
                      </Link>
                      {(link.sub ?? []).map((s) => {
                        const subHref = getNavLinkHref(link.id, s);
                        return (
                          <Link
                            key={s}
                            href={subHref}
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setOpenDropdown(null);
                            }}
                            className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm font-bold text-foreground hover:text-primary rounded-xl hover:bg-primary/10 transition-all flex items-center justify-between cursor-pointer"
                          >
                            <span>{s}</span>
                            <span className="text-primary/60 text-xs font-bold">→</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Mobile action buttons */}
          <div className="px-4 pb-4 pt-2 flex gap-3">
            <a
              href="https://wa.me/971582839787"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white text-sm font-bold py-2.5 rounded-xl cursor-pointer"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp Order
            </a>
            <button className="flex-1 border border-border text-sm font-bold py-2.5 rounded-xl text-foreground/70 hover:border-primary hover:text-primary transition-all cursor-pointer">
              Login / Register
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export const Navbar: React.FC<NavbarProps> = (props) => {
  return (
    <Suspense fallback={
      <header suppressHydrationWarning className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border py-3">
        <div suppressHydrationWarning className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="h-9 sm:h-10 w-24 bg-muted animate-pulse rounded" />
          <div className="h-5 w-40 bg-muted animate-pulse rounded hidden md:block" />
          <div className="h-9 w-9 bg-muted animate-pulse rounded-full" />
        </div>
      </header>
    }>
      <NavbarContent {...props} />
    </Suspense>
  );
};
