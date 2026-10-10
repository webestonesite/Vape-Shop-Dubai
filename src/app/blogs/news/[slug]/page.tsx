import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import {
  Calendar,
  Clock,
  User,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { BlogImageWithSkeleton } from "@/components/ui/BlogImageWithSkeleton";
import { ShareButtons } from "@/components/ui/ShareButtons";

const SHOPIFY_STORE = process.env.SHOPIFY_STORE || "vap-shop-dubai.myshopify.com";
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "";
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN || "";

const BLOG_HANDLES = ["news", "juul-pods", "disposables", "comparisons", "safety", "e-liquids", "uae-guides"];

const storefrontArticleQuery = `
query getArticleByHandle($blogHandle: String!, $articleHandle: String!) {
  blogByHandle(handle: $blogHandle) {
    articleByHandle(handle: $articleHandle) {
      id
      title
      handle
      excerpt
      excerptHtml
      contentHtml
      publishedAt
      authorV2 { name }
      image { url altText }
      blog { handle title }
      seo { title description }
    }
  }
}
`;

const adminArticlesQuery = `
query getArticles {
  articles(first: 250, reverse: true) {
    nodes {
      id title handle summary body publishedAt
      author { name }
      image { url altText width height }
      blog { handle title }
    }
  }
}
`;

interface ArticleData {
  title: string;
  handle: string;
  excerpt: string;
  contentHtml: string;
  publishedAt: string;
  author: string;
  image: string;
  blogHandle: string;
  blogTitle: string;
  seoTitle: string;
  seoDescription: string;
}

interface RelatedArticle {
  handle: string;
  title: string;
  image: string;
  blogTitle: string;
}

function cleanArticleBodyHtml(html: string): string {
  if (!html) return "";
  let cleaned = html;
  // Strip competitor URLs and unwrap the links
  cleaned = cleaned.replace(/<a[^>]*href=["']https?:\/\/(?:www\.)?(?:ostore\.ae|vpdubaiking\.ae|vapstall\.ae|vapepods\.ae)[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi, "$1");
  // Normalize store links
  cleaned = cleaned.replace(/href="https?:\/\/(?:www\.)?(?:vapshopdubai\.ae|vapshop\.ae|vapeshopdubai\.net|vapeuae\.shop)\/products\/([^"]+)"/gi, 'href="/products/$1"');
  cleaned = cleaned.replace(/href="https?:\/\/(?:www\.)?(?:vapshopdubai\.ae|vapshop\.ae|vapeshopdubai\.net|vapeuae\.shop)\/collections\/([^"]+)"/gi, 'href="/collections/$1"');
  cleaned = cleaned.replace(/href="https?:\/\/(?:www\.)?(?:vapshopdubai\.ae|vapshop\.ae|vapeshopdubai\.net|vapeuae\.shop)\/blogs\/([^"]+)"/gi, 'href="/blogs/$1"');
  cleaned = cleaned.replace(/href="https?:\/\/(?:www\.)?(?:vapshopdubai\.ae|vapshop\.ae|vapeshopdubai\.net|vapeuae\.shop)\/?"/gi, 'href="/"');
  return cleaned;
}

/** Fetch single article server-side directly from Shopify */
async function fetchArticle(slug: string): Promise<ArticleData | null> {
  // Strategy 1: Storefront API — try multiple blog handles
  if (STOREFRONT_TOKEN) {
    for (const blogHandle of BLOG_HANDLES) {
      try {
        const res = await fetch(
          `https://${SHOPIFY_STORE}/api/2024-10/graphql.json`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
            },
            body: JSON.stringify({
              query: storefrontArticleQuery,
              variables: { blogHandle, articleHandle: slug },
            }),
            next: { revalidate: 300 },
          }
        );

        if (res.ok) {
          const json = await res.json();
          const node = json.data?.blogByHandle?.articleByHandle;
          if (node && node.contentHtml) {
            let author = node.authorV2?.name || "Vape Shop Dubai Editorial";
            if (author.includes("@")) author = "Vape Shop Dubai Editorial";
            return {
              title: node.title,
              handle: node.handle,
              excerpt: node.excerpt || node.excerptHtml?.replace(/<[^>]+>/g, "").slice(0, 160) || "",
              contentHtml: cleanArticleBodyHtml(node.contentHtml),
              publishedAt: node.publishedAt,
              author,
              image: node.image?.url || "",
              blogHandle: node.blog?.handle || blogHandle,
              blogTitle: node.blog?.title || "News",
              seoTitle: node.seo?.title || node.title,
              seoDescription: node.seo?.description || node.excerpt || "",
            };
          }
        }
      } catch {
        // try next blog handle
      }
    }
  }

  // Strategy 2: Admin API
  if (ADMIN_TOKEN) {
    try {
      const res = await fetch(
        `https://${SHOPIFY_STORE}/admin/api/2024-10/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": ADMIN_TOKEN,
          },
          body: JSON.stringify({ query: adminArticlesQuery }),
          next: { revalidate: 300 },
        }
      );
      if (res.ok) {
        const json = await res.json();
        const nodes = json.data?.articles?.nodes || [];
        const node = nodes.find((n: any) => n.handle?.toLowerCase() === slug.toLowerCase());
        if (node) {
          let author = node.author?.name || "Vape Shop Dubai Editorial";
          if (author.includes("@")) author = "Vape Shop Dubai Editorial";
          return {
            title: node.title,
            handle: node.handle,
            excerpt: node.summary || (node.body ? node.body.replace(/<[^>]+>/g, "").slice(0, 160) : ""),
            contentHtml: cleanArticleBodyHtml(node.body || ""),
            publishedAt: node.publishedAt,
            author,
            image: node.image?.url || "",
            blogHandle: node.blog?.handle || "news",
            blogTitle: node.blog?.title || "News",
            seoTitle: node.title,
            seoDescription: node.summary || "",
          };
        }
      }
    } catch {
      // fall through
    }
  }

  return null;
}

/** Fetch related articles server-side */
async function fetchRelatedArticles(excludeHandle: string): Promise<RelatedArticle[]> {
  if (!ADMIN_TOKEN) return [];
  try {
    const res = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/2024-10/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": ADMIN_TOKEN,
        },
        body: JSON.stringify({ query: adminArticlesQuery }),
        next: { revalidate: 600 },
      }
    );
    if (res.ok) {
      const json = await res.json();
      const nodes = json.data?.articles?.nodes || [];
      return nodes
        .filter((n: any) => n.handle !== excludeHandle && n.image?.url && !n.handle.includes("__trashed") && !n.title.toLowerCase().includes("casino"))
        .slice(0, 3)
        .map((n: any) => ({
          handle: n.handle,
          title: n.title,
          image: n.image.url,
          blogTitle: n.blog?.title || "News",
        }));
    }
  } catch {
    // silent
  }
  return [];
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function estimateReadTime(html: string): string {
  const words = html.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await fetchArticle(slug);
  if (!article) {
    return { title: "Article Not Found | Vape Shop Dubai" };
  }
  let baseTitle = article.seoTitle || article.title;
  let fullTitle = baseTitle;
  if (!fullTitle.toLowerCase().includes("vape shop dubai") && fullTitle.length <= 45) {
    fullTitle = `${fullTitle} | Vape Shop Dubai`;
  }
  if (fullTitle.length > 65) {
    fullTitle = fullTitle.replace(/\s*\|\s*Vape Shop Dubai/gi, "");
    if (fullTitle.length > 65) {
      fullTitle = fullTitle.slice(0, 62) + "...";
    }
  }

  return {
    title: fullTitle,
    description: article.seoDescription || article.excerpt,
    openGraph: {
      title: fullTitle,
      description: article.seoDescription || article.excerpt,
      images: article.image ? [{ url: article.image }] : [],
      type: "article",
    },
  };
}

export default async function SingleBlogNewsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch article + related in parallel — server-side, no loading state
  const [article, relatedArticles] = await Promise.all([
    fetchArticle(slug),
    fetchRelatedArticles(slug),
  ]);

  if (!article) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
            <h1 className="text-3xl font-serif font-black">Article Not Found</h1>
            <p className="text-muted-foreground">The article you are looking for does not exist or has been removed.</p>
            <Link href="/blogs/news" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold text-sm">
              <ArrowLeft className="h-4 w-4" /> Back to All Articles
            </Link>
          </div>
        </main>
        <Footer />
        <CartDrawer />
      </div>
    );
  }

  const displayDate = formatDate(article.publishedAt);
  const readTime = article.contentHtml ? estimateReadTime(article.contentHtml) : "5 min read";

  const { headers } = await import("next/headers");
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') || 'https';
  const siteUrl = host ? `${protocol}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL || "https://vapeshopdubai.webestone.net");

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt || article.title,
    image: article.image || `${siteUrl}/Vape%20Shop%20Dubai%20logo%201.png`,
    author: { "@type": "Organization", name: article.author },
    publisher: {
      "@type": "Organization",
      name: "Vape Shop Dubai",
      logo: { "@type": "ImageObject", url: `${siteUrl}/Vape%20Shop%20Dubai%20logo%201.png` },
    },
    datePublished: article.publishedAt,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}/blogs/news/${slug}` },
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <Navbar />

      <main className="flex-grow pt-16 sm:pt-20 lg:pt-24 pb-16">
        {/* Breadcrumb */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/blogs/news" className="hover:text-primary transition-colors">Blog &amp; News</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground truncate max-w-[200px] sm:max-w-xs">{article.title}</span>
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

        {/* Article */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm space-y-8">
            {/* Header */}
            <div className="space-y-5">
              <span className="inline-block bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                {article.blogTitle || "Vaping Guide"}
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-foreground leading-tight tracking-tight">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border/30">
                <span className="flex items-center gap-1.5 font-bold text-foreground">
                  <User className="h-3.5 w-3.5 text-primary" />
                  {article.author}
                </span>
                {displayDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    {displayDate}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  {readTime}
                </span>
              </div>
            </div>

            {/* Cover Image */}
            {article.image && (
              <BlogImageWithSkeleton
                src={article.image}
                alt={article.title}
                priority={true}
                containerClassName="aspect-video sm:aspect-[21/9] rounded-2xl border border-border/40"
                className="w-full h-full object-cover"
              />
            )}

            {/* Content */}
            {article.contentHtml ? (
              <div
                className="blog-content-body"
                dangerouslySetInnerHTML={{ __html: article.contentHtml }}
              />
            ) : (
              <div className="space-y-5 text-muted-foreground leading-relaxed text-base font-medium pt-4">
                <p className="text-lg font-semibold text-foreground italic border-l-4 border-primary pl-4 py-2 bg-primary/5 rounded-r-xl">
                  {article.excerpt}
                </p>
              </div>
            )}

            {/* Share */}
            <div className="pt-6 border-t border-border/40 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Share this article
              </span>
              <ShareButtons />
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-serif font-black text-foreground">
                Related Guides
              </h3>
              <Link href="/blogs/news" className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1">
                View All <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <div
                  key={rel.handle}
                  className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col gap-3 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all group"
                >
                  <Link href={`/blogs/news/${rel.handle}`} className="block rounded-2xl overflow-hidden">
                    <BlogImageWithSkeleton
                      src={rel.image}
                      alt={rel.title}
                      containerClassName="aspect-video rounded-xl border border-border/30"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                    {rel.blogTitle}
                  </span>
                  <Link href={`/blogs/news/${rel.handle}`}>
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

      {/* Blog Content Premium Styles */}
      <style>{`
        .blog-content-body {
          font-size: 1.05rem;
          line-height: 1.85;
          color: var(--muted-foreground, #555);
          word-break: break-word;
        }
        .blog-content-body h1,
        .blog-content-body h2,
        .blog-content-body h3,
        .blog-content-body h4,
        .blog-content-body h5,
        .blog-content-body h6 {
          font-family: var(--font-serif, Georgia, serif);
          font-weight: 900;
          color: var(--foreground, #111);
          margin-top: 2.2em;
          margin-bottom: 0.8em;
          line-height: 1.3;
          letter-spacing: -0.01em;
        }
        .blog-content-body h1 { font-size: 2rem; }
        .blog-content-body h2 {
          font-size: 1.65rem;
          padding-bottom: 0.5em;
          border-bottom: 2px solid var(--border, #e5e7eb);
        }
        .blog-content-body h3 {
          font-size: 1.35rem;
          color: var(--primary, #ea580c);
        }
        .blog-content-body h4 { font-size: 1.15rem; }
        .blog-content-body p {
          margin-bottom: 1.4em;
          font-weight: 450;
        }
        .blog-content-body a {
          color: var(--primary, #ea580c);
          font-weight: 700;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: border-color 0.2s;
        }
        .blog-content-body a:hover {
          border-bottom-color: var(--primary, #ea580c);
        }
        .blog-content-body strong,
        .blog-content-body b {
          font-weight: 800;
          color: var(--foreground, #111);
        }
        .blog-content-body img {
          border-radius: 1rem;
          margin: 1.5em auto;
          display: block;
          max-width: 100%;
          height: auto;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          border: 1px solid var(--border, #e5e7eb);
        }
        .blog-content-body ul,
        .blog-content-body ol {
          padding-left: 1.4em;
          margin-bottom: 1.4em;
        }
        .blog-content-body ul { list-style: none; }
        .blog-content-body ul li {
          position: relative;
          padding-left: 1.3em;
          margin-bottom: 0.6em;
          font-weight: 450;
        }
        .blog-content-body ul li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0.55em;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--primary, #ea580c);
          opacity: 0.7;
        }
        .blog-content-body ol { list-style: decimal; }
        .blog-content-body ol li {
          margin-bottom: 0.6em;
          padding-left: 0.3em;
          font-weight: 450;
        }
        .blog-content-body ol li::marker {
          color: var(--primary, #ea580c);
          font-weight: 800;
        }
        .blog-content-body blockquote {
          border-left: 4px solid var(--primary, #ea580c);
          padding: 1em 1.4em;
          margin: 1.5em 0;
          background: rgba(234,88,12,0.04);
          border-radius: 0 0.75rem 0.75rem 0;
          font-style: italic;
          font-weight: 500;
          color: var(--foreground, #111);
        }
        .blog-content-body table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin: 2em 0;
          font-size: 0.95rem;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(234, 88, 12, 0.08);
          border: 1px solid rgba(234, 88, 12, 0.15);
        }
        .blog-content-body th {
          background: linear-gradient(135deg, var(--primary, #ea580c), #c2410c);
          font-weight: 900;
          text-align: left;
          padding: 1.2em 1em;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #ffffff;
          text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .blog-content-body td {
          padding: 1em 1em;
          border-bottom: 1px solid rgba(234, 88, 12, 0.1);
          color: var(--foreground, #111);
          transition: background-color 0.2s ease;
        }
        .blog-content-body tr:last-child td {
          border-bottom: none;
        }
        .blog-content-body tr:nth-child(even) td {
          background: rgba(234, 88, 12, 0.03);
        }
        .blog-content-body tr:hover td {
          background: rgba(234, 88, 12, 0.08);
        }
        .blog-content-body hr {
          border: none;
          height: 2px;
          background: linear-gradient(to right, transparent, var(--border, #e5e7eb), transparent);
          margin: 2.5em 0;
        }
        .blog-content-body > p:first-of-type {
          font-size: 1.15rem;
          font-weight: 500;
          color: var(--foreground, #111);
          line-height: 1.75;
        }
        @media (max-width: 640px) {
          .blog-content-body { font-size: 0.98rem; line-height: 1.75; }
          .blog-content-body h1 { font-size: 1.5rem; }
          .blog-content-body h2 { font-size: 1.3rem; }
          .blog-content-body h3 { font-size: 1.15rem; }
        }
      `}</style>
    </div>
  );
}
