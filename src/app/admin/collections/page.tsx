import { redirect } from "next/navigation";

import { CollectionsIndex } from "@/components/admin/CollectionsIndex";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";

// The list reflects what's in Shopify right now, never a cached copy.
export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const user = await findUserById(session.sub);
  if (!user) redirect("/admin/login");

  return <CollectionsIndex user={user} />;
}
