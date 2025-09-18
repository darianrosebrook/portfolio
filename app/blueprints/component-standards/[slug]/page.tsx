import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ComprehensiveComponentDoc } from '../_components/ComprehensiveComponentDoc';
import {
  getAllComponents,
  getComponentBySlug,
  getRelatedComponents,
} from '../_lib/componentsData';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const components = getAllComponents();
  return components.map((component) => ({
    slug: component.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const component = getComponentBySlug(slug);

  if (!component) {
    return {
      title: 'Component Not Found',
    };
  }

  return {
    title: `${component.component} Component - Design System`,
    description:
      component.description ||
      `Documentation for the ${component.component} component in our design system.`,
    openGraph: {
      title: `${component.component} Component`,
      description: component.description,
      type: 'article',
    },
  };
}

export default async function ComponentPage({ params }: Props) {
  const { slug } = await params;
  const component = getComponentBySlug(slug);

  if (!component) {
    notFound();
  }

  const relatedComponents = getRelatedComponents(slug, { limit: 6 });

  return (
    <ComprehensiveComponentDoc
      component={component}
      relatedComponents={relatedComponents}
    />
  );
}
