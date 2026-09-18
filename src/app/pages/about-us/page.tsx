import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Vape Shop Dubai",
  description: "Learn more about Vape Shop Dubai. We provide 100% authentic vaping products across the UAE.",
};

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Premium Header Section */}
      <div className="relative py-16 sm:py-24 bg-card border-b border-border/50 overflow-hidden">
        <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] rounded-full bg-primary/5 filter blur-[100px] pointer-events-none" />
        
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 relative z-10 text-center">
          <h1 className="text-3xl sm:text-5xl font-serif text-foreground leading-tight tracking-tight mb-4">
            About Us
          </h1>
          <div className="w-16 h-1 bg-primary rounded-full mx-auto" />
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-base sm:text-lg leading-relaxed text-muted-foreground space-y-6">
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
    </div>
  );
}
