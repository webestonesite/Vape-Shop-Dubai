import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";
import { RedirectsManager } from "@/components/admin/RedirectsManager";
import { getRedirects } from "@/lib/redirects/store";


export const dynamic = "force-dynamic";

export default async function AdminRedirectsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const user = await findUserById(session.sub);
  if (!user || user.role !== "admin") redirect("/admin/login");

  const initialRedirects = await getRedirects();

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-slate-900">URL Redirects</h1>
      <RedirectsManager initialRedirects={initialRedirects} />
    </div>
  );
}
