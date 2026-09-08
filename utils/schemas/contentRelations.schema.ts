import { z } from 'zod';
import { RELATIONSHIP_TYPES } from '@/utils/supabase/contentRelations';

export const relationshipTypeEnum = z.enum(RELATIONSHIP_TYPES);

export const contentTypeEnum = z.enum(['article', 'case-study']);

/** One relation as submitted by the RelatedContentPicker. */
export const relatedContentInputSchema = z.object({
  id: z.number().int().positive(),
  type: contentTypeEnum,
  title: z.string().max(500).optional(),
  slug: z.string().max(500).nullable().optional(),
  relationship_type: relationshipTypeEnum.optional(),
});

/** PUT body for the per-content relations routes. */
export const syncRelationsSchema = z.object({
  items: z.array(relatedContentInputSchema).max(50),
});
