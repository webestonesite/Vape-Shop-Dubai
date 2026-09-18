import { Metadata } from "next";
import { Truck, Clock, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping Guidelines | Vape Shop Dubai",
  description: "Fast, reliable delivery across the UAE — same-day available in Dubai & Sharjah",
};

export default function ShippingGuidelinesPage() {
  return (
    <div className="min-h-screen bg-background">
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
              <ShieldCheck className="w-4 h-4 text-primary" />
              Discreet Packaging
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-base sm:text-lg leading-relaxed text-muted-foreground space-y-8">
          
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Dubai Delivery Rules</h2>
            <div className="bg-muted/30 border border-border rounded-2xl p-6">
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">1</div>
                  <div>
                    <strong className="text-foreground block mb-1">Standard Delivery (Next Day)</strong>
                    Orders placed anytime will be delivered the next day for a flat rate of <strong>30 AED</strong>. Free for orders over 300 AED.
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">2</div>
                  <div>
                    <strong className="text-foreground block mb-1">Same-Day Delivery</strong>
                    Order before 9:00 PM to receive your items on the same day within Dubai. Fee: <strong>35 AED</strong>.
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Other Emirates (Abu Dhabi, Sharjah, Ajman, etc.)</h2>
            <p className="mb-4">
              We ship to all other Emirates via professional courier partners to ensure safe and prompt delivery.
            </p>
            <div className="bg-muted/30 border border-border rounded-2xl p-6">
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">1</div>
                  <div>
                    <strong className="text-foreground block mb-1">Standard Delivery</strong>
                    Delivered within 1-2 business days. Fee: <strong>30 AED</strong>. Free for orders over 300 AED.
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <div className="w-full h-px bg-border my-8"></div>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Age Verification</h2>
            <p className="mb-4">
              Vaping products are strictly for adults (21+). Upon delivery, our courier may ask for a valid Emirates ID or Passport to verify your age. If you are underage, the package will not be handed over, and the delivery fee will not be refunded.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Packaging & Privacy</h2>
            <p className="mb-4">
              Your privacy matters. All orders are packed in secure, opaque bags without explicit logos on the outside, ensuring a discreet delivery to your home or office.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
