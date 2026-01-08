import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
// jsx-a11y is included in next/core-web-vitals, no need to import separately
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import nextConfig from 'eslint-config-next/core-web-vitals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

// Load configs once to avoid circular references
// Use direct import for Next.js config if it's flat config, otherwise use compat
let nextConfigFlat;
try {
  // Try to use Next.js config directly if it exports flat config
  if (typeof nextConfig === 'function') {
    nextConfigFlat = nextConfig();
  } else if (Array.isArray(nextConfig)) {
    nextConfigFlat = nextConfig;
  } else {
    // Fallback to compat if direct import doesn't work
    nextConfigFlat = compat.extends('next/core-web-vitals');
  }
} catch {
  // Fallback to compat
  nextConfigFlat = compat.extends('next/core-web-vitals');
}

const prettierConfig = compat.extends('prettier');
const tsRecommendedConfig = compat.extends(
  'plugin:@typescript-eslint/recommended'
);

const config = [
  // Ignore blueprint pattern samples from lint for now
  { ignores: ['app/blueprints/design-patterns/patterns/**'] },

  // Base Next.js configuration
  ...(Array.isArray(nextConfigFlat) ? nextConfigFlat : [nextConfigFlat]),
  ...prettierConfig,
  eslintPluginPrettierRecommended,

  // TypeScript and React configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': typescriptEslint,
      // Note: jsx-a11y is already included in next/core-web-vitals config
      // Only add jsx-a11y rules, not the plugin itself to avoid conflicts
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
        allowDefaultProject: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
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

  // Apply TypeScript recommended rules
  ...tsRecommendedConfig.map((config) => ({
    ...config,
    files: ['**/*.ts', '**/*.tsx'],
  })),

  // Overrides for blueprint docs content to reduce noise during authoring
  {
    files: ['app/blueprints/**'],
    languageOptions: {
      parserOptions: {
        // Disable type-aware linting for blueprint samples excluded from tsconfig
        project: null,
      },
    },
    rules: {
      'react/no-unescaped-entities': 'off',
      'react/jsx-no-undef': 'off',
      'jsx-a11y/role-supports-aria-props': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'prettier/prettier': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  // Allow require() usage in specific demo file
  {
    files: ['app/component-displaycase/component-grid.client.tsx'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'prettier/prettier': 'off',
    },
  },
];

export default config;
