/**
 * Registers the jest-axe matcher on Vitest's assertion types.
 *
 * `expect.extend(toHaveNoViolations)` in test/setup.ts installs the matcher at
 * runtime; this declaration makes it visible to the type checker. The previous
 * `@types/jest-axe` package only augmented the `jest` namespace, which Vitest 5
 * does not consume.
 *
 * This is deliberately a module (it has an import), not an ambient script:
 * `declare module 'vitest'` only MERGES with Vitest when the file is a module.
 * From an ambient file it would REPLACE the module and break every Vitest
 * export.
 *
 * Vitest 5 declares `Assertion<R, T = unknown>`, so the augmentation goes on
 * `Matchers<R, T>` — Vitest's own extension point — rather than `Assertion`,
 * whose two type parameters make it impossible to re-declare with the one
 * parameter jest-dom's own `/vitest` entry assumes.
 */
import 'vitest';

declare module 'vitest' {
  // The parameter name `T` must stay identical to Vitest's own
  // `Matchers<R, T>` or TypeScript refuses to merge the declarations
  // (TS2428). It is deliberately unused by the matcher added here.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Matchers<R, T = unknown> {
    toHaveNoViolations(): R;
  }
}
