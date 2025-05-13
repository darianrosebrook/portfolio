import styles from './page.module.scss';

/**
 * Metadata for the /blueprints/foundations/layout page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Layout Foundations | Darian Rosebrook',
  description:
    'Master responsive design, grid systems, and container strategies for consistent, scalable layouts in design systems.',
  openGraph: {
    title: 'Layout Foundations | Darian Rosebrook',
    description:
      'Master responsive design, grid systems, and container strategies for consistent, scalable layouts in design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Layout Foundations | Darian Rosebrook',
    description:
      'Master responsive design, grid systems, and container strategies for consistent, scalable layouts in design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

const LayoutPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Layout Foundations</h1>
      <p>
        Layout is the structural foundation of your interface, determining how
        content is organized and presented across different screen sizes. This
        section covers responsive design principles, grid systems, and container
        strategies that ensure consistent and usable layouts.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default LayoutPage;
