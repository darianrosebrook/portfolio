import { createEditorExtensions } from './extensionsRegistry';

/**
 * Backward-compatible entry point. The registry is the sole extension source so
 * editor, preview, and server rendering cannot silently drift.
 */
export const createExtensions = (articleId?: number) =>
  createEditorExtensions({ articleId });
