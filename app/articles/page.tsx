import type { Metadata } from 'next';
import { createReadClient } from '@/utils/supabase/readClient';
import { Profile } from '@/types';
import { PUBLIC_AUTHOR_COLUMNS } from '@/utils/supabase/contentAccess';
import ArticlesListClient from './ArticlesListClient';

/**
 * Published articles change only when an author writes, so this list is cached
 * and refreshed hourly. Writes call revalidatePath('/articles') for immediate
 * updates (see utils/supabase/revalidateContent.ts); the window is the safety
 * net if an invalidation is ever missed.
 *
 * This only holds while the query uses the cookieless read client — a single
 * cookies() read anywhere in the route would silently force dynamic rendering.
 *
 * Deliberate consequence: because this route is prerendered at build time and
 * `getData` throws on a failed query, **the build fails if Supabase is
 * unreachable**. That is the intended tradeoff (FIX-004) — shipping an empty
 * articles page that then caches for an hour is worse than a blocked deploy. If a
 * build fails here with "Failed to load published articles", check database
 * reachability and credentials rather than removing the throw.
 */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Articles | Darian Rosebrook',
  description:
    'Read articles about design systems, design tooling, Figma plugins, UX engineering, and design ops written by Darian Rosebrook, Staff Design Technologist.',
  openGraph: {
    title: 'Articles | Darian Rosebrook',
    description:
      'Read articles about design systems, design tooling, Figma plugins, UX engineering, and design ops written by Darian Rosebrook, Staff Design Technologist.',
    url: 'https://darianrosebrook.com/articles',
    siteName: 'Darian Rosebrook',
    images: [
      {
        url: 'https://darianrosebrook.com/darianrosebrook.jpg',
        width: 1200,
        height: 630,
        alt: 'Darian Rosebrook',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Articles | Darian Rosebrook',
    description:
      'Read articles about design systems, design tooling, Figma plugins, UX engineering, and design ops written by Darian Rosebrook, Staff Design Technologist.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
    creator: '@darianrosebrook',
  },
  alternates: {
    canonical: 'https://darianrosebrook.com/articles',
  },
};

// Type for the specific fields we select in the query
type ArticleWithAuthor = {
  id: number;
  headline: string | null;
  description: string | null;
  image: string | null;
  slug: string;
  author: Profile;
  published_at: string | null;
};

async function getData(): Promise<ArticleWithAuthor[]> {
  const supabase = createReadClient();
  const { data, error } = await supabase
    .from('articles')
    // A wildcard author embed would ship the whole profiles row —
    // account_status, privacy, settings, metrics, spacial_location — to
    // anonymous visitors via ArticlesListClient. ProfileFlag renders three.
    .select(
      `
    id,
    headline,
    description,
    image,
    slug,
    author(${PUBLIC_AUTHOR_COLUMNS.join(', ')}),
    published_at
    `
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  // Fail the render rather than returning an empty list. This page is cached, so
  // a swallowed error would pin an empty /articles for the whole revalidate
  // window; throwing makes Next keep serving the last good entry and retry later.
  // An empty array is a different thing entirely — a legitimately empty corpus
  // falls through and is cached normally.
  if (error && (error.message || error.code || Object.keys(error).length > 0)) {
    console.error('Supabase query error:', JSON.stringify(error, null, 2));
    throw new Error(
      `Failed to load published articles: ${error.message || error.code || 'unknown error'}`
    );
  }

  if (!data) {
    // Distinct from `[]`: a null payload with no error means the query did not
    // answer, so it must not be cached as "no articles exist".
    throw new Error('Failed to load published articles: no data returned');
  }

  return data as unknown as ArticleWithAuthor[];
}

export default async function Page() {
  const articles = await getData();
  return <ArticlesListClient articles={articles} />;
}
