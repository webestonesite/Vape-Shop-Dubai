"use client";

import React from "react";
import { ShieldCheck, RefreshCcw, AlertTriangle, UserCheck, CheckCircle2, XCircle, Package, FileText, Mail } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { PageShell } from "@/components/layout/PageShell";

export default function RefundReturnsPage() {
  const whatsappUrl = "https://wa.me/971582839787";
  const emailAddr = "info.vapeshopdubai@gmail.com";

  return (
    <PageShell breadcrumbTitle="Returns & Refunds">
      {/* Premium Header Section */}
      <div className="relative py-16 sm:py-24 bg-card border-b border-border/50 overflow-hidden">
        <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] rounded-full bg-primary/5 filter blur-[100px] pointer-events-none" />
        
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 relative z-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <RefreshCcw className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif text-foreground leading-tight tracking-tight mb-4">
            Returns & Refunds
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto mb-8">
            Our commitment to your satisfaction — clear policies for warranty, returns, exchanges and refunds.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 bg-background border border-border rounded-full px-4 py-2 text-xs font-bold shadow-sm">
              <ShieldCheck className="w-4 h-4 text-primary" />
              24h Warranty
            </div>
            <div className="flex items-center gap-2 bg-background border border-border rounded-full px-4 py-2 text-xs font-bold shadow-sm">
              <RefreshCcw className="w-4 h-4 text-primary" />
              48h Returns
            </div>
            <div className="flex items-center gap-2 bg-background border border-border rounded-full px-4 py-2 text-xs font-bold shadow-sm">
              <AlertTriangle className="w-4 h-4 text-primary" />
              Factory Defects Only
            </div>
            <div className="flex items-center gap-2 bg-background border border-border rounded-full px-4 py-2 text-xs font-bold shadow-sm">
              <UserCheck className="w-4 h-4 text-primary" />
              18+ Only
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Warranty */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm hover:border-primary/40 transition-all">
            <div className="flex items-center gap-4 border-b border-border/60 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-serif text-foreground">Warranty</h2>
            </div>
            <ul className="space-y-3 text-sm sm:text-base text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>Products come with a <strong className="text-foreground">24-hour warranty</strong> covering factory defects.</div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>To claim warranty, you must provide your <strong className="text-foreground">Vap Shop Dubai order number</strong>.</div>
              </li>
            </ul>
          </div>

          {/* Card 2: Return Policy */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm hover:border-primary/40 transition-all">
            <div className="flex items-center gap-4 border-b border-border/60 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <RefreshCcw className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-serif text-foreground">Return Policy</h2>
            </div>
            <ul className="space-y-3 text-sm sm:text-base text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>Return or exchange requests must be made within <strong className="text-foreground">48 hours of purchase</strong>. Claims beyond this timeframe will not be entertained.</div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>Returned products must be <strong className="text-foreground">unused, in original condition</strong>, and packed in factory packaging.</div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>We only accept returns for <strong className="text-foreground">factory defects or packaging errors</strong>.</div>
              </li>
            </ul>
          </div>

          {/* Card 3: Refund Process */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm hover:border-primary/40 transition-all">
            <div className="flex items-center gap-4 border-b border-border/60 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-serif text-foreground">Refund Process</h2>
            </div>
            <div className="space-y-4 text-sm sm:text-base text-muted-foreground">
              <div className="flex gap-4 items-start">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                <div>Send your item back. We notify you via <strong className="text-foreground">email or phone</strong> upon receipt.</div>
              </div>
              <div className="w-px h-3 bg-border ml-3.5"></div>
              <div className="flex gap-4 items-start">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                <div>We <strong className="text-foreground">inspect the product</strong> and inform you of approval or rejection.</div>
              </div>
              <div className="w-px h-3 bg-border ml-3.5"></div>
              <div className="flex gap-4 items-start">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                <div><strong className="text-foreground">If approved:</strong> refund via bank account or cash. <strong className="text-foreground">If rejected:</strong> product returned to you.</div>
              </div>
            </div>
          </div>

          {/* Card 4: Exchange & Exclusions */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm hover:border-primary/40 transition-all">
            <div className="flex items-center gap-4 border-b border-border/60 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <RefreshCcw className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-serif text-foreground">Exchange</h2>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              We only exchange products that are <strong className="text-foreground">defective or damaged</strong>. Contact us on WhatsApp to initiate an exchange request.
            </p>
            <div className="text-xs font-bold uppercase tracking-wider text-destructive mt-4 mb-2">Not covered under warranty</div>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <span>Pods (all types)</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <span>Damage from misuse, physical marks (scratches, drops), or charger misuse</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <span>Items tampered with by third parties</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <span>Products under another warranty or repaired by non-authorized personnel</span>
              </li>
            </ul>
          </div>

          {/* Card 5: Pods Policy */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm hover:border-primary/40 transition-all">
            <div className="flex items-center gap-4 border-b border-border/60 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-serif text-foreground">Pods Policy</h2>
            </div>
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs sm:text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Pods are neither refundable nor returnable
            </div>
            <ul className="space-y-3 text-sm sm:text-base text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>Taste is subjective — what works for one person may not work for another. We cannot accept returns on this basis.</div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>We cannot accept returned pods due to potential tampering, <strong className="text-foreground">even if sealed</strong> — unless the wrong item was shipped in your order.</div>
              </li>
            </ul>
          </div>

          {/* Card 6: Indemnity & User Responsibility */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm hover:border-primary/40 transition-all">
            <div className="flex items-center gap-4 border-b border-border/60 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-serif text-foreground">Indemnity & User Responsibility</h2>
            </div>
            <ul className="space-y-3 text-sm sm:text-base text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>By using our site, you agree to <strong className="text-foreground">defend, indemnify and hold harmless</strong> Vap Shop Dubai from any claims, damages or expenses, including attorney fees, arising from your use.</div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>Users are expected to <strong className="text-foreground">understand the product before purchasing</strong>. Damage resulting from misuse or the learning process is not covered under warranty.</div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>Like any hobby, vaping requires research. Users are expected to <strong className="text-foreground">review product details before purchase</strong>.</div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom CTA Banner */}
        <div className="bg-card border border-border/80 rounded-3xl p-8 sm:p-12 mt-12 text-center flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="text-center sm:text-left">
            <h3 className="text-2xl font-serif text-foreground mb-2">Need to raise a return or exchange?</h3>
            <p className="text-muted-foreground text-sm sm:text-base">Contact us within 48 hours of purchase. Our team responds fast.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 shrink-0">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-sm">
              <WhatsAppIcon className="w-5 h-5 fill-white" />
              WhatsApp Us
            </a>
            <a href={`mailto:${emailAddr}`} className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-3.5 rounded-xl transition-all shadow-sm">
              <Mail className="w-5 h-5" />
              Email Us
            </a>
          </div>
        </div>

      </div>
    </PageShell>
  );
}


