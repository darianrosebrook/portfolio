/**
 * Verification Script for Foundation Pages
 * Checks adherence to content guidelines and success metrics
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const foundationPages = [
  { path: 'philosophy', slug: 'philosophy' },
  { path: 'tokens', slug: 'tokens' },
  { path: 'accessibility/philosophy', slug: 'accessibility' },
  { path: 'spacing', slug: 'spacing' },
  { path: 'component-architecture', slug: 'component-architecture' },
];

function checkPage(pagePath, slug) {
  const fullPath = path.join(
    projectRoot,
    'app/blueprints/foundations',
    `${pagePath}/page.tsx`
  );

  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️  Page not found: ${fullPath}`);
    return null;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');

  // Check for required sections
  const hasWhyMatters = /type: ['"]why-matters['"]/.test(content);
  const hasCoreConcepts = /type: ['"]core-concepts['"]/.test(content);
  const hasAppliedExample =
    /type: ['"]applied-example['"]/.test(content) ||
    /type: ['"]design-code-interplay['"]/.test(content);
  const hasSystemRoles = /type: ['"]system-roles['"]/.test(content);
  const hasConstraintsTradeoffs =
    /type: ['"]constraints-tradeoffs['"]/.test(content);
  const hasVerificationChecklist =
    /verificationChecklist\s*=/.test(content);
  const hasAssessmentPrompts = /assessmentPrompts\s*=/.test(content);
  const hasCrossReferences = /crossReferences\s*=/.test(content);
  const hasMetadataExport = /export const metadata/.test(content);

  // Extract section order
  const sectionMatches = content.matchAll(/order:\s*(\d+)/g);
  const sectionOrder = [];
  for (const match of sectionMatches) {
    sectionOrder.push(parseInt(match[1], 10));
  }

  return {
    page: slug,
    hasWhyMatters,
    hasCoreConcepts,
    hasAppliedExample,
    hasSystemRoles,
    hasConstraintsTradeoffs,
    hasVerificationChecklist,
    hasAssessmentPrompts,
    hasCrossReferences,
    hasMetadataExport,
    sectionOrder: [...new Set(sectionOrder)].sort((a, b) => a - b),
  };
}

function checkJSONLDGeneration() {
  const ldJsonPath = path.join(projectRoot, 'utils/ldjson/index.ts');
  if (!fs.existsSync(ldJsonPath)) {
    return false;
  }

  const content = fs.readFileSync(ldJsonPath, 'utf-8');
  return (
    /generateFoundationLDJson/.test(content) &&
    /BreadcrumbList/.test(content) &&
    /Course/.test(content)
  );
}

function checkMetadataGeneration() {
  const metadataPath = path.join(
    projectRoot,
    'utils/metadata/foundationMetadata.ts'
  );
  if (!fs.existsSync(metadataPath)) {
    return false;
  }

  const content = fs.readFileSync(metadataPath, 'utf-8');
  return (
    /generateFoundationMetadata/.test(content) &&
    /openGraph/.test(content) &&
    /twitter/.test(content) &&
    /canonical/.test(content)
  );
}

function checkCrossLinking() {
  const crossRefPath = path.join(
    projectRoot,
    'app/blueprints/foundations/_lib/crossReferences.ts'
  );
  return fs.existsSync(crossRefPath);
}

function checkGlossaryIntegration() {
  const templatePath = path.join(
    projectRoot,
    'app/blueprints/foundations/_components/EducationPageTemplate.tsx'
  );
  if (!fs.existsSync(templatePath)) {
    return false;
  }

  const content = fs.readFileSync(templatePath, 'utf-8');
  return (
    /GlossaryPopover/.test(content) &&
    /crossReferences.glossary/.test(content)
  );
}

function checkReadingTime() {
  const metadataPath = path.join(
    projectRoot,
    'utils/metadata/foundationMetadata.ts'
  );
  if (!fs.existsSync(metadataPath)) {
    return false;
  }

  const content = fs.readFileSync(metadataPath, 'utf-8');
  return /calculateReadingTime/.test(content);
}

function checkTemplateImplementation() {
  const templatePath = path.join(
    projectRoot,
    'app/blueprints/foundations/_components/EducationPageTemplate.tsx'
  );
  return fs.existsSync(templatePath);
}

// Run checks
console.log('\n📋 Foundation Pages Content Guidelines & Success Metrics Check\n');
console.log('='.repeat(70));

const pageChecks = [];
for (const { path: pagePath, slug } of foundationPages) {
  const check = checkPage(pagePath, slug);
  if (check) {
    pageChecks.push(check);
  }
}

console.log('\n✅ CONTENT GUIDELINES CHECK\n');
console.log('-'.repeat(70));

let allGuidelinesMet = true;

for (const check of pageChecks) {
  console.log(`\n📄 ${check.page.toUpperCase()}`);
  const issues = [];

  if (!check.hasWhyMatters) {
    issues.push('❌ Missing "Why This Matters" section');
    allGuidelinesMet = false;
  } else {
    console.log('  ✅ Has "Why This Matters" (philosophical grounding)');
  }

  if (!check.hasCoreConcepts) {
    issues.push('❌ Missing "Core Concepts" section');
    allGuidelinesMet = false;
  } else {
    console.log('  ✅ Has "Core Concepts" (theoretical concepts)');
  }

  if (!check.hasAppliedExample) {
    issues.push('❌ Missing "Applied Example" or "Design-Code Interplay" section');
    allGuidelinesMet = false;
  } else {
    console.log('  ✅ Has practical application examples');
  }

  if (!check.hasSystemRoles) {
    issues.push('❌ Missing "System Roles" section');
    allGuidelinesMet = false;
  } else {
    console.log('  ✅ Has "System Roles" (system-level impacts)');
  }

  if (!check.hasConstraintsTradeoffs) {
    issues.push('❌ Missing "Constraints & Trade-offs" section');
    allGuidelinesMet = false;
  } else {
    console.log('  ✅ Has "Constraints & Trade-offs"');
  }

  if (!check.hasVerificationChecklist) {
    issues.push('❌ Missing verification checklist');
    allGuidelinesMet = false;
  } else {
    console.log('  ✅ Has verification checklist');
  }

  if (!check.hasAssessmentPrompts) {
    issues.push('❌ Missing assessment prompts');
    allGuidelinesMet = false;
  } else {
    console.log('  ✅ Has assessment prompts');
  }

  if (!check.hasCrossReferences) {
    issues.push('❌ Missing cross-references');
    allGuidelinesMet = false;
  } else {
    console.log('  ✅ Has cross-references');
  }

  if (!check.hasMetadataExport) {
    issues.push('❌ Missing metadata export');
    allGuidelinesMet = false;
  } else {
    console.log('  ✅ Exports Next.js metadata');
  }

  if (issues.length > 0) {
    issues.forEach((issue) => console.log(`  ${issue}`));
  }

  // Check section order
  const expectedOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const hasOrder = check.sectionOrder.length > 0;
  if (hasOrder && check.sectionOrder.every((o) => expectedOrder.includes(o))) {
    console.log(
      `  ✅ Section order follows sequence (${check.sectionOrder.length} sections)`
    );
  } else if (hasOrder) {
    console.log(`  ⚠️  Section order: ${check.sectionOrder.join(', ')}`);
  }
}

console.log('\n\n✅ SUCCESS METRICS CHECK\n');
console.log('-'.repeat(70));

const metrics = {
  allPagesImplemented: pageChecks.length === 5,
  jsonLDGenerated: checkJSONLDGeneration(),
  metadataOptimized: checkMetadataGeneration(),
  crossLinkingOperational: checkCrossLinking(),
  glossaryIntegrated: checkGlossaryIntegration(),
  readingTimeCalculated: checkReadingTime(),
  templateImplemented: checkTemplateImplementation(),
};

let allMetricsMet = true;

Object.entries(metrics).forEach(([key, value]) => {
  const status = value ? '✅' : '❌';
  const label = key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
  console.log(`${status} ${label}`);
  if (!value) {
    allMetricsMet = false;
  }
});

console.log('\n' + '='.repeat(70));

if (allGuidelinesMet && allMetricsMet) {
  console.log('\n🎉 ALL CONTENT GUIDELINES AND SUCCESS METRICS MET!\n');
  process.exit(0);
} else {
  console.log('\n⚠️  SOME ISSUES FOUND - Review output above\n');
  process.exit(1);
}
