import { includeIgnoreFile } from '@eslint/compat';
import { fileURLToPath } from 'node:url';
import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintReact from '@eslint-react/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import * as mdx from 'eslint-plugin-mdx';

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

/** @type {import('eslint').Linter.Config[]} */
export default [
  includeIgnoreFile(gitignorePath),
  // Auto-generated CLI docs (tracked in git but generated upstream)
  {
    ignores: [
      'docs/toolhive/reference/cli/',
      'docs/toolhive/reference/api-endpoints/',
      'docs/platform/reference/enterprise-manager-api/',
      'docs/toolhive/reference/registry-api-endpoints/',
      'docs/connector-gateway/reference/api-endpoints/',
      'docs/ai-gateway/reference/api-endpoints/',
    ],
  },
  // Configuration for Algolia's crawler runtime, maintained in its editor
  { ignores: ['internal/search/crawler.config.js'] },
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { languageOptions: { globals: globals.node } },

  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ...eslintReact.configs['recommended-typescript'],
    rules: {
      ...eslintReact.configs['recommended-typescript'].rules,
      // Preserve checks from eslint-plugin-react's recommended preset.
      '@eslint-react/no-missing-component-display-name': 'error',
      '@eslint-react/no-missing-context-display-name': 'error',
      '@eslint-react/jsx-no-children-prop': 'error',
      '@eslint-react/jsx-no-comment-textnodes': 'error',
      '@eslint-react/dom-no-unknown-property': 'error',
      '@eslint-react/dom-no-unsafe-target-blank': 'error',
    },
  },
  eslintConfigPrettier,

  // Configs for .mdx files
  {
    ...mdx.flat,
    processor: mdx.createRemarkProcessor({
      lintCodeBlocks: false,
      languageMapper: {},
    }),
    rules: {
      ...mdx.flat.rules,
      // ESLint 10 tracks JSX component references, including MDX globals.
      'no-undef': 'error',
      // MDX JSX expressions compile into the page component's render body.
      '@eslint-react/rules-of-hooks': 'off',
      'mdx/remark': 'off', // remark-lint's auto-fix clobbers MDX formatting
    },
    languageOptions: {
      ...mdx.flat.languageOptions,
      globals: {
        ...mdx.flat.languageOptions.globals,
        // Add global components from src/theme/MDXComponents.tsx here
        //Columns: 'readonly',
        //Column: 'readonly',
        Tabs: 'readonly',
        TabItem: 'readonly',
        MCPMetadata: 'readonly',
        EnterpriseBadge: 'readonly',
        CRDFields: 'readonly',
        CRDBackLink: 'readonly',
        CRDReference: 'readonly',
      },
    },
  },

  // Config for _partials with JSX props
  {
    files: ['docs/**/_partials/*.mdx'],
    languageOptions: {
      globals: { props: 'readonly' },
    },
    rules: {
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
];
