import EditArticle from "./edit";
import PreviewArticle from "./preview";
import { createClient } from "@/utils/supabase/server";

export default async function Page({ params }: { params: { slug: string[] } }) { 
  const [articleSlug, mode] = params.slug;  
  const supabase = createClient();
  const { data: article, error} = await supabase
    .from("articles")
    .select("*, author(full_name, username, avatar_url)")
    .eq("slug", articleSlug)
    .single();
  if (error) {
    console.error(error);
  } 
  if (mode === "edit") {
    return <EditArticle article={article} />;
  }
  if (mode === "preview") {
    return <PreviewArticle article={article} />;
  }
}
