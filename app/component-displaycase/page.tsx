import dynamic from 'next/dynamic';
import React from 'react';

/**
 * Metadata for the /component-displaycase page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Component Display Case | Darian Rosebrook',
  description:
    'A quick visual grid to drop in UI components and check their rendering states before writing full docs.',
  openGraph: {
    title: 'Component Display Case | Darian Rosebrook',
    description:
      'A quick visual grid to drop in UI components and check their rendering states before writing full docs.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Component Display Case | Darian Rosebrook',
    description:
      'A quick visual grid to drop in UI components and check their rendering states before writing full docs.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

const ComponentGrid = dynamic(
  () => import('./component-grid.client').then((m) => m.ComponentGrid),
  { ssr: false }
);

const ComponentDisplayCasePage: React.FC = () => {
  return (
    <section className="content">
      <h1>Component Display Case</h1>
      <p>
        Use this grid to rapidly place components and review their default
        rendering, spacing, and contrast. Replace the placeholders with imports
        and component instances.
      </p>

      <ComponentGrid />
    </section>
  );
};

export default ComponentDisplayCasePage;
