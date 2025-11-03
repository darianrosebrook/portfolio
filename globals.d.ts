import { vi } from 'vitest';

declare global {
  const vi: typeof vi;
}

// Allow importing .playground files (resolved by webpack to .playground.ts)
declare module '*.playground' {
  const content: any;
  export default content;
}
