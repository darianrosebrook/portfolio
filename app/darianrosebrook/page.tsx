import { Metadata } from 'next';

/**
 * Page description
 * @param props - Page props containing params and searchParams
 * @returns JSX element for the PageName page
 */
export default function Page() {
  return (
    <main>
      <h1>Darian Rosebrook</h1>
      <p>This is a test page</p>
    </main>
  );
}

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description for SEO',
};
