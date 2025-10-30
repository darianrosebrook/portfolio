/**
 * @deprecated Use createEditorExtensions from './extensionsRegistry' instead
 * This file is kept for backward compatibility but will be removed in a future version
 */
import { createEditorExtensions } from './extensionsRegistry';

/**
 * Creates optimized Tiptap extensions configuration
 * This function was part of the bundle optimization to reduce initial load
 *
 * @deprecated Use createEditorExtensions from './extensionsRegistry' instead
 */
export const createExtensions = (articleId?: number) => {
  return createEditorExtensions({ articleId });
};
