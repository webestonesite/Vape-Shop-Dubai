import { getProductByHandle } from "@/lib/shopify/product";
import ClientProductPage from "./ClientProductPage";

export const revalidate = 3600; // Cache pages for 1 hour

export async function generateStaticParams() {
  // Empty array means pages will be generated on-demand and then cached (ISR)
  return [];
}

export default async function ProductPage(props: { params: Promise<{ handle: string }> }) {
  const params = await props.params;
  const product = await getProductByHandle(params.handle);
  
  return <ClientProductPage initialProduct={product} />;
}
