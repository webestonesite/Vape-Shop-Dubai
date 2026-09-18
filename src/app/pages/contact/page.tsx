"use client";

import React from "react";
import { MessageSquare, Phone, Mail, MapPin, Clock } from "lucide-react";
import { useFooterSettings } from "@/context/ThemeSettingsContext";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";

export default function ContactPage() {
  const settings = useFooterSettings();

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Header Section */}
      <div className="relative py-16 sm:py-24 bg-card border-b border-border/50 overflow-hidden">
        <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] rounded-full bg-primary/5 filter blur-[100px] pointer-events-none" />
        
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 relative z-10 text-center">
          <span className="text-primary font-bold tracking-widest uppercase text-xs sm:text-sm mb-3 block">Get In Touch</span>
          <h1 className="text-3xl sm:text-5xl font-serif text-foreground leading-tight tracking-tight mb-4">
            We're Here to Help
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
            Questions about an order, a product or delivery? Reach out any day of the week — our team replies fast.
          </p>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Left Column: Contact Details */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-serif text-foreground mb-3">Reach Us Your Way</h2>
              <p className="text-muted-foreground">Pick whatever is easiest — WhatsApp us for the fastest response, drop an email, or send the form and we'll get right back to you.</p>
            </div>

            <div className="space-y-4">
              <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 rounded-2xl border border-border hover:border-primary/50 bg-card hover:bg-card/80 transition-all group">
                <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center shrink-0">
                  <WhatsAppIcon className="w-6 h-6 fill-[#25D366]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">WhatsApp</div>
                  <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{settings.whatsappLabel || "+971 58 283 9787"}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Fastest reply — tap to chat</div>
                </div>
              </a>

              <a href={`mailto:${settings.email}`} className="flex items-center gap-4 p-5 rounded-2xl border border-border hover:border-primary/50 bg-card hover:bg-card/80 transition-all group">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Email</div>
                  <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{settings.email}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">For orders & general queries</div>
                </div>
              </a>

              <div className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card/50">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-foreground/70" />
                </div>
                <div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Location</div>
                  <div className="font-semibold text-foreground">{settings.address}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Delivery across the UAE</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card/50">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-foreground/70" />
                </div>
                <div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Working Hours</div>
                  <div className="font-semibold text-foreground">Open 7 Days · 10 AM – 12 AM</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Same-day orders before 9 PM</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="bg-card border border-border/60 rounded-[2rem] p-6 sm:p-10 shadow-sm">
            <h2 className="text-2xl font-serif text-foreground mb-2">Send Us a Message</h2>
            <p className="text-muted-foreground text-sm mb-8">Fill in the form and we'll reply as soon as we can.</p>
            
            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert("Form submission is simulated. Please use WhatsApp for real support."); }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-foreground/70 tracking-wider">Name</label>
                  <input type="text" placeholder="Your name" required className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-foreground/70 tracking-wider">Phone</label>
                  <input type="tel" placeholder="+971 ..." className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-foreground/70 tracking-wider">Email *</label>
                <input type="email" placeholder="you@example.com" required className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-foreground/70 tracking-wider">Subject</label>
                <input type="text" placeholder="What's this about?" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-foreground/70 tracking-wider">Message *</label>
                <textarea rows={4} placeholder="How can we help?" required className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"></textarea>
              </div>

              <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl px-6 py-4 transition-all flex items-center justify-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Send Message
              </button>
            </form>
          </div>

        </div>
      </div>
      
      {/* Map Section */}
      <div className="h-[400px] w-full bg-muted">
        <iframe
          src="https://www.google.com/maps?q=International+City+Dubai&output=embed"
          title="Vape Shop Dubai location"
          loading="lazy"
          className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-700"
          allowFullScreen>
        </iframe>
      </div>
    </div>
  );
}
