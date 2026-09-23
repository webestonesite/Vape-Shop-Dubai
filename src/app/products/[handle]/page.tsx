import { getProductByHandle } from "@/lib/shopify/product";
import ClientProductPage from "./ClientProductPage";

export const revalidate = 3600; // Cache the full route HTML for 1 hour

export default async function ProductPage(props: { params: Promise<{ handle: string }> }) {
  const params = await props.params;
  const product = await getProductByHandle(params.handle);
  
  return <ClientProductPage initialProduct={product} />;
}
