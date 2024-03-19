import EditArticle from "./edit";
import PreviewArticle from "./preview";
import { createClient } from "@/utils/supabase/server";

export default async function Page({ params }: { params: { slug: string[] } }) {
  const [articleSlug, mode] = params.slug;
  const supabase = createClient();
  const { data: article, error } = await supabase
    .from("articles")
    .select("*, author(*)")
    .eq("slug", articleSlug)
    .single();
  if (error || !article) {
    return <div>Article not found</div>;
  }
  if (mode === "edit") {
    return <EditArticle article={article} />;
  }
  if (mode === "preview") {
    return <PreviewArticle article={article} />;
  }
  return <div>Article not found</div>;
}
