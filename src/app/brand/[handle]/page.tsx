import CollectionPage, { generateMetadata as generateCollectionMetadata } from "../../collections/[handle]/page";

export async function generateMetadata(props: { params: Promise<{ handle: string }> }) {
  const meta = await generateCollectionMetadata(props);
  const { handle } = await props.params;
  return {
    ...meta,
    alternates: {
      canonical: `/collections/${handle}`,
    },
  };
}

export default function BrandHandlePage(props: { params: Promise<{ handle: string }> }) {
  return <CollectionPage params={props.params} />;
}
