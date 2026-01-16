import Link from 'next/link';
import components from './components-transformed.json';
import styles from './page.module.scss';

const ComponentStandardsPage: React.FC = () => {
  return (
    <>
      <section className="content">
        <h1>Component Standards</h1>
        <p>
          Component standards ensure every UI element in your system is robust,
          accessible, and consistent. Explore anatomy, props, accessibility,
          states, and usage guidelines to create components that scale and serve
          diverse user needs.
        </p>
      </section>

      <section className="content">
        <h2>Component Complexity Methodology</h2>
        <p>
          Our layered approach to component architecture ensures scalability,
          maintainability, and clear separation of concerns. Each layer has
          distinct responsibilities and characteristics that guide how
          components should be designed and implemented.
        </p>
        <div className={styles.standardsList}>
          {[
            {
              title: 'Component Layers Overview',
              desc: 'Understanding the four-layer architecture: primitives, compounds, composers, and assemblies.',
              href: '/blueprints/component-standards/component-complexity',
            },
            {
              title: 'Component Status Matrix',
              desc: 'View the status, documentation, and implementation details of all components in the design system.',
              href: '/blueprints/component-standards/status',
            },
          ].map(({ title, desc, href }) => (
            <div key={title}>
              <h3>{title}</h3>
              <p>{desc}</p>
              <Link href={href}>Explore {title} →</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="content">
        <h2>Standards Categories</h2>
        <div className={styles.standardsList}>
          {[
            {
              title: 'Anatomy',
              desc: 'Break down components into their core parts for clarity and consistency.',
              href: '/blueprints/component-standards/anatomy',
            },
            {
              title: 'Props & API',
              desc: 'Document and standardize component properties, events, and slots.',
              href: '/blueprints/component-standards/props',
            },
            {
              title: 'Accessibility',
              desc: 'Ensure every component meets accessibility requirements and best practices.',
              href: '/blueprints/component-standards/accessibility',
            },
            {
              title: 'States & Variants',
              desc: 'Define and show all interactive states and visual variants.',
              href: '/blueprints/component-standards/states',
            },
            {
              title: 'Usage Guidelines',
              desc: "Provide dos and don'ts, usage examples, and contextual recommendations.",
              href: '/blueprints/component-standards/usage',
            },
          ].map(({ title, desc, href }) => (
            <div key={title}>
              <h3>{title}</h3>
              <p>{desc}</p>
              <Link href={href}>Explore {title} →</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="content">
        <h2>Component Library</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Component</th>
                <th>Description</th>
                <th>Category</th>
                <th>Documentation Status</th>
              </tr>
            </thead>
            <tbody>
              {components.components.map((component) => (
                <tr key={component.component}>
                  <td>
                    <div className={styles.componentName}>
                      <Link
                        href={`/blueprints/component-standards/${component.slug}`}
                        className={styles.componentLink}
                      >
                        {component.component}
                      </Link>
                    </div>
                    <div className={styles.alternativeNames}>
                      {component.alternativeNames.slice(0, 3).join(', ')}
                      {component.alternativeNames.length > 3 && '...'}
                    </div>
                  </td>
                  <td>{component.description}</td>
                  <td>
                    <span className={`${styles.badge} ${styles.category}`}>
                      {component.category}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`${styles.badge} ${styles[component.status.toLowerCase()]}`}
                    >
                      {component.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};

export default ComponentStandardsPage;
