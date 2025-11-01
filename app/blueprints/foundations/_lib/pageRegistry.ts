/**
 * Simple registry of foundation pages
 * Used for track learning paths and cross-references
 */

export interface FoundationPageInfo {
  slug: string;
  title: string;
  path: string;
}

export const foundationPages: FoundationPageInfo[] = [
  { slug: 'philosophy', title: 'Philosophy of Design Systems', path: 'philosophy' },
  { slug: 'tokens', title: 'Design Tokens Foundations', path: 'tokens' },
  { slug: 'accessibility', title: 'Accessibility as System Infrastructure', path: 'accessibility/philosophy' },
  { slug: 'spacing', title: 'Spacing & Layout Systems', path: 'spacing' },
  { slug: 'component-architecture', title: 'Component Architecture Basics', path: 'component-architecture' },
];

export function getAllFoundationPages(): FoundationPageInfo[] {
  return foundationPages;
}

export function getFoundationPageBySlug(slug: string): FoundationPageInfo | undefined {
  return foundationPages.find((page) => page.slug === slug);
}

