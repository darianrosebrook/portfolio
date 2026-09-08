import type { Article, CaseStudy } from '@/types';

type RecordType = Article | CaseStudy;
export const draftFields = [
  'articleBody',
  'headline',
  'description',
  'image',
  'keywords',
  'articleSection',
  'wordCount',
  'slug',
  'published_at',
] as const;
export type DraftSnapshot = Pick<RecordType, (typeof draftFields)[number]>;

export function draftSnapshot(record: RecordType): DraftSnapshot {
  return Object.fromEntries(
    draftFields.map((key) => [key, record[key] ?? null])
  ) as DraftSnapshot;
}

export function draftFingerprint(record: RecordType | DraftSnapshot): string {
  return contentFingerprint(draftSnapshot(record as RecordType));
}

export function recoveryKey(entity: string, record: RecordType): string {
  return `content-recovery:v1:${record.author}:${entity}:${record.id}`;
}

export function readRecovery(
  storage: Storage,
  key: string
): DraftSnapshot | null {
  const raw = storage.getItem(key);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const value = parsed as Record<string, unknown>;
    if (value.version !== 1 || !value.draft || typeof value.draft !== 'object')
      return null;
    const draft = value.draft as Record<string, unknown>;
    if (typeof draft.slug !== 'string') return null;
    for (const field of [
      'headline',
      'description',
      'image',
      'keywords',
      'articleSection',
      'published_at',
    ]) {
      if (draft[field] !== null && typeof draft[field] !== 'string')
        return null;
    }
    if (draft.wordCount !== null && typeof draft.wordCount !== 'number')
      return null;
    if (
      draft.articleBody !== null &&
      (typeof draft.articleBody !== 'object' ||
        (draft.articleBody as { type?: unknown }).type !== 'doc')
    )
      return null;
    // Only editable content crosses the recovery boundary; identity and status
    // always come from the authenticated server record.
    return draftSnapshot(draft as unknown as RecordType);
  } catch {
    return null;
  }
}

export function writeRecovery(
  storage: Storage,
  key: string,
  record: RecordType
): void {
  storage.setItem(
    key,
    JSON.stringify({ version: 1, draft: draftSnapshot(record) })
  );
}

export function acknowledgeRecovery(
  storage: Storage,
  key: string,
  saved: RecordType
): void {
  const current = readRecovery(storage, key);
  // A slow acknowledgement must never remove a newer local revision.
  if (current && draftFingerprint(current) === draftFingerprint(saved))
    storage.removeItem(key);
}

export function toLocalDateTime(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** JSON object key order is not significant (database JSON columns may reorder it). */
export function contentFingerprint(value: unknown): string {
  return JSON.stringify(value, (_key, item) => {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      return Object.fromEntries(
        Object.keys(item)
          .sort()
          .map((key) => [key, item[key]])
      );
    }
    return item;
  });
}
