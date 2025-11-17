/**
 * Metadata for the /blueprints/foundations/accessibility/assistive-tech page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Assistive Technology Support | Darian Rosebrook',
  description:
    'Best practices for supporting screen readers, keyboard navigation, ARIA, and other assistive technologies in design systems.',
  openGraph: {
    title: 'Assistive Technology Support | Darian Rosebrook',
    description:
      'Best practices for supporting screen readers, keyboard navigation, ARIA, and other assistive technologies in design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Assistive Technology Support | Darian Rosebrook',
    description:
      'Best practices for supporting screen readers, keyboard navigation, ARIA, and other assistive technologies in design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

import styles from './page.module.scss';

const AssistiveTechPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Assistive Technology Support</h1>
      <p>
        Supporting assistive technologies is crucial for creating inclusive
        experiences. This section covers best practices for screen readers,
        keyboard navigation, and other assistive tools, including proper
        semantics, ARIA usage, and focus management.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default AssistiveTechPage;
