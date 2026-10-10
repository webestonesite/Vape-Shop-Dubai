"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { useCart } from "@/context/CartContext";
import {
  Star,
  ShoppingCart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Check,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Heart,
  Share2,
  Copy,
  Droplet,
  MessageCircle,
  CreditCard,
  PackageCheck,
  Zap,
  X,
  Search,
  Play
} from "lucide-react";
import { ProductVideoPlayer } from "@/components/products/ProductVideoPlayer";
import { getYouTubeDetails } from "@/lib/youtube";
import { WhatsAppContactSection } from "@/components/sections/WhatsAppContactSection";
import { ProductCard } from "@/components/sections/ProductFeed";
import { ProductSectionCarousel } from "@/components/sections/ProductSectionCarousel";
import { JuulAppIntegrationSection } from "@/components/sections/JuulAppIntegrationSection";
import { JuulCrispMentholSections } from "@/components/sections/JuulCrispMentholSections";
import { ProductAvailableFlavorsSection } from "@/components/sections/ProductAvailableFlavorsSection";
import { CustomerReviewsSection } from "@/components/sections/CustomerReviewsSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { ProductKeySpecsSection } from "@/components/sections/ProductKeySpecsSection";
import { WhyChooseProductSection } from "@/components/sections/WhyChooseProductSection";
import { ProductFinalThoughtsSection } from "@/components/sections/ProductFinalThoughtsSection";
import { JuulCustomFeatureSection } from "@/components/sections/JuulCustomFeatureSection";
import {
  instanceSettings,
  TemplateSections,
} from "@/components/sections/SectionRenderer";
import { useResolvedTemplate } from "@/context/ThemeSettingsContext";
import { resolveIcon } from "@/lib/theme/icons";
import {
  getProductSchema,
  getBreadcrumbSchema,
  getFAQSchema,
} from "@/lib/seo-schemas";
import { getCachedProduct, setCachedProduct } from "@/lib/product-cache";
import { getAccurateProductSpecs } from "@/lib/shopify/smart-specs";

/** One row of the buy box's specification card. */
interface SpecCardRow {
  label: string;
  /** Which product field supplies the value, or "custom" for fixed text. */
  source: string;
  /** Fixed text, and the fallback when the product field is empty. */
  value: string;
}

interface ServiceCard {
  icon: string;
  title: string;
  subtitle: string;
}

interface TabBlock {
  title: string;
  body: string;
}

interface Variant {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  availableForSale: boolean;
  inventoryQuantity: number;
}

interface ProductDetails {
  id: string;
  name: string;
  handle: string;
  descriptionHtml: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  images: string[];
  videoUrl?: string;
  tag?: string;
  tagColor?: string;
  isPopular: boolean;
  isSoldOut: boolean;
  puffs?: string;
  nicotine?: string;
  battery?: string;
  shortDescription?: string;
  specsTable?: any;
  faqAccordion?: any;
  reviewsList?: any[];
  flavorNotes?: any[];
  whyChoose?: any;
  finalThoughts?: any;
  juulFeature1?: any;
  juulFeature2?: any;
  options?: { name: string, values: string[] }[];
  variants: Variant[];
  section?: string;
  brand?: string;
  keySpecifications?: Array<{ label: string; value: string }> | null;
}

export default function ClientProductPage({ initialProduct }: { initialProduct?: any }) {
  const params = useParams();
  const handle = params?.handle as string;
  const router = useRouter();

  const { addToCart } = useCart();
  const [product, setProduct] = useState<ProductDetails | null>(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState("");
  const [mainImageLoaded, setMainImageLoaded] = useState(false);
  const [activeImage, setActiveImage] = useState(initialProduct?.image || "");
  const [activeMediaType, setActiveMediaType] = useState<"image" | "video">("image");

  useEffect(() => {
    setMainImageLoaded(false);
  }, [activeImage]);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(() => {
    if (!initialProduct) return null;
    if (initialProduct.variants && initialProduct.variants.length > 1) return null;
    return initialProduct.variants?.find((v: Variant) => v.availableForSale) || initialProduct.variants?.[0] || null;
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFlavorModalOpen, setIsFlavorModalOpen] = useState(false);
  const [flavorSearchQuery, setFlavorSearchQuery] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "video" | "shipping" | "returns">("description");
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const { instances: templateInstances, isOverride: templateIsOverride } =
    useResolvedTemplate("product", handle);

  const effectiveTemplateInstances = React.useMemo(() => {
    const list = [...templateInstances];

    // 1. Ensure productFinalThoughts comes AFTER productFlavors
    let flavorsIdx = list.findIndex((i) => i.type === "productFlavors");
    let finalThoughtsIdx = list.findIndex((i) => i.type === "productFinalThoughts");

    if (finalThoughtsIdx === -1) {
      const ftInst = {
        id: "prod-final-thoughts-fallback",
        type: "productFinalThoughts",
        enabled: true,
        settings: {},
      };
      if (flavorsIdx !== -1) {
        list.splice(flavorsIdx + 1, 0, ftInst);
      } else {
        list.push(ftInst);
      }
    } else if (flavorsIdx !== -1 && finalThoughtsIdx !== flavorsIdx + 1) {
      const [ftInst] = list.splice(finalThoughtsIdx, 1);
      const newFlavorsIdx = list.findIndex((i) => i.type === "productFlavors");
      list.splice(newFlavorsIdx + 1, 0, ftInst);
    }

    // 2. Ensure FAQ section comes BEFORE customerReviews
    let faqIdx = list.findIndex((i) => i.type === "faq");
    let reviewsIdx = list.findIndex((i) => i.type === "customerReviews");

    if (faqIdx === -1) {
      const faqInst = {
        id: "prod-faq-fallback",
        type: "faq",
        enabled: true,
        settings: {},
      };
      if (reviewsIdx !== -1) {
        list.splice(reviewsIdx, 0, faqInst);
      } else {
        list.push(faqInst);
      }
    } else if (reviewsIdx !== -1 && faqIdx > reviewsIdx) {
      const [faqInst] = list.splice(faqIdx, 1);
      const newReviewsIdx = list.findIndex((i) => i.type === "customerReviews");
      list.splice(newReviewsIdx, 0, faqInst);
    }

    return list;
  }, [templateInstances]);
  // Everything the buy box says comes from the product template's
  // "Product Details & Buy Box" section; only the data is Shopify's.
  const mainSettings = instanceSettings(templateInstances, "productMain");
  const relatedSettings = instanceSettings(templateInstances, "relatedProducts");
  const text = (key: string, fallback = "") =>
    typeof mainSettings[key] === "string" ? (mainSettings[key] as string) : fallback;
  const flag = (key: string) => mainSettings[key] !== false;
  const list = <T,>(key: string): T[] =>
    Array.isArray(mainSettings[key]) ? (mainSettings[key] as T[]) : [];

  const specCardRows = list<SpecCardRow>("specRows");
  const serviceCards = list<ServiceCard>("serviceCards");
  const shippingBlocks = list<TabBlock>("shippingBlocks");
  const returnsBlocks = list<TabBlock>("returnsBlocks");
  const showShippingTab = flag("showShippingTab");
  const showReturnsTab = flag("showReturnsTab");
  const [isWishlist, setIsWishlist] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const domain = isLocal ? "https://vapeshopdubai.net" : window.location.origin;
      setShareUrl(`${domain}/products/${handle}`);
    }
  }, [handle]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const urlToCopy = shareUrl || window.location.href;
      navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    const urlToShare = getProductShareUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: product?.name || "Vape Shop Dubai",
          text: `Check out ${product?.name || "this product"} on Vape Shop Dubai!`,
          url: urlToShare,
        });
        return true;
      } catch (err) {
        // User cancelled or share failed
      }
    }
    return false;
  };

  const getProductShareUrl = () => {
    if (typeof window !== "undefined") {
      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const domain = isLocal ? "https://vapeshopdubai.net" : window.location.origin;
      return `${domain}/products/${handle}`;
    }
    return `https://vapeshopdubai.net/products/${handle}`;
  };

  const handleFacebookShare = async () => {
    const shared = await handleNativeShare();
    if (!shared && typeof window !== "undefined") {
      const urlToShare = getProductShareUrl();
      const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlToShare)}`;
      window.open(fbUrl, "_blank", "width=600,height=500,location=yes,resizable=yes,scrollbars=yes");
    }
  };

  const handleTwitterShare = async () => {
    const shared = await handleNativeShare();
    if (!shared && typeof window !== "undefined") {
      const urlToShare = getProductShareUrl();
      const twUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(urlToShare)}&text=${encodeURIComponent(product?.name || "")}`;
      window.open(twUrl, "_blank", "width=600,height=500,location=yes,resizable=yes,scrollbars=yes");
    }
  };

  const handleWhatsAppShare = async () => {
    const shared = await handleNativeShare();
    if (!shared && typeof window !== "undefined") {
      const urlToShare = getProductShareUrl();
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent((product?.name || "") + " - " + urlToShare)}`;
      window.open(waUrl, "_blank");
    }
  };

  const relatedLimit = Number(relatedSettings.maxProducts) || 10;
  const relatedLimitRef = React.useRef(relatedLimit);
  relatedLimitRef.current = relatedLimit;

  // For Navbar states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    if (!handle || initialProduct) return;

    // 0ms Instant Cache Check
    const cached = getCachedProduct(handle);
    if (cached) {
      setProduct(cached);
      setActiveImage(cached.image);
      setActiveMediaType("image");
      if (cached.variants && cached.variants.length > 1) {
        setSelectedVariant(null);
      } else if (cached.variants) {
        const firstAvailable = cached.variants.find((v: Variant) => v.availableForSale) || cached.variants[0] || null;
        setSelectedVariant(firstAvailable);
      }
      setLoading(false);
    } else {
      setLoading(true);
    }

    async function fetchProduct() {
      setError("");
      try {
        const res = await fetch(`/api/products/${handle}`);
        if (!res.ok) {
          throw new Error("Product not found");
        }
        const data = await res.json();
        setProduct(data);
        setActiveImage(data.image);
        setActiveMediaType("image");
        setCachedProduct(handle, data);

        // Select first available variant only if there is 1 option.
        if (data.variants && data.variants.length > 1) {
          setSelectedVariant(null);
        } else {
          const firstAvailable = data.variants.find((v: Variant) => v.availableForSale) || data.variants[0] || null;
          setSelectedVariant(firstAvailable);
        }

        // Unblock main product UI immediately
        setLoading(false);
      } catch (err: any) {
        console.error("Error loading product:", err);
        if (!cached) {
          setError(err.message || "Failed to load product details");
          setLoading(false);
        }
      }
    }

    fetchProduct();
  }, [handle, initialProduct]);

  // Fetch similar products
  useEffect(() => {
    if (!product || !product.category) return;
    fetch("/api/products")
      .then((r) => r.ok ? r.json() : [])
      .then((allData) => {
        if (Array.isArray(allData)) {
          const filtered = allData
            .filter((p: any) => p.category === product.category && p.handle !== product.handle)
            .slice(0, relatedLimitRef.current);
          setSimilarProducts(filtered);
        }
      })
      .catch(() => {});
  }, [product?.category, product?.handle]);

  const handleQuantityChange = (val: number) => {
    if (val < 1) return;
    if (product?.variants && product.variants.length > 1 && !selectedVariant) {
      setIsFlavorModalOpen(true);
      return;
    }
    setQuantity(val);
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (product.variants && product.variants.length > 1 && !selectedVariant) {
      setIsFlavorModalOpen(true);
      return;
    }
    if (!selectedVariant) return;

    addToCart({
      id: `${product.id}-${selectedVariant.id}`,
      name: `${product.name} ${product.variants.length > 1 ? `- ${selectedVariant.title}` : ""}`.trim(),
      price: selectedVariant.price,
      image: activeImage || product.image,
      category: product.category,
      variantId: selectedVariant.id,
      handle: product.handle,
    }, quantity);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (product.variants && product.variants.length > 1 && !selectedVariant) {
      setIsFlavorModalOpen(true);
      return;
    }
    if (!selectedVariant) return;

    addToCart({
      id: `${product.id}-${selectedVariant.id}`,
      name: `${product.name} ${product.variants.length > 1 ? `- ${selectedVariant.title}` : ""}`.trim(),
      price: selectedVariant.price,
      image: activeImage || product.image,
      category: product.category,
      variantId: selectedVariant.id,
      handle: product.handle,
    }, quantity);

    router.push("/checkout");
  };

  if (loading) {
    return (
      <div className="relative flex flex-col min-h-screen bg-background text-foreground" suppressHydrationWarning>
        <Navbar onSearchChange={setSearchQuery} onCategorySelect={setActiveCategory} activeCategory={activeCategory} />
        <main className="flex-grow max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 pt-[115px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
            {/* Left Column: Gallery Skeleton */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="relative bg-card/60 border border-border/60 rounded-[2.5rem] aspect-square w-full flex items-center justify-center p-8 overflow-hidden shadow-xs">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />
                <div className="w-40 h-40 rounded-3xl bg-muted/50 animate-pulse flex items-center justify-center border border-border/30">
                  <PackageCheck className="w-12 h-12 text-primary/30 animate-pulse" />
                </div>
              </div>

              {/* Thumbnails Row Skeleton */}
              <div className="flex gap-3 overflow-x-auto pb-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-20 h-20 rounded-2xl bg-card/60 border border-border/60 animate-pulse shrink-0"
                  />
                ))}
              </div>
            </div>

            {/* Right Column: Buy Box Skeleton */}
            <div className="lg:col-span-6 flex flex-col gap-5">
              {/* Category & Rating Row */}
              <div className="flex items-center justify-between gap-4">
                <div className="h-4 bg-primary/15 rounded-full w-28 animate-pulse" />
                <div className="h-4 bg-muted/60 rounded-full w-32 animate-pulse" />
              </div>

              {/* Product Title Skeleton */}
              <div className="space-y-2">
                <div className="h-8 sm:h-9 bg-muted/70 rounded-2xl w-5/6 animate-pulse" />
                <div className="h-8 sm:h-9 bg-muted/60 rounded-2xl w-3/5 animate-pulse" />
              </div>

              {/* Price & Tag Skeleton */}
              <div className="flex items-center gap-3 py-1">
                <div className="h-10 bg-primary/20 rounded-2xl w-36 animate-pulse" />
                <div className="h-7 bg-muted/50 rounded-full w-24 animate-pulse" />
              </div>

              {/* Spec Badges Skeleton */}
              <div className="flex gap-2 py-1">
                <div className="h-7 bg-muted/50 rounded-full w-20 animate-pulse" />
                <div className="h-7 bg-muted/50 rounded-full w-24 animate-pulse" />
                <div className="h-7 bg-muted/50 rounded-full w-20 animate-pulse" />
              </div>

              {/* Variant Selector Box Skeleton */}
              <div className="h-16 bg-card/60 border border-border/60 rounded-2xl w-full animate-pulse p-4 flex items-center justify-between">
                <div className="h-4 bg-muted/60 rounded-full w-32" />
                <div className="h-8 bg-primary/20 rounded-xl w-24" />
              </div>

              {/* CTA Buttons Skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="h-13 bg-primary/25 rounded-2xl animate-pulse" />
                <div className="h-13 bg-primary rounded-2xl animate-pulse" />
              </div>

              {/* Trust Features Cards Skeleton */}
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="h-14 bg-card/60 border border-border/60 rounded-2xl animate-pulse" />
                <div className="h-14 bg-card/60 border border-border/60 rounded-2xl animate-pulse" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="relative flex flex-col min-h-screen bg-background text-foreground">
        <Navbar onSearchChange={setSearchQuery} onCategorySelect={setActiveCategory} activeCategory={activeCategory} />
        <main className="flex-grow flex flex-col items-center justify-center text-center px-4 py-20">
          <h2 className="text-3xl font-serif font-bold text-foreground">Product Not Found</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            The product you are looking for might have been removed or the handle is incorrect.
          </p>
          <Link
            href="/"
            className="mt-8 flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-full hover:bg-gold-shimmer transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const showVideoSetting = flag("showProductVideo");
  const customizerDefaultVideo = text("defaultVideoUrl", "");
  const effectiveVideoUrl = product.videoUrl || (showVideoSetting ? customizerDefaultVideo : "");

  // A tab the merchant has since hidden must not leave the panel blank.
  const effectiveTab =
    (activeTab === "shipping" && !showShippingTab) ||
    (activeTab === "returns" && !showReturnsTab) ||
    (activeTab === "video" && !effectiveVideoUrl)
      ? "description"
      : activeTab;

  /** Value for one specification row: the product's own field, else the text. */
  const specValue = (row: SpecCardRow) => {
    const fromProduct: Record<string, string | undefined> = {
      brand: product.brand,
      category: product.category,
      puffs: product.puffs,
      nicotine: product.nicotine,
      battery: product.battery,
    };
    const val = (row.source === "custom" ? "" : fromProduct[row.source] ?? "");
    if (val) return val;
    // Never output misleading hardcoded defaults for nicotine, battery, or puffs
    if (row.source === "nicotine" || row.source === "battery" || row.source === "puffs") {
      return "";
    }
    return row.value;
  };

  const isSale = selectedVariant && selectedVariant.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price;
  const discountPercent = isSale && selectedVariant.compareAtPrice
    ? Math.round(((selectedVariant.compareAtPrice - selectedVariant.price) / selectedVariant.compareAtPrice) * 100)
    : 0;

  const primaryColHandle = (product as any)?.primaryCollection?.handle ||
    (product.category === "disposables" ? "disposable-vape" :
     product.category === "juul" ? "juul-vape-dubai" :
     product.category === "e-liquids" ? "vape-e-juice" :
     product.category === "accessories" ? "pod-system" :
     product.category === "myle" ? "myle-vape-dubai" :
     product.category || "shop");

  const primaryColTitle = (product as any)?.primaryCollection?.title ||
    (product.category === "disposables" ? "Disposable Vapes" :
     product.category === "juul" ? "JUUL" :
     product.category === "e-liquids" ? "E-Liquids" :
     product.category === "accessories" ? "Pod Systems" :
     product.category === "myle" ? "MYLE" :
     product.category || "Products");

  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground" suppressHydrationWarning>
      {/* Product JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getProductSchema({
              id: product.id,
              name: product.name,
              handle: product.handle,
              descriptionHtml: product.descriptionHtml,
              price: selectedVariant?.price || product.price,
              originalPrice: product.originalPrice,
              rating: product.rating,
              reviews: product.reviews,
              image: product.image,
              images: product.images,
              brand: product.brand,
              category: product.category,
              isSoldOut: product.isSoldOut,
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBreadcrumbSchema([
              { name: "Home", item: "/" },
              { name: primaryColTitle, item: `/collections/${primaryColHandle}` },
              { name: product.name, item: `/products/${product.handle}` },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getFAQSchema([
              {
                question: `Is ${product.name} original and authentic?`,
                answer: `Yes, 100% authentic imported ${product.brand || product.category} product delivered across Dubai & UAE.`,
              },
              {
                question: `How fast is delivery for ${product.name} in Dubai?`,
                answer: "We offer express 2-hour delivery across all Dubai areas and same-day delivery across UAE.",
              },
            ])
          ),
        }}
      />
      {/* Navbar */}
      <Navbar
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q) router.push(`/?search=${encodeURIComponent(q)}`);
        }}
        onCategorySelect={(c) => {
          setActiveCategory(c);
          router.push(`/?category=${encodeURIComponent(c)}`);
        }}
        activeCategory={activeCategory}
      />
      <main className="flex-grow pb-16 pt-[92px]">
        {/* Full-Width Header-Attached Breadcrumb Bar with Soft Lighter Tint */}
        {flag("showBreadcrumb") && (
          <div className="w-full bg-muted/40 dark:bg-card/50 border-b border-border/50 py-2.5 mb-6 sm:mb-8">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs font-semibold tracking-wide text-muted-foreground/80">
                <Link href="/" className="hover:text-primary transition-colors shrink-0">
                  {text("breadcrumbHomeLabel", "HOME")}
                </Link>
                <span className="text-muted-foreground/40 shrink-0 font-light">/</span>
                <Link
                  href={text("breadcrumbShopHref", "/shop")}
                  className="hover:text-primary transition-colors shrink-0"
                >
                  {text("breadcrumbShopLabel", "PRODUCTS")}
                </Link>
                <span className="text-muted-foreground/40 shrink-0 font-light">/</span>
                <Link
                  href={`/collections/${primaryColHandle}`}
                  className="hover:text-primary transition-colors capitalize shrink-0"
                >
                  {primaryColTitle}
                </Link>
                <span className="text-muted-foreground/40 shrink-0 font-light">/</span>
                <span className="text-foreground font-bold">{product.name}</span>
              </nav>
            </div>
          </div>
        )}

        {/* Product Details Hero Section */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* Left Column: Image & Video Gallery (Clean Premium Display Frame) */}
            <div className="lg:col-span-6 flex flex-col gap-4 w-full lg:sticky lg:top-28">
              {(() => {
                const ytDetails = effectiveVideoUrl ? getYouTubeDetails(effectiveVideoUrl) : null;
                const videoThumbSrc = ytDetails?.thumbnailUrl || product.image;

                return (
                  <>
                    <div className="relative bg-card border border-border/70 rounded-[2.5rem] p-6 sm:p-8 flex items-center justify-center aspect-square overflow-hidden shadow-lg hover:shadow-xl hover:border-primary/40 transition-all duration-500 group">
                      {effectiveVideoUrl && activeMediaType === "video" ? (
                        <ProductVideoPlayer
                          videoUrl={effectiveVideoUrl}
                          title={product.name}
                          fallbackImage={product.image}
                          autoPlay={true}
                        />
                      ) : (
                        <div className="relative w-[90%] h-[90%]">
                          {/* Fast Smooth Shimmer */}
                          {!mainImageLoaded && (
                            <div className="absolute inset-0 z-0 flex items-center justify-center bg-muted/30 animate-pulse rounded-3xl" />
                          )}
                          {activeImage && (
                            <Image
                              src={activeImage}
                              alt={product.name}
                              fill
                              priority
                              quality={60}
                              sizes="(max-width: 768px) 100vw, 600px"
                              className={`object-contain filter drop-shadow-2xl group-hover:scale-102 transition-all duration-500 pointer-events-none z-10 ${
                                mainImageLoaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"
                              }`}
                              onLoad={() => setMainImageLoaded(true)}
                              onError={(e) => { 
                                (e.currentTarget as HTMLImageElement).style.opacity = "0"; 
                                setMainImageLoaded(true);
                              }}
                            />
                          )}
                        </div>
                      )}

                      {product.tag && activeMediaType === "image" && (
                        <div className="absolute top-4 left-4 bg-primary text-white text-[10px] sm:text-xs font-black tracking-widest uppercase px-3.5 py-1 rounded-full shadow-md z-10">
                          {product.tag}
                        </div>
                      )}
                    </div>

                    {/* Thumbnails Carousel */}
                    {((product.images && product.images.length > 1) || effectiveVideoUrl) && (
                      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
                        {product.images?.map((img, idx) => (
                          <button
                            key={`img-${idx}`}
                            onClick={() => {
                              setActiveMediaType("image");
                              setActiveImage(img);
                            }}
                            aria-label={`View ${product.name} photo ${idx + 1}`}
                            className={`h-20 w-20 rounded-2xl border-2 overflow-hidden bg-card p-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 cursor-pointer ${
                              activeMediaType === "image" && activeImage === img
                                ? "border-primary ring-2 ring-primary/30 shadow-md scale-105"
                                : "border-border/60 hover:border-primary/50 opacity-80 hover:opacity-100"
                            }`}
                          >
                            <div className="relative w-full h-full">
                              <Image
                                src={img}
                                alt={`${product.name} thumb ${idx + 1}`}
                                fill
                                sizes="80px"
                                className="object-contain"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }}
                              />
                            </div>
                          </button>
                        ))}

                        {/* Video Thumbnail */}
                        {effectiveVideoUrl && (
                          <button
                            key="thumb-video"
                            onClick={() => setActiveMediaType("video")}
                            aria-label={`Watch video of ${product.name}`}
                            className={`relative h-20 w-20 rounded-2xl border-2 overflow-hidden bg-card p-1 flex items-center justify-center flex-shrink-0 transition-all duration-300 cursor-pointer group ${
                              activeMediaType === "video"
                                ? "border-primary ring-2 ring-primary/30 shadow-md scale-105"
                                : "border-border/60 hover:border-primary/50 opacity-80 hover:opacity-100"
                            }`}
                          >
                            <div className="relative w-full h-full">
                              {videoThumbSrc && (
                                <Image
                                  src={videoThumbSrc}
                                  alt={`${product.name} video thumbnail`}
                                  fill
                                  sizes="80px"
                                  className="object-cover rounded-xl filter brightness-90 group-hover:brightness-100"
                                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }}
                                />
                              )}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/35 group-hover:bg-black/20 transition-colors">
                              <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform ring-2 ring-white/40">
                                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                              </div>
                            </div>
                            <span className="absolute bottom-1 right-1 bg-black/85 text-[8px] font-bold text-white px-1 py-0.5 rounded leading-none">
                              VIDEO
                            </span>
                          </button>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Right Column: Product Info & Actions */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.15em] text-primary uppercase bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                  {product.section || product.category}
                </span>

                {/<h1[^>]*>/i.test(product.descriptionHtml || "") ? (
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-black text-foreground mt-1.5 leading-tight tracking-tight">
                    {product.name}
                  </h2>
                ) : (
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-black text-foreground mt-1.5 leading-tight tracking-tight">
                    {product.name}
                  </h1>
                )}

                {/* Compact Rating & In-Stock & Social Share Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-2.5 pb-3 border-b border-border/40">
                  <div className="flex items-center gap-2.5">
                    {flag("showRating") && (
                      <a
                        href="#customer-reviews-section"
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById("customer-reviews-section")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer group"
                      >
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${i < Math.floor(product.rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/30"
                                }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-black text-foreground">{product.rating}</span>
                        <span className="text-[11px] text-muted-foreground font-normal group-hover:text-primary transition-colors underline decoration-dotted decoration-muted-foreground/40 underline-offset-2">
                          {text("reviewCountTemplate", "({count} reviews)")
                            .split("{count}")
                            .join(String(product.reviews))}
                        </span>
                      </a>
                    )}
                    {product.isSoldOut ? (
                      <span className="inline-flex items-center gap-1 bg-muted border border-border/60 text-muted-foreground text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        {text("soldOutLabel", "Sold Out")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {text("inStockLabel", "In Stock")}
                      </span>
                    )}
                  </div>

                  {/* Compact Social Share Buttons */}
                  {flag("showShareBar") && (
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="font-bold tracking-wider text-muted-foreground uppercase mr-0.5">
                      {text("shareLabel", "SHARE:")}
                    </span>

                    <button
                      onClick={handleFacebookShare}
                      className="p-1.5 rounded-lg bg-card border border-border/60 text-foreground hover:text-blue-600 hover:border-blue-600/40 transition-all cursor-pointer shadow-2xs"
                      title="Share on Facebook"
                    >
                      <svg className="w-3 h-3 fill-current text-blue-600" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </button>

                    <button
                      onClick={handleTwitterShare}
                      className="p-1.5 rounded-lg bg-card border border-border/60 text-foreground hover:text-sky-500 hover:border-sky-500/40 transition-all cursor-pointer shadow-2xs"
                      title="Share on Twitter"
                    >
                      <svg className="w-3 h-3 fill-current text-sky-500" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </button>

                    <button
                      onClick={handleWhatsAppShare}
                      className="p-1.5 rounded-lg bg-card border border-border/60 text-foreground hover:text-emerald-500 hover:border-emerald-500/40 transition-all cursor-pointer shadow-2xs"
                      title="Share on WhatsApp"
                    >
                      <MessageCircle className="h-3 w-3 text-emerald-500" />
                    </button>

                    <button
                      onClick={async () => {
                        const shared = await handleNativeShare();
                        if (!shared) {
                          handleCopyLink();
                          window.open("https://www.instagram.com/direct/inbox/", "_blank");
                        }
                      }}
                      className="p-1.5 rounded-lg bg-card border border-border/60 text-foreground hover:text-pink-500 hover:border-pink-500/40 transition-all cursor-pointer shadow-2xs"
                      title="Share on Instagram (Copies product link to clipboard)"
                    >
                      <svg className="w-3 h-3 fill-current text-pink-500" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </button>

                    <button
                      onClick={handleCopyLink}
                      className="px-2 py-1 rounded-lg bg-card border border-border/60 text-foreground hover:text-primary hover:border-primary/40 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-semibold shadow-2xs"
                      title="Copy Product Link"
                    >
                      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      <span>{copied ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>
                  )}
                </div>
              </div>

              {/* Compact Clean Pricing Row */}
              <div className="flex items-center justify-between gap-4 py-2 border-b border-border/40">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    {text("priceLabel", "PRICE:")}
                  </span>
                  <span className="text-2xl sm:text-3xl font-serif font-black text-primary tracking-tight">
                    Dhs. {selectedVariant ? selectedVariant.price.toLocaleString() : product.price.toLocaleString()}
                  </span>
                  {isSale && selectedVariant && selectedVariant.compareAtPrice && (
                    <span className="text-xs sm:text-sm text-muted-foreground line-through font-semibold">
                      Dhs. {selectedVariant.compareAtPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {isSale && discountPercent > 0 && text("saveBadgeTemplate", "Save {percent}%") && (
                  <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    {text("saveBadgeTemplate", "Save {percent}%")
                      .split("{percent}")
                      .join(String(discountPercent))}
                  </span>
                )}
              </div>

              {/* Two-Column Key Specifications Card */}
              {(() => {
                const metaobjectSpecs = Array.isArray(product.specsTable) && product.specsTable.length > 0
                  ? product.specsTable.map((s: any) => ({
                      label: s.label || s.feature || s.key || "",
                      value: s.value || s.details || "",
                    })).filter((r: any) => r.label && r.value)
                  : null;

                const customSpecs =
                  metaobjectSpecs && metaobjectSpecs.length > 0
                    ? metaobjectSpecs
                    : product.keySpecifications;
                const hasCustomSpecs = Array.isArray(customSpecs) && customSpecs.length > 0;
                const autoSpecs = getAccurateProductSpecs({
                  name: product.name,
                  category: product.category,
                  brand: product.brand,
                  tags: (product as any).tags,
                  descriptionHtml: product.descriptionHtml,
                  puffs: product.puffs,
                  nicotine: product.nicotine,
                  battery: product.battery,
                });
                const displayRows = hasCustomSpecs
                  ? customSpecs
                  : (autoSpecs && autoSpecs.length > 0)
                  ? autoSpecs
                  : specCardRows
                      .map((row) => ({ label: row.label, value: specValue(row) }))
                      .filter((r) => r.label && r.value);

                if (!flag("showSpecCard") || displayRows.length === 0) return null;

                return (
                  <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
                    {text("specCardHeading", "Key Product Specifications") && (
                      <div className="flex items-center justify-between mb-3.5">
                        <h3 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {text("specCardHeading", "Key Product Specifications")}
                        </h3>
                        {displayRows.length > 4 && (
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            {displayRows.length} Specifications
                          </span>
                        )}
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                      {displayRows.map((row, idx) => {
                        const isLong = (row.label.length + row.value.length) > 38 || row.value.length > 28;
                        const isLastOdd = idx === displayRows.length - 1 && displayRows.length % 2 !== 0;
                        const spanFull = isLong || isLastOdd;

                        return (
                          <div
                            key={idx}
                            className={`flex items-start justify-between gap-3 border-b border-border/40 pb-2.5 ${
                              spanFull ? "sm:col-span-2" : ""
                            }`}
                          >
                            <span className="text-muted-foreground font-semibold shrink-0 pt-0.5 whitespace-nowrap">
                              {row.label}:
                            </span>
                            <span className="font-extrabold text-foreground text-right leading-snug break-words">
                              {row.value}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}


              {/* Dynamic Option Name */}
              {(() => {
                const optionName = product.options?.[0]?.name || "Flavor";
                return (
                  <>
                    {/* Single Line Grid Row: Select Flavor & Quantity Selector */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
                      {/* Flavor Selection Trigger (takes 8 cols) */}
                      {product.variants && product.variants.length > 1 ? (
                        <div className="sm:col-span-8 bg-card border border-border/80 rounded-2xl p-3.5 shadow-xs flex items-center justify-between gap-3 overflow-hidden">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                            <div className="text-left min-w-0">
                              <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground block leading-tight">
                                {`${optionName} Option:`}
                              </span>
                              <span className="text-xs sm:text-sm font-extrabold text-foreground truncate block mt-0.5">
                                {selectedVariant
                                  ? selectedVariant.title
                                  : `Select ${optionName}`}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsFlavorModalOpen(true)}
                            className="bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/25 text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 py-2 rounded-xl transition-all duration-300 shrink-0 shadow-2xs cursor-pointer flex items-center gap-1"
                          >
                            <span>{text("variantButtonLabel", "Select")}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : null}

                      {/* Quantity Selector (takes 4 cols if variants exist, 12 if not) */}
                      <div className={`${product.variants && product.variants.length > 1 ? "sm:col-span-4" : "sm:col-span-12"} bg-card border border-border/80 rounded-2xl p-3.5 shadow-xs flex items-center justify-between gap-2`}>
                        <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                          {text("quantityLabel", "Qty:")}
                        </span>
                        <div className="flex items-center border border-border rounded-xl bg-muted/30 overflow-hidden h-9">
                          <button
                            onClick={() => handleQuantityChange(quantity - 1)}
                            className="px-2.5 h-full hover:bg-muted transition-colors flex items-center justify-center cursor-pointer text-foreground font-bold"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-7 text-center text-xs font-black text-foreground">{quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(quantity + 1)}
                            className="px-2.5 h-full hover:bg-muted transition-colors flex items-center justify-center cursor-pointer text-foreground font-bold"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Total Calculated Price Banner */}
                    <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-4">
                      <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                        {text("totalPriceLabel", "Total Price:")}
                      </span>
                      <p className="text-2xl sm:text-3xl font-serif font-black text-primary">
                        Dhs. {((selectedVariant ? selectedVariant.price : product.price) * quantity).toLocaleString()}
                      </p>
                    </div>

                    {/* Luxury Action Buttons */}
                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <button
                          onClick={handleAddToCart}
                          disabled={!!product.isSoldOut || (selectedVariant !== null && !selectedVariant.availableForSale)}
                          className="bg-card hover:bg-primary/10 border-2 border-primary/60 text-foreground hover:text-primary font-black tracking-wider py-4 px-4 rounded-2xl text-xs sm:text-sm uppercase flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                          <ShoppingCart className="h-4.5 w-4.5 text-primary" />{" "}
                          {!selectedVariant
                            ? `Select ${optionName} First`
                            : text("addToCartLabel", "Add to Cart")}
                        </button>

                        <button
                          onClick={handleBuyNow}
                          disabled={!!product.isSoldOut || (selectedVariant !== null && !selectedVariant.availableForSale)}
                          className="bg-primary hover:bg-gold-shimmer text-white font-black tracking-wider py-4 px-4 rounded-2xl text-xs sm:text-sm uppercase flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-98 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                        >
                          <Truck className="h-4.5 w-4.5" />{" "}
                          {!selectedVariant
                            ? `Select ${optionName} First`
                            : text("buyNowLabel", "Buy It Now")}
                        </button>
                      </div>

                {/* Wishlist Toggle Button */}
                {flag("showWishlist") && (
                <button
                  type="button"
                  onClick={() => setIsWishlist(!isWishlist)}
                  className={`w-full py-3 px-4 rounded-2xl border text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${isWishlist
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
                    : "bg-card border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                >
                  <Heart className={`h-4 w-4 ${isWishlist ? "fill-rose-500 text-rose-500" : ""}`} />
                  <span>
                    {isWishlist
                      ? text("wishlistSavedLabel", "Saved in Wishlist")
                      : text("wishlistLabel", "Add to Wishlist")}
                  </span>
                </button>
                )}
              </div>
            </>
          );
        })()}

            </div>
          </div>
        </div>

        {/* Service Feature Cards Grid — merchant-defined */}
        {flag("showServiceCards") && serviceCards.length > 0 && (
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-1.5 sm:py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {serviceCards.map((card, idx) => {
                const Icon = resolveIcon(card.icon);
                return (
                  <div
                    key={idx}
                    className="bg-card border border-emerald-500/20 rounded-2xl p-5 shadow-xs flex items-center gap-4 hover:border-emerald-500/50 hover:bg-emerald-500/[0.02] hover:shadow-md hover:-translate-y-1 transition-all duration-300 group cursor-default"
                  >
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 flex-shrink-0 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-2xs">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-foreground group-hover:text-emerald-600 transition-colors">
                        {card.title}
                      </h4>
                      {card.subtitle && (
                        <p className="text-[11px] text-muted-foreground font-semibold mt-0.5 uppercase">
                          {card.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Product Tabs — labels, visibility and the shipping/returns copy all
            come from the template's Product Details section. */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-1.5 sm:py-2">
          <div className="bg-card border border-border/60 rounded-[2.5rem] p-6 sm:p-10 lg:p-12 shadow-sm relative overflow-hidden transition-all duration-300">
            {/* Top subtle brand accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

            {/* Tab Headers */}
            <div className="flex border-b border-border/40 gap-8 sm:gap-12 pb-4 overflow-x-auto">
              {([
                { key: "description" as const, label: text("descriptionTabLabel", "Product Description"), shown: true },
                { key: "video" as const, label: text("videoTabLabel", "Product Video"), shown: !!effectiveVideoUrl },
                { key: "shipping" as const, label: "Shipping & Return", shown: showShippingTab },
              ])
                .filter((tab) => tab.shown && tab.label)
                .map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`text-xs sm:text-sm font-bold uppercase tracking-wider pb-2 transition-all cursor-pointer relative whitespace-nowrap ${effectiveTab === tab.key || (tab.key === "shipping" && effectiveTab === "returns") ? "text-primary font-black" : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {tab.label}
                    {(effectiveTab === tab.key || (tab.key === "shipping" && effectiveTab === "returns")) && (
                      <div className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-primary" />
                    )}
                  </button>
                ))}
            </div>

            {/* Tab Contents */}
            <div className="mt-8">

              {effectiveTab === "description" && (
                <div className="product-description-content">
                  {product.shortDescription && (
                    <div
                      className="mb-8 font-medium text-foreground/90 text-sm border-l-2 border-primary pl-4 py-1"
                      dangerouslySetInnerHTML={{ __html: product.shortDescription }}
                    />
                  )}
                  {product.descriptionHtml && (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: product.descriptionHtml
                          .replace(/href="https?:\/\/(www\.)?(vapeuae\.shop|vapshopdubai\.ae|vapshop\.ae)?\/product\/([^"]+)"/gi, 'href="/products/$3"')
                          .replace(/href="\/product\/([^"]+)"/gi, 'href="/products/$1"'),
                      }}
                    />
                  )}
                </div>
              )}

              {effectiveTab === "video" && effectiveVideoUrl && (
                <div className="max-w-4xl mx-auto py-2 sm:py-4 px-2 sm:px-4">
                  {/* Eyebrow & Title & Subtitle matching reference mockup */}
                  <div className="text-center space-y-1.5 sm:space-y-2 mb-6 sm:mb-8">
                    <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-primary block">
                      Product Video
                    </span>
                    <h3 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                      Watch the product in action
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto font-medium leading-relaxed">
                      See how {product.name} looks, what&apos;s inside the box, and how to use it.
                    </p>
                  </div>

                  {/* Video Player Display Container matching reference mockup */}
                  <div className="w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-border/80 bg-black">
                    <ProductVideoPlayer
                      videoUrl={effectiveVideoUrl}
                      title={product.name}
                      fallbackImage={product.image}
                      autoPlay={false}
                    />
                  </div>
                </div>
              )}

              {(effectiveTab === "shipping" || effectiveTab === "returns") && (
                <div className="max-w-4xl space-y-6 text-sm text-foreground/90 leading-relaxed">
                  {(shippingBlocks.length > 0 && !shippingBlocks[0].title.includes("Express 2-Hour Delivery")
                    ? shippingBlocks
                    : [
                        {
                          title: "🚚 FREE DELIVERY AND MINIMUM ORDER",
                          body: "• Delivery country: We are able to deliver all over the UAE. Note: We are unable for international deliveries due to custom restrictions.\n• Minimum order: A minimum 85 AED required to place an order.\n• Free Delivery: Enjoy complimentary shipping for orders valued at AED 300 or more.\n• Delivery Charge: A delivery charge of AED 30 applies to orders below AED 300.",
                        },
                        {
                          title: "⚡ SHIPPING & DELIVERY IN DUBAI AND SHARJAH",
                          body: "• Same Day Delivery: Place your order before 9pm and we will deliver at your doorstep the same day.\n• Next Day Delivery: Place your order after 9pm and we will deliver it the next morning.\n• Operational Days: Our deliveries run 7 days a week.\n• Prompt Dispatch: We aim to dispatch your order by courier or private car the following business day. Unforeseen circumstances like severe weather or traffic might cause occasional delays.\n• Reception Of Package: We ship it without requiring signatures. Ensure someone is there to collect your parcel.\n• Our Responsibility: We take great care in shipping until you receive it & ensure you are satisfied with the product.\n• Pre-orders: For items on Pre-order you can contact us by email or WhatsApp. Also you can give us details on the order note.\n• Address Finality: Once placed, orders are shipped to the provided address. If you change location let us know by WhatsApp or Email. If a refund is necessary, the initial shipping fee will be excluded.\n• Payment & ID: Delivery will be handed over upon presenting your Emirates ID/Passport and clearing the invoice amount by Cash or Card Payment.\n• Age Restriction: Buyers must be 18 or older. Orders placed by minors will not be handed over or refunded.\n• Delivery Update: After placing an order, expect a confirmation email from info.vapeshopdubai@gmail.com",
                        },
                        {
                          title: "📦 OUTSIDE DUBAI AND SHARJAH",
                          body: "• 6 working day delivery (Sunday closed).\n• Any order placed after 2:00 PM will be delivered the next day.\n• Orders placed before 2 PM will be delivered same day.\n• Orders placed after 2 PM on Saturday will be delivered on Monday.\n• Cash on delivery only (card payment not acceptable).\n• Orders over 200 AED are free delivery.\n• Minimum order 85 AED required to place an order.\n• Orders under 200 AED: delivery charge is 30 AED.\n• Age Restriction: Buyers must be 18 or older. Orders placed by minors will not be handed over or refunded.",
                        },
                        {
                          title: "📍 OUTSIDE CITY AREA",
                          body: "• Delivery within 2 working days (Sunday closed).\n• Areas far from the city: 35 AED additional charge.\n• Orders over 200 AED: 35 AED delivery charge only.",
                        },
                      ]
                  ).map((block, idx) => (
                    <div key={`ship-${idx}`} className="border border-border/50 rounded-2xl p-6 bg-card space-y-3 shadow-xs hover:border-primary/30 transition-colors">
                      <h4 className="font-sans font-body font-extrabold text-base sm:text-lg text-primary tracking-tight">
                        {block.title}
                      </h4>
                      <p className="text-muted-foreground whitespace-pre-line leading-relaxed text-xs sm:text-sm font-medium">
                        {block.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Everything below the buy box is controlled by the product template
            in the theme customizer. Sections that need the live product are
            passed in as slots. */}
        <TemplateSections
          instances={effectiveTemplateInstances}
          isOverride={templateIsOverride}
          context={{
            handle: product.handle,
            productName: product.name,
            hasRelatedProducts: similarProducts.length > 0,
          }}
          containerClassName="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-1.5 sm:py-2"
          slots={{
            productMain: null,
            juulCrispMenthol: (settings: Record<string, unknown>) => {
              const hasFeature1 = Boolean(
                product.juulFeature1 &&
                (product.juulFeature1.title || product.juulFeature1.image || product.juulFeature1.description)
              );
              const hasFeature2 = Boolean(
                product.juulFeature2 &&
                (product.juulFeature2.title || product.juulFeature2.image || product.juulFeature2.description)
              );

              if (!hasFeature1 && !hasFeature2) {
                return null;
              }

              return (
                <div className="space-y-12 sm:space-y-16">
                  {hasFeature1 && <JuulCustomFeatureSection settings={product.juulFeature1} />}
                  {hasFeature2 && <JuulCustomFeatureSection settings={product.juulFeature2} reverseLayout />}
                </div>
              );
            },
            whyChooseProduct: (settings: Record<string, unknown>) => (
              <WhyChooseProductSection
                productName={product.name}
                puffs={product.puffs}
                productWhyChoose={product.whyChoose}
                settings={settings as never}
                hideIfEmpty={true}
              />
            ),
            productKeySpecs: (settings: Record<string, unknown>) => (
              <ProductKeySpecsSection
                productName={product.name}
                category={product.category}
                brand={product.brand}
                puffs={product.puffs}
                nicotine={product.nicotine}
                battery={product.battery}
                specsTable={
                  product.specsTable ||
                  (product.keySpecifications
                    ? product.keySpecifications.map((k) => ({
                        feature: k.label,
                        details: k.value,
                      }))
                    : undefined)
                }
                settings={settings as never}
                hideIfEmpty={true}
              />
            ),
            productFlavors: (settings: Record<string, unknown>) => (
              <ProductAvailableFlavorsSection
                variants={product.variants}
                productName={product.name}
                productCategory={product.category}
                selectedVariantId={selectedVariant?.id}
                productFlavorNotes={product.flavorNotes}
                onSelectVariant={(variant) => {
                  setSelectedVariant(variant);
                }}
                settings={settings as never}
                hideIfEmpty={true}
              />
            ),
            productFinalThoughts: (settings: Record<string, unknown>) => (
              <ProductFinalThoughtsSection
                productName={product.name}
                settings={settings as never}
                productFinalThoughts={product.finalThoughts}
                hideIfEmpty={true}
              />
            ),
            juulCollectionFeature1: () => null,
            juulCollectionFeature2: () => null,
            customerReviews: (settings: Record<string, unknown>) => (
              <CustomerReviewsSection
                productHandle={product.handle || handle}
                collectionName={product.name}
                productRating={product.rating}
                productReviewsCount={product.reviews}
                productReviewsList={product.reviewsList}
                settings={settings as never}
                hideIfEmpty={false}
              />
            ),
            faq: (settings: Record<string, unknown>) => (
              <FAQSection settings={settings as never} productFaqs={product.faqAccordion} hideIfEmpty={true} />
            ),
            relatedProducts: (settings: Record<string, unknown>) => (

          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3">
            <ProductSectionCarousel
              sectionName={String(settings.heading ?? "You May Also Like")}
              products={similarProducts}
              onAddToCart={(item) => {
                addToCart({
                  id: `${item.id}-${item.variantId || 'default'}`,
                  name: item.name,
                  price: item.price,
                  image: item.image,
                  category: item.category,
                  variantId: item.variantId || 'default',
                  handle: item.handle,
                }, 1);
              }}
              onBuyNow={(item) => {
                addToCart({
                  id: `${item.id}-${item.variantId || 'default'}`,
                  name: item.name,
                  price: item.price,
                  image: item.image,
                  category: item.category,
                  variantId: item.variantId || 'default',
                  handle: item.handle,
                }, 1);
                router.push("/checkout");
              }}
              onViewAll={
                settings.showViewAll === false
                  ? undefined
                  : () => {
                      router.push(`/collections/${product.category}`);
                    }
              }
            />
          </div>
            ),
          }}
        />

      </main>

      {/* Flavor / Variant Selection Popup Modal */}
      {isFlavorModalOpen && product?.variants && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border/80 rounded-[2.5rem] max-w-xl w-full p-6 sm:p-8 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col overflow-hidden">

            {/* Modal Top Header */}
            <div className="flex items-center justify-between border-b border-border/40 pb-4 shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                  {product.name}
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-black text-foreground mt-0.5">
                  {`Select ${product.options?.[0]?.name || "Flavor"} Option`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFlavorModalOpen(false)}
                className="w-9 h-9 rounded-full bg-muted/30 hover:bg-muted text-foreground flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Flavor Search Filter (If > 4 variants) */}
            {product.variants.length > 4 && (
              <div className="relative shrink-0">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Search ${product.options?.[0]?.name?.toLowerCase() || "flavor"} name...`}
                  value={flavorSearchQuery}
                  onChange={(e) => setFlavorSearchQuery(e.target.value)}
                  className="w-full bg-muted/20 border border-border/60 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>
            )}

            {/* Scrollable Flavors Grid List */}
            <div className="overflow-y-auto pr-1 space-y-2.5 flex-1 scrollbar-thin">
              {product.variants
                .filter((v) => v.title.toLowerCase().includes(flavorSearchQuery.toLowerCase()))
                .map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={!v.availableForSale}
                      onClick={() => {
                        if (v.availableForSale) {
                          setSelectedVariant(v);
                          setIsFlavorModalOpen(false);
                          setFlavorSearchQuery("");
                        }
                      }}
                      className={`w-full p-4 rounded-2xl border flex items-center justify-between text-left transition-all duration-200 cursor-pointer ${!v.availableForSale
                          ? "opacity-40 cursor-not-allowed bg-muted/10 border-border/40 line-through"
                          : isSelected
                            ? "bg-primary/10 border-2 border-primary shadow-md"
                            : "bg-background hover:bg-muted/30 border-border/60 hover:border-primary/40"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full shrink-0 ${v.availableForSale ? "bg-emerald-500" : "bg-zinc-400"}`} />
                        <div>
                          <h4 className="text-xs sm:text-sm font-extrabold text-foreground leading-tight">
                            {v.title}
                          </h4>
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            {v.availableForSale
                              ? text("variantInStockNote", "In Stock • Ready to ship")
                              : text("variantOutOfStockNote", "Currently Out of Stock")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-primary">
                          Dhs. {v.price}
                        </span>
                        {isSelected ? (
                          <span className="bg-primary text-white p-1 rounded-full shadow-xs">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-muted-foreground group-hover:text-primary">
                            {text("variantButtonLabel", "Select")}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>

          </div>
        </div>
      )}

      {/* Mobile Sticky Quick Action Bar (Visible only on mobile lg:hidden) */}
      {product && flag("showMobileBar") && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/80 p-3 px-4 flex items-center justify-between gap-3 shadow-2xl">
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground block truncate max-w-[120px]">
              {selectedVariant ? selectedVariant.title : text("totalPriceLabel", "Total Price:")}
            </span>
            <p className="text-lg font-serif font-black text-primary leading-tight">
              Dhs. {((selectedVariant ? selectedVariant.price : product.price) * quantity).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className="bg-primary text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-md shadow-primary/20 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>
                {!selectedVariant
                  ? `Select ${product.options?.[0]?.name || "Flavor"}`
                  : text("addToCartLabel", "Add to Cart")}
              </span>
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              className="bg-foreground text-background text-xs font-black uppercase tracking-wider px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-1 active:scale-95 transition-all"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{text("mobileBuyLabel", "Buy")}</span>
            </button>
          </div>
        </div>
      )}

      <CartDrawer />
      <Footer />
    </div>
  );
}
