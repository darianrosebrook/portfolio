'use client';
// layout for component-standards that contains breadcrumbs
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';
import { Breadcrumbs } from '@/ui/components/Breadcrumbs/Breadcrumbs';
import React from 'react';

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
    // Component-specific labels will be handled dynamically
    button: 'Button',
    input: 'Input',
    card: 'Card',
    dialog: 'Dialog',
    avatar: 'Avatar',
    badge: 'Badge',
    breadcrumbs: 'Breadcrumbs',
    divider: 'Divider',
    field: 'Field',
    icon: 'Icon',
    image: 'Image',
    popover: 'Popover',
    select: 'Select',
    sidebar: 'Sidebar',
    spinner: 'Spinner',
    switch: 'Switch',
    tabs: 'Tabs',
    text: 'Text',
    'text-field': 'Text Field',
    toast: 'Toast',
    tooltip: 'Tooltip',
    toolbar: 'Toolbar',
  };

  const crumbs = useBreadcrumbs({ base, labelMap });

  // PageTransition wrappers are intentionally not used in this section;
  // re-wrapping these pages is a separate, unmeasured change. Breadcrumbs
  // itself derives purely from the pathname and renders no effects.
  return (
    <section className="content">
      <Breadcrumbs base={base} crumbs={crumbs} />
      <div>{children}</div>
    </section>
  );
}
