import styles from './page.module.scss';

/**
 * Metadata for the /blueprints/foundations/icons page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Icon Foundations | Darian Rosebrook',
  description:
    'Learn about icon system design, sizing, accessibility, and best practices for scalable, consistent digital products.',
  openGraph: {
    title: 'Icon Foundations | Darian Rosebrook',
    description:
      'Learn about icon system design, sizing, accessibility, and best practices for scalable, consistent digital products.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Icon Foundations | Darian Rosebrook',
    description:
      'Learn about icon system design, sizing, accessibility, and best practices for scalable, consistent digital products.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

const IconsPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Icon Foundations</h1>
      <p>
        Icons are a universal language in digital interfaces, providing quick
        visual recognition and enhancing usability. This section covers icon
        system design, sizing conventions, accessibility considerations, and
        implementation best practices.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default IconsPage;
