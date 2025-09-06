import { createClient } from '@/utils/supabase/server';
import { getCaseStudyContent } from '@/utils/caseStudy';
import CaseStudyPage from '../_components/CaseStudyPage';
import type { JSONContent } from '@tiptap/react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

async function getData(slug: string) {
  const supabase = await createClient();
  const { data: caseStudy } = await supabase
    .from('case_studies')
    .select('*')
    .eq('slug', slug)
    .single();

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
    siteName: 'Darian Rosebrook | Product Designer',
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
