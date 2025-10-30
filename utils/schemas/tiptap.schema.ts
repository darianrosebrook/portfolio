/**
 * Zod schema for TipTap JSONContent
 * Provides runtime validation for TipTap document structure
 */

import { z } from 'zod';
import type { JSONContent } from '@tiptap/react';

/**
 * Recursive schema for TipTap JSONContent
 * Validates the structure of TipTap documents
 */
const jsonContentSchema: z.ZodType<JSONContent> = z.lazy(() =>
  z.object({
    type: z.string(),
    attrs: z.record(z.string(), z.unknown()).optional(),
    content: z.array(jsonContentSchema).optional(),
    marks: z
      .array(
        z.object({
          type: z.string(),
          attrs: z.record(z.string(), z.unknown()).optional(),
        })
      )
      .optional(),
    text: z.string().optional(),
  })
) as z.ZodType<JSONContent>;

/**
 * Validates that content is a valid TipTap JSONContent document
 * Requires type to be 'doc' for root document
 */
export function validateJSONContent(content: unknown): content is JSONContent {
  try {
    const parsed = jsonContentSchema.parse(content);
    // Root document must have type 'doc'
    if (typeof parsed === 'object' && parsed !== null && 'type' in parsed) {
      return parsed.type === 'doc';
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Zod schema for articleBody field
 * Accepts null or valid JSONContent with type 'doc'
 */
export const articleBodySchema = z
  .union([
    jsonContentSchema.refine((val) => val.type === 'doc', {
      message: 'Root document must have type "doc"',
    }),
    z.null(),
  ])
  .nullable()
  .refine((val) => val === null || validateJSONContent(val), {
    message: 'Invalid TipTap JSONContent structure',
  });
