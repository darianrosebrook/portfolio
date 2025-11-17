import styles from './page.module.scss';

/**
 * Metadata for the /blueprints/foundations/radius page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Radius & Shape Foundations | Darian Rosebrook',
  description:
    'Learn how to create a consistent system of border radius and shapes for brand identity, usability, and accessibility in design systems.',
  openGraph: {
    title: 'Radius & Shape Foundations | Darian Rosebrook',
    description:
      'Learn how to create a consistent system of border radius and shapes for brand identity, usability, and accessibility in design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Radius & Shape Foundations | Darian Rosebrook',
    description:
      'Learn how to create a consistent system of border radius and shapes for brand identity, usability, and accessibility in design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

const RadiusPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Radius & Shape Foundations</h1>
      <p>
        Border radius and shape tokens define the visual personality of your
        interface. This section covers how to create a consistent system of
        rounded corners and shapes that align with your brand identity while
        maintaining usability and accessibility.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default RadiusPage;
