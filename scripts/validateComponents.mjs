#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const COMPONENTS_DIR = path.join(__dirname, '../ui/components');
const MODULES_DIR = path.join(__dirname, '../ui/modules');

// Required files for components (strict design system standards)
const COMPONENT_REQUIRED_FILES = [
  'index.tsx',
  '{ComponentName}.tsx',
  '{ComponentName}.module.scss',
  'README.md',
];

// Required files for modules (more flexible, application-specific)
const MODULE_REQUIRED_FILES = ['index.tsx', '{ComponentName}.tsx'];

// Optional files for components
const COMPONENT_OPTIONAL_FILES = [
  '{ComponentName}.tokens.json',
  '{ComponentName}.tokens.generated.scss',
  'utils/index.ts',
];

// Optional files for modules
const MODULE_OPTIONAL_FILES = [
  '{ComponentName}.module.scss',
  '{ComponentName}.tokens.json',
  '{ComponentName}.tokens.generated.scss',
  'README.md',
  'utils/index.ts',
];

// Color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

class ComponentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.successes = [];
  }

  log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logError(message) {
    this.errors.push(message);
    this.log(`❌ ${message}`, 'red');
  }

  logWarning(message) {
    this.warnings.push(message);
    this.log(`⚠️  ${message}`, 'yellow');
  }

  logSuccess(message) {
    this.successes.push(message);
    this.log(`✅ ${message}`, 'green');
  }

  logInfo(message) {
    this.log(`ℹ️  ${message}`, 'blue');
  }

  validateComponentStructure(componentPath, componentName, type = 'component') {
    this.log(`\n${colors.bold}Validating ${componentName}${colors.reset}`);

    const requiredFiles =
      type === 'component' ? COMPONENT_REQUIRED_FILES : MODULE_REQUIRED_FILES;
    const optionalFiles =
      type === 'component' ? COMPONENT_OPTIONAL_FILES : MODULE_OPTIONAL_FILES;

    let hasErrors = false;

    // Check required files
    requiredFiles.forEach((filePattern) => {
      const fileName = filePattern.replace('{ComponentName}', componentName);
      const filePath = path.join(componentPath, fileName);

      if (!fs.existsSync(filePath)) {
        this.logError(`Missing required file: ${fileName}`);
        hasErrors = true;
      } else {
        this.logSuccess(`Required file exists: ${fileName}`);
      }
    });

    // Check optional files (only warn for components, info for modules)
    optionalFiles.forEach((filePattern) => {
      const fileName = filePattern.replace('{ComponentName}', componentName);
      const filePath = path.join(componentPath, fileName);

      if (fs.existsSync(filePath)) {
        this.logSuccess(`Optional file exists: ${fileName}`);
      } else if (type === 'component') {
        this.logWarning(`Consider adding: ${fileName}`);
      } else {
        this.logInfo(`Optional file not present: ${fileName}`);
      }
    });

    // Validate file naming conventions
    this.validateNamingConventions(componentPath, componentName, type);

    // Validate index.tsx file
    this.validateIndexFile(componentPath, componentName);

    // Validate main component file
    this.validateMainComponentFile(componentPath, componentName, type);

    // Check for composer-specific files (only for components)
    if (type === 'component') {
      this.validateComposerPattern(componentPath, componentName);
    }

    // Validate README.md file (only for components)
    if (type === 'component') {
      this.validateReadmeFile(componentPath, componentName);
    }

    // Validate SCSS module file (only for components)
    if (type === 'component') {
      this.validateScssFile(componentPath, componentName);
    }

    return !hasErrors;
  }

  validateNamingConventions(componentPath, componentName, type = 'component') {
    const files = fs.readdirSync(componentPath);

    files.forEach((file) => {
      // Check for PascalCase in component name
      if (file.startsWith(componentName) && file !== componentName) {
        const extension = path.extname(file);
        const baseName = path.basename(file, extension);

        if (baseName === componentName) {
          this.logSuccess(`Correct naming: ${file}`);
        } else if (baseName.startsWith(componentName + '.')) {
          this.logSuccess(`Correct naming: ${file}`);
        } else {
          this.logWarning(
            `Naming convention issue: ${file} should follow ComponentName pattern`
          );
        }
      }

      // Check for lowercase files that should be PascalCase
      if (file.match(/^[a-z].*\.tsx?$/)) {
        if (
          file !== 'index.tsx' &&
          !file.includes('utils') &&
          !file.startsWith('use')
        ) {
          this.logWarning(`File should use PascalCase: ${file}`);
        }
      }
    });
  }

  validateIndexFile(componentPath, componentName) {
    const indexPath = path.join(componentPath, 'index.tsx');

    if (!fs.existsSync(indexPath)) {
      this.logError('Missing required file: index.tsx');
      return;
    }

    try {
      const content = fs.readFileSync(indexPath, 'utf8');

      // Check for default export - be flexible with naming for modules
      const possibleNames = [componentName, componentName.toLowerCase()];
      const hasValidDefaultExport = possibleNames.some((name) =>
        content.includes(`export { default } from './${name}'`)
      );

      if (hasValidDefaultExport) {
        this.logSuccess('Index file exports default correctly');
      } else {
        this.logError(
          `Index file should export default from './${componentName}' or './${componentName.toLowerCase()}'`
        );
      }

      // Check for named export
      if (
        content.includes(
          `export { ${componentName} } from './${componentName}'`
        )
      ) {
        this.logSuccess('Index file exports named component');
      } else {
        this.logWarning(
          `Index file should export named component: ${componentName}`
        );
      }

      // Check for type exports
      if (content.includes(`export type { ${componentName}Props }`)) {
        this.logSuccess('Index file exports component props type');
      } else {
        this.logWarning(
          `Index file should export type { ${componentName}Props }`
        );
      }
    } catch (error) {
      this.logError(`Error reading index file: ${error.message}`);
    }
  }

  validateMainComponentFile(componentPath, componentName, type = 'component') {
    // For modules, be flexible with naming (allow lowercase)
    const possibleMainFiles =
      type === 'module'
        ? [`${componentName}.tsx`, `${componentName.toLowerCase()}.tsx`]
        : [`${componentName}.tsx`];

    let mainPath = null;
    for (const fileName of possibleMainFiles) {
      const testPath = path.join(componentPath, fileName);
      if (fs.existsSync(testPath)) {
        mainPath = testPath;
        break;
      }
    }

    if (!mainPath) {
      const expectedFiles = possibleMainFiles.join(' or ');
      this.logError(`Missing required file: ${expectedFiles}`);
      return;
    }

    try {
      const content = fs.readFileSync(mainPath, 'utf8');

      // Check for proper interface export
      if (content.includes(`export interface ${componentName}Props`)) {
        this.logSuccess('Component exports props interface');
      } else {
        this.logWarning(
          `Component should export interface ${componentName}Props`
        );
      }

      // Check for React.FC typing
      if (content.includes(`React.FC<${componentName}Props>`)) {
        this.logSuccess('Component uses proper React.FC typing');
      } else {
        this.logWarning('Component should use React.FC<ComponentProps> typing');
      }

      // Check for styles import (only required for components)
      if (type === 'component') {
        if (content.includes(`from './${componentName}.module.scss'`)) {
          this.logSuccess('Component imports styles correctly');
        } else {
          this.logWarning(
            'Component should import styles from module.scss file'
          );
        }
      }

      // Check for React.memo
      if (content.includes('React.memo(')) {
        this.logSuccess('Component uses React.memo for optimization');
      } else {
        this.logInfo('Consider using React.memo for performance optimization');
      }

      // Check for JSDoc comments (only for components)
      if (type === 'component') {
        const interfaceMatch = content.match(
          /interface\s+\w+Props\s*{([^}]+)}/
        );
        if (interfaceMatch) {
          const interfaceContent = interfaceMatch[1];
          const hasJsDoc =
            interfaceContent.includes('/**') || interfaceContent.includes('//');

          if (hasJsDoc) {
            this.logSuccess('Props have documentation comments');
          } else {
            this.logWarning('Props should have JSDoc documentation comments');
          }
        }
      }

      // Check for boolean prop explosion (complexity signal)
      const booleanProps = content.match(/(\w+)\?\s*:\s*boolean/g);
      if (booleanProps && booleanProps.length > 4) {
        this.logWarning(
          `Component has ${booleanProps.length} boolean props. Consider composition instead of prop explosion.`
        );
      }

      // Check for composer patterns (only for components)
      if (type === 'component') {
        if (content.includes('Provider') || content.includes('Context')) {
          this.logInfo(
            'Component uses Provider/Context pattern (composer-level)'
          );

          // Check for logic separation in composers
          const hookImport = content.includes(`use${componentName}`);
          if (hookImport) {
            this.logSuccess('Composer separates logic with custom hook');
          } else {
            this.logWarning('Composer should separate logic with custom hook');
          }
        }
      }
    } catch (error) {
      this.logError(`Error reading main component file: ${error.message}`);
    }
  }

  validateComposerPattern(componentPath, componentName) {
    // Check if this appears to be a composer (has Provider or complex state)
    const mainPath = path.join(componentPath, `${componentName}.tsx`);

    if (!fs.existsSync(mainPath)) {
      return;
    }

    try {
      const content = fs.readFileSync(mainPath, 'utf8');

      // If component uses Provider/Context patterns, it should be a composer
      if (
        content.includes('Provider') ||
        content.includes('Context') ||
        content.includes('createContext')
      ) {
        // Check for custom hook file
        const hookPath = path.join(componentPath, `use${componentName}.ts`);
        if (fs.existsSync(hookPath)) {
          this.logSuccess(
            `Composer has logic separation: use${componentName}.ts`
          );
        } else {
          this.logWarning(
            `Composer should separate logic into use${componentName}.ts`
          );
        }

        // Check for provider file
        const providerPath = path.join(
          componentPath,
          `${componentName}Provider.tsx`
        );
        if (fs.existsSync(providerPath)) {
          this.logSuccess(
            `Composer has provider separation: ${componentName}Provider.tsx`
          );
        } else {
          this.logInfo(
            `Consider separating provider into ${componentName}Provider.tsx`
          );
        }
      }
    } catch (error) {
      this.logError(`Error reading composer file: ${error.message}`);
    }
  }

  validateReadmeFile(componentPath, componentName) {
    const readmePath = path.join(componentPath, 'README.md');

    if (!fs.existsSync(readmePath)) {
      this.logError('Missing required file: README.md');
      return;
    }

    try {
      const content = fs.readFileSync(readmePath, 'utf8');

      // Check for basic README structure
      if (content.includes('# ')) {
        this.logSuccess('README has proper heading structure');
      } else {
        this.logWarning('README should have proper heading structure');
      }

      if (content.includes('## Usage')) {
        this.logSuccess('README includes usage section');
      } else {
        this.logWarning('README should include usage section');
      }

      if (content.includes('## Props')) {
        this.logSuccess('README includes props documentation');
      } else {
        this.logWarning('README should include props documentation');
      }

      if (content.includes('## Accessibility')) {
        this.logSuccess('README includes accessibility section');
      } else {
        this.logWarning('README should include accessibility section');
      }

      if (content.includes('## Design Tokens')) {
        this.logSuccess('README includes design tokens section');
      } else {
        this.logWarning('README should include design tokens section');
      }
    } catch (error) {
      this.logError(`Error reading README file: ${error.message}`);
    }
  }

  validateScssFile(componentPath, componentName) {
    const scssPath = path.join(componentPath, `${componentName}.module.scss`);

    if (!fs.existsSync(scssPath)) {
      this.logError('Missing required file: SCSS module');
      return;
    }

    try {
      const content = fs.readFileSync(scssPath, 'utf8');

      // Check for design tokens import
      if (
        (content.includes('@import') && content.includes('designTokens')) ||
        (content.includes('@use') && content.includes('.tokens.generated.scss'))
      ) {
        this.logSuccess('SCSS file imports design tokens');
      } else {
        this.logWarning('SCSS file should import design tokens');
      }

      // Check for CSS custom properties usage
      if (content.includes('var(--')) {
        this.logSuccess('SCSS file uses CSS custom properties (design tokens)');
      } else {
        this.logWarning(
          'SCSS file should use CSS custom properties for theming'
        );
      }

      // Check for focus styles
      if (content.includes(':focus') || content.includes(':focus-visible')) {
        this.logSuccess('SCSS includes focus styles for accessibility');
      } else {
        this.logWarning('SCSS should include focus styles for accessibility');
      }

      // Check for responsive design
      if (content.includes('@media')) {
        this.logSuccess('SCSS includes responsive design considerations');
      } else {
        this.logInfo('Consider adding responsive design to SCSS');
      }
    } catch (error) {
      this.logError(`Error reading SCSS file: ${error.message}`);
    }
  }

  validateDirectory(directory, type = 'component') {
    if (!fs.existsSync(directory)) {
      this.logError(`Directory does not exist: ${directory}`);
      return false;
    }

    const items = fs.readdirSync(directory);
    let allValid = true;

    items.forEach((item) => {
      const itemPath = path.join(directory, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        // Validate naming convention
        if (item[0] !== item[0].toUpperCase()) {
          this.logWarning(`${type} folder should use PascalCase: ${item}`);
        }

        const isValid = this.validateComponentStructure(itemPath, item, type);
        if (!isValid) {
          allValid = false;
        }
      }
    });

    return allValid;
  }

  printSummary() {
    this.log(`\n${colors.bold}${colors.cyan}Validation Summary${colors.reset}`);
    this.log(
      `${colors.green}Successes: ${this.successes.length}${colors.reset}`
    );
    this.log(
      `${colors.yellow}Warnings: ${this.warnings.length}${colors.reset}`
    );
    this.log(`${colors.red}Errors: ${this.errors.length}${colors.reset}`);

    if (this.errors.length === 0) {
      this.log(
        `\n${colors.bold}${colors.green}🎉 All validations passed!${colors.reset}`
      );
      return true;
    } else {
      this.log(
        `\n${colors.bold}${colors.red}❌ Validation failed with ${this.errors.length} errors${colors.reset}`
      );
      return false;
    }
  }

  async validate(specificComponent = null) {
    if (specificComponent) {
      // Validate specific component
      const componentPath = path.join(COMPONENTS_DIR, specificComponent);
      const modulePath = path.join(MODULES_DIR, specificComponent);

      if (fs.existsSync(componentPath)) {
        this.validateComponentStructure(
          componentPath,
          specificComponent,
          'component'
        );
      } else if (fs.existsSync(modulePath)) {
        this.validateComponentStructure(
          modulePath,
          specificComponent,
          'module'
        );
      } else {
        this.logError(
          `Component '${specificComponent}' not found in components or modules directory`
        );
      }
    } else {
      // Validate all components and modules
      this.log(`${colors.bold}Validating Components...${colors.reset}`);
      this.validateDirectory(COMPONENTS_DIR, 'component');

      this.log(`\n${colors.bold}Validating Modules...${colors.reset}`);
      this.validateDirectory(MODULES_DIR, 'module');
    }

    return this.printSummary();
  }
}

// CLI execution
const args = process.argv.slice(2);
const specificComponent = args[0];

const validator = new ComponentValidator();
validator.validate(specificComponent).then((success) => {
  process.exit(success ? 0 : 1);
});
