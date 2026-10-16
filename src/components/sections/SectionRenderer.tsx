import React from "react";
import dynamic from "next/dynamic";

import { shouldRenderInstance, type SectionContext } from "@/lib/theme/conditions";
import type { SectionInstance } from "@/lib/theme/types";

import { HeroSection, type HeroSettings } from "./HeroSection";
import {
  ContactDetailsSection,
  FeatureGridSection,
  PageHeaderSection,
  RichTextSection,
  type ContactDetailsSettings,
  type FeatureGridSettings,
  type PageHeaderSettings,
  type RichTextSettings,
} from "./PageBlocks";
import {
  ContactFormSection,
  type ContactFormSettings,
} from "./ContactFormSection";
import type { FaqSettings } from "./FAQSection";
import type { BrandsSettings } from "./AuthorizedDealers";
import { Categories, type CategoriesSettings } from "./Categories";
import type { WhatsAppSettings } from "./WhatsAppContactSection";
import type { WhyShopSettings } from "./WhyShopWithUs";
import type { BlogSettings } from "./BlogSection";

const FAQSection = dynamic(() => import("./FAQSection").then((m) => m.FAQSection));
const AuthorizedDealers = dynamic(() => import("./AuthorizedDealers").then((m) => m.AuthorizedDealers));
const WhatsAppContactSection = dynamic(() => import("./WhatsAppContactSection").then((m) => m.WhatsAppContactSection));
const WhyShopWithUs = dynamic(() => import("./WhyShopWithUs").then((m) => m.WhyShopWithUs));
const BlogSection = dynamic(() => import("./BlogSection").then((m) => m.BlogSection));

const BrandSphere3D = dynamic(() => import("./BrandSphere3D"));
const FlavorsWheel = dynamic(() => import("./FlavorsWheel"));

/**
 * Sections the page renders itself, keyed by section type.
 *
 * A slot may be a plain node, or a function receiving that instance's saved
 * settings — the latter lets a page-owned section still be configured from the
 * customizer. `null` means "this template lists the section, but the page
 * renders it elsewhere" (the collection grid and product buy box).
 */
export type SectionSlot =
  | React.ReactNode
  | ((settings: Record<string, unknown>) => React.ReactNode);

export type SectionSlots = Record<string, SectionSlot>;

/** Standard page gutter shared by most sections. */
export const SECTION_CONTAINER =
  "max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-1.5 sm:py-2 cv-auto";

/** Sections that lay out their own full-bleed container. */
const FULL_BLEED = new Set(["hero"]);

function renderRegistrySection(
  instance: SectionInstance
): React.ReactNode {
  const s = instance.settings;

  switch (instance.type) {
    case "hero":
      return <HeroSection settings={s as unknown as HeroSettings} />;
    case "brandDirectoryShowcase":
      return <BrandSphere3D settings={s as any} />;
    case "categories":
      return <Categories settings={s as unknown as CategoriesSettings} />;
    case "brands":
      return <AuthorizedDealers settings={s as unknown as BrandsSettings} />;
    case "flavorsWheel":
      return <FlavorsWheel {...(s as any)} />;
    case "whyShop":
      return <WhyShopWithUs settings={s as unknown as WhyShopSettings} />;
    case "faq":
      return <FAQSection settings={s as unknown as FaqSettings} />;
    case "whatsapp":
      return <WhatsAppContactSection settings={s as unknown as WhatsAppSettings} />;
    case "blogPosts":
      return <BlogSection settings={s as unknown as BlogSettings} />;
    case "pageHeader":
      return <PageHeaderSection settings={s as unknown as PageHeaderSettings} />;
    case "richText":
      return <RichTextSection settings={s as unknown as RichTextSettings} />;
    case "featureGrid":
      return <FeatureGridSection settings={s as unknown as FeatureGridSettings} />;
    case "contactDetails":
      return <ContactDetailsSection settings={s as unknown as ContactDetailsSettings} />;
    case "contactForm":
      return <ContactFormSection settings={s as unknown as ContactFormSettings} />;
    default:
      return null;
  }
}

/**
 * Settings of the first instance of `type` in a resolved template.
 *
 * For sections a page renders inline rather than through a slot — the
 * collection grid and the product buy box — this is how the page reaches
 * their saved settings.
 */
export function instanceSettings(
  instances: SectionInstance[],
  type: string
): Record<string, unknown> {
  return instances.find((i) => i.type === type)?.settings ?? {};
}

export interface TemplateSectionsProps {
  instances: SectionInstance[];
  /** True for per-handle overrides, which bypass `showWhen` conditions. */
  isOverride: boolean;
  context: SectionContext;
  slots?: SectionSlots;
  /** Wrapper class for each section. Pass "" to opt out of the gutter. */
  containerClassName?: string;
}

export const TemplateSections: React.FC<TemplateSectionsProps> = ({
  instances,
  isOverride,
  context,
  slots = {},
  containerClassName = SECTION_CONTAINER,
}) => {
  return (
    <>
      {instances.map((instance) => {
        if (!instance.enabled) return null;
        if (!shouldRenderInstance(instance.showWhen, context, isOverride)) return null;

        // A slot wins over the registry: the page knows more about this section
        // than its stored settings do.
        const isSlot = instance.type in slots;
        const slot = slots[instance.type];
        const node = isSlot
          ? typeof slot === "function"
            ? slot(instance.settings)
            : slot
          : renderRegistrySection(instance);

        if (!node) return null;

        const useContainer =
          containerClassName && !FULL_BLEED.has(instance.type);

        return (
          <div key={instance.id} data-section-id={instance.id} className="scroll-mt-24" suppressHydrationWarning>
            {useContainer ? <div className={containerClassName} suppressHydrationWarning>{node}</div> : node}
          </div>
        );
      })}
    </>
  );
};
