import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const config = [
  ...compat.extends('next/core-web-vitals', 'prettier'),
  eslintPluginPrettierRecommended,

  // TypeScript and React configuration
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'jsx-a11y': jsxA11y,
    },

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.json'],
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],

      // Accessibility rules
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/img-redundant-alt': 'warn',
      'jsx-a11y/interactive-supports-focus': 'error',
      'jsx-a11y/label-has-associated-control': 'error',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/no-redundant-roles': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
    },
  },
  ...compat
    .extends(
      'next/core-web-vitals',
      'plugin:@typescript-eslint/recommended',
      'prettier'
    )
    .map((config) => ({
      ...config,
      files: ['**/*.ts', '**/*.tsx'],
    })),
  {
    files: ['**/*.ts', '**/*.tsx'],

    languageOptions: {
      ecmaVersion: 5,
      sourceType: 'script',

      parserOptions: {
        project: ['./tsconfig.json'],
        projectService: true,
        tsconfigRootDir: '/Users/darianrosebrook/Desktop/Projects/portfolio',
      },
    },
  },
];

export default config;
