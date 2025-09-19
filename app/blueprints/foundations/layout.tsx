'use client';
// layout for foundations that contains breadcrumbs
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';
// import { Breadcrumbs } from '@/ui/components/Breadcrumbs/Breadcrumbs';
import { PageTransition } from '@/ui/components/PageTransition';
import React from 'react';

export default function FoundationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const base = { label: 'Foundations', href: '/blueprints/foundations' };

  // Map slug segments to friendly labels
  const labelMap: Record<string, string> = {
    tokens: 'Design Tokens',
    'core-vs-semantic': 'Core vs Semantic',
    'token-naming': 'Token Naming',
    theming: 'Theming & Modes',
    'schema-validation': 'Schema & Validation',
    'build-outputs': 'Build Outputs',
    accessibility: 'Accessibility',
  };

  const crumbs = useBreadcrumbs({ base, labelMap });

  // const sidebarSections = [
  //   {
  //     title: 'Tokens',
  //     items: [
  //       { label: 'Overview', href: '/blueprints/foundations/tokens' },
  //       {
  //         label: 'Core vs Semantic',
  //         href: '/blueprints/foundations/tokens/core-vs-semantic',
  //       },
  //       {
  //         label: 'Token Naming',
  //         href: '/blueprints/foundations/tokens/token-naming',
  //       },
  //       {
  //         label: 'Theming & Modes',
  //         href: '/blueprints/foundations/tokens/theming',
  //       },
  //       {
  //         label: 'Schema & Validation',
  //         href: '/blueprints/foundations/tokens/schema-validation',
  //       },
  //       {
  //         label: 'Build Outputs',
  //         href: '/blueprints/foundations/tokens/build-outputs',
  //       },
  //       {
  //         label: 'Accessibility',
  //         href: '/blueprints/foundations/tokens/accessibility',
  //       },
  //     ],
  //   },
  // ];

  return (
    <PageTransition transitionName="foundations-layout" duration={300}>
      <section className="content">
        <PageTransition transitionName="breadcrumb" duration={200}>
          <div>{/* <Breadcrumbs base={base} crumbs={crumbs} /> */}</div>
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
