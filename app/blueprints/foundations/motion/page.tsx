import styles from './page.module.scss';

/**
 * Metadata for the /blueprints/foundations/motion page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Motion & Duration Foundations | Darian Rosebrook',
  description:
    'Learn how to create meaningful, accessible motion and animation systems that reinforce brand and usability in design systems.',
  openGraph: {
    title: 'Motion & Duration Foundations | Darian Rosebrook',
    description:
      'Learn how to create meaningful, accessible motion and animation systems that reinforce brand and usability in design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Motion & Duration Foundations | Darian Rosebrook',
    description:
      'Learn how to create meaningful, accessible motion and animation systems that reinforce brand and usability in design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

const MotionPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Motion & Duration Foundations</h1>
      <p>
        Motion brings interfaces to life, providing feedback and enhancing
        usability. This section covers how to create meaningful animations that
        respect user preferences, support accessibility, and reinforce your
        brand&apos;s personality.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default MotionPage;
