import CollectionPage from "./[handle]/page";

export default function CollectionsRootPage() {
  return <CollectionPage params={Promise.resolve({ handle: "all" })} />;
}
