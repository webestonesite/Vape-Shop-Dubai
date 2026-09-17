import { redirect } from "next/navigation";

export default function BlogLegacyRedirectPage() {
  redirect("/blogs/news");
}
