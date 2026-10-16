import { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { ShieldCheck, Lock, Eye, Server, FileText } from "lucide-react";

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
  const page = (await getShopifyPage("privacy-policy")) || (await getShopifyPage("privacy"));
  if (page) {
    return {
      title: page.seo?.title || `${page.title} | Vape Shop Dubai`,
      description: page.seo?.description || page.bodySummary || "Read Vape Shop Dubai Privacy Policy.",
      alternates: {
        canonical: "/privacy-policy",
      },
    };
  }
  return {
    title: "Privacy Policy | Vape Shop Dubai",
    description: "Read Vape Shop Dubai's Privacy Policy. Learn how we handle, protect, and process your personal information securely in the UAE.",
    alternates: {
      canonical: "/privacy-policy",
    },
  };
}

export default async function PrivacyPolicyPage() {
  const page = (await getShopifyPage("privacy-policy")) || (await getShopifyPage("privacy"));

  return (
    <PageShell breadcrumbTitle={page?.title || "Privacy Policy"}>
      {/* Header */}
      <div className="relative py-16 sm:py-24 bg-card border-b border-border/50 overflow-hidden">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 relative z-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif text-foreground leading-tight tracking-tight mb-4">
            {page?.title || "Privacy Policy"}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
            Your privacy is paramount. Learn how Vape Shop Dubai protects and respects your data.
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
                <Eye className="w-5 h-5 text-primary" />
                <h2>1. Information We Collect</h2>
              </div>
              <p>
                We collect only the essential information needed to fulfill your orders and provide express vape delivery in the UAE:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base">
                <li>Contact details (Name, Phone Number, Email Address)</li>
                <li>Delivery details (Emirate, City, Shipping Address)</li>
                <li>Order history and transaction details</li>
              </ul>
            </section>

            <section className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 text-foreground font-serif text-xl font-bold border-b border-border/60 pb-3">
                <Lock className="w-5 h-5 text-primary" />
                <h2>2. How We Use Your Data</h2>
              </div>
              <p>
                Your information is used strictly for processing your purchases, updating order status, and delivering products directly to your doorstep. We never sell, rent, or trade your personal data with third-party advertisers.
              </p>
            </section>

            <section className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 text-foreground font-serif text-xl font-bold border-b border-border/60 pb-3">
                <Server className="w-5 h-5 text-primary" />
                <h2>3. Delivery &amp; Courier Disclosure</h2>
              </div>
              <p>
                To fulfill your order, necessary shipping details (name, phone number, and address) are securely shared with our trusted delivery couriers across Dubai, Sharjah, Abu Dhabi, and the wider UAE.
              </p>
            </section>

            <section className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 text-foreground font-serif text-xl font-bold border-b border-border/60 pb-3">
                <FileText className="w-5 h-5 text-primary" />
                <h2>4. Your Rights</h2>
              </div>
              <p>
                You have the right to request a copy of your stored personal details or ask for your account data to be erased at any time. Simply contact our support team via email at <a href="mailto:vapshopdubai@gmail.com" className="text-primary underline">vapshopdubai@gmail.com</a>.
              </p>
            </section>
          </>
        )}
      </div>
    </PageShell>
  );
}
