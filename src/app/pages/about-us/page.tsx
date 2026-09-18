"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Zap, Banknote, Calendar, Layers, Clock, CreditCard, Gift, MessageSquare, BookOpen, Target, ShoppingBag } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { PageShell } from "@/components/layout/PageShell";

export default function AboutUsPage() {
  const whatsappUrl = "https://wa.me/971582839787";

  const brandList = [
    "JUUL", "Myle", "Vaporesso", "SMOK", "GeekVape", "Voopoo", 
    "Uwell", "OXVA", "Elf Bar", "Al Fakher", "Lost Mary", 
    "Pod Salt", "Vozol", "Tugboat", "HQD", "Geek Bar"
  ];

  return (
    <PageShell breadcrumbTitle="About Us">
      {/* Section 1: Hero Section */}
      <div className="relative py-16 sm:py-24 bg-card border-b border-border/50 overflow-hidden">
        <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] rounded-full bg-primary/5 filter blur-[100px] pointer-events-none" />
        
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 relative z-10 text-center flex flex-col items-center">
          <span className="text-primary font-bold tracking-widest uppercase text-xs sm:text-sm mb-3 block">
            About Us
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif text-foreground leading-tight tracking-tight mb-4">
            Your Trusted Vape Store in Dubai
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
            In the vibrant world of vaping, authenticity is paramount. Vape Shop Dubai proudly stands as your trusted gateway to 100% genuine products across the United Arab Emirates.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 bg-background border border-border rounded-full px-4 py-2 text-xs font-bold shadow-sm">
              <ShieldCheck className="w-4 h-4 text-primary" />
              100% Authentic
            </div>
            <div className="flex items-center gap-2 bg-background border border-border rounded-full px-4 py-2 text-xs font-bold shadow-sm">
              <Zap className="w-4 h-4 text-primary" />
              Same-Day Delivery
            </div>
            <div className="flex items-center gap-2 bg-background border border-border rounded-full px-4 py-2 text-xs font-bold shadow-sm">
              <Banknote className="w-4 h-4 text-primary" />
              Cash on Delivery
            </div>
            <div className="flex items-center gap-2 bg-background border border-border rounded-full px-4 py-2 text-xs font-bold shadow-sm">
              <Calendar className="w-4 h-4 text-primary" />
              7 Days a Week
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Stats Bar */}
      <div className="bg-card/60 border-b border-border py-8 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 rounded-2xl bg-background border border-border/50">
            <div className="text-3xl sm:text-4xl font-serif font-bold text-primary mb-1">50+</div>
            <div className="text-xs sm:text-sm text-muted-foreground font-medium">Premium Brands</div>
          </div>
          <div className="p-4 rounded-2xl bg-background border border-border/50">
            <div className="text-3xl sm:text-4xl font-serif font-bold text-primary mb-1">1000+</div>
            <div className="text-xs sm:text-sm text-muted-foreground font-medium">Products Stocked</div>
          </div>
          <div className="p-4 rounded-2xl bg-background border border-border/50">
            <div className="text-3xl sm:text-4xl font-serif font-bold text-primary mb-1">3 Hr</div>
            <div className="text-xs sm:text-sm text-muted-foreground font-medium">Dubai Delivery</div>
          </div>
          <div className="p-4 rounded-2xl bg-background border border-border/50">
            <div className="text-3xl sm:text-4xl font-serif font-bold text-primary mb-1">100%</div>
            <div className="text-xs sm:text-sm text-muted-foreground font-medium">Genuine Guarantee</div>
          </div>
        </div>
      </div>

      {/* Section 3: Our Story */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold text-primary uppercase tracking-wider block">Our Story</span>
            <h2 className="text-2xl sm:text-4xl font-serif text-foreground leading-tight">
              Bringing Genuine Vapes to Every Doorstep in the UAE
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                Vape Shop Dubai began with a simple frustration shared by vapers across the UAE — too many fakes, too much guesswork, and not enough trust. We set out to fix that.
              </p>
              <p>
                Today we are a dedicated destination for <strong className="text-foreground">100% authentic</strong> JUUL, Myle, disposables, e-liquids, pod systems and devices from the world's leading brands. Every product passes through verified supply chains and reaches you sealed and genuine.
              </p>
              <p>
                Backed by same-day delivery, flexible payment and a team that actually answers, we have made buying real vapes in Dubai effortless.
              </p>
            </div>
          </div>

          <div className="bg-card border border-border/80 rounded-3xl p-8 sm:p-10 shadow-sm relative overflow-hidden group hover:border-primary/50 transition-all">
            <div className="absolute top-[-20%] right-[-20%] w-[300px] h-[300px] rounded-full bg-primary/10 filter blur-[80px] pointer-events-none" />
            
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Layers className="w-7 h-7 text-primary" />
            </div>
            
            <blockquote className="text-xl sm:text-2xl font-serif text-foreground italic leading-snug mb-8">
              “Authenticity is paramount. Every product we ship is verified, sealed and 100% genuine.”
            </blockquote>

            <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
              <span className="px-3.5 py-1.5 rounded-full bg-background border border-border text-xs font-semibold text-foreground">
                Verified Supply Chain
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-background border border-border text-xs font-semibold text-foreground">
                Sealed & Original
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-background border border-border text-xs font-semibold text-foreground">
                UAE-Wide
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Why Choose Us */}
      <div className="bg-card/40 border-y border-border/60 py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-2">Why Choose Us</span>
            <h2 className="text-2xl sm:text-4xl font-serif text-foreground mb-4">Why Thousands Trust Vape Shop Dubai</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              We built our store around the things that matter most to vapers in the UAE — genuine products, fast delivery and honest service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-background border border-border rounded-2xl p-6 sm:p-8 space-y-4 hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-foreground">100% Authentic Products</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every JUUL, Myle, disposable and device is sourced through verified supply chains. No clones, no fakes — guaranteed genuine.
              </p>
            </div>

            <div className="bg-background border border-border rounded-2xl p-6 sm:p-8 space-y-4 hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-foreground">Lightning-Fast Delivery</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Same-day delivery across Dubai & Sharjah — as fast as 3 hours. Next-day delivery to all major UAE cities, 7 days a week.
              </p>
            </div>

            <div className="bg-background border border-border rounded-2xl p-6 sm:p-8 space-y-4 hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-foreground">Cash & Card on Delivery</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pay your way. Choose cash on delivery or card on delivery — settle up only when your order reaches your door.
              </p>
            </div>

            <div className="bg-background border border-border rounded-2xl p-6 sm:p-8 space-y-4 hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Gift className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-foreground">Free Delivery on 300+ AED</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Enjoy complimentary shipping on every order over 300 AED — more savings on the brands you already love.
              </p>
            </div>

            <div className="bg-background border border-border rounded-2xl p-6 sm:p-8 space-y-4 hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-foreground">Always-On Support</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Questions before you buy? Our team is one WhatsApp message away, every day of the week, ready to help you choose.
              </p>
            </div>

            <div className="bg-background border border-border rounded-2xl p-6 sm:p-8 space-y-4 hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-foreground">Huge Product Range</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                From JUUL and Myle to disposables, e-liquids, pod systems and 50+ leading brands — everything a vaper needs, in one place.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Our Mission */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="bg-card border border-border/80 rounded-3xl p-8 sm:p-14 text-center max-w-4xl mx-auto shadow-sm relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif text-foreground mb-4">Our Mission</h2>
          <p className="text-base sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            To make premium, 100% genuine vaping products effortlessly accessible across the UAE — delivered fast, priced fairly, and backed by service that treats every customer like a regular.
          </p>
        </div>
      </div>

      {/* Section 6: Brands We Carry */}
      <div className="bg-card/40 border-t border-border/60 py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto text-center space-y-8">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-2">Brands We Carry</span>
            <h2 className="text-2xl sm:text-3xl font-serif text-foreground">Stocked With the Names You Trust</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {brandList.map((b) => (
              <span key={b} className="px-4 py-2 rounded-xl bg-background border border-border text-xs sm:text-sm font-semibold text-foreground hover:border-primary/50 transition-colors">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Section 7: Bottom CTA */}
      <div className="bg-card border-t border-border py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif text-foreground mb-2">Ready to Shop the Real Thing?</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Browse genuine products with same-day delivery — or message us and we'll help you find exactly what you need.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 shrink-0">
            <Link href="/shop" className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-3.5 rounded-xl transition-all shadow-sm">
              <ShoppingBag className="w-5 h-5" />
              Shop Now
            </Link>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-sm">
              <WhatsAppIcon className="w-5 h-5 fill-white" />
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </PageShell>
  );
}



