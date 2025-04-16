import styles from './page.module.scss';

const AtomicVsSemanticPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Atomic vs Semantic Tokens</h1>
      <p>
        Understanding the balance between atomic and semantic tokens is key to
        creating a flexible yet maintainable design system. This section
        explores the differences between raw value tokens and purpose-driven
        semantic tokens, helping you create a system that balances flexibility
        with clarity.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default AtomicVsSemanticPage;
