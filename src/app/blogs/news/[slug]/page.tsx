"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { Calendar, Clock, User, ChevronRight, ArrowLeft, Share2, MessageCircle, Copy, Check, BookOpen } from "lucide-react";
import { BLOG_POSTS } from "../page";
import { BlogImageWithSkeleton } from "@/components/ui/BlogImageWithSkeleton";

export default function SingleBlogNewsPage() {
  const params = useParams();
  const router = useRouter();
  const [copied, setCopied] = React.useState(false);
  const slug = params?.slug as string;

  const fallbackPost = BLOG_POSTS.find((p) => p.slug === slug) || BLOG_POSTS[0];
  const [article, setArticle] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!slug) return;
    async function loadArticle() {
      try {
        const res = await fetch(`/api/articles/${encodeURIComponent(slug)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.title) {
            setArticle(data);
          }
        }
      } catch (err) {
        console.warn("Single article API fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadArticle();
  }, [slug]);

  const rawArticleImage = article?.image;
  const postImage = (rawArticleImage && rawArticleImage.trim() !== "") ? rawArticleImage : "";

  const post = article ? { ...article, image: postImage } : { ...fallbackPost, image: "" };
  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 3);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  let authorDisplay = post.author || "Vape Shop Dubai Editorial";
  if (authorDisplay.includes("@")) {
    authorDisplay = "Vape Shop Dubai Editorial";
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.title,
    image: post.image || "https://vapeshopdubai.ae/Vape%20Shop%20Dubai%20logo%201.png",
    author: {
      "@type": "Organization",
      name: authorDisplay,
    },
    publisher: {
      "@type": "Organization",
      name: "Vape Shop Dubai",
      logo: {
        "@type": "ImageObject",
        url: "https://vapeshopdubai.ae/Vape%20Shop%20Dubai%20logo%201.png",
      },
    },
    datePublished: post.date,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": typeof window !== "undefined" ? window.location.href : `https://vapeshopdubai.ae/blogs/news/${slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20" suppressHydrationWarning>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <Navbar />

      <main className="flex-grow pt-16 sm:pt-20 lg:pt-24 pb-16">
        {/* Breadcrumb Navigation */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/blogs/news" className="hover:text-primary transition-colors">Blog &amp; News</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground truncate max-w-[200px] sm:max-w-xs">{post.title}</span>
          </nav>

          <div className="mt-6">
            <Link
              href="/blogs/news"
              className="inline-flex items-center gap-2 text-xs font-extrabold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider bg-primary/10 px-4 py-2 rounded-full border border-primary/20"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to All Articles
            </Link>
          </div>
        </div>

        {/* Article Header & Main Card */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                <span className="bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black">
                  {post.category || "Vaping Guide"}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-foreground leading-tight tracking-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/30">
                <span className="flex items-center gap-1.5 font-bold text-foreground">
                  <User className="h-3.5 w-3.5 text-primary" />
                  {authorDisplay}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  {post.readTime || "5 min read"}
                </span>
              </div>
            </div>

            {/* Clean Blog Cover Image with Pulse Skeleton */}
            <BlogImageWithSkeleton
              src={post.image}
              alt={post.title}
              priority={true}
              containerClassName="aspect-video sm:aspect-[21/9] rounded-2xl border border-border/40"
              className="w-full h-full object-cover"
            />

            {/* Content Body */}
            {post.contentHtml ? (
              <div
                className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-base font-medium pt-4 prose-headings:font-serif prose-headings:font-black prose-headings:text-foreground prose-a:text-primary prose-a:font-bold hover:prose-a:underline prose-img:rounded-2xl"
                dangerouslySetInnerHTML={{ __html: post.contentHtml }}
              />
            ) : (
              <div className="space-y-4 text-muted-foreground leading-relaxed text-base font-medium pt-4">
                <p className="text-lg font-semibold text-foreground italic border-l-4 border-primary pl-4 py-1 bg-primary/5 rounded-r-xl">
                  {post.excerpt}
                </p>
                <p>
                  Vape Shop Dubai is committed to providing adult vapers across the UAE with 100% authentic devices, pod systems, e-liquids, and disposable vapes from trusted worldwide brands including JUUL, MYLE, Al Fakher, Lost Mary, and Pod Salt.
                </p>
                <p>
                  Whether you are shopping for fast 2-hour express delivery in Dubai or same-day shipping to Abu Dhabi, Sharjah, Ajman, and across all Emirates, our inventory is backed by serial number authenticity verification and ESMA compliance.
                </p>
              </div>
            )}

            {/* Social Share & Action Footer */}
            <div className="pt-6 border-t border-border/40 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Share this article</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-background border border-border/60 hover:border-primary px-4 py-2 rounded-full transition-colors cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-primary" />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-serif font-black text-foreground">Related Guides</h3>
              <Link href="/blogs/news" className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1">
                View All <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((rel) => (
                <div key={rel.slug} className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col gap-3 shadow-2xs hover:shadow-md transition-all group">
                  <Link href={`/blogs/news/${rel.slug}`} className="block rounded-2xl overflow-hidden">
                    <BlogImageWithSkeleton
                      src={rel.image}
                      alt={rel.title}
                      containerClassName="aspect-video rounded-xl border border-border/30"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </Link>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{rel.category}</span>
                  <Link href={`/blogs/news/${rel.slug}`}>
                    <h4 className="font-serif font-black text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {rel.title}
                    </h4>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}
