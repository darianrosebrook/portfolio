#!/usr/bin/env node
/**
 * Utils Folder Cleanup Script
 * Consolidates duplicate utilities and improves organization
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const UTILS_DIR = path.join(PROJECT_ROOT, 'utils');

class UtilsCleanup {
  constructor() {
    this.actions = [];
    this.warnings = [];
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      warn: '\x1b[33m',
      error: '\x1b[31m',
      success: '\x1b[32m',
      reset: '\x1b[0m',
    };
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  addAction(action, description) {
    this.actions.push({ action, description });
  }

  // Remove exact duplicates
  removeDuplicates() {
    this.log('\n🔍 Checking for duplicate files...', 'info');

    // Remove linearInterpolation.ts from root (keep the one in helpers/)
    const rootLinearInterp = path.join(UTILS_DIR, 'linearInterpolation.ts');
    const helpersLinearInterp = path.join(
      UTILS_DIR,
      'helpers',
      'linearInterpolation.ts'
    );

    if (fs.existsSync(rootLinearInterp) && fs.existsSync(helpersLinearInterp)) {
      const rootContent = fs.readFileSync(rootLinearInterp, 'utf8');
      const helpersContent = fs.readFileSync(helpersLinearInterp, 'utf8');

      if (rootContent === helpersContent) {
        this.addAction(
          'delete',
          `Remove duplicate: ${path.relative(PROJECT_ROOT, rootLinearInterp)}`
        );
        // fs.unlinkSync(rootLinearInterp); // Commented for safety - run with --execute flag
        this.log(
          `✅ Would remove duplicate: utils/linearInterpolation.ts`,
          'success'
        );
      }
    }
  }

  // Consolidate design token utilities
  consolidateDesignTokens() {
    this.log('\n🎨 Analyzing design token utilities...', 'info');

    const tokenFiles = [
      'generateCSSTokens.mjs',
      'generateTypes.mjs',
      'generateSchema.mjs',
      'composeTokens.mjs',
      'validateTokens.mjs',
      'inspectTokens.mjs',
      'componentTokenUtils.ts',
    ].map((file) => path.join(UTILS_DIR, 'designTokens', file));

    const existingFiles = tokenFiles.filter((file) => fs.existsSync(file));

    this.log(`Found ${existingFiles.length} design token files`, 'info');

    // Recommend consolidation strategy
    this.addAction('organize', 'Group generation scripts vs runtime utilities');
    this.addAction(
      'simplify',
      'Consider combining small utilities into index barrel export'
    );
  }

  // Fix helpers organization
  organizeHelpers() {
    this.log('\n📁 Analyzing helpers organization...', 'info');

    const helpersDir = path.join(UTILS_DIR, 'helpers');
    const helpersIndexPath = path.join(helpersDir, 'index.ts');

    if (fs.existsSync(helpersDir)) {
      const helperFiles = fs
        .readdirSync(helpersDir)
        .filter((file) => file.endsWith('.ts') && file !== 'index.ts')
        .map((file) => path.basename(file, '.ts'));

      this.log(
        `Found ${helperFiles.length} helper files: ${helperFiles.join(', ')}`,
        'info'
      );

      if (fs.existsSync(helpersIndexPath)) {
        const indexContent = fs.readFileSync(helpersIndexPath, 'utf8');
        const exportedHelpers = helperFiles.filter(
          (helper) =>
            indexContent.includes(`from './${helper}'`) ||
            indexContent.includes(`from '../${helper}'`)
        );

        const missingExports = helperFiles.filter(
          (helper) => !exportedHelpers.includes(helper)
        );

        if (missingExports.length > 0) {
          this.addAction(
            'update',
            `Add missing exports to helpers/index.ts: ${missingExports.join(', ')}`
          );
        }
      }
    }
  }

  // Check for inconsistent file types
  checkFileConsistency() {
    this.log('\n📝 Checking file type consistency...', 'info');

    const designTokensDir = path.join(UTILS_DIR, 'designTokens');
    if (fs.existsSync(designTokensDir)) {
      const files = fs.readdirSync(designTokensDir);
      const mjsFiles = files.filter((f) => f.endsWith('.mjs'));
      const tsFiles = files.filter((f) => f.endsWith('.ts'));

      this.log(
        `Design tokens: ${mjsFiles.length} .mjs files, ${tsFiles.length} .ts files`,
        'info'
      );

      if (mjsFiles.length > 0 && tsFiles.length > 0) {
        this.addAction(
          'standardize',
          'Consider standardizing on .ts files with proper build setup'
        );
      }
    }
  }

  // Generate improved structure recommendation
  generateRecommendedStructure() {
    this.log('\n🏗️ Recommended structure:', 'info');

    const structure = {
      'utils/': {
        'core/': ['env.ts', 'index.ts'],
        'design-tokens/': [
          'index.ts', // Main API
          'generators/', // All generation scripts
          'validators/', // Validation utilities
          'resolvers.ts', // Token resolution logic
          'types.ts', // TypeScript definitions
        ],
        'helpers/': [
          'index.ts', // Barrel export
          'animation.ts', // debounce, throttle, linearInterpolation
          'data.ts', // hashing, numberHelpers
          'logging.ts', // logger
          'formatting.ts', // colorFormat, colorHelpers
        ],
        'supabase/': [
          'index.ts',
          'client.ts',
          'upload.ts',
          'article-cleanup.ts',
        ],
        'geometry/': ['index.ts', '...existing files'],
        'performance/': ['index.ts', 'monitor.ts', 'resourceOptimizer.ts'],
        'type-anatomy/': ['index.ts', '...existing files'],
        'schemas/': ['index.ts', 'article.schema.ts', 'case-study.schema.ts'],
      },
    };

    this.printStructure(structure, '');
  }

  printStructure(obj, indent) {
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        this.log(`${indent}${key}`, 'info');
        value.forEach((file) => this.log(`${indent}  ${file}`, 'success'));
      } else {
        this.log(`${indent}${key}`, 'warn');
        this.printStructure(value, indent + '  ');
      }
    }
  }

  // Generate consolidation script
  generateConsolidationPlan() {
    this.log('\n📋 Consolidation Actions:', 'info');

    this.actions.forEach((action, i) => {
      this.log(
        `${i + 1}. [${action.action.toUpperCase()}] ${action.description}`,
        'warn'
      );
    });

    this.log('\n💡 Next Steps:', 'info');
    this.log(
      '1. Run with --execute flag to perform safe operations',
      'success'
    );
    this.log(
      '2. Manually review design token utilities consolidation',
      'success'
    );
    this.log('3. Update import statements after file moves', 'success');
    this.log('4. Test all functionality after changes', 'success');
  }

  run(execute = false) {
    this.log('🧹 Utils Folder Cleanup Analysis\n', 'info');

    this.removeDuplicates();
    this.consolidateDesignTokens();
    this.organizeHelpers();
    this.checkFileConsistency();
    this.generateRecommendedStructure();
    this.generateConsolidationPlan();

    if (!execute) {
      this.log(
        '\n⚠️  This was a dry run. Use --execute to perform changes.',
        'warn'
      );
    }
  }
}

// CLI execution
const execute = process.argv.includes('--execute');
const cleanup = new UtilsCleanup();
cleanup.run(execute);
