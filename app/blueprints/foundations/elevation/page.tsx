/**
 * Metadata for the /blueprints/foundations/elevation page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Elevation & Shadows Foundations | Darian Rosebrook',
  description:
    'Learn how to create visual hierarchy and depth with consistent elevation and shadow systems in design systems.',
  openGraph: {
    title: 'Elevation & Shadows Foundations | Darian Rosebrook',
    description:
      'Learn how to create visual hierarchy and depth with consistent elevation and shadow systems in design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Elevation & Shadows Foundations | Darian Rosebrook',
    description:
      'Learn how to create visual hierarchy and depth with consistent elevation and shadow systems in design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

import styles from './page.module.scss';

const ElevationPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Elevation & Shadows Foundations</h1>
      <p>
        Elevation and shadows create visual hierarchy and depth in your
        interface, helping users understand relationships between elements. This
        section covers how to implement a consistent elevation system that works
        across different platforms and themes.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default ElevationPage;
