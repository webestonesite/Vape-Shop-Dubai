import Link from "next/link";
import { Metadata } from "next";
import { getRequestSiteUrl } from "@/lib/site-url";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "HTML Sitemap | Vape Shop Dubai",
  description: "Navigate all pages, collections, products, and expert guides of Vape Shop Dubai easily with our comprehensive HTML Sitemap.",
  alternates: {
    canonical: "/sitemap",
  },
};

const getProducts = async (siteUrl: string) => {
  try {
    const res = await fetch(`${siteUrl}/api/products`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
};

const getArticles = async (siteUrl: string) => {
  try {
    const res = await fetch(`${siteUrl}/api/articles`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.articles && Array.isArray(data.articles) ? data.articles : [];
  } catch (e) {
    return [];
  }
};

export default async function HTMLSitemap() {
  const headersList = await headers();
  const host = headersList.get('x-forwarded-host') || headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') || 'https';
  const siteUrl = getRequestSiteUrl(host, protocol);

  const [products, articles] = await Promise.all([getProducts(siteUrl), getArticles(siteUrl)]);

  const mainPages = [
    { title: "Home", path: "/" },
    { title: "Shop All", path: "/shop" },
    { title: "About Us", path: "/about-us" },
    { title: "Contact Us", path: "/contact" },
    { title: "Shipping & Delivery", path: "/shipping-delivery" },
    { title: "Terms & Conditions", path: "/terms-conditions" },
    { title: "Privacy Policy", path: "/privacy-policy" },
  ];

  const collections = [
    { title: "All Collections", path: "/collections/all" },
    { title: "Disposable Vapes", path: "/collections/disposable-vape" },
    { title: "JUUL Devices & Pods", path: "/collections/juul-vape-dubai" },
    { title: "MYLE Devices & Pods", path: "/collections/myle-vape-dubai" },
    { title: "E-Juice / E-Liquid", path: "/collections/vape-e-juice" },
    { title: "Pod Systems", path: "/collections/pod-system" },
    { title: "Shop By Brand", path: "/collections/brand" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 py-16 pt-32">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-bebas text-gray-900 tracking-wider mb-4">HTML Sitemap</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Navigate through all pages, products, categories, and articles on Vape Shop Dubai.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Main Pages */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold font-bebas text-primary tracking-wide mb-6 border-b pb-4">Main Pages</h2>
            <ul className="space-y-3">
              {mainPages.map((page) => (
                <li key={page.path}>
                  <Link href={page.path} className="text-gray-700 hover:text-primary transition-colors font-medium">
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Collections */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold font-bebas text-primary tracking-wide mb-6 border-b pb-4">Collections & Categories</h2>
            <ul className="space-y-3">
              {collections.map((col) => (
                <li key={col.path}>
                  <Link href={col.path} className="text-gray-700 hover:text-primary transition-colors font-medium">
                    {col.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold font-bebas text-primary tracking-wide mb-6 border-b pb-4">All Products ({products.length})</h2>
            <ul className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {products.map((product: any) => (
                <li key={product.handle}>
                  <Link href={`/products/${product.handle}`} className="text-gray-700 hover:text-primary transition-colors text-sm">
                    {product.title}
                  </Link>
                </li>
              ))}
              {products.length === 0 && <li className="text-gray-500 italic">No products found.</li>}
            </ul>
          </div>

          {/* Blogs */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <h2 className="text-2xl font-bold font-bebas text-primary tracking-wide">Expert Guides & News</h2>
              <Link href="/blogs/news" className="text-sm font-semibold text-primary hover:underline">
                View Blog Home
              </Link>
            </div>
            <ul className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {articles.map((article: any) => (
                <li key={article.handle}>
                  <Link href={`/blogs/news/${article.handle}`} className="text-gray-700 hover:text-primary transition-colors text-sm">
                    {article.title}
                  </Link>
                </li>
              ))}
              {articles.length === 0 && <li className="text-gray-500 italic">No articles found.</li>}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
