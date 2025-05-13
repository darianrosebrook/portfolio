/**
 * Metadata for the /blueprints/foundations/tooling/automation page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Automation & CI/CD | Darian Rosebrook',
  description:
    'Learn how to automate token distribution, theme switching, and documentation updates for scalable, maintainable design systems.',
  openGraph: {
    title: 'Automation & CI/CD | Darian Rosebrook',
    description:
      'Learn how to automate token distribution, theme switching, and documentation updates for scalable, maintainable design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Automation & CI/CD | Darian Rosebrook',
    description:
      'Learn how to automate token distribution, theme switching, and documentation updates for scalable, maintainable design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

import styles from './page.module.scss';

const AutomationPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Automation & CI/CD</h1>
      <p>
        Automation ensures your design system remains consistent and up-to-date
        across all platforms. This section covers how to automate token
        distribution, theme switching, and documentation updates using GitHub
        Actions, custom pipelines, and preview deployments.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default AutomationPage;
