import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getAllProducts } from "@/lib/shopify/products-fetch";
import { getItemListSchema, getBreadcrumbSchema } from "@/lib/seo-schemas";
import { Star, ChevronRight, Package, ArrowRight, ShieldCheck } from "lucide-react";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "All Vape Products & Kits | Vape Shop Dubai",
  description:
    "Browse all authentic vaping products, JUUL devices, MYLE pod kits, disposable vapes, and premium e-liquids available at Vape Shop Dubai with fast 2-hour UAE delivery.",
  alternates: {
    canonical: "https://vapeshopdubai.webestone.net/products",
  },
  openGraph: {
    title: "All Vape Products & Kits | Vape Shop Dubai",
    description:
      "Browse all authentic vaping products, JUUL devices, MYLE pod kits, disposable vapes, and premium e-liquids available at Vape Shop Dubai with fast 2-hour UAE delivery.",
    url: "https://vapeshopdubai.webestone.net/products",
    type: "website",
    images: [{ url: "https://vapeshopdubai.webestone.net/hero_vape.png" }],
  },
};

export default async function ProductIndexPage({
  searchParams,
}: {
  searchParams?: Promise<{ preview?: string; [key: string]: string | undefined }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const products = await getAllProducts().catch(() => []);

  // For Admin Customizer preview of the product template: forward to first product if ?preview is present
  if (resolvedParams?.preview && products.length > 0) {
    redirect(`/products/${products[0].handle}?preview=${encodeURIComponent(resolvedParams.preview)}`);
  }

  const itemListSchema = getItemListSchema(
    "All Vape Products in Dubai",
    products.map((p) => ({
      name: p.name,
      handle: p.handle,
      price: p.price,
      image: p.image,
    }))
  );

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Products", item: "/products" },
  ]);

  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground">
      {/* Structured SEO Schemas in Server HTML */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Navbar activeCategory="all" />

      <main className="flex-grow max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-20">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-foreground">Products</span>
        </nav>

        {/* Collection Header with proper H1 */}
        <header className="bg-card border border-border/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 mb-8 sm:mb-12 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
              <ShieldCheck className="h-3 w-3" /> 100% Authentic Products
            </span>
            <span className="text-xs text-muted-foreground font-semibold">
              {products.length} Products Available
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-foreground tracking-tight leading-tight">
            All Vape Products in Dubai
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
            Explore our complete collection of genuine vaping devices, JUUL pods, MYLE systems, disposable vapes, and premium nicotine salts. All products are 100% authentic, sealed from official manufacturers, with guaranteed 2-hour express delivery across Dubai, Abu Dhabi, Sharjah, and all UAE emirates.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/collections/juul-vape-dubai"
              className="text-xs font-bold bg-background hover:bg-primary/10 border border-border hover:border-primary px-3.5 py-1.5 rounded-full transition-colors"
            >
              JUUL Dubai
            </Link>
            <Link
              href="/collections/disposable-vape"
              className="text-xs font-bold bg-background hover:bg-primary/10 border border-border hover:border-primary px-3.5 py-1.5 rounded-full transition-colors"
            >
              Disposable Vapes
            </Link>
            <Link
              href="/collections/myle-vape-dubai"
              className="text-xs font-bold bg-background hover:bg-primary/10 border border-border hover:border-primary px-3.5 py-1.5 rounded-full transition-colors"
            >
              MYLE UAE
            </Link>
            <Link
              href="/collections/vape-e-juice"
              className="text-xs font-bold bg-background hover:bg-primary/10 border border-border hover:border-primary px-3.5 py-1.5 rounded-full transition-colors"
            >
              E-Liquids &amp; Salts
            </Link>
          </div>
        </header>

        {/* Complete Product Grid with real crawlable product links */}
        {products.length === 0 ? (
          <div className="bg-card border border-border/40 rounded-3xl p-16 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground">Catalogue Updating</h2>
            <p className="text-xs text-muted-foreground mt-2">
              Products are being refreshed. Please check back in a few moments.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <article
                key={product.id}
                className="group relative bg-card border border-border/60 hover:border-primary/80 rounded-2xl sm:rounded-3xl p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
              >
                <div>
                  {/* Product Image Link */}
                  <Link
                    href={`/products/${product.handle}`}
                    className="block relative bg-muted/20 rounded-xl sm:rounded-2xl h-52 sm:h-64 p-3 flex items-center justify-center overflow-hidden mb-4 border border-border/40 group-hover:border-primary/30 transition-colors"
                  >
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <Package className="h-12 w-12 text-muted-foreground/40" />
                    )}

                    {product.isSoldOut && (
                      <span className="absolute top-2.5 left-2.5 bg-muted/90 text-muted-foreground text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md">
                        Sold Out
                      </span>
                    )}
                  </Link>

                  {/* Brand & Category */}
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-primary mb-1">
                    <span>{product.brand || product.category}</span>
                    {product.nicotine && (
                      <span className="text-muted-foreground">{product.nicotine}</span>
                    )}
                  </div>

                  {/* Product Title Link */}
                  <h2 className="text-sm sm:text-base font-body font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    <Link href={`/products/${product.handle}`}>
                      {product.name}
                    </Link>
                  </h2>
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                  <div>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-[10px] text-muted-foreground line-through block leading-none">
                        Dhs. {product.originalPrice.toFixed(2)}
                      </span>
                    )}
                    <span className="text-base sm:text-lg font-serif font-black text-primary">
                      Dhs. {product.price.toFixed(2)}
                    </span>
                  </div>

                  <Link
                    href={`/products/${product.handle}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 group-hover:translate-x-0.5 transition-all"
                  >
                    View <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
