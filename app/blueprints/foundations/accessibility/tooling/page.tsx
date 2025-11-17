import styles from './page.module.scss';

/**
 * Metadata for the /blueprints/foundations/accessibility/tooling page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Accessibility Tooling | Darian Rosebrook',
  description:
    'Explore tools like axe-core, Lighthouse, and Figma plugins for testing, validating, and enforcing accessibility in design systems.',
  openGraph: {
    title: 'Accessibility Tooling | Darian Rosebrook',
    description:
      'Explore tools like axe-core, Lighthouse, and Figma plugins for testing, validating, and enforcing accessibility in design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Accessibility Tooling | Darian Rosebrook',
    description:
      'Explore tools like axe-core, Lighthouse, and Figma plugins for testing, validating, and enforcing accessibility in design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

const AccessibilityToolingPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Accessibility Tooling</h1>
      <p>
        The right tools can help you maintain and improve accessibility
        throughout your development process. This section covers tools like
        axe-core, Lighthouse, and Figma plugins that help test, validate, and
        enforce accessibility at every stage of your workflow.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default AccessibilityToolingPage;
