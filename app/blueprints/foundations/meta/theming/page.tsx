/**
 * Metadata for the /blueprints/foundations/meta/theming page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Theming Strategies | Darian Rosebrook',
  description:
    'Explore techniques for supporting dark mode, brand variations, and context-aware styling in design systems.',
  openGraph: {
    title: 'Theming Strategies | Darian Rosebrook',
    description:
      'Explore techniques for supporting dark mode, brand variations, and context-aware styling in design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Theming Strategies | Darian Rosebrook',
    description:
      'Explore techniques for supporting dark mode, brand variations, and context-aware styling in design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

import styles from './page.module.scss';

const ThemingPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Theming Strategies</h1>
      <p>
        Effective theming strategies enable your design system to adapt to
        different contexts while maintaining consistency. This section covers
        techniques for supporting dark mode, brand variations, and context-aware
        styling using alias tokens, layered tokens, and theme inheritance.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default ThemingPage;
