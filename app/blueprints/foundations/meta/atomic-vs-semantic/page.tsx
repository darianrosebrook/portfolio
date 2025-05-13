/**
 * Metadata for the /blueprints/foundations/meta/atomic-vs-semantic page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Atomic vs Semantic Tokens | Darian Rosebrook',
  description:
    'Explore the differences and balance between atomic (raw value) and semantic (purpose-driven) tokens in design systems.',
  openGraph: {
    title: 'Atomic vs Semantic Tokens | Darian Rosebrook',
    description:
      'Explore the differences and balance between atomic (raw value) and semantic (purpose-driven) tokens in design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Atomic vs Semantic Tokens | Darian Rosebrook',
    description:
      'Explore the differences and balance between atomic (raw value) and semantic (purpose-driven) tokens in design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

import styles from './page.module.scss';

const AtomicVsSemanticPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Atomic vs Semantic Tokens</h1>
      <p>
        Understanding the balance between atomic and semantic tokens is key to
        creating a flexible yet maintainable design system. This section
        explores the differences between raw value tokens and purpose-driven
        semantic tokens, helping you create a system that balances flexibility
        with clarity.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default AtomicVsSemanticPage;
