import type { Article } from '@/types';
import { z } from 'zod';

export interface DraftIdentity {
  id: number;
  slug: string;
}

export interface NewDraftRecovery {
  version: 1;
  ownerId: string;
  article: Partial<Article>;
  identity: DraftIdentity | null;
  savedFingerprint: string | null;
}

/** Only editable fields belong to the revision; server timestamps do not. */
export function draftFingerprint(article: Partial<Article>): string {
  return JSON.stringify({
    articleBody: article.articleBody,
    headline: article.headline,
    description: article.description,
    keywords: article.keywords,
    articleSection: article.articleSection,
    image: article.image,
    slug: article.slug,
    wordCount: article.wordCount,
  });
}

const text = z.string().nullable().optional();
const recoveryArticle = z.object({
  slug: z.string().optional(),
  headline: text,
  description: text,
  image: text,
  keywords: text,
  articleSection: text,
  wordCount: z.number().int().nonnegative().nullable().optional(),
  articleBody: z.unknown().optional(),
});

function isContentNode(value: unknown, depth = 0): boolean {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    depth > 100
  )
    return false;
  const node = value as Record<string, unknown>;
  if (typeof node.type !== 'string' || !node.type) return false;
  if (node.text !== undefined && typeof node.text !== 'string') return false;
  if (node.type === 'text' && typeof node.text !== 'string') return false;
  if (
    node.attrs !== undefined &&
    (!node.attrs || typeof node.attrs !== 'object' || Array.isArray(node.attrs))
  )
    return false;
  if (
    node.marks !== undefined &&
    (!Array.isArray(node.marks) ||
      !node.marks.every((mark) => isContentNode(mark, depth + 1)))
  )
    return false;
  return (
    node.content === undefined ||
    (Array.isArray(node.content) &&
      node.content.every((child) => isContentNode(child, depth + 1)))
  );
}

/** Account-scoped envelopes are the only automatic recovery authority. */
export function parseNewDraftRecovery(
  raw: string,
  ownerId: string
): NewDraftRecovery {
  const value = JSON.parse(raw);
  if (value?.version !== 1 || value.ownerId !== ownerId) {
    throw new Error('The saved draft does not belong to this account.');
  }
  const article = recoveryArticle.parse(value.article);
  if (
    article.articleBody != null &&
    (!isContentNode(article.articleBody) ||
      (article.articleBody as { type: string }).type !== 'doc')
  ) {
    throw new Error('The saved draft body is invalid.');
  }
  const identity =
    value.identity == null
      ? null
      : z
          .object({
            id: z.number().int().positive(),
            slug: z.string().min(1),
          })
          .parse(value.identity);
  // Persisted role/status/author and server fields are never local authority.
  return {
    version: 1,
    ownerId,
    article: {
      ...article,
      articleBody: article.articleBody as Article['articleBody'],
      status: 'draft',
      ...(identity ? { id: identity.id } : {}),
    },
    identity,
    savedFingerprint:
      typeof value.savedFingerprint === 'string'
        ? value.savedFingerprint
        : null,
  };
}
