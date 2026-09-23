import { getProductByHandle } from "@/lib/shopify/product";
import ClientProductPage from "./ClientProductPage";


export default async function ProductPage(props: { params: Promise<{ handle: string }> }) {
  const params = await props.params;
  const product = await getProductByHandle(params.handle);
  
  return <ClientProductPage initialProduct={product} />;
}
