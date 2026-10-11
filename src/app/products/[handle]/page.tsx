import { getProductByHandle } from "@/lib/shopify/product";
import { getThemeSettings } from "@/lib/theme/get-settings";
import { resolveTemplateKey } from "@/lib/theme/types";
import { PageTemplatesProvider } from "@/context/PageTemplatesContext";
import ClientProductPage from "./ClientProductPage";

export const revalidate = 60; // Revalidate every 60 seconds for inventory accuracy

export default async function ProductPage(props: { params: Promise<{ handle: string }> }) {
  const params = await props.params;
  const [product, themeSettings] = await Promise.all([
    getProductByHandle(params.handle),
    getThemeSettings().catch(() => null),
  ]);

  const scopedTemplates: Record<string, any> = {};
  if (themeSettings?.templates) {
    const templateKey = resolveTemplateKey(themeSettings.templates, "product", params.handle);
    const activeTemplate = themeSettings.templates[templateKey] || themeSettings.templates["product"];
    if (activeTemplate) {
      scopedTemplates[templateKey] = activeTemplate;
      scopedTemplates["product"] = activeTemplate;
    }
  }

  return (
    <PageTemplatesProvider templates={scopedTemplates}>
      <ClientProductPage initialProduct={product} />
    </PageTemplatesProvider>
  );
}

