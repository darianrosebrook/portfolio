import styles from './page.module.scss';

const DesignToolingPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Design Tooling</h1>
      <p>
        Design tooling bridges the gap between design and development, ensuring
        consistency and efficiency in your workflow. This section covers tools
        like Token Studio, Figma variables, and contrast checking plugins that
        help define, test, and maintain design-side foundations.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default DesignToolingPage;
