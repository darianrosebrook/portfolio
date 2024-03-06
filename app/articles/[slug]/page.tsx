import { createClient } from "@/utils/supabase/server";

import NextLink from "next/link";
import Avatar from "@/components/avatar/avatar";

import Document from "@tiptap/extension-document";
import Text from "@tiptap/extension-text";
import Paragraph from "@tiptap/extension-paragraph";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import Underline from "@tiptap/extension-underline";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Heading from "@tiptap/extension-heading";
import ListItem from "@tiptap/extension-list-item";
import Link from "@tiptap/extension-link";
import OrderedList from "@tiptap/extension-ordered-list";
import bulletList from "@tiptap/extension-bullet-list";
import Highlight from "@tiptap/extension-highlight";
import Code from "@tiptap/extension-code";
import { generateHTML } from "@tiptap/html";
import { log } from "console";
import { JSONContent } from "@tiptap/react";
import Image from "next/image";

type ArticleSchema = {
  id: string;
  created_at: string;
  published_at: string | null;
  modified_at: string | null;
  author: {
    full_name: string;
    username: string;
    avatar_url: string;
  };
  editor: string | null;
  draft: boolean;
  headline: string;
  alternativeHeadline: string;
  description: string;
  articleBody: JSONContent;
  html?: string;
  articleSection: string;
  wordCount: number | null;
  keywords: string | null;
  image: string;
  slug: string;
};
function getArticleContent(data: JSONContent) {
  const html: string = generateHTML(data, [
    Document,
    Text,
    Paragraph,
    Bold,
    Italic,
    Strike,
    Underline,
    Subscript,
    Superscript,
    Heading,
    ListItem,
    Link,
    OrderedList,
    bulletList,
    Highlight,
    Code,
  ]);
  return html;
}

async function getData(slug) {
  const supabase = createClient();
  const articleResponse = await supabase
    .from("articles")
    .select('*, author(full_name, username, avatar_url)')
    .eq("slug", slug);
  const article = articleResponse.data[0]; 
  const html = getArticleContent(article.articleBody);
  return { ...article, html } as ArticleSchema;
}
export default async function Notes({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const article = await getData(slug);
  console.log(article);
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
        <NextLink href={`/articles/${article.slug}`}>
          Next
        </NextLink>
        <NextLink href={`/articles/${article.slug}`}>
          Previous
        </NextLink>
      </div>
    </article>
  );
}
