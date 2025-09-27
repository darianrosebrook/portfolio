/**
 * Schema Utilities
 *
 * Zod validation schemas for articles, case studies, and other data structures.
 */

// Article schemas
export {
  articleSchema,
  createArticleSchema,
  updateArticleSchema,
} from './article.schema';

// Case study schemas
export {
  caseStudySchema,
  createCaseStudySchema,
  updateCaseStudySchema,
} from './case-study.schema';
