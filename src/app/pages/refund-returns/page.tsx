import { Metadata } from "next";
import { ShieldAlert, RefreshCcw, Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund & Returns | Vape Shop Dubai",
  description: "Our commitment to your satisfaction — clear policies for warranty, returns, exchanges and refunds.",
};

export default function RefundReturnsPage() {
  return (
    <div className="min-h-screen bg-background">
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
              <ShieldAlert className="w-4 h-4 text-primary" />
              24h Warranty
            </div>
            <div className="flex items-center gap-2 bg-background border border-border rounded-full px-4 py-2 text-xs font-bold shadow-sm">
              <RefreshCcw className="w-4 h-4 text-primary" />
              48h Returns
            </div>
            <div className="flex items-center gap-2 bg-background border border-border rounded-full px-4 py-2 text-xs font-bold shadow-sm">
              <Truck className="w-4 h-4 text-primary" />
              Free Pickup
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-base sm:text-lg leading-relaxed text-muted-foreground space-y-8">
          
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">1. Product Warranty (24 Hours)</h2>
            <p className="mb-4">
              We offer a 24-hour testing period for manufacturing defects. If your disposable vape or device is dead on arrival, leaking before use, or auto-firing right out of the box, we will replace it.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>What is covered:</strong> Factory defects immediately noticeable upon unboxing.</li>
              <li><strong>What is NOT covered:</strong> Burnt taste after use, physical damage, dropping the device, or not liking the flavor.</li>
              <li><strong>Requirement:</strong> You MUST keep the original packaging with the authenticity code. No box = no warranty.</li>
            </ul>
          </section>

          <div className="w-full h-px bg-border my-8"></div>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">2. Return & Exchange Eligibility (48 Hours)</h2>
            <p className="mb-4">
              You can return or exchange any <strong>unopened, unused, and sealed</strong> product within 48 hours of delivery.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The item must be in its original condition. If the seal is broken or the box is torn, the return will be rejected.</li>
              <li>E-liquids, pods, and coils cannot be returned once the packaging is opened due to hygiene and health regulations.</li>
            </ul>
          </section>

          <div className="w-full h-px bg-border my-8"></div>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">3. The Refund Process</h2>
            <p className="mb-4">
              If your return is approved and you prefer a refund rather than an exchange:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Card Payments:</strong> The refund will be processed back to your original payment method. Please allow 5-7 business days for your bank to reflect the amount.</li>
              <li><strong>Cash on Delivery (COD):</strong> COD orders are refunded via store credit or bank transfer (local UAE accounts only).</li>
              <li>Delivery fees are non-refundable.</li>
            </ul>
          </section>

          <div className="bg-muted/40 border border-border/60 p-6 sm:p-8 rounded-[2rem] mt-12 text-center">
            <h3 className="text-xl font-serif text-foreground mb-3">How to Start a Return?</h3>
            <p className="text-sm mb-6">Message our support team on WhatsApp with your Order ID and a photo/video of the issue. We'll handle the rest.</p>
            <a href="/pages/contact" className="inline-flex items-center justify-center bg-primary text-primary-foreground font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors">
              Contact Support
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
