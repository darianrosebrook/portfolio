/**
 * Metadata for the /blueprints/foundations/borders page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Borders & Strokes Foundations | Darian Rosebrook',
  description:
    'Learn how to implement a consistent system of borders and strokes for visual separation, function, and accessibility in design systems.',
  openGraph: {
    title: 'Borders & Strokes Foundations | Darian Rosebrook',
    description:
      'Learn how to implement a consistent system of borders and strokes for visual separation, function, and accessibility in design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Borders & Strokes Foundations | Darian Rosebrook',
    description:
      'Learn how to implement a consistent system of borders and strokes for visual separation, function, and accessibility in design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

import styles from './page.module.scss';

const BordersPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Borders & Strokes Foundations</h1>
      <p>
        Borders and strokes define boundaries and create visual separation
        between elements. This section covers how to implement a consistent
        system of borders that supports both aesthetic and functional needs
        while maintaining accessibility.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default BordersPage;
