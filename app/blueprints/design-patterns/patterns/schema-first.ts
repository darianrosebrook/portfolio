// Schema-First Design Pattern
// Define contracts that ensure consistency across implementations

/**
 * Schemas define the contract between different parts of your system, ensuring
 * consistency and enabling powerful tooling and validation.
 */

// Example: Rich Text Editor Schema (from example5.md)
export const nodes = {
  doc: { content: 'block+' },
  paragraph: { content: 'inline*', group: 'block' },
  text: { group: 'inline' },

  heading1: { group: 'block', content: 'inline*' },
  heading2: { group: 'block', content: 'inline*' },

  bullet_list: { group: 'block', content: 'list_item+' },
  ordered_list: { group: 'block', content: 'list_item+' },
  list_item: { content: 'paragraph block*' },
  task_list: { group: 'block', content: 'task_item+' },
  task_item: {
    attrs: { checked: { default: false } },
    content: 'paragraph block*',
  },

  blockquote: { group: 'block', content: 'block+' },
  code_block: { group: 'block', content: 'text*' },
  horizontal_rule: { group: 'block' },

  // inlines
  link: {
    inline: true,
    group: 'inline',
    attrs: { href: {}, title: { default: null } },
    content: 'text*',
  },
  mention: {
    inline: true,
    group: 'inline',
    attrs: { id: {}, label: {} },
  },
  emoji: {
    inline: true,
    group: 'inline',
    attrs: { shortcode: {} },
  },

  // media (optional)
  image: {
    group: 'block',
    attrs: { src: {}, alt: { default: '' } },
  },
};

export const marks = {
  bold: {},
  italic: {},
  underline: {},
  code: {},
};

export interface Schema {
  nodes: Record<string, NodeSpec>;
  marks: Record<string, MarkSpec>;
}

export interface NodeSpec {
  content?: string;
  group?: string;
  inline?: boolean;
  attrs?: Record<string, AttrSpec>;
}

export interface MarkSpec {
  attrs?: Record<string, AttrSpec>;
}

export interface AttrSpec {
  default?: any;
  type?: string;
}

/**
 * Key Benefits of Schema-First Design:
 *
 * 1. Clear Contracts: Schemas define exactly what's allowed
 * 2. Type Safety: Automatic TypeScript generation from schemas
 * 3. Validation: Runtime validation ensures data integrity
 * 4. Tooling: Better IDE support and code generation
 * 5. Evolution: Schemas can be versioned and migrated
 */

// Example: Component Schema (from component-standards)
export interface ComponentSchema {
  name: string;
  layer: 'primitive' | 'compound' | 'composer';
  description: string;
  metaPatterns: string[];
  folder: string;
  props: PropSpec[];
  slots: SlotSpec[];
  tokens: TokenSpec[];
  accessibility: AccessibilitySpec;
  examples: ExampleSpec[];
}

export interface PropSpec {
  name: string;
  type: string;
  description: string;
  required?: boolean;
  default?: any;
  validation?: ValidationRule[];
}

export interface SlotSpec {
  name: string;
  description: string;
  required?: boolean;
  default?: React.ComponentType;
}

export interface TokenSpec {
  name: string;
  type: 'color' | 'spacing' | 'typography' | 'radius' | 'shadow';
  value: string;
  description: string;
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

export interface ExampleSpec {
  name: string;
  description: string;
  code: string;
  props: Record<string, any>;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

// Example: Design Token Schema
export interface TokenSchema {
  version: string;
  tokens: {
    color: ColorTokenGroup;
    spacing: SpacingTokenGroup;
    typography: TypographyTokenGroup;
    radius: RadiusTokenGroup;
    shadow: ShadowTokenGroup;
  };
}

export interface ColorTokenGroup {
  [key: string]: {
    value: string;
    description: string;
    usage: string[];
    contrast?: {
      light: number;
      dark: number;
    };
  };
}

export interface SpacingTokenGroup {
  [key: string]: {
    value: string;
    description: string;
    usage: string[];
  };
}

export interface TypographyTokenGroup {
  [key: string]: {
    fontFamily?: string;
    fontSize: string;
    fontWeight?: string;
    lineHeight?: string;
    letterSpacing?: string;
    description: string;
    usage: string[];
  };
}

export interface RadiusTokenGroup {
  [key: string]: {
    value: string;
    description: string;
    usage: string[];
  };
}

export interface ShadowTokenGroup {
  [key: string]: {
    value: string;
    description: string;
    usage: string[];
  };
}

/**
 * Schema Evolution Strategies:
 *
 * 1. Versioning: Use semantic versioning for schema changes
 * 2. Migration: Provide migration paths for breaking changes
 * 3. Deprecation: Mark old fields as deprecated before removing
 * 4. Validation: Use schema validation to catch breaking changes
 * 5. Documentation: Keep schema documentation up to date
 */

// Example: Schema Validation
export function validateComponentSchema(component: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!component.name) errors.push('Component name is required');
  if (!component.layer) errors.push('Component layer is required');
  if (!component.description) errors.push('Component description is required');

  // Layer validation
  const validLayers = ['primitive', 'compound', 'composer'];
  if (component.layer && !validLayers.includes(component.layer)) {
    errors.push(
      `Invalid layer: ${component.layer}. Must be one of: ${validLayers.join(', ')}`
    );
  }

  // Props validation
  if (component.props) {
    component.props.forEach((prop: PropSpec, index: number) => {
      if (!prop.name) errors.push(`Prop ${index}: name is required`);
      if (!prop.type) errors.push(`Prop ${index}: type is required`);
      if (!prop.description)
        warnings.push(`Prop ${index}: description is recommended`);
    });
  }

  // Accessibility validation
  if (component.accessibility) {
    if (
      !component.accessibility.roles ||
      component.accessibility.roles.length === 0
    ) {
      warnings.push('Accessibility roles are recommended');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Schema-First Design Principles:
 *
 * 1. Define First: Create schemas before implementation
 * 2. Validate Always: Use schemas for runtime validation
 * 3. Generate Code: Use schemas to generate TypeScript types
 * 4. Document Everything: Schemas serve as living documentation
 * 5. Evolve Carefully: Plan for schema evolution and migration
 */

// Example: Schema Code Generation
export function generateTypeScriptTypes(schema: ComponentSchema): string {
  const props = schema.props
    .map((prop) => {
      const optional = prop.required ? '' : '?';
      const defaultValue = prop.default
        ? ` = ${JSON.stringify(prop.default)}`
        : '';
      return `  ${prop.name}${optional}: ${prop.type}${defaultValue};`;
    })
    .join('\n');

  return `
export interface ${schema.name}Props {
${props}
}

export interface ${schema.name}Slots {
${schema.slots.map((slot) => `  ${slot.name}: React.ComponentType;`).join('\n')}
}
  `.trim();
}

/**
 * When to Use Schema-First Design:
 *
 * Use Schemas when:
 * - You have complex data structures that need validation
 * - Multiple teams need to work with the same data
 * - You want to generate code from specifications
 * - You need to ensure data consistency across systems
 * - You want to enable powerful tooling and IDE support
 *
 * Use Direct Types when:
 * - Data structures are simple and stable
 * - You don't need runtime validation
 * - Performance is critical and schema overhead is too much
 * - You're prototyping and schemas would slow you down
 */
