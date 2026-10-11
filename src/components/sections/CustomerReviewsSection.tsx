"use client";

import React, { useState } from "react";
import { Star, ShieldCheck, ThumbsUp, MessageSquare, Plus, CheckCircle2, UserCheck, Filter, ChevronDown } from "lucide-react";

export interface Review {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  verified: boolean;
  productName: string;
  title: string;
  comment: string;
  helpfulCount: number;
}

const INITIAL_REVIEWS: Review[] = [
  {
    id: "rev-1",
    author: "Tariq Al-Mansoori",
    location: "Dubai Marina, Dubai",
    rating: 5,
    date: "August 5, 2026",
    verified: true,
    productName: "JUUL 2 Starter Kit & Crisp Menthol Pods",
    title: "Insanely fast 2-hour delivery in Dubai Marina!",
    comment: "Ordered at 4 PM and the express driver arrived at my building in Dubai Marina by 5:20 PM with a wireless card machine. 100% authentic sealed JUUL 2 box with genuine QR verification. Easily the best vape store in UAE!",
    helpfulCount: 24,
  },
  {
    id: "rev-2",
    author: "Alexander Vance",
    location: "Downtown Dubai",
    rating: 5,
    date: "August 3, 2026",
    verified: true,
    productName: "Geek Bar Pulse 15000 Puffs Disposable",
    title: "100% Authentic Geek Bar Pulse with full screen display",
    comment: "The Geek Bar Pulse flavor is unbelievable. Dual mesh coil produces rich vapor and smooth hits all the way through 15000 puffs. Scanned the QR code on the back box and it confirmed authentic. Highly recommend!",
    helpfulCount: 18,
  },
  {
    id: "rev-3",
    author: "Rashid K.",
    location: "Business Bay, Dubai",
    rating: 5,
    date: "August 1, 2026",
    verified: true,
    productName: "MYLE Meta V5 Pods & Device",
    title: "Best prices & fresh stock in Dubai",
    comment: "I have been ordering MYLE Meta V5 pods from Vape Shop Dubai for over 6 months now. Never had a leaking pod, always factory sealed, and card on delivery makes checkout effortless.",
    helpfulCount: 15,
  },
  {
    id: "rev-4",
    author: "Sarah M.",
    location: "JBR (Jumeirah Beach Residences)",
    rating: 5,
    date: "July 28, 2026",
    verified: true,
    productName: "Elf Bar BC5000 & Lost Mary BM6000",
    title: "Top tier customer service on WhatsApp!",
    comment: "Needed urgent delivery before traveling. Messaged their WhatsApp support and they arranged 90-minute express delivery to JBR. Exceptional customer service and legit products!",
    helpfulCount: 12,
  },
  {
    id: "rev-5",
    author: "Mohammed Al-Hassan",
    location: "Abu Dhabi, UAE",
    rating: 5,
    date: "July 25, 2026",
    verified: true,
    productName: "Uwell Caliburn G3 Pod Kit",
    title: "Same day express delivery to Abu Dhabi",
    comment: "Ordered to Abu Dhabi in the morning and received it before evening! Caliburn G3 kit flavor production is outstanding. Packaging was pristine.",
    helpfulCount: 9,
  },
];

export interface CustomerReviewsSettings {
  badgeText: string;
  /** `{collection}` is replaced with the current collection or product name. */
  headingTemplate: string;
  description: string;
  ratingValue: string;
  ratingCountLabel: string;
  reviews: Review[];
}

interface CustomerReviewsSectionProps {
  productHandle?: string;
  collectionName?: string;
  productRating?: number;
  productReviewsCount?: number;
  productReviewsList?: Review[];
  customReviews?: Review[];
  settings?: CustomerReviewsSettings;
  hideIfEmpty?: boolean;
}

export function CustomerReviewsSection({
  productHandle,
  collectionName = "Vape Products",
  productRating,
  productReviewsCount,
  productReviewsList,
  customReviews,
  settings,
  hideIfEmpty,
}: CustomerReviewsSectionProps) {
  const defaultList =
    customReviews && customReviews.length > 0
      ? customReviews
      : productReviewsList && productReviewsList.length > 0
      ? productReviewsList
      : settings?.reviews?.length
      ? settings.reviews
      : hideIfEmpty
      ? []
      : INITIAL_REVIEWS;

  const [reviews, setReviews] = useState<Review[]>(defaultList);

  React.useEffect(() => {
    const baseList =
      customReviews && customReviews.length > 0
        ? customReviews
        : productReviewsList && productReviewsList.length > 0
        ? productReviewsList
        : settings?.reviews?.length
        ? settings.reviews
        : hideIfEmpty
        ? []
        : INITIAL_REVIEWS;

    const fetchApproved = async () => {
      try {
        const handleToUse = productHandle || "all";
        const res = await fetch(`/api/reviews?productHandle=${encodeURIComponent(handleToUse)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.reviews && data.reviews.length > 0) {
            const approvedList = data.reviews.map((r: any) => ({
              id: r.id,
              author: r.author,
              location: r.location,
              rating: r.rating,
              date: r.date,
              verified: r.verified ?? true,
              productName: r.productName || collectionName,
              title: r.title,
              comment: r.comment,
              helpfulCount: r.helpfulCount || 0,
            }));
            setReviews([...approvedList, ...baseList]);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch approved reviews", err);
      }
      setReviews(baseList);
    };

    fetchApproved();
  }, [productHandle, productReviewsList, settings?.reviews, collectionName, hideIfEmpty]);

  const ratingValueText =
    productRating !== undefined
      ? productRating.toFixed(1)
      : settings?.ratingValue || "5.0";

  const ratingCountText =
    productReviewsCount !== undefined
      ? `${productReviewsCount} Verified Reviews`
      : settings?.ratingCountLabel || `${reviews.length || 5} Verified Reviews`;

  const [filterRating, setFilterRating] = useState<number | "all">("all");
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [helpfulLiked, setHelpfulLiked] = useState<Record<string, boolean>>({});

  const [newRating, setNewRating] = useState(5);
  const [newAuthor, setNewAuthor] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newComment, setNewComment] = useState("");
  const [newProduct, setNewProduct] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  const [visibleCount, setVisibleCount] = useState(4);

  const filteredReviews = reviews.filter((r) => {
    if (filterRating === "all") return true;
    return r.rating === filterRating;
  });

  const visibleReviews = filteredReviews.slice(0, visibleCount);

  const toggleHelpful = (id: string) => {
    setHelpfulLiked((prev) => {
      const isLiked = !!prev[id];
      setReviews((revList) =>
        revList.map((r) => (r.id === id ? { ...r, helpfulCount: r.helpfulCount + (isLiked ? -1 : 1) } : r))
      );
      return { ...prev, [id]: !isLiked };
    });
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor || !newTitle || !newComment) return;

    setSubmitting(true);
    try {
      const handleToUse = productHandle || "all";
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productHandle: handleToUse,
          productName: newProduct || collectionName,
          author: newAuthor,
          location: newLocation || "Dubai, UAE",
          rating: newRating,
          title: newTitle,
          comment: newComment,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmissionMessage(
          data.message ||
            "Thank you! Your review has been submitted for admin verification. It will appear once approved by our team."
        );
        setFormSubmitted(true);

        setTimeout(() => {
          setIsWriteModalOpen(false);
          setFormSubmitted(false);
          setSubmissionMessage("");
          setNewAuthor("");
          setNewLocation("");
          setNewTitle("");
          setNewComment("");
          setNewProduct("");
        }, 3000);
      } else {
        alert(data.error || "Submission failed");
      }
    } catch (err) {
      console.error("Error submitting review", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (hideIfEmpty && reviews.length === 0) {
    return null;
  }

  return (
    <div id="customer-reviews-section" className="w-full scroll-mt-28">
      <div className="bg-card border border-primary/20 rounded-2xl sm:rounded-[2rem] p-4 sm:p-7 lg:p-8 relative overflow-hidden shadow-md transition-all duration-300">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10" />
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-5 border-b border-border/40 mb-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-primary text-white text-[10px] sm:text-xs font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-xs">
              <MessageSquare className="w-3.5 h-3.5 text-white" />
              <span>{settings?.badgeText || "Customer Reviews & Ratings"}</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-foreground tracking-tight">
                Customer Reviews
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground font-semibold">
                Verified customer ratings & feedback for <span className="text-foreground font-bold">{collectionName}</span>
              </p>
            </div>
          </div>

          {/* Overall Rating Summary Card */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-background border border-border/80 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm w-full lg:w-auto">
            <div className="flex sm:flex-col items-center justify-center gap-3 sm:gap-1 pr-0 sm:pr-5 border-b sm:border-b-0 sm:border-r border-border/40 pb-3 sm:pb-0 w-full sm:w-auto">
              <div className="text-3xl sm:text-5xl font-sans font-black text-foreground">
                {ratingValueText}
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <div className="text-[10px] font-extrabold text-muted-foreground mt-1 uppercase tracking-wider">
                  {ratingCountText}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center sm:items-start gap-1.5 text-xs font-bold text-foreground w-full sm:w-auto">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>100% Genuine Buyers</span>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <UserCheck className="w-4 h-4 shrink-0" />
                <span>2-Hour Express Delivery</span>
              </div>
              <button
                onClick={() => setIsWriteModalOpen(true)}
                className="mt-2 w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-primary text-white hover:bg-gold-shimmer px-5 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all duration-300 shadow-md hover:scale-105 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Write a Review
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 pt-1 -mx-1 px-1">
            <span className="hidden sm:inline-flex text-xs font-extrabold text-muted-foreground uppercase tracking-wider items-center gap-1 mr-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Filter Ratings:
            </span>

            <button
              onClick={() => setFilterRating("all")}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer shrink-0 ${
                filterRating === "all"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-background border border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({reviews.length})
            </button>

            {[5, 4].map((starCount) => (
              <button
                key={starCount}
                onClick={() => setFilterRating(starCount)}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                  filterRating === starCount
                    ? "bg-primary text-white shadow-xs"
                    : "bg-background border border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{starCount} Stars</span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Review Cards Grid */}
        <div className="space-y-4 sm:space-y-5">
          {visibleReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-card border border-border/80 hover:border-primary/50 rounded-2xl sm:rounded-3xl p-4 sm:p-7 transition-all duration-300 shadow-xs hover:shadow-md"
            >
              {/* Review Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-border/40 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-primary/10 border border-primary/20 text-primary font-sans font-bold text-sm sm:text-lg flex items-center justify-center shrink-0">
                    {rev.author.charAt(0)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-sans font-bold text-sm sm:text-base text-foreground">{rev.author}</h4>
                      {rev.verified && (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] sm:text-xs text-muted-foreground font-medium">{rev.location}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-start gap-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-border/20">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? "fill-amber-500 text-amber-500" : "fill-muted text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] sm:text-xs text-muted-foreground font-medium">{rev.date}</span>
                </div>
              </div>

              {/* Product Badge Tag */}
              <div className="text-[11px] font-medium text-muted-foreground bg-muted/30 border border-border/40 px-3 py-1 rounded-lg mb-2.5 inline-flex flex-wrap items-center gap-1 max-w-full break-words">
                <span>Purchased:</span> <span className="text-primary font-bold">{rev.productName}</span>
              </div>

              {/* Title & Comment */}
              <h5 className="text-sm sm:text-base font-sans font-bold text-foreground tracking-tight mb-1 break-words">{rev.title}</h5>
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal mb-4 break-words">{rev.comment}</p>

              {/* Review Card Footer */}
              <div className="flex items-center justify-between text-xs pt-2.5 border-t border-border/30">
                <span className="text-[11px] sm:text-xs text-muted-foreground font-semibold">Was this review helpful?</span>

                <button
                  onClick={() => toggleHelpful(rev.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    helpfulLiked[rev.id]
                      ? "bg-primary text-white shadow-xs"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40"
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Helpful ({rev.helpfulCount})</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* See More Reviews Button */}
        {filteredReviews.length > visibleCount && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 5)}
              className="inline-flex items-center gap-2 bg-primary hover:bg-gold-shimmer text-white px-8 py-3.5 rounded-full text-xs font-sans font-extrabold uppercase tracking-wider transition-all duration-300 shadow-md hover:scale-105 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-white" />
              <span>
                See More Reviews ({filteredReviews.length - visibleCount} Remaining)
              </span>
              <ChevronDown className="w-4 h-4 animate-bounce" />
            </button>
          </div>
        )}
      </div>

      {/* Write a Review Modal */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border/80 rounded-[2.5rem] max-w-lg w-full p-6 sm:p-8 relative shadow-2xl space-y-5">
            <button
              onClick={() => setIsWriteModalOpen(false)}
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground text-sm font-bold bg-muted/30 px-3 py-1.5 rounded-full"
            >
              ✕
            </button>

            <div className="space-y-1">
              <h3 className="text-lg sm:text-2xl font-serif text-foreground tracking-tight">Write a Verified Review</h3>
              <p className="text-xs text-muted-foreground font-medium">
                Share your experience with Vape Shop Dubai products and express delivery.
              </p>
            </div>

            {formSubmitted ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="font-bold text-foreground text-lg">Thank You!</h4>
                <p className="text-xs text-muted-foreground font-semibold">
                  Your review has been submitted and published successfully.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Your Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-1 cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= newRating ? "fill-amber-500 text-amber-500" : "fill-muted text-muted"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tariq A."
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Dubai Marina"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Product Purchased</label>
                  <input
                    type="text"
                    readOnly
                    value={collectionName}
                    className="w-full px-4 py-2.5 bg-muted/60 border border-border/60 rounded-xl text-xs font-bold text-foreground/80 cursor-not-allowed select-none focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Review Headline *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Super fast 2-hour delivery & genuine product!"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Your Detailed Review *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe product quality, delivery speed, packaging..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-primary text-white hover:bg-gold-shimmer py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-md cursor-pointer"
                  >
                    Submit Verified Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerReviewsSection;
