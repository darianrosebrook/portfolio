// app/page.tsx
/**
 * Metadata for the /blueprints/foundations/typography page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Typography Foundations | Darian Rosebrook',
  description:
    'Explore typographic scales, font stacks, and best practices for accessible, expressive typography in design systems.',
  openGraph: {
    title: 'Typography Foundations | Darian Rosebrook',
    description:
      'Explore typographic scales, font stacks, and best practices for accessible, expressive typography in design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Typography Foundations | Darian Rosebrook',
    description:
      'Explore typographic scales, font stacks, and best practices for accessible, expressive typography in design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};
import { FontInspector } from '@/components/FontInspector'; // adjust path if needed

export default function Page() {
  return <FontInspector />;
}
