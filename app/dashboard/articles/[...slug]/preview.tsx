import { createClient } from "@/utils/supabase/server";
// Next
import NextLink from "next/link";
import Avatar from "@/components/avatar/avatar";
import Image from "next/image";

// TipTap
import StarterKit from "@tiptap/starter-kit";

import { generateHTML } from "@tiptap/html";
import { JSONContent } from "@tiptap/react";
import { Database } from "app/types/supabase";
import Link from "next/link";

type ArticleSchema = Database["public"]["Tables"]["articles"]["Row"] & {
  html: string;
  beforeArticle: Database["public"]["Tables"]["articles"]["Row"];
  afterArticle: Database["public"]["Tables"]["articles"]["Row"];
};
function getArticleContent(data: JSONContent) {
  const html: string = generateHTML(data, [StarterKit]);
  return html;
}
 
export default async function Notes({
  article,
}: {
  article: Database["public"]["Tables"]["articles"]["Row"];
}) { 
  const html = getArticleContent(article.articleBody); 
  return (
    <article className="articleContent">
      <Link href={`/dashboard/articles/${article.slug}/edit`}>Edit</Link>
      <Image
        src={article.image}
        alt={article.headline}
        width={500}
        height={300}
      />
      <h1>{article.headline}</h1>

      <div className="meta">
        <div className="byline">
          <NextLink href={`/about`}>
            <Avatar
              size="large"
              name={article.author.full_name}
              src={article.author.avatar_url}
            />
            {article.author.full_name}
          </NextLink>
        </div>
        <time dateTime={article.published_at}>
          {new Date(article.published_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      </div>
      <div
        className="articleContent"
        dangerouslySetInnerHTML={{ __html: html }}
      /> 
    </article>
  )
}