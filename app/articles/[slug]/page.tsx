import { createClient } from '@/utils/supabase/server';

// TipTap
import StarterKit from '@tiptap/starter-kit';
import CharacterCount from '@tiptap/extension-character-count';
import Image from '@tiptap/extension-image';

import { generateHTML } from '@tiptap/html';
import { JSONContent } from '@tiptap/react';
import { generateLDJson } from '@/utils/ldjson';

import ArticleDetailClient from './ArticleDetailClient';

function getArticleContent(data: JSONContent) {
  let html: string = generateHTML(data, [CharacterCount, Image, StarterKit]);
  const h1FromHTML = html.match(/<h1>(.*?)<\/h1>/);
  const imageFromHTML = html.match(/<img(.*?)>/);
  if (h1FromHTML) {
    html = html.replace(h1FromHTML[0], '');
  }
  if (imageFromHTML) {
    html = html.replace(imageFromHTML[0], '');
  }
  const content = { h1FromHTML, imageFromHTML, html };
  return content;
}

async function getData(slug: string) {
  const supabase = await createClient();
  const { data: article } = await supabase
    .from('articles')
    .select('*, author(full_name, username, avatar_url)')
    .eq('slug', slug)
    .single();
  const published_at = article?.published_at || new Date().toISOString();
  const { data: beforeArticle } = await supabase
    .from('articles')
    .select(
      'author(full_name, username, avatar_url), slug, published_at, headline, image, description'
    )
    //  the article is published and the published date is less than the current date, limit to 1
    .eq('draft', false)
    .lt('published_at', published_at)
    .order('published_at', { ascending: false })
    .limit(1)
    .single();
  const { data: afterArticle } = await supabase
    .from('articles')
    .select(
      'author(full_name, username, avatar_url), slug, published_at, headline, image, description'
    )
    //  the article is published and the published date is greater than the current date, limit to 1
    .eq('draft', false)
    .gt('published_at', published_at)
    .order('published_at', { ascending: true })
    .limit(1)
    .single();

  const contents = getArticleContent(article.articleBody);
  const { h1FromHTML, imageFromHTML, html } = contents;
  return {
    ...article,
    html,
    beforeArticle,
    afterArticle,
    h1FromHTML,
    imageFromHTML,
  };
}

/**
 * Generates dynamic metadata for the article page based on the slug parameter.
 * Fetches article data and constructs metadata for SEO, Open Graph, and Twitter cards.
 *
 * @param {Object} props - The props object containing route parameters.
 * @param {Object} props.params - The route parameters, including the article slug.
 * @returns {Promise<import('next').Metadata>} The metadata object for the page.
 */
export async function generateMetadata(props: { params: Params }) {
  const params = await props.params;
  const { slug } = params;
  const article = await getData(slug);
  const canonical = `https://darianrosebrook.com/articles/${slug}`;
  const openGraph = {
    title: article.headline,
    description: article.description,
    url: canonical,
    siteName: 'Darian Rosebrook | Product Designer',
    images: [
      {
        url: article.image,
        width: 800,
        height: 600,
        alt: article.headline,
      },
    ],
    locale: 'en_US',
    type: 'website',
  };
  const twitter = {
    card: 'summary_large_image',
    title: article.headline,
    description: article.description,
    creator: '@darianrosebrook',
    images: [article.image],
  };
  const meta = {
    category: 'Design',
    creator: 'Darian Rosebrook',
    description: article.description,
    title: article.headline + ' | Darian Rosebrook',
  };

  return { canonical, openGraph, twitter, ...meta };
}

type Params = Promise<{ slug: string }>;

export default async function Page(props: { params: Params }) {
  const params = await props.params;
  const { slug } = params;
  const canonical = `https://darianrosebrook.com/articles/${slug}`;
  const article = await getData(slug);
  const ldJson = generateLDJson({
    article,
    canonical,
  });

  return (
    <ArticleDetailClient
      article={article}
      canonical={canonical}
      ldJson={ldJson}
    />
  );
}
