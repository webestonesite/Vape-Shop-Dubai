"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-card border border-border/70 rounded-3xl p-8 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-serif font-bold text-foreground">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            A temporary issue occurred while loading this page.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-gold-shimmer transition-all cursor-pointer shadow-md"
          >
            <RefreshCw className="h-4 w-4" /> Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-muted/60 text-foreground border border-border/80 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-muted transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
