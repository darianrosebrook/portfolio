import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

export type Crumb = {
  label: string;
  href: string;
};

export interface UseBreadcrumbsOptions {
  base: Crumb;
  labelMap?: Record<string, string>;
}

/**
 * Converts a URL slug to a title case label
 */
const toTitle = (slug: string): string =>
  slug
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');

/**
 * Custom hook for building breadcrumbs from the current pathname
 * Memoized to prevent unnecessary recalculations on re-renders
 */
export function useBreadcrumbs({ base, labelMap = {} }: UseBreadcrumbsOptions) {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    const parts = (pathname ?? '').split('/').filter(Boolean);

    // Extract the base segment from the base href
    // e.g., "/blueprints/foundations" -> "foundations"
    // e.g., "/blueprints/component-standards" -> "component-standards"
    const baseSegments = base.href.split('/').filter(Boolean);
    const baseSegment = baseSegments[baseSegments.length - 1];

    const idx = parts.findIndex((p) => p === baseSegment);
    if (idx === -1) return [];

    const tail = parts.slice(idx + 1); // segments after base segment
    const acc: Crumb[] = [];
    let href = base.href;

    for (const seg of tail) {
      href += `/${seg}`;
      const label = labelMap[seg] ?? toTitle(seg);
      acc.push({ label, href });
    }

    return acc;
  }, [pathname, base.href, labelMap]);

  return breadcrumbs;
}
