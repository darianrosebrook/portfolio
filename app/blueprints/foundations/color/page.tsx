import styles from './page.module.scss';

const ColorPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Color Foundations</h1>
      <p>
        Color is one of the most powerful tools in design, serving multiple
        purposes from establishing brand identity to providing visual hierarchy
        and ensuring accessibility. This section covers the principles and
        practices of creating a robust color system.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default ColorPage;
