import styles from './page.module.scss';

const AccessibilityTokensPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Token-Level Accessibility</h1>
      <p>
        Building accessibility into your design system starts at the token
        level. This section covers how to create tokens that support color
        contrast, motion sensitivity, spacing for legibility, and focus states,
        ensuring accessibility is baked into your system from the ground up.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default AccessibilityTokensPage;
