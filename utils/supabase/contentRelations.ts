/**
 * Semantic content linking between articles and case studies.
 *
 * Backed by the `content_relations` edge table (one directed row per declared
 * relation). A row means "source is {relationship_type} target" — backlinks
 * are discovered by querying the target side, never by writing a mirrored
 * reverse row. RLS on the table: public read, authenticated write.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { sanitizeIlikeQuery } from '@/utils/helpers/postgrestFilter';

export type ContentType = 'article' | 'case-study';

export const RELATIONSHIP_TYPES = [
  'related',
  'elaborates',
  'example',
  'prerequisite',
  'follow-up',
] as const;

export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

export const DEFAULT_RELATIONSHIP_TYPE: RelationshipType = 'related';

export interface RelationshipMeta {
  /** Option label for picker UI. */
  label: string;
  /** Rendered on the source's page, pointing at the target. */
  forwardVerb: string;
  /** Rendered on the target's page for the backlink. */
  reverseVerb: string;
}

export const RELATIONSHIP_META: Record<RelationshipType, RelationshipMeta> = {
  related: {
    label: 'Related',
    forwardVerb: 'Related to',
    reverseVerb: 'Related to',
  },
  elaborates: {
    label: 'Elaborates',
    forwardVerb: 'Elaborates on',
    reverseVerb: 'Elaborated on by',
  },
  example: {
    label: 'Example',
    forwardVerb: 'Example of',
    reverseVerb: 'Has example',
  },
  prerequisite: {
    label: 'Prerequisite',
    forwardVerb: 'Builds on',
    reverseVerb: 'Prerequisite for',
  },
  'follow-up': {
    label: 'Follow-up',
    forwardVerb: 'Follow-up to',
    reverseVerb: 'Continued by',
  },
};

/** Public URL for a content item. Case studies render under /work. */
export function contentHref(type: ContentType, slug: string | null): string {
  if (!slug) return '#';
  return type === 'article' ? `/articles/${slug}` : `/work/${slug}`;
}

export interface ContentSearchResult {
  id: number;
  type: ContentType;
  title: string;
  slug: string | null;
  description: string | null;
  status: string | null;
}

/** A relation hydrated with its endpoint's display fields. */
export interface RelatedContentItem {
  id: number;
  type: ContentType;
  title: string;
  slug: string | null;
  description?: string | null;
  relationship_type: RelationshipType;
}

export interface ContentRelationRow {
  id: number;
  source_id: number;
  source_type: string;
  target_id: number;
  target_type: string;
  relationship_type: string | null;
  created_at: string | null;
}

interface ContentRowLite {
  id: number;
  headline: string | null;
  slug: string;
  description: string | null;
  status: string | null;
  author: string | null;
}

const CONTENT_SELECT = 'id, headline, slug, description, status, author';

function isContentType(value: string): value is ContentType {
  return value === 'article' || value === 'case-study';
}

function normalizeRelationshipType(
  value: string | null | undefined
): RelationshipType {
  return (RELATIONSHIP_TYPES as readonly string[]).includes(value ?? '')
    ? (value as RelationshipType)
    : DEFAULT_RELATIONSHIP_TYPE;
}

function tableFor(type: ContentType): 'articles' | 'case_studies' {
  return type === 'article' ? 'articles' : 'case_studies';
}

export interface SearchContentOptions {
  /** Never return this item (used to exclude the item being edited). */
  excludeId?: number;
  excludeType?: ContentType;
  limit?: number;
  /** When set, the caller's own drafts are included alongside published rows. */
  userId?: string;
}

/**
 * Cross-type title search over articles and case studies.
 *
 * Visibility: published content is always returned; drafts only when they
 * belong to `userId`. Queries shorter than 2 characters return nothing.
 */
export async function searchContent(
  supabase: SupabaseClient,
  query: string,
  options: SearchContentOptions = {}
): Promise<ContentSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const { excludeId, excludeType, limit = 8, userId } = options;
  const sanitized = sanitizeIlikeQuery(trimmed);
  if (!sanitized) return [];
  const pattern = `%${sanitized}%`;

  const [articlesRes, caseStudiesRes] = await Promise.all([
    supabase
      .from('articles')
      .select(CONTENT_SELECT)
      .ilike('headline', pattern)
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(limit),
    supabase
      .from('case_studies')
      .select(CONTENT_SELECT)
      .ilike('headline', pattern)
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(limit),
  ]);

  if (articlesRes.error || caseStudiesRes.error) {
    const error = articlesRes.error ?? caseStudiesRes.error;
    console.error('Content search error:', JSON.stringify(error, null, 2));
    return [];
  }

  const visible = (rows: ContentRowLite[], type: ContentType) =>
    rows
      .filter((row) => row.status === 'published' || row.author === userId)
      .filter((row) => !(excludeId === row.id && excludeType === type))
      .map((row) => ({
        id: row.id,
        type,
        title: row.headline ?? '',
        slug: row.slug,
        description: row.description,
        status: row.status,
      }));

  return [
    ...visible((articlesRes.data ?? []) as ContentRowLite[], 'article'),
    ...visible((caseStudiesRes.data ?? []) as ContentRowLite[], 'case-study'),
  ].slice(0, limit);
}

async function fetchContentByIds(
  supabase: SupabaseClient,
  type: ContentType,
  ids: number[]
): Promise<Map<number, ContentRowLite>> {
  const map = new Map<number, ContentRowLite>();
  if (ids.length === 0) return map;

  const { data, error } = await supabase
    .from(tableFor(type))
    .select(CONTENT_SELECT)
    .in('id', ids);

  if (error) {
    console.error(
      `Content fetch error (${type}):`,
      JSON.stringify(error, null, 2)
    );
    return map;
  }

  for (const row of (data ?? []) as ContentRowLite[]) {
    map.set(row.id, row);
  }
  return map;
}

async function hydrateEdges(
  supabase: SupabaseClient,
  edges: ContentRelationRow[],
  endpoint: 'source' | 'target'
): Promise<RelatedContentItem[]> {
  const idsByType = new Map<ContentType, number[]>();
  for (const edge of edges) {
    const rawType = endpoint === 'source' ? edge.source_type : edge.target_type;
    if (!isContentType(rawType)) continue;
    const id = endpoint === 'source' ? edge.source_id : edge.target_id;
    const ids = idsByType.get(rawType) ?? [];
    if (!ids.includes(id)) ids.push(id);
    idsByType.set(rawType, ids);
  }

  const rowsByType = new Map<ContentType, Map<number, ContentRowLite>>();
  for (const [type, ids] of idsByType) {
    rowsByType.set(type, await fetchContentByIds(supabase, type, ids));
  }

  const items: RelatedContentItem[] = [];
  for (const edge of edges) {
    const rawType = endpoint === 'source' ? edge.source_type : edge.target_type;
    if (!isContentType(rawType)) continue;
    const id = endpoint === 'source' ? edge.source_id : edge.target_id;
    const row = rowsByType.get(rawType)?.get(id);
    // Endpoint no longer exists — leave it to orphan cleanup rather than
    // surfacing dead items in the UI.
    if (!row) continue;
    items.push({
      id: row.id,
      type: rawType,
      title: row.headline ?? '',
      slug: row.slug,
      description: row.description,
      relationship_type: normalizeRelationshipType(edge.relationship_type),
    });
  }
  return items;
}

/** Relations this item declares (outgoing edges). */
export async function getRelations(
  supabase: SupabaseClient,
  id: number,
  type: ContentType
): Promise<RelatedContentItem[]> {
  const { data, error } = await supabase
    .from('content_relations')
    .select('*')
    .eq('source_id', id)
    .eq('source_type', type)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Relations fetch error:', JSON.stringify(error, null, 2));
    return [];
  }

  return hydrateEdges(supabase, (data ?? []) as ContentRelationRow[], 'target');
}

/** Items that declare a relation pointing at this item (incoming edges). */
export async function getBacklinks(
  supabase: SupabaseClient,
  id: number,
  type: ContentType
): Promise<RelatedContentItem[]> {
  const { data, error } = await supabase
    .from('content_relations')
    .select('*')
    .eq('target_id', id)
    .eq('target_type', type)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Backlinks fetch error:', JSON.stringify(error, null, 2));
    return [];
  }

  return hydrateEdges(supabase, (data ?? []) as ContentRelationRow[], 'source');
}

export interface SyncRelationsInput {
  id: number;
  type: ContentType;
  title?: string;
  slug?: string | null;
  relationship_type?: RelationshipType;
}

/**
 * Replace the full set of relations an item declares.
 *
 * Deletes only edges where this item is the source, then inserts the new
 * set — edges other items declared are never touched. Self-links and
 * duplicate (id, type) pairs are dropped.
 */
export async function syncRelations(
  supabase: SupabaseClient,
  id: number,
  type: ContentType,
  items: SyncRelationsInput[]
): Promise<{ synced: number; error: string | null }> {
  const seen = new Set<string>();
  const rows = items
    .filter((item) => !(item.id === id && item.type === type))
    .filter((item) => {
      const key = `${item.type}:${item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((item) => ({
      source_id: id,
      source_type: type,
      target_id: item.id,
      target_type: item.type,
      relationship_type: normalizeRelationshipType(item.relationship_type),
    }));

  const { error: deleteError } = await supabase
    .from('content_relations')
    .delete()
    .eq('source_id', id)
    .eq('source_type', type);

  if (deleteError) {
    console.error(
      'Relations delete error:',
      JSON.stringify(deleteError, null, 2)
    );
    return { synced: 0, error: deleteError.message };
  }

  if (rows.length > 0) {
    const { error: insertError } = await supabase
      .from('content_relations')
      .insert(rows);

    if (insertError) {
      console.error(
        'Relations insert error:',
        JSON.stringify(insertError, null, 2)
      );
      return { synced: 0, error: insertError.message };
    }
  }

  return { synced: rows.length, error: null };
}

export interface CleanupResult {
  checked: number;
  removed: number;
  errors: string[];
}

/**
 * Remove edges whose endpoints no longer exist.
 *
 * Batched existence checks per content type (two queries total, not N+1),
 * then one delete per orphaned edge. Portfolio-scale data; favor clarity.
 */
export async function cleanupOrphanedRelations(
  supabase: SupabaseClient
): Promise<CleanupResult> {
  const result: CleanupResult = { checked: 0, removed: 0, errors: [] };

  const { data: edges, error } = await supabase
    .from('content_relations')
    .select('id, source_id, source_type, target_id, target_type');

  if (error) {
    result.errors.push(error.message);
    return result;
  }

  const all = (edges ?? []) as Pick<
    ContentRelationRow,
    'id' | 'source_id' | 'source_type' | 'target_id' | 'target_type'
  >[];
  result.checked = all.length;
  if (all.length === 0) return result;

  const idsByType = new Map<ContentType, Set<number>>();
  const collect = (rawType: string, id: number) => {
    if (!isContentType(rawType)) return;
    const set = idsByType.get(rawType) ?? new Set<number>();
    set.add(id);
    idsByType.set(rawType, set);
  };
  for (const edge of all) {
    collect(edge.source_type, edge.source_id);
    collect(edge.target_type, edge.target_id);
  }

  const existing = new Map<ContentType, Set<number>>();
  for (const [type, ids] of idsByType) {
    const rows = await fetchContentByIds(supabase, type, [...ids]);
    existing.set(type, new Set(rows.keys()));
  }

  const endpointExists = (rawType: string, id: number): boolean => {
    if (!isContentType(rawType)) return false;
    return existing.get(rawType)?.has(id) ?? false;
  };

  for (const edge of all) {
    if (
      endpointExists(edge.source_type, edge.source_id) &&
      endpointExists(edge.target_type, edge.target_id)
    ) {
      continue;
    }

    const { error: deleteError } = await supabase
      .from('content_relations')
      .delete()
      .eq('id', edge.id);

    if (deleteError) {
      result.errors.push(`edge ${edge.id}: ${deleteError.message}`);
    } else {
      result.removed += 1;
    }
  }

  return result;
}

export interface RelationStats {
  totalRelations: number;
  relationsByType: Record<string, number>;
}

export async function getContentRelationStats(
  supabase: SupabaseClient
): Promise<RelationStats> {
  const { data, error } = await supabase
    .from('content_relations')
    .select('relationship_type');

  if (error) {
    console.error('Relation stats error:', JSON.stringify(error, null, 2));
    return { totalRelations: 0, relationsByType: {} };
  }

  const rows = (data ?? []) as { relationship_type: string | null }[];
  const relationsByType: Record<string, number> = {};
  for (const row of rows) {
    const type = normalizeRelationshipType(row.relationship_type);
    relationsByType[type] = (relationsByType[type] ?? 0) + 1;
  }

  return { totalRelations: rows.length, relationsByType };
}
