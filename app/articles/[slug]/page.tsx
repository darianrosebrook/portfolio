import { createClient } from "@/utils/supabase/server";
// Next
import NextLink from "next/link";
import Avatar from "@/components/avatar/avatar";
import Image from "next/image"; 

// TipTap
import StarterKit from '@tiptap/starter-kit'; 

import { generateHTML } from "@tiptap/html";
import { JSONContent } from "@tiptap/react";
import { Database } from "app/types/supabase";

type ArticleSchema = Database["public"]["Tables"]["articles"]["Row"] & {
  html: string;
  beforeArticle: Database["public"]["Tables"]["articles"]["Row"];
  afterArticle: Database["public"]["Tables"]["articles"]["Row"];
};
function getArticleContent(data: JSONContent) {
  const html: string = generateHTML(data, [
    StarterKit,
   
  ]);
  return html;
}

function Card(data: {
  image: string;
  headline: string;
  description: string;
  slug: string;
  author: any;
  published_at: string;
}) {
  return (
    <article className="card">
      <NextLink href={`/articles/${data.slug}`}>
        <Image src={data.image} alt={data.headline} width={300} height={200} />
        <h2>{data.headline}</h2>
      </NextLink>
      <div className="meta">
        <div className="byline">
          <NextLink href={`/about`}>
            <Avatar
              size="large"
              name={data.author.full_name}
              src={data.author.avatar_url}
            />
            {data.author.full_name}
          </NextLink>
        </div>
        <time dateTime={data.published_at}>
          {new Date(data.published_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      </div>
      <p>{data.description}</p>
    </article>
  );
}
async function getData(slug) {
  const supabase = createClient();
  const { data: article } = await supabase
    .from("articles")
    .select("*, author(full_name, username, avatar_url)")
    .eq("slug", slug)
    .single();
  const { published_at } = article;
  const { data: beforeArticle, error } = await supabase
    .from("articles")
    .select(
      "author(full_name, username, avatar_url), slug, published_at, headline, image, description"
    )
    //  the article is published and the published date is less than the current date, limit to 1
    .eq("draft", false)
    .lt("published_at", published_at)
    .order("published_at", { ascending: false })
    .limit(1)
    .single();
  const { data: afterArticle, error: afterError } = await supabase
    .from("articles")
    .select(
      "author(full_name, username, avatar_url), slug, published_at, headline, image, description"
    )
    //  the article is published and the published date is greater than the current date, limit to 1
    .eq("draft", false)
    .gt("published_at", published_at)
    .order("published_at", { ascending: true })
    .limit(1)
    .single();
  const html = getArticleContent(article.articleBody);
  return { ...article, html, beforeArticle, afterArticle } as ArticleSchema;
}
export default async function Notes({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const article = await getData(slug);

  return (
    <article className="articleContent">
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
        dangerouslySetInnerHTML={{ __html: article.html }}
      />
      <div className="prev-next">
        {article.beforeArticle ? (
          <Card
            image={article.beforeArticle.image}
            headline={article.beforeArticle.headline}
            description={article.beforeArticle.description}
            slug={article.beforeArticle.slug}
            author={article.beforeArticle.author}
            published_at={article.beforeArticle.published_at}
          /> 
        ) : <span></span>} 
        {article.afterArticle ? (
          <Card
            image={article.afterArticle.image}
            headline={article.afterArticle.headline}
            description={article.afterArticle.description}
            slug={article.afterArticle.slug}
            author={article.afterArticle.author}
            published_at={article.afterArticle.published_at}
          />
        ): <span></span>}
      </div>
    </article>
  );
}
