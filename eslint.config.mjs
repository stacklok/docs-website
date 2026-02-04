import { includeIgnoreFile } from '@eslint/compat';
import { fileURLToPath } from 'node:url';
import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import eslintConfigPrettier from 'eslint-config-prettier';
import * as mdx from 'eslint-plugin-mdx';

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

/** @type {import('eslint').Linter.Config[]} */
export default [
  includeIgnoreFile(gitignorePath),
  // Auto-generated CLI docs (tracked in git but generated upstream)
  { ignores: ['docs/toolhive/reference/cli/'] },
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { languageOptions: { globals: globals.node } },

  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
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
      'react/no-unescaped-entities': 'off',
      'react/jsx-no-undef': ['error', { allowGlobals: true }],
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
      },
    },
  },

  // Config for _partials with JSX props
  {
    files: ['docs/**/_partials/*.mdx'],
    rules: {
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-undef': 'off',
    },
  },

  {
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
