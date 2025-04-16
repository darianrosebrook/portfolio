import styles from './page.module.scss';

const AssistiveTechPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Assistive Technology Support</h1>
      <p>
        Supporting assistive technologies is crucial for creating inclusive
        experiences. This section covers best practices for screen readers,
        keyboard navigation, and other assistive tools, including proper
        semantics, ARIA usage, and focus management.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default AssistiveTechPage;
