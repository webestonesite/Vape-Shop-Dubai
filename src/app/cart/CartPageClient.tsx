"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { Product } from "@/components/sections/ProductFeed";
import { ProductSectionCarousel } from "@/components/sections/ProductSectionCarousel";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  MessageCircle,
  ChevronRight,
  ArrowLeft,
  CreditCard,
  Tag,
  Clock,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";

interface CartPageClientProps {
  recommendedProducts?: Product[];
}

const FREE_SHIPPING_THRESHOLD = 150; // 150 AED for free express delivery in Dubai / UAE
const STANDARD_SHIPPING_FEE = 25; // 25 AED standard shipping below threshold

// Valid promo codes for interactive UAE shopping experience
const VALID_PROMO_CODES: Record<string, number> = {
  WELCOME10: 0.1, // 10% off
  VIP5: 0.05, // 5% off
  DUBAI10: 0.1, // 10% off
  SAVE15: 0.15, // 15% off
};

export default function CartPageClient({ recommendedProducts = [] }: CartPageClientProps) {
  const router = useRouter();
  const { cart, cartTotal, updateQuantity, removeFromCart, clearCart, addToCart } = useCart();
  const [mounted, setMounted] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  // Discount code state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [couponFeedback, setCouponFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    const savedNote = localStorage.getItem("vapeshope_order_note");
    if (savedNote) setOrderNote(savedNote);

    const savedCoupon = localStorage.getItem("vapeshope_coupon");
    if (savedCoupon && VALID_PROMO_CODES[savedCoupon.toUpperCase()]) {
      const code = savedCoupon.toUpperCase();
      setAppliedCoupon(code);
      setDiscountPercent(VALID_PROMO_CODES[code]);
    }
  }, []);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setOrderNote(val);
    localStorage.setItem("vapeshope_order_note", val);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponInput.trim().toUpperCase();
    if (!cleanCode) return;

    if (VALID_PROMO_CODES[cleanCode]) {
      const rate = VALID_PROMO_CODES[cleanCode];
      setAppliedCoupon(cleanCode);
      setDiscountPercent(rate);
      setCouponFeedback({
        type: "success",
        message: `Promo code "${cleanCode}" applied (${Math.round(rate * 100)}% OFF)!`,
      });
      localStorage.setItem("vapeshope_coupon", cleanCode);
      setCouponInput("");
    } else {
      setCouponFeedback({
        type: "error",
        message: "Invalid promo code. Try WELCOME10 for 10% off.",
      });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountPercent(0);
    setCouponFeedback(null);
    localStorage.removeItem("vapeshope_coupon");
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      variantId: product.variantId,
      handle: product.handle,
    });
  };

  const handleBuyNow = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      variantId: product.variantId,
      handle: product.handle,
    });
    router.push("/checkout");
  };

  // Calculations
  const discountAmount = Math.round(cartTotal * discountPercent);
  const discountedSubtotal = Math.max(0, cartTotal - discountAmount);
  const isFreeShipping = cartTotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = cart.length === 0 ? 0 : isFreeShipping ? 0 : STANDARD_SHIPPING_FEE;
  const grandTotal = discountedSubtotal + shippingFee;
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);
  const progressPercentage = Math.min(
    100,
    Math.round((cartTotal / FREE_SHIPPING_THRESHOLD) * 100)
  );

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;
    const phone = "+971500000000";
    let message = "Hello Vape Shop Dubai, I would like to order from my cart:\n\n";

    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}* (Qty: ${item.quantity}) - Dhs. ${item.price * item.quantity}\n`;
    });

    if (appliedCoupon) {
      message += `\n*Applied Coupon:* ${appliedCoupon} (-Dhs. ${discountAmount})`;
    }

    if (orderNote.trim()) {
      message += `\n*Delivery Instructions:* ${orderNote.trim()}\n`;
    }

    message += `\n*Subtotal:* Dhs. ${cartTotal}`;
    message += `\n*Shipping:* ${isFreeShipping ? "FREE Express Delivery" : "Dhs. 25 Standard Delivery"}`;
    message += `\n*Total Order Value:* Dhs. ${grandTotal}`;
    message += `\n*Payment Mode:* Cash / Card Machine on Delivery`;
    message += `\n\nPlease confirm my delivery schedule in Dubai.`;

    const encodedText = encodeURIComponent(message);
    window.open(`https://wa.me/${phone.replace("+", "")}?text=${encodedText}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-background text-foreground flex flex-col antialiased">
      <Navbar />

      <main
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 pb-16"
        suppressHydrationWarning
      >
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
          <span className="text-foreground font-semibold">Shopping Cart</span>
        </nav>

        {!mounted ? (
          // Skeleton Loader while hydration completes
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <p className="text-sm font-bold text-muted-foreground">Loading your cart...</p>
          </div>
        ) : cart.length === 0 ? (
          // Empty Cart State
          <div className="bg-card border border-border/80 rounded-3xl p-8 sm:p-14 text-center max-w-2xl mx-auto shadow-sm my-8">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <ShoppingBag className="w-10 h-10" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-black text-foreground mb-2">
              Your Cart is Currently Empty
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">
              Explore our best-selling disposable vapes, premium pod systems, and authentic e-juices with same-day express UAE delivery.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/collections/disposable-vape"
                className="bg-primary hover:bg-gold-shimmer text-white text-xs font-black uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-md transition-all active:scale-95"
              >
                Shop Disposable Vapes
              </Link>
              <Link
                href="/collections/juul-vape-dubai"
                className="bg-card hover:bg-muted border border-border text-foreground text-xs font-black uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all"
              >
                Explore JUUL Series
              </Link>
              <Link
                href="/collections/all"
                className="bg-card hover:bg-muted border border-border text-foreground text-xs font-black uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all"
              >
                Browse All Products
              </Link>
            </div>
          </div>
        ) : (
          // Active Luxury Cart Experience
          <div className="space-y-6">
            {/* Top Bar: Floating Continue Shopping Pill + Cart Count + Clear Cart Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
              <div className="flex items-center gap-3">
                <Link
                  href="/collections/all"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card hover:bg-muted/80 border border-border/80 text-foreground text-xs font-bold shadow-2xs hover:shadow-xs transition-all group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-muted-foreground group-hover:-translate-x-0.5 transition-transform" />
                  <span>Continue shopping</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>

                <span className="hidden sm:inline-block text-xs font-semibold text-muted-foreground">
                  • {cart.reduce((sum, item) => sum + item.quantity, 0)} items in cart
                </span>
              </div>

              <button
                type="button"
                onClick={clearCart}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-red-600 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Cart</span>
              </button>
            </div>

            {/* Free Shipping Progress Meter Banner */}
            <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="flex items-center gap-2 text-foreground">
                  <Truck className="w-4 h-4 text-primary shrink-0" />
                  {isFreeShipping ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      Congratulations! You unlocked FREE Express Delivery across Dubai & UAE!
                    </span>
                  ) : (
                    <span>
                      Add{" "}
                      <strong className="text-primary font-black">
                        Dhs. {amountNeededForFreeShipping}
                      </strong>{" "}
                      more to qualify for <strong className="text-foreground">FREE Express Delivery</strong>!
                    </span>
                  )}
                </span>
                <span className="text-muted-foreground font-mono text-[11px]">
                  {progressPercentage}%
                </span>
              </div>

              <div className="w-full bg-muted/40 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isFreeShipping
                      ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                      : "bg-primary shadow-[0_0_8px_rgba(217,119,6,0.4)]"
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* 3-Column Luxury Architecture:
                - Left (3 Cols on Desktop): 4 Stacked Trust/Perk Feature Cards (Inspired by vpdubaiking.ae)
                - Center (5 Cols on Desktop): Individual Cart Items Cards
                - Right (4 Cols on Desktop): Sticky Order Summary with Coupon Code Input & CTAs
            */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: 4 Delivery & Trust Feature Cards (Visible on Desktop) */}
              <div className="hidden lg:block lg:col-span-3 space-y-3">
                {/* Perk 1: Free Shipping */}
                <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-foreground uppercase tracking-wide">
                      Free Shipping
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                      ON ALL ORDERS ABOVE {FREE_SHIPPING_THRESHOLD} AED
                    </p>
                  </div>
                </div>

                {/* Perk 2: Fast Delivery */}
                <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-foreground uppercase tracking-wide">
                      Fast 2-3H Delivery
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                      DELIVERY INSIDE DUBAI WITHIN 3 HOURS
                    </p>
                  </div>
                </div>

                {/* Perk 3: Authentic Guarantee */}
                <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-foreground uppercase tracking-wide">
                      100% Genuine Vape
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                      FACTORY SEALED AUTHENTIC GUARANTEE
                    </p>
                  </div>
                </div>

                {/* Perk 4: Payment on Delivery */}
                <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-foreground uppercase tracking-wide">
                      Cash / Card on Delivery
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                      PAY CONVENIENTLY AT YOUR DOORSTEP
                    </p>
                  </div>
                </div>
              </div>

              {/* Center Column: Individual Modern Cart Items (5 Cols on Desktop) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="space-y-3.5">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-primary/40 transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        {/* Thumbnail */}
                        <Link
                          href={item.handle ? `/products/${item.handle}` : "#"}
                          className="w-20 h-20 sm:w-24 sm:h-24 bg-muted/20 border border-border/60 rounded-xl flex items-center justify-center p-2 shrink-0 overflow-hidden group-hover:border-primary/30 transition-colors"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.opacity = "0";
                            }}
                          />
                        </Link>

                        {/* Title, Category & Price Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                              {item.category || "Vape"}
                            </span>
                            <span className="font-serif font-black text-base sm:text-lg text-primary shrink-0">
                              Dhs. {item.price * item.quantity}
                            </span>
                          </div>

                          <Link
                            href={item.handle ? `/products/${item.handle}` : "#"}
                            className="text-xs sm:text-sm font-extrabold text-foreground hover:text-primary transition-colors block line-clamp-2 leading-snug mt-1"
                          >
                            {item.name}
                          </Link>

                          {/* Unit price tag pill */}
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted/50 border border-border/40 text-[10px] font-semibold text-muted-foreground">
                            <span>Unit Price:</span>
                            <strong className="text-foreground font-bold">Dhs. {item.price}</strong>
                          </div>

                          {/* Bottom Row: Stepper & Red Remove Button */}
                          <div className="flex items-center justify-between gap-3 pt-3.5 mt-3 border-t border-border/40">
                            {/* Stepper */}
                            <div className="inline-flex items-center border border-border/80 rounded-xl bg-muted/20 overflow-hidden h-8 sm:h-9 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="px-2.5 sm:px-3 h-full hover:bg-muted text-foreground transition-colors flex items-center justify-center cursor-pointer active:scale-95"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 sm:w-9 text-center text-xs font-black text-foreground">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-2.5 sm:px-3 h-full hover:bg-muted text-foreground transition-colors flex items-center justify-center cursor-pointer active:scale-95"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Red Remove Action */}
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Note / Special Courier Instructions */}
                <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setIsNoteOpen(!isNoteOpen)}
                    className="w-full flex items-center justify-between text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    <span>+ Add Delivery Instructions / Courier Note</span>
                    <span className="text-[11px] text-muted-foreground font-semibold">
                      {isNoteOpen ? "Close" : "Open"}
                    </span>
                  </button>

                  {isNoteOpen && (
                    <div className="pt-3 mt-2 border-t border-border/40 space-y-2 animate-in fade-in duration-200">
                      <textarea
                        rows={3}
                        value={orderNote}
                        onChange={handleNoteChange}
                        placeholder="e.g. Call before arrival, leave with security/reception, villa gate code..."
                        className="w-full bg-muted/20 border border-border/60 rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Order Summary with Coupon Code Input (4 Cols on Desktop, Sticky) */}
              <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-4">
                <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
                  <h2 className="text-xl font-serif font-black text-foreground border-b border-border/40 pb-3">
                    Order Summary
                  </h2>

                  {/* Calculations breakdown */}
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground font-medium">
                      <span>Items Subtotal</span>
                      <span className="text-foreground font-bold">Dhs. {cartTotal}</span>
                    </div>

                    {/* Applied Coupon line */}
                    {appliedCoupon && (
                      <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5" />
                          <span>Coupon ({appliedCoupon})</span>
                        </span>
                        <span>- Dhs. {discountAmount}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-muted-foreground font-medium">
                      <span>Express Shipping (UAE)</span>
                      <span>
                        {isFreeShipping ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold uppercase text-[11px]">
                            FREE
                          </span>
                        ) : (
                          <span className="text-foreground font-bold">Dhs. {STANDARD_SHIPPING_FEE}</span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground font-medium">
                      <span>Estimated VAT (5%)</span>
                      <span className="text-foreground font-bold">Included</span>
                    </div>

                    <div className="border-t border-border/60 pt-3 flex items-center justify-between text-base font-black text-foreground">
                      <span>Estimated Total</span>
                      <span className="text-2xl font-serif font-black text-primary">
                        Dhs. {grandTotal}
                      </span>
                    </div>
                  </div>

                  {/* Discount / Coupon Code Input Section (Inspired by vpdubaiking.ae) */}
                  <div className="border-t border-border/40 pt-4 space-y-2.5">
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          placeholder="Discount code"
                          className="w-full bg-muted/20 border border-border/60 rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary uppercase font-bold"
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-primary hover:bg-gold-shimmer text-white text-xs font-black uppercase px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                      >
                        Apply
                      </button>
                    </form>

                    {couponFeedback && (
                      <div
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center justify-between ${
                          couponFeedback.type === "success"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                        }`}
                      >
                        <span>{couponFeedback.message}</span>
                        {appliedCoupon && (
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="text-[10px] underline ml-2 hover:opacity-80 cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Primary & Secondary Action CTAs */}
                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      onClick={() => router.push("/checkout")}
                      className="w-full bg-primary hover:bg-gold-shimmer text-white py-4 px-6 rounded-2xl font-black uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-98 cursor-pointer"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleWhatsAppCheckout}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 px-6 rounded-2xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>Order on WhatsApp</span>
                    </button>
                  </div>

                  {/* Bottom Security Directives */}
                  <div className="border-t border-border/40 pt-4 space-y-2 text-[11px] text-muted-foreground font-medium">
                    <div className="flex items-center gap-2 text-foreground/80">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>100% Authentic Product Guarantee</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground/80">
                      <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Delivery in 2-3 Hours inside Dubai</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground/80">
                      <CreditCard className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Cash or Card Machine on Delivery</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Perks Grid: Displayed on mobile below the order summary */}
              <div className="lg:hidden col-span-1 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-foreground uppercase">Free Shipping</h3>
                    <p className="text-[10px] text-muted-foreground font-semibold">Orders over {FREE_SHIPPING_THRESHOLD} AED</p>
                  </div>
                </div>

                <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-foreground uppercase">Fast 2-3h Delivery</h3>
                    <p className="text-[10px] text-muted-foreground font-semibold">Across Dubai today</p>
                  </div>
                </div>

                <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-foreground uppercase">100% Authentic</h3>
                    <p className="text-[10px] text-muted-foreground font-semibold">Original sealed stock</p>
                  </div>
                </div>

                <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-foreground uppercase">Cash / Card on Delivery</h3>
                    <p className="text-[10px] text-muted-foreground font-semibold">Pay at your doorstep</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cross-Sell Recommendations Carousel ("You May Also Like") */}
        {mounted && cart.length > 0 && recommendedProducts && recommendedProducts.length > 0 && (
          <div className="border-t border-border/60 pt-10 sm:pt-14 mt-12">
            <ProductSectionCarousel
              sectionName="You May Also Like"
              products={recommendedProducts}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />
          </div>
        )}
      </main>

      <CartDrawer />
      <Footer />
    </div>
  );
}
