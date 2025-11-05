'use client';
// layout for component-standards that contains breadcrumbs
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';
// import { Breadcrumbs } from '@/ui/components/Breadcrumbs/Breadcrumbs';
import { PageTransition } from '@/ui/components/PageTransition';
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

  const _crumbs = useBreadcrumbs({ base, labelMap });

  // TEMP: disable PageTransition wrappers to isolate render loop on component pages
  return (
    <section className="content">
      <div>{children}</div>
    </section>
  );
}
