import styles from './page.module.scss';

const SystemVsStylePage: React.FC = () => {
  return (
    <section className="content">
      <h1>System vs Style</h1>
      <p>
        A successful design system balances foundational system logic with brand
        style layers. This section helps you distinguish between these layers,
        enabling your design system to scale effectively while preserving your
        brand&apos;s unique identity and personality.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default SystemVsStylePage;
