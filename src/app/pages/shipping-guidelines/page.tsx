"use client";

import React from "react";
import { Truck, Clock, ShieldCheck, MapPin, Gift, Banknote, Calendar, Mail } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { PageShell } from "@/components/layout/PageShell";

export default function ShippingGuidelinesPage() {
  const whatsappUrl = "https://wa.me/971582839787";
  const emailAddr = "vapshopdubai@gmail.com";

  return (
    <PageShell breadcrumbTitle="Shipping Guidelines">
      {/* Premium Header Section */}
      <div className="relative py-16 sm:py-24 bg-card border-b border-border/50 overflow-hidden">
        <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] rounded-full bg-primary/5 filter blur-[100px] pointer-events-none" />
        
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 relative z-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <Truck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif text-foreground leading-tight tracking-tight mb-4">
            Shipping Guidelines
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto mb-8">
            Fast, reliable delivery across the UAE — same-day available in Dubai & Sharjah
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 bg-background border border-border rounded-full px-4 py-2 text-xs font-bold shadow-sm">
              <Clock className="w-4 h-4 text-primary" />
              Same-Day Delivery
            </div>
            <div className="flex items-center gap-2 bg-background border border-border rounded-full px-4 py-2 text-xs font-bold shadow-sm">
              <Gift className="w-4 h-4 text-primary" />
              Free on 300+ AED
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

      {/* Grid Content */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Free Delivery & Minimum Order */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm hover:border-primary/40 transition-all">
            <div className="flex items-center gap-4 border-b border-border/60 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Gift className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-serif text-foreground">Free Delivery & Minimum Order</h2>
            </div>
            <ul className="space-y-3 text-sm sm:text-base text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></span>
                <div><strong className="text-foreground">Delivery Country:</strong> We deliver all over the UAE. International deliveries are unavailable due to customs restrictions.</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></span>
                <div><strong className="text-foreground">Minimum Order:</strong> A minimum of <strong className="text-foreground text-primary">85 AED</strong> is required to place an order.</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></span>
                <div><strong className="text-foreground">Free Delivery:</strong> Enjoy complimentary shipping on orders valued at <strong className="text-foreground text-primary">AED 300 or more</strong>.</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></span>
                <div><strong className="text-foreground">Delivery Charge:</strong> A charge of <strong className="text-foreground text-primary">AED 30</strong> applies to orders below AED 300.</div>
              </li>
            </ul>
          </div>

          {/* Card 2: Dubai & Sharjah Delivery */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm hover:border-primary/40 transition-all">
            <div className="flex items-center gap-4 border-b border-border/60 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-serif text-foreground">Dubai & Sharjah Delivery</h2>
            </div>
            <ul className="space-y-3 text-sm sm:text-base text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></span>
                <div><strong className="text-foreground">Same-Day Delivery:</strong> Order before <strong className="text-foreground text-primary">9 PM</strong> — delivered to your doorstep same day.</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></span>
                <div><strong className="text-foreground">Next-Day Delivery:</strong> Orders placed after 9 PM are delivered the next morning.</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></span>
                <div><strong className="text-foreground">Operational Days:</strong> Deliveries run <strong className="text-foreground text-primary">7 days a week</strong>.</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></span>
                <div><strong className="text-foreground">Prompt Dispatch:</strong> We dispatch by courier or private car. Occasional delays may occur due to severe weather or traffic.</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></span>
                <div><strong className="text-foreground">No Signature Required:</strong> Ensure someone is available to collect your parcel.</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></span>
                <div><strong className="text-foreground">Our Responsibility:</strong> We take full care of your shipment and ensure you are satisfied with the product.</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></span>
                <div><strong className="text-foreground">Pre-orders:</strong> Contact us via email or WhatsApp, or leave details in the order note.</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></span>
                <div><strong className="text-foreground">Address Finality:</strong> Orders ship to the address provided. To change location, notify us via WhatsApp or email before dispatch. Refunds exclude the initial shipping fee.</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></span>
                <div><strong className="text-foreground">Payment & ID:</strong> Delivery handed over upon presenting your Emirates ID/Passport and clearing payment by Cash or Card.</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></span>
                <div><strong className="text-foreground">Age Restriction:</strong> Buyers must be <strong className="text-foreground text-primary">18 or older</strong>. Orders placed by minors will not be handed over or refunded.</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></span>
                <div><strong className="text-foreground">Delivery Update:</strong> Expect a confirmation email from <a href={`mailto:${emailAddr}`} className="text-primary underline hover:text-primary/80">{emailAddr}</a> after placing your order.</div>
              </li>
            </ul>
          </div>

          {/* Card 3: Outside Dubai & Sharjah */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm hover:border-primary/40 transition-all">
            <div className="flex items-center gap-4 border-b border-border/60 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-serif text-foreground">Outside Dubai & Sharjah</h2>
            </div>
            <ul className="space-y-3 text-sm sm:text-base text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></span>
                <div><strong className="text-foreground">Delivery Time:</strong> <strong className="text-foreground text-primary">6 working days</strong> (Sunday closed).</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></span>
                <div><strong className="text-foreground">Cut-off Time:</strong> Orders placed before <strong className="text-foreground text-primary">2:00 PM</strong> are delivered same day. After 2 PM delivered next day.</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></span>
                <div><strong className="text-foreground">Weekend Orders:</strong> Orders placed after 2 PM on Saturday will be delivered on Monday.</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></span>
                <div><strong className="text-foreground">Payment:</strong> <strong className="text-foreground text-primary">Cash on delivery only</strong> — card payment not accepted.</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></span>
                <div><strong className="text-foreground">Free Delivery:</strong> Orders over <strong className="text-foreground text-primary">300 AED</strong> ship free.</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></span>
                <div><strong className="text-foreground">Minimum Order:</strong> <strong className="text-foreground text-primary">85 AED</strong> required to place an order.</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></span>
                <div><strong className="text-foreground">Delivery Charge:</strong> Orders under 300 AED incur a <strong className="text-foreground text-primary">30 AED</strong> delivery charge.</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></span>
                <div><strong className="text-foreground">Age Restriction:</strong> Buyers must be <strong className="text-foreground text-primary">18 or older</strong>. Orders from minors will not be handed over or refunded.</div>
              </li>
            </ul>
          </div>

          {/* Card 4: Outside City Area */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm hover:border-primary/40 transition-all">
            <div className="flex items-center gap-4 border-b border-border/60 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-serif text-foreground">Outside City Area</h2>
            </div>
            <ul className="space-y-3 text-sm sm:text-base text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></span>
                <div><strong className="text-foreground">Delivery Time:</strong> Within <strong className="text-foreground text-primary">2 working days</strong> (Sunday closed).</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></span>
                <div><strong className="text-foreground">Remote Area Surcharge:</strong> Areas far from city centres incur an additional charge of <strong className="text-foreground text-primary">35 AED</strong>.</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></span>
                <div><strong className="text-foreground">Large Orders:</strong> Orders above <strong className="text-foreground text-primary">300 AED</strong> are charged <strong className="text-foreground text-primary">35 AED delivery only</strong> — no free delivery for remote areas.</div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom CTA Banner */}
        <div className="bg-card border border-border/80 rounded-3xl p-8 sm:p-12 mt-12 text-center flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="text-center sm:text-left">
            <h3 className="text-2xl font-serif text-foreground mb-2">Questions about your order?</h3>
            <p className="text-muted-foreground text-sm sm:text-base">Our team is available 7 days a week to assist you.</p>
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


