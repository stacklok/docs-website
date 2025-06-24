import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';
import { buildCliReferenceSidebar } from './src/utils/buildHierarchicalSidebar';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  toolhiveSidebar: [
    'toolhive/index',

    {
      type: 'category',
      label: 'Tutorials',
      description: 'Step-by-step guides to get started with ToolHive',
      link: {
        type: 'generated-index',
        slug: 'toolhive/tutorials',
        description:
          'Learn how to use ToolHive with these step-by-step tutorials',
      },
      collapsed: false,
      items: [
        'toolhive/tutorials/quickstart-ui',
        'toolhive/tutorials/quickstart-cli',
        'toolhive/tutorials/quickstart-k8s',
      ],
    },

    'toolhive/reference/client-compatibility',

    {
      type: 'category',
      label: 'Guides: ToolHive UI',
      description: 'How to use the ToolHive desktop application',
      link: {
        type: 'doc',
        id: 'toolhive/guides-ui/index',
      },
      items: [
        'toolhive/guides-ui/install',
        'toolhive/guides-ui/run-mcp-servers',
        'toolhive/guides-ui/network-isolation',
        'toolhive/guides-ui/secrets-management',
        'toolhive/guides-ui/client-configuration',
      ],
    },

    {
      type: 'category',
      label: 'Guides: ToolHive CLI',
      description: 'How to use the ToolHive CLI for managing MCP servers',
      link: {
        type: 'doc',
        id: 'toolhive/guides-cli/index',
      },
      items: [
        'toolhive/guides-cli/install',
        'toolhive/guides-cli/registry',
        'toolhive/guides-cli/run-mcp-servers',
        'toolhive/guides-cli/manage-mcp-servers',
        'toolhive/guides-cli/secrets-management',
        'toolhive/guides-cli/client-configuration',
        'toolhive/guides-cli/custom-permissions',
        'toolhive/guides-cli/telemetry-and-metrics',
        {
          type: 'category',
          label: 'Command reference',
          description: 'Detailed reference for ToolHive CLI commands',
          collapsed: true,
          items: buildCliReferenceSidebar(),
        },
        {
          type: 'category',
          label: 'API server',
          description: 'How to set up and use the ToolHive API server',
          link: {
            type: 'doc',
            id: 'toolhive/guides-cli/api-server',
          },
          items: ['toolhive/reference/api'],
        },
      ],
    },

    {
      type: 'category',
      label: 'Guides: Kubernetes Operator',
      description: 'How to deploy and manage ToolHive on Kubernetes',
      link: {
        type: 'doc',
        id: 'toolhive/guides-k8s/index',
      },
      items: [
        'toolhive/guides-k8s/intro',
        'toolhive/guides-k8s/deploy-operator-helm',
        'toolhive/guides-k8s/run-mcp-k8s',
        'toolhive/reference/crd-spec',
      ],
    },

    {
      type: 'category',
      label: 'Concepts',
      description: 'Core concepts and architecture of ToolHive and MCP',
      link: {
        type: 'generated-index',
        slug: 'toolhive/concepts',
        description:
          'Learn about the key concepts behind ToolHive and the Model Context Protocol (MCP)',
      },
      items: [
        'toolhive/concepts/mcp-primer',
        'toolhive/concepts/registry-criteria',
        'toolhive/concepts/observability',
      ],
    },

    'toolhive/faq',
  ],
};

export default sidebars;
