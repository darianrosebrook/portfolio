import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { generateLDJson } from '@/utils/ldjson';
import { processArticleContent } from '@/utils/tiptap/htmlGeneration';

import ArticleDetailClient from './ArticleDetailClient';

async function getData(slug: string) {
  const supabase = await createClient();
  const { data: article } = await supabase
    .from('articles')
    .select('*, author(full_name, username, avatar_url)')
    .eq('slug', slug)
    .single();

  if (!article) return null;

  const published_at = article.published_at || new Date().toISOString();
  const { data: beforeArticle } = await supabase
    .from('articles')
    .select(
      'author(full_name, username, avatar_url), slug, published_at, headline, image, description'
    )
    .eq('status', 'published')
    .lt('published_at', published_at)
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const { data: afterArticle } = await supabase
    .from('articles')
    .select(
      'author(full_name, username, avatar_url), slug, published_at, headline, image, description'
    )
    .eq('status', 'published')
    .gt('published_at', published_at)
    .order('published_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  // processArticleContent uses the full createServerExtensions() registry,
  // strips the first h1 and first image, and catches any generateHTML errors
  // (returning an empty string rather than 500ing the page).
  const { html } = processArticleContent(article.articleBody);

  return {
    ...article,
    html,
    beforeArticle,
    afterArticle,
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
  if (!article) {
    return { title: 'Article Not Found | Darian Rosebrook' };
  }
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
  if (!article) notFound();
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
