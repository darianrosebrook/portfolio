import { notFound } from 'next/navigation';
import { createReadClient } from '@/utils/supabase/readClient';
import { generateLDJson } from '@/utils/ldjson';
import { PUBLIC_ARTICLE_SELECT } from '@/utils/supabase/contentAccess';
import type { Profile } from '@/types';
import { processArticleContent } from '@/utils/tiptap/htmlGeneration';

import ArticleDetailClient from './ArticleDetailClient';

/**
 * Cached per slug and refreshed hourly. Author writes invalidate every instance
 * of this route, not just the edited slug — the prev/next links below are derived
 * from neighbouring published_at values, so publishing one article changes the
 * footer links on other already-cached articles.
 *
 * Only holds while the queries use the cookieless read client; any cookies() read
 * in this route would force dynamic rendering and silently disable caching.
 */
export const revalidate = 3600;

/**
 * Prerender the published slugs at build time.
 *
 * `revalidate` alone is not enough for a dynamic segment: without this the route
 * stays "server-rendered on demand" and every request re-queries Supabase, so the
 * caching above would have no effect. With it, known slugs are built as static
 * HTML and refreshed on the revalidate window.
 *
 * Slugs added after the build are still served — `dynamicParams` defaults to true,
 * so they render on first request and are cached from then on.
 */
export async function generateStaticParams() {
  try {
    const supabase = createReadClient();
    const { data } = await supabase
      .from('articles')
      .select('slug')
      .eq('status', 'published');

    return (data ?? [])
      .map(({ slug }) => slug)
      .filter((slug): slug is string => typeof slug === 'string' && slug !== '')
      .map((slug) => ({ slug }));
  } catch {
    // A build without database access should not fail; fall back to rendering
    // every slug on demand.
    return [];
  }
}

async function getData(slug: string) {
  const supabase = createReadClient();
  // Narrowed select, not `*`: this row is spread into ArticleDetailClient
  // props, so anything selected here reaches an anonymous visitor's browser.
  const { data: article } = await supabase
    .from('articles')
    .select(PUBLIC_ARTICLE_SELECT)
    .eq('slug', slug)
    .eq('status', 'published')
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
    // The generated types model the author embed as an array because
    // articles_author_fkey is not unique, but PostgREST returns a single
    // object for a to-one embed. ProfileFlag reads full_name, username and
    // avatar_url — the three columns PUBLIC_ARTICLE_SELECT requests.
    author: article.author as unknown as Profile,
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
    siteName: 'Darian Rosebrook | Staff Design Technologist',
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
