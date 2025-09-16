export const CATEGORY_MAP: Record<string, string> = {
  Form: 'Inputs',
  Input: 'Inputs',
  Navigation: 'Navigation',
  Display: 'Displays',
  Layout: 'Layout',
  Feedback: 'Feedback',
  Action: 'Actions',
};

export const ORDERED_GROUPS = [
  'Actions',
  'Inputs',
  'Displays',
  'Feedback',
  'Navigation',
  'Layout',
] as const;

export type GroupKey = (typeof ORDERED_GROUPS)[number];

export function normalizeCategory(raw?: string): GroupKey | 'Other' {
  if (!raw) return 'Other';
  const mapped = CATEGORY_MAP[raw] ?? raw;
  if ((ORDERED_GROUPS as readonly string[]).includes(mapped)) {
    return mapped as GroupKey;
  }
  return 'Other';
}
