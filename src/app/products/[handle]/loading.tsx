import { PackageCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function Loading() {
  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground" suppressHydrationWarning>
      <Navbar />
      <main className="flex-grow max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 pt-[115px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left Column: Gallery Skeleton */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="relative bg-card/60 border border-border/60 rounded-[2.5rem] aspect-square w-full flex items-center justify-center p-8 overflow-hidden shadow-xs">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />
              <div className="w-40 h-40 rounded-3xl bg-muted/50 animate-pulse flex items-center justify-center border border-border/30">
                <PackageCheck className="w-12 h-12 text-primary/30 animate-pulse" />
              </div>
            </div>

            {/* Thumbnails Row Skeleton */}
            <div className="flex gap-3 overflow-x-auto pb-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-20 h-20 rounded-2xl bg-card/60 border border-border/60 animate-pulse shrink-0"
                />
              ))}
            </div>
          </div>

          {/* Right Column: Buy Box Skeleton */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            {/* Category & Rating Row */}
            <div className="flex items-center justify-between gap-4">
              <div className="h-4 bg-primary/15 rounded-full w-28 animate-pulse" />
              <div className="h-4 bg-muted/60 rounded-full w-32 animate-pulse" />
            </div>

            {/* Product Title Skeleton */}
            <div className="space-y-2">
              <div className="h-8 sm:h-9 bg-muted/70 rounded-2xl w-5/6 animate-pulse" />
              <div className="h-8 sm:h-9 bg-muted/60 rounded-2xl w-3/5 animate-pulse" />
            </div>

            {/* Price & Tag Skeleton */}
            <div className="flex items-center gap-3 py-1">
              <div className="h-10 bg-primary/20 rounded-2xl w-36 animate-pulse" />
              <div className="h-7 bg-muted/50 rounded-full w-24 animate-pulse" />
            </div>

            {/* Spec Badges Skeleton */}
            <div className="flex gap-2 py-1">
              <div className="h-7 bg-muted/50 rounded-full w-20 animate-pulse" />
              <div className="h-7 bg-muted/50 rounded-full w-24 animate-pulse" />
              <div className="h-7 bg-muted/50 rounded-full w-20 animate-pulse" />
            </div>

            {/* Variant Selector Box Skeleton */}
            <div className="h-16 bg-card/60 border border-border/60 rounded-2xl w-full animate-pulse p-4 flex items-center justify-between">
              <div className="h-4 bg-muted/60 rounded-full w-32" />
              <div className="h-8 bg-primary/20 rounded-xl w-24" />
            </div>

            {/* CTA Buttons Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="h-13 bg-primary/25 rounded-2xl animate-pulse" />
              <div className="h-13 bg-primary rounded-2xl animate-pulse" />
            </div>

            {/* Trust Features Cards Skeleton */}
            <div className="grid grid-cols-2 gap-3 pt-3">
              <div className="h-14 bg-card/60 border border-border/60 rounded-2xl animate-pulse" />
              <div className="h-14 bg-card/60 border border-border/60 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
