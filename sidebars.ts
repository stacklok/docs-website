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

    'toolhive/reference/client-compatibility',

    {
      type: 'category',
      label: 'ToolHive UI',
      description: 'How to use the ToolHive desktop application',
      link: {
        type: 'doc',
        id: 'toolhive/guides-ui/index',
      },
      items: [
        'toolhive/tutorials/quickstart-ui',
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
            'toolhive/guides-ui/group-management',
            'toolhive/guides-ui/secrets-management',
            'toolhive/guides-ui/network-isolation',
            'toolhive/guides-ui/customize-tools',
          ],
        },
        'toolhive/guides-ui/client-configuration',
        'toolhive/guides-ui/cli-access',
        'toolhive/guides-ui/mcp-optimizer',
        'toolhive/guides-ui/playground',
      ],
    },

    {
      type: 'category',
      label: 'ToolHive CLI',
      description: 'How to use the ToolHive CLI for managing MCP servers',
      link: {
        type: 'doc',
        id: 'toolhive/guides-cli/index',
      },
      items: [
        'toolhive/tutorials/quickstart-cli',
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
          label: 'Permissions and security',
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
        {
          type: 'category',
          label: 'Advanced workflows',
          description: 'Build, test, secure, and automate',
          collapsed: true,
          items: [
            'toolhive/guides-cli/auth',
            'toolhive/guides-cli/token-exchange',
            'toolhive/guides-cli/telemetry-and-metrics',
            'toolhive/guides-cli/test-mcp-servers',
            'toolhive/guides-cli/build-containers',
            'toolhive/guides-cli/advanced-cicd',
            'toolhive/tutorials/custom-registry',
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
          label: 'Command reference',
          description: 'Detailed reference for ToolHive CLI commands',
          collapsed: true,
          items: buildCliReferenceSidebar(),
        },
      ],
    },

    {
      type: 'category',
      label: 'Kubernetes Operator',
      description: 'How to deploy and manage ToolHive on Kubernetes',
      link: {
        type: 'doc',
        id: 'toolhive/guides-k8s/index',
      },
      items: [
        'toolhive/guides-k8s/intro',
        'toolhive/tutorials/quickstart-k8s',
        'toolhive/guides-k8s/deploy-operator',
        'toolhive/guides-k8s/run-mcp-k8s',
        'toolhive/guides-k8s/remote-mcp-proxy',
        'toolhive/guides-k8s/connect-clients',
        'toolhive/guides-k8s/customize-tools',
        'toolhive/guides-k8s/telemetry-and-metrics',
        'toolhive/guides-k8s/logging',
        'toolhive/guides-k8s/auth-k8s',
        'toolhive/guides-k8s/token-exchange-k8s',
        'toolhive/guides-k8s/deploy-registry',
        'toolhive/reference/crd-spec',
      ],
    },

    {
      type: 'category',
      label: 'Virtual MCP Server',
      description:
        'How to aggregate multiple MCP servers into a unified endpoint',
      link: {
        type: 'doc',
        id: 'toolhive/guides-vmcp/index',
      },
      items: [
        'toolhive/guides-vmcp/intro',
        'toolhive/tutorials/quickstart-vmcp',
        'toolhive/guides-vmcp/configuration',
        'toolhive/guides-vmcp/backend-discovery',
        'toolhive/guides-vmcp/authentication',
        'toolhive/guides-vmcp/tool-aggregation',
        'toolhive/guides-vmcp/composite-tools',
        'toolhive/guides-vmcp/failure-handling',
        'toolhive/guides-vmcp/telemetry-and-metrics',
        'toolhive/guides-vmcp/audit-logging',
        'toolhive/guides-vmcp/scaling-and-performance',
      ],
    },

    {
      type: 'category',
      label: 'Registry Server',
      description:
        'How to deploy and use the ToolHive Registry server to discover and access MCP servers',
      link: {
        type: 'doc',
        id: 'toolhive/guides-registry/index',
      },
      items: [
        'toolhive/guides-registry/configuration',
        'toolhive/guides-registry/authentication',
        'toolhive/guides-registry/database',
        'toolhive/guides-registry/telemetry-metrics',
        'toolhive/guides-registry/deployment',
        'toolhive/reference/registry-api',
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
        'toolhive/concepts/groups',
        'toolhive/concepts/tool-optimization',
        'toolhive/concepts/registry-criteria',
        'toolhive/concepts/observability',
        'toolhive/concepts/auth-framework',
        'toolhive/concepts/cedar-policies',
        'toolhive/concepts/backend-auth',
        'toolhive/concepts/vmcp',
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
        'toolhive/tutorials/mcp-optimizer',
        'toolhive/tutorials/custom-registry',
        'toolhive/tutorials/vault-integration',
        'toolhive/tutorials/opentelemetry',
        'toolhive/tutorials/k8s-ingress-ngrok',
      ],
    },

    {
      type: 'category',
      label: 'MCP server guides',
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
    'toolhive/support',
    'toolhive/contributing',
  ],
};

export default sidebars;
