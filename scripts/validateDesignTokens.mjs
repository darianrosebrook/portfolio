#!/usr/bin/env node

/**
 * Enhanced Design Token Validation Script
 *
 * Comprehensive validation for design tokens across:
 * - JSON token files (DTCG format)
 * - CSS custom properties (--token-name)
 * - SCSS variables ($var)
 * - Cross-file reference resolution
 * - Circular dependency detection
 * - Missing token warnings
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { glob } from 'glob';

const require = createRequire(import.meta.url);
const PROJECT_ROOT = process.cwd();
const TOKENS_DIR = path.join(PROJECT_ROOT, 'ui', 'designTokens');
const CSS_TOKENS_FILE = path.join(PROJECT_ROOT, 'app', 'designTokens.scss');

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

function log(color, msg) {
  console.log(color + msg + colors.reset);
}

function logSection(title) {
  console.log('\n' + colors.bold + colors.cyan + `🔍 ${title}` + colors.reset);
}

function logSuccess(msg) {
  log(colors.green + colors.bold, `✅ ${msg}`);
}

function logWarning(msg) {
  log(colors.yellow + colors.bold, `⚠️  ${msg}`);
}

function logError(msg) {
  log(colors.red + colors.bold, `❌ ${msg}`);
}

function logInfo(msg) {
  log(colors.blue, `ℹ️  ${msg}`);
}

/**
 * Enhanced token validation with better error reporting
 */
class DesignTokenValidator {
  constructor() {
    this.allTokens = new Map();
    this.allReferences = new Map();
    this.cssProperties = new Map();
    this.cssVarUsage = new Map();
    this.scssVariables = new Map();
    this.issues = [];
    this.warnings = [];
    this.stats = {
      totalTokens: 0,
      totalReferences: 0,
      totalCssProps: 0,
      totalCssUsage: 0,
      totalScssVars: 0,
    };
  }

  /**
   * Parse JSON token files and extract definitions/references
   */
  parseJsonTokens() {
    logSection('Parsing JSON Token Files');

    if (!fs.existsSync(TOKENS_DIR)) {
      this.issues.push({
        type: 'missing-directory',
        severity: 'error',
        message: `Tokens directory not found: ${TOKENS_DIR}`,
      });
      return;
    }

    const files = fs
      .readdirSync(TOKENS_DIR)
      .filter((f) => f.endsWith('.tokens.json'))
      .map((f) => path.join(TOKENS_DIR, f));

    logInfo(`Found ${files.length} token files`);

    for (const filePath of files) {
      try {
        const fileName = path.basename(filePath);
        const tokens = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const {
          definitions,
          references,
          issues: fileIssues,
        } = this.extractTokensFromObject(tokens, fileName);

        // Check for duplicates and circular references
        this.validateTokenDefinitions(definitions, fileName);
        this.allReferences.set(fileName, references);
        this.issues.push(...fileIssues);

        logSuccess(
          `${fileName}: ${definitions.size} tokens, ${references.length} references`
        );
      } catch (error) {
        this.issues.push({
          type: 'parse-error',
          severity: 'error',
          file: path.basename(filePath),
          message: `Failed to parse JSON: ${error.message}`,
        });
        logError(
          `Failed to parse ${path.basename(filePath)}: ${error.message}`
        );
      }
    }

    this.stats.totalTokens = this.allTokens.size;
    this.stats.totalReferences = Array.from(
      this.allReferences.values()
    ).flat().length;
  }

  /**
   * Extract token definitions and references from a token object
   */
  extractTokensFromObject(obj, fileName) {
    const definitions = new Map();
    const references = [];
    const issues = [];

    const walk = (node, currentPath = '') => {
      if (!node || typeof node !== 'object') return;

      if (Object.prototype.hasOwnProperty.call(node, '$value')) {
        definitions.set(currentPath, {
          value: node.$value,
          type: node.$type,
          file: fileName,
          path: currentPath,
        });

        const ref = this.parseTokenReference(node.$value);
        if (ref) {
          references.push({ from: currentPath, to: ref, file: fileName });
        }

        if (
          typeof node.$value === 'string' &&
          this.hasInterpolatedReference(node.$value)
        ) {
          issues.push({
            type: 'interpolated-reference',
            severity: 'error',
            file: fileName,
            path: currentPath,
            message: `Interpolated references not allowed: ${node.$value}`,
          });
        }
      }

      for (const [key, value] of Object.entries(node)) {
        if (!key.startsWith('$') && typeof value === 'object') {
          walk(value, currentPath ? `${currentPath}.${key}` : key);
        }
      }
    };

    walk(obj, '');
    return { definitions, references, issues };
  }

  /**
   * Validate token definitions for duplicates and circular references
   */
  validateTokenDefinitions(definitions, fileName) {
    const fileTokens = new Map();

    for (const [path, def] of definitions) {
      // Check for duplicates within the same file
      if (fileTokens.has(path)) {
        this.issues.push({
          type: 'duplicate-definition',
          severity: 'error',
          file: fileName,
          path: path,
          message: `Duplicate definition within ${fileName}`,
        });
      }
      fileTokens.set(path, def);

      // Check for duplicates across files (allow semantic overrides)
      if (this.allTokens.has(path) && !fileName.includes('semantic')) {
        this.issues.push({
          type: 'duplicate-definition',
          severity: 'warning',
          file: fileName,
          path: path,
          message: `Already defined in another file`,
        });
      }

      this.allTokens.set(path, def);
    }
  }

  /**
   * Parse CSS custom properties from all SCSS/CSS files
   */
  async parseCssCustomProperties() {
    logSection('Parsing CSS Custom Properties');

    const files = await glob('**/*.{scss,css}', {
      cwd: PROJECT_ROOT,
      ignore: ['node_modules/**', '.next/**', 'dist/**'],
    });

    logInfo(`Scanning ${files.length} CSS/SCSS files`);

    const re = /--([a-zA-Z0-9-]+):\s*([^;]+);/g;
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(PROJECT_ROOT, file), 'utf8');
        let match;
        while ((match = re.exec(content)) !== null) {
          const name = `--${match[1]}`;
          if (!this.cssProperties.has(name)) {
            this.cssProperties.set(name, {
              value: match[2].trim(),
              file: file,
              line: content.slice(0, match.index).split('\n').length,
            });
          }
        }
      } catch (error) {
        this.issues.push({
          type: 'file-read-error',
          severity: 'error',
          file: file,
          message: `Failed to read file: ${error.message}`,
        });
      }
    }

    this.stats.totalCssProps = this.cssProperties.size;
    logSuccess(`Found ${this.cssProperties.size} CSS custom properties`);
  }

  /**
   * Find CSS var() usage across all files
   */
  async findCssVarUsage() {
    logSection('Finding CSS var() Usage');

    const files = await glob('**/*.{scss,css,tsx,ts,jsx,js}', {
      cwd: PROJECT_ROOT,
      ignore: ['node_modules/**', '.next/**', 'dist/**'],
    });

    logInfo(`Scanning ${files.length} files for CSS var() usage`);

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(PROJECT_ROOT, file), 'utf8');
        const re = /var\(\s*(--[a-zA-Z0-9-]+)(?:\s*,\s*([^)]+))?\s*\)/g;
        let match;
        while ((match = re.exec(content)) !== null) {
          const name = match[1];
          if (!this.cssVarUsage.has(name)) {
            this.cssVarUsage.set(name, []);
          }
          this.cssVarUsage.get(name).push({
            file: file,
            line: content.slice(0, match.index).split('\n').length,
          });
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    this.stats.totalCssUsage = this.cssVarUsage.size;
    logSuccess(`Found ${this.cssVarUsage.size} unique CSS variables in use`);
  }

  /**
   * Find SCSS variables across all files
   */
  async findScssVariables() {
    logSection('Finding SCSS Variables');

    const files = await glob('**/*.scss', {
      cwd: PROJECT_ROOT,
      ignore: ['node_modules/**', '.next/**', 'dist/**'],
    });

    logInfo(`Scanning ${files.length} SCSS files`);

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(PROJECT_ROOT, file), 'utf8');

        // Find variable definitions
        const defRe = /\$([a-zA-Z0-9-_]+):\s*([^;]+);/g;
        let match;
        while ((match = defRe.exec(content)) !== null) {
          const name = `$${match[1]}`;
          if (!this.scssVariables.has(name)) {
            this.scssVariables.set(name, []);
          }
          this.scssVariables.get(name).push({
            file: file,
            line: content.slice(0, match.index).split('\n').length,
            value: match[2].trim(),
          });
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    this.stats.totalScssVars = this.scssVariables.size;
    logSuccess(`Found ${this.scssVariables.size} SCSS variables`);
  }

  /**
   * Validate all token references and cross-file dependencies
   */
  validateReferences() {
    logSection('Validating Token References');

    // Validate JSON token references
    for (const [file, refs] of this.allReferences) {
      for (const ref of refs) {
        if (!this.allTokens.has(ref.to)) {
          this.issues.push({
            type: 'unresolved-token-reference',
            severity: 'error',
            file: file,
            from: ref.from,
            to: ref.to,
            message: `Token reference '${ref.to}' not found`,
          });
        }
      }
    }

    // Check for circular references
    this.detectCircularReferences();

    // Validate CSS var() usage
    const allowedCssVars = this.getAllowedCssVariables();
    for (const [name, uses] of this.cssVarUsage) {
      if (
        !this.cssProperties.has(name) &&
        !this.isAllowedCssVariable(name, allowedCssVars)
      ) {
        for (const use of uses) {
          this.issues.push({
            type: 'undefined-css-variable',
            severity: 'error',
            file: use.file,
            line: use.line,
            variable: name,
            message: `CSS variable '${name}' is used but not defined`,
          });
        }
      }
    }

    // Validate SCSS variables
    for (const [name, uses] of this.scssVariables) {
      if (!this.scssVariables.has(name)) {
        for (const use of uses) {
          this.issues.push({
            type: 'undefined-scss-variable',
            severity: 'error',
            file: use.file,
            line: use.line,
            variable: name,
            message: `SCSS variable '${name}' is used but not defined`,
          });
        }
      }
    }

    logSuccess(`Validated ${this.stats.totalReferences} token references`);
  }

  /**
   * Detect circular references in token dependencies
   */
  detectCircularReferences() {
    const tokenRefs = new Map();

    // Build reference map
    for (const [file, refs] of this.allReferences) {
      for (const ref of refs) {
        tokenRefs.set(ref.from, ref.to);
      }
    }

    const visited = new Set();
    const recursionStack = new Set();
    const cycles = [];

    const dfs = (node, path = []) => {
      if (recursionStack.has(node)) {
        const cycleStart = path.indexOf(node);
        cycles.push(path.slice(cycleStart).concat(node));
        return;
      }

      if (visited.has(node)) return;

      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const reference = tokenRefs.get(node);
      if (reference) {
        dfs(reference, [...path]);
      }

      recursionStack.delete(node);
    };

    for (const node of tokenRefs.keys()) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }

    // Report circular references
    for (const cycle of cycles) {
      this.issues.push({
        type: 'circular-reference',
        severity: 'error',
        message: `Circular reference detected: ${cycle.join(' → ')}`,
        cycle: cycle,
      });
    }
  }

  /**
   * Parse token reference from value
   */
  parseTokenReference(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return null;
    const inner = trimmed.slice(1, -1).trim();
    if (!inner || /\s/.test(inner)) return null;
    return inner;
  }

  /**
   * Check if value contains interpolated references
   */
  hasInterpolatedReference(value) {
    if (typeof value !== 'string') return false;
    const matches = value.match(/\{[^}]+\}/g);
    if (!matches) return false;
    return !(matches.length === 1 && matches[0] === value.trim());
  }

  /**
   * Get allowed CSS variables (generated or external)
   */
  getAllowedCssVariables() {
    return [
      '--font-inter',
      '--font-nohemi',
      '--semantic-',
      '--core-',
      '--color-core-',
      '--colorSwatch-',
      '--color-',
      '--font-weight-',
      '--font-size-',
      '--text-',
      '--heading-',
      '--body-',
      '--line-height-',
      '--space-',
      '--radius-',
      '--surface-',
      '--border-',
      '--shadow-',
      '--font-mono',
      '--font-lineHeight-',
      '--size-',
      '--input-',
      '--label-',
      '--image-',
      '--walkthrough-',
      '--visuallyHidden-',
      '--focus-ring',
      '--focus-ring-offset',
      '--truncate-',
      '--toggle-',
      '--spinner-',
      '--skeleton-',
      '--select-',
      '--animatedLink-',
      '--list-',
      '--field-',
      '--divider-',
      '--details-',
      '--transition-',
      '--blockquote-',
      '--badge-',
      '--aspect-ratio',
      '--aspectRatio-',
      '--grid-gap-',
      '--alert-',
      '--font-family-',
      '--opacity-',
      '--component-',
      '--sidebar-',
      '--popover-',
      '--dialog-',
      '--elevation',
    ];
  }

  /**
   * Check if CSS variable is allowed
   */
  isAllowedCssVariable(varName, allowedVars) {
    return allowedVars.some((prefix) => varName.startsWith(prefix));
  }

  /**
   * Generate comprehensive validation report
   */
  generateReport() {
    logSection('Validation Report');

    // Summary statistics
    console.log(colors.bold + '📊 Summary:');
    console.log(`  JSON Tokens: ${this.stats.totalTokens}`);
    console.log(`  Token References: ${this.stats.totalReferences}`);
    console.log(`  CSS Custom Properties: ${this.stats.totalCssProps}`);
    console.log(`  CSS Variables in Use: ${this.stats.totalCssUsage}`);
    console.log(`  SCSS Variables: ${this.stats.totalScssVars}`);

    // Group issues by type and severity
    const issuesByType = new Map();
    const issuesBySeverity = { error: 0, warning: 0 };

    for (const issue of this.issues) {
      const type = issue.type;
      const severity = issue.severity || 'error';

      if (!issuesByType.has(type)) {
        issuesByType.set(type, []);
      }
      issuesByType.get(type).push(issue);
      issuesBySeverity[severity]++;
    }

    // Report issues
    if (this.issues.length === 0) {
      logSuccess('No issues found! All design tokens are valid.');
      return true;
    }

    console.log(`\n${colors.bold}Found ${this.issues.length} issue(s):`);
    console.log(`  ${colors.red}Errors: ${issuesBySeverity.error}`);
    console.log(`  ${colors.yellow}Warnings: ${issuesBySeverity.warning}`);

    // Group and display issues by type
    for (const [type, issues] of issuesByType) {
      const severity = issues[0].severity || 'error';
      const color = severity === 'error' ? colors.red : colors.yellow;
      const icon = severity === 'error' ? '❌' : '⚠️';

      console.log(`\n${color}${icon} ${type} (${issues.length}):`);

      for (const issue of issues.slice(0, 10)) {
        // Limit to first 10 per type
        const details = [];
        if (issue.file) details.push(issue.file);
        if (issue.line) details.push(`:${issue.line}`);
        if (issue.path) details.push(` ${issue.path}`);
        if (issue.variable) details.push(` ${issue.variable}`);
        if (issue.from) details.push(` ${issue.from}`);
        if (issue.to) details.push(` → ${issue.to}`);
        if (issue.message) details.push(` (${issue.message})`);

        console.log(`  -${details.join('')}`);
      }

      if (issues.length > 10) {
        console.log(`  ...and ${issues.length - 10} more`);
      }
    }

    return issuesBySeverity.error === 0;
  }

  /**
   * Run complete validation
   */
  async validate() {
    log(
      colors.bold + colors.blue,
      '🚀 Starting Enhanced Design Token Validation...\n'
    );

    this.parseJsonTokens();
    await this.parseCssCustomProperties();
    await this.findCssVarUsage();
    await this.findScssVariables();
    this.validateReferences();

    const isValid = this.generateReport();

    if (isValid) {
      logSuccess('\n🎉 All design tokens are valid!');
      process.exit(0);
    } else {
      logError('\n💥 Validation failed. Please fix the issues above.');
      process.exit(1);
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new DesignTokenValidator();
  validator.validate().catch((error) => {
    logError(`Validation failed: ${error.message}`);
    process.exit(1);
  });
}

export { DesignTokenValidator };
