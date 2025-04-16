import styles from './page.module.scss';

const TypographyPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Typography Foundations</h1>
      <p>
        Typography is the art and technique of arranging type to make written
        language legible, readable, and appealing. This section covers how to
        create a typographic system that supports both aesthetic and functional
        needs across your product.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default TypographyPage;
