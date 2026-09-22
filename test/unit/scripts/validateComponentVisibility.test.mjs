import { describe, it, expect } from 'vitest';
import path from 'path';
import {
  checkTier1,
  validateComponent,
  calculateOverall,
} from '../../../scripts/validateComponentVisibility.mjs';

/**
 * Unit contract for the component visibility gate. Exit semantics:
 * Planned registry entries are roadmap and reported informationally —
 * they never drive the verdict. A Built entry is gate-failing
 * ('not-visible') only when Tier 1 fails, and Tier 1 checks the
 * on-disk conventions: index.ts or index.tsx, {Name}.tsx, and
 * {Name}.css or {Name}.module.scss, with a default re-export from the
 * index. Importing this script must not execute its scan (no
 * process.exit at module load).
 */

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..');
const FIXTURES = 'test/fixtures/component-visibility';

function builtEntry(fixture) {
  return {
    component: 'Widget',
    id: 'widget',
    slug: 'widget',
    status: 'Built',
    paths: { component: `${FIXTURES}/${fixture}/Widget` },
  };
}

describe('checkTier1 (on-disk file conventions)', () => {
  it('passes with index.ts + {Name}.css (current repo convention)', () => {
    const tier = checkTier1(builtEntry('full-pass'), ROOT);
    expect(tier.passed, tier.issues.join('; ')).toBe(true);
  });

  it('passes with index.tsx + {Name}.module.scss (legacy convention)', () => {
    const tier = checkTier1(builtEntry('module-scss'), ROOT);
    expect(tier.passed, tier.issues.join('; ')).toBe(true);
  });

  it('fails when no stylesheet exists and names the missing file', () => {
    const tier = checkTier1(builtEntry('missing-css'), ROOT);
    expect(tier.passed).toBe(false);
    const issue = tier.issues.find((i) => i.includes('Missing required file'));
    expect(issue).toBeTruthy();
  });

  it('fails when the index has no default re-export', () => {
    const tier = checkTier1(builtEntry('bad-index'), ROOT);
    expect(tier.passed).toBe(false);
    expect(tier.issues.some((i) => i.toLowerCase().includes('default export'))).toBe(
      true
    );
  });

  it('fails when the component directory does not exist', () => {
    const tier = checkTier1(
      {
        component: 'Ghost',
        slug: 'ghost',
        status: 'Built',
        paths: { component: 'test/fixtures/component-visibility/does-not-exist/Ghost' },
      },
      ROOT
    );
    expect(tier.passed).toBe(false);
  });
});

describe('verdict semantics', () => {
  it('never marks a Planned entry not-visible', () => {
    const report = validateComponent({
      component: 'Roadmap',
      slug: 'roadmap',
      status: 'Planned',
      paths: {},
    });
    expect(report.overall).not.toBe('not-visible');
  });

  it('marks a Built entry not-visible on Tier-1 failure', () => {
    const report = validateComponent(builtEntry('missing-css'));
    expect(report.overall).toBe('not-visible');
  });

  it('treats Tier 2/3 issues as report-only for a Tier-1-passing Built entry', () => {
    const tier1 = { passed: true, issues: [], checks: {} };
    const tier2 = {
      passed: false,
      issues: ['no contract'],
      checks: { hasContract: false },
    };
    const tier3 = { passed: false, issues: ['no example'], checks: {} };
    const tier4 = { passed: true, issues: [], checks: {} };
    const { overall } = calculateOverall(tier1, tier2, tier3, tier4);
    expect(overall).not.toBe('not-visible');
  });
});
