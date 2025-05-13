import styles from './page.module.scss';

/**
 * Metadata for the /blueprints/foundations/spacing page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Spacing & Sizing Foundations | Darian Rosebrook',
  description:
    'Learn how to create modular spacing systems for consistent, accessible, and scalable layouts in design systems.',
  openGraph: {
    title: 'Spacing & Sizing Foundations | Darian Rosebrook',
    description:
      'Learn how to create modular spacing systems for consistent, accessible, and scalable layouts in design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spacing & Sizing Foundations | Darian Rosebrook',
    description:
      'Learn how to create modular spacing systems for consistent, accessible, and scalable layouts in design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

const SpacingPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Spacing & Sizing Foundations</h1>
      <p>
        Consistent spacing creates visual rhythm and hierarchy in your
        interface. This section covers how to establish a modular spacing system
        that scales appropriately across different screen sizes and maintains
        accessibility requirements.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default SpacingPage;
