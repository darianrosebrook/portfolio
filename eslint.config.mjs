import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
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
  // Base configuration for all files
  ...compat.extends('next/core-web-vitals', 'prettier'),
  eslintPluginPrettierRecommended,

  // TypeScript-specific configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': typescriptEslint,
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
      // Add any custom TypeScript rules here
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/prefer-const': 'warn',
    },
  },

  // Apply TypeScript recommended rules
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
];

export default config;
