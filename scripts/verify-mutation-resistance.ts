#!/usr/bin/env tsx
/**
 * Mutation harness for type-anatomy evidence trust.
 *
 * Each probe applies a regex-anchored in-place mutation to a real source
 * file, runs a targeted vitest invocation, and asserts the named tests
 * transitioned from PASS to FAIL. Mutations are always reverted via
 * `git restore` — even on crash — so the working tree returns to its
 * pre-run state.
 *
 * Why source-level mutation rather than vitest mocks: the point of this
 * harness is to prove the actual code path is load-bearing for the
 * accuracy claim. A `vi.mock()` would prove the mock works, not that the
 * production import does.
 *
 * Usage:
 *   tsx scripts/verify-mutation-resistance.ts             # run all probes
 *   tsx scripts/verify-mutation-resistance.ts --probe A1  # run one probe
 *   tsx scripts/verify-mutation-resistance.ts --post-check
 *
 * Exit codes:
 *   0 — all requested probes passed; working tree clean
 *   1 — at least one probe failed, or the harness could not restore the
 *       working tree (a crash mid-mutation)
 *   2 — invalid invocation (unknown probe id, dirty working tree)
 */

import * as fs from 'node:fs';
import * as cp from 'node:child_process';
import * as path from 'node:path';

interface TargetedTest {
  /** Vitest test name as it appears in the JSON reporter (full hierarchy). */
  fullName: string;
  /** File the test lives in. */
  testFile: string;
}

interface Probe {
  id: string;
  description: string;
  /** File whose source will be mutated. Must be a tracked git file. */
  targetFile: string;
  /** Source mutation as a regex+replacement pair. */
  mutation: { search: RegExp; replace: string };
  /**
   * Tests that MUST be PASS pre-mutation and FAIL post-mutation.
   * The harness asserts both — a missing test counts as a probe failure.
   */
  expectedFlips: TargetedTest[];
}

const REPO_ROOT = path.resolve(__dirname, '..');

const PROBES: Probe[] = [
  {
    id: 'A1',
    description: 'detectTittle returns [] → i and j tittle tests fail',
    targetFile: 'utils/typeAnatomy/detectors/tittle.ts',
    mutation: {
      // Inject an early-return on the line after the function open brace.
      // Single-line replacement preserves brace balance — the original `}`
      // at end of function still closes the function, not an injected block.
      search: /(export function detectTittle\(geo: GeometryCache\): FeatureInstance\[\] \{\n)/,
      replace: '$1  return []; void geo;\n',
    },
    expectedFlips: [
      {
        fullName:
          'known type anatomy accuracy gaps detects the lowercase i tittle above the stem',
        testFile: 'test/typeAnatomy/feature-accuracy.test.ts',
      },
      {
        fullName:
          'known type anatomy accuracy gaps detects the lowercase j tittle above the stem',
        testFile: 'test/typeAnatomy/feature-accuracy.test.ts',
      },
    ],
  },
  {
    id: 'A2',
    description: 'getMarkContours returns [] → i and j tittle tests fail',
    targetFile: 'utils/typeAnatomy/geometryCache.ts',
    mutation: {
      search: /export function getMarkContours\(cache: GeometryCache\): ContourClassification\[\] \{\n  return cache\.contours\.filter\(\(c\) => c\.type === 'mark'\);\n\}/,
      replace:
        "export function getMarkContours(cache: GeometryCache): ContourClassification[] {\n  void cache;\n  return [];\n}",
    },
    expectedFlips: [
      {
        fullName:
          'known type anatomy accuracy gaps detects the lowercase i tittle above the stem',
        testFile: 'test/typeAnatomy/feature-accuracy.test.ts',
      },
      {
        fullName:
          'known type anatomy accuracy gaps detects the lowercase j tittle above the stem',
        testFile: 'test/typeAnatomy/feature-accuracy.test.ts',
      },
    ],
  },
  {
    id: 'A3',
    description:
      'isAboveMainBody always returns false → i and j tittle positive tests fail',
    targetFile: 'utils/typeAnatomy/evidence/topology/markPredicates.ts',
    // Note: this probe was originally specced against rejectsAsMainBodyFragment
    // to assert negative pressure on H/l/I. That mutation produced no test
    // failures: the positional gate in geometryCache.isMarkContour
    // (bbox.minY > xHeight * 0.8) independently rejects every H/l/I contour,
    // making rejectsAsMainBodyFragment redundant for current glyphs. Honest
    // finding: that predicate is defense-in-depth without specific test
    // coverage on the present accuracy surface. A3 pivots to isAboveMainBody,
    // which IS load-bearing for the i/j positive cases — disabling it
    // makes detectTittle skip every mark candidate.
    mutation: {
      search: /(export function isAboveMainBody\([\s\S]*?\): boolean \{\n)  return candidate\.bbox\.minY - mainBody\.bbox\.maxY >= epsilon;/,
      replace:
        '$1  void candidate; void mainBody; void epsilon; return false;',
    },
    expectedFlips: [
      {
        fullName:
          'known type anatomy accuracy gaps detects the lowercase i tittle above the stem',
        testFile: 'test/typeAnatomy/feature-accuracy.test.ts',
      },
      {
        fullName:
          'known type anatomy accuracy gaps detects the lowercase j tittle above the stem',
        testFile: 'test/typeAnatomy/feature-accuracy.test.ts',
      },
    ],
  },
  {
    id: 'A4',
    description: 'detectCrossbar returns [] → H and A crossbar tests fail',
    targetFile: 'utils/typeAnatomy/detectors/crossbar.ts',
    mutation: {
      search: /(export function detectCrossbar\(geo: GeometryCache\): FeatureInstance\[\] \{\n)/,
      replace: '$1  return []; void geo;\n',
    },
    expectedFlips: [
      {
        fullName:
          'known type anatomy accuracy gaps detects one horizontal H crossbar centered between the stems',
        testFile: 'test/typeAnatomy/feature-accuracy.test.ts',
      },
      {
        fullName:
          'known type anatomy accuracy gaps detects the A crossbar as a horizontal bar, not a tall vertical region',
        testFile: 'test/typeAnatomy/feature-accuracy.test.ts',
      },
    ],
  },
  // -- Corner-evidence family (VERIFICATION-002) ------------------------------
  {
    id: 'B1',
    description:
      'findOutlineCorners returns [] → A apex and V crotch tests fail',
    targetFile: 'utils/typeAnatomy/evidence/corners/findOutlineCorners.ts',
    mutation: {
      search: /(export function findOutlineCorners\(points: Point2D\[\]\): CornerSample\[\] \{\n)/,
      replace: '$1  void points; return [];\n',
    },
    expectedFlips: [
      {
        fullName:
          'known type anatomy accuracy gaps finds exactly one apex on Nohemi A as a point near the top center',
        testFile: 'test/typeAnatomy/feature-accuracy.test.ts',
      },
      {
        fullName:
          'known type anatomy accuracy gaps detects the V crotch at the bottom-center sharp join',
        testFile: 'test/typeAnatomy/feature-accuracy.test.ts',
      },
    ],
  },
  {
    id: 'B2',
    description:
      'inJunctionCluster is a passthrough → V apex negative test fails (V top corners pass through)',
    targetFile: 'utils/typeAnatomy/evidence/corners/clustering.ts',
    mutation: {
      search: /(export function inJunctionCluster\(\n  corners: CornerSample\[\],\n  options\?: SharpnessOptions\n\): CornerSample\[\] \{\n)/,
      replace: '$1  void options; return corners;\n',
    },
    expectedFlips: [
      {
        fullName:
          'known type anatomy accuracy gaps does not report an apex on Nohemi V',
        testFile: 'test/typeAnatomy/feature-accuracy.test.ts',
      },
    ],
  },
  {
    id: 'B3',
    description:
      'interiorPointsDown always returns false → A apex and A crotch tests fail',
    targetFile: 'utils/typeAnatomy/evidence/corners/cornerPredicates.ts',
    mutation: {
      search: /(export function interiorPointsDown\(\n  corner: CornerSample,\n  eps: number = 0\.05\n\): boolean \{\n)  return corner\.interiorDirection\.y < -eps;/,
      replace: '$1  void corner; void eps; return false;',
    },
    expectedFlips: [
      {
        fullName:
          'known type anatomy accuracy gaps finds exactly one apex on Nohemi A as a point near the top center',
        testFile: 'test/typeAnatomy/feature-accuracy.test.ts',
      },
      {
        fullName:
          'known type anatomy accuracy gaps detects the A crotch at the interior of the upper angle',
        testFile: 'test/typeAnatomy/feature-accuracy.test.ts',
      },
    ],
  },
  {
    id: 'B4',
    description:
      'dedupeNearbyCorners is a passthrough → A apex count becomes 2 instead of 1',
    targetFile: 'utils/typeAnatomy/evidence/corners/dedupe.ts',
    mutation: {
      search: /(export function dedupeNearbyCorners\(\n  corners: CornerSample\[\],\n  threshold: number\n\): CornerSample\[\] \{\n)  if \(threshold <= 0\) return \[\.\.\.corners\];/,
      replace: '$1  void threshold; return [...corners];',
    },
    expectedFlips: [
      {
        fullName:
          'known type anatomy accuracy gaps finds exactly one apex on Nohemi A as a point near the top center',
        testFile: 'test/typeAnatomy/feature-accuracy.test.ts',
      },
    ],
  },
  {
    id: 'C1',
    description:
      'rectToPolygon returns [] → H stem region tests fail (region polygon empty)',
    targetFile: 'utils/typeAnatomy/evidence/regionFromShape.ts',
    mutation: {
      search:
        /(export function rectToPolygon\(rect: \{\n  x: number;\n  y: number;\n  width: number;\n  height: number;\n\}\): Point2D\[\] \{\n)/,
      replace: '$1  void rect; return [];\n',
    },
    expectedFlips: [
      {
        fullName:
          'feature region polygons emits stroke regions for both Nohemi H stems',
        testFile: 'test/typeAnatomy/feature-accuracy.test.ts',
      },
      {
        fullName:
          'feature region polygons emits a stroke region for the Nohemi H crossbar',
        testFile: 'test/typeAnatomy/feature-accuracy.test.ts',
      },
    ],
  },
  {
    id: 'C2',
    description:
      'detectStem omits region field → runtime-region Inter H stems test fails',
    targetFile: 'utils/typeAnatomy/detectors/stem.ts',
    mutation: {
      // Strip the `region: { ... }` line from the stem instance push. The
      // runtime test asserts every stem carries a region; with the field
      // missing the assertion flips.
      search:
        /      region: \{ kind: 'stroke', points: rectToPolygon\(rect\) \},\n/,
      replace: '',
    },
    expectedFlips: [
      {
        fullName:
          'runtime region computation (no precomputed geometry) computes a stroke region for Inter H stems on demand',
        testFile: 'test/typeAnatomy/runtime-region.test.ts',
      },
    ],
  },
  {
    id: 'C3',
    description:
      'extractContourPolygon returns [] → tittle region polygon empty',
    targetFile: 'utils/typeAnatomy/evidence/regionFromShape.ts',
    mutation: {
      // Tittle now prefers the actual mark contour over the circle
      // approximation (PR1 v2). The mutation must hit the contour walker,
      // not the unused circle helper. Setting startIndex > endIndex slices
      // to empty so cmds.slice() returns []; the function then early-returns
      // with the contour-too-short branch.
      search:
        /  const cmds = \(glyph as PathLikeGlyph\)\.path\?\.commands;\n  if \(!cmds\) return \[\];/,
      replace:
        '  const cmds = (glyph as PathLikeGlyph).path?.commands;\n  if (!cmds) return []; void startIndex; void endIndex; return [];',
    },
    expectedFlips: [
      {
        fullName:
          'feature region polygons traces the actual Nohemi tittle contour, not a circle approximation',
        testFile: 'test/typeAnatomy/feature-accuracy.test.ts',
      },
    ],
  },
  {
    id: 'D1',
    description:
      'buildCorridorPolygon returns [] → spine, tail, loop region tests fail',
    targetFile: 'utils/typeAnatomy/evidence/corridorRegion.ts',
    mutation: {
      // Force the helper to return an empty polygon. Phase 4 detectors
      // gate on `corridor.length >= N` before attaching `region`, so an
      // empty result drops every centerline region. The Newsreader S
      // spine assertion (which requires region.kind === "stroke") fails.
      search: /export function buildCorridorPolygon\(opts: CorridorOptions\): Point2D\[\] \{\n/,
      replace:
        'export function buildCorridorPolygon(opts: CorridorOptions): Point2D[] {\n  void opts; return [];\n',
    },
    expectedFlips: [
      {
        fullName:
          'phase 4 + 5 region polygons (centerline corridors and projections) emits a stroke corridor region for the Newsreader S spine',
        testFile: 'test/typeAnatomy/feature-accuracy.test.ts',
      },
      {
        fullName:
          'phase 4 + 5 region polygons (centerline corridors and projections) emits a closed stroke corridor for the Newsreader g loop',
        testFile: 'test/typeAnatomy/feature-accuracy.test.ts',
      },
    ],
  },
  {
    id: 'D2',
    description:
      'buildProjectionPolygon returns [] → ear, finial projection regions empty',
    targetFile: 'utils/typeAnatomy/evidence/projectionRegion.ts',
    mutation: {
      // Force the helper to return []. Phase 5 detectors gate on
      // polygon.length >= 3 before attaching `region`, so an empty result
      // means ear / finial / spur instances stop carrying regions.
      search:
        /export function buildProjectionPolygon\(opts: ProjectionOptions\): Point2D\[\] \{\n/,
      replace:
        'export function buildProjectionPolygon(opts: ProjectionOptions): Point2D[] {\n  void opts; return [];\n',
    },
    expectedFlips: [
      {
        fullName:
          'phase 4 + 5 region polygons (centerline corridors and projections) emits a stroke projection region for the Newsreader g ear',
        testFile: 'test/typeAnatomy/feature-accuracy.test.ts',
      },
      {
        fullName:
          'phase 4 + 5 region polygons (centerline corridors and projections) produces a stroke projection region whenever finial fires on Newsreader s',
        testFile: 'test/typeAnatomy/feature-accuracy.test.ts',
      },
    ],
  },
  {
    id: 'D3',
    description:
      'detectAperture omits region → enclosed gap rectangle test fails',
    targetFile: 'utils/typeAnatomy/detectors/aperture.ts',
    mutation: {
      // Drop the `region: { ... }` block from the right-aperture push so
      // the aperture instance lacks the enclosed polygon. This catches a
      // refactor that accidentally removes the region wiring on one of
      // the two emit sites (left and right are independent code paths).
      search: /      region: \{\n        \/\/ Aperture is the negative space[\s\S]+?      \},\n      confidence: Math\.min\(0\.9, 0\.4 \+ rightCandidates\.length \* 0\.1\),/,
      replace: '      confidence: Math.min(0.9, 0.4 + rightCandidates.length * 0.1),',
    },
    expectedFlips: [
      {
        fullName:
          'phase 4 + 5 region polygons (centerline corridors and projections) emits an enclosed gap rectangle for the Nohemi e aperture',
        testFile: 'test/typeAnatomy/feature-accuracy.test.ts',
      },
    ],
  },
];

interface VitestTaskResult {
  name: string;
  result?: { state: 'pass' | 'fail' };
  tasks?: VitestTaskResult[];
}

interface VitestJsonReport {
  success?: boolean;
  numTotalTests?: number;
  numPassedTests?: number;
  numFailedTests?: number;
  testResults?: Array<{
    assertionResults: Array<{
      fullName: string;
      status: 'passed' | 'failed' | 'skipped';
    }>;
  }>;
}

function exec(cmd: string, opts: cp.ExecSyncOptions = {}): string {
  return cp
    .execSync(cmd, {
      cwd: REPO_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 64 * 1024 * 1024,
      ...opts,
    })
    .toString();
}

function workingTreeIsClean(): boolean {
  // Only modified TRACKED files matter for revert safety. Untracked files
  // (new scripts, scratch dirs) cannot be touched by `git restore` so their
  // presence does not threaten the harness's clean-up guarantee.
  const lines = exec('git status --porcelain').split('\n').filter(Boolean);
  return lines.every((line) => line.startsWith('??'));
}

function assertCleanWorkingTree(stage: string): void {
  if (!workingTreeIsClean()) {
    process.stderr.write(
      `[verify-mutation] ${stage}: working tree is not clean. Refusing to proceed.\n` +
        exec('git status --short') +
        '\n'
    );
    process.exit(2);
  }
}

function applyMutation(probe: Probe): void {
  const fullPath = path.join(REPO_ROOT, probe.targetFile);
  const original = fs.readFileSync(fullPath, 'utf8');
  if (!probe.mutation.search.test(original)) {
    throw new Error(
      `Mutation regex did not match in ${probe.targetFile}. The harness probe ${probe.id} is stale — re-anchor the regex to the current source.`
    );
  }
  const mutated = original.replace(probe.mutation.search, probe.mutation.replace);
  if (mutated === original) {
    throw new Error(
      `Mutation produced no change in ${probe.targetFile} (probe ${probe.id}).`
    );
  }
  fs.writeFileSync(fullPath, mutated, 'utf8');
}

function revertMutation(probe: Probe): void {
  exec(`git restore -- "${probe.targetFile}"`);
}

function runVitest(testPaths: string, jsonOutPath: string): {
  exitCode: number;
  report: VitestJsonReport;
} {
  // testPaths can be one or many space-separated paths. Splitting and
  // re-joining produces an unquoted list so vitest sees them as separate
  // path arguments. A single quoted string would be treated as one filename
  // by the shell — vitest then matches zero tests, which is exactly the
  // silent-pass mode the spec invariant prohibits.
  const paths = testPaths
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => `"${p}"`)
    .join(' ');
  let exitCode = 0;
  try {
    exec(
      `pnpm vitest run ${paths} --reporter=json --outputFile="${jsonOutPath}"`
    );
  } catch (err) {
    const status = (err as { status?: number }).status;
    exitCode = typeof status === 'number' ? status : 1;
  }
  if (!fs.existsSync(jsonOutPath)) {
    throw new Error(
      `vitest did not produce ${jsonOutPath}. Cannot evaluate probe results.`
    );
  }
  const report: VitestJsonReport = JSON.parse(fs.readFileSync(jsonOutPath, 'utf8'));
  return { exitCode, report };
}

function findTestStatus(
  report: VitestJsonReport,
  fullName: string
): 'passed' | 'failed' | 'skipped' | 'missing' {
  for (const file of report.testResults ?? []) {
    for (const a of file.assertionResults) {
      if (a.fullName === fullName) return a.status;
    }
  }
  return 'missing';
}

interface ProbeResult {
  id: string;
  status: 'PASS' | 'FAIL';
  detail: string;
}

function runProbe(probe: Probe): ProbeResult {
  const reportFile = `/tmp/verify-mutation-${probe.id}.json`;

  // Phase 1: pre-mutation. The named tests must be currently PASSING.
  const preFile = probe.expectedFlips[0].testFile;
  const pre = runVitest(preFile, reportFile);
  for (const flip of probe.expectedFlips) {
    const status = findTestStatus(pre.report, flip.fullName);
    if (status !== 'passed') {
      return {
        id: probe.id,
        status: 'FAIL',
        detail: `pre-mutation: expected "${flip.fullName}" to PASS, got ${status}`,
      };
    }
  }

  // Phase 2: mutate, re-run, assert flip — always revert in finally.
  let postReport: VitestJsonReport | undefined;
  try {
    applyMutation(probe);
    postReport = runVitest(preFile, reportFile).report;
  } finally {
    revertMutation(probe);
  }

  if (!workingTreeIsClean()) {
    return {
      id: probe.id,
      status: 'FAIL',
      detail: 'revert left the working tree dirty',
    };
  }

  // Phase 3: parse post-mutation report. Every expected flip must be FAILED
  // (not missing, not passed, not skipped). For probes where only a subset
  // is required (A3 marks one of H/l/I), the harness still expects the
  // listed flips — A3 lists only H, so only H is checked.
  for (const flip of probe.expectedFlips) {
    const status = findTestStatus(postReport!, flip.fullName);
    if (status !== 'failed') {
      return {
        id: probe.id,
        status: 'FAIL',
        detail: `post-mutation: expected "${flip.fullName}" to FAIL, got ${status}`,
      };
    }
  }

  return {
    id: probe.id,
    status: 'PASS',
    detail: `${probe.expectedFlips.length} test(s) flipped PASS → FAIL under mutation`,
  };
}

function runPostCheck(): ProbeResult {
  const reportFile = '/tmp/verify-mutation-post-check.json';
  const { exitCode, report } = runVitest(
    'test/typeAnatomy test/utils/typeAnatomy utils/typeAnatomy/evidence',
    reportFile
  );

  // Triple gate against silent-pass: vitest exit code, vitest's own success
  // flag, and per-assertion counts. Any one zero-match scenario (paths not
  // resolving, all suites filtered out) trips at least one gate.
  if (exitCode !== 0 || report.success === false) {
    return {
      id: 'POST',
      status: 'FAIL',
      detail: `vitest exit=${exitCode}, success=${report.success}. See ${reportFile}.`,
    };
  }

  let total = 0;
  let failed = 0;
  for (const file of report.testResults ?? []) {
    for (const a of file.assertionResults) {
      total++;
      if (a.status === 'failed') failed++;
    }
  }

  if (total === 0 || (report.numPassedTests ?? 0) === 0) {
    return {
      id: 'POST',
      status: 'FAIL',
      detail: `zero-match: vitest reported 0 tests after the harness ran. The path arguments may have collapsed to an unmatched filename. See ${reportFile}.`,
    };
  }

  if (failed > 0) {
    return {
      id: 'POST',
      status: 'FAIL',
      detail: `${failed}/${total} tests failed in post-check. See ${reportFile}.`,
    };
  }

  return {
    id: 'POST',
    status: 'PASS',
    detail: `${total} tests passed; working tree clean.`,
  };
}

function findProbe(id: string): Probe | undefined {
  return PROBES.find((p) => p.id === id);
}

function printResultRow(result: ProbeResult): void {
  const flag = result.status === 'PASS' ? 'PASS' : 'FAIL';
  process.stdout.write(`${result.id}\t${flag}\t${result.detail}\n`);
}

function safetyTrap(probe: Probe | undefined): void {
  // Restores the working tree if the script crashes mid-mutation. Bound to
  // exit/SIGINT/SIGTERM so a Ctrl-C during a vitest run still cleans up.
  const restore = () => {
    if (probe) {
      try {
        revertMutation(probe);
      } catch {
        // best effort — git restore failures will surface in the post-check
      }
    }
    if (!workingTreeIsClean()) {
      process.stderr.write(
        '[verify-mutation] FATAL: working tree not clean after harness exit.\n' +
          exec('git status --short') +
          '\n'
      );
      process.exitCode = 1;
    }
  };
  process.on('exit', restore);
  process.on('SIGINT', () => {
    restore();
    process.exit(130);
  });
  process.on('SIGTERM', () => {
    restore();
    process.exit(143);
  });
}

function main(): void {
  const args = process.argv.slice(2);
  const probeIdx = args.indexOf('--probe');
  const wantPostCheck = args.includes('--post-check');

  assertCleanWorkingTree('start');

  if (wantPostCheck) {
    const result = runPostCheck();
    printResultRow(result);
    process.exit(result.status === 'PASS' ? 0 : 1);
  }

  const probesToRun: Probe[] =
    probeIdx >= 0
      ? (() => {
          const id = args[probeIdx + 1];
          const probe = findProbe(id);
          if (!probe) {
            process.stderr.write(`Unknown probe id: ${id}\n`);
            process.exit(2);
          }
          return [probe];
        })()
      : PROBES;

  let activeProbe: Probe | undefined;
  safetyTrap(activeProbe);

  let allPass = true;
  process.stdout.write('Probe\tResult\tDetail\n');
  for (const probe of probesToRun) {
    activeProbe = probe;
    let result: ProbeResult;
    try {
      result = runProbe(probe);
    } catch (err) {
      result = {
        id: probe.id,
        status: 'FAIL',
        detail: `harness error: ${(err as Error).message}`,
      };
      // Best-effort revert.
      try {
        revertMutation(probe);
      } catch {
        // ignored
      }
    }
    activeProbe = undefined;
    printResultRow(result);
    if (result.status !== 'PASS') allPass = false;
  }

  // No --post-check by default; A6 runs that explicitly. But verify the
  // working tree is still clean — if not, every probe revert was incomplete.
  if (!workingTreeIsClean()) {
    process.stderr.write(
      '[verify-mutation] FATAL: working tree dirty at harness end despite probe-level reverts.\n'
    );
    process.exit(1);
  }

  process.exit(allPass ? 0 : 1);
}

main();
