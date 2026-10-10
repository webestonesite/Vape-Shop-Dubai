import CollectionPage from "../../collections/[handle]/page";

export default function BrandHandlePage(props: { params: Promise<{ handle: string }> }) {
  return <CollectionPage params={props.params} />;
}
