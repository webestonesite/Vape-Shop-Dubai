"use client";

import React from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

interface BulletPoint {
  text: string;
}

export interface JuulCustomFeatureSettings {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string;
  bulletPoints?: BulletPoint[];
  reverseLayout?: boolean; // We can use this to alternate layouts if needed
}

function parseAstToHtml(nodes: any[]): string {
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
        const inner = parseAstToHtml(node.children || []);
        return `<a href="${node.url || "#"}" target="${node.target || '_self'}" class="text-primary underline font-bold hover:opacity-80 decoration-primary/50 underline-offset-4 transition-all">${inner}</a>`;
      }
      if (node.type === "paragraph") {
        return `<p class="mb-3 last:mb-0 leading-relaxed text-justify [text-align-last:left]">${parseAstToHtml(node.children || [])}</p>`;
      }
      if (node.type === "list") {
        const tag = node.listType === "ordered" ? "ol" : "ul";
        return `<${tag} class="list-disc pl-5 my-2 space-y-1">${parseAstToHtml(node.children || [])}</${tag}>`;
      }
      if (node.type === "list-item") {
        return `<li>${parseAstToHtml(node.children || [])}</li>`;
      }
      return parseAstToHtml(node.children || []);
    })
    .join("");
}

function renderFormattedText(text: string) {
  if (!text) return null;

  const trimmed = text.trim();
  // 1. Handle Shopify Rich Text AST JSON
  if (trimmed.startsWith("{") && trimmed.includes('"type"')) {
    try {
      const ast = JSON.parse(trimmed);
      if (ast.type === "root" && Array.isArray(ast.children)) {
        const html = parseAstToHtml(ast.children);
        return <div dangerouslySetInnerHTML={{ __html: html }} />;
      }
    } catch (e) {
      // Fallback to text parsing
    }
  }

  // 2. Parse Markdown links [Label](url) into HTML links
  let html = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-primary font-bold underline hover:opacity-80 decoration-primary/50 underline-offset-4 transition-all">$1</a>'
  );

  // 3. Add styles to html <a> tags if present
  html = html.replace(
    /<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi,
    (match) => {
      if (!match.includes('class=')) {
        return match.replace('<a ', '<a class="text-primary font-bold underline hover:opacity-80 decoration-primary/50 underline-offset-4 transition-all" ');
      }
      return match;
    }
  );

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export function JuulCustomFeatureSection({
  settings,
  className = "",
  reverseLayout = false,
  featureData,
}: {
  settings?: JuulCustomFeatureSettings;
  className?: string;
  reverseLayout?: boolean;
  featureData?: any;
}) {
  const title = featureData?.heading || settings?.title || "Sleek, Compact & Pocket-Friendly Design";
  const description = featureData?.description || settings?.description;
  const image = featureData?.image_url || settings?.image || "/juul_device.png";
  const buttonText = featureData?.button_text || settings?.buttonText || "Shop Collection";
  const buttonLink = featureData?.button_url || settings?.buttonLink || "/collections/all";
  const bulletPoints = featureData?.bulletPoints || settings?.bulletPoints || [];

  return (
    <section className={`w-full ${className}`}>
      <div className="bg-card border border-border/60 rounded-[2.5rem] p-6 sm:p-10 lg:p-14 relative overflow-hidden shadow-md">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${reverseLayout ? "lg:flex-row-reverse" : ""}`}>
          
          {/* Content Column */}
          <div className={`space-y-6 lg:space-y-8 ${reverseLayout ? "lg:order-2" : "lg:order-1"}`}>
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-foreground tracking-tight leading-tight">
                {title}
              </h2>
              {description && (
                <div className="text-sm sm:text-base text-muted-foreground leading-relaxed text-justify [text-align-last:left]">
                  {renderFormattedText(description)}
                </div>
              )}
            </div>

            {bulletPoints.length > 0 && (
              <ul className="space-y-4 pt-2">
                {bulletPoints.map((point: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="bg-primary/10 p-1.5 rounded-full mt-0.5 shrink-0 border border-primary/20">
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground leading-relaxed text-justify [text-align-last:left]">
                      {renderFormattedText(point.text)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {buttonText && buttonLink && (
              <div className="pt-4">
                <Link
                  href={buttonLink}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider bg-primary text-white hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-md shadow-primary/20"
                >
                  {buttonText}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Image Column */}
          <div className={`relative flex justify-center items-center w-full ${reverseLayout ? "lg:order-1" : "lg:order-2"}`}>
            {image ? (
              <div className="relative z-10 w-full max-w-full lg:max-w-[650px] rounded-3xl overflow-hidden group shadow-xl border border-border/40 bg-white/50 backdrop-blur-sm p-2 sm:p-4">
                <img
                  src={image}
                  alt={title}
                  className="w-full h-auto object-contain rounded-2xl filter drop-shadow-md transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            ) : (
              <div className="w-full max-w-[400px] aspect-square bg-muted/50 rounded-3xl border border-dashed border-border/60 flex items-center justify-center text-muted-foreground text-sm font-medium">
                No image selected
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
