import { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Scale, ShieldAlert, CheckCircle2, UserCheck, FileText } from "lucide-react";

const SHOPIFY_STORE = process.env.SHOPIFY_STORE || "vap-shop-dubai.myshopify.com";
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "";

async function getShopifyPage(handle: string) {
  if (!STOREFRONT_TOKEN) return null;
  const query = `
    query getPage($handle: String!) {
      page(handle: $handle) {
        id
        title
        handle
        body
        bodySummary
        seo {
          title
          description
        }
      }
    }
  `;
  try {
    const res = await fetch(`https://${SHOPIFY_STORE}/api/2024-10/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables: { handle } }),
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const json = await res.json();
      return json.data?.page || null;
    }
  } catch {
    // fallback
  }
  return null;
}

export async function generateMetadata(): Promise<Metadata> {
  const page =
    (await getShopifyPage("terms-conditions")) ||
    (await getShopifyPage("terms-and-conditions")) ||
    (await getShopifyPage("terms"));
  if (page) {
    return {
      title: page.seo?.title || `${page.title} | Vape Shop Dubai`,
      description: page.seo?.description || page.bodySummary || "Read Vape Shop Dubai Terms & Conditions.",
      alternates: {
        canonical: "/terms-conditions",
      },
    };
  }
  return {
    title: "Terms & Conditions | Vape Shop Dubai",
    description: "Read Vape Shop Dubai's Terms & Conditions. Store guidelines, legal age requirement (18+), order policies, and customer terms in the UAE.",
    alternates: {
      canonical: "/terms-conditions",
    },
  };
}

export default async function TermsConditionsPage() {
  const page =
    (await getShopifyPage("terms-conditions")) ||
    (await getShopifyPage("terms-and-conditions")) ||
    (await getShopifyPage("terms"));

  return (
    <PageShell breadcrumbTitle={page?.title || "Terms & Conditions"}>
      {/* Header */}
      <div className="relative py-16 sm:py-24 bg-card border-b border-border/50 overflow-hidden">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 relative z-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <Scale className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif text-foreground leading-tight tracking-tight mb-4">
            {page?.title || "Terms & Conditions"}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
            Please read our terms of service before placing an order with Vape Shop Dubai.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-8 text-base leading-relaxed text-muted-foreground">
        {page?.body ? (
          <div
            className="
              [&>h1]:text-3xl [&>h1]:font-serif [&>h1]:text-foreground [&>h1]:mb-6 [&>h1]:mt-10
              [&>h2]:text-2xl [&>h2]:font-serif [&>h2]:text-foreground [&>h2]:mb-4 [&>h2]:mt-8
              [&>h3]:text-xl [&>h3]:font-serif [&>h3]:text-foreground [&>h3]:mb-3 [&>h3]:mt-6
              [&>p]:mb-6
              [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul>li]:mb-2
              [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>ol>li]:mb-2
              [&>a]:text-primary [&>a]:underline [&>a:hover]:text-primary/80
              [&>strong]:text-foreground [&>b]:text-foreground
            "
            dangerouslySetInnerHTML={{ __html: page.body }}
          />
        ) : (
          <>
            <section className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 text-foreground font-serif text-xl font-bold border-b border-border/60 pb-3">
                <UserCheck className="w-5 h-5 text-primary" />
                <h2>1. Legal Age Requirement (18+)</h2>
              </div>
              <p>
                By placing an order on Vape Shop Dubai, you explicitly verify that you are at least 18 years of age (or legal vaping age in your jurisdiction). Proof of age (Emirates ID or Passport) may be requested upon delivery.
              </p>
            </section>

            <section className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 text-foreground font-serif text-xl font-bold border-b border-border/60 pb-3">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <h2>2. Authenticity Guarantee</h2>
              </div>
              <p>
                All products sold on our site — including JUUL, Myle, disposables, pod systems, and e-liquids — are 100% authentic and sourced directly from authorized regional distributors.
              </p>
            </section>

            <section className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 text-foreground font-serif text-xl font-bold border-b border-border/60 pb-3">
                <ShieldAlert className="w-5 h-5 text-primary" />
                <h2>3. Pricing &amp; Order Acceptance</h2>
              </div>
              <p>
                All prices are listed in United Arab Emirates Dirhams (AED). We reserve the right to cancel or refuse any order in the event of price errors or stock unavailability.
              </p>
            </section>

            <section className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 text-foreground font-serif text-xl font-bold border-b border-border/60 pb-3">
                <FileText className="w-5 h-5 text-primary" />
                <h2>4. Returns &amp; Warranty</h2>
              </div>
              <p>
                Defective devices carry a 24-hour manufacturing warranty from the time of delivery. Unopened items may be returned within 48 hours. Pods and opened e-liquids are non-refundable. Please review our <a href="/pages/refund-returns" className="text-primary underline font-bold">Returns Policy</a> for full details.
              </p>
            </section>
          </>
        )}
      </div>
    </PageShell>
  );
}
