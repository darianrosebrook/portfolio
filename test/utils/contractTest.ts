import { it } from 'vitest';

/**
 * Links a test assertion to a specific behavioral field obligation in a component
 * contract. The traceability checker (scripts/check-contract-traceability.mjs)
 * scans test files for these calls to verify that high-risk obligations
 * (focus.strategy=trap, dismissal.triggers containing escape) have test coverage.
 *
 * Signature: contractTest(componentName, contractField, contractValue, fn)
 *
 * The field argument may include a disambiguation suffix after '/':
 *   contractTest('Dialog', 'focus.wrap', 'true/Tab-forward', ...)
 * The checker strips the suffix and matches on the base field name.
 */
export function contractTest(
  componentName: string,
  contractField: string,
  contractValue: string,
  fn: () => void | Promise<void>
): void {
  it(`[contract] ${componentName}: ${contractField} = ${contractValue}`, fn);
}
