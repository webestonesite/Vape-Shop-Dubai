"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface PageShellProps {
  children: React.ReactNode;
  breadcrumbTitle: string;
}

export const PageShell: React.FC<PageShellProps> = ({ children, breadcrumbTitle }) => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Header */}
      <Navbar />
      
      {/* Breadcrumb Navigation / Back to Home */}
      <div className="bg-card/60 border-b border-border/40 py-3 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Link href="/" className="flex items-center gap-1.5 hover:text-primary transition-colors text-foreground/80">
              <Home className="w-3.5 h-3.5 text-primary" />
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="text-foreground font-semibold">{breadcrumbTitle}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
