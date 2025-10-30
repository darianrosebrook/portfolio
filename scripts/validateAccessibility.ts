#!/usr/bin/env node

/**
 * Comprehensive Design Token Accessibility Validator
 *
 * This script validates design tokens for WCAG 2.1 accessibility compliance,
 * including both global semantic tokens and component-specific tokens.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import type { TokenValidationReport } from '../utils/accessibility/tokenValidator';
import {
  validateDesignTokens,
  generateAccessibilityReport,
  runAccessibilityValidation,
} from '../utils/accessibility/tokenValidator';

const require = createRequire(import.meta.url);
const PROJECT_ROOT = process.cwd();
const TOKENS_DIR = path.join(PROJECT_ROOT, 'ui', 'designTokens');
const COMPONENTS_DIR = path.join(PROJECT_ROOT, 'ui', 'components');
const GLOBAL_TOKENS_FILE = path.join(TOKENS_DIR, 'designTokens.json');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

function log(color: string, msg: string): void {
  console.log(color + msg + colors.reset);
}

function logSection(title: string): void {
  console.log('\n' + colors.bold + colors.cyan + `🔍 ${title}` + colors.reset);
}

function logSuccess(msg: string): void {
  log(colors.green + colors.bold, `✅ ${msg}`);
}

function logWarning(msg: string): void {
  log(colors.yellow + colors.bold, `⚠️  ${msg}`);
}

function logError(msg: string): void {
  log(colors.red + colors.bold, `❌ ${msg}`);
}

function logInfo(msg: string): void {
  log(colors.blue, `ℹ️  ${msg}`);
}

/**
 * Main accessibility validation orchestrator
 */
class AccessibilityValidator {
  private globalValidation: TokenValidationReport | null = null;
  private overallValid = true;

  constructor() {
    this.globalValidation = null;
    this.overallValid = true;
  }

  /**
   * Validate global design tokens
   */
  async validateGlobalTokens() {
    logSection('Validating Global Design Tokens');

    if (!fs.existsSync(GLOBAL_TOKENS_FILE)) {
      logError(`Global tokens file not found: ${GLOBAL_TOKENS_FILE}`);
      logInfo('Run "npm run tokens:build" to generate tokens file');
      this.overallValid = false;
      return;
    }

    try {
      this.globalValidation = validateDesignTokens(GLOBAL_TOKENS_FILE);

      if (this.globalValidation && this.globalValidation.invalidPairs === 0) {
        logSuccess(
          `All ${this.globalValidation.totalPairs} global token color pairs pass accessibility requirements`
        );
      } else if (this.globalValidation) {
        logWarning(
          `${this.globalValidation.invalidPairs} of ${this.globalValidation.totalPairs} global token pairs fail accessibility requirements`
        );
        this.overallValid = false;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logError(`Failed to validate global tokens: ${errorMessage}`);
      this.overallValid = false;
    }
  }

  /**
   * Generate comprehensive accessibility report
   */
  generateReport() {
    logSection('Accessibility Validation Report');

    let reportContent = '';

    // Global tokens report
    if (this.globalValidation) {
      const globalReport = generateAccessibilityReport(this.globalValidation);
      reportContent += globalReport + '\n\n';
      console.log(globalReport);
    }

    // Write comprehensive report to file
    const reportPath = path.join(
      PROJECT_ROOT,
      'accessibility-validation-report.txt'
    );
    const timestamp = new Date().toISOString();
    const fullReport = `Design Token Accessibility Validation Report
Generated: ${timestamp}

${reportContent}`;

    try {
      fs.writeFileSync(reportPath, fullReport);
      logInfo(`Full report saved to: ${reportPath}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logError(`Failed to save report: ${errorMessage}`);
    }

    return reportContent;
  }

  /**
   * Run complete accessibility validation
   */
  async validate() {
    log(
      colors.bold + colors.blue,
      '🚀 Starting Design Token Accessibility Validation...\n'
    );

    await this.validateGlobalTokens();

    this.generateReport();

    if (this.overallValid) {
      logSuccess('\n🎉 All design tokens pass accessibility validation!');
      process.exit(0);
    } else {
      logError(
        '\n💥 Accessibility validation failed. Please fix the issues above.'
      );

      // Provide helpful guidance
      console.log(
        '\n' + colors.bold + colors.yellow + '💡 Quick Fixes:' + colors.reset
      );
      console.log('  1. Check color contrast ratios for failing pairs');
      console.log('  2. Darken foreground colors or lighten background colors');
      console.log(
        '  3. Use our color palette tools to find accessible alternatives'
      );
      console.log('  4. Consider using semantic tokens that are pre-validated');

      process.exit(1);
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new AccessibilityValidator();
  validator.validate().catch((error) => {
    logError(`Validation failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
}

export { AccessibilityValidator };
