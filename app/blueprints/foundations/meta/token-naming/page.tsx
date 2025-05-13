/**
 * Metadata for the /blueprints/foundations/meta/token-naming page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Token Naming & Hierarchy | Darian Rosebrook',
  description:
    'Learn how to structure and name design tokens for clarity, scalability, and cross-platform consistency in design systems.',
  openGraph: {
    title: 'Token Naming & Hierarchy | Darian Rosebrook',
    description:
      'Learn how to structure and name design tokens for clarity, scalability, and cross-platform consistency in design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Token Naming & Hierarchy | Darian Rosebrook',
    description:
      'Learn how to structure and name design tokens for clarity, scalability, and cross-platform consistency in design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

import styles from './page.module.scss';

const TokenNamingPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Token Naming & Hierarchy</h1>
      <p>
        A well-structured token naming system is crucial for maintaining clarity
        and scalability in your design system. This section covers how to
        organize tokens into core, semantic, and component-level layers,
        ensuring consistent naming conventions that work across platforms and
        themes.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default TokenNamingPage;
