#!/usr/bin/env node

/**
 * Component Visibility Validation Script
 *
 * Validates components against acceptance criteria defined in
 * COMPONENT_VISIBILITY_CRITERIA.md to determine if they are
 * visible in the documentation pages.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const COMPONENTS_DIR = path.join(PROJECT_ROOT, 'ui', 'components');
const MODULES_DIR = path.join(PROJECT_ROOT, 'ui', 'modules');
const TRANSFORMED_JSON = path.join(
  PROJECT_ROOT,
  'app',
  'blueprints',
  'component-standards',
  'components-transformed.json'
);

// VisibilityReport structure:
// {
//   component: string,
//   slug: string,
//   status: string,
//   tier1: { passed: boolean, issues: string[], checks: Record<string, boolean> },
//   tier2: { passed: boolean, issues: string[], checks: Record<string, boolean> },
//   tier3: { passed: boolean, issues: string[], checks: Record<string, boolean> },
//   tier4: { passed: boolean, issues: string[], checks: Record<string, boolean> },
//   overall: 'visible' | 'partial' | 'not-visible',
//   score: number,
//   maxScore: number
// }

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(color, msg) {
  console.log(color + msg + colors.reset);
}

function checkTier1(component) {
  const issues = [];
  const checks = {};

  // A1: Component Status & Path
  checks.status = component.status === 'Built';
  if (!checks.status) {
    issues.push(`Status is "${component.status}" but should be "Built"`);
  }

  checks.hasPath = !!component.paths?.component;
  if (!checks.hasPath) {
    issues.push('Missing paths.component');
  }

  let pathExists = false;
  if (component.paths?.component) {
    const componentPath = path.resolve(PROJECT_ROOT, component.paths.component);
    pathExists = fs.existsSync(componentPath);
    checks.pathExists = pathExists;
    if (!pathExists) {
      issues.push(
        `Component path does not exist: ${component.paths.component}`
      );
    }
  } else {
    checks.pathExists = false;
  }

  // A2: Component File Structure
  const requiredFiles = [];
  if (pathExists && component.paths?.component) {
    const componentPath = path.resolve(PROJECT_ROOT, component.paths.component);
    const componentName = path.basename(componentPath);
    requiredFiles.push('index.tsx');
    requiredFiles.push(`${componentName}.tsx`);
    requiredFiles.push(`${componentName}.module.scss`);

    requiredFiles.forEach((file) => {
      const filePath = path.join(componentPath, file);
      const exists = fs.existsSync(filePath);
      checks[`file_${file}`] = exists;
      if (!exists) {
        issues.push(`Missing required file: ${file}`);
      }
    });
  }

  // A3: Component Export
  if (pathExists && component.paths?.component) {
    const componentPath = path.resolve(PROJECT_ROOT, component.paths.component);
    const indexPath = path.join(componentPath, 'index.tsx');
    if (fs.existsSync(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      const hasDefaultExport = /export\s+(default\s+)?.*from/.test(
        indexContent
      );
      checks.hasDefaultExport = hasDefaultExport;
      if (!hasDefaultExport) {
        issues.push('index.tsx missing default export');
      }
    } else {
      checks.hasDefaultExport = false;
    }
  } else {
    checks.hasDefaultExport = false;
  }

  const passed = Object.values(checks).every((v) => v === true);

  return { passed, issues, checks };
}

function checkTier2(component) {
  const issues = [];
  const checks = {};

  if (!component.paths?.component) {
    return { passed: false, issues: ['No component path'], checks };
  }

  const componentPath = path.resolve(PROJECT_ROOT, component.paths.component);
  if (!fs.existsSync(componentPath)) {
    return { passed: false, issues: ['Component path does not exist'], checks };
  }

  const componentName = path.basename(componentPath);

  // A4: Component Contract
  const contractPath = path.join(
    componentPath,
    `${componentName}.contract.json`
  );
  if (fs.existsSync(contractPath)) {
    try {
      const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
      checks.hasContract = true;
      checks.contractHasName = !!contract.name;
      checks.contractHasLayer = !!contract.layer;
      checks.contractHasA11y = !!contract.a11y;
      checks.contractHasTokens = !!contract.tokens;
      checks.contractHasAnatomy = !!contract.anatomy;

      if (!checks.contractHasName) issues.push('Contract missing name');
      if (!checks.contractHasLayer) issues.push('Contract missing layer');
      if (!checks.contractHasA11y) issues.push('Contract missing a11y');
      if (!checks.contractHasTokens) issues.push('Contract missing tokens');
      if (!checks.contractHasAnatomy) issues.push('Contract missing anatomy');
    } catch (e) {
      checks.hasContract = true;
      checks.contractValid = false;
      issues.push(`Contract file is invalid JSON: ${e.message}`);
    }
  } else {
    checks.hasContract = false;
    issues.push('Missing contract file (recommended)');
  }

  // A5: Design Tokens
  const tokensPath = path.join(componentPath, `${componentName}.tokens.json`);
  const generatedPath = path.join(
    componentPath,
    `${componentName}.tokens.generated.scss`
  );

  if (fs.existsSync(tokensPath)) {
    checks.hasTokens = true;
    checks.hasGeneratedTokens = fs.existsSync(generatedPath);
    if (!checks.hasGeneratedTokens) {
      issues.push('Tokens file exists but generated SCSS is missing');
    }
  } else {
    checks.hasTokens = false;
    checks.hasGeneratedTokens = false;
    // Not an issue, tokens are optional
  }

  // A6: Component README
  const readmePath = path.join(componentPath, 'README.md');
  if (fs.existsSync(readmePath)) {
    checks.hasReadme = true;
    const readme = fs.readFileSync(readmePath, 'utf8');
    checks.readmeHasContent = readme.length > 100;
    if (!checks.readmeHasContent) {
      issues.push('README exists but has minimal content');
    }
  } else {
    checks.hasReadme = false;
    checks.readmeHasContent = false;
    issues.push('Missing README.md (recommended)');
  }

  const passed = Object.values(checks)
    .filter((v) => v !== undefined)
    .every((v) => v === true);

  return { passed, issues, checks };
}

function checkTier3(component) {
  const issues = [];
  const checks = {};

  if (!component.paths?.component) {
    return { passed: false, issues: ['No component path'], checks };
  }

  const componentPath = path.resolve(PROJECT_ROOT, component.paths.component);
  if (!fs.existsSync(componentPath)) {
    return { passed: false, issues: ['Component path does not exist'], checks };
  }

  const componentName = path.basename(componentPath);

  // A7: Component Rendering (basic check)
  const mainFile = path.join(componentPath, `${componentName}.tsx`);
  if (fs.existsSync(mainFile)) {
    const content = fs.readFileSync(mainFile, 'utf8');
    checks.hasMainFile = true;
    checks.hasReactImport =
      /import.*React/.test(content) || /from\s+['"]react['"]/.test(content);
    // More flexible export detection - handles various patterns:
    // - export default function Component
    // - export default const Component
    // - const Component: React.FC = ...
    // - export default Component
    // - export function Component
    const hasComponentExport =
      /export\s+(default\s+)?(function|const|class)\s+\w+/.test(content) ||
      /export\s+default/.test(content) ||
      /const\s+\w+\s*[:=]\s*(React\.FC|React\.FunctionComponent)/.test(
        content
      ) ||
      /^\s*const\s+\w+\s*[:=]\s*React\./.test(content) || // const Component: React.FC
      /export\s+(const|function|class)\s+\w+/.test(content);
    checks.hasComponentExport = hasComponentExport;

    if (!checks.hasReactImport)
      issues.push('Main component file missing React import');
    if (!checks.hasComponentExport)
      issues.push('Main component file missing component export');
  } else {
    checks.hasMainFile = false;
    checks.hasReactImport = false;
    checks.hasComponentExport = false;
    issues.push('Missing main component file');
  }

  // A8: Example Project Generation (check if component has custom generator)
  // This is checked by looking at componentExamples.ts
  const examplesPath = path.join(
    PROJECT_ROOT,
    'app',
    'blueprints',
    'component-standards',
    '_lib',
    'componentExamples.ts'
  );
  if (fs.existsSync(examplesPath)) {
    const examplesContent = fs.readFileSync(examplesPath, 'utf8');
    const hasCustomGenerator = new RegExp(
      `case\\s+['"]${component.component}['"]`
    ).test(examplesContent);
    checks.hasCustomExampleGenerator = hasCustomGenerator;
    if (!hasCustomGenerator) {
      issues.push(
        'Using generic example generator (custom generator recommended)'
      );
    }
  } else {
    checks.hasCustomExampleGenerator = false;
  }

  // A9: Variant Grid Generation
  if (fs.existsSync(examplesPath)) {
    const examplesContent = fs.readFileSync(examplesPath, 'utf8');
    const hasCustomVariantGrid = new RegExp(
      `case\\s+['"]${component.component}['"]`
    ).test(examplesContent);
    checks.hasCustomVariantGrid = hasCustomVariantGrid;
    // Not critical, will use default
  } else {
    checks.hasCustomVariantGrid = false;
  }

  // A10: Controls Generation
  if (fs.existsSync(examplesPath)) {
    const examplesContent = fs.readFileSync(examplesPath, 'utf8');
    const hasCustomControls = new RegExp(
      `case\\s+['"]${component.component}['"]`
    ).test(examplesContent);
    checks.hasCustomControls = hasCustomControls;
    // Not critical, will use default
  } else {
    checks.hasCustomControls = false;
  }

  // For tier 3, we're more lenient - if basic rendering works, it passes
  const passed =
    checks.hasMainFile && checks.hasReactImport && checks.hasComponentExport;

  return { passed, issues, checks };
}

function checkTier4(component) {
  const issues = [];
  const checks = {};

  if (!component.paths?.component) {
    return { passed: false, issues: ['No component path'], checks };
  }

  const componentPath = path.resolve(PROJECT_ROOT, component.paths.component);
  if (!fs.existsSync(componentPath)) {
    return { passed: false, issues: ['Component path does not exist'], checks };
  }

  const componentName = path.basename(componentPath);

  // A11: Accessibility Compliance
  const contractPath = path.join(
    componentPath,
    `${componentName}.contract.json`
  );
  if (fs.existsSync(contractPath)) {
    try {
      const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
      if (contract.a11y) {
        checks.hasA11yRole = !!contract.a11y.role;
        checks.hasA11yKeyboard = !!contract.a11y.keyboard;
        checks.hasA11yLabeling = !!contract.a11y.labeling;

        if (!checks.hasA11yRole) issues.push('Contract missing a11y.role');
        if (!checks.hasA11yKeyboard && component.status === 'Built') {
          issues.push(
            'Contract missing a11y.keyboard (recommended for interactive components)'
          );
        }
        if (!checks.hasA11yLabeling) {
          issues.push('Contract missing a11y.labeling (recommended)');
        }
      } else {
        checks.hasA11yRole = false;
        checks.hasA11yKeyboard = false;
        checks.hasA11yLabeling = false;
        issues.push('Contract missing a11y section');
      }
    } catch (e) {
      issues.push(`Cannot read contract: ${e.message}`);
    }
  } else {
    checks.hasA11yRole = false;
    checks.hasA11yKeyboard = false;
    checks.hasA11yLabeling = false;
    issues.push('Missing contract file (cannot validate a11y)');
  }

  // A12: Component Tests
  const testPath = path.join(
    componentPath,
    'tests',
    `${componentName}.test.tsx`
  );
  if (fs.existsSync(testPath)) {
    checks.hasTests = true;
    const testContent = fs.readFileSync(testPath, 'utf8');
    checks.testsHaveDescribe = /describe\s*\(/.test(testContent);
    checks.testsHaveRender = /render\s*\(/.test(testContent);

    if (!checks.testsHaveDescribe)
      issues.push('Test file missing describe block');
    if (!checks.testsHaveRender) issues.push('Test file missing render test');
  } else {
    checks.hasTests = false;
    checks.testsHaveDescribe = false;
    checks.testsHaveRender = false;
    issues.push('Missing test file (recommended)');
  }

  // A13: TypeScript Types
  const mainFile = path.join(componentPath, `${componentName}.tsx`);
  if (fs.existsSync(mainFile)) {
    const content = fs.readFileSync(mainFile, 'utf8');
    checks.hasPropsType = /export\s+(interface|type)\s+.*Props/i.test(content);
    checks.hasComponentType =
      /React\.FC|React\.FunctionComponent|function\s+\w+/.test(content);

    if (!checks.hasPropsType)
      issues.push('Component missing Props type export');
    if (!checks.hasComponentType)
      issues.push('Component missing proper type definition');
  } else {
    checks.hasPropsType = false;
    checks.hasComponentType = false;
  }

  // Tier 4 is about best practices, so we're lenient
  const passed = true; // Always pass tier 4, but report issues

  return { passed, issues, checks };
}

function calculateOverall(tier1, tier2, tier3, tier4) {
  // Scoring: Tier 1 = 40%, Tier 2 = 30%, Tier 3 = 20%, Tier 4 = 10%
  const tier1Score = tier1.passed ? 40 : 0;
  const tier2Score = tier2.passed ? 30 : tier2.checks.hasContract ? 15 : 0;
  const tier3Score = tier3.passed ? 20 : tier3.checks.hasMainFile ? 10 : 0;
  const tier4Score = tier4.passed ? 10 : 0;

  const score = tier1Score + tier2Score + tier3Score + tier4Score;
  const maxScore = 100;

  let overall;
  if (tier1.passed && tier2.passed && tier3.passed) {
    overall = 'visible';
  } else if (tier1.passed) {
    overall = 'partial';
  } else {
    overall = 'not-visible';
  }

  return { overall, score, maxScore };
}

function validateComponent(component) {
  const tier1 = checkTier1(component);
  const tier2 = checkTier2(component);
  const tier3 = checkTier3(component);
  const tier4 = checkTier4(component);
  const { overall, score, maxScore } = calculateOverall(
    tier1,
    tier2,
    tier3,
    tier4
  );

  return {
    component: component.component,
    slug: component.slug,
    status: component.status,
    tier1,
    tier2,
    tier3,
    tier4,
    overall,
    score,
    maxScore,
  };
}

function printReport(report) {
  const statusColors = {
    visible: colors.green,
    partial: colors.yellow,
    'not-visible': colors.red,
  };

  const statusIcon = {
    visible: '🟢',
    partial: '🟡',
    'not-visible': '🔴',
  };

  log(
    colors.bold + colors.cyan,
    `\n${statusIcon[report.overall]} ${report.component} (${report.slug})`
  );
  log(
    statusColors[report.overall],
    `   Status: ${report.status} | Visibility: ${report.overall.toUpperCase()} | Score: ${report.score}/${report.maxScore}`
  );

  if (!report.tier1.passed) {
    log(colors.red, '   ❌ Tier 1 (Basic Visibility) - FAILED');
    report.tier1.issues.forEach((issue) => log(colors.red, `      • ${issue}`));
  } else {
    log(colors.green, '   ✅ Tier 1 (Basic Visibility) - PASSED');
  }

  if (report.tier2.issues.length > 0) {
    log(
      colors.yellow,
      `   ⚠️  Tier 2 (Documentation) - ${report.tier2.passed ? 'PASSED' : 'ISSUES'}`
    );
    report.tier2.issues.forEach((issue) =>
      log(colors.yellow, `      • ${issue}`)
    );
  } else {
    log(colors.green, '   ✅ Tier 2 (Documentation) - PASSED');
  }

  if (report.tier3.issues.length > 0) {
    log(
      colors.yellow,
      `   ⚠️  Tier 3 (Interactive Examples) - ${report.tier3.passed ? 'PASSED' : 'ISSUES'}`
    );
    report.tier3.issues.forEach((issue) =>
      log(colors.yellow, `      • ${issue}`)
    );
  } else {
    log(colors.green, '   ✅ Tier 3 (Interactive Examples) - PASSED');
  }

  if (report.tier4.issues.length > 0) {
    log(
      colors.yellow,
      `   ⚠️  Tier 4 (Best Practices) - ${report.tier4.passed ? 'PASSED' : 'ISSUES'}`
    );
    report.tier4.issues.forEach((issue) =>
      log(colors.yellow, `      • ${issue}`)
    );
  } else {
    log(colors.green, '   ✅ Tier 4 (Best Practices) - PASSED');
  }
}

function main() {
  log(colors.bold + colors.blue, '\n🔍 Component Visibility Validation\n');

  if (!fs.existsSync(TRANSFORMED_JSON)) {
    log(
      colors.red,
      `❌ Cannot find components-transformed.json at ${TRANSFORMED_JSON}`
    );
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(TRANSFORMED_JSON, 'utf8'));
  const components = data.components || [];

  log(colors.cyan, `Found ${components.length} components\n`);

  const reports = [];
  const byStatus = { visible: 0, partial: 0, 'not-visible': 0 };

  for (const component of components) {
    const report = validateComponent(component);
    reports.push(report);
    byStatus[report.overall]++;
  }

  // Print all reports
  reports.forEach((report) => {
    printReport(report);
  });

  // Summary
  log(colors.bold + colors.cyan, '\n📊 Summary');
  log(colors.green, `   🟢 Fully Visible: ${byStatus.visible}`);
  log(colors.yellow, `   🟡 Partially Visible: ${byStatus.partial}`);
  log(colors.red, `   🔴 Not Visible: ${byStatus['not-visible']}`);

  const avgScore =
    reports.reduce((sum, r) => sum + r.score, 0) / reports.length;
  log(colors.cyan, `   📈 Average Score: ${avgScore.toFixed(1)}/100`);

  // Exit with error if any components are not visible
  const hasNotVisible = byStatus['not-visible'] > 0;
  process.exit(hasNotVisible ? 1 : 0);
}

main();
