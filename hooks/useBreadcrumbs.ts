import { usePathname } from 'next/navigation';

export type Crumb = {
  label: string;
  href: string;
};

export interface UseBreadcrumbsOptions {
  base: Crumb;
  labelMap?: Record<string, string>;
}

/**
 * Custom hook for building breadcrumbs from the current pathname
 */
export function useBreadcrumbs({ base, labelMap = {} }: UseBreadcrumbsOptions) {
  const pathname = usePathname();

  const toTitle = (slug: string) =>
    slug
      .split('-')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ');

  const buildCrumbs = (): Crumb[] => {
    const parts = (pathname ?? '').split('/').filter(Boolean);
    const idx = parts.findIndex((p) => p === 'foundations');
    if (idx === -1) return [];

    const tail = parts.slice(idx + 1); // segments after "foundations"
    const acc: Crumb[] = [];
    let href = base.href;

    for (const seg of tail) {
      href += `/${seg}`;
      const label = labelMap[seg] ?? toTitle(seg);
      acc.push({ label, href });
    }

    return acc;
  };

  return buildCrumbs();
}
