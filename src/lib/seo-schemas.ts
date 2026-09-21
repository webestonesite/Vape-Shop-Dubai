/**
 * Google-compliant JSON-LD Schema Generators for Vape Shop Dubai
 * Strictly adheres to Schema.org and Google Search Central Guidelines.
 */

export const FALLBACK_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vapeshopdubai.webestone.net";
export const STORE_NAME = "Vape Shop Dubai";

// 1. Organization Schema
export function getOrganizationSchema(siteUrl: string = FALLBACK_SITE_URL) {
  const storeLogo = `${siteUrl}/logo.png`;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    "name": STORE_NAME,
    "url": siteUrl,
    "logo": {
      "@type": "ImageObject",
      "url": storeLogo,
      "caption": STORE_NAME,
    },
    "image": storeLogo,
    "description": "Premium luxury vape store in Dubai offering authentic devices, pod kits, disposables, and e-liquids with 2-hour express delivery.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Dubai",
      "addressCountry": "AE",
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+971582839787",
      "contactType": "customer service",
      "areaServed": ["AE", "Dubai", "Abu Dhabi", "Sharjah"],
      "availableLanguage": ["English", "Arabic"],
    },
    "sameAs": [
      "https://www.facebook.com/vapshopdubai",
      "https://www.instagram.com/vapshopdubai",
    ],
  };
}

// 2. WebSite Schema (Sitelinks Searchbox)
export function getWebSiteSchema(siteUrl: string = FALLBACK_SITE_URL) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    "url": siteUrl,
    "name": STORE_NAME,
    "description": "Buy authentic vape devices, JUUL, Myle, and disposable vapes in Dubai with 2-hour delivery.",
    "publisher": {
      "@id": `${siteUrl}/#organization`,
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/shop?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// 3. LocalBusiness / Store Schema
export function getLocalBusinessSchema(siteUrl: string = FALLBACK_SITE_URL) {
  const storeLogo = `${siteUrl}/logo.png`;
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${siteUrl}/#store`,
    "name": STORE_NAME,
    "image": storeLogo,
    "url": siteUrl,
    "telephone": "+971582839787",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Downtown & Marina Area",
      "addressLocality": "Dubai",
      "addressRegion": "Dubai",
      "addressCountry": "AE",
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 25.2048,
      "longitude": 55.2708,
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        "opens": "09:00",
        "closes": "23:59",
      },
    ],
    "currenciesAccepted": "AED",
    "paymentAccepted": "Cash, Credit Card, COD",
  };
}

// 4. Product & Offer & AggregateRating Schema
export function getProductSchema(product: {
  id: string;
  name: string;
  handle: string;
  descriptionHtml?: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  image: string;
  images?: string[];
  brand?: string;
  category?: string;
  isSoldOut?: boolean;
}, siteUrl: string = FALLBACK_SITE_URL) {
  const productUrl = `${siteUrl}/products/${product.handle}`;
  const cleanDescription = product.descriptionHtml
    ? product.descriptionHtml.replace(/<[^>]*>?/gm, "").slice(0, 300).trim()
    : `Buy ${product.name} in Dubai, UAE. Premium authentic ${product.brand || product.category || "vape"} product with fast express delivery.`;

  const imageList = product.images && product.images.length > 0 ? product.images : [product.image];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    "url": productUrl,
    "name": product.name,
    "image": imageList,
    "description": cleanDescription,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Vape Shop Dubai",
    },
    "offers": {
      "@type": "Offer",
      "url": productUrl,
      "priceCurrency": "AED",
      "price": product.price.toFixed(2),
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.isSoldOut
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": STORE_NAME,
      },
    },
    ...(product.rating && product.reviews ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.rating.toString(),
        "reviewCount": product.reviews.toString(),
        "bestRating": "5",
        "worstRating": "1",
      }
    } : {}),
  };
}

// 5. BreadcrumbList Schema
export function getBreadcrumbSchema(items: { name: string; item?: string }[], siteUrl: string = FALLBACK_SITE_URL) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((crumb, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": crumb.name,
      ...(crumb.item ? { "item": crumb.item.startsWith("http") ? crumb.item : `${siteUrl}${crumb.item}` } : {}),
    })),
  };
}

// 6. FAQPage Schema
export function getFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };
}

// 7. ItemList Schema (Category / Collections)
export function getItemListSchema(title: string, products: { name: string; handle: string; price: number; image: string }[], siteUrl: string = FALLBACK_SITE_URL) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": title,
    "numberOfItems": products.length,
    "itemListElement": products.map((p, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "url": `${siteUrl}/products/${p.handle}`,
      "name": p.name,
      "image": p.image,
    })),
  };
}
