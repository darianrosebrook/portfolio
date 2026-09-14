/**
 * Type declarations for jest-axe.
 *
 * jest-axe 11 ships no types of its own, so TypeScript previously fell back to
 * `@types/jest-axe`. That package begins with `/// <reference types="jest" />`
 * and declares `@types/jest` as a dependency, which pulled `@types/jest@30`
 * into the program. `@types/jest` declares a global `expect` that collides with
 * the one from `vitest/globals`, so in test files with no explicit vitest import
 * TypeScript bound `expect` to the Jest declaration and typed it as
 * `JestMatchers<T>` — an interface `@testing-library/jest-dom` never augments.
 * The result was ~591 TS2339 errors for every jest-dom matcher.
 *
 * Declaring the real surface here keeps jest-axe typed without dragging the Jest
 * global types in. This is a script/ambient file on purpose: it must not gain a
 * top-level import or export, or it would stop being an ambient declaration.
 */
declare module 'jest-axe' {
  type AxeRun = (
    element: Element | string,
    options?: unknown
  ) => Promise<import('axe-core').AxeResults>;

  export function configureAxe(options?: {
    rules?: Record<string, { enabled: boolean }>;
  }): AxeRun;

  /** jest-axe 11 export that @types/jest-axe never declared. */
  export const axe: AxeRun;

  export const toHaveNoViolations: {
    toHaveNoViolations(results: Partial<import('axe-core').AxeResults>): {
      pass: boolean;
      message: () => string;
    };
  };
}
