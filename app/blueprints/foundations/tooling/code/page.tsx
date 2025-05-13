/**
 * Metadata for the /blueprints/foundations/tooling/code page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Code Tooling | Darian Rosebrook',
  description:
    'Discover code-side tools like Style Dictionary, Tailwind token syncing, and accessibility linters for robust design system implementation.',
  openGraph: {
    title: 'Code Tooling | Darian Rosebrook',
    description:
      'Discover code-side tools like Style Dictionary, Tailwind token syncing, and accessibility linters for robust design system implementation.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Code Tooling | Darian Rosebrook',
    description:
      'Discover code-side tools like Style Dictionary, Tailwind token syncing, and accessibility linters for robust design system implementation.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

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
