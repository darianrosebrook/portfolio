import styles from './page.module.scss';

/**
 * Metadata for the /blueprints/foundations/tooling/design page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Design Tooling | Darian Rosebrook',
  description:
    'Explore design-side tools like Token Studio, Figma variables, and plugins for building and maintaining design system foundations.',
  openGraph: {
    title: 'Design Tooling | Darian Rosebrook',
    description:
      'Explore design-side tools like Token Studio, Figma variables, and plugins for building and maintaining design system foundations.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Design Tooling | Darian Rosebrook',
    description:
      'Explore design-side tools like Token Studio, Figma variables, and plugins for building and maintaining design system foundations.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

const DesignToolingPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Design Tooling</h1>
      <p>
        Design tooling bridges the gap between design and development, ensuring
        consistency and efficiency in your workflow. This section covers tools
        like Token Studio, Figma variables, and contrast checking plugins that
        help define, test, and maintain design-side foundations.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default DesignToolingPage;
