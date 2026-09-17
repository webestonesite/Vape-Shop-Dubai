import {
  deriveCollectionFamilyTemplates,
  deriveDefaultCollectionTemplate,
} from "./collection-families";
import { SECTION_REGISTRY } from "./sections";
import type { SectionInstance, Template, ThemeSettings } from "./types";

/**
 * 3 — collections split from one conditional template into a template per
 *     family.
 * 4 — sections that used to hold their content in code became editable, and the
 *     family templates carry the content that differs between them.
 *
 * `normalize.ts` carries an older store across without losing edits.
 */
export const THEME_VERSION = 4;

/**
 * Factory defaults.
 *
 * Every template below reproduces what the corresponding page rendered before
 * the customizer existed — including the handle-based rules, now carried as
 * `showWhen` conditions. A fresh install therefore looks identical, and
 * "Reset to defaults" restores exactly this.
 */

/** Build a section instance, seeding content from the registry defaults. */
function inst(
  id: string,
  type: string,
  extra: { showWhen?: string; settings?: Record<string, unknown>; enabled?: boolean } = {}
): SectionInstance {
  const def = SECTION_REGISTRY[type];
  if (!def) throw new Error(`Unknown section type in defaults: ${type}`);
  return {
    id,
    type,
    enabled: extra.enabled ?? true,
    ...(extra.showWhen ? { showWhen: extra.showWhen } : {}),
    settings: { ...structuredClone(def.defaults), ...(extra.settings ?? {}) },
  };
}

function template(
  t: Omit<Template, "instances" | "order"> & { sections: SectionInstance[] }
): Template {
  const { sections, ...rest } = t;
  return {
    ...rest,
    order: sections.map((s) => s.id),
    instances: Object.fromEntries(sections.map((s) => [s.id, s])),
  };
}

/* ── Static page bodies ───────────────────────────────────────────── */

const ABOUT_BODY = `Vape Shop Dubai is the UAE's trusted destination for 100% authentic vaping products. We supply JUUL, MYLE, disposable vapes, pod systems and premium e-liquids sourced directly from authorized regional distributors.

Every device and pod we sell carries a manufacturer security seal and a scannable verification code, so you always know exactly what you are buying.

- 2-hour express delivery across Dubai
- Same-day delivery to Abu Dhabi, Sharjah, Ajman and the wider UAE
- Cash and card accepted at your door
- Free replacement on any factory-defective unit`;

const SHIPPING_BODY = `We deliver across all seven Emirates, with express service in Dubai.

- Dubai: 2-hour express delivery on orders placed before 10:00 PM
- Abu Dhabi, Sharjah, Ajman, RAK, Fujairah, UAQ: same-day or next-day express
- Free delivery on orders above 300 AED
- Cash on delivery and card machine on delivery both available

An ID check confirming you are 18 or older is mandatory at the time of delivery.`;

const PRIVACY_BODY = `We collect only the information needed to process and deliver your order: your name, delivery address, phone number and order history.

We never sell your personal data. Information is shared with delivery partners only to the extent required to complete your order.

You can request a copy of your data, or ask us to delete it, by contacting us at any time.`;

const TERMS_BODY = `By purchasing from Vape Shop Dubai you confirm that you are 18 years of age or older and that vaping products are legal in your area.

All products are sold as-is with manufacturer warranty where applicable. Factory-defective units are replaced free of charge when reported within 24 hours of delivery.

Prices are listed in AED and may change without notice. Orders are subject to stock availability.`;

/* ── Templates ────────────────────────────────────────────────────── */

/**
 * Every section a collection page can carry, each with the condition that
 * decides which collections show it.
 *
 * Nothing renders this. It is the single source the collection templates are
 * derived from — `deriveDefaultCollectionTemplate` keeps what every collection
 * shows, and `deriveCollectionFamilyTemplates` gives each family its own
 * template holding the sections its condition selects. Adding a section here
 * with the right `showWhen` puts it in the right family automatically.
 */
export const COLLECTION_BASE: Template = template({
  type: "collection",
  label: "Collection pages",
  previewPath: "/collections/disposable-vape",
  sections: [
    inst("col-main", "collectionMain"),
    inst("col-disp-showcase", "disposableShowcase", {
      showWhen: "handleIncludesDisposable",
    }),
    inst("col-disp-compare", "disposableComparison", {
      showWhen: "handleIncludesDisposable",
    }),
    inst("col-ejuice", "ejuiceShowcase", { showWhen: "handleIsEJuice" }),
    inst("col-juul-flavors", "juulSignatureFlavors", {
      showWhen: "handleIncludesJuul",
    }),
    inst("col-juul-packaging", "juulPackagingCompare", {
      showWhen: "handleIsJuul1",
    }),
    inst("col-juul-specs", "juulTechSpecs", { showWhen: "handleIncludesJuul" }),
    inst("col-bottom-grid", "bottomCollectionGrid", {
      showWhen: "notBrandDirectory",
    }),
    inst("col-juul-app", "juulAppIntegration", { showWhen: "handleIsJuul2" }),
    inst("col-myle-verification", "myleVerification", {
      showWhen: "handleIncludesMyle",
    }),
    inst("col-whyshop", "whyShop"),
    inst("col-faq", "faq"),
    inst("col-reviews", "customerReviews"),
    inst("col-brands", "brands", { showWhen: "notBrandDirectoryAndNotEJuice" }),
    inst("col-whatsapp", "whatsapp"),
  ],
});

function buildTemplates(): Record<string, Template> {
  return {
    /* ═══ Homepage ═══ */
    index: template({
      type: "index",
      label: "Homepage",
      previewPath: "/",
      sections: [
        inst("index-hero", "hero"),
        inst("index-categories", "categories"),
        inst("index-products", "productFeed"),
        inst("index-brands", "brands"),
        inst("index-whyshop", "whyShop"),
        inst("index-faq", "faq"),
        inst("index-seotext", "richText", {
          settings: {
            heading: "",
            width: "narrow",
            collapsible: true,
            body: `### TRUSTED JUUL SELLER IN UAE\n\nIn the ever-evolving world of vaping, finding a reliable and trusted JUUL seller is essential for residents of Dubai and beyond. Vaping enthusiasts and those looking to make the switch from traditional cigarettes to a less harmful alternative need a reputable source for JUUL Dubai. Vape Shop Dubai provides authentic products and accessories. Look no further than our establishment, the top-rated JUUL seller in Dubai, where quality and customer satisfaction are our top priorities. We pride ourselves on offering only genuine JUUL products. Our commitment to authenticity ensures that customers receive high-quality vaping devices, pods, and accessories that meet the manufacturer's standards for safety and performance. Our extensive inventory features a wide range of JUUL flavors and products, allowing customers to explore different options and find their preferred vaping experience. From classic tobacco to refreshing mint and fruit flavors, we have it all.\n\nWe prioritize the satisfaction and well-being of our customers. Our knowledgeable and friendly staff are available to provide guidance, answer questions, and assist customers in making informed choices about their vaping needs. We offer competitive pricing on all our JUUL products without compromising on quality. We believe that affordability should not come at the expense of authenticity and safety.\n\n### WHAT IS MYLE VAPE: DUBAI'S GO-TO SOURCE FOR MYLE DEVICES & PODS\n\nMyle Vape is a compact, draw-activated pod system designed specifically for adult smokers looking for a straightforward alternative to traditional cigarettes. Originally developed for the MENA market, Myle has become one of the most recognized pod vape brands across the UAE and for good reason. Its slim form factor, salt-nicotine pod compatibility, and consistent performance make it a practical daily carry for vapers at every experience level.\n\nAt Vape Shop Dubai, we stock the complete Myle lineup alongside the full pod flavor selection. Every unit is sourced through authorized distributors. No grey-market stock, no compromised build quality. If you're buying Myle vape in the UAE, authenticity isn't something you should have to question.\n\n### Shop the UAE's Most Top Vape Brands\n\nWe've built our catalog around hardware and e-liquid brands that consistently deliver on performance. On the device side, that means Voopoo, Vaporesso, SMOK, GeekVape, Uwell, and OXVA, each represented with their current pod systems, replacement coils, and compatible cartridges stocked alongside the hardware. For disposables, our range covers Elf Bar, Al Fakher, Fummo, Vasco, MQD, Tugboat, Vapes Bars, and more, selected for flavor accuracy and honest puff capacity. Whether you're after a compact 600-puff device for travel or a high-capacity 10,000-puff model for extended use, you'll find options across both ends of the spectrum.\n\nOur e-liquid selection at Vape Shop Dubai carries freebase nicotine and nicotine salt options across a range of strengths, from 0mg for those tapering off nicotine to 50mg nic salt for daily users coming directly from cigarettes. Brands include Love Salt, Nasty Juice, Tokyo E-Liquid, Kipes Vape, and a curated selection of other internationally-recognized labels chosen for ingredient transparency and consistent production standards.\n\nLooking to buy vape online in Dubai? Our vape store online carries a huge inventory with detailed product pages and real nicotine strength labeling. Orders placed in the working hours qualify for same-day vape delivery in Dubai and Sharjah. For customers in Abu Dhabi, we offer reliable vape delivery Abu Dhabi with typical delivery times clearly listed at checkout.\n\n### NEW TO VAPING? HERE'S WHAT YOU NEED TO KNOW\n\nThe options can feel overwhelming when you're just starting out: dozens of devices, multiple nicotine formats, disposable versus refillable. Most of it simplifies quickly once you understand a few basics. For most people switching from cigarettes, a pod kit with salt nicotine pods or a quality disposable vape is the most practical starting point. The draw feels familiar, the nicotine delivery is satisfying, and the setup requires zero technical knowledge.\n\nOur team works with new vapers regularly and gives honest guidance without pushing the most expensive option. Email us, message us on WhatsApp, or browse online, we are here to help you start right.\n\n### Get It Delivered Fast\n\nRunning out of pods or e-liquid mid-day should not disrupt your routine. We offer same-day or next-day vape delivery across Dubai, Abu Dhabi, Sharjah, Ajman, Fujairah, Al Ain, Umm Al Quwain, and the wider UAE, with 3-hour vape delivery available in Dubai for orders placed during operating hours. Delivery runs seven days a week with no minimum order requirement, and delivery times are listed accurately at checkout. No optimistic estimates.\n\nOur delivery coverage includes:\n\n- 3-hour delivery across Dubai, depending on your location\n- Same-day or next-day delivery to Abu Dhabi, Sharjah, and major UAE cities\n- Vape home delivery available seven days a week\n- No minimum order on any delivery\n\n### Always in Stock, Always Authentic\n\nCounterfeit vape products are more common in the UAE market than most people realize, and the consequences go beyond poor performance. Fake coils burn out faster, counterfeit pod systems often lack proper battery protection, and mislabeled e-liquids may contain nicotine concentrations that don't match the label. Every product we carry comes through verified supply chains with traceable sourcing. No parallel imports, no unverifiable bulk stock, no compromises. If it is listed here, it is exactly what the manufacturer produced.\n\n### The Best Online Vape Shop in the UAE\n\nOur online vape store offers a huge inventory, competitive prices, and fast delivery options across the UAE. Browse the full catalog, filter by brand or category, check price prices and see exactly what ships out in real-time. Real-time stock updates mean what you see is what's actually available, no back-and-forth after ordering.\n\nWhether you are searching for the best vape shop near you, buying vape online in Dubai for the first time, or just need a reliable source that ships fast, Vape Shop Dubai delivers on all of it. The best online vape shop in the UAE is now as close as your phone.`
          }
        }),
        inst("index-whatsapp", "whatsapp"),
        inst("index-blog", "blogPosts"),
      ],
    }),

    /* ═══ Collections — the default plus one template per family ═══ */
    collection: deriveDefaultCollectionTemplate(COLLECTION_BASE),
    ...deriveCollectionFamilyTemplates(COLLECTION_BASE),

    /* ═══ Product (default for every handle) ═══ */
    product: template({
      type: "product",
      label: "Product pages",
      previewPath: "/product/",
      sections: [
        inst("prod-main", "productMain"),
        inst("prod-juul-menthol", "juulCrispMenthol", { showWhen: "productIsJuul" }),
        inst("prod-why-choose", "whyChooseProduct", { showWhen: "productIsNotJuul" }),
        inst("prod-key-specs", "productKeySpecs", { showWhen: "productIsGeneric" }),
        inst("prod-flavors", "productFlavors"),
        inst("prod-final-thoughts", "productFinalThoughts"),
        inst("prod-faq", "faq"),
        inst("prod-reviews", "customerReviews"),
        inst("prod-whatsapp", "whatsapp"),
        inst("prod-related", "relatedProducts", { showWhen: "hasRelatedProducts" }),
      ],
    }),

    /* ═══ Static pages ═══ */
    "page:about-us": template({
      type: "page",
      label: "About Us",
      handle: "about-us",
      previewPath: "/about-us",
      sections: [
        inst("about-header", "pageHeader", {
          settings: {
            eyebrow: "Our Story",
            heading: "About Vape Shop Dubai",
            subheading:
              "Dubai's trusted source for authentic vaping products, delivered in hours.",
            centered: true,
          },
        }),
        inst("about-body", "richText", {
          settings: { heading: "", body: ABOUT_BODY, width: "narrow" },
        }),
        inst("about-whyshop", "whyShop"),
        inst("about-whatsapp", "whatsapp"),
      ],
    }),

    "page:contact": template({
      type: "page",
      label: "Contact",
      handle: "contact",
      previewPath: "/contact",
      sections: [
        inst("contact-header", "pageHeader", {
          settings: {
            eyebrow: "Get in Touch",
            heading: "Contact Vape Shop Dubai",
            subheading: "We reply on WhatsApp in under two minutes, around the clock.",
            centered: true,
          },
        }),
        inst("contact-form", "contactForm"),
        inst("contact-details", "contactDetails"),
        inst("contact-whatsapp", "whatsapp"),
        inst("contact-faq", "faq"),
      ],
    }),

    "page:shipping-delivery": template({
      type: "page",
      label: "Shipping & Delivery",
      handle: "shipping-delivery",
      previewPath: "/shipping-delivery",
      sections: [
        inst("ship-header", "pageHeader", {
          settings: {
            eyebrow: "Delivery",
            heading: "Shipping & Delivery",
            subheading: "Express delivery across Dubai and the UAE.",
            centered: true,
          },
        }),
        inst("ship-body", "richText", {
          settings: { heading: "", body: SHIPPING_BODY, width: "narrow" },
        }),
        inst("ship-whatsapp", "whatsapp"),
      ],
    }),

    "page:privacy-policy": template({
      type: "page",
      label: "Privacy Policy",
      handle: "privacy-policy",
      previewPath: "/privacy-policy",
      sections: [
        inst("privacy-header", "pageHeader", {
          settings: {
            eyebrow: "Legal",
            heading: "Privacy Policy",
            subheading: "How we handle your personal information.",
            centered: true,
          },
        }),
        inst("privacy-body", "richText", {
          settings: { heading: "", body: PRIVACY_BODY, width: "narrow" },
        }),
      ],
    }),

    "page:terms-conditions": template({
      type: "page",
      label: "Terms & Conditions",
      handle: "terms-conditions",
      previewPath: "/terms-conditions",
      sections: [
        inst("terms-header", "pageHeader", {
          settings: {
            eyebrow: "Legal",
            heading: "Terms & Conditions",
            subheading: "The rules that apply when you buy from us.",
            centered: true,
          },
        }),
        inst("terms-body", "richText", {
          settings: { heading: "", body: TERMS_BODY, width: "narrow" },
        }),
      ],
    }),
  };
}

/* ── Header & footer ──────────────────────────────────────────────── */

const DEFAULT_HEADER: ThemeSettings["header"] = {
  announcementEnabled: true,
  announcementText:
    "🚀 FREE DELIVERY ON ORDERS 300AED+  |  ⚡ SAME DAY DELIVERY  |  💳 COD & CREDIT CARD MACHINE ON DELIVERY",
  logoText: "VAPE SHOP",
  logoSubText: "DUBAI",
  menu: [
    { label: "HOME", href: "/", children: [] },
    { label: "SHOP", href: "/shop", children: [] },
    {
      label: "JUUL",
      href: "/collections/juul-vape-dubai",
      children: [
        { label: "JUUL 1 Series", href: "/collections/juul-1-series" },
        { label: "JUUL 2 Series", href: "/collections/juul-2-series" },
        { label: "JUUL Pods", href: "/collections/juul-pods-offers" },
      ],
    },
    {
      label: "MYLE",
      href: "/collections/myle-vape-dubai",
      children: [
        { label: "Myle v5 Pods", href: "/collections/myle-v5-pods" },
        { label: "Myle v5 Device", href: "/collections/myle-v5-device" },
        { label: "Myle Disposable", href: "/collections/myle-disposable" },
      ],
    },
    {
      label: "DISPOSABLE",
      href: "/collections/disposable-vape",
      children: [
        { label: "Al Fakher Vape", href: "/collections/al-fakher-vape" },
        { label: "Elf Bar Vape", href: "/collections/elf-bar-vape" },
        { label: "Fummo Vape", href: "/collections/fummo-vape" },
        { label: "Pod Salt Vape", href: "/collections/pod-salt-vape" },
        { label: "Vapes Bars", href: "/collections/vapes-bars" },
        { label: "Vozol Vape", href: "/collections/vozol-vape" },
        { label: "Tugboat Vape", href: "/collections/tugboat-vape" },
        { label: "HQD Vape", href: "/collections/hqd-vape" },
        { label: "Lost Mary", href: "/collections/lost-mary-disposable" },
        { label: "Maskking Vape", href: "/collections/maskking-vape" },
        { label: "Geek Bar", href: "/collections/geek-bar-disposable" },
        { label: "Yuoto Vape", href: "/collections/yuoto-vape" },
        { label: "Relx Vape", href: "/collections/relx-vape" },
        { label: "Nerd Vape", href: "/collections/nerd-vape" },
        { label: "Vgod Stig", href: "/collections/vgod-stig" },
        { label: "Silvaper Vape", href: "/collections/silvaper-vape" },
      ],
    },
    {
      label: "E-JUICE",
      href: "/collections/vape-e-juice",
      children: [
        { label: "Salt Nicotine", href: "/collections/salt-nicotine" },
        { label: "Freebase e-liquid", href: "/collections/freebase-e-liquid" },
      ],
    },
    {
      label: "POD SYSTEM",
      href: "/collections/pod-system",
      children: [
        { label: "Pod Kit", href: "/collections/pod-kit" },
        { label: "Pod Cartridge", href: "/collections/pod-cartridge" },
        { label: "Vape Coils", href: "/collections/vape-coils" },
      ],
    },
    {
      label: "BRAND",
      href: "/collections/brand",
      children: [
        { label: "Oxva Vape", href: "/collections/oxva-vape" },
        { label: "Uwell Vape", href: "/collections/uwell-vape" },
        { label: "Vaporesso Vape", href: "/collections/vaporesso-vape" },
        { label: "Smok Vape", href: "/collections/smok-vape" },
        { label: "Geek Vape", href: "/collections/geek-vape" },
        { label: "Voopoo Vape", href: "/collections/voopoo-vape" },
      ],
    },
    { label: "BLOG", href: "/blog", children: [] },
  ],
};

const DEFAULT_FOOTER: ThemeSettings["footer"] = {
  trustItems: [
    { icon: "Truck", title: "1-2 Hr Express Delivery", subtitle: "Dubai, Sharjah & Ajman" },
    { icon: "ShieldCheck", title: "100% Authentic UAE", subtitle: "Scratch-code verified" },
    { icon: "CreditCard", title: "Cash & Card on Delivery", subtitle: "Pay at your doorstep" },
    { icon: "Clock", title: "24/7 Instant Dispatch", subtitle: "365 days non-stop service" },
  ],
  description:
    "Dubai's leading online vape store. Authorized retailer of 100% authentic JUUL pods, MYLE devices, high-puff disposable vapes, and premium nicotine salts with 1–2 hour delivery across UAE.",
  whatsappLabel: "WhatsApp Order",
  whatsappNumber: "971582839787",
  ratingText: "4.9 / 5.0",
  columns: [
    {
      heading: "Shop Categories",
      links: [
        { label: "Disposable Vapes", href: "/collections/disposables" },
        { label: "JUUL 2 & JUUL Pods", href: "/collections/juul" },
        { label: "MYLE V5 & Pod Kits", href: "/collections/myle" },
        { label: "E-Liquids & Nic Salts", href: "/collections/e-liquids" },
        { label: "Pod Systems & Coils", href: "/collections/accessories" },
      ],
    },
    {
      heading: "Top Brands",
      links: [
        { label: "Tugboat Vape Dubai", href: "/collections/disposables?brand=Tugboat" },
        { label: "Elf Bar & Lost Mary", href: "/collections/disposables?brand=Elf+Bar" },
        { label: "Al Fakher Crown Bar", href: "/collections/disposables?brand=Al+Fakher" },
        { label: "JUUL Dubai UAE", href: "/collections/juul" },
        { label: "MYLE Dubai Official", href: "/collections/myle" },
      ],
    },
  ],
  contactHeading: "Store & Support",
  addressLabel: "Dubai Dispatch Center",
  address: "International City, Dubai, UAE",
  phone: "+971 58 283 9787",
  email: "vapshopdubai@gmail.com",
  hoursNote: "24/7 Delivery & Support across Dubai",
  healthWarning:
    "UAE 21+ ONLY: Products contain nicotine, an addictive chemical. For adult smokers (21+) in the UAE. Keep out of reach of children and pets.",
  paymentBadges: [
    { icon: "CreditCard", label: "Cash / Card on Delivery" },
    { icon: "Link2", label: "Link Pay Accepted" },
    { icon: "Award", label: "Licensed UAE" },
  ],
  copyright: "© 2026 Vape Shop Dubai. All rights reserved.",
  poweredByLabel: "Webestone",
  poweredByHref: "https://webestone.com",
  bottomLinks: [
    { label: "Terms", href: "/terms-conditions" },
    { label: "Privacy", href: "/privacy-policy" },
    { label: "Shipping", href: "/shipping-delivery" },
  ],
};

export function createDefaultSettings(): ThemeSettings {
  return {
    version: THEME_VERSION,
    header: structuredClone(DEFAULT_HEADER),
    footer: structuredClone(DEFAULT_FOOTER),
    templates: buildTemplates(),
  };
}

/** Convenience singleton for read-only use (render fallbacks, tests). */
export const DEFAULT_THEME_SETTINGS: ThemeSettings = createDefaultSettings();
