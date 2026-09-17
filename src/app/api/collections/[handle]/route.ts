import { NextResponse } from "next/server";

import { parseCollectionSections } from "@/lib/theme/collection-sections";

const SHOPIFY_STORE = process.env.SHOPIFY_STORE!;
const ADMIN_API_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;
const STOREFRONT_TOKEN =
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.SHOPIFY_API_KEY;

/* ── Storefront API query ─────────────────────────── */
const storefrontCollectionQuery = `
query CollectionByHandle($handle: String!) {
  collectionByHandle(handle: $handle) {
    id
    title
    description
    descriptionHtml
    image {
      url
      altText
      width
      height
    }
    seo {
      title
      description
    }
    bannerImage: metafield(namespace: "custom", key: "banner_image") { value }
    eyebrowText: metafield(namespace: "custom", key: "eyebrow") { value }
    customHeading: metafield(namespace: "custom", key: "custom_heading") { value }
    flavorsWheelMeta: metafield(namespace: "custom", key: "flavors_wheel") { value }
    faqsMeta: metafield(namespace: "custom", key: "faqs") { value }
    faqSectionMeta: metafield(namespace: "custom", key: "faq_section") {
      reference {
        ... on Metaobject {
          fields {
            key
            value
            references(first: 30) {
              nodes {
                ... on Metaobject {
                  fields {
                    key
                    value
                  }
                }
              }
            }
          }
        }
      }
    }
    faqItemsMeta: metafield(namespace: "custom", key: "faq_items") {
      references(first: 30) {
        edges {
          node {
            ... on Metaobject {
              fields {
                key
                value
              }
            }
          }
        }
      }
    }
    faqBadgeMeta: metafield(namespace: "custom", key: "faq_badge") { value }
    faqHeadingMeta: metafield(namespace: "custom", key: "faq_heading") { value }
    faqDescriptionMeta: metafield(namespace: "custom", key: "faq_description") { value }
    faqVerifiedMeta: metafield(namespace: "custom", key: "faq_verified") { value }
    seoGuideMeta: metafield(namespace: "custom", key: "seo_guide") { value }
    sectionSettingsMeta: metafield(namespace: "custom", key: "section_settings") { value }
    pageSectionsMeta: metafield(namespace: "custom", key: "page_sections") { value }
    combinedDetailsMeta: metafield(namespace: "custom", key: "collection_details") { value }
    subCollectionsMeta: metafield(namespace: "custom", key: "sub_collections") { value }
    techSpecsMeta: metafield(namespace: "custom", key: "tech_specs") {
      reference { ... on Metaobject { fields { key value } } }
    }
    featureBanner1Meta: metafield(namespace: "custom", key: "feature_banner_1") {
      reference { ... on Metaobject { fields { key value } } }
    }
    featureBanner2Meta: metafield(namespace: "custom", key: "feature_banner_2") {
      reference { ... on Metaobject { fields { key value } } }
    }
    packagingCompareMeta: metafield(namespace: "custom", key: "packaging_compare") {
      reference { ... on Metaobject { fields { key value } } }
    }
    authenticityGuideMeta: metafield(namespace: "custom", key: "authenticity_guide") {
      reference { ... on Metaobject { fields { key value } } }
    }
    collectionReviewsMeta: metafield(namespace: "custom", key: "collection_reviews") {
      references(first: 20) {
        edges {
          node {
            ... on Metaobject { fields { key value } }
          }
        }
      }
    }
  }
}
`;

/* ── Admin API query (fallback) ───────────────────── */
const adminCollectionQuery = `
query CollectionByHandle($handle: String!) {
  collectionByHandle(handle: $handle) {
    id
    title
    description
    descriptionHtml
    image {
      url
      altText
      width
      height
    }
    seo {
      title
      description
    }
    bannerImage: metafield(namespace: "custom", key: "banner_image") { value }
    eyebrowText: metafield(namespace: "custom", key: "eyebrow") { value }
    customHeading: metafield(namespace: "custom", key: "custom_heading") { value }
    flavorsWheelMeta: metafield(namespace: "custom", key: "flavors_wheel") { value }
    faqsMeta: metafield(namespace: "custom", key: "faqs") { value }
    faqSectionMeta: metafield(namespace: "custom", key: "faq_section") {
      reference {
        ... on Metaobject {
          fields {
            key
            value
            references(first: 30) {
              nodes {
                ... on Metaobject {
                  fields {
                    key
                    value
                  }
                }
              }
            }
          }
        }
      }
    }
    faqItemsMeta: metafield(namespace: "custom", key: "faq_items") {
      references(first: 30) {
        edges {
          node {
            ... on Metaobject {
              fields {
                key
                value
              }
            }
          }
        }
      }
    }
    faqBadgeMeta: metafield(namespace: "custom", key: "faq_badge") { value }
    faqHeadingMeta: metafield(namespace: "custom", key: "faq_heading") { value }
    faqDescriptionMeta: metafield(namespace: "custom", key: "faq_description") { value }
    faqVerifiedMeta: metafield(namespace: "custom", key: "faq_verified") { value }
    seoGuideMeta: metafield(namespace: "custom", key: "seo_guide") { value }
    sectionSettingsMeta: metafield(namespace: "custom", key: "section_settings") { value }
    pageSectionsMeta: metafield(namespace: "custom", key: "page_sections") { value }
    combinedDetailsMeta: metafield(namespace: "custom", key: "collection_details") { value }
    subCollectionsMeta: metafield(namespace: "custom", key: "sub_collections") { value }
    techSpecsMeta: metafield(namespace: "custom", key: "tech_specs") {
      reference { ... on Metaobject { fields { key value } } }
    }
    featureBanner1Meta: metafield(namespace: "custom", key: "feature_banner_1") {
      reference { ... on Metaobject { fields { key value } } }
    }
    featureBanner2Meta: metafield(namespace: "custom", key: "feature_banner_2") {
      reference { ... on Metaobject { fields { key value } } }
    }
    packagingCompareMeta: metafield(namespace: "custom", key: "packaging_compare") {
      reference { ... on Metaobject { fields { key value } } }
    }
    authenticityGuideMeta: metafield(namespace: "custom", key: "authenticity_guide") {
      reference { ... on Metaobject { fields { key value } } }
    }
    collectionReviewsMeta: metafield(namespace: "custom", key: "collection_reviews") {
      references(first: 20) {
        edges {
          node {
            ... on Metaobject { fields { key value } }
          }
        }
      }
    }
  }
}
`;

export interface CollectionMeta {
  title: string;
  description: string;
  descriptionHtml: string;
  image: { url: string; altText: string; width: number; height: number } | null;
  seo: { title: string; description: string } | null;
  bannerImage?: string | null;
  eyebrowText?: string | null;
  customHeading?: string | null;
  flavorsWheelJson?: any | null;
  faqsJson?: any | null;
  seoGuideHtml?: string | null;
  sectionSettingsJson?: any | null;
  subPillsJson?: any | null;
  techSpecsMeta?: any | null;
  featureBanner1Meta?: any | null;
  featureBanner2Meta?: any | null;
  packagingCompareMeta?: any | null;
  authenticityGuideMeta?: any | null;
  collectionReviewsMeta?: any | null;
  /** This collection's own section layout, when it has been customised. */
  pageSections?: unknown | null;
}

export async function fetchCollection(handle: string): Promise<CollectionMeta | null> {
  if (!SHOPIFY_STORE) {
    throw new Error("SHOPIFY_STORE is not configured");
  }

  // Try Storefront API first
  if (STOREFRONT_TOKEN) {
    try {
      const url = `https://${SHOPIFY_STORE}/api/2024-10/graphql.json`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: storefrontCollectionQuery,
          variables: { handle },
        }),
        cache: "no-store",
      });

      if (response.ok) {
        const json = await response.json();
        const col = json.data?.collectionByHandle;
        if (col) return mapCollection(col);
      }
    } catch (err) {
      console.warn("Storefront collection fetch failed, trying Admin:", err);
    }
  }

  // Fallback: Admin API
  if (ADMIN_API_TOKEN) {
    const url = `https://${SHOPIFY_STORE}/admin/api/2024-10/graphql.json`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": ADMIN_API_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: adminCollectionQuery,
        variables: { handle },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Shopify Admin API error: ${response.statusText}`);
    }

    const json = await response.json();
    if (json.errors) {
      throw new Error(`Shopify GraphQL errors: ${JSON.stringify(json.errors)}`);
    }

    const col = json.data?.collectionByHandle;
    if (col) return mapCollection(col);
  }

  return null;
}

/**
 * Super-easy All-in-One Combined Parser:
 * Allows a non-coder merchant to put EVERYTHING into 1 single multi-line text field (`custom.collection_details`) or standard Description box!
 */
function cleanRawCss(input: string): string {
  if (!input) return "";
  let s = input;
  s = s.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  s = s.replace(/&lt;style[^>]*&gt;[\s\S]*?&lt;\/style&gt;/gi, "");
  s = s.replace(/(?:PRODUCTS\s+AFTER|:AFTER|\.[a-z0-9_-]+|#[a-z0-9_-]+|:[a-z_-]+)[^{]*\{[^}]+\}/gi, "");
  return s.trim();
}

function parseCombinedBlock(rawText: string) {
  if (!rawText || !rawText.trim()) return null;

  const text = cleanRawCss(rawText);
  if (!text) return null;

  let eyebrow: string | null = null;
  let heading: string | null = null;
  let flavors: any[] | null = null;
  let faqs: any | null = null;
  let guideHtml: string | null = null;

  // Sheet format: TAG = ... or EYEBROW = ... or Eyebrow: ...
  const tagMatch = text.match(/(?:TAG|EYEBROW)\s*[:=]\s*([^\n]+)/i);
  if (tagMatch && !tagMatch[1].includes("{") && tagMatch[1].length < 100) {
    eyebrow = tagMatch[1].trim();
  }

  // Sheet format: TITLE = ... or HEADING = ... or Title: ...
  const titleMatch = text.match(/(?:TITLE|HEADING)\s*[:=]\s*([^\n]+)/i);
  if (titleMatch && !titleMatch[1].includes("{") && titleMatch[1].length < 150) {
    heading = titleMatch[1].trim();
  }

  // Sheet format: FLAVORS = Mango, Strawberry, Mint or Flavors: ...
  const flavorsMatch = text.match(/(?:FLAVORS|FLAVOURS|FLAVOR_LIST)\s*[:=]\s*([^\n]+)/i);
  if (flavorsMatch) {
    flavors = parseFlavorsSimpleText(flavorsMatch[1].trim());
  }

  // Sheet format: GUIDE = ... or CONTENT = ...
  const guideMatch = text.match(/(?:GUIDE|CONTENT|DESCRIPTION)\s*[:=]\s*([\s\S]+?)(?=\n(?:Q:|TITLE=|TAG=|FLAVORS=)|$)/i);
  if (guideMatch) guideHtml = guideMatch[1].trim();

  // FAQs block if Q: & A: present
  if (text.includes("Q:") || text.includes("q:")) {
    faqs = parseFaqsMetafield(text);
  }

  return { eyebrow, heading, flavors, faqs, guideHtml };
}

function parseFlavorsSimpleText(val: unknown) {
  if (!val) return null;
  let str = "";
  if (typeof val === "string") str = val;
  else if (typeof val === "object") return val;

  if (!str.trim()) return null;

  // Try JSON parse first
  if (str.trim().startsWith("[") || str.trim().startsWith("{")) {
    try {
      return JSON.parse(str);
    } catch {
      // Fall through to plain text parsing
    }
  }

  // Non-coder friendly: comma-separated or newline-separated list
  const names = str.split(/,|\n/).map((s) => s.trim()).filter(Boolean);
  if (names.length === 0) return null;

  const defaultColors = ["#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#06b6d4", "#10b981", "#8b5cf6", "#f97316"];

  return names.map((name, idx) => ({
    name,
    query: name.split("&")[0].trim(),
    color: defaultColors[idx % defaultColors.length],
  }));
}

/**
 * Parses the `custom.faqs` metafield into a full FAQ section config.
 *
 * Supports two formats:
 *
 * **Plain-text (non-coder friendly):**
 * ```
 * BADGE = Customer Help & FAQs
 * HEADING = Frequently Asked Questions
 * DESCRIPTION = Find answers about...
 * VERIFIED = Verified Answer for Dubai Customers
 *
 * Q: How fast is delivery?
 * A: We offer 2-Hour Express Delivery...
 *
 * Q: Are products authentic?
 * A: Yes, 100%!
 * ```
 *
 * **JSON (advanced):**
 * ```json
 * {
 *   "badgeText": "Help & FAQs",
 *   "heading": "FAQ",
 *   "description": "...",
 *   "verifiedNote": "...",
 *   "items": [{ "question": "...", "answer": "..." }]
 * }
 * ```
 *
 * Returns `{ badgeText, heading, description, verifiedNote, items[] }` or null.
 */
function parseFaqsMetafield(val: unknown): {
  badgeText?: string;
  heading?: string;
  description?: string;
  verifiedNote?: string;
  items: { question: string; answer: string }[];
} | null {
  if (!val) return null;
  let str = "";
  if (typeof val === "string") str = val;
  else if (typeof val === "object") {
    // Already parsed JSON — normalize shape
    const obj = val as Record<string, unknown>;
    if (Array.isArray(obj)) {
      // Legacy flat array of {question, answer}
      return obj.length > 0 ? { items: obj as { question: string; answer: string }[] } : null;
    }
    if (obj.items && Array.isArray(obj.items)) return obj as any;
    return null;
  }

  if (!str.trim()) return null;

  // Try JSON parse first
  if (str.trim().startsWith("[") || str.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) {
        return parsed.length > 0 ? { items: parsed } : null;
      }
      if (parsed.items && Array.isArray(parsed.items)) return parsed;
      return null;
    } catch {
      // Fall through to plain-text parsing
    }
  }

  // ── Plain-text parsing ──
  let badgeText: string | undefined;
  let heading: string | undefined;
  let description: string | undefined;
  let verifiedNote: string | undefined;

  // Extract header fields
  const badgeMatch = str.match(/^BADGE\s*[:=]\s*(.+)$/im);
  if (badgeMatch) badgeText = badgeMatch[1].trim();

  const headingMatch = str.match(/^HEADING\s*[:=]\s*(.+)$/im);
  if (headingMatch) heading = headingMatch[1].trim();

  const descMatch = str.match(/^DESCRIPTION\s*[:=]\s*(.+)$/im);
  if (descMatch) description = descMatch[1].trim();

  const verifiedMatch = str.match(/^VERIFIED\s*[:=]\s*(.+)$/im);
  if (verifiedMatch) verifiedNote = verifiedMatch[1].trim();

  // Extract Q&A pairs
  const items: { question: string; answer: string }[] = [];

  // Split into blocks by double newline
  const blocks = str.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);

  for (const block of blocks) {
    // Skip header-only blocks
    if (/^(BADGE|HEADING|DESCRIPTION|VERIFIED)\s*[:=]/im.test(block) && !block.match(/^Q:/im)) {
      continue;
    }

    const lines = block.split("\n").map((l) => l.trim());
    let q = "";
    let a = "";
    for (const line of lines) {
      // Skip header lines inside mixed blocks
      if (/^(BADGE|HEADING|DESCRIPTION|VERIFIED)\s*[:=]/i.test(line)) continue;

      if (line.toLowerCase().startsWith("q:") || line.toLowerCase().startsWith("question:")) {
        q = line.replace(/^(q:|question:)/i, "").trim();
      } else if (line.toLowerCase().startsWith("a:") || line.toLowerCase().startsWith("answer:")) {
        a = line.replace(/^(a:|answer:)/i, "").trim();
      } else if (!q) {
        q = line;
      } else {
        a += (a ? " " : "") + line;
      }
    }
    if (q) {
      items.push({
        question: q,
        answer: a || "100% authentic products with 2-hour express delivery across Dubai & UAE.",
      });
    }
  }

  if (items.length === 0 && !badgeText && !heading && !description && !verifiedNote) {
    return null;
  }

  return {
    ...(badgeText ? { badgeText } : {}),
    ...(heading ? { heading } : {}),
    ...(description ? { description } : {}),
    ...(verifiedNote ? { verifiedNote } : {}),
    items,
  };
}

function parseJsonSafe(val: unknown) {
  if (!val) return null;
  if (typeof val === "object") return val;
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return null;
    }
  }
  return null;
}

function parseMetaobjectFields(fields: any[] | undefined): Record<string, any> | null {
  if (!fields || !Array.isArray(fields) || fields.length === 0) return null;
  const obj: Record<string, any> = {};
  for (const f of fields) {
    if (f.key && f.value !== undefined) {
      obj[f.key] = f.value;
    }
  }
  return Object.keys(obj).length > 0 ? obj : null;
}

function parseSubPills(val: unknown) {
  if (!val) return null;
  if (typeof val === "object") return val;
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      const items = val.split(",").map((s) => {
        const parts = s.split("|").map((p) => p.trim());
        return { label: parts[0] || "", query: parts[1] || "all" };
      }).filter((i) => i.label);
      return items.length > 0 ? items : null;
    }
  }
  return null;
}

function mapCollection(col: Record<string, unknown>): CollectionMeta {
  const image = col.image as Record<string, unknown> | null;
  const seo = col.seo as Record<string, unknown> | null;

  const bannerImage = (col.bannerImage as { value?: string })?.value || null;
  const eyebrowText = (col.eyebrowText as { value?: string })?.value || null;
  const customHeading = (col.customHeading as { value?: string })?.value || null;
  const flavorsWheelMeta = (col.flavorsWheelMeta as { value?: string })?.value || null;
  const faqsMeta = (col.faqsMeta as { value?: string })?.value || null;
  const seoGuideMeta = (col.seoGuideMeta as { value?: string })?.value || null;
  const sectionSettingsMeta = (col.sectionSettingsMeta as { value?: string })?.value || null;
  const combinedDetailsMeta = (col.combinedDetailsMeta as { value?: string })?.value || null;
  const pageSectionsMeta = (col.pageSectionsMeta as { value?: string })?.value || null;

  // ── 1. Combined Parent Metaobject (Single Metafield in Admin) ──
  let faqsFromParentSection: any = null;
  const faqSectionRef = (col.faqSectionMeta as any)?.reference;
  if (faqSectionRef?.fields) {
    const fields = faqSectionRef.fields as any[];
    const badgeVal = fields.find((f: any) => f.key === "badge")?.value;
    const headingVal = fields.find((f: any) => f.key === "heading")?.value;
    const descVal = fields.find((f: any) => f.key === "description")?.value;
    const verifiedVal = fields.find((f: any) => f.key === "verified")?.value;

    const itemsNodes = fields.find((f: any) => f.key === "items")?.references?.nodes;
    let sectionItems: { question: string; answer: string }[] = [];
    if (itemsNodes && Array.isArray(itemsNodes)) {
      sectionItems = itemsNodes.map((node: any) => {
        const itemFields = node.fields || [];
        const q = itemFields.find((f: any) => f.key === "question")?.value || "";
        const a = itemFields.find((f: any) => f.key === "answer")?.value || "";
        return { question: q, answer: a };
      }).filter((item) => item.question);
    }

    if (sectionItems.length > 0 || badgeVal || headingVal || descVal || verifiedVal) {
      faqsFromParentSection = {
        ...(badgeVal ? { badgeText: badgeVal } : {}),
        ...(headingVal ? { heading: headingVal } : {}),
        ...(descVal ? { description: descVal } : {}),
        ...(verifiedVal ? { verifiedNote: verifiedVal } : {}),
        items: sectionItems,
      };
    }
  }

  // ── 2. Individual metaobject-based FAQ fields (5-metafield fallback) ──
  const faqBadge = (col.faqBadgeMeta as { value?: string })?.value || null;
  const faqHeading = (col.faqHeadingMeta as { value?: string })?.value || null;
  const faqDescription = (col.faqDescriptionMeta as { value?: string })?.value || null;
  const faqVerified = (col.faqVerifiedMeta as { value?: string })?.value || null;

  // Parse metaobject FAQ items (list.metaobject_reference)
  let faqItemsFromMetaobject: { question: string; answer: string }[] | null = null;
  const faqItemsRefs = (col.faqItemsMeta as any)?.references?.edges;
  if (faqItemsRefs && faqItemsRefs.length > 0) {
    faqItemsFromMetaobject = faqItemsRefs.map((edge: any) => {
      const fields = edge.node.fields || [];
      const questionField = fields.find((f: any) => f.key === "question");
      const answerField = fields.find((f: any) => f.key === "answer");
      return {
        question: questionField?.value || "",
        answer: answerField?.value || "",
      };
    }).filter((item: any) => item.question);
  }

  // Smart combined block parsing for 1-field easy setup
  const combinedParsed = parseCombinedBlock(combinedDetailsMeta || (col.description as string) || "");

  let headingVal = customHeading || combinedParsed?.heading || null;
  if (headingVal && (typeof headingVal === "string" && headingVal.trim().startsWith("{"))) {
    headingVal = null;
  }

  // Build FAQ JSON priority:
  // 1. Combined parent metaobject (custom.faq_section)
  // 2. Individual metaobject fields (custom.faq_items + custom.faq_heading, etc.)
  // 3. Text metafield (custom.faqs)
  // 4. Description combined block
  let faqsJson: any = null;
  if (faqsFromParentSection) {
    faqsJson = faqsFromParentSection;
  } else if (faqItemsFromMetaobject && faqItemsFromMetaobject.length > 0) {
    faqsJson = {
      ...(faqBadge ? { badgeText: faqBadge } : {}),
      ...(faqHeading ? { heading: faqHeading } : {}),
      ...(faqDescription ? { description: faqDescription } : {}),
      ...(faqVerified ? { verifiedNote: faqVerified } : {}),
      items: faqItemsFromMetaobject,
    };
  } else {
    // Fallback: old text-based custom.faqs or combined block
    faqsJson = parseFaqsMetafield(faqsMeta) || combinedParsed?.faqs || null;
  }

  // Parse subPills
  const subCollectionsRaw = (col.subCollectionsMeta as { value?: string })?.value || null;
  const subPillsJson = parseSubPills(subCollectionsRaw);

  // Parse metaobject references
  const techSpecsMeta = parseMetaobjectFields((col.techSpecsMeta as any)?.reference?.fields);
  const featureBanner1Meta = parseMetaobjectFields((col.featureBanner1Meta as any)?.reference?.fields);
  const featureBanner2Meta = parseMetaobjectFields((col.featureBanner2Meta as any)?.reference?.fields);
  const packagingCompareMeta = parseMetaobjectFields((col.packagingCompareMeta as any)?.reference?.fields);
  const authenticityGuideMeta = parseMetaobjectFields((col.authenticityGuideMeta as any)?.reference?.fields);

  // Parse collection reviews list
  let collectionReviewsMeta: any[] | null = null;
  const revEdges = (col.collectionReviewsMeta as any)?.references?.edges;
  if (revEdges && Array.isArray(revEdges) && revEdges.length > 0) {
    collectionReviewsMeta = revEdges.map((edge: any) => parseMetaobjectFields(edge.node?.fields)).filter(Boolean);
  }

  return {
    title: (col.title as string) || "",
    description: (col.description as string) || "",
    descriptionHtml: (col.descriptionHtml as string) || "",
    image: image
      ? {
          url: (image.url as string) || "",
          altText: (image.altText as string) || "",
          width: (image.width as number) || 0,
          height: (image.height as number) || 0,
        }
      : null,
    seo: seo
      ? {
          title: (seo.title as string) || "",
          description: (seo.description as string) || "",
        }
      : null,
    bannerImage,
    eyebrowText: eyebrowText || combinedParsed?.eyebrow || null,
    customHeading: headingVal,
    flavorsWheelJson: parseFlavorsSimpleText(flavorsWheelMeta) || combinedParsed?.flavors || null,
    faqsJson,
    seoGuideHtml: seoGuideMeta || combinedParsed?.guideHtml || null,
    sectionSettingsJson: parseJsonSafe(sectionSettingsMeta),
    subPillsJson,
    techSpecsMeta,
    featureBanner1Meta,
    featureBanner2Meta,
    packagingCompareMeta,
    authenticityGuideMeta,
    collectionReviewsMeta,
    // Validated here rather than on the page: an unparseable or stale layout
    // becomes null, and the page falls back to the theme's collection template.
    pageSections: parseCollectionSections(pageSectionsMeta),
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params;

    if (!handle) {
      return NextResponse.json(
        { error: "Collection handle is required" },
        { status: 400 }
      );
    }

    const collection = await fetchCollection(handle);

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(collection);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Collection API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
