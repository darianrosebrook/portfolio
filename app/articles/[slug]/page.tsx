import { createClient } from "@/utils/supabase/server";

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
  author: string;
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
  const data = await supabase.from("articles").select().eq("slug", slug);
  const article = data.data[0];
  const html = getArticleContent(article.articleBody);
  return { ...article, html } as ArticleSchema;
}
export default async function Notes({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const article = await getData(slug); 
  return <article className="articleContent" >
    <Image src={article.image} alt={article.headline} width={500} height={300} />
    <h1>{article.headline}</h1>
    <div dangerouslySetInnerHTML={{ __html: article.html }} />
  </article>;
}
