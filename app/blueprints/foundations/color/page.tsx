/**
 * Metadata for the /blueprints/foundations/color page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Color Foundations | Darian Rosebrook',
  description:
    'Explore the principles and practices of building robust, accessible color systems for design systems and digital products.',
  openGraph: {
    title: 'Color Foundations | Darian Rosebrook',
    description:
      'Explore the principles and practices of building robust, accessible color systems for design systems and digital products.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Color Foundations | Darian Rosebrook',
    description:
      'Explore the principles and practices of building robust, accessible color systems for design systems and digital products.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

import styles from './page.module.scss';

const ColorPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Color Foundations</h1>
      <p>
        Color is one of the most powerful tools in design, serving multiple
        purposes from establishing brand identity to providing visual hierarchy
        and ensuring accessibility. This section covers the principles and
        practices of creating a robust color system.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default ColorPage;
