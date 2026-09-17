"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown, CheckCircle2 } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
  category?: "delivery" | "authenticity" | "payment" | "products";
}

export interface FaqSettings {
  badgeText: string;
  heading: string;
  description: string;
  deliveryBadge: string;
  verifiedNote: string;
  items: FaqItem[];
}

const DEFAULT_FAQ_ITEMS: FaqItem[] = [
  {
    question: "How fast is vape delivery in Dubai and across the UAE?",
    answer:
      "We offer 2-Hour Express Delivery in Dubai for all orders placed before 10:00 PM. For Abu Dhabi, Sharjah, Ajman, RAK, Fujairah, and UAQ, we provide guaranteed same-day or next-day express delivery.",
    category: "delivery",
  },
  {
    question: "Are all vapes, pods, and devices 100% authentic?",
    answer:
      "Yes, 100%! All devices, disposable vapes, pods, and e-liquids sold at Vape Shop Dubai are directly imported from certified manufacturers and authorized regional distributors. Every product features a security seal and scannable QR verification code.",
    category: "authenticity",
  },
  {
    question: "Can I pay by card when the delivery driver arrives?",
    answer:
      "Yes! We support Cash on Delivery (COD) as well as Card Machine on Delivery. Our delivery riders carry mobile wireless card terminals accepting Visa, Mastercard, Apple Pay, and contactless payments.",
    category: "payment",
  },
  {
    question: "What is the legal age to buy vape products in Dubai?",
    answer:
      "In accordance with UAE federal regulations, you must be at least 18 years of age or older to purchase electronic cigarettes, nicotine pods, or vaping accessories.",
    category: "authenticity",
  },
];

export function FAQSection({ settings, productFaqs, collectionFaqs, hideIfEmpty }: { settings?: FaqSettings; productFaqs?: FaqItem[]; collectionFaqs?: FaqSettings; hideIfEmpty?: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First open by default

  // Collection metafield overrides for header text
  const badgeText = collectionFaqs?.badgeText || settings?.badgeText || "Customer Help & FAQs";
  const heading = collectionFaqs?.heading || settings?.heading || "Frequently Asked Questions";
  const description =
    collectionFaqs?.description ||
    settings?.description ||
    "Find instant answers regarding 2-hour express delivery in Dubai, product authenticity, card payments on delivery, and vape device selection.";
  const deliveryBadge = settings?.deliveryBadge || "2-Hour Delivery";
  const verifiedNote = collectionFaqs?.verifiedNote || settings?.verifiedNote || "Verified Answer for Dubai & UAE Customers";

  // Priority: productFaqs → collectionFaqs.items → (if hideIfEmpty, stop here and return null) → settings.items → defaults
  let faqs: FaqItem[] = [];
  if (productFaqs && productFaqs.length > 0) {
    faqs = productFaqs;
  } else if (collectionFaqs?.items && collectionFaqs.items.length > 0) {
    faqs = collectionFaqs.items;
  } else if (hideIfEmpty) {
    return null;
  } else if (settings?.items && settings.items.length > 0) {
    faqs = settings.items;
  } else {
    faqs = DEFAULT_FAQ_ITEMS;
  }

  if (faqs.length === 0) {
    return null;
  }

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full">
      <div className="w-full bg-card border border-primary/20 rounded-[2rem] p-5 sm:p-7 lg:p-8 relative overflow-hidden shadow-md transition-all duration-300">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10" />
        {/* Section Header */}
        <div className="flex flex-col items-center text-center border-b border-border/40 pb-5 mb-6 relative">
          {/* Centered Title & Badge */}
          <div className="text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] px-3.5 py-1 rounded-full mb-3">
              <HelpCircle className="w-3.5 h-3.5 text-primary" />
              <span>{badgeText}</span>
            </div>

            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-foreground tracking-tight leading-snug">
              {heading}
            </h3>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mt-3 max-w-xl">
              {description}
            </p>

            {/* Premium Centered Line Divider */}
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="h-[1px] w-10 bg-gradient-to-r from-transparent to-primary/65" />
              <div className="w-1.5 h-1.5 rotate-45 border border-primary/40 bg-primary/10" />
              <div className="h-[1px] w-10 bg-gradient-to-l from-transparent to-primary/65" />
            </div>
          </div>
        </div>

      {/* Accordion FAQ List */}
      {faqs.length > 0 && (
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "bg-card border-primary/40 shadow-md shadow-primary/5"
                    : "bg-card/70 border-border/60 hover:border-border"
                }`}
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-base sm:text-lg font-semibold text-foreground leading-snug">
                    {faq.question}
                  </span>

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? "bg-primary text-white rotate-180" : "bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 sm:px-8 sm:pb-7 pt-0 border-t border-border/30">
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pt-4 font-medium">
                      {faq.answer}
                    </p>

                    {verifiedNote && (
                      <div className="mt-4 flex items-center gap-2 text-xs font-bold text-primary">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>{verifiedNote}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  </section>
  );
}
