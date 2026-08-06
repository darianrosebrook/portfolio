import { createReadClient } from '@/utils/supabase/readClient';
import { getCaseStudyContent } from '@/utils/caseStudy';
import { PUBLIC_CASE_STUDY_SELECT } from '@/utils/supabase/contentAccess';
import CaseStudyPage from '../_components/CaseStudyPage';
import type { JSONContent } from '@tiptap/react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

/**
 * Replaces the previous `dynamic = 'force-dynamic'`. That opt-out existed because
 * the cookie-bound server client made the route dynamic anyway; with the cookieless
 * read client the page is cacheable, and force-dynamic would defeat this revalidate.
 * Author writes invalidate every instance of the route.
 */
export const revalidate = 3600;

/**
 * Prerender the published slugs at build time.
 *
 * `revalidate` alone is not enough for a dynamic segment: without this the route
 * stays "server-rendered on demand" and every request re-queries Supabase, so the
 * caching above would have no effect. Slugs added after the build still render on
 * first request and are cached from then on (`dynamicParams` defaults to true).
 */
export async function generateStaticParams() {
  try {
    const supabase = createReadClient();
    const { data, error } = await supabase
      .from('case_studies')
      .select('slug')
      .eq('status', 'published');

    // supabase-js reports query failures on `error` rather than throwing, so
    // without this the catch below never sees them and the build quietly
    // prerenders nothing — indistinguishable from "no case studies exist".
    if (error) {
      console.error(
        'generateStaticParams: failed to list published case study slugs:',
        JSON.stringify(error, null, 2)
      );
      return [];
    }

    return (data ?? [])
      .map(({ slug }) => slug)
      .filter((slug): slug is string => typeof slug === 'string' && slug !== '')
      .map((slug) => ({ slug }));
  } catch (thrown) {
    // A build without database access should not fail; fall back to rendering
    // every slug on demand. Logged so it is a visible tradeoff, not a silence.
    console.error(
      'generateStaticParams: unable to reach the database; every case study slug will render on demand:',
      thrown
    );
    return [];
  }
}

type Params = Promise<{ slug: string }>;

async function getData(slug: string) {
  const supabase = createReadClient();
  // Narrowed select, not `*`: this row is spread into CaseStudyPage props.
  // The `as {...}` cast below is compile-time only — it does not remove
  // working* keys from the object that reaches the client.
  const { data: caseStudy, error } = await supabase
    .from('case_studies')
    .select(PUBLIC_CASE_STUDY_SELECT)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  // A failed query must not become a 404. This route is cached, and a cached 404
  // on a published case study has no subsequent write to invalidate it. PGRST116
  // is "no rows" — a genuine absence, which falls through to notFound() below.
  if (error && error.code !== 'PGRST116') {
    console.error(
      `Failed to load case study "${slug}":`,
      JSON.stringify(error, null, 2)
    );
    throw new Error(
      `Failed to load case study "${slug}": ${error.message || error.code}`
    );
  }

  if (!caseStudy) {
    notFound();
  }

  const { html } = getCaseStudyContent(caseStudy?.articleBody as JSONContent);

  return {
    ...caseStudy,
    html,
  } as {
    headline: string | null;
    alternativeHeadline: string | null;
    description: string | null;
    image: string | null;
    published_at: string | null;
    html: string;
  };
}

export async function generateMetadata(props: { params: Params }) {
  const params = await props.params;
  const { slug } = params;
  const data = await getData(slug);
  const canonical = `https://darianrosebrook.com/work/${slug}`;
  const openGraph = {
    title: data.headline,
    description: data.description,
    url: canonical,
    siteName: 'Darian Rosebrook | Staff Design Technologist',
    images: data.image
      ? [
          {
            url: data.image,
            width: 800,
            height: 600,
            alt: data.headline ?? '',
          },
        ]
      : [],
    locale: 'en_US',
    type: 'website',
  };

  const twitter = {
    card: 'summary_large_image',
    title: data.headline,
    description: data.description,
    creator: '@darianrosebrook',
    images: data.image ? [data.image] : [],
  };

  const meta = {
    category: 'Design',
    creator: 'Darian Rosebrook',
    description: data.description,
    title: (data.headline ?? 'Case Study') + ' | Darian Rosebrook',
  };

  return { canonical, openGraph, twitter, ...meta } as Metadata;
}

export default async function Page(props: { params: Params }) {
  const params = await props.params;
  const { slug } = params;
  const data = await getData(slug);
  return <CaseStudyPage data={data} />;
}
