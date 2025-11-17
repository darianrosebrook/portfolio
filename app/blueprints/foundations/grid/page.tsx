import styles from './page.module.scss';

/**
 * Metadata for the /blueprints/foundations/grid page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Grid Systems Foundations | Darian Rosebrook',
  description:
    'Learn how grid systems provide structure, consistency, and accessibility to layouts in design systems across platforms.',
  openGraph: {
    title: 'Grid Systems Foundations | Darian Rosebrook',
    description:
      'Learn how grid systems provide structure, consistency, and accessibility to layouts in design systems across platforms.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Grid Systems Foundations | Darian Rosebrook',
    description:
      'Learn how grid systems provide structure, consistency, and accessibility to layouts in design systems across platforms.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

const GridPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Grid Systems Foundations</h1>
      <p>
        Grid systems provide structure and consistency to layouts, helping
        organize content in a predictable and accessible way. This section
        covers how to implement flexible grid systems that work across different
        screen sizes and content types.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default GridPage;
