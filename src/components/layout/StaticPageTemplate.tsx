"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import {
  SECTION_CONTAINER,
  TemplateSections,
} from "@/components/sections/SectionRenderer";
import { useResolvedTemplate } from "@/context/ThemeSettingsContext";

/**
 * Shell for the content pages (About, Contact, Terms…).
 *
 * These have no commerce data of their own, so their whole body is whatever
 * sections the merchant has placed on the matching `page:<slug>` template.
 */
export const StaticPageTemplate: React.FC<{
  slug: string;
  /** Breadcrumb label; also the fallback <h1> if no sections are configured. */
  title: string;
}> = ({ slug, title }) => {
  const { instances, isOverride } = useResolvedTemplate("page", slug);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      <Navbar />

      <main className="flex-grow pt-12 sm:pt-16 lg:pt-20 pb-12 space-y-4 sm:space-y-6">
        <div className={SECTION_CONTAINER}>
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{title}</span>
          </nav>
        </div>

        {instances.length === 0 ? (
          <div className={SECTION_CONTAINER}>
            <h1 className="text-3xl sm:text-5xl font-serif font-black text-foreground tracking-tight">
              {title}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              This page has no sections yet. Add some in the theme customizer.
            </p>
          </div>
        ) : (
          <TemplateSections
            instances={instances}
            isOverride={isOverride}
            context={{ handle: slug }}
            containerClassName={SECTION_CONTAINER}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};
