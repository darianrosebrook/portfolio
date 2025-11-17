import styles from './page.module.scss';

/**
 * Metadata for the /blueprints/foundations/accessibility/tokens page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Token-Level Accessibility | Darian Rosebrook',
  description:
    'Learn how to create design tokens that support accessibility for color contrast, motion, spacing, and focus states in design systems.',
  openGraph: {
    title: 'Token-Level Accessibility | Darian Rosebrook',
    description:
      'Learn how to create design tokens that support accessibility for color contrast, motion, spacing, and focus states in design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Token-Level Accessibility | Darian Rosebrook',
    description:
      'Learn how to create design tokens that support accessibility for color contrast, motion, spacing, and focus states in design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

const AccessibilityTokensPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Token-Level Accessibility</h1>
      <p>
        Building accessibility into your design system starts at the token
        level. This section covers how to create tokens that support color
        contrast, motion sensitivity, spacing for legibility, and focus states,
        ensuring accessibility is baked into your system from the ground up.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default AccessibilityTokensPage;
