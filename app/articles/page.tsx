import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { Profile } from '@/types';
import ArticlesListClient from './ArticlesListClient';

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
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('articles')
    .select(
      `
    id,
    headline,
    description,
    image,
    slug,
    author(*),
    published_at
    `
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  // Check for meaningful error (not just empty object)
  if (error && (error.message || error.code || Object.keys(error).length > 0)) {
    console.error('Supabase query error:', JSON.stringify(error, null, 2));
    return [] as ArticleWithAuthor[];
  }

  // Handle case where data is null or undefined
  if (!data) {
    console.warn('No articles data returned from query');
    return [] as ArticleWithAuthor[];
  }

  return data as unknown as ArticleWithAuthor[];
}

export default async function Page() {
  const articles = await getData();
  return <ArticlesListClient articles={articles} />;
}
