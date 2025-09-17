// Validation & Governance Pattern
// Ensure quality and consistency at scale

/**
 * Automated validation ensures your design system maintains quality and consistency
 * as it scales. Governance patterns help teams make the right decisions.
 */

// Example: Component Validation (from all examples)
export interface ComponentValidator {
  validate(component: ComponentSpec): ValidationResult;
  validateTokens(tokens: TokenSpec[]): ValidationResult;
  validateAccessibility(component: ComponentSpec): ValidationResult;
  validateAPI(component: ComponentSpec): ValidationResult;
}

export interface ComponentSpec {
  name: string;
  layer: 'primitive' | 'compound' | 'composer';
  files: FileSpec[];
  exports: ExportSpec[];
  tokens: TokenSpec[];
  accessibility: AccessibilitySpec;
  props: PropSpec[];
  slots: SlotSpec[];
}

export interface FileSpec {
  name: string;
  type: 'component' | 'hook' | 'context' | 'types' | 'styles' | 'tokens';
  required: boolean;
  content?: string;
}

export interface ExportSpec {
  name: string;
  type: 'component' | 'hook' | 'type' | 'interface';
  required: boolean;
}

export interface TokenSpec {
  name: string;
  type: 'color' | 'spacing' | 'typography' | 'radius' | 'shadow';
  value: string;
  usage: string[];
}

export interface AccessibilitySpec {
  roles: string[];
  keyboard: KeyboardSpec[];
  screenReader: ScreenReaderSpec;
  colorContrast: ContrastSpec;
}

export interface KeyboardSpec {
  key: string;
  action: string;
  description: string;
}

export interface ScreenReaderSpec {
  announcements: string[];
  labels: string[];
  descriptions: string[];
}

export interface ContrastSpec {
  minimum: number;
  enhanced: number;
}

export interface PropSpec {
  name: string;
  type: string;
  description: string;
  required: boolean;
  default?: any;
}

export interface SlotSpec {
  name: string;
  description: string;
  required: boolean;
  default?: React.ComponentType;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number;
}

export interface ValidationError {
  type: 'error';
  message: string;
  file?: string;
  line?: number;
  column?: number;
  rule: string;
}

export interface ValidationWarning {
  type: 'warning';
  message: string;
  file?: string;
  line?: number;
  column?: number;
  rule: string;
}

/**
 * Key Benefits of Validation & Governance:
 *
 * 1. Quality Assurance: Catch issues before they reach production
 * 2. Consistency: Ensure all components follow the same standards
 * 3. Accessibility: Validate accessibility requirements automatically
 * 4. Performance: Catch performance issues early
 * 5. Maintainability: Keep the system healthy as it scales
 */

// Example: Component Structure Validation
export function validateComponentStructure(
  component: ComponentSpec
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Required files validation
  const requiredFiles = [
    { name: 'index.tsx', type: 'component' as const, required: true },
    { name: 'Component.tsx', type: 'component' as const, required: true },
    { name: 'Component.module.scss', type: 'styles' as const, required: true },
    { name: 'Component.tokens.json', type: 'tokens' as const, required: true },
  ];

  for (const requiredFile of requiredFiles) {
    const file = component.files.find((f) => f.name === requiredFile.name);
    if (!file) {
      errors.push({
        type: 'error',
        message: `Required file missing: ${requiredFile.name}`,
        rule: 'required-files',
      });
    }
  }

  // Layer-specific validation
  if (component.layer === 'composer') {
    const hasProvider = component.files.some((f) =>
      f.name.includes('Provider')
    );
    const hasHook = component.files.some((f) => f.name.includes('use'));

    if (!hasProvider) {
      errors.push({
        type: 'error',
        message: 'Composer components must include a Provider file',
        rule: 'composer-structure',
      });
    }

    if (!hasHook) {
      errors.push({
        type: 'error',
        message: 'Composer components must include a headless hook',
        rule: 'composer-structure',
      });
    }
  }

  // Export validation
  const requiredExports = ['Component'];
  if (component.layer === 'composer') {
    requiredExports.push('Provider', 'useComponent');
  }

  for (const requiredExport of requiredExports) {
    const export_ = component.exports.find((e) => e.name === requiredExport);
    if (!export_) {
      errors.push({
        type: 'error',
        message: `Required export missing: ${requiredExport}`,
        rule: 'required-exports',
      });
    }
  }

  // Token usage validation
  const hasTokenUsage = component.files.some(
    (f) => f.type === 'styles' && f.content?.includes('var(--')
  );

  if (!hasTokenUsage) {
    warnings.push({
      type: 'warning',
      message: 'Component styles should use design tokens',
      rule: 'token-usage',
    });
  }

  // Accessibility validation
  if (component.accessibility.roles.length === 0) {
    warnings.push({
      type: 'warning',
      message: 'Component should define accessibility roles',
      rule: 'accessibility-roles',
    });
  }

  const score = calculateValidationScore(errors, warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score,
  };
}

// Example: Token Validation
export function validateTokens(tokens: TokenSpec[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check for duplicate token names
  const names = tokens.map((t) => t.name);
  const duplicates = names.filter(
    (name, index) => names.indexOf(name) !== index
  );

  for (const duplicate of duplicates) {
    errors.push({
      type: 'error',
      message: `Duplicate token name: ${duplicate}`,
      rule: 'unique-names',
    });
  }

  // Validate token values
  for (const token of tokens) {
    if (!token.value) {
      errors.push({
        type: 'error',
        message: `Token ${token.name} has no value`,
        rule: 'token-value',
      });
    }

    // Validate color tokens
    if (token.type === 'color') {
      if (!isValidColor(token.value)) {
        errors.push({
          type: 'error',
          message: `Invalid color value for token ${token.name}: ${token.value}`,
          rule: 'color-format',
        });
      }
    }

    // Validate spacing tokens
    if (token.type === 'spacing') {
      if (!isValidSpacing(token.value)) {
        errors.push({
          type: 'error',
          message: `Invalid spacing value for token ${token.name}: ${token.value}`,
          rule: 'spacing-format',
        });
      }
    }
  }

  const score = calculateValidationScore(errors, warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score,
  };
}

// Example: Accessibility Validation
export function validateAccessibility(
  component: ComponentSpec
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check for required ARIA attributes
  const hasAriaLabel = component.files.some(
    (f) =>
      f.content?.includes('aria-label') ||
      f.content?.includes('aria-labelledby')
  );

  if (!hasAriaLabel) {
    warnings.push({
      type: 'warning',
      message: 'Component should have proper labeling for screen readers',
      rule: 'aria-labeling',
    });
  }

  // Check for keyboard navigation
  const hasKeyboardHandlers = component.files.some(
    (f) => f.content?.includes('onKeyDown') || f.content?.includes('onKeyUp')
  );

  if (!hasKeyboardHandlers && component.layer !== 'primitive') {
    warnings.push({
      type: 'warning',
      message: 'Interactive components should support keyboard navigation',
      rule: 'keyboard-navigation',
    });
  }

  // Check for focus management
  const hasFocusManagement = component.files.some(
    (f) => f.content?.includes('focus') || f.content?.includes('blur')
  );

  if (!hasFocusManagement && component.layer === 'composer') {
    warnings.push({
      type: 'warning',
      message: 'Composer components should manage focus properly',
      rule: 'focus-management',
    });
  }

  const score = calculateValidationScore(errors, warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score,
  };
}

// Example: API Validation
export function validateAPI(component: ComponentSpec): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check for TypeScript types
  const hasTypes = component.files.some((f) => f.type === 'types');

  if (!hasTypes && component.layer === 'composer') {
    warnings.push({
      type: 'warning',
      message: 'Composer components should have TypeScript type definitions',
      rule: 'typescript-types',
    });
  }

  // Check for proper prop documentation
  for (const prop of component.props) {
    if (!prop.description) {
      warnings.push({
        type: 'warning',
        message: `Prop ${prop.name} should have a description`,
        rule: 'prop-documentation',
      });
    }
  }

  // Check for consistent naming conventions
  const hasConsistentNaming = component.props.every((prop) =>
    /^[a-z][a-zA-Z0-9]*$/.test(prop.name)
  );

  if (!hasConsistentNaming) {
    errors.push({
      type: 'error',
      message: 'Props should follow camelCase naming convention',
      rule: 'naming-convention',
    });
  }

  const score = calculateValidationScore(errors, warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score,
  };
}

/**
 * Governance Strategies:
 *
 * 1. Automated Linting: Use ESLint, Prettier, and custom rules
 * 2. Design Review: Require design review for new components
 * 3. Documentation: Enforce documentation requirements
 * 4. Breaking Changes: Use semantic versioning and migration guides
 * 5. Performance: Monitor and enforce performance budgets
 */

// Example: Governance Rules
export interface GovernanceRule {
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  check: (component: ComponentSpec) => ValidationResult;
}

export const GOVERNANCE_RULES: GovernanceRule[] = [
  {
    name: 'required-files',
    description: 'All components must have required files',
    severity: 'error',
    check: validateComponentStructure,
  },
  {
    name: 'token-usage',
    description: 'Components should use design tokens',
    severity: 'warning',
    check: (component) => {
      const hasTokenUsage = component.files.some(
        (f) => f.type === 'styles' && f.content?.includes('var(--')
      );
      return {
        valid: hasTokenUsage,
        errors: hasTokenUsage
          ? []
          : [
              {
                type: 'error',
                message: 'Component styles should use design tokens',
                rule: 'token-usage',
              },
            ],
        warnings: [],
        score: hasTokenUsage ? 100 : 0,
      };
    },
  },
  {
    name: 'accessibility-roles',
    description: 'Components should define accessibility roles',
    severity: 'warning',
    check: (component) => {
      const hasRoles = component.accessibility.roles.length > 0;
      return {
        valid: true,
        errors: [],
        warnings: hasRoles
          ? []
          : [
              {
                type: 'warning',
                message: 'Component should define accessibility roles',
                rule: 'accessibility-roles',
              },
            ],
        score: hasRoles ? 100 : 50,
      };
    },
  },
];

// Example: Validation Pipeline
export function runValidationPipeline(
  component: ComponentSpec
): ValidationResult {
  const results: ValidationResult[] = [];

  // Run all governance rules
  for (const rule of GOVERNANCE_RULES) {
    results.push(rule.check(component));
  }

  // Run specific validations
  results.push(validateTokens(component.tokens));
  results.push(validateAccessibility(component));
  results.push(validateAPI(component));

  // Combine results
  const allErrors = results.flatMap((r) => r.errors);
  const allWarnings = results.flatMap((r) => r.warnings);
  const averageScore =
    results.reduce((sum, r) => sum + r.score, 0) / results.length;

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    score: averageScore,
  };
}

// Helper functions
function calculateValidationScore(
  errors: ValidationError[],
  warnings: ValidationWarning[]
): number {
  const errorPenalty = errors.length * 20;
  const warningPenalty = warnings.length * 5;
  return Math.max(0, 100 - errorPenalty - warningPenalty);
}

function isValidColor(value: string): boolean {
  // Basic color validation
  return (
    /^#[0-9A-Fa-f]{6}$/.test(value) ||
    /^rgb\(/.test(value) ||
    /^hsl\(/.test(value) ||
    /^var\(--/.test(value)
  );
}

function isValidSpacing(value: string): boolean {
  // Basic spacing validation
  return /^\d+(\.\d+)?(px|rem|em|%)$/.test(value) || /^var\(--/.test(value);
}

/**
 * When to Use Validation & Governance:
 *
 * Use Validation when:
 * - You have multiple teams working on the system
 * - Quality and consistency are critical
 * - You want to catch issues early
 * - You need to enforce standards automatically
 * - You want to measure system health
 *
 * Use Manual Review when:
 * - The system is small and stable
 * - Validation overhead is too high
 * - You need human judgment for complex decisions
 * - You're prototyping and speed is more important than quality
 */
