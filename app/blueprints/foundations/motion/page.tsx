import styles from './page.module.scss';

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
