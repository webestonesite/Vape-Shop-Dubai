import { redirect } from "next/navigation";

import { CollectionCustomizer } from "@/components/admin/CollectionCustomizer";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";

export const dynamic = "force-dynamic";

export default async function AdminCollectionPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const user = await findUserById(session.sub);
  if (!user) redirect("/admin/login");

  const { handle } = await params;

  // The layout itself is fetched client-side: the preview iframe starts loading
  // in parallel rather than waiting on a round trip to Shopify.
  return <CollectionCustomizer user={user} handle={decodeURIComponent(handle)} />;
}
