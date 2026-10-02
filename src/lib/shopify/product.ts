

const SHOPIFY_STORE = process.env.SHOPIFY_STORE!;
const ADMIN_API_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.SHOPIFY_API_KEY;

const storefrontQuery = `
query getProductByHandle($handle: String!) {
  productByHandle(handle: $handle) {
    id
    title
    handle
    vendor
    descriptionHtml
    productType
    tags
    collections(first: 10) {
      edges {
        node {
          id
          handle
          title
        }
      }
    }
    seo {
      title
      description
    }
    faqs: metafield(namespace: "custom", key: "faqs") {
      references(first: 20) {
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
    faqAccordion: metafield(namespace: "custom", key: "faq_accordion") { value }
    youtubeVideoMeta: metafield(namespace: "custom", key: "youtube_video_url") { value }
    videoMeta: metafield(namespace: "custom", key: "video_url") { value }
    productVideoMeta: metafield(namespace: "custom", key: "product_video") { value }
    productVideoUrlMeta: metafield(namespace: "custom", key: "product_video_url") { value }
    videoKeyMeta: metafield(namespace: "custom", key: "video") { value }
    youtubeMeta: metafield(namespace: "custom", key: "youtube") { value }
    allMetafields: metafields(first: 50) {
      edges {
        node {
          namespace
          key
          value
        }
      }
    }
    media(first: 10) {
      edges {
        node {
          mediaContentType
          ... on ExternalVideo {
            id
            embedUrl
            host
          }
          ... on Video {
            id
            sources {
              url
              mimeType
            }
          }
        }
      }
    }
    images(first: 10) {
      edges {
        node {
          url
        }
      }
    }
    options {
      name
      values
    }
    variants(first: 50) {
      edges {
        node {
          id
          title
          price {
            amount
          }
          compareAtPrice {
            amount
          }
          availableForSale
        }
      }
    }
  }
}
`;

const adminQuery = `
query getProductByHandle($handle: String!) {
  productByHandle(handle: $handle) {
    id
    title
    handle
    vendor
    descriptionHtml
    productType
    tags
    status
    collections(first: 10) {
      edges {
        node {
          id
          handle
          title
        }
      }
    }
    seo {
      title
      description
    }
    faqs: metafield(namespace: "custom", key: "faqs") {
      references(first: 20) {
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
    productReviewsMeta: metafield(namespace: "custom", key: "reviews") {
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
    puffs: metafield(namespace: "custom", key: "puffs") { value }
    nicotine: metafield(namespace: "custom", key: "nicotine") { value }
    badge: metafield(namespace: "custom", key: "badge_text") { value }
    rating: metafield(namespace: "custom", key: "rating_value") { value }
    reviews: metafield(namespace: "custom", key: "reviews_count") { value }
    reviewsList: metafield(namespace: "custom", key: "reviews_list") { value }
    reviewsJson: metafield(namespace: "custom", key: "reviews_json") { value }
    battery: metafield(namespace: "custom", key: "spec_battery") { value }
    shortDescription: metafield(namespace: "custom", key: "short_description") { value }
    specsTable: metafield(namespace: "custom", key: "specifications_table") {
      references(first: 30) {
        edges {
          node {
            ... on Metaobject {
              fields { key value }
            }
          }
        }
      }
    }
    faqAccordion: metafield(namespace: "custom", key: "faq_accordion") { value }
    finalThoughtsSectionMeta: metafield(namespace: "custom", key: "final_thoughts") {
      reference {
        ... on Metaobject {
          fields { key value }
        }
      }
    }
    juulFeature1Meta: metafield(namespace: "custom", key: "juul_feature_1") {
      reference {
        ... on Metaobject {
          fields {
            key
            value
            reference {
              ... on MediaImage {
                image { url }
              }
              ... on GenericFile {
                url
              }
            }
            references(first: 30) {
              edges {
                node {
                  ... on Metaobject {
                    fields { key value }
                  }
                }
              }
            }
          }
        }
      }
    }
    juulFeature2Meta: metafield(namespace: "custom", key: "juul_feature_2") {
      reference {
        ... on Metaobject {
          fields {
            key
            value
            reference {
              ... on MediaImage {
                image { url }
              }
              ... on GenericFile {
                url
              }
            }
            references(first: 30) {
              edges {
                node {
                  ... on Metaobject {
                    fields { key value }
                  }
                }
              }
            }
          }
        }
      }
    }
    whyChooseSectionMeta: metafield(namespace: "custom", key: "why_choose") {
      reference {
        ... on Metaobject {
          fields {
            key
            value
            references(first: 30) {
              edges {
                node {
                  ... on Metaobject {
                    fields { key value }
                  }
                }
              }
            }
          }
        }
      }
    }
    productFlavorNotesMeta: metafield(namespace: "custom", key: "flavor_notes") {
      references(first: 50) {
        edges {
          node {
            ... on Metaobject {
              fields { key value }
            }
          }
        }
      }
    }
    youtubeVideoMeta: metafield(namespace: "custom", key: "youtube_video_url") { value }
    videoMeta: metafield(namespace: "custom", key: "video_url") { value }
    productVideoMeta: metafield(namespace: "custom", key: "product_video") { value }
    productVideoUrlMeta: metafield(namespace: "custom", key: "product_video_url") { value }
    videoKeyMeta: metafield(namespace: "custom", key: "video") { value }
    youtubeMeta: metafield(namespace: "custom", key: "youtube") { value }
    allMetafields: metafields(first: 50) {
      edges {
        node {
          namespace
          key
          value
        }
      }
    }
    media(first: 10) {
      edges {
        node {
          mediaContentType
          ... on ExternalVideo {
            id
            embedUrl
            host
          }
          ... on Video {
            id
            sources {
              url
              mimeType
            }
          }
        }
      }
    }
    images(first: 10) {
      edges {
        node {
          url
        }
      }
    }
    options {
      name
      values
    }
    variants(first: 50) {
      edges {
        node {
          id
          title
          price
          compareAtPrice
          availableForSale
          inventoryQuantity
        }
      }
    }
  }
}
`;

function detectBrand(title: string, vendor: string): string {
  const titleLower = title.toLowerCase();
  
  const brands = [
    { name: "Al Fakher", keywords: ["al fakher", "alfakher", "crown bar"] },
    { name: "JUUL", keywords: ["juul"] },
    { name: "BECO", keywords: ["beco"] },
    { name: "MYLE", keywords: ["myle"] },
    { name: "Pod Salt", keywords: ["pod salt", "podsalt"] },
    { name: "Vaporesso", keywords: ["vaporesso"] },
    { name: "Tugboat", keywords: ["tugboat"] },
    { name: "Yuoto", keywords: ["yuoto"] },
    { name: "Nasty", keywords: ["nasty"] },
    { name: "Waka", keywords: ["waka"] },
    { name: "Elf Bar", keywords: ["elf bar", "elfbar"] },
    { name: "Lost Mary", keywords: ["lost mary"] },
    { name: "ISGO", keywords: ["isgo"] },
    { name: "Terea", keywords: ["terea"] },
    { name: "Heets", keywords: ["heets"] },
    { name: "Dr Vapes", keywords: ["dr vapes", "dr. vapes", "dr.vapes"] },
    { name: "Vozol", keywords: ["vozol"] },
    { name: "Oxva", keywords: ["oxva"] },
    { name: "Geekvape", keywords: ["geekvape", "geek vape"] },
    { name: "Voopoo", keywords: ["voopoo"] },
    { name: "Uwell", keywords: ["uwell"] },
    { name: "Smok", keywords: ["smok"] },
    { name: "Tokyo", keywords: ["tokyo"] },
    { name: "Ruthless", keywords: ["ruthless"] },
    { name: "Vapetasia", keywords: ["vapetasia"] },
    { name: "Grand Vapes", keywords: ["grand vapes", "grand e-liquids"] },
  ];

  for (const b of brands) {
    if (b.keywords.some(kw => titleLower.includes(kw))) {
      return b.name;
    }
  }

  if (vendor && vendor.toLowerCase() !== "vapshop" && vendor.toLowerCase() !== "vape shop") {
    return vendor;
  }

  const firstWord = title.trim().split(/\s+/)[0];
  if (firstWord && firstWord.length > 2) {
    const cleaned = firstWord.replace(/[^a-zA-Z0-9]/g, "");
    if (cleaned) return cleaned;
  }

  return "Vape Shop";
}

function cleanProductTitle(title: string): string {
  let cleaned = title;
  if (cleaned.startsWith("Buy ") || cleaned.startsWith("buy ")) {
    cleaned = cleaned.substring(4);
  }
  cleaned = cleaned.replace(/Get\s+(.+?)\s+Free/gi, "+ $1 Bundle");
  cleaned = cleaned.replace(/Get\s+(.+?)\s+FREE/gi, "+ $1 Bundle");
  cleaned = cleaned.replace(/\s+Free\s*/gi, " ");
  return cleaned.trim();
}

export async function getProductByHandle(handle: string) {

  try {
    let node: any = null;

    // Try Storefront API first
    if (STOREFRONT_TOKEN) {
      try {
        const url = `https://${SHOPIFY_STORE}/api/2024-10/graphql.json`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
          },
          body: JSON.stringify({
            query: storefrontQuery,
            variables: { handle },
          }),
          next: { revalidate: 60 },
        });

        if (response.ok) {
          const json = await response.json();
          node = json?.data?.productByHandle;
        }
      } catch (err) {
        console.warn("Storefront fetch failed for handle, trying admin API:", err);
      }
    }

    // Fallback to Admin API if node not fetched
    if (!node && ADMIN_API_TOKEN) {
      const url = `https://${SHOPIFY_STORE}/admin/api/2024-10/graphql.json`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": ADMIN_API_TOKEN,
        },
        body: JSON.stringify({
          query: adminQuery,
          variables: { handle },
        }),
        next: { revalidate: 60 },
      });

      if (response.ok) {
        const json = await response.json();
        node = json?.data?.productByHandle;
      }
    }

    if (!node) {
      return null;
    }

    let category = "vape";
    const tagsLower = (node.tags || []).map((t: string) => t.toLowerCase());
    if (tagsLower.includes("juul")) {
      category = "juul";
    } else if (tagsLower.includes("disposable") || tagsLower.includes("disposables")) {
      category = "disposables";
    } else if (tagsLower.includes("e-juice") || tagsLower.includes("liquid") || tagsLower.includes("liquids") || tagsLower.includes("e-liquids")) {
      category = "e-liquids";
    } else if (tagsLower.includes("accessory") || tagsLower.includes("accessories") || tagsLower.includes("pod-system") || tagsLower.includes("pod system")) {
      category = "accessories";
    } else {
      const typeLower = node.productType?.toLowerCase();
      if (typeLower?.includes("juul")) category = "juul";
      else if (typeLower?.includes("disposable")) category = "disposables";
      else if (typeLower?.includes("liquid") || typeLower?.includes("juice")) category = "e-liquids";
      else if (typeLower?.includes("accessory") || typeLower?.includes("pod")) category = "accessories";
    }

    const variants = node.variants?.edges?.map((edge: any) => edge.node) || [];
    const firstVariant = variants[0];
    
    const priceVal = typeof firstVariant?.price === 'object' ? firstVariant?.price?.amount : firstVariant?.price;
    const price = priceVal ? parseFloat(priceVal) : 0;

    const comparePriceVal = typeof firstVariant?.compareAtPrice === 'object' ? firstVariant?.compareAtPrice?.amount : firstVariant?.compareAtPrice;
    const comparePrice = comparePriceVal ? parseFloat(comparePriceVal) : 0;

    const isSoldOut = variants.length > 0 && variants.every((v: any) => !v.availableForSale);

    let section = undefined;
    if (node.tags?.includes("JUUL 2 Series") || node.tags?.includes("juul2")) {
      section = "JUUL 2 Series";
    } else if (node.tags?.includes("Disposables") || category === "disposables") {
      section = "Disposables";
    } else if (node.tags?.includes("E-Liquids") || category === "e-liquids") {
      section = "E-Liquids";
    } else if (node.tags?.includes("Pod Systems") || node.tags?.includes("Pod System")) {
      section = "Pod Systems";
    } else if (node.tags?.includes("Flash Sale") || node.tags?.includes("sale")) {
      section = "Flash Sale";
    }

    const images = node.images?.edges?.map((edge: any) => edge.node.url) || [];
    const image = images[0] || "";

    let specsTable: any = null;
    let parsedFlavorNotes: any[] | null = null;
    let parsedWhyChoose: any = null;
    let parsedFinalThoughts: any = null;
    let reviewsList = null;

    // ─── Run all supplemental Admin API calls in PARALLEL ─────────────────────
    const needsSpecs = !node.specsTable?.references?.edges?.length;
    const needsReviews = !node.productReviewsMeta?.references?.edges?.length;
    const needsFlavorNotes = !node.productFlavorNotesMeta?.references?.edges?.length;
    const needsWhyChoose = !node.whyChooseSectionMeta?.reference;
    const needsFinalThoughts = !node.finalThoughtsSectionMeta?.reference;

    if (ADMIN_API_TOKEN && (needsSpecs || needsReviews || needsFlavorNotes || needsWhyChoose || needsFinalThoughts)) {
      const adminUrl = `https://${SHOPIFY_STORE}/admin/api/2024-10/graphql.json`;
      const adminHeaders = {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ADMIN_API_TOKEN,
      };
      const fetchOpts = { next: { revalidate: 3600 } };

      const queries: Promise<void>[] = [];

      if (needsSpecs) {
        queries.push(
          fetch(adminUrl, {
            method: "POST",
            headers: adminHeaders,
            ...fetchOpts,
            body: JSON.stringify({
              query: `query GetSpecsMeta($handle: String!) {
                productByHandle(handle: $handle) {
                  specsTable: metafield(namespace: "custom", key: "specifications_table") {
                    references(first: 30) { edges { node { ... on Metaobject { fields { key value } } } } }
                  }
                }
              }`,
              variables: { handle },
            }),
          }).then(r => r.ok ? r.json() : null).then(json => {
            const meta = json?.data?.productByHandle?.specsTable;
            if (meta) node.specsTable = meta;
          }).catch(() => {})
        );
      }

      if (needsReviews) {
        queries.push(
          fetch(adminUrl, {
            method: "POST",
            headers: adminHeaders,
            ...fetchOpts,
            body: JSON.stringify({
              query: `query GetReviewsMeta($handle: String!) {
                productByHandle(handle: $handle) {
                  productReviewsMeta: metafield(namespace: "custom", key: "reviews") {
                    references(first: 30) { edges { node { ... on Metaobject { fields { key value } } } } }
                  }
                }
              }`,
              variables: { handle },
            }),
          }).then(r => r.ok ? r.json() : null).then(json => {
            const meta = json?.data?.productByHandle?.productReviewsMeta;
            if (meta) node.productReviewsMeta = meta;
          }).catch(() => {})
        );
      }

      if (needsFlavorNotes) {
        queries.push(
          fetch(adminUrl, {
            method: "POST",
            headers: adminHeaders,
            ...fetchOpts,
            body: JSON.stringify({
              query: `query GetFlavorNotesMeta($handle: String!) {
                productByHandle(handle: $handle) {
                  productFlavorNotesMeta: metafield(namespace: "custom", key: "flavor_notes") {
                    references(first: 50) { edges { node { ... on Metaobject { fields { key value } } } } }
                  }
                }
              }`,
              variables: { handle },
            }),
          }).then(r => r.ok ? r.json() : null).then(json => {
            const meta = json?.data?.productByHandle?.productFlavorNotesMeta;
            if (meta) node.productFlavorNotesMeta = meta;
          }).catch(() => {})
        );
      }

      if (needsWhyChoose) {
        queries.push(
          fetch(adminUrl, {
            method: "POST",
            headers: adminHeaders,
            ...fetchOpts,
            body: JSON.stringify({
              query: `query GetWhyChooseMeta($handle: String!) {
                productByHandle(handle: $handle) {
                  juulFeature1Meta: metafield(namespace: "custom", key: "juul_feature_1") {
                    reference { ... on Metaobject { fields { key value reference { ... on MediaImage { image { url } } ... on GenericFile { url } } } } }
                  }
                  juulFeature2Meta: metafield(namespace: "custom", key: "juul_feature_2") {
                    reference { ... on Metaobject { fields { key value reference { ... on MediaImage { image { url } } ... on GenericFile { url } } } } }
                  }
                  whyChooseSectionMeta: metafield(namespace: "custom", key: "why_choose") {
                    reference { ... on Metaobject { fields { key value references(first: 30) { edges { node { ... on Metaobject { fields { key value } } } } } } } }
                  }
                }
              }`,
              variables: { handle },
            }),
          }).then(r => r.ok ? r.json() : null).then(json => {
            const d = json?.data?.productByHandle;
            if (d?.juulFeature1Meta) node.juulFeature1Meta = d.juulFeature1Meta;
            if (d?.juulFeature2Meta) node.juulFeature2Meta = d.juulFeature2Meta;
            if (d?.whyChooseSectionMeta) node.whyChooseSectionMeta = d.whyChooseSectionMeta;
          }).catch(() => {})
        );
      }

      if (needsFinalThoughts) {
        queries.push(
          fetch(adminUrl, {
            method: "POST",
            headers: adminHeaders,
            ...fetchOpts,
            body: JSON.stringify({
              query: `query GetFinalThoughtsMeta($handle: String!) {
                productByHandle(handle: $handle) {
                  finalThoughtsSectionMeta: metafield(namespace: "custom", key: "final_thoughts") {
                    reference { ... on Metaobject { fields { key value } } }
                  }
                }
              }`,
              variables: { handle },
            }),
          }).then(r => r.ok ? r.json() : null).then(json => {
            const meta = json?.data?.productByHandle?.finalThoughtsSectionMeta;
            if (meta) node.finalThoughtsSectionMeta = meta;
          }).catch(() => {})
        );
      }

      // Fire all in parallel — reduces server wait time from ~2s → ~300ms
      await Promise.all(queries);
    }
    // ──────────────────────────────────────────────────────────────────────────

    // Parse specsTable
    if (node.specsTable?.references?.edges && node.specsTable.references.edges.length > 0) {
      specsTable = node.specsTable.references.edges.map((edge: any) => {
        const fields = edge.node.fields || [];
        const getVal = (k: string) => fields.find((f: any) => f.key === k)?.value || "";
        return {
          feature: getVal("feature") || getVal("name") || "",
          details: getVal("details") || getVal("value") || "",
        };
      });
    } else if (node.specsTable?.value) {
      try {
        specsTable = JSON.parse(node.specsTable.value);
      } catch (e) {
        specsTable = node.specsTable.value;
      }
    }

    // Parse faqAccordion
    let faqAccordion = null;
    if (node.faqs?.references?.edges && node.faqs.references.edges.length > 0) {
      faqAccordion = node.faqs.references.edges.map((edge: any) => {
        const fields = edge.node.fields || [];
        const questionField = fields.find((f: any) => f.key === "question");
        const answerField = fields.find((f: any) => f.key === "answer");
        return {
          category: "products",
          question: questionField?.value || "",
          answer: answerField?.value || "",
        };
      });
    } else if (node.faqAccordion?.value) {
      try {
        faqAccordion = JSON.parse(node.faqAccordion.value);
      } catch (e) {
        faqAccordion = null;
      }
    }

    // Parse reviewsList
    if (node.productReviewsMeta?.references?.edges && node.productReviewsMeta.references.edges.length > 0) {
      reviewsList = node.productReviewsMeta.references.edges.map((edge: any, idx: number) => {
        const fields = edge.node.fields || [];
        const getVal = (k: string) => fields.find((f: any) => f.key === k)?.value || "";
        const rawRating = getVal("rating_score") || getVal("rating");
        let parsedRating = rawRating ? parseFloat(rawRating) : 5;
        if (isNaN(parsedRating)) parsedRating = 5;
        if (parsedRating > 5) {
          if (parsedRating <= 50) {
            parsedRating = Number((parsedRating / 10).toFixed(1));
          } else {
            parsedRating = 5;
          }
        }
        if (parsedRating < 1) parsedRating = 1;

        return {
          id: `rev-metaobject-${idx}`,
          author: getVal("author") || getVal("name") || "Verified Customer",
          location: getVal("location") || "Dubai, UAE",
          rating: isNaN(parsedRating) ? 5 : parsedRating,
          date: getVal("date") || "Verified Purchase",
          verified: getVal("verified") !== "false",
          productName: getVal("product_name") || getVal("productName") || node.title,
          title: getVal("title") || getVal("headline") || "Authentic Product",
          comment: getVal("comment") || getVal("review") || getVal("body") || "",
          helpfulCount: parseInt(getVal("helpful_count") || getVal("helpfulCount") || "0") || 0,
        };
      });
    } else if (node.reviewsJson?.value || node.reviewsList?.value) {
      const rawReviewsStr = node.reviewsJson?.value || node.reviewsList?.value;
      try {
        const parsed = JSON.parse(rawReviewsStr);
        if (Array.isArray(parsed)) {
          reviewsList = parsed.map((r: any, idx: number) => ({
            id: r.id || `rev-json-${idx}`,
            author: r.author || r.name || "Verified Customer",
            location: r.location || "Dubai, UAE",
            rating: typeof r.rating === "number" ? r.rating : parseInt(r.rating || "5"),
            date: r.date || "Verified Purchase",
            verified: r.verified !== false,
            productName: r.productName || node.title,
            title: r.title || "Authentic Product",
            comment: r.comment || r.body || r.review || "",
            helpfulCount: r.helpfulCount || 0,
          }));
        }
      } catch (e) {
        reviewsList = null;
      }
    }

    // Parse parsedFlavorNotes
    if (node.productFlavorNotesMeta?.references?.edges && node.productFlavorNotesMeta.references.edges.length > 0) {
      parsedFlavorNotes = node.productFlavorNotesMeta.references.edges.map((edge: any) => {
        const fields = edge.node.fields || [];
        const getVal = (k: string) => fields.find((f: any) => f.key === k)?.value || "";
        return {
          flavor: getVal("flavor") || getVal("name") || "",
          description: getVal("description") || getVal("body") || "",
        };
      });
    }

    // Parse parsedWhyChoose
    if (node.whyChooseSectionMeta?.reference?.fields) {
      const secFields = node.whyChooseSectionMeta.reference.fields;
      const getSecVal = (k: string) => secFields.find((f: any) => f.key === k)?.value || "";
      const pointsRefField = secFields.find((f: any) => f.key === "points");

      let points: any[] = [];
      if (pointsRefField?.references?.edges) {
        points = pointsRefField.references.edges.map((edge: any) => {
          const fields = edge.node.fields || [];
          const getVal = (k: string) => fields.find((f: any) => f.key === k)?.value || "";
          return {
            title: getVal("title") || getVal("name") || "",
            description: getVal("description") || getVal("body") || "",
          };
        });
      }

      parsedWhyChoose = {
        heading: getSecVal("heading"),
        intro: getSecVal("intro"),
        points,
        footer: getSecVal("footer"),
      };
    }

    // Parse parsedFinalThoughts
    if (node.finalThoughtsSectionMeta?.reference?.fields) {
      const ftFields = node.finalThoughtsSectionMeta.reference.fields;
      const getFtVal = (k: string) => ftFields.find((f: any) => f.key === k)?.value || "";
      parsedFinalThoughts = {
        heading: getFtVal("heading"),
        body: getFtVal("body"),
      };
    }

    let parsedJuulFeature1: any = null;
    if (node.juulFeature1Meta?.reference?.fields) {
      const fields = node.juulFeature1Meta.reference.fields;
      const getVal = (k: string) => fields.find((f: any) => f.key === k)?.value || "";
      const imgField = fields.find((f: any) => f.key === "image");
      const imgUrl = imgField?.reference?.image?.url || imgField?.reference?.url || getVal("image_url") || getVal("image") || "";
      
      const bpField = fields.find((f: any) => f.key === "bullet_points");
      let bulletPoints: any[] = [];
      if (bpField?.value) {
        try {
          const raw = bpField.value.trim();
          const arr = raw.startsWith("[") ? JSON.parse(raw) : raw.split("\n");
          if (Array.isArray(arr)) {
            bulletPoints = arr.map((item: any) => typeof item === "string" ? { text: item.trim() } : item).filter((b: any) => b?.text);
          }
        } catch(e) {
          bulletPoints = String(bpField.value).split("\n").map(text => ({ text: text.trim() })).filter(b => b.text);
        }
      }

      parsedJuulFeature1 = {
        title: getVal("title"),
        description: getVal("description_rich") || getVal("description"),
        buttonText: getVal("button_text") || getVal("buttonText"),
        buttonLink: getVal("button_link") || getVal("buttonLink"),
        image: imgUrl,
        bulletPoints
      };
    }

    let parsedJuulFeature2: any = null;
    if (node.juulFeature2Meta?.reference?.fields) {
      const fields = node.juulFeature2Meta.reference.fields;
      const getVal = (k: string) => fields.find((f: any) => f.key === k)?.value || "";
      const imgField = fields.find((f: any) => f.key === "image");
      const imgUrl = imgField?.reference?.image?.url || imgField?.reference?.url || getVal("image_url") || getVal("image") || "";
      
      const bpField = fields.find((f: any) => f.key === "bullet_points");
      let bulletPoints: any[] = [];
      if (bpField?.value) {
        try {
          const raw = bpField.value.trim();
          const arr = raw.startsWith("[") ? JSON.parse(raw) : raw.split("\n");
          if (Array.isArray(arr)) {
            bulletPoints = arr.map((item: any) => typeof item === "string" ? { text: item.trim() } : item).filter((b: any) => b?.text);
          }
        } catch(e) {
          bulletPoints = String(bpField.value).split("\n").map(text => ({ text: text.trim() })).filter(b => b.text);
        }
      }

      parsedJuulFeature2 = {
        title: getVal("title"),
        description: getVal("description_rich") || getVal("description"),
        buttonText: getVal("button_text") || getVal("buttonText"),
        buttonLink: getVal("button_link") || getVal("buttonLink"),
        image: imgUrl,
        bulletPoints
      };
    }

    const cleanDesc = (node.descriptionHtml || "").replace(/<[^>]*>?/gm, "").trim();
    const seoTitle = node.seo?.title || node.title;
    const seoDescription = node.seo?.description || cleanDesc.slice(0, 160);

    let videoUrl: string | undefined = undefined;
    if (node.youtubeVideoMeta?.value) {
      videoUrl = String(node.youtubeVideoMeta.value).trim();
    } else if (node.videoMeta?.value) {
      videoUrl = String(node.videoMeta.value).trim();
    } else if (node.productVideoMeta?.value) {
      videoUrl = String(node.productVideoMeta.value).trim();
    } else if (node.productVideoUrlMeta?.value) {
      videoUrl = String(node.productVideoUrlMeta.value).trim();
    } else if (node.videoKeyMeta?.value) {
      videoUrl = String(node.videoKeyMeta.value).trim();
    } else if (node.youtubeMeta?.value) {
      videoUrl = String(node.youtubeMeta.value).trim();
    }

    if (!videoUrl && node.allMetafields?.edges) {
      for (const edge of node.allMetafields.edges) {
        const key = edge?.node?.key?.toLowerCase() || "";
        const val = edge?.node?.value ? String(edge.node.value).trim() : "";
        if (key.includes("video") || key.includes("youtube") || key.includes("vimeo")) {
          if (val) {
            videoUrl = val;
            break;
          }
        }
        if (/https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com|[^\s"'<>]+\.mp4)/i.test(val)) {
          videoUrl = val;
          break;
        }
      }
    } else if (node.media?.edges && Array.isArray(node.media.edges)) {
      const mediaEdges = node.media.edges;
      const externalVideo = mediaEdges.find((e: any) => e?.node?.mediaContentType === "EXTERNAL_VIDEO")?.node;
      if (externalVideo?.embedUrl) {
        videoUrl = externalVideo.embedUrl;
      } else {
        const videoNode = mediaEdges.find((e: any) => e?.node?.mediaContentType === "VIDEO")?.node;
        if (videoNode?.sources?.length) {
          videoUrl = videoNode.sources[0]?.url;
        }
      }
    }

    // Fallback: extract embedded YouTube or MP4 link from product description HTML if present
    if (!videoUrl && node.descriptionHtml) {
      const ytMatch = node.descriptionHtml.match(/https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-]+/i);
      if (ytMatch) {
        videoUrl = ytMatch[0];
      } else {
        const mp4Match = node.descriptionHtml.match(/https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*/i);
        if (mp4Match) {
          videoUrl = mp4Match[0];
        }
      }
    }

    return {
      id: node.id,
      name: node.title,
      seoTitle,
      seoDescription,
      handle: node.handle,
      descriptionHtml: node.descriptionHtml,
      category,
      price,
      originalPrice: comparePrice > price ? comparePrice : undefined,
      rating: node.rating?.value ? parseFloat(node.rating.value) : (node.ratingValue?.value ? parseFloat(node.ratingValue.value) : (reviewsList && reviewsList.length > 0 ? 4.9 : undefined)),
      reviews: node.reviews?.value ? parseInt(node.reviews.value) : (node.reviewsCount?.value ? parseInt(node.reviewsCount.value) : (reviewsList ? reviewsList.length : undefined)),
      reviewsList,
      flavorNotes: parsedFlavorNotes,
      whyChoose: parsedWhyChoose,
      finalThoughts: parsedFinalThoughts,
      juulFeature1: parsedJuulFeature1,
      juulFeature2: parsedJuulFeature2,
      image,
      images,
      videoUrl,
      tag: node.badge?.value || (isSoldOut ? "Sold Out" : comparePrice > price ? "Sale" : undefined),
      tagColor: comparePrice > price ? "sale" : undefined,
      isPopular: node.tags?.includes("Popular") || node.tags?.includes("popular"),
      isSoldOut,
      puffs: node.puffs?.value || undefined,
      nicotine: node.nicotine?.value || undefined,
      battery: node.battery?.value || undefined,
      shortDescription: node.shortDescription?.value || undefined,
      specsTable,
      faqAccordion,
      options: node.options?.map((o: any) => ({ name: o.name, values: o.values })) || [],
      variants: variants.map((v: any) => {
        const vPrice = typeof v.price === 'object' ? v.price?.amount : v.price;
        const vCompare = typeof v.compareAtPrice === 'object' ? v.compareAtPrice?.amount : v.compareAtPrice;
        return {
          id: v.id,
          title: v.title,
          price: vPrice ? parseFloat(vPrice) : 0,
          compareAtPrice: vCompare ? parseFloat(vCompare) : undefined,
          availableForSale: v.availableForSale,
          inventoryQuantity: v.inventoryQuantity ?? 10,
        };
      }),
      section,
      brand: detectBrand(node.title, node.vendor),
      primaryCollection: (() => {
        const collectionsList = (node.collections?.edges || []).map((e: any) => e.node).filter(Boolean);
        const specificCollection = collectionsList.find((c: any) =>
          c.handle && c.handle !== "all" && c.handle !== "brand" && c.handle !== "best-seller-vape" && c.handle !== "uncategorized"
        ) || collectionsList[0] || null;

        const CATEGORY_COLLECTION_MAP: Record<string, { handle: string; title: string }> = {
          juul: { handle: "juul-vape-dubai", title: "JUUL" },
          disposables: { handle: "disposable-vape", title: "Disposable Vapes" },
          myle: { handle: "myle-vape-dubai", title: "MYLE" },
          "e-liquids": { handle: "vape-e-juice", title: "E-Liquids" },
          accessories: { handle: "pod-system", title: "Pod Systems" },
          vape: { handle: "best-seller-vape", title: "Vape Shop" },
        };

        if (specificCollection) {
          return {
            handle: specificCollection.handle,
            title: specificCollection.title || specificCollection.handle,
          };
        }
        return CATEGORY_COLLECTION_MAP[category] || { handle: "shop", title: "Products" };
      })(),
    };
  } catch (error: any) {
    console.error("Error in GET product by handle:", error);
    return null;
  }
}
