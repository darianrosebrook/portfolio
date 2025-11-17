/**
 * Metadata for the /blueprints/foundations/meta/system-vs-style page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'System vs Style | Darian Rosebrook',
  description:
    'Learn how to balance foundational system logic with brand style layers for scalable, unique design systems.',
  openGraph: {
    title: 'System vs Style | Darian Rosebrook',
    description:
      'Learn how to balance foundational system logic with brand style layers for scalable, unique design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'System vs Style | Darian Rosebrook',
    description:
      'Learn how to balance foundational system logic with brand style layers for scalable, unique design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

import styles from './page.module.scss';

const SystemVsStylePage: React.FC = () => {
  return (
    <section className="content">
      <h1>System vs Style</h1>
      <p>
        A successful design system balances foundational system logic with brand
        style layers. This section helps you distinguish between these layers,
        enabling your design system to scale effectively while preserving your
        brand&apos;s unique identity and personality.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default SystemVsStylePage;
