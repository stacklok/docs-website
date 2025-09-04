/*
    Extra components to load into the global scope.
    See https://docusaurus.io/docs/markdown-features/react#mdx-component-scope

    To avoid linting errors, add these to the `languageOptions.globals` section
    for mdx files in the `eslint.config.mjs` file
*/

import MDXComponents from '@theme-original/MDXComponents';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import MCPMetadata from '@site/src/components/MCPMetadata';

export default {
  // Reusing the default mapping
  ...MDXComponents,
  // Add custom components
  Tabs,
  TabItem,
  MCPMetadata,
};
