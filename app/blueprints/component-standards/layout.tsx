'use client';
// layout for component-standards that contains breadcrumbs
import React from 'react';
import Breadcrumbs from '@/ui/components/Breadcrumbs';
import { PageTransition } from '@/ui/components/PageTransition';
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
    <PageTransition transitionName="component-standards-layout" duration={300}>
      <section className="content">
        <PageTransition transitionName="breadcrumb" duration={200}>
          <Breadcrumbs base={base} crumbs={crumbs} />
        </PageTransition>
        <PageTransition transitionName="doc-content" duration={250}>
          <div>
            <div>{children}</div>
          </div>
        </PageTransition>
      </section>
    </PageTransition>
  );
}
