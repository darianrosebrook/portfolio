import styles from './page.module.scss';

const AccessibilityPhilosophyPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Accessibility Philosophy & Practice</h1>
      <p>
        Accessibility is more than a checklist—it&apos;s a mindset that enhances
        design decision-making and expands usability for everyone. This section
        explores how to frame accessibility as a design constraint that leads to
        better, more inclusive products.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default AccessibilityPhilosophyPage;
