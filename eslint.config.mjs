import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import eslintConfigPrettier from 'eslint-config-prettier';
import * as mdx from 'eslint-plugin-mdx';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { ignores: ['.docusaurus/', 'build/', 'node_modules/'] },
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
    },
    languageOptions: {
      ...mdx.flat.languageOptions,
      globals: {
        ...mdx.flat.languageOptions.globals,
        // Add global components from src/theme/MDXComponents.tsx here
        //Columns: 'readonly',
        //Column: 'readonly',
      },
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
