"use client";

import React from "react";
import { Check } from "lucide-react";

export interface WhyChooseItem {
  title: string;
  description: string;
}

export interface ProductWhyChooseMeta {
  heading?: string;
  intro?: string;
  points?: WhyChooseItem[];
  footer?: string;
}

interface WhyChooseProductSectionProps {
  productName: string;
  puffs?: string;
  className?: string;
  settings?: WhyChooseProductSettings;
  productWhyChoose?: ProductWhyChooseMeta;
  hideIfEmpty?: boolean;
}

export interface WhyChooseProductSettings {
  /** `{product}` is replaced with the product name. */
  headingTemplate: string;
  /** `{product}` and `{puffs}` are both substituted. */
  introTemplate: string;
  items: WhyChooseItem[];
  /** `{product}` is substituted. Blank hides the footnote. */
  footnoteTemplate: string;
}

const FALLBACK_HEADING = "Why Choose the {product}?";

function parseAstToHtml(nodes: any[], inline = false): string {
  if (!Array.isArray(nodes)) return "";
  return nodes
    .map((node) => {
      if (node.type === "text") {
        let val = node.value || "";
        if (node.bold) val = `<strong>${val}</strong>`;
        if (node.italic) val = `<em>${val}</em>`;
        return val;
      }
      if (node.type === "link") {
        const inner = parseAstToHtml(node.children || [], inline);
        return `<a href="${node.url || "#"}" class="text-primary underline font-bold hover:opacity-80">${inner}</a>`;
      }
      if (node.type === "paragraph") {
        if (inline) {
          return `<span class="inline leading-relaxed">${parseAstToHtml(node.children || [], inline)}</span>`;
        }
        return `<p class="mb-3 last:mb-0 leading-relaxed text-justify [text-align-last:left]">${parseAstToHtml(node.children || [], inline)}</p>`;
      }
      if (node.type === "list") {
        const tag = node.listType === "ordered" ? "ol" : "ul";
        return `<${tag}>${parseAstToHtml(node.children || [], inline)}</${tag}>`;
      }
      if (node.type === "list-item") {
        return `<li>${parseAstToHtml(node.children || [], inline)}</li>`;
      }
      return parseAstToHtml(node.children || [], inline);
    })
    .join("");
}

function formatText(text: string, inline = false): string {
  if (!text) return "";

  // 1. If text is a Shopify Rich Text AST JSON string, parse AST to HTML
  if (text.trim().startsWith("{")) {
    try {
      const ast = JSON.parse(text);
      if (ast.type === "root" && Array.isArray(ast.children)) {
        return parseAstToHtml(ast.children, inline);
      }
    } catch (e) {
      // Fallback to text
    }
  }

  // 2. Convert simple markdown links [Word](URL) -> <a href="URL">Word</a>
  return text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-primary underline font-bold hover:opacity-80">$1</a>'
  );
}

export function WhyChooseProductSection({
  settings,
  productName,
  puffs = "",
  className = "",
  productWhyChoose,
  hideIfEmpty = false,
}: WhyChooseProductSectionProps) {
  const hasMetafield =
    Boolean(productWhyChoose) &&
    Boolean(
      productWhyChoose?.heading ||
      productWhyChoose?.intro ||
      (productWhyChoose?.points && productWhyChoose.points.length > 0) ||
      productWhyChoose?.footer
    );

  if (hideIfEmpty && !hasMetafield) {
    return null;
  }
  const puffCount =
    puffs ||
    productName.match(/\d+[\d,]*(?:\s*puffs|\s*puff|\s*k)/i)?.[0] ||
    "8,000 puffs";

  const fill = (template: string) =>
    template.split("{product}").join(productName).split("{puffs}").join(puffCount);

  const heading = productWhyChoose?.heading
    ? fill(productWhyChoose.heading)
    : fill(settings?.headingTemplate || FALLBACK_HEADING);

  const intro = productWhyChoose?.intro
    ? fill(productWhyChoose.intro)
    : settings?.introTemplate
      ? fill(settings.introTemplate)
      : "";

  const items =
    productWhyChoose?.points && productWhyChoose.points.length > 0
      ? productWhyChoose.points
      : settings?.items ?? [];

  const footnote = productWhyChoose?.footer
    ? fill(productWhyChoose.footer)
    : settings?.footnoteTemplate
      ? fill(settings.footnoteTemplate)
      : "";

  return (
    <section className={`w-full ${className}`} suppressHydrationWarning>
      <div
        className="bg-card border border-border/60 rounded-[2.5rem] p-6 sm:p-10 lg:p-12 shadow-sm relative overflow-hidden transition-all duration-300"
        suppressHydrationWarning
      >

        {/* Top subtle brand accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

        {/* Section Header with Left Vertical Accent Bar */}
        <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 mb-3.5 sm:mb-4">
          <span className="w-1.5 h-7 sm:h-8 bg-primary rounded-full inline-block shrink-0 shadow-xs mt-0.5 sm:mt-0" />
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif text-foreground tracking-tight">
            {heading}
          </h2>
        </div>

        {/* Subtitle / Intro Paragraph */}
        {intro && (
          <div
            className="text-sm sm:text-base md:text-lg text-muted-foreground font-medium leading-relaxed w-full mb-6 sm:mb-8 pl-0.5 [&_a]:text-primary [&_a]:underline [&_a]:font-bold hover:[&_a]:opacity-80 [&_p]:mb-3 [&_p:last-child]:mb-0"
            dangerouslySetInnerHTML={{ __html: formatText(intro) }}
          />
        )}

        {/* Feature Cards Stack */}
        {items.length > 0 && (
          <div className="space-y-3 sm:space-y-3.5">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start sm:items-center gap-3 sm:gap-3.5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-background/80 hover:bg-card border border-border/70 hover:border-primary/40 transition-all duration-200 shadow-2xs hover:shadow-xs group"
              >
                <div className="w-5 h-5 rounded-full bg-primary/10 group-hover:bg-primary text-primary group-hover:text-white border border-primary/20 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 transition-colors duration-200 shadow-2xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <div className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                  <strong className="font-extrabold text-foreground">{item.title}: </strong>
                  <div
                    className="inline text-muted-foreground font-medium [&_a]:text-primary [&_a]:underline [&_a]:font-bold hover:[&_a]:opacity-80"
                    dangerouslySetInnerHTML={{ __html: formatText(fill(item.description), true) }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Keyword & Value Note */}
        {footnote && (
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-border/40 pl-0.5">
            <div
              className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed [&_a]:text-primary [&_a]:underline [&_a]:font-bold hover:[&_a]:opacity-80"
              dangerouslySetInnerHTML={{ __html: formatText(footnote) }}
            />
          </div>
        )}

      </div>
    </section>
  );
}
