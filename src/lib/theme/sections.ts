import type { FieldDef } from "./field-types";
import type { TemplateType } from "./types";

/**
 * The section catalogue.
 *
 * Every entry is one section type a merchant can place on a template: what
 * it's called, which templates accept it, what fields it exposes, and the
 * content a fresh instance starts with.
 *
 * This file is data only — no React — so route handlers and the settings
 * normaliser can import it without pulling in the storefront bundle. The
 * type → component mapping lives in `components/sections/SectionRenderer.tsx`.
 *
 * ── Adding fields to a section ──────────────────────────────────────
 * Extend `fields` and add matching keys to `defaults`. Existing saved
 * instances inherit the new defaults automatically (see `normalize.ts`), and
 * the admin form picks the field up with no UI work.
 */
export interface SectionDef {
  type: string;
  label: string;
  description: string;
  /** Template types this section may be added to. */
  templates: TemplateType[];
  /** Part of the page's core purpose — cannot be removed or hidden. */
  required?: boolean;
  /**
   * Content lives inside the component rather than in settings. These can be
   * reordered, hidden and placed per template, but expose few or no fields
   * until someone extends the schema.
   */
  contentInCode?: boolean;
  fields: FieldDef[];
  defaults: Record<string, unknown>;
}

/* ── Shared field fragments ───────────────────────────────────────── */

/**
 * Accent colour for a card or row.
 *
 * A named choice rather than a colour picker: these tints are paired with
 * borders and backgrounds elsewhere in the design, and an arbitrary hex would
 * break that pairing. Components map the name to classes.
 */
const accentField = (): FieldDef[] => [
  {
    type: "select",
    key: "accent",
    label: "Accent colour",
    options: [
      { label: "Emerald", value: "emerald" },
      { label: "Amber", value: "amber" },
      { label: "Blue", value: "blue" },
      { label: "Purple", value: "purple" },
      { label: "Rose", value: "rose" },
      { label: "Teal", value: "teal" },
    ],
  },
];

const headingFields = (): FieldDef[] => [
  { type: "text", key: "eyebrow", label: "Eyebrow" },
  { type: "text", key: "heading", label: "Heading" },
];

/* ── Registry ─────────────────────────────────────────────────────── */

export const SECTION_REGISTRY: Record<string, SectionDef> = {
  /* ═══════════ Homepage-oriented ═══════════ */

  hero: {
    type: "hero",
    label: "Hero Slider",
    description: "Full-width carousel with promo cards beside it.",
    templates: ["index", "page"],
    fields: [
      {
        type: "number",
        key: "autoplaySeconds",
        label: "Autoplay interval",
        min: 2,
        max: 30,
        step: 1,
        suffix: "sec",
        help: "How long each slide stays before advancing.",
      },
      {
        type: "repeater",
        key: "slides",
        label: "Slides",
        itemNoun: "slide",
        itemLabelKey: "title",
        min: 1,
        max: 8,
        defaultItem: {
          title: "New Slide",
          accent: "Category",
          description: "",
          image: "",
          fallbackImage: "/hero_vape.png",
          tag: "New",
          buttonText: "Shop Now",
          ctaHref: "/shop",
          stat1Value: "",
          stat1Label: "",
          stat2Value: "",
          stat2Label: "",
        },
        fields: [
          { type: "text", key: "accent", label: "Eyebrow / accent line" },
          {
            type: "text",
            key: "title",
            label: "Headline",
            help: "An & in the headline is highlighted in the brand colour.",
          },
          { type: "textarea", key: "description", label: "Description", rows: 3 },
          { type: "text", key: "tag", label: "Badge pill" },
          { type: "image", key: "image", label: "Product image" },
          {
            type: "image",
            key: "fallbackImage",
            label: "Fallback image",
            help: "Used if the main image fails to load.",
          },
          { type: "text", key: "buttonText", label: "Button label" },
          { type: "link", key: "ctaHref", label: "Button link", placeholder: "/collections/..." },
          { type: "text", key: "stat1Value", label: "Stat 1 — value" },
          { type: "text", key: "stat1Label", label: "Stat 1 — label" },
          { type: "text", key: "stat2Value", label: "Stat 2 — value" },
          { type: "text", key: "stat2Label", label: "Stat 2 — label" },
        ],
      },
      {
        type: "repeater",
        key: "promoCards",
        label: "Promo cards",
        itemNoun: "card",
        itemLabelKey: "title",
        max: 3,
        defaultItem: {
          eyebrow: "Collection",
          title: "New Promo Card",
          subtitle: "",
          buttonText: "Shop Now",
          href: "/shop",
          image: "",
          style: "light",
        },
        fields: [
          { type: "text", key: "eyebrow", label: "Eyebrow" },
          { type: "text", key: "title", label: "Title" },
          { type: "text", key: "subtitle", label: "Subtitle" },
          { type: "text", key: "buttonText", label: "Button label" },
          { type: "link", key: "href", label: "Link", placeholder: "/collections/..." },
          { type: "image", key: "image", label: "Image" },
          {
            type: "select",
            key: "style",
            label: "Card style",
            options: [
              { label: "Light card", value: "light" },
              { label: "Solid brand colour", value: "primary" },
            ],
          },
        ],
      },
    ],
    defaults: {
      autoplaySeconds: 6,
      slides: [
        {
          title: "MYLE Devices & Pods",
          accent: "Premium Pod Systems",
          description:
            "If you’re after a simple pod system that feels smooth and reliable, MYLE devices and pods are a solid pick. Shop authentic MYLE V5, V4, and Meta systems from a trusted vape shop Dubai customers turn to for genuine products, strong flavor delivery, and everyday convenience.\nChoose from 5% nicotine strength pods, long-lasting battery life, and compact designs that make MYLE a favorite for adults looking for a premium pod kit vape shop experience in the UAE. Order online from a top-rated vape shop UAE with fast vape delivery Dubai and easy checkout.",
          image:
            "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/myle_slider.webp?v=1786640992",
          fallbackImage: "/Slider/myle_slider.webp",
          tag: "🔥 Premium Pod Systems",
          buttonText: "Shop MYLE Collection",
          ctaHref: "/collections/myle-vape-dubai",
          stat1Value: "5%",
          stat1Label: "Nicotine Strength",
          stat2Value: "V5",
          stat2Label: "Series",
        },
        {
          title: "Disposable Vapes",
          accent: "Premium Disposables",
          description:
            "Looking for the best disposable vape in UAE? Shop popular picks like Lost Mary, Al Fakher Crown Bar, Tugboat, BECO, and more at a trusted vape shop Dubai customers use for fast service and genuine products.\nChoose high-puff options with up to 15,000 puffs, starting from just 40 AED. If you want to order disposable vape in UAE with cash on delivery and quick delivery across Dubai, this is the one to check.",
          image:
            "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/disposable_slider.webp?v=1786640994",
          fallbackImage: "/Slider/disposable_slider.webp",
          tag: "💰 From 40 AED Only",
          buttonText: "Shop Disposables",
          ctaHref: "/collections/disposable-vape",
          stat1Value: "15K",
          stat1Label: "Max Puffs",
          stat2Value: "40",
          stat2Label: "AED Starting",
        },
        {
          title: "Pod Systems & Kits",
          accent: "Vape Devices & Pods",
          description:
            "Are you looking for a best pod kit vape shop, a place that has refillable and pre-filled pod kits Dubai from major brands like Uwell, Geekvape, Vaporesso, OXVA and Voopoo. All these device comes in small portable, easy use body that is designed for immense taste through the usage of proper pods, coils and nicotine salt eliquids.\nBuy Dubai vapers' most-trusted vape kits at a trusted vape shop Dubai for real product delivery every single day and across the UAE.",
          image:
            "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/pod_kits_slider.webp?v=1786640996",
          fallbackImage: "/Slider/pod_kits_slider.webp",
          tag: "⚡ High Performance Kits",
          buttonText: "Shop Pod Systems",
          ctaHref: "/collections/pod-system",
          stat1Value: "100%",
          stat1Label: "Authentic",
          stat2Value: "Top",
          stat2Label: "Global Brands",
        },
        {
          title: "Premium E-Liquids & Salts",
          accent: "Nicotine Salts & Freebase",
          description:
            "Shop premium e-liquids and nicotine salt options from trusted brands like Nasty Juice, Pod Salt, Tokyo, and RufPuf at a reliable vape shop Dubai customers use for quality and choice. Choose from 0mg to 50mg nicotine strength, with over 80 flavors ready for adult vapers who want smooth flavor and solid performance.\nIf you’re looking for a pod salt shop, a best vape pod salt selection, or a trusted online vape store UAE, this is a simple place to buy vape online Dubai with fast delivery across the UAE.",
          image:
            "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/e_liquid_slider.webp?v=1786640998",
          fallbackImage: "/Slider/e_liquid_slider.webp",
          tag: "⭐ 80+ Flavors Available",
          buttonText: "Shop E-Liquids",
          ctaHref: "/collections/vape-e-juice",
          stat1Value: "80+",
          stat1Label: "Flavors",
          stat2Value: "0-50mg",
          stat2Label: "Nicotine Range",
        },
      ],
      promoCards: [
        {
          eyebrow: "JUUL 1 Series",
          title: "JUUL 1 Devices & Pods",
          subtitle: "Original USA Stock · 3% & 5% Nic",
          buttonText: "Shop JUUL 1",
          href: "/collections/juul-1-series",
          image:
            "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/juul_1_slider.webp?v=1786641000",
          style: "light",
        },
        {
          eyebrow: "JUUL 2 Series",
          title: "JUUL 2 Devices & Pods",
          subtitle: "Authentic UK Stock · 18mg Nic",
          buttonText: "Shop JUUL 2",
          href: "/collections/juul-2-series",
          image:
            "https://cdn.shopify.com/s/files/1/0684/3488/6727/files/juul_2_slider.webp?v=1786641001",
          style: "primary",
        },
      ],
    },
  },

  categories: {
    type: "categories",
    label: "Category Tiles",
    description: "Grid of category shortcuts.",
    templates: ["index", "collection", "page"],
    fields: [
      ...headingFields(),
      { type: "text", key: "seeAllLabel", label: "'See all' button label" },
      { type: "link", key: "seeAllHref", label: "'See all' link" },
      {
        type: "repeater",
        key: "items",
        label: "Category tiles",
        itemNoun: "category",
        itemLabelKey: "label",
        max: 40,
        defaultItem: { label: "New Category", image: "/vape_kit.png", href: "/collections/" },
        fields: [
          { type: "text", key: "label", label: "Label" },
          { type: "image", key: "image", label: "Icon image" },
          { type: "link", key: "href", label: "Link", placeholder: "/collections/..." },
        ],
      },
    ],
    defaults: {
      eyebrow: "Browse Directory",
      heading: "Shop by Categories",
      seeAllLabel: "SEE ALL",
      seeAllHref: "/shop",
      items: [
        { label: "JUUL 1 Series", image: "/juul_device.png", href: "/collections/juul-1-series" },
        { label: "JUUL 2 Series", image: "/juul_device.png", href: "/collections/juul-2-series" },
        { label: "JUUL Pods", image: "/juul_device.png", href: "/collections/juul-pods-offers" },
        { label: "Myle v5 Pods", image: "/vape_kit.png", href: "/collections/myle-v5-pods" },
        { label: "Myle v5 Kits", image: "/vape_kit.png", href: "/collections/myle-v5-device" },
        { label: "Myle Disposables", image: "/vape_kit.png", href: "/collections/myle-disposable" },
        { label: "Disposables", image: "/lost_mary.png", href: "/collections/disposable-vape" },
        { label: "Salt Nicotine", image: "/premium_liquid.png", href: "/collections/salt-nicotine" },
        { label: "Freebase Nic", image: "/premium_liquid.png", href: "/collections/freebase-e-liquid" },
        { label: "Pod Kits", image: "/vape_kit.png", href: "/collections/pod-kit" },
        { label: "Cartridges", image: "/vape_kit.png", href: "/collections/pod-cartridge" },
        { label: "Vape Coils", image: "/vape_kit.png", href: "/collections/vape-coils" },
        { label: "Uwell", image: "/vape_kit.png", href: "/collections/uwell-vape" },
        { label: "Vaporesso", image: "/vape_kit.png", href: "/collections/vaporesso-vape" },
        { label: "Geekvape", image: "/vape_kit.png", href: "/collections/geek-vape" },
        { label: "OXVA", image: "/vape_kit.png", href: "/collections/oxva-vape" },
      ],
    },
  },

  flavorsWheel: {
    type: "flavorsWheel",
    label: "Interactive Flavours Wheel",
    description: "Interactive 3D rotating flavour wheel with circular fruit images and quick filter links.",
    templates: ["index", "collection", "product", "page"],
    fields: [
      ...headingFields(),
      { type: "text", key: "buttonText", label: "Button text" },
      { type: "link", key: "buttonHref", label: "Button link" },
      {
        type: "repeater",
        key: "flavors",
        label: "Flavour items",
        itemNoun: "flavour",
        itemLabelKey: "name",
        max: 16,
        defaultItem: {
          name: "New Flavour",
          color: "#f59e0b",
          img: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=200&h=200&fit=crop",
          query: "Flavour",
        },
        fields: [
          { type: "text", key: "name", label: "Flavour Name" },
          { type: "color", key: "color", label: "Accent colour" },
          { type: "image", key: "img", label: "Flavour Image" },
          { type: "text", key: "query", label: "Filter Query / Search keyword" },
        ],
      },
    ],
    defaults: {
      eyebrow: "AUTHENTIC VAPE BRANDS",
      heading: "SHOP BY AUTHORIZED VAPE BRANDS",
      description: "From premium pod systems to disposable vapes and salt e-liquids, shop trusted global vape brands in Dubai.",
      buttonText: "SEE ALL",
      buttonHref: "/shop",
      // Without this key the normaliser has nothing to copy a saved list onto,
      // and every flavour the merchant adds is dropped on the next read.
      flavors: [],
    },
  },

  productFeed: {
    type: "productFeed",
    label: "Product Feed",
    description: "Live products from Shopify, grouped into rows.",
    templates: ["index"],
    contentInCode: true,
    fields: [
      { type: "text", key: "eyebrow", label: "Eyebrow" },
      { type: "text", key: "heading", label: "Heading" },
      { type: "textarea", key: "description", label: "Description", rows: 2 },
      {
        type: "repeater",
        key: "rows",
        label: "Product rows",
        itemNoun: "row",
        itemLabelKey: "title",
        max: 12,
        help: "Each row shows one Shopify collection.",
        defaultItem: {
          title: "New Row",
          collectionHandle: "",
          viewAllHref: "",
          limit: 10,
          style: "standard",
          flashBadgeText: "",
          flashDescription: "",
          showTimer: true,
          timerLabel: "Flash Sale Ends In",
          timerMode: "endOfDay",
          timerEndsAt: "",
          hideTimerWhenExpired: true,
        },
        fields: [
          { type: "text", key: "title", label: "Row heading" },
          {
            type: "collection",
            key: "collectionHandle",
            label: "Collection or Product URL / Handle",
            help: "Collection URL/handle (e.g. 'disposable-vapes' or '/collections/disposable-vapes') to show collection products, OR Product URL/handle (e.g. 'juul-2-starter-kit-dubai' or '/product/juul-2-starter-kit-dubai' or comma-separated URLs) to show specific product(s).",
          },
          {
            type: "number",
            key: "limit",
            label: "Products in this row",
            min: 2,
            max: 24,
            step: 1,
          },
          {
            type: "link",
            key: "viewAllHref",
            label: "'View all' link",
            placeholder: "/collections/...",
            help: "Leave blank to link to the collection above.",
          },
          {
            type: "select",
            key: "style",
            label: "Row style",
            options: [
              { label: "Standard", value: "standard" },
              { label: "Flash sale banner", value: "flashSale" },
            ],
          },
          {
            type: "text",
            key: "flashBadgeText",
            label: "Flash sale — badge",
            placeholder: "⚡ Limited Time Dubai Flash Deals",
            showIf: { key: "style", equals: ["flashSale"] },
          },
          {
            type: "textarea",
            key: "flashDescription",
            label: "Flash sale — description",
            rows: 2,
            showIf: { key: "style", equals: ["flashSale"] },
          },
          {
            type: "toggle",
            key: "showTimer",
            label: "Show countdown timer",
            showIf: { key: "style", equals: ["flashSale"] },
          },
          {
            type: "text",
            key: "timerLabel",
            label: "Timer label",
            showIf: { key: "style", equals: ["flashSale"] },
          },
          {
            type: "select",
            key: "timerMode",
            label: "Counts down to",
            showIf: { key: "style", equals: ["flashSale"] },
            options: [
              { label: "Midnight tonight (restarts daily)", value: "endOfDay" },
              { label: "A specific date & time", value: "fixedDate" },
            ],
          },
          {
            type: "datetime",
            key: "timerEndsAt",
            label: "Ends at",
            showIf: { key: "timerMode", equals: ["fixedDate"] },
            help: "Uses the visitor's local time zone.",
          },
          {
            type: "toggle",
            key: "hideTimerWhenExpired",
            label: "Hide timer once it reaches zero",
            showIf: { key: "timerMode", equals: ["fixedDate"] },
          },
        ],
      },
      {
        type: "number",
        key: "productsPerPage",
        label: "Products per page",
        min: 4,
        max: 48,
        step: 4,
        help: "Used for the paged grid shown when a category or search is active.",
      },
    ],
    defaults: {
      eyebrow: "Live Catalog",
      heading: "Explore Our Collection",
      description: "Shop Juul Dubai, MYLE devices, disposable vape Dubai favorites, pod kits, and nicotine salts from a trusted vape shop Dubai with fast 2-hour delivery.",
      rows: [
        {
          title: "Flash Sale & Daily Steals",
          collectionHandle: "flash-sale",
          viewAllHref: "",
          limit: 10,
          style: "flashSale",
          flashBadgeText: "⚡ Limited Time Dubai Flash Deals",
          flashDescription:
            "Save on JUUL, MYLE, high-puff disposable vapes, and refillable pod kits. Order from a top-rated vape shop UAE with quick Dubai delivery.",
          showTimer: true,
          timerLabel: "Flash Sale Ends In",
          timerMode: "endOfDay",
          timerEndsAt: "",
          hideTimerWhenExpired: true,
        },
        {
          title: "JUUL 1 Series",
          collectionHandle: "juul-1-series",
          viewAllHref: "",
          limit: 10,
          style: "standard",
          flashBadgeText: "",
          flashDescription: "",
          showTimer: true,
          timerLabel: "Flash Sale Ends In",
          timerMode: "endOfDay",
          timerEndsAt: "",
          hideTimerWhenExpired: true,
        },
        {
          title: "JUUL 2 Series",
          collectionHandle: "juul-2-series",
          viewAllHref: "",
          limit: 10,
          style: "standard",
          flashBadgeText: "",
          flashDescription: "",
          showTimer: true,
          timerLabel: "Flash Sale Ends In",
          timerMode: "endOfDay",
          timerEndsAt: "",
          hideTimerWhenExpired: true,
        },
        {
          title: "DISPOSABLE VAPE",
          collectionHandle: "disposable-vape",
          viewAllHref: "",
          limit: 10,
          style: "standard",
          flashBadgeText: "",
          flashDescription: "",
          showTimer: true,
          timerLabel: "Flash Sale Ends In",
          timerMode: "endOfDay",
          timerEndsAt: "",
          hideTimerWhenExpired: true,
        },
        {
          title: "Best Sellers",
          collectionHandle: "best-seller-vape",
          viewAllHref: "",
          limit: 10,
          style: "standard",
          flashBadgeText: "",
          flashDescription: "",
          showTimer: true,
          timerLabel: "Flash Sale Ends In",
          timerMode: "endOfDay",
          timerEndsAt: "",
          hideTimerWhenExpired: true,
        },
      ],
      productsPerPage: 12,
    },
  },

  brands: {
    type: "brands",
    label: "Shop by Brands",
    description: "Brand tile grid with an optional flavour wheel.",
    templates: ["index", "collection", "product", "page"],
    fields: [
      ...headingFields(),
      { type: "text", key: "seeAllLabel", label: "'See all' button label" },
      { type: "link", key: "seeAllHref", label: "'See all' link" },
      {
        type: "toggle",
        key: "showFlavorWheel",
        label: "Show flavour wheel",
        help: "The interactive 'Shop by Flavour' wheel below the grid.",
      },
      {
        type: "text",
        key: "flavorWheelEyebrow",
        label: "Wheel eyebrow text",
        showIf: { key: "showFlavorWheel", equals: ["true"] },
      },
      {
        type: "text",
        key: "flavorWheelHeading",
        label: "Wheel heading",
        showIf: { key: "showFlavorWheel", equals: ["true"] },
      },
      {
        type: "textarea",
        key: "flavorWheelDescription",
        label: "Wheel description",
        showIf: { key: "showFlavorWheel", equals: ["true"] },
      },
      {
        type: "text",
        key: "flavorWheelButtonText",
        label: "Wheel CTA button text",
        showIf: { key: "showFlavorWheel", equals: ["true"] },
      },
      {
        type: "link",
        key: "flavorWheelButtonHref",
        label: "Wheel CTA link",
        showIf: { key: "showFlavorWheel", equals: ["true"] },
      },
      {
        type: "repeater",
        key: "flavorItems",
        label: "Flavor wheel items",
        itemNoun: "flavor",
        itemLabelKey: "name",
        showIf: { key: "showFlavorWheel", equals: ["true"] },
        defaultItem: {
          name: "New Flavor",
          img: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=200&h=200&fit=crop",
          color: "#000000",
          query: "Flavor",
        },
        fields: [
          { type: "text", key: "name", label: "Flavor name" },
          { type: "image", key: "img", label: "Flavor image" },
          { type: "text", key: "color", label: "Accent color (hex)" },
          { type: "text", key: "query", label: "Search query" },
        ],
      },
      {
        type: "repeater",
        key: "items",
        label: "Brand tiles",
        itemNoun: "brand",
        itemLabelKey: "name",
        max: 40,
        defaultItem: { name: "New Brand", image: "/vape_kit.png", href: "/collections/" },
        fields: [
          { type: "text", key: "name", label: "Brand name" },
          { type: "image", key: "image", label: "Icon image" },
          { type: "link", key: "href", label: "Link", placeholder: "/collections/..." },
        ],
      },
    ],
    defaults: {
      eyebrow: "Taste the Difference",
      heading: "Best Vape Brands in Dubai",
      seeAllLabel: "SEE ALL",
      seeAllHref: "/shop",
      showFlavorWheel: true,
      flavorWheelEyebrow: "Taste the Difference",
      flavorWheelHeading: "Best Flavours",
      flavorWheelDescription: "From fruity bursts to icy hits, Best Flavours bring your vibe to life with every puff.",
      flavorWheelButtonText: "Shop Now",
      flavorWheelButtonHref: "/collections/disposable-vape",
      flavorItems: [
        { name: "Mango & Tropical", color: "#f59e0b", img: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=200&h=200&fit=crop", query: "Mango" },
        { name: "Strawberry & Kiwi", color: "#ef4444", img: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200&h=200&fit=crop", query: "Strawberry" },
        { name: "Blue Razz & Ice", color: "#3b82f6", img: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=200&h=200&fit=crop", query: "Blueberry" },
        { name: "Watermelon Blast", color: "#ec4899", img: "https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=200&h=200&fit=crop", query: "Watermelon" },
        { name: "Mint & Menthol", color: "#06b6d4", img: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=200&h=200&fit=crop", query: "Mint" },
        { name: "Double Apple", color: "#10b981", img: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200&h=200&fit=crop", query: "Apple" },
        { name: "Peach & Nectarine", color: "#f97316", img: "https://images.unsplash.com/photo-1629828874514-c1e5103f2150?w=200&h=200&fit=crop", query: "Peach" },
        { name: "Grape Ice", color: "#8b5cf6", img: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=200&h=200&fit=crop", query: "Grape" },
        { name: "Cherry & Cola", color: "#dc2626", img: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=200&h=200&fit=crop", query: "Cherry" },
        { name: "Citrus & Lemonade", color: "#eab308", img: "https://images.unsplash.com/photo-1590502593747-422e1a3bcbe8?w=200&h=200&fit=crop", query: "Citrus" },
        { name: "Pineapple & Coconut", color: "#ca8a04", img: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=200&h=200&fit=crop", query: "Pineapple" },
        { name: "Berry Mix & Acai", color: "#d946ef", img: "https://images.unsplash.com/photo-1518635017498-87f514b751ba?w=200&h=200&fit=crop", query: "Berry" },
        { name: "Cigarette & Tobacco", color: "#b45309", img: "https://images.unsplash.com/photo-1527016016493-4dece38a17a6?w=200&h=200&fit=crop", query: "Tobacco" },
        { name: "Sweet Candy & Soda", color: "#38bdf8", img: "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=200&h=200&fit=crop", query: "Candy" },
      ],
      items: [
        { name: "JUUL", image: "/juul_device.png", href: "/collections/juul-vape-dubai" },
        { name: "MYLE", image: "/vape_kit.png", href: "/collections/myle-vape-dubai" },
        { name: "GeekVape", image: "/vape_kit.png", href: "/collections/geek-vape" },
        { name: "Uwell", image: "/vape_kit.png", href: "/collections/uwell-vape" },
        { name: "Vaporesso", image: "/vape_kit.png", href: "/collections/vaporesso-vape" },
        { name: "VooPoo", image: "/vape_kit.png", href: "/collections/voopoo-vape" },
        { name: "Smok", image: "/vape_kit.png", href: "/collections/smok-vape" },
        { name: "Oxva", image: "/vape_kit.png", href: "/collections/oxva-vape" },
        { name: "Elf Bar", image: "/lost_mary.png", href: "/collections/elf-bar-vape" },
        { name: "Lost Mary", image: "/lost_mary.png", href: "/collections/lost-mary-disposable" },
        { name: "Tugboat", image: "/lost_mary.png", href: "/collections/tugboat-vape" },
        { name: "SKE Crystal", image: "/lost_mary.png", href: "/collections/disposable-vape" },
        { name: "Pod Salt", image: "/premium_liquid.png", href: "/collections/pod-salt-vape" },
        { name: "Nasty Juice", image: "/premium_liquid.png", href: "/collections/salt-nicotine" },
        { name: "IVG", image: "/premium_liquid.png", href: "/collections/salt-nicotine" },
        { name: "Al Fakher", image: "/premium_liquid.png", href: "/collections/al-fakher-vape" },
      ],
    },
  },

  whyShop: {
    type: "whyShop",
    label: "Why Shop With Us",
    description: "Trust pillars with icons.",
    templates: ["index", "collection", "product", "page"],
    fields: [
      { type: "text", key: "badgeText", label: "Badge text" },
      { type: "text", key: "headingLead", label: "Heading — first part" },
      {
        type: "text",
        key: "headingHighlight",
        label: "Heading — highlighted part",
        help: "Rendered in the brand colour.",
      },
      { type: "textarea", key: "description", label: "Description", rows: 3 },
      { type: "text", key: "pillTitle", label: "Side pill — title" },
      { type: "text", key: "pillSubtitle", label: "Side pill — subtitle" },
      { type: "text", key: "footerNote", label: "Card footer note" },
      {
        type: "repeater",
        key: "pillars",
        label: "Pillars",
        itemNoun: "pillar",
        itemLabelKey: "title",
        max: 12,
        defaultItem: { icon: "BadgeCheck", title: "New Pillar", subtitle: "", badge: "" },
        fields: [
          { type: "icon", key: "icon", label: "Icon" },
          { type: "text", key: "title", label: "Title" },
          { type: "textarea", key: "subtitle", label: "Description", rows: 3 },
          { type: "text", key: "badge", label: "Corner badge" },
        ],
      },
    ],
    defaults: {
      badgeText: "The Dubai Vape Standard",
      headingLead: "Why Shop With",
      headingHighlight: "Vape Shop Dubai?",
      description:
        "We’re a trusted vape shop Dubai customers rely on for 100% authentic vape products, fast delivery, and a smooth shopping experience. From Juul Dubai and MYLE to disposable vapes, pod kits, and e-liquids, we keep the good stuff in stock and get it to your door fast.",
      pillTitle: "Licensed UAE Importer",
      pillSubtitle: "Serving Dubai, Abu Dhabi, Sharjah & All Emirates",
      footerNote: "Verified Service Commitment",
      pillars: [
        {
          icon: "Truck",
          title: "2-Hour Express Dubai Delivery",
          subtitle:
            "Order before 10 PM for fast same day vape delivery Dubai. We deliver across Dubai with quick turnaround and easy checkout.",
          badge: "Express Speed",
        },
        {
          icon: "ShieldCheck",
          title: "100% Guaranteed Authentic",
          subtitle:
            "Shop with confidence at an authentic vape shop in Dubai. We source genuine products from certified distributors and stock only original devices, pods, and e-liquids.",
          badge: "Certified Original",
        },
        {
          icon: "CreditCard",
          title: "Cash & Card on Delivery",
          subtitle:
            "Need a cash on delivery vape shop? No problem. Pay at your door with cash or card for a simple, hassle-free order.",
          badge: "Flexible Payment",
        },
        {
          icon: "Headphones",
          title: "24/7 Dedicated WhatsApp Support",
          subtitle:
            "Got a question about Juul, MYLE, disposable vape Dubai, or pod kits? Message us anytime. Our team’s here to help with product advice and order support.",
          badge: "Always Available",
        },
        {
          icon: "Tag",
          title: "Direct Wholesale Pricing",
          subtitle:
            "Looking for the best vape shop in Dubai with fair prices? We keep pricing sharp on disposables, pod systems, Juul pods, and nicotine salts.",
          badge: "Best Value",
        },
        {
          icon: "RefreshCw",
          title: "Zero-Hassle Free Replacements",
          subtitle:
            "If a factory defect shows up on arrival, we’ll handle it fast. We keep things simple so you can shop from a top rated vape shop in Dubai with peace of mind.",
          badge: "Buyer Protection",
        },
      ],
    },
  },

  faq: {
    type: "faq",
    label: "FAQ",
    description:
      "Questions and answers. On the homepage these also feed the FAQ structured data Google reads.",
    templates: ["index", "collection", "product", "page"],
    fields: [
      { type: "text", key: "badgeText", label: "Badge text" },
      { type: "text", key: "heading", label: "Heading" },
      { type: "textarea", key: "description", label: "Description", rows: 3 },
      { type: "text", key: "deliveryBadge", label: "Corner badge" },
      { type: "text", key: "verifiedNote", label: "Answer footer note" },
      {
        type: "repeater",
        key: "items",
        label: "Questions",
        itemNoun: "question",
        itemLabelKey: "question",
        max: 40,
        defaultItem: { question: "New question", answer: "", category: "products" },
        fields: [
          { type: "text", key: "question", label: "Question" },
          { type: "textarea", key: "answer", label: "Answer", rows: 5 },
        ],
      },
    ],
    defaults: {
      badgeText: "Customer Help & FAQs",
      heading: "Frequently Asked Questions",
      description:
        "Find instant answers regarding 2-hour express delivery in Dubai, product authenticity, card payments on delivery, and vape device selection.",
      deliveryBadge: "2-Hour Delivery",
      verifiedNote: "Verified Answer for Dubai & UAE Customers",
      items: [
        {
          question: "How fast is vape delivery in Dubai and across the UAE?",
          answer:
            "We offer 2-Hour Express Delivery in Dubai for all orders placed before 10:00 PM. For Abu Dhabi, Sharjah, Ajman, RAK, Fujairah, and UAQ, we provide guaranteed same-day or next-day express delivery.",
          category: "delivery",
        },
        {
          question: "Are all vapes, pods, and devices 100% authentic?",
          answer:
            "Yes, 100%! All devices, disposable vapes, pods, and e-liquids sold at Vape Shop Dubai are directly imported from certified manufacturers and authorized regional distributors. Every product features a security seal and scannable QR verification code.",
          category: "authenticity",
        },
        {
          question: "Can I pay by card when the delivery driver arrives?",
          answer:
            "Yes! We support Cash on Delivery (COD) as well as Card Machine on Delivery. Our delivery riders carry mobile wireless card terminals accepting Visa, Mastercard, Apple Pay, and contactless payments.",
          category: "payment",
        },
        {
          question: "What is the difference between JUUL 1 and JUUL 2?",
          answer:
            "JUUL 2 is the next-generation pod system featuring enhanced airflow, smart LED battery level indicators, anti-counterfeit pod detection, and 18mg nicotine salt pods. JUUL 1 is the classic minimal device available in 3% and 5% USA nicotine strengths.",
          category: "products",
        },
        {
          question: "What is the difference between Nicotine Salt and Freebase E-Liquids?",
          answer:
            "Nicotine Salt e-liquids provide a smoother throat hit at higher nicotine concentrations (20mg to 50mg), making them ideal for pod systems like Caliburn, XROS, and MYLE. Freebase e-liquids have higher VG ratios designed for sub-ohm mod kits to produce thick vapor clouds.",
          category: "products",
        },
        {
          question: "What is the legal age to buy vape products in Dubai?",
          answer:
            "In accordance with UAE federal regulations, you must be at least 18 years of age or older to purchase electronic cigarettes, nicotine pods, or vaping accessories.",
          category: "authenticity",
        },
        {
          question: "What should I do if a disposable vape or device is defective?",
          answer:
            "All products are backed by our 100% Satisfaction Guarantee. If you receive a defective unit or damaged item, contact our customer support team via WhatsApp within 24 hours for an immediate free replacement.",
          category: "delivery",
        },
      ],
    },
  },

  whatsapp: {
    type: "whatsapp",
    label: "WhatsApp CTA",
    description: "Contact banner with a WhatsApp button.",
    templates: ["index", "collection", "product", "page"],
    fields: [
      { type: "text", key: "badgeText", label: "Badge text" },
      { type: "text", key: "responseNote", label: "Response-time note" },
      { type: "text", key: "heading", label: "Heading" },
      { type: "textarea", key: "description", label: "Description", rows: 3 },
      { type: "text", key: "contactLabel", label: "Contact card label" },
      {
        type: "text",
        key: "phoneNumber",
        label: "WhatsApp number",
        placeholder: "971582839787",
        help: "Digits only, with country code and no +.",
      },
      { type: "text", key: "phoneDisplay", label: "Number as displayed" },
      { type: "textarea", key: "prefilledMessage", label: "Pre-filled message", rows: 2 },
      { type: "text", key: "buttonText", label: "Button label" },
      {
        type: "repeater",
        key: "features",
        label: "Feature badges",
        itemNoun: "badge",
        itemLabelKey: "label",
        max: 6,
        defaultItem: { icon: "BadgeCheck", label: "New badge" },
        fields: [
          { type: "icon", key: "icon", label: "Icon" },
          { type: "text", key: "label", label: "Label" },
        ],
      },
    ],
    defaults: {
      badgeText: "Live WhatsApp Support",
      responseNote: "Avg Response < 2 Mins",
      heading: "Need Help Choosing or Prefer Direct WhatsApp Ordering?",
      description:
        "Chat with our vape shop Dubai team for quick help with JUUL Dubai, MYLE devices, disposable vape Dubai, and pod kits. Get product advice, bundle offers, and fast checkout with 2-hour vape delivery Dubai.",
      features: [
        { icon: "Zap", label: "2-Hour Express Delivery" },
        { icon: "ShieldCheck", label: "100% Authentic Products" },
        { icon: "MessageCircle", label: "Cash / Card on Delivery" },
      ],
      contactLabel: "Official Contact",
      phoneNumber: "971582839787",
      phoneDisplay: "+971 58 283 9787",
      prefilledMessage:
        "Hello Vape Shop Dubai, I need assistance or would like to place an order!",
      buttonText: "Chat on WhatsApp",
    },
  },

  blogPosts: {
    type: "blogPosts",
    label: "Blog Posts",
    description: "Latest articles pulled from Shopify.",
    templates: ["index", "page"],
    fields: [
      { type: "text", key: "badgeText", label: "Badge text" },
      { type: "text", key: "heading", label: "Heading" },
      { type: "textarea", key: "description", label: "Description", rows: 3 },
      {
        type: "articles",
        key: "selectedPosts",
        label: "Select Blog Articles (Checkmark Dropdown)",
        help: "Checkmark specific blog articles to display on the home page. Leave empty to automatically show latest articles.",
      },
      { type: "text", key: "viewAllLabel", label: "'View all' label" },
      { type: "link", key: "viewAllHref", label: "'View all' link" },
      { type: "number", key: "postCount", label: "Max posts to show", min: 1, max: 9, step: 1 },
    ],
    defaults: {
      badgeText: "Vape Dubai Journal & Guides",
      heading: "Latest Vaping Guides & Insights",
      description:
        "Read simple guides on best disposable vape in UAE, JUUL 2, vape price in Dubai, nicotine salts, and UAE vape rules. Stay updated with product reviews and tips from a trusted vape shop UAE.",
      selectedPosts: "",
      viewAllLabel: "View All Articles",
      viewAllHref: "/blog",
      postCount: 3,
    },
  },


  /* ═══════════ Static page building blocks ═══════════ */

  pageHeader: {
    type: "pageHeader",
    label: "Page Header",
    description: "Title block at the top of a static page.",
    templates: ["page"],
    fields: [
      { type: "text", key: "eyebrow", label: "Eyebrow" },
      { type: "text", key: "heading", label: "Heading" },
      { type: "textarea", key: "subheading", label: "Subheading", rows: 3 },
      { type: "toggle", key: "centered", label: "Centre the text" },
    ],
    defaults: {
      eyebrow: "",
      heading: "Page Title",
      subheading: "",
      centered: true,
    },
  },

  richText: {
    type: "richText",
    label: "Text Block",
    description: "Heading plus body copy. Blank lines become paragraphs.",
    templates: ["page", "index", "collection", "product"],
    fields: [
      { type: "text", key: "heading", label: "Heading" },
      {
        type: "richtext",
        key: "body",
        label: "Body",
        rows: 10,
        help: "Leave a blank line between paragraphs. Start a line with '- ' for a bullet. Start a line with '### ' for a heading. Wrap in **text** for bold.",
      },
      {
        type: "select",
        key: "width",
        label: "Content width",
        options: [
          { label: "Readable column", value: "narrow" },
          { label: "Full width", value: "wide" },
        ],
      },
      { type: "toggle", key: "collapsible", label: "Make content collapsible (Read More)" },
    ],
    defaults: { heading: "", body: "", width: "narrow", collapsible: false },
  },

  featureGrid: {
    type: "featureGrid",
    label: "Feature Grid",
    description: "Icon cards in a responsive grid.",
    templates: ["page", "index", "collection", "product"],
    fields: [
      { type: "text", key: "heading", label: "Heading" },
      { type: "textarea", key: "description", label: "Description", rows: 2 },
      {
        type: "repeater",
        key: "items",
        label: "Cards",
        itemNoun: "card",
        itemLabelKey: "title",
        max: 12,
        defaultItem: { icon: "BadgeCheck", title: "New card", body: "" },
        fields: [
          { type: "icon", key: "icon", label: "Icon" },
          { type: "text", key: "title", label: "Title" },
          { type: "textarea", key: "body", label: "Body", rows: 3 },
        ],
      },
    ],
    defaults: { heading: "", description: "", items: [] },
  },

  contactForm: {
    type: "contactForm",
    label: "Contact Form",
    description: "Enquiry form that emails the store.",
    templates: ["page"],
    fields: [
      { type: "text", key: "heading", label: "Heading" },
      { type: "textarea", key: "description", label: "Description", rows: 2 },
      { type: "text", key: "nameLabel", label: "Name field label" },
      { type: "text", key: "phoneLabel", label: "Phone field label" },
      { type: "text", key: "orderIdLabel", label: "Order ID field label" },
      { type: "text", key: "subjectLabel", label: "Subject field label" },
      { type: "text", key: "messageLabel", label: "Message field label" },
      { type: "text", key: "submitLabel", label: "Submit button label" },
      { type: "text", key: "successMessage", label: "Success message" },
    ],
    defaults: {
      heading: "Send us a message",
      description:
        "Fill in the form and our Dubai team will get back to you, usually within a few minutes.",
      nameLabel: "Your name",
      phoneLabel: "Phone number",
      orderIdLabel: "Order ID (optional)",
      subjectLabel: "Subject",
      messageLabel: "Message",
      submitLabel: "Send message",
      successMessage: "Thanks — we've received your message and will reply shortly.",
    },
  },

  contactDetails: {
    type: "contactDetails",
    label: "Contact Details",
    description: "Address, phone, email and opening hours.",
    templates: ["page"],
    fields: [
      { type: "text", key: "heading", label: "Heading" },
      { type: "text", key: "addressLabel", label: "Address label" },
      { type: "textarea", key: "address", label: "Address", rows: 2 },
      { type: "text", key: "phone", label: "Phone" },
      { type: "text", key: "email", label: "Email" },
      { type: "text", key: "hours", label: "Opening hours" },
      { type: "text", key: "mapEmbedUrl", label: "Map embed URL", help: "Optional Google Maps embed link." },
    ],
    defaults: {
      heading: "Visit or Contact Us",
      addressLabel: "Dubai Dispatch Center",
      address: "International City, Dubai, UAE",
      phone: "+971 58 283 9787",
      email: "vapshopdubai@gmail.com",
      hours: "24/7 Delivery & Support across Dubai",
      mapEmbedUrl: "",
    },
  },

  /* ═══════════ Collection template ═══════════ */

  collectionMain: {
    type: "collectionMain",
    label: "Product Grid & Filters",
    description:
      "The collection's products, filters, sorting and banner. Always shown — it is the page.",
    templates: ["collection"],
    required: true,
    contentInCode: true,
    fields: [
      {
        type: "number",
        key: "itemsPerPage",
        label: "Products per page",
        min: 4,
        max: 48,
        step: 4,
      },
      {
        type: "select",
        key: "defaultSort",
        label: "Default sort",
        options: [
          { label: "Popularity", value: "popular" },
          { label: "Price: low to high", value: "price-low" },
          { label: "Price: high to low", value: "price-high" },
          { label: "Average rating", value: "rating" },
        ],
      },
      {
        type: "text",
        key: "brandFlagshipHeading",
        label: "Brand directory — flagship heading",
        help: "Only shown on the brand directory page, which lists brands instead of products.",
      },
      {
        type: "text",
        key: "brandDirectoryHeading",
        label: "Brand directory — all-brands heading",
      },
    ],
    defaults: {
      itemsPerPage: 12,
      defaultSort: "popular",
      brandFlagshipHeading: "Flagship Certified Brands",
      brandDirectoryHeading: "All Certified Brands",
    },
  },


  disposableShowcase: {
    type: "disposableShowcase",
    label: "Disposable Brands Showcase",
    description: "Disposable brand highlight strip.",
    templates: ["collection"],
    fields: [
      { type: "text", key: "badgeText", label: "Badge text" },
      { type: "text", key: "heading", label: "Heading" },
      { type: "textarea", key: "description", label: "Description", rows: 3 },
      {
        type: "repeater",
        key: "brands",
        label: "Brands",
        itemNoun: "brand",
        itemLabelKey: "name",
        min: 1,
        max: 20,
        defaultItem: {
          name: "New brand",
          handle: "",
          image: "/vape_kit.png",
          tagline: "",
          description: "",
          href: "",
        },
        fields: [
          { type: "text", key: "name", label: "Brand name" },
          {
            type: "collection",
            key: "handle",
            label: "Collection",
            help: "Its collection image is used for the card when one exists.",
          },
          {
            type: "image",
            key: "image",
            label: "Fallback image",
            help: "Shown when the collection has no image of its own.",
          },
          { type: "text", key: "tagline", label: "Tagline" },
          { type: "textarea", key: "description", label: "Description", rows: 3 },
          { type: "link", key: "href", label: "Card link" },
        ],
      },
      { type: "text", key: "ctaLabel", label: "Card link text" },
    ],
    defaults: {
      badgeText: "Disposable Brand Guide",
      heading: "Popular Disposable Vape Brands in Dubai",
      description: "Explore leading disposable vape manufacturers in the UAE. Compare flagship models, puff capacities, and signature nicotine salt flavor profiles.",
      ctaLabel: "View Collection",
      brands: [
        {
          name: "Al Fakher",
          handle: "al-fakher-vape",
          image: "/premium_liquid.png",
          tagline: "Authentic Shisha Flavors & Massive Puffs",
          description: "Al Fakher Crown Bar and E-Hose disposable vape devices bring traditional shisha-inspired flavors into a modern portable vape format.",
          href: "/collections/disposable-vape?sub=Al%20Fakher",
        },
        {
          name: "Vozol",
          handle: "vozol-vape",
          image: "/lost_mary.png",
          tagline: "Smart Display & Advanced Vapor Tech",
          description: "Vozol disposable vapes combine sleek futuristic styling with robust battery life and advanced dual mesh coil technology.",
          href: "/collections/disposable-vape?sub=Vozol",
        },
        {
          name: "Tugboat",
          handle: "tugboat-vape",
          image: "/lost_mary.png",
          tagline: "Dependable Performance & Everyday Comfort",
          description: "Tugboat disposable vape devices are engineered for practical performance and simple operation with reliable flavor consistency.",
          href: "/collections/disposable-vape?sub=Tugboat",
        },
        {
          name: "Lost Mary",
          handle: "lost-mary-disposable",
          image: "/lost_mary.png",
          tagline: "Compact Ergonomics & Rich Fruit Profiles",
          description: "Lost Mary disposable vapes are celebrated for their compact ergonomic feel, stylish color gradient looks, and unique salt nicotine blends.",
          href: "/collections/disposable-vape?sub=Lost%20Mary",
        },
        {
          name: "HQD",
          handle: "hqd-vape",
          image: "/vape_kit.png",
          tagline: "Ultra-Reliable Daily Vaping & Zero Upkeep",
          description: "HQD provides reliable disposable e-cigarettes popular across Dubai for daily vaping with zero upkeep required.",
          href: "/collections/disposable-vape?sub=HQD",
        },
        {
          name: "Geek Bar",
          handle: "geek-bar-disposable",
          image: "/lost_mary.png",
          tagline: "Pulse Boost Mode & Full Screen Displays",
          description: "Geek Bar disposable vape products are designed for flavor-focused vapers seeking smooth airflow and modern device styling.",
          href: "/collections/disposable-vape?sub=Geek%20Bar",
        },
        {
          name: "Elf Bar",
          handle: "elf-bar-vape",
          image: "/lost_mary.png",
          tagline: "World-Renowned Flavor Consistency & Quality",
          description: "Elf Bar disposables set industry standards for flavor delivery and draw smoothness built with advanced Quaq mesh coil tech.",
          href: "/collections/disposable-vape?sub=Elf%20Bar",
        },
        {
          name: "Maskking",
          handle: "maskking-vape",
          image: "/vape_kit.png",
          tagline: "Premium Metallic Finish & Intense Flavor Output",
          description: "Maskking disposable vapes feature premium alloy construction and instant draw-activated heating beloved in Dubai.",
          href: "/collections/disposable-vape?sub=Maskking",
        },
      ],
    },
  },

  disposableComparison: {
    type: "disposableComparison",
    label: "Disposable Comparison",
    description: "Side-by-side disposable comparison tables.",
    templates: ["collection"],
    fields: [
      { type: "text", key: "puffHeading", label: "Puff-count table heading" },
      { type: "text", key: "puffColumnPuffs", label: "Column 1 heading" },
      { type: "text", key: "puffColumnBestFor", label: "Column 2 heading" },
      { type: "text", key: "puffColumnDuration", label: "Column 3 heading" },
      {
        type: "repeater",
        key: "puffRows",
        label: "Puff-count rows",
        itemNoun: "row",
        itemLabelKey: "puffCount",
        max: 12,
        defaultItem: { puffCount: "", bestFor: "", duration: "" },
        fields: [
          { type: "text", key: "puffCount", label: "Puff count" },
          { type: "text", key: "bestFor", label: "Best for" },
          { type: "text", key: "duration", label: "Approx. duration" },
        ],
      },
      { type: "text", key: "puffNote", label: "Footnote under the table" },

      { type: "text", key: "deviceHeading", label: "Comparison table heading" },
      { type: "text", key: "featureColumnLabel", label: "Feature column heading" },
      {
        type: "text",
        key: "deviceA",
        label: "Device 1",
        help: "Clear a device to drop its column from the table.",
      },
      { type: "text", key: "deviceB", label: "Device 2" },
      { type: "text", key: "deviceC", label: "Device 3" },
      {
        type: "repeater",
        key: "deviceRows",
        label: "Comparison rows",
        itemNoun: "row",
        itemLabelKey: "feature",
        max: 20,
        defaultItem: { feature: "", a: "", b: "", c: "" },
        fields: [
          { type: "text", key: "feature", label: "Feature" },
          { type: "text", key: "a", label: "Device 1 value" },
          { type: "text", key: "b", label: "Device 2 value" },
          { type: "text", key: "c", label: "Device 3 value" },
        ],
      },
    ],
    defaults: {
      puffHeading: "CHOOSING THE RIGHT PUFF COUNT",
      puffColumnPuffs: "PUFF COUNT",
      puffColumnBestFor: "BEST FOR",
      puffColumnDuration: "APPROX. DURATION",
      puffRows: [
        { puffCount: "600–1,500 puffs", bestFor: "Occasional or light users", duration: "1–3 days" },
        { puffCount: "2,000–4,000 puffs", bestFor: "Everyday moderate vaping", duration: "4–7 days" },
        { puffCount: "5,000–8,000 puffs", bestFor: "Regular daily users", duration: "1–2 weeks" },
        { puffCount: "10,000–15,000 puffs", bestFor: "Frequent vapers seeking longer use", duration: "2–3 weeks" },
        { puffCount: "20,000–30,000+ puffs", bestFor: "Heavy users and extended usage", duration: "3–5 weeks" },
      ],
      puffNote:
        "*Puff counts are based on standard draw length. Longer draws will reduce actual count.",

      deviceHeading: "SIDE-BY-SIDE COMPARISON",
      featureColumnLabel: "FEATURE",
      deviceA: "ELF BAR ICE KING PRO 40000",
      deviceB: "AL FAKHER E-HOSE X 60000",
      deviceC: "TUGBOAT T12000",
      deviceRows: [
        { feature: "Puff Count", a: "Up to 40,000 Puffs", b: "Up to 60,000 Puffs", c: "Up to 12,000 Puffs" },
        { feature: "Nicotine", a: "50mg (5%)", b: "50mg (5%)", c: "50mg (5%)" },
        { feature: "E-Liquid Capacity", a: "Approx. 40ml", b: "Approx. 60ml", c: "Approx. 18ml" },
        { feature: "Battery Capacity", a: "Rechargeable 850mAh", b: "Rechargeable 900mAh", c: "Rechargeable 650mAh" },
        { feature: "Charging Port", a: "USB Type-C", b: "USB Type-C", c: "USB Type-C" },
        { feature: "Display Screen", a: "Smart LED Display", b: "Digital Display", c: "Battery Indicator" },
        { feature: "Coil Technology", a: "Dual Mesh Coil", b: "Advanced Mesh Coil", c: "Mesh Coil" },
        { feature: "Airflow Control", a: "Adjustable Airflow", b: "Adjustable Airflow", c: "Fixed Airflow" },
        { feature: "Flavor Style", a: "Ice & Fruit Blends", b: "Shisha-Inspired Flavors", c: "Classic Fruit & Mint Flavors" },
        { feature: "Best For", a: "Long-lasting premium vaping", b: "Maximum puff longevity", c: "Compact daily vaping" },
        { feature: "Device Type", a: "Rechargeable Disposable", b: "Rechargeable Disposable", c: "Rechargeable Disposable" },
      ],
    },
  },

  ejuiceShowcase: {
    type: "ejuiceShowcase",
    label: "E-Juice Brands Showcase",
    description: "E-liquid brand highlight strip.",
    templates: ["collection"],
    fields: [
      { type: "text", key: "badgeText", label: "Badge text" },
      { type: "text", key: "heading", label: "Heading" },
      { type: "textarea", key: "description", label: "Description", rows: 3 },
      {
        type: "repeater",
        key: "brands",
        label: "Brands",
        itemNoun: "brand",
        itemLabelKey: "name",
        min: 1,
        max: 20,
        defaultItem: {
          name: "New brand",
          handle: "",
          image: "/vape_kit.png",
          tagline: "",
          description: "",
          href: "",
        },
        fields: [
          { type: "text", key: "name", label: "Brand name" },
          {
            type: "collection",
            key: "handle",
            label: "Collection",
            help: "Its collection image is used for the card when one exists.",
          },
          {
            type: "image",
            key: "image",
            label: "Fallback image",
            help: "Shown when the collection has no image of its own.",
          },
          { type: "text", key: "tagline", label: "Tagline" },
          { type: "textarea", key: "description", label: "Description", rows: 3 },
          { type: "link", key: "href", label: "Card link" },
        ],
      },
      { type: "text", key: "ctaLabel", label: "Card link text" },
    ],
    defaults: {
      badgeText: "E-Juice Brand Directory",
      heading: "Popular E-Juice & Nicotine Salt Brands in Dubai",
      description: "Explore authentic imported e-liquids across UAE. Compare nicotine strengths, VG/PG ratios, and signature fruit, menthol & tobacco flavors.",
      ctaLabel: "View Collection",
      brands: [
        {
          name: "Pod Salt",
          handle: "pod-salt-vape",
          image: "/premium_liquid.png",
          tagline: "British Nicotine Salt Specialists & Hit Blends",
          description: "Pod Salt is an award-winning British e-liquid brand renowned for its smooth nicotine salt formulation.",
          href: "/collections/e-liquids?sub=Pod%20Salt",
        },
        {
          name: "VGOD",
          handle: "vgod-stig",
          image: "/premium_liquid.png",
          tagline: "USA Premium SaltNic & Signature Cubano Tobaccos",
          description: "VGOD E-Liquids deliver high-potency flavor profiles and dense clouds. Famous for Cubano cigar tobacco.",
          href: "/collections/e-liquids?sub=VGOD",
        },
        {
          name: "Dr Vapes",
          handle: "dr-vapes",
          image: "/premium_liquid.png",
          tagline: "Panther Series & Award-Winning Fruit Liquids",
          description: "Dr Vapes UK creates iconic flavor blends like Pink Panther blackcurrant cotton candy and Blue Panther.",
          href: "/collections/e-liquids?sub=Dr%20Vapes",
        },
        {
          name: "Nasty Juice",
          handle: "nasty-juice",
          image: "/premium_liquid.png",
          tagline: "Low Mint Signature Aluminum Tin Liquids",
          description: "Nasty Juice is globally celebrated for signature low-mint fruity e-liquids like Asap Grape and Slow Blow.",
          href: "/collections/e-liquids?sub=Nasty%20Juice",
        },
        {
          name: "Silvaper",
          handle: "silvaper-vape",
          image: "/premium_liquid.png",
          tagline: "Luxury Craft E-Liquids & Pure Flavor Extract",
          description: "Silvaper offers handcrafted e-liquids featuring rich shisha double apple, icy grape mint, and berry fruit.",
          href: "/collections/e-liquids?sub=Silvaper",
        },
        {
          name: "Vape Pink & Propaganda",
          handle: "vape-pink",
          image: "/premium_liquid.png",
          tagline: "Gourmet Dessert & Candy Fruit E-Juice",
          description: "Gourmet e-liquids crafted for flavor enthusiasts seeking sweet dessert pastries and fruit chews.",
          href: "/collections/e-liquids?sub=Vape%20Pink%20%26%20Propaganda",
        },
      ],
    },
  },

  juulSignatureFlavors: {
    type: "juulSignatureFlavors",
    label: "JUUL Signature Flavors",
    description: "JUUL flavour line-up.",
    templates: ["collection"],
    fields: [
      { type: "text", key: "badgeText", label: "Badge text" },
      { type: "text", key: "heading", label: "Heading" },
      {
        type: "repeater",
        key: "flavors",
        label: "Flavours",
        itemNoun: "flavour",
        itemLabelKey: "name",
        min: 1,
        max: 16,
        defaultItem: {
          id: "",
          name: "New flavour",
          color: "#06b6d4",
          podsPerPack: "4 PODS PER PACK",
          strength: "STRENGTH: 5%",
          price: 0,
          description: "",
          image: "/juul_device.png",
        },
        fields: [
          { type: "text", key: "name", label: "Flavour name" },
          { type: "color", key: "color", label: "Accent colour" },
          { type: "text", key: "podsPerPack", label: "Pods per pack" },
          { type: "text", key: "strength", label: "Strength" },
          {
            type: "number",
            key: "price",
            label: "Price",
            min: 0,
            step: 1,
            suffix: "AED",
            help: "Shown on the card and used when it is added to the cart.",
          },
          { type: "textarea", key: "description", label: "Description", rows: 4 },
          { type: "image", key: "image", label: "Image" },
          {
            type: "text",
            key: "id",
            label: "Cart id",
            help: "Identifies the line in the cart. Keep it unique.",
          },
        ],
      },
    ],
    defaults: {
      badgeText: "Official JUUL Flavor Lineup",
      heading: "Signature Flavors",
      flavors: [
        {
          id: "juul-menthol-5",
          name: "Menthol 5%",
          color: "#06b6d4",
          podsPerPack: "4 PODS PER PACK",
          strength: "STRENGTH: 5%",
          price: 85.0,
          description:
            '"The JUUL 1 Menthol 5% delivers a crisp, cool menthol profile that stays clean and balanced from start to finish. Menthol lovers mostly prefer this flavour for its strong salt nicotine hit."',
          image: "/juul_device.png",
        },
        {
          id: "juul-virginia-5",
          name: "Virginia Tobacco 5%",
          color: "#d97706",
          podsPerPack: "4 PODS PER PACK",
          strength: "STRENGTH: 5%",
          price: 90.0,
          description:
            '"Tobacco flavors in the vaping market are a mixed bag. The JUUL Virginia Tobacco pod cartridge 5% is slightly sweet, slightly earthy and doesn\'t get harsh or flat as the pod runs down."',
          image: "/juul_device.png",
        },
        {
          id: "juul-menthol-3",
          name: "Menthol 3%",
          color: "#0284c7",
          podsPerPack: "4 PODS PER PACK",
          strength: "STRENGTH: 3%",
          price: 85.0,
          description:
            '"JUUL 1 pod refill cartridge is well appreciated among cooling effect lovers. Every puff delivers a subtle icy sensation of cool mint. Never tastes chemically or overpowered."',
          image: "/juul_device.png",
        },
        {
          id: "juul-virginia-3",
          name: "Virginia Tobacco 3%",
          color: "#b45309",
          podsPerPack: "4 PODS PER PACK",
          strength: "STRENGTH: 3%",
          price: 90.0,
          description:
            '"JUUL Classic tobacco vape flavor is designed to deliver a consistent, grounded tobacco experience from start to finish. A perfect choice for cigarette smokers looking for a clean alternative."',
          image: "/juul_device.png",
        },
        {
          id: "juul-mint-5",
          name: "Classic Mint 5%",
          color: "#10b981",
          podsPerPack: "4 PODS PER PACK",
          strength: "STRENGTH: 5%",
          price: 85.0,
          description:
            '"Refreshing peppermint flavor with a soothing icy exhale. One of the most popular JUUL pod flavors in Dubai for all-day vaping."',
          image: "/juul_device.png",
        },
        {
          id: "juul-mango-5",
          name: "Mango 5% (Limited)",
          color: "#f59e0b",
          podsPerPack: "4 PODS PER PACK",
          strength: "STRENGTH: 5%",
          price: 120.0,
          description:
            '"Ripe tropical sweet mango flavor pod cartridge. Highly sought-after original flavor with rich nicotine salt satisfaction."',
          image: "/juul_device.png",
        },
      ],
    },
  },

  juulPackagingCompare: {
    type: "juulPackagingCompare",
    label: "JUUL Packaging Comparison",
    description: "Old vs new JUUL 1 packaging guide.",
    templates: ["collection"],
    fields: [
      { type: "text", key: "heading", label: "Heading" },
      { type: "textarea", key: "description", label: "Description", rows: 3 },

      { type: "text", key: "oldTabLabel", label: "Old tab label" },
      { type: "text", key: "oldTitle", label: "Old panel title" },
      { type: "text", key: "oldBadge", label: "Old image badge" },
      { type: "image", key: "oldImage", label: "Old packaging image" },
      {
        type: "repeater",
        key: "oldPoints",
        label: "Old packaging points",
        itemNoun: "point",
        itemLabelKey: "label",
        max: 8,
        defaultItem: { label: "", text: "" },
        fields: [
          { type: "text", key: "label", label: "Label" },
          { type: "textarea", key: "text", label: "Detail", rows: 3 },
        ],
      },

      { type: "text", key: "newTabLabel", label: "New tab label" },
      { type: "text", key: "newTitle", label: "New panel title" },
      { type: "text", key: "newBadge", label: "New image badge" },
      { type: "image", key: "newImage", label: "New packaging image" },
      {
        type: "repeater",
        key: "newPoints",
        label: "New packaging points",
        itemNoun: "point",
        itemLabelKey: "label",
        max: 8,
        defaultItem: { label: "", text: "" },
        fields: [
          { type: "text", key: "label", label: "Label" },
          { type: "textarea", key: "text", label: "Detail", rows: 3 },
        ],
      },
    ],
    defaults: {
      heading: "JUUL 1 Packaging: Old vs New",
      description:
        "To make fake JUUL products harder to sell in the UAE, JUUL redesigned the box. Here is what changed and what to look for before you buy.",

      oldTabLabel: "OLD PACKAGING",
      oldTitle: "Old Packaging Specifications",
      oldBadge: "OLD DESIGN",
      oldImage: "/juul_device.png",
      oldPoints: [
        {
          label: "Cardboard Sleeve:",
          text: "Plain white matte paper box. Wears, tears, and fades with light handling.",
        },
        {
          label: "Branding & Font:",
          text: "Basic minimalist type. No clear generation label. The box does not always say “JUUL 1” outright.",
        },
        {
          label: "Security Tracking:",
          text: "No 3D holographic sticker on the top flap. High risk of convincing clones.",
        },
        {
          label: "Batch Codes:",
          text: "Printed lightly and often smudged. Hard to read and easy to fake.",
        },
      ],

      newTabLabel: "NEW PACKAGING",
      newTitle: "New Packaging Specifications",
      newBadge: "NEW DESIGN",
      newImage: "/juul_device.png",
      newPoints: [
        {
          label: "Cardboard Sleeve:",
          text: "Premium glossy reinforced foil-laminated box. Scratch-resistant surface.",
        },
        {
          label: "Branding & Font:",
          text: "Bold embossed JUUL logo with explicit generation badges and nicotine concentration callouts.",
        },
        {
          label: "Security Tracking:",
          text: "High-security 3D holographic authentication sticker with QR code scan verification.",
        },
        {
          label: "Batch Codes:",
          text: "Laser-etched high-density QR code and crisp batch numbers on top & bottom flaps.",
        },
      ],
    },
  },

  juulTechSpecs: {
    type: "juulTechSpecs",
    label: "JUUL Tech Specs",
    description: "Technical specification table.",
    templates: ["collection"],
    fields: [
      { type: "text", key: "badgeText", label: "Badge text" },
      { type: "text", key: "heading", label: "Heading" },
      { type: "textarea", key: "description", label: "Description", rows: 3 },
      { type: "text", key: "certifiedNote", label: "Certified note" },
      {
        type: "repeater",
        key: "specs",
        label: "Specifications",
        itemNoun: "specification",
        itemLabelKey: "label",
        min: 1,
        max: 12,
        defaultItem: { icon: "Zap", accent: "emerald", label: "SPECIFICATION", value: "" },
        fields: [
          { type: "icon", key: "icon", label: "Icon" },
          ...accentField(),
          { type: "text", key: "label", label: "Label" },
          { type: "text", key: "value", label: "Value" },
        ],
      },
    ],
    defaults: {
      badgeText: "Technical Specifications",
      heading: "Engineered for Excellence",
      description:
        "JUUL 1 Magnetic USB Charging Dock & Original USA Made JUUL Pods certified authentic in Dubai & UAE.",
      certifiedNote: "Official JUUL UAE Certified Hardware",
      specs: [
        { icon: "Battery", accent: "emerald", label: "BATTERY CAPACITY", value: "200 mAh (Classic)" },
        { icon: "Zap", accent: "amber", label: "CHARGING TYPE", value: "Magnetic USB Fast Dock" },
        { icon: "Droplet", accent: "blue", label: "POD CAPACITY", value: "0.7 mL per Pod" },
        { icon: "Cpu", accent: "purple", label: "CONNECTIVITY", value: "Draw-Activated (No Buttons)" },
        { icon: "Activity", accent: "rose", label: "DRAW TYPE", value: "MTL (Mouth to Lung)" },
        { icon: "Box", accent: "teal", label: "MATERIAL", value: "Premium Anodized Aluminum" },
      ],
    },
  },

  bottomCollectionGrid: {
    type: "bottomCollectionGrid",
    label: "Related Collections Grid",
    description: "Five-category recommendation grid.",
    templates: ["index", "collection", "product", "page"],
    fields: [
      {
        type: "text",
        key: "badgeText",
        label: "Badge text",
        help: "Leave blank to keep the automatic per-category wording.",
      },
      { type: "text", key: "heading", label: "Heading" },
      { type: "textarea", key: "description", label: "Description", rows: 2 },
      {
        type: "repeater",
        key: "cards",
        label: "Cards",
        itemNoun: "card",
        itemLabelKey: "title",
        max: 12,
        help: "Leave empty to show the collections that match the current page automatically. The card for the page being viewed is always skipped.",
        defaultItem: {
          title: "New collection",
          subtitle: "",
          image: "/vape_kit.png",
          href: "",
        },
        fields: [
          { type: "text", key: "title", label: "Title" },
          { type: "textarea", key: "subtitle", label: "Subtitle", rows: 2 },
          { type: "image", key: "image", label: "Image" },
          { type: "link", key: "href", label: "Link" },
        ],
      },
    ],
    defaults: { badgeText: "", heading: "", description: "", cards: [] },
  },

  juulAppIntegration: {
    type: "juulAppIntegration",
    label: "JUUL 2 App Integration",
    description: "JUUL 2 companion-app feature block.",
    templates: ["collection", "product"],
    fields: [
      { type: "text", key: "badgeText", label: "Badge text" },
      { type: "text", key: "heading", label: "Heading" },
      { type: "textarea", key: "description", label: "Description", rows: 3 },
      { type: "text", key: "activeBadge", label: "Selected card badge" },
      {
        type: "repeater",
        key: "features",
        label: "Feature cards",
        itemNoun: "feature",
        itemLabelKey: "title",
        min: 1,
        max: 6,
        help: "Each card selects one of the phone screens, which carries its own icon and demo.",
        defaultItem: {
          screen: "analytics",
          title: "New feature",
          description: "",
        },
        fields: [
          {
            type: "select",
            key: "screen",
            label: "Phone screen",
            options: [
              { label: "Bluetooth pairing", value: "bluetooth" },
              { label: "Usage analytics", value: "analytics" },
              { label: "Device lock & find", value: "lock" },
              { label: "Battery monitoring", value: "battery" },
              { label: "Smart notifications", value: "notifications" },
              { label: "Age verification", value: "age" },
            ],
          },
          { type: "text", key: "title", label: "Title" },
          { type: "textarea", key: "description", label: "Description", rows: 3 },
        ],
      },
    ],
    defaults: {
      badgeText: "JUUL 2 Smart App Integration",
      heading: "Control Your JUUL 2 Directly From Your Phone",
      description: "Discover the smart vaping era. Pair your JUUL 2 via Bluetooth to monitor your battery health, track puff counts, lock your device remotely, and secure age verification in one tap.",
      activeBadge: "ACTIVE SCREEN",
      features: [
        {
          screen: "bluetooth",
          title: "Instant Bluetooth Connect",
          description: "Pair with your JUUL 2 device in seconds. Auto-reconnects every time.",
        },
        {
          screen: "analytics",
          title: "Usage Analytics",
          description: "Track daily puff count, weekly trends, and nicotine intake in real-time.",
        },
        {
          screen: "lock",
          title: "Device Lock & Find",
          description: "Remotely lock your JUUL if lost and locate it via Bluetooth proximity scan.",
        },
        {
          screen: "battery",
          title: "Battery Monitoring",
          description: "Live battery status with low-battery push alerts before you run out.",
        },
        {
          screen: "notifications",
          title: "Smart Notifications",
          description: "Get notified for pod refilling, battery level alerts, and usage limits.",
        },
        {
          screen: "age",
          title: "Age Verification Lock",
          description: "Built-in smart age verification lock to prevent unauthorized access.",
        },
      ],
    },
  },

  myleVerification: {
    type: "myleVerification",
    label: "MYLE Verification Guide",
    description: "Anti-counterfeit verification steps.",
    templates: ["collection", "product"],
    fields: [
      { type: "text", key: "badgeText", label: "Badge text" },
      { type: "text", key: "heading", label: "Heading" },
      {
        type: "repeater",
        key: "steps",
        label: "Steps",
        itemNoun: "step",
        itemLabelKey: "title",
        min: 1,
        max: 4,
        help: "Each step keeps its illustration. Wrap words in **double asterisks** to bold them.",
        defaultItem: {
          illustration: "qr",
          title: "NEW STEP",
          description: "",
        },
        fields: [
          {
            type: "select",
            key: "illustration",
            label: "Illustration",
            options: [
              { label: "Peeling the QR tab", value: "qr" },
              { label: "Verification screen", value: "scan" },
              { label: "Rewards medal", value: "reward" },
            ],
          },
          { type: "text", key: "title", label: "Title" },
          { type: "textarea", key: "description", label: "Description", rows: 4 },
        ],
      },
      { type: "text", key: "ctaLabel", label: "Button text" },
      { type: "link", key: "ctaHref", label: "Button link", placeholder: "https://" },
    ],
    defaults: {
      badgeText: "Official UAE Verification",
      heading: "ANTI-COUNTERFEIT SYSTEM",
      steps: [
        {
          illustration: "qr",
          title: "FIND QR CODE",
          description:
            "Find the security code on your package by peeling off the tab on the side of the package to reveal the QR code.",
        },
        {
          illustration: "scan",
          title: "SCAN CODE",
          description:
            "Go online to **ac.mylevape.com** or scan the QR code in your phone with a QR code scanner and enter the 16 digit authenticity number in the fields provided. Please submit.",
        },
        {
          illustration: "reward",
          title: "RECEIVE REWARD POINTS",
          description:
            "For each product you authenticate, you will receive 5 Myle rewards point(s). After you scan your products QR code, your rewards point(s) will be automatically added to your rewards account.",
        },
      ],
      ctaLabel: "Authenticate MYLE Product at ac.mylevape.com",
      ctaHref: "https://ac.mylevape.com",
    },
  },

  customerReviews: {
    type: "customerReviews",
    label: "Customer Reviews",
    description: "Verified review carousel.",
    templates: ["index", "collection", "product"],
    contentInCode: true,
    fields: [
      { type: "text", key: "badgeText", label: "Badge text" },
      {
        type: "text",
        key: "headingTemplate",
        label: "Heading",
        help: "Use {collection} for the current collection or product name.",
      },
      { type: "textarea", key: "description", label: "Description", rows: 3 },
      { type: "text", key: "ratingValue", label: "Overall rating" },
      { type: "text", key: "ratingCountLabel", label: "Rating count label" },
      {
        type: "repeater",
        key: "reviews",
        label: "Reviews",
        itemNoun: "review",
        itemLabelKey: "title",
        max: 60,
        defaultItem: {
          id: "rev-new",
          author: "",
          location: "",
          rating: 5,
          date: "",
          verified: true,
          productName: "",
          title: "New review",
          comment: "",
          helpfulCount: 0,
        },
        fields: [
          { type: "text", key: "title", label: "Headline" },
          { type: "textarea", key: "comment", label: "Review", rows: 4 },
          { type: "text", key: "author", label: "Author" },
          { type: "text", key: "location", label: "Location" },
          { type: "text", key: "productName", label: "Product" },
          { type: "text", key: "date", label: "Date" },
          { type: "number", key: "rating", label: "Rating", min: 1, max: 5, step: 1 },
          { type: "number", key: "helpfulCount", label: "Helpful votes", min: 0, step: 1 },
          { type: "toggle", key: "verified", label: "Verified buyer" },
        ],
      },
    ],
    defaults: {
      badgeText: "Verified Customer Feedback",
      headingTemplate: "Customer Reviews for {collection}",
      description:
        "Read authentic ratings and reviews from verified buyers across Dubai, Abu Dhabi, and the UAE.",
      ratingValue: "4.9",
      ratingCountLabel: "1,420+ Verified Reviews",
      reviews: [],
    },
  },

  /* ═══════════ Product template ═══════════ */

  productMain: {
    type: "productMain",
    label: "Product Details & Buy Box",
    description:
      "Gallery, price, variants and add-to-cart. Always shown — it is the page. Every label around the live product data is editable here.",
    templates: ["product"],
    required: true,
    contentInCode: true,
    fields: [
      /* ── Breadcrumb ── */
      { type: "toggle", key: "showBreadcrumb", label: "Show breadcrumb bar" },
      {
        type: "text",
        key: "breadcrumbHomeLabel",
        label: "Breadcrumb — home label",
        showIf: { key: "showBreadcrumb", equals: ["true"] },
      },
      {
        type: "text",
        key: "breadcrumbShopLabel",
        label: "Breadcrumb — shop label",
        showIf: { key: "showBreadcrumb", equals: ["true"] },
      },
      {
        type: "link",
        key: "breadcrumbShopHref",
        label: "Breadcrumb — shop link",
        showIf: { key: "showBreadcrumb", equals: ["true"] },
      },

      /* ── Title row ── */
      { type: "toggle", key: "showRating", label: "Show star rating" },
      {
        type: "text",
        key: "reviewCountTemplate",
        label: "Review count text",
        help: "Use {count} for the number of reviews.",
        showIf: { key: "showRating", equals: ["true"] },
      },
      { type: "text", key: "inStockLabel", label: "In-stock badge" },
      { type: "text", key: "soldOutLabel", label: "Sold-out badge" },
      { type: "toggle", key: "showShareBar", label: "Show share buttons" },
      {
        type: "text",
        key: "shareLabel",
        label: "Share label",
        showIf: { key: "showShareBar", equals: ["true"] },
      },

      /* ── Price ── */
      { type: "text", key: "priceLabel", label: "Price label" },
      {
        type: "text",
        key: "saveBadgeTemplate",
        label: "Discount badge",
        help: "Use {percent} for the percentage saved. Blank hides the badge.",
      },

      /* ── Specification card ── */
      { type: "toggle", key: "showSpecCard", label: "Show specification card" },
      {
        type: "text",
        key: "specCardHeading",
        label: "Specification card heading",
        showIf: { key: "showSpecCard", equals: ["true"] },
      },
      {
        type: "repeater",
        key: "specRows",
        label: "Specification rows",
        itemNoun: "row",
        itemLabelKey: "label",
        max: 12,
        showIf: { key: "showSpecCard", equals: ["true"] },
        defaultItem: { label: "New spec", source: "custom", value: "" },
        fields: [
          { type: "text", key: "label", label: "Label" },
          {
            type: "select",
            key: "source",
            label: "Value from",
            options: [
              { label: "Fixed text", value: "custom" },
              { label: "Product brand", value: "brand" },
              { label: "Product category", value: "category" },
              { label: "Puff capacity", value: "puffs" },
              { label: "Nicotine level", value: "nicotine" },
              { label: "Battery spec", value: "battery" },
            ],
          },
          {
            type: "text",
            key: "value",
            label: "Value",
            help: "Used as-is for fixed text, and as the fallback when the product has no value for the chosen field.",
          },
        ],
      },

      /* ── Variant & quantity ── */
      { type: "text", key: "variantLabel", label: "Variant picker label" },
      { type: "text", key: "variantPlaceholder", label: "Variant picker placeholder" },
      { type: "text", key: "variantButtonLabel", label: "Variant picker button" },
      { type: "text", key: "quantityLabel", label: "Quantity label" },
      { type: "text", key: "totalPriceLabel", label: "Total price label" },

      /* ── Actions ── */
      { type: "text", key: "addToCartLabel", label: "Add to cart button" },
      { type: "text", key: "buyNowLabel", label: "Buy now button" },
      {
        type: "text",
        key: "selectVariantLabel",
        label: "Button text before a variant is chosen",
      },
      { type: "toggle", key: "showWishlist", label: "Show wishlist button" },
      {
        type: "text",
        key: "wishlistLabel",
        label: "Wishlist button",
        showIf: { key: "showWishlist", equals: ["true"] },
      },
      {
        type: "text",
        key: "wishlistSavedLabel",
        label: "Wishlist button once saved",
        showIf: { key: "showWishlist", equals: ["true"] },
      },

      /* ── Service cards ── */
      { type: "toggle", key: "showServiceCards", label: "Show service cards" },
      {
        type: "repeater",
        key: "serviceCards",
        label: "Service cards",
        itemNoun: "card",
        itemLabelKey: "title",
        max: 8,
        showIf: { key: "showServiceCards", equals: ["true"] },
        defaultItem: { icon: "Truck", title: "New card", subtitle: "" },
        fields: [
          { type: "icon", key: "icon", label: "Icon" },
          { type: "text", key: "title", label: "Title" },
          { type: "text", key: "subtitle", label: "Subtitle" },
        ],
      },

      /* ── Tabs ── */
      { type: "text", key: "descriptionTabLabel", label: "Description tab label" },
      { type: "toggle", key: "showShippingTab", label: "Show shipping tab" },
      {
        type: "text",
        key: "shippingTabLabel",
        label: "Shipping tab label",
        showIf: { key: "showShippingTab", equals: ["true"] },
      },
      {
        type: "repeater",
        key: "shippingBlocks",
        label: "Shipping tab content",
        itemNoun: "block",
        itemLabelKey: "title",
        max: 8,
        showIf: { key: "showShippingTab", equals: ["true"] },
        defaultItem: { title: "New block", body: "" },
        fields: [
          { type: "text", key: "title", label: "Heading" },
          { type: "textarea", key: "body", label: "Body", rows: 4 },
        ],
      },
      { type: "toggle", key: "showReturnsTab", label: "Show returns tab" },
      {
        type: "text",
        key: "returnsTabLabel",
        label: "Returns tab label",
        showIf: { key: "showReturnsTab", equals: ["true"] },
      },
      {
        type: "repeater",
        key: "returnsBlocks",
        label: "Returns tab content",
        itemNoun: "block",
        itemLabelKey: "title",
        max: 8,
        showIf: { key: "showReturnsTab", equals: ["true"] },
        defaultItem: { title: "New block", body: "" },
        fields: [
          { type: "text", key: "title", label: "Heading" },
          { type: "textarea", key: "body", label: "Body", rows: 4 },
        ],
      },

      /* ── Variant modal ── */
      { type: "text", key: "variantModalHeading", label: "Variant picker — modal heading" },
      {
        type: "text",
        key: "variantSearchPlaceholder",
        label: "Variant picker — search placeholder",
      },
      { type: "text", key: "variantInStockNote", label: "Variant picker — in-stock note" },
      {
        type: "text",
        key: "variantOutOfStockNote",
        label: "Variant picker — out-of-stock note",
      },

      /* ── Mobile bar ── */
      { type: "toggle", key: "showMobileBar", label: "Show mobile sticky bar" },
      {
        type: "text",
        key: "mobileBuyLabel",
        label: "Mobile bar — buy button",
        showIf: { key: "showMobileBar", equals: ["true"] },
      },
    ],
    defaults: {
      showBreadcrumb: true,
      breadcrumbHomeLabel: "HOME",
      breadcrumbShopLabel: "PRODUCTS",
      breadcrumbShopHref: "/shop",

      showRating: true,
      reviewCountTemplate: "({count} reviews)",
      inStockLabel: "In Stock",
      soldOutLabel: "Sold Out",
      showShareBar: true,
      shareLabel: "SHARE:",

      priceLabel: "PRICE:",
      saveBadgeTemplate: "Save {percent}%",

      showSpecCard: true,
      specCardHeading: "Key Product Specifications",
      specRows: [
        { label: "Brand", source: "brand", value: "Vape Shop Dubai" },
        { label: "Battery Spec", source: "battery", value: "Rechargeable Built-in" },
        { label: "Puff Capacity", source: "puffs", value: "High Capacity" },
        { label: "Nicotine Level", source: "nicotine", value: "5% (50mg)" },
        { label: "Activation", source: "custom", value: "Draw-Activated" },
        { label: "Charging", source: "custom", value: "Type-C Fast Charge" },
      ],

      variantLabel: "Flavor Option:",
      variantPlaceholder: "Select Flavor",
      variantButtonLabel: "Select",
      quantityLabel: "Qty:",
      totalPriceLabel: "Total Price:",

      addToCartLabel: "Add to Cart",
      buyNowLabel: "Buy It Now",
      selectVariantLabel: "Select Flavor First",
      showWishlist: true,
      wishlistLabel: "Add to Wishlist",
      wishlistSavedLabel: "Saved in Wishlist",

      showServiceCards: true,
      serviceCards: [
        { icon: "Truck", title: "Free Shipping", subtitle: "ON ORDERS ABOVE 300 AED" },
        {
          icon: "CreditCard",
          title: "Payment Methods",
          subtitle: "CASH, CARD & APPLE PAY ON DELIVERY",
        },
        { icon: "Zap", title: "Fast Delivery", subtitle: "DUBAI EXPRESS WITHIN 2 HOURS" },
        {
          icon: "Package",
          title: "Same Day Delivery",
          subtitle: "ORDER BEFORE 6PM ALL EMIRATES",
        },
      ],

      descriptionTabLabel: "Product Description",
      showShippingTab: true,
      shippingTabLabel: "Shipping & Return",
      shippingBlocks: [
        {
          title: "🚚 FREE DELIVERY AND MINIMUM ORDER",
          body: "• Delivery country: We are able to deliver all over the UAE. Note: We are unable for international deliveries due to custom restrictions.\n• Minimum order: A minimum 85 AED required to place an order.\n• Free Delivery: Enjoy complimentary shipping for orders valued at AED 300 or more.\n• Delivery Charge: A delivery charge of AED 30 applies to orders below AED 300.",
        },
        {
          title: "⚡ SHIPPING & DELIVERY IN DUBAI AND SHARJAH",
          body: "• Same Day Delivery: Place your order before 9pm and we will deliver at your doorstep the same day.\n• Next Day Delivery: Place your order after 9pm and we will deliver it the next morning.\n• Operational Days: Our deliveries run 7 days a week.\n• Prompt Dispatch: We aim to dispatch your order by courier or private car the following business day. Unforeseen circumstances like severe weather or traffic might cause occasional delays.\n• Reception Of Package: We ship it without requiring signatures. Ensure someone is there to collect your parcel.\n• Our Responsibility: We take great care in shipping until you receive it & ensure you are satisfied with the product.\n• Pre-orders: For items on Pre-order you can contact us by email or WhatsApp. Also you can give us details on the order note.\n• Address Finality: Once placed, orders are shipped to the provided address. If you change location let us know by WhatsApp or Email. If a refund is necessary, the initial shipping fee will be excluded.\n• Payment & ID: Delivery will be handed over upon presenting your Emirates ID/Passport and clearing the invoice amount by Cash or Card Payment.\n• Age Restriction: Buyers must be 18 or older. Orders placed by minors will not be handed over or refunded.\n• Delivery Update: After placing an order, expect a confirmation email from info.vapeshopdubai@gmail.com",
        },
        {
          title: "📦 OUTSIDE DUBAI AND SHARJAH",
          body: "• 6 working day delivery (Sunday closed).\n• Any order placed after 2:00 PM will be delivered the next day.\n• Orders placed before 2 PM will be delivered same day.\n• Orders placed after 2 PM on Saturday will be delivered on Monday.\n• Cash on delivery only (card payment not acceptable).\n• Orders over 200 AED are free delivery.\n• Minimum order 85 AED required to place an order.\n• Orders under 200 AED: delivery charge is 30 AED.\n• Age Restriction: Buyers must be 18 or older. Orders placed by minors will not be handed over or refunded.",
        },
        {
          title: "📍 OUTSIDE CITY AREA",
          body: "• Delivery within 2 working days (Sunday closed).\n• Areas far from the city: 35 AED additional charge.\n• Orders over 200 AED: 35 AED delivery charge only.",
        },
      ],
      showReturnsTab: false,
      returnsTabLabel: "Refund and Returns Policy",
      returnsBlocks: [],

      variantModalHeading: "Select Flavor Option",
      variantSearchPlaceholder: "Search flavor name...",
      variantInStockNote: "In Stock • Ready to ship",
      variantOutOfStockNote: "Currently Out of Stock",

      showMobileBar: true,
      mobileBuyLabel: "Buy",
    },
  },

  productKeySpecs: {
    type: "productKeySpecs",
    label: "Key Specifications",
    description:
      "Spec table for the current product. Leave the rows empty to keep the automatic table built from the product's own data.",
    templates: ["product"],
    contentInCode: true,
    fields: [
      { type: "text", key: "heading", label: "Heading" },
      {
        type: "text",
        key: "subheadingTemplate",
        label: "Subheading",
        help: "Use {product} for the product name.",
      },
      { type: "text", key: "badgeText", label: "Badge", help: "Blank hides the badge." },
      { type: "text", key: "featureColumnLabel", label: "Left column heading" },
      { type: "text", key: "detailsColumnLabel", label: "Right column heading" },
      {
        type: "repeater",
        key: "rows",
        label: "Specification rows",
        help: "Leave empty to build the table from the product's own specs.",
        itemNoun: "row",
        itemLabelKey: "feature",
        max: 24,
        defaultItem: { feature: "New spec", details: "" },
        fields: [
          { type: "text", key: "feature", label: "Feature" },
          { type: "textarea", key: "details", label: "Details", rows: 2 },
        ],
      },
    ],
    defaults: {
      heading: "Key Features & Specifications",
      subheadingTemplate: "Technical overview and hardware specs for {product}",
      badgeText: "100% Authentic UAE Certified",
      featureColumnLabel: "Feature",
      detailsColumnLabel: "Details",
      rows: [],
    },
  },

  productFlavors: {
    type: "productFlavors",
    label: "Available Flavors",
    description:
      "Flavour table for the current product, built from its Shopify variants. The wording is yours, and any variant can be given its own tasting note.",
    templates: ["product"],
    contentInCode: true,
    fields: [
      { type: "text", key: "heading", label: "Heading" },
      {
        type: "text",
        key: "subheadingTemplate",
        label: "Subheading",
        help: "Use {product} for the product name.",
      },
      {
        type: "text",
        key: "countBadgeTemplate",
        label: "Count badge",
        help: "Use {count} for the number of flavours. Blank hides the badge.",
      },
      { type: "text", key: "nameColumnLabel", label: "Name column heading" },
      { type: "text", key: "profileColumnLabel", label: "Profile column heading" },
      { type: "text", key: "availabilityColumnLabel", label: "Availability column heading" },
      { type: "text", key: "inStockLabel", label: "In-stock label" },
      { type: "text", key: "outOfStockLabel", label: "Out-of-stock label" },
      { type: "text", key: "selectedLabel", label: "Selected label" },
      {
        type: "toggle",
        key: "showPrices",
        label: "Show the variant price instead of the in-stock label",
      },
      {
        type: "repeater",
        key: "flavorNotes",
        label: "Tasting notes",
        help: "Overrides the built-in note for a flavour. Matched against the variant name.",
        itemNoun: "note",
        itemLabelKey: "flavor",
        max: 60,
        defaultItem: { flavor: "", description: "" },
        fields: [
          { type: "text", key: "flavor", label: "Flavour name" },
          { type: "textarea", key: "description", label: "Tasting note", rows: 2 },
        ],
      },
      { type: "textarea", key: "footnote", label: "Footnote", rows: 2 },
    ],
    defaults: {
      heading: "Available Flavours",
      subheadingTemplate: "Complete flavor profile spreadsheet table for {product}",
      countBadgeTemplate: "{count} Signature Options",
      nameColumnLabel: "Flavour Name",
      profileColumnLabel: "Flavour Profile & Tasting Notes",
      availabilityColumnLabel: "Availability",
      inStockLabel: "IN STOCK",
      outOfStockLabel: "OUT OF STOCK",
      selectedLabel: "SELECTED",
      showPrices: true,
      flavorNotes: [],
      footnote:
        "Each blend is crafted to replicate authentic shisha & vape flavours with rich flavor profiles, cooling sensation, and sweet notes.",
    },
  },

  whyChooseProduct: {
    type: "whyChooseProduct",
    label: "Why Choose This Product",
    description: "Product-level selling points, written by you.",
    templates: ["product"],
    fields: [
      {
        type: "text",
        key: "headingTemplate",
        label: "Heading",
        help: "Use {product} for the product name.",
      },
      {
        type: "richtext",
        key: "introTemplate",
        label: "Intro paragraph",
        rows: 4,
        help: "Use {product} for the product name and {puffs} for its puff count.",
      },
      {
        type: "repeater",
        key: "items",
        label: "Selling points",
        itemNoun: "point",
        itemLabelKey: "title",
        max: 12,
        defaultItem: { title: "New point", description: "" },
        fields: [
          { type: "text", key: "title", label: "Title" },
          { type: "textarea", key: "description", label: "Description", rows: 2 },
        ],
      },
      {
        type: "textarea",
        key: "footnoteTemplate",
        label: "Footnote",
        rows: 3,
        help: "Use {product} for the product name. Blank hides the footnote.",
      },
    ],
    defaults: {
      headingTemplate: "Why Choose the {product}?",
      introTemplate:
        "The {product} is a strong choice if you want an affordable disposable vape that still feels premium in everyday use. It's compact, easy to carry, rechargeable, and designed for a smooth draw with consistent taste—making it a great best vape for beginner and best vape for new user option.",
      items: [
        {
          title: "Affordable vape",
          description:
            "Great value for users who want {puffs} in a compact disposable vape.",
        },
        {
          title: "Rechargeable disposable vape",
          description:
            "Type C charging helps you finish the e-liquid instead of losing puffs to a dead battery.",
        },
        {
          title: "Best disposable vape for flavor output",
          description: "Mesh coil design supports richer taste and better flavour consistency.",
        },
        {
          title: "Best disposable vape for vapor cloud",
          description: "Balanced vapour production with smooth inhale feel.",
        },
        {
          title: "Best portable vape",
          description:
            "Pocket-size vape build that's easy to hold (palm fit vape feel) and easy to travel with around Dubai.",
        },
      ],
      footnoteTemplate:
        "If you want a cheap one search for {product} best deal or {product} offer in Dubai and {product} cheap pricing during stock sale.",
    },
  },

  juulCollectionFeature1: {
    type: "juulCollectionFeature1",
    label: "JUUL Custom Feature 1",
    description: "Configurable JUUL feature section with image, title, description, and list.",
    templates: ["collection", "product"],
    fields: [
      { type: "text", key: "title", label: "Title" },
      { type: "textarea", key: "description", label: "Description", rows: 4 },
      { type: "text", key: "buttonText", label: "Button text" },
      { type: "link", key: "buttonLink", label: "Button link" },
      { type: "image", key: "image", label: "Image" },
      {
        type: "repeater",
        key: "bulletPoints",
        label: "Bullet points (Checkmarks)",
        itemNoun: "point",
        itemLabelKey: "text",
        max: 8,
        defaultItem: { text: "New point" },
        fields: [{ type: "text", key: "text", label: "Text" }],
      },
    ],
    defaults: {
      title: "JUUL Vape Experience",
      description: "Discover the ultimate JUUL experience tailored for you.",
      buttonText: "Shop JUUL",
      buttonLink: "/collections/juul-vape-dubai",
      image: "/juul_device.png",
      bulletPoints: [
        { text: "Premium Quality" },
        { text: "Authentic Products" }
      ]
    }
  },

  juulCollectionFeature2: {
    type: "juulCollectionFeature2",
    label: "JUUL Custom Feature 2",
    description: "Configurable JUUL feature section with image, title, description, and list.",
    templates: ["collection", "product"],
    fields: [
      { type: "text", key: "title", label: "Title" },
      { type: "textarea", key: "description", label: "Description", rows: 4 },
      { type: "text", key: "buttonText", label: "Button text" },
      { type: "link", key: "buttonLink", label: "Button link" },
      { type: "image", key: "image", label: "Image" },
      {
        type: "repeater",
        key: "bulletPoints",
        label: "Bullet points (Checkmarks)",
        itemNoun: "point",
        itemLabelKey: "text",
        max: 8,
        defaultItem: { text: "New point" },
        fields: [{ type: "text", key: "text", label: "Text" }],
      },
    ],
    defaults: {
      title: "Why Choose JUUL",
      description: "Sleek, satisfying, and simple to use.",
      buttonText: "Learn More",
      buttonLink: "/collections/juul-vape-dubai",
      image: "/juul_menthol_pack.png",
      bulletPoints: [
        { text: "Easy to use" },
        { text: "Consistent performance" }
      ]
    }
  },

  productFinalThoughts: {
    type: "productFinalThoughts",
    label: "Final Thoughts",
    description: "Product summary review card & final buying recommendations.",
    templates: ["product"],
    fields: [
      {
        type: "text",
        key: "headingTemplate",
        label: "Heading",
        help: "Use {product} for the product name.",
      },
      {
        type: "textarea",
        key: "bodyText",
        label: "Body content",
        rows: 6,
        help: "Use {product} for product name. Supports HTML/Markdown links.",
      },
    ],
    defaults: {
      headingTemplate: "FINAL THOUGHTS ON THE {product}",
      bodyText:
        "The {product} easily outperforms older hardware in everyday reliability, flavor output, and overall build quality. Whether you are an everyday vaper in Dubai or looking for a premium device with fast delivery across the UAE, this model sets the benchmark for satisfaction.\n\nIndependent user feedback and review tests show this model ranks among the top choices for taste variety, smooth draw, and sleek ergonomics. Engineered under strict quality standards to ensure total authenticity and complete peace of mind.",
    },
  },

  juulCrispMenthol: {
    type: "juulCrispMenthol",
    label: "JUUL Crisp Menthol",
    description: "The two JUUL feature blocks — selling points and ingredients.",
    templates: ["product"],
    fields: [
      {
        type: "text",
        key: "headingTemplate",
        label: "Heading",
        help: "Use {product} for the product name.",
      },
      {
        type: "richtext",
        key: "bodyTemplate",
        label: "Intro paragraph",
        rows: 6,
        help: "Use {product} for the product name.",
      },
      {
        type: "repeater",
        key: "points",
        label: "Selling points",
        help: "The first six also become the labels around the product image.",
        itemNoun: "point",
        itemLabelKey: "lead",
        max: 12,
        defaultItem: { lead: "New point", text: "" },
        fields: [
          { type: "text", key: "lead", label: "Lead-in", help: "Highlighted in the diagram." },
          { type: "textarea", key: "text", label: "Rest of the line", rows: 2 },
        ],
      },
      { type: "image", key: "image", label: "Product image" },
      { type: "toggle", key: "showIngredients", label: "Show the ingredients block" },
      {
        type: "text",
        key: "ingredientsHeadingTemplate",
        label: "Ingredients — heading",
        help: "Use {product} for the product name.",
        showIf: { key: "showIngredients", equals: ["true"] },
      },
      {
        type: "richtext",
        key: "ingredientsBodyTemplate",
        label: "Ingredients — intro",
        rows: 4,
        help: "Use {product} for the product name.",
        showIf: { key: "showIngredients", equals: ["true"] },
      },
      {
        type: "repeater",
        key: "ingredients",
        label: "Ingredients",
        itemNoun: "ingredient",
        itemLabelKey: "title",
        max: 10,
        showIf: { key: "showIngredients", equals: ["true"] },
        defaultItem: { title: "New ingredient", description: "" },
        fields: [
          { type: "text", key: "title", label: "Name" },
          { type: "textarea", key: "description", label: "Description", rows: 3 },
        ],
      },
      {
        type: "image",
        key: "ingredientsImage",
        label: "Ingredients — image",
        showIf: { key: "showIngredients", equals: ["true"] },
      },
    ],
    defaults: {
      headingTemplate: "Why Choose {product}",
      bodyTemplate:
        "If you're choosing a premium pod in the UAE, there are plenty of options to choose from. Not every pod delivers the flavor promise and not every brand meets standards. {product} breaks that pattern entirely. It is a precision developed blend that performs like a premium product should. Paired with the reliability of the JUUL 2 closed pod system, there is no match for it in the market. For adult smokers who relied on traditional cigarettes, or vapers who have cycled through disappointing pods without finding one worth sticking to, this is the one. Sharp, clean, and consistent in every single draw.",
      points: [
        {
          lead: "Sharp and natural",
          text: "authentic flavor that holds from first puff to last without drifting",
        },
        {
          lead: "18mg salt nicotine",
          text: "for smooth, efficient, and genuinely satisfying nicotine delivery",
        },
        {
          lead: "Integrated microchip",
          text: "in every pod for automatic authenticity verification and app tracking",
        },
        {
          lead: "Leak resistant sealed pod",
          text: "construction — stays clean in a pocket, bag, or car console",
        },
        {
          lead: "No refilling, no coil changes",
          text: "and absolutely no maintenance required at any stage",
        },
        {
          lead: "Fully compliant",
          text: "with UAE vape regulations and ESMA standards across every unit",
        },
        {
          lead: "Consistent draw performance",
          text: "maintained right across the full 300 to 400 puff capacity",
        },
      ],
      image: "/juul_menthol_pack.png",
      showIngredients: true,
      ingredientsHeadingTemplate: "{product} Ingredients",
      ingredientsBodyTemplate:
        "The highly regulated {product} e-liquid is exclusively formulated in the USA using a patented mix of ingredients designed specifically for this exact pod and coil. Here is what is inside every genuinely sourced pod in your 2-pack kit:",
      ingredients: [
        {
          title: "Propylene Glycol & Vegetable Glycerin",
          description:
            "The base liquids that retain flavor, dictate throat hit, and deliver a smooth and consistent cloud volume from start to finish.",
        },
        {
          title: "Benzoic Acid",
          description:
            "The crucial component used to provide the signature JUUL satisfaction. It reacts with the nicotine to optimize it. This creates the salt nicotine compound, ensuring it hits smoothly and quickly.",
        },
        {
          title: "Flavorings",
          description:
            "Proprietary artificial and natural flavorings are formulated to deliver a crisp, clean, and satisfying experience without leaving an artificial aftertaste.",
        },
        {
          title: "Nicotine",
          description:
            "18mg/mL of pharmaceutical-grade, pure liquid nicotine. Specifically designed for adult smokers.",
        },
      ],
      ingredientsImage: "/juul_menthol_pod.png",
    },
  },

  relatedProducts: {
    type: "relatedProducts",
    label: "Related Products",
    description: "Recommendation carousel, built from the store's own catalogue.",
    templates: ["product"],
    contentInCode: true,
    fields: [
      { type: "text", key: "heading", label: "Heading" },
      { type: "number", key: "maxProducts", label: "Products to show", min: 2, max: 20, step: 1 },
      { type: "toggle", key: "showViewAll", label: "Show the 'view all' link" },
    ],
    defaults: { heading: "You May Also Like", maxProducts: 10, showViewAll: true },
  },
};

/* ── Shared section groups (header / footer) ──────────────────────── */

/** Fields for the header, which renders on every page. */
export const HEADER_FIELDS: FieldDef[] = [
  { type: "toggle", key: "announcementEnabled", label: "Show announcement bar" },
  { type: "textarea", key: "announcementText", label: "Announcement text", rows: 2 },
  {
    type: "repeater",
    key: "menu",
    label: "Main menu",
    itemNoun: "menu item",
    itemLabelKey: "label",
    max: 20,
    defaultItem: { label: "New Item", href: "/collections/", children: [] },
    fields: [
      { type: "text", key: "label", label: "Label" },
      { type: "link", key: "href", label: "Link", placeholder: "/collections/..." },
      {
        type: "repeater",
        key: "children",
        label: "Dropdown items",
        itemNoun: "link",
        itemLabelKey: "label",
        max: 30,
        defaultItem: { label: "New Link", href: "/collections/" },
        fields: [
          { type: "text", key: "label", label: "Label" },
          { type: "link", key: "href", label: "Link" },
        ],
      },
    ],
  },
];

/** Fields for the footer, which renders on every page. */
export const FOOTER_FIELDS: FieldDef[] = [
  {
    type: "repeater",
    key: "trustItems",
    label: "Trust bar",
    itemNoun: "item",
    itemLabelKey: "title",
    max: 6,
    defaultItem: { icon: "BadgeCheck", title: "New item", subtitle: "" },
    fields: [
      { type: "icon", key: "icon", label: "Icon" },
      { type: "text", key: "title", label: "Title" },
      { type: "text", key: "subtitle", label: "Subtitle" },
    ],
  },
  { type: "textarea", key: "description", label: "Store description", rows: 4 },
  { type: "text", key: "whatsappLabel", label: "WhatsApp button label" },
  {
    type: "text",
    key: "whatsappNumber",
    label: "WhatsApp number",
    help: "Digits only, with country code and no +.",
  },
  { type: "text", key: "ratingText", label: "Rating text" },
  {
    type: "repeater",
    key: "columns",
    label: "Link columns",
    itemNoun: "column",
    itemLabelKey: "heading",
    max: 4,
    defaultItem: { heading: "New Column", links: [] },
    fields: [
      { type: "text", key: "heading", label: "Column heading" },
      {
        type: "repeater",
        key: "links",
        label: "Links",
        itemNoun: "link",
        itemLabelKey: "label",
        max: 20,
        defaultItem: { label: "New Link", href: "/" },
        fields: [
          { type: "text", key: "label", label: "Label" },
          { type: "link", key: "href", label: "Link" },
        ],
      },
    ],
  },
  { type: "text", key: "contactHeading", label: "Contact column heading" },
  { type: "text", key: "addressLabel", label: "Address label" },
  { type: "textarea", key: "address", label: "Address", rows: 2 },
  { type: "text", key: "phone", label: "Phone" },
  { type: "text", key: "email", label: "Email" },
  { type: "text", key: "hoursNote", label: "Opening hours note" },
  { type: "textarea", key: "healthWarning", label: "Health warning", rows: 3 },
  {
    type: "repeater",
    key: "paymentBadges",
    label: "Payment badges",
    itemNoun: "badge",
    itemLabelKey: "label",
    max: 6,
    defaultItem: { icon: "CreditCard", label: "New badge" },
    fields: [
      { type: "icon", key: "icon", label: "Icon" },
      { type: "text", key: "label", label: "Label" },
    ],
  },
  { type: "text", key: "copyright", label: "Copyright line" },
  { type: "text", key: "poweredByLabel", label: "'Powered by' label" },
  { type: "link", key: "poweredByHref", label: "'Powered by' link" },
  {
    type: "repeater",
    key: "bottomLinks",
    label: "Bottom links",
    itemNoun: "link",
    itemLabelKey: "label",
    max: 8,
    defaultItem: { label: "New Link", href: "/" },
    fields: [
      { type: "text", key: "label", label: "Label" },
      { type: "link", key: "href", label: "Link" },
    ],
  },
];

export const SECTION_TYPES = Object.keys(SECTION_REGISTRY);

export function getSectionDef(type: string): SectionDef | undefined {
  return SECTION_REGISTRY[type];
}

/** Sections a merchant may add to a given template type. */
export function sectionsForTemplate(templateType: TemplateType): SectionDef[] {
  return Object.values(SECTION_REGISTRY)
    .filter((def) => def.templates.includes(templateType) && !def.required)
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * What the JUUL Tech Specs section says on JUUL 2 collections.
 *
 * The section's own defaults describe JUUL 1, which is what most JUUL pages
 * are. The JUUL 2 family template starts from these instead — see
 * `collection-families.ts`. Both are merchant-editable from that point on.
 */
export const JUUL_2_TECH_SPECS = {
  heading: "Next-Gen Smart Tech",
  description:
    "JUUL 2 Pod System features anti-counterfeit pod technology, smart battery indicators, and 1.2mL pre-filled nicotine salt pods.",
  specs: [
    { icon: "Battery", accent: "emerald", label: "BATTERY CAPACITY", value: "250 mAh (Rechargeable)" },
    { icon: "Zap", accent: "amber", label: "CHARGING TYPE", value: "JUUL 2 Magnetic USB Dock" },
    { icon: "Droplet", accent: "blue", label: "POD CAPACITY", value: "1.2 mL (+70% E-Liquid)" },
    { icon: "Cpu", accent: "purple", label: "SMART FEATURES", value: "LED Battery & Pod Level Indicator" },
    { icon: "Activity", accent: "rose", label: "NICOTINE STRENGTH", value: "18 mg/ml (1.8% Salt Nic)" },
    { icon: "Box", accent: "teal", label: "MATERIAL & FINISH", value: "Slate Anodized Metal Body" },
  ],
} as const;

/**
 * The flavour line-up on JUUL 2 collections.
 *
 * Same reasoning as `JUUL_2_TECH_SPECS`: the section's own defaults describe
 * JUUL 1 pods, and the JUUL 2 family template starts from these instead.
 */
export const JUUL_2_FLAVORS = {
  flavors: [
    {
      id: "juul2-crisp-menthol",
      name: "Crisp Menthol 18mg",
      color: "#06b6d4",
      podsPerPack: "2 PODS PER PACK",
      strength: "STRENGTH: 18mg/ml",
      price: 85.0,
      description:
        '"JUUL 2 Crisp Menthol features fresh green menthol flavor with a brisk cooling exhale. Engineered with anti-counterfeit chip technology."',
      image: "/juul_device.png",
    },
    {
      id: "juul2-virginia-tobacco",
      name: "Virginia Tobacco 18mg",
      color: "#d97706",
      podsPerPack: "2 PODS PER PACK",
      strength: "STRENGTH: 18mg/ml",
      price: 90.0,
      description:
        '"Subtle, toasted tobacco flavor with sweet aromatic notes. Specially blended for JUUL 2 next-gen pod system."',
      image: "/juul_device.png",
    },
    {
      id: "juul2-ruby-scheme",
      name: "Ruby Scheme 18mg",
      color: "#ec4899",
      podsPerPack: "2 PODS PER PACK",
      strength: "STRENGTH: 18mg/ml",
      price: 85.0,
      description:
        '"JUUL 2 Ruby Scheme combines wild red berry notes with a crisp cooling finish. Unique signature blend."',
      image: "/juul_device.png",
    },
    {
      id: "juul2-polar-menthol",
      name: "Polar Menthol 18mg",
      color: "#3b82f6",
      podsPerPack: "2 PODS PER PACK",
      strength: "STRENGTH: 18mg/ml",
      price: 85.0,
      description:
        '"Deep, intense freezing menthol flavor with a powerful cooling hit designed for maximum satisfaction."',
      image: "/juul_device.png",
    },
  ],
};

/**
 * The related-collection cards each family shows.
 *
 * `bottomCollectionGrid` picks a set from the handle when its own `cards` are
 * empty, which is what keeps the grid useful on the shop page and on any
 * collection nobody has customised. The collection family templates start from
 * the matching set instead, so those cards are editable where they apply.
 */
export const BOTTOM_GRID_CARDS = {
  juul: [
    {
      title: "JUUL 1 Series",
      subtitle: "Classic JUUL 1 Devices, Virginia Tobacco & Menthol Pods (3% & 5%)",
      image: "/juul_device.png",
      href: "/collections/juul-1-series",
    },
    {
      title: "JUUL 2 Series",
      subtitle: "Next-Gen JUUL 2 Starter Kit, Ruby Scheme & Crisp Menthol Pods",
      image: "/juul_device.png",
      href: "/collections/juul-2-series",
    },
    {
      title: "JUUL Pods Offers",
      subtitle: "Special Multi-Pack Bundle Deals on JUUL 1 & JUUL 2 Pods",
      image: "/vape_kit.png",
      href: "/collections/juul-pods-offers",
    },
  ],
  myle: [
    {
      title: "MYLE Meta V5 Pods",
      subtitle: "Pre-filled Meta V5 Pods in Iced Mint, Peach & Tobacco Flavors",
      image: "/vape_kit.png",
      href: "/collections/myle-v5-pods",
    },
    {
      title: "MYLE Meta V5 Devices",
      subtitle: "Rechargeable Meta V5 Battery Devices in Jet Black & Rose Gold",
      image: "/vape_kit.png",
      href: "/collections/myle-v5-device",
    },
    {
      title: "MYLE Micro Disposables",
      subtitle: "Compact MYLE Micro & Drip 2500+ Puffs Disposable Pods",
      image: "/lost_mary.png",
      href: "/collections/myle-disposable",
    },
  ],
  disposable: [
    {
      title: "Geek Bar Pulse 15000",
      subtitle: "Geek Bar Pulse 15000 Puffs Dual Mesh & Full LED Screen",
      image: "/lost_mary.png",
      href: "/collections/geek-bar-disposable",
    },
    {
      title: "Elf Bar Disposables",
      subtitle: "Elf Bar BC5000, Ultra & Lowit Pod Disposables",
      image: "/lost_mary.png",
      href: "/collections/elf-bar-vape",
    },
    {
      title: "Lost Mary BM6000",
      subtitle: "Lost Mary BM6000 & MO5000 Fruity Mesh Coil Vapes",
      image: "/lost_mary.png",
      href: "/collections/lost-mary-disposable",
    },
    {
      title: "Tugboat Super 12000",
      subtitle: "Tugboat Super 12000 Puffs Rechargeable Mesh Vapes",
      image: "/lost_mary.png",
      href: "/collections/tugboat-vape",
    },
    {
      title: "Al Fakher Crown Bar",
      subtitle: "Al Fakher Crown Bar 8000 & 10000 Shisha Flavor Vapes",
      image: "/premium_liquid.png",
      href: "/collections/al-fakher-vape",
    },
    {
      title: "Fummo & Vozol Vapes",
      subtitle: "Fummo Target 10000 & Vozol Gear 10000 Outdoor Vapes",
      image: "/lost_mary.png",
      href: "/collections/fummo-vape",
    },
  ],
  ejuice: [
    {
      title: "Salt Nicotine Liquids",
      subtitle: "Premium Nic Salt E-Liquids in 20mg, 30mg & 50mg Strengths",
      image: "/premium_liquid.png",
      href: "/collections/salt-nicotine",
    },
    {
      title: "Freebase E-Liquids",
      subtitle: "High VG 60ml & 100ml Sub-Ohm E-Liquids in 3mg & 6mg",
      image: "/premium_liquid.png",
      href: "/collections/freebase-e-liquid",
    },
    {
      title: "Pod Salt E-Juice",
      subtitle: "British Nicotine Salt Liquids in Nexus & Core Series",
      image: "/premium_liquid.png",
      href: "/collections/pod-salt-vape",
    },
    {
      title: "VGOD Stig E-Liquids",
      subtitle: "VGOD Cubano Tobacco & Mighty Mint Salt Liquids",
      image: "/premium_liquid.png",
      href: "/collections/vgod-stig",
    },
  ],
  podSystem: [
    {
      title: "Uwell Caliburn Series",
      subtitle: "Caliburn G3, AK3 & GK3 Refillable Pod Systems",
      image: "/vape_kit.png",
      href: "/collections/uwell-vape",
    },
    {
      title: "Vaporesso XROS Series",
      subtitle: "XROS 3, XROS Mini & Luxe Pod Kits with COREX Tech",
      image: "/vape_kit.png",
      href: "/collections/vaporesso-vape",
    },
    {
      title: "OXVA Xlim Pod Kits",
      subtitle: "Xlim Pro & SQ Pro Pod Systems with OLED Display",
      image: "/vape_kit.png",
      href: "/collections/oxva-vape",
    },
    {
      title: "Pod Cartridges & Coils",
      subtitle: "Replacement Pod Cartridges & Mesh Coils for All Kits",
      image: "/vape_kit.png",
      href: "/collections/pod-cartridge",
    },
  ],
};
