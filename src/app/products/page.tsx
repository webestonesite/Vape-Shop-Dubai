"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/**
 * `/products` — the product template's preview URL.
 *
 * The customizer needs one address that renders *a* product page without
 * knowing any of the store's handles, since the default product template
 * applies to every product and is what a merchant edits first. This forwards
 * to the catalogue's first product, carrying the query string so the preview
 * flag survives the hop.
 *
 * Templates bound to a URL rule preview against a real matching handle
 * instead, chosen when the merchant creates them.
 */
export default function ProductIndexPage() {
  const router = useRouter();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function goToFirstProduct() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Could not load products");
        const products = await res.json();
        const handle = Array.isArray(products) ? products[0]?.handle : undefined;
        if (!handle) throw new Error("No products");
        if (cancelled) return;

        const query = window.location.search;
        router.replace(`/products/${handle}${query}`);
      } catch {
        if (!cancelled) setNotFound(true);
      }
    }

    goToFirstProduct();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (notFound) {
    return (
      <div className="relative flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center text-center px-4 py-20">
          <h2 className="text-3xl font-serif font-bold text-foreground">No Products Yet</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            There is nothing in the catalogue to show here. Add a product in Shopify and
            this page will follow through to it.
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

  // Mirrors the product page's own skeleton, so the hand-off doesn't flash a
  // different layout at the merchant.
  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 pt-[92px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          <div className="animate-pulse flex flex-col gap-4">
            <div className="bg-muted rounded-[2rem] aspect-square w-full" />
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-muted rounded-xl h-20 w-20 flex-shrink-0" />
              ))}
            </div>
          </div>
          <div className="animate-pulse flex flex-col gap-6">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-10 bg-muted rounded w-3/4" />
            <div className="h-6 bg-muted rounded w-1/2" />
            <div className="h-24 bg-muted rounded w-full" />
            <div className="h-12 bg-muted rounded w-full mt-auto" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
