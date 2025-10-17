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
      label: 'Get started',
      description: 'Step-by-step guides to get started with ToolHive',
      link: {
        type: 'generated-index',
        slug: 'toolhive/quickstart',
        description:
          'Learn how to use ToolHive with these step-by-step tutorials.',
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
        'toolhive/guides-ui/registry',
        {
          type: 'category',
          label: 'Run MCP servers',
          description: 'How to install and run MCP servers in the ToolHive UI',
          collapsed: false,
          collapsible: false,
          link: {
            type: 'doc',
            id: 'toolhive/guides-ui/run-mcp-servers',
          },
          items: [
            'toolhive/guides-ui/secrets-management',
            'toolhive/guides-ui/network-isolation',
          ],
        },
        'toolhive/guides-ui/client-configuration',
        'toolhive/guides-ui/playground',
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
        {
          type: 'category',
          label: 'Run MCP servers',
          description: 'How to run MCP servers with the ToolHive CLI',
          collapsed: false,
          collapsible: false,
          link: {
            type: 'doc',
            id: 'toolhive/guides-cli/run-mcp-servers',
          },
          items: [
            'toolhive/guides-cli/manage-mcp-servers',
            'toolhive/guides-cli/group-management',
            'toolhive/guides-cli/secrets-management',
          ],
        },
        'toolhive/guides-cli/client-configuration',
        {
          type: 'category',
          label: 'Custom permissions',
          description:
            'How to configure filesystem and network access for MCP servers',
          collapsed: false,
          collapsible: false,
          link: {
            type: 'doc',
            id: 'toolhive/guides-cli/custom-permissions',
          },
          items: [
            'toolhive/guides-cli/filesystem-access',
            'toolhive/guides-cli/thvignore',
            'toolhive/guides-cli/network-isolation',
          ],
        },
        'toolhive/guides-cli/telemetry-and-metrics',
        'toolhive/guides-cli/auth',
        'toolhive/guides-cli/build-containers',
        'toolhive/guides-cli/advanced-cicd',
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
        'toolhive/guides-k8s/customize-tools',
        'toolhive/guides-k8s/telemetry-and-metrics',
        'toolhive/guides-k8s/logging',
        'toolhive/guides-k8s/auth-k8s',
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
          'Learn about the key concepts behind ToolHive and the Model Context Protocol (MCP).',
      },
      items: [
        'toolhive/concepts/mcp-primer',
        'toolhive/concepts/registry-criteria',
        'toolhive/concepts/observability',
        'toolhive/concepts/auth-framework',
        'toolhive/concepts/cedar-policies',
      ],
    },

    {
      type: 'category',
      label: 'Tutorials',
      description: 'Step-by-step guides to using ToolHive effectively',
      link: {
        type: 'generated-index',
        slug: 'toolhive/tutorials',
        description:
          'Learn how to use ToolHive with these step-by-step tutorials.',
      },
      items: [
        {
          type: 'link',
          href: '/toolhive/quickstart',
          label: 'Quickstart guides',
        },
        'toolhive/tutorials/custom-registry',
        'toolhive/tutorials/vault-integration',
        'toolhive/tutorials/opentelemetry',
      ],
    },

    {
      type: 'category',
      label: 'Guides: MCP server usage',
      description:
        'How to configure and use MCP servers for different use cases',
      link: {
        type: 'generated-index',
        slug: 'toolhive/guides-mcp',
        title: 'MCP server usage guides',
        description:
          'These guides provide step-by-step instructions for using various MCP servers with ToolHive. They cover everything from installation to advanced configuration options.',
      },
      items: [{ type: 'autogenerated', dirName: 'toolhive/guides-mcp' }],
    },

    'toolhive/faq',
  ],
};

export default sidebars;
