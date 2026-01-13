// Re-export fontkit types - webpack will mark fontkit as external for client bundles
// so this won't trigger module resolution. We use dynamic import at runtime.
export type { Font, Glyph } from 'fontkit';
