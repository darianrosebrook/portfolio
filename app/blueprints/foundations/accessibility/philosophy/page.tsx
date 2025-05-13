import styles from './page.module.scss';

/**
 * Metadata for the /blueprints/foundations/accessibility/philosophy page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Accessibility Philosophy & Practice | Darian Rosebrook',
  description:
    'Frame accessibility as a design constraint and mindset that leads to better, more inclusive products and systems.',
  openGraph: {
    title: 'Accessibility Philosophy & Practice | Darian Rosebrook',
    description:
      'Frame accessibility as a design constraint and mindset that leads to better, more inclusive products and systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Accessibility Philosophy & Practice | Darian Rosebrook',
    description:
      'Frame accessibility as a design constraint and mindset that leads to better, more inclusive products and systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

const AccessibilityPhilosophyPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Accessibility Philosophy & Practice</h1>
      <p>
        Accessibility is more than a checklist—it&apos;s a mindset that enhances
        design decision-making and expands usability for everyone. This section
        explores how to frame accessibility as a design constraint that leads to
        better, more inclusive products.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default AccessibilityPhilosophyPage;
