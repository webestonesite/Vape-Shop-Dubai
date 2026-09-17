"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { Calendar, Clock, User, ChevronRight, ChevronLeft, Search, ArrowRight, Tag, BookOpen, Sparkles } from "lucide-react";
import { BlogImageWithSkeleton } from "@/components/ui/BlogImageWithSkeleton";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "best-juul-device-shop-in-uae",
    title: "Best JUUL Device Shop in UAE",
    excerpt: "Everything you need to know about JUUL 2 devices and pods in UAE. Learn about smart pod technology, flavor profiles, and fast delivery across Dubai.",
    category: "JUUL & Pods",
    author: "Vape Shop Dubai Editorial",
    date: "August 2, 2026",
    readTime: "5 min read",
    image: "/blog_juul_guide.png",
    featured: true,
  },
  {
    slug: "top-10-premium-and-authentic-vape-shop-in-uae",
    title: "Top 10 Premium & Authentic Vape Shop in UAE",
    excerpt: "Looking for authentic vapes in UAE? We review top vape products and authentic delivery services across Dubai.",
    category: "Disposables",
    author: "Vape Specialist Team",
    date: "July 28, 2026",
    readTime: "7 min read",
    image: "/blog_disposable_vapes.png",
  },
  {
    slug: "best-places-to-buy-juul-1-series",
    title: "Best Places to Buy JUUL 1 Series",
    excerpt: "Complete guide on buying original JUUL 1 series pods and kits in Dubai with cash on delivery.",
    category: "JUUL & Pods",
    author: "Vape Shop Dubai Editorial",
    date: "July 20, 2026",
    readTime: "6 min read",
    image: "/blog_juul_guide.png",
  },
  {
    slug: "juul-2-dubai-complete-guide-2026",
    title: "Complete Guide to JUUL 2 in Dubai: Features, Flavors & 2-Hour Delivery (2026)",
    excerpt: "Everything you need to know about JUUL 2 devices and pods in UAE. Learn about smart pod technology, flavor profiles, battery optimization, and fast delivery across Dubai.",
    category: "JUUL & Pods",
    author: "Vape Shop Dubai Editorial",
    date: "August 2, 2026",
    readTime: "5 min read",
    image: "/blog_juul_guide.png",
  },
  {
    slug: "top-10-longest-lasting-disposable-vapes-uae",
    title: "Top 10 Longest Lasting Disposable Vapes in UAE (8000+ Puffs Rated)",
    excerpt: "Looking for high puff capacity disposables? We test and rank Al Fakher Crown Bar 8000, Lost Mary 10000, Tugboat T12000, and Elf Bar BC10000 for flavor and longevity.",
    category: "Disposables",
    author: "Vape Specialist Team",
    date: "July 28, 2026",
    readTime: "7 min read",
    image: "/blog_disposable_vapes.png",
  },
  {
    slug: "myle-v5-vs-juul-2-which-should-you-buy",
    title: "MYLE V5 Meta vs JUUL 2: Which Pod System Should You Buy in Dubai?",
    excerpt: "Side-by-side comparison of UAE's two most popular pod systems. We analyze battery life, pod pricing, flavor intensity, and draw tightness to help you choose.",
    category: "Comparisons",
    author: "Vape Shop Dubai Editorial",
    date: "July 20, 2026",
    readTime: "6 min read",
    image: "/blog_pod_comparison.png",
  },
  {
    slug: "how-to-verify-authentic-vape-products-dubai",
    title: "How to Verify Authentic Vape Products in UAE & Avoid Counterfeits",
    excerpt: "Step-by-step guide to scanning QR codes, checking security seals, and verifying official distributor serial numbers on JUUL, MYLE, and Al Fakher products.",
    category: "Safety & Authenticity",
    author: "Quality Assurance Team",
    date: "July 15, 2026",
    readTime: "4 min read",
    image: "/blog_authenticity_guide.png",
  },
  {
    slug: "best-salt-nicotine-e-liquids-dubai-summer-2026",
    title: "Best Salt Nicotine E-Liquid Flavors for Summer 2026 in Dubai",
    excerpt: "Beat the UAE heat with our curated list of top cooling menthol, icy mango, fruit blends, and premium tobacco salt nics available for express delivery.",
    category: "E-Liquids",
    author: "Flavor Sommelier",
    date: "July 10, 2026",
    readTime: "5 min read",
    image: "/blog_eliquid_flavors.png",
  },
  {
    slug: "vaping-regulations-delivery-guidelines-uae-2026",
    title: "Vaping Regulations & Delivery Guidelines in Dubai & UAE (2026 Update)",
    excerpt: "Important legal updates regarding legal age requirements, ESMA certification standards, customs regulations, and cash-on-delivery rules in Dubai.",
    category: "UAE Guides",
    author: "Compliance Team",
    date: "July 01, 2026",
    readTime: "6 min read",
    image: "/blog_authenticity_guide.png",
  },
];

const CATEGORIES = ["All", "JUUL & Pods", "Disposables", "E-Liquids", "Comparisons", "Safety & Authenticity", "UAE Guides"];

function formatDate(dateStr?: string) {
  if (!dateStr) return "August 2, 2026";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "August 2, 2026";
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function BlogPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>(BLOG_POSTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    async function loadShopifyArticles() {
      try {
        const res = await fetch("/api/articles");
        if (res.ok) {
          const data = await res.json();
          if (data.articles && data.articles.length > 0) {
            const mapped: BlogPost[] = data.articles.map((item: any, idx: number) => {
              const matchingBuiltin = BLOG_POSTS.find((p) => p.slug === item.handle);
              const rawImage = typeof item.image === "string" ? item.image : item.image?.url;
              const image = (rawImage && rawImage.trim() !== "" && rawImage !== "/hero_vape.png")
                ? rawImage
                : (matchingBuiltin?.image || "");

              return {
                slug: item.handle,
                title: item.title,
                excerpt: item.excerpt || "Read full article on Vape Shop Dubai.",
                category: item.blogTitle || "News",
                author: item.author || "Vape Shop Dubai Editorial",
                date: formatDate(item.publishedAt),
                readTime: "5 min read",
                image,
                featured: idx === 0,
              };
            });
            setPosts(mapped);
          }
        }
      } catch (err) {
        console.warn("Failed to load Shopify articles, fallback used:", err);
      } finally {
        setLoading(false);
      }
    }
    loadShopifyArticles();
  }, []);

  const POSTS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPosts = posts.filter((post) => {
    const matchCat = selectedCategory === "All" || post.category === selectedCategory;
    const matchSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const startIdx = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIdx, startIdx + POSTS_PER_PAGE);

  const featuredPost = posts.find((p) => p.featured) || posts[0];

  return (
    <div suppressHydrationWarning className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      <Navbar />

      <main className="flex-grow pt-16 sm:pt-20 lg:pt-24 pb-12">
        {/* Breadcrumb */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Blog &amp; Vaping Guides</span>
          </nav>
        </div>

        {/* Clean Page Header */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6">
          <div className="text-center flex flex-col items-center justify-center max-w-2xl mx-auto space-y-3">
            <span className="inline-block bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] px-4 py-1 rounded-full">
              Dubai Vaping Editorial
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black text-foreground tracking-tight leading-tight">
              Vape Guides &amp; Insights
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground font-medium max-w-xl leading-relaxed">
              Expert reviews, pod system comparisons, authenticity guides &amp; UAE vaping news.
            </p>
          </div>
        </div>

        {/* Clean Featured Hero Article */}
        {featuredPost && selectedCategory === "All" && !searchQuery && (
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-12">
            <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-10 shadow-sm hover:shadow-md transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2.5 text-xs font-bold text-primary uppercase tracking-widest">
                  <span className="bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black">
                    {featuredPost.category}
                  </span>
                  <span className="text-muted-foreground text-[11px]">• Featured Article</span>
                </div>

                <Link href={`/blog/${featuredPost.slug}`}>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-foreground hover:text-primary transition-colors leading-tight">
                    {featuredPost.title}
                  </h2>
                </Link>

                <p className="text-sm text-muted-foreground leading-relaxed font-medium line-clamp-3">
                  {featuredPost.excerpt}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border/30">
                  <span className="flex items-center gap-1.5 font-bold text-foreground">
                    <User className="h-3.5 w-3.5 text-primary" />
                    {featuredPost.author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    {featuredPost.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    {featuredPost.readTime}
                  </span>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center gap-2 bg-primary text-white font-black text-xs uppercase tracking-wider px-6 py-3 rounded-full hover:bg-primary/90 transition-all shadow-sm active:scale-95"
                  >
                    Read Article
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              
              <div className="lg:col-span-5">
                <Link href={`/blog/${featuredPost.slug}`} className="block relative rounded-2xl overflow-hidden group shadow-inner">
                  <BlogImageWithSkeleton
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    priority={true}
                    containerClassName="aspect-video rounded-2xl border border-border/40"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Clean Filter & Search Bar */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card border border-border/50 rounded-2xl p-3 sm:p-4 shadow-xs">
            {/* Categories Scroll */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar py-0.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-2xs ${
                    selectedCategory === cat
                      ? "bg-primary text-white font-black scale-105 shadow-sm"
                      : "bg-background border border-border/70 text-foreground hover:border-primary hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border/60 rounded-full pl-10 pr-4 py-2 text-xs font-bold focus:outline-none focus:border-primary transition-colors text-foreground shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Article Grid */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          {filteredPosts.length === 0 ? (
            <div className="bg-card border border-border/50 rounded-3xl p-12 text-center">
              <p className="text-base font-bold text-foreground">No articles found matching your query.</p>
              <button
                onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
                className="mt-4 text-xs font-bold text-primary underline cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedPosts.map((post) => (
                  <article
                    key={post.slug}
                    className="bg-card border border-border/50 rounded-3xl overflow-hidden flex flex-col p-4 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <Link href={`/blog/${post.slug}`} className="relative block rounded-2xl overflow-hidden">
                      <BlogImageWithSkeleton
                        src={post.image}
                        alt={post.title}
                        containerClassName="aspect-video rounded-2xl border border-border/30"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="absolute top-3 left-3 z-20 bg-background/90 backdrop-blur-md border border-border/40 text-primary text-[10px] font-extrabold tracking-wider uppercase px-3 py-1 rounded-full shadow-xs">
                        {post.category}
                      </span>
                    </Link>

                    <div className="pt-4 px-1 flex flex-col flex-grow gap-2.5">
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-primary" />
                          {post.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-primary" />
                          {post.readTime}
                        </span>
                      </div>

                      <Link href={`/blog/${post.slug}`}>
                        <h3 className="font-serif font-black text-base text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                          {post.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-2">
                        {post.excerpt}
                      </p>

                      <div className="pt-3 border-t border-border/30 mt-auto flex items-center justify-between">
                        <span className="text-[11px] font-bold text-muted-foreground">{post.author}</span>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                        >
                          Read
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Numbered Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage((prev) => Math.max(prev - 1, 1));
                      window.scrollTo({ top: 400, behavior: "smooth" });
                    }}
                    className="px-4 py-2 rounded-full border border-border/60 bg-card text-xs font-bold text-foreground hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Prev</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => {
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 400, behavior: "smooth" });
                      }}
                      className={`w-9 h-9 rounded-full text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                        currentPage === pageNum
                          ? "bg-primary text-white font-black scale-105 shadow-sm"
                          : "bg-card border border-border/60 text-foreground hover:border-primary hover:text-primary"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                      window.scrollTo({ top: 400, behavior: "smooth" });
                    }}
                    className="px-4 py-2 rounded-full border border-border/60 bg-card text-xs font-bold text-foreground hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <CartDrawer />
      <Footer />
    </div>
  );
}
