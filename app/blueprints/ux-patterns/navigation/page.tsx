import styles from './page.module.scss';

const NavigationPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Navigation Patterns</h1>
      <p>
        Navigation patterns are the foundation of user movement through your
        application. This section will cover best practices for menus,
        breadcrumbs, tabs, and other navigation components that help users find
        their way.
      </p>
      <div className={styles.placeholder}>
        <p>Content coming soon...</p>
      </div>
    </section>
  );
};

export default NavigationPage;
