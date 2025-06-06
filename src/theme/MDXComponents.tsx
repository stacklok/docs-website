/*
    Extra components to load into the global scope.
    See https://docusaurus.io/docs/markdown-features/react#mdx-component-scope

    To avoid linting errors, add these to the `languageOptions.globals` section
    for mdx files in the `eslint.config.mjs` file
*/

import MDXComponents from '@theme-original/MDXComponents';

export default {
  // Reusing the default mapping
  ...MDXComponents,
};
