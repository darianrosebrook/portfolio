import styles from './page.module.scss';

const AccessibilityToolingPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Accessibility Tooling</h1>
      <p>
        The right tools can help you maintain and improve accessibility
        throughout your development process. This section covers tools like
        axe-core, Lighthouse, and Figma plugins that help test, validate, and
        enforce accessibility at every stage of your workflow.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default AccessibilityToolingPage;
