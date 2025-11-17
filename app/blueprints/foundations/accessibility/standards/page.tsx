import styles from './page.module.scss';

/**
 * Metadata for the /blueprints/foundations/accessibility/standards page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Accessibility Standards & Principles | Darian Rosebrook',
  description:
    'Understand how WCAG 2.1+, APCA, and the POUR model shape accessible, inclusive design systems and digital products.',
  openGraph: {
    title: 'Accessibility Standards & Principles | Darian Rosebrook',
    description:
      'Understand how WCAG 2.1+, APCA, and the POUR model shape accessible, inclusive design systems and digital products.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Accessibility Standards & Principles | Darian Rosebrook',
    description:
      'Understand how WCAG 2.1+, APCA, and the POUR model shape accessible, inclusive design systems and digital products.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

const AccessibilityStandardsPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Accessibility Standards & Principles</h1>
      <p>
        Accessibility is a fundamental requirement, not an afterthought. This
        section covers how WCAG 2.1+, APCA, and the POUR model shape accessible
        design, providing a framework for creating inclusive experiences that
        work for everyone.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default AccessibilityStandardsPage;
