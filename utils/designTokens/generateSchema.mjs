#!/usr/bin/env node

/**
 * Design Tokens Schema Generator
 *
 * Generates a JSON schema for validating design token files based on the W3C Design Tokens specification
 * and our custom extensions. This schema is used during the build process to validate token files.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

const SCHEMA_OUTPUT_PATH = path.join(
  PROJECT_ROOT,
  'ui',
  'designTokens',
  'designTokens.schema.json'
);

/**
 * W3C Design Tokens Core Types
 */
const W3C_TYPES = [
  'color',
  'dimension',
  'fontFamily',
  'fontWeight',
  'duration',
  'cubicBezier',
  'number',
  'border',
  'transition',
  'shadow',
  'gradient',
  'typography',
];

/**
 * Our Custom Extension Types
 */
const CUSTOM_TYPES = [
  'opacity', // Transparency values (0-1)
  'spacing', // Layout spacing dimensions
  'radius', // Border radius values
  'elevation', // Shadow and depth values
  'motion', // Animation and transition values
  'layout', // Layout and container dimensions
  'interaction', // Interactive state values
  'string', // Text and string values
  'keyframes', // CSS animation keyframes
  'strokeStyle', // SVG stroke styling
];

/**
 * Generate the base token schema
 */
function generateTokenSchema() {
  return {
    type: 'object',
    properties: {
      $value: {
        description: 'The value of the design token',
        oneOf: [
          { type: 'string' },
          { type: 'number' },
          { type: 'boolean' },
          { type: 'array' },
          { type: 'object' },
        ],
      },
      $type: {
        description: 'The type of the design token',
        type: 'string',
        enum: [...W3C_TYPES, ...CUSTOM_TYPES],
      },
      $description: {
        description: 'A human-readable description of the design token',
        type: 'string',
      },
      $extensions: {
        description: 'Platform-specific extensions',
        type: 'object',
        properties: {
          design: {
            type: 'object',
            description: 'Design system specific extensions',
            properties: {
              paths: {
                type: 'object',
                description:
                  'Theme-specific token references for light/dark modes',
                properties: {
                  light: {
                    type: 'string',
                    description:
                      'Token reference for light mode (e.g., "{core.color.palette.neutral.600}")',
                    pattern: '^\\{[^}]+\\}$',
                  },
                  dark: {
                    type: 'string',
                    description:
                      'Token reference for dark mode (e.g., "{core.color.palette.neutral.300}")',
                    pattern: '^\\{[^}]+\\}$',
                  },
                },
                additionalProperties: true,
              },
              calc: {
                type: 'string',
                description:
                  'CSS calc() expression with token substitution (e.g., "calc({spacing.size.04} + 2px)")',
                pattern: '^calc\\(.*\\{.*\\}.*\\)$',
              },
            },
            additionalProperties: true,
          },
        },
        additionalProperties: true,
      },
    },
    additionalProperties: true,
  };
}

/**
 * Generate the group schema (for token groups)
 */
function generateGroupSchema() {
  return {
    type: 'object',
    properties: {
      $type: {
        description: 'The type inherited by all tokens in this group',
        type: 'string',
        enum: [...W3C_TYPES, ...CUSTOM_TYPES],
      },
      $description: {
        description: 'A human-readable description of the token group',
        type: 'string',
      },
    },
    patternProperties: {
      '^(?!\\$).*': {
        anyOf: [
          { $ref: '#/$defs/token' },
          { $ref: '#/$defs/group' },
          { type: 'object' },
        ],
      },
    },
    additionalProperties: true,
  };
}

/**
 * Generate type-specific validation schemas
 */
function generateTypeSchemas() {
  return {
    colorToken: {
      allOf: [
        { $ref: '#/$defs/token' },
        {
          properties: {
            $type: { const: 'color' },
            $value: {
              oneOf: [
                { type: 'string', pattern: '^#[0-9a-fA-F]{3,8}$' }, // hex
                { type: 'string', pattern: '^rgb\\(' }, // rgb()
                { type: 'string', pattern: '^hsl\\(' }, // hsl()
                { type: 'string', pattern: '^oklch\\(' }, // oklch()
                { type: 'string', pattern: '^\\{[^}]+\\}$' }, // token reference
              ],
            },
          },
        },
      ],
    },
    dimensionToken: {
      allOf: [
        { $ref: '#/$defs/token' },
        {
          properties: {
            $type: { const: 'dimension' },
            $value: {
              oneOf: [
                {
                  type: 'string',
                  pattern: '^[0-9]+(px|rem|em|%|vh|vw|vmin|vmax)$',
                },
                { type: 'number' },
                { type: 'string', pattern: '^\\{[^}]+\\}$' },
              ],
            },
          },
        },
      ],
    },
    numberToken: {
      allOf: [
        { $ref: '#/$defs/token' },
        {
          properties: {
            $type: { const: 'number' },
            $value: {
              oneOf: [
                { type: 'number' },
                { type: 'string', pattern: '^\\{[^}]+\\}$' },
              ],
            },
          },
        },
      ],
    },
    fontFamilyToken: {
      allOf: [
        { $ref: '#/$defs/token' },
        {
          properties: {
            $type: { const: 'fontFamily' },
            $value: {
              oneOf: [
                { type: 'string' },
                { type: 'array', items: { type: 'string' } },
                { type: 'string', pattern: '^\\{[^}]+\\}$' },
              ],
            },
          },
        },
      ],
    },
    shadowToken: {
      allOf: [
        { $ref: '#/$defs/token' },
        {
          properties: {
            $type: { const: 'shadow' },
            $value: {
              oneOf: [
                {
                  type: 'object',
                  properties: {
                    offsetX: { type: 'string' },
                    offsetY: { type: 'string' },
                    blur: { type: 'string' },
                    spread: { type: 'string' },
                    color: { type: 'string' },
                    inset: { type: 'boolean' },
                  },
                  required: ['offsetX', 'offsetY', 'blur', 'color'],
                },
                {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      offsetX: { type: 'string' },
                      offsetY: { type: 'string' },
                      blur: { type: 'string' },
                      spread: { type: 'string' },
                      color: { type: 'string' },
                      inset: { type: 'boolean' },
                    },
                    required: ['offsetX', 'offsetY', 'blur', 'color'],
                  },
                },
                { type: 'string', pattern: '^\\{[^}]+\\}$' },
              ],
            },
          },
        },
      ],
    },
  };
}

/**
 * Generate the complete schema
 */
function generateCompleteSchema() {
  const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: 'https://darianrosebrook.com/ui/designTokens/designTokens.schema.json',
    title: 'Design Tokens Schema',
    description:
      'A JSON schema for validating design token files according to the W3C Design Tokens specification with custom extensions',
    type: 'object',

    $defs: {
      token: generateTokenSchema(),
      group: generateGroupSchema(),
      ...generateTypeSchemas(),
    },

    patternProperties: {
      '^(?!\\$).*': {
        anyOf: [
          { $ref: '#/$defs/token' },
          { $ref: '#/$defs/group' },
          { type: 'object' },
        ],
      },
    },

    additionalProperties: true, // Allow flexibility for custom properties

    // Removed strict validation rules to allow flexible token structure
  };

  return schema;
}

/**
 * Main function to generate and write the schema
 */
function generateSchema() {
  console.log('[schema] Generating design tokens JSON schema...');

  const schema = generateCompleteSchema();

  // Ensure output directory exists
  const outputDir = path.dirname(SCHEMA_OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write schema file
  fs.writeFileSync(SCHEMA_OUTPUT_PATH, JSON.stringify(schema, null, 2));

  console.log(
    `[schema] Generated schema at ${path.relative(PROJECT_ROOT, SCHEMA_OUTPUT_PATH)}`
  );
  console.log(
    `[schema] Schema supports ${W3C_TYPES.length} W3C types and ${CUSTOM_TYPES.length} custom types`
  );

  return schema;
}

// Export for use in other modules
export { generateSchema, generateCompleteSchema };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSchema();
}
