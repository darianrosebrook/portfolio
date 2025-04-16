import styles from './page.module.scss';

const TokenNamingPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Token Naming & Hierarchy</h1>
      <p>
        A well-structured token naming system is crucial for maintaining clarity
        and scalability in your design system. This section covers how to
        organize tokens into core, semantic, and component-level layers,
        ensuring consistent naming conventions that work across platforms and
        themes.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default TokenNamingPage;
