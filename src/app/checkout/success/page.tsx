"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle2, ShoppingBag, Truck, Calendar, PhoneCall, Loader2 } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderName = searchParams?.get("order") || "#D-PENDING";

  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full bg-card border border-border/40 rounded-[2.5rem] p-8 sm:p-12 text-center shadow-lg relative overflow-hidden">
          {/* Top glow decoration */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-orange-500 to-primary" />
          
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <span className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase bg-primary/5 border border-primary/20 px-3 py-1 rounded-full">
            Order Confirmed
          </span>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mt-4 leading-tight">
            Thank you for your order!
          </h1>
          
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            We have received your order details and are processing them now.
          </p>

          {/* Reference badge */}
          <div className="my-8 bg-muted/20 border border-border/30 rounded-2xl p-4 max-w-xs mx-auto">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Order Reference</p>
            <p className="text-lg font-mono font-bold text-primary mt-1">{orderName}</p>
          </div>

          {/* Timeline steps */}
          <div className="space-y-4 text-left max-w-md mx-auto py-4 border-t border-border/40">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center">
                <PhoneCall className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">1. WhatsApp or Call Confirmation</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">Our representative will call or text you shortly on the provided number to confirm your delivery address.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center">
                <Truck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">2. Lightning Fast Delivery</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">Once confirmed, delivery takes within 3 hours in Dubai and same-day across other UAE emirates.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">3. Pay on Delivery</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">Pay conveniently in Cash, via Credit Card, or Online Link Payment when our delivery rider arrives with your package.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://wa.me/971582839787?text=${encodeURIComponent(`Hello Vape Shop Dubai! I just placed order ${orderName} on the website. Please confirm delivery.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold px-8 py-3.5 rounded-full hover:opacity-90 transition-all text-xs uppercase tracking-wider shadow cursor-pointer"
            >
              <PhoneCall className="h-4 w-4" /> Send Order to WhatsApp (+971 58 283 9787)
            </a>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-orange-500 text-white font-bold px-8 py-3.5 rounded-full hover:brightness-105 transition-all text-xs uppercase tracking-wider shadow"
            >
              <ShoppingBag className="h-4 w-4" /> Return to Shop
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="relative flex flex-col min-h-screen bg-background text-foreground items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground mt-2">Loading confirmation...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
