'use client';
// layout for component-standards that contains breadcrumbs
import Breadcrumbs from '@/ui/components/Breadcrumbs';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';

export default function ComponentStandardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const base = {
    label: 'Component Standards',
    href: '/blueprints/component-standards',
  };

  // Map slug segments to friendly labels
  const labelMap: Record<string, string> = {
    'component-complexity': 'Component Complexity',
    primitives: 'Primitives',
    compound: 'Compound',
    composer: 'Composer',
    assemblies: 'Assemblies',
    'component-contracts': 'Component Contracts',
    'design-tokens': 'Design Tokens',
    accessibility: 'Accessibility',
    testing: 'Testing',
    documentation: 'Documentation',
  };

  const crumbs = useBreadcrumbs({ base, labelMap });

  return (
    <section className="content">
      <Breadcrumbs base={base} crumbs={crumbs} />
      <div>
        <div>{children}</div>
      </div>
    </section>
  );
}
