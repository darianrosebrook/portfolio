import styles from './page.module.scss';

const CodeToolingPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Code Tooling</h1>
      <p>
        Code tooling ensures your design tokens and components are implemented
        consistently and efficiently. This section covers tools like Style
        Dictionary, Tailwind token syncing, and accessibility linters that help
        maintain code quality and consistency across your codebase.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default CodeToolingPage;
