import { redirect } from "next/navigation";

export default async function BlogSlugLegacyRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/blogs/news/${slug}`);
}
