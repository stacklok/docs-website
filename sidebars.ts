import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';
import { buildCliReferenceSidebar } from './src/utils/buildHierarchicalSidebar';
import { loadCrdSidebar } from './scripts/lib/crd-sets.mjs';

type SidebarItemConfig = SidebarsConfig[string] extends (infer T)[] ? T : never;

// CRD reference sidebar fragments, loaded by set key (the basename of each
// set's output dir in .github/upstream-projects.yaml). The fragments are
// generated; where each one nests in the nav below is editorial.
const crdSidebar = loadCrdSidebar('toolhive-crds') as SidebarItemConfig;
const enterpriseCrdSidebar = loadCrdSidebar(
  'enterprise-crds'
) as SidebarItemConfig;

const mcpSidebar: SidebarsConfig[string] = [
  'toolhive/index',
  {
    type: 'html',
    value: 'Run ToolHive',
    className: 'sidebar-title',
    defaultStyle: false,
  },

  {
    type: 'category',
    label: 'ToolHive UI',
    description: 'How to use the ToolHive desktop application',
    link: {
      type: 'doc',
      id: 'toolhive/guides-ui/index',
    },
    items: [
      'toolhive/guides-ui/quickstart',
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
          'toolhive/guides-ui/configure-mcp-servers',
          'toolhive/guides-ui/group-management',
          'toolhive/guides-ui/secrets-management',
          'toolhive/guides-ui/network-isolation',
          'toolhive/guides-ui/customize-tools',
        ],
      },
      'toolhive/guides-ui/client-configuration',
      {
        type: 'category',
        label: 'Skills',
        description:
          'How to install, build, and manage agent skills from the ToolHive UI',
        collapsed: false,
        collapsible: false,
        link: {
          type: 'doc',
          id: 'toolhive/guides-ui/skills',
        },
        items: [
          'toolhive/guides-ui/skills-browse-install',
          'toolhive/guides-ui/skills-build',
          'toolhive/guides-ui/skills-manage',
        ],
      },
      'toolhive/guides-ui/playground',
      'toolhive/guides-ui/cli-access',
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
      'toolhive/guides-cli/quickstart',
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
          'toolhive/guides-cli/run-remote-mcp-servers',
          'toolhive/guides-cli/configure-mcp-servers',
          'toolhive/guides-cli/manage-mcp-servers',
          'toolhive/guides-cli/group-management',
          'toolhive/guides-cli/secrets-management',
        ],
      },
      'toolhive/guides-cli/client-configuration',
      'toolhive/guides-cli/skills-management',
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
          'toolhive/guides-cli/webhooks',
          'toolhive/guides-cli/telemetry-and-metrics',
          'toolhive/guides-cli/test-mcp-servers',
          'toolhive/guides-cli/build-containers',
          'toolhive/guides-cli/advanced-cicd',
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
      'toolhive/guides-k8s/quickstart',
      'toolhive/guides-k8s/deploy-operator',
      'toolhive/guides-k8s/run-mcp-k8s',
      'toolhive/guides-k8s/remote-mcp-proxy',
      'toolhive/guides-k8s/mcp-server-entry',
      'toolhive/guides-k8s/connect-clients',
      'toolhive/guides-k8s/customize-tools',
      {
        type: 'category',
        label: 'Authentication and authorization',
        description:
          'How to secure MCP servers with authentication and authorization',
        collapsed: false,
        collapsible: false,
        link: {
          type: 'doc',
          id: 'toolhive/guides-k8s/auth-k8s',
        },
        items: [
          'toolhive/guides-k8s/embedded-auth-server-k8s',
          'toolhive/guides-k8s/authorization-k8s',
          'toolhive/guides-k8s/token-exchange-k8s',
        ],
      },
      'toolhive/guides-k8s/redis-session-storage',
      'toolhive/guides-k8s/rate-limiting',
      'toolhive/guides-k8s/telemetry-and-metrics',
      'toolhive/guides-k8s/logging',
      'toolhive/guides-k8s/migrate-to-v1beta1',
      crdSidebar,
    ],
  },

  {
    type: 'html',
    value: 'Platform capabilities',
    className: 'sidebar-title',
    defaultStyle: false,
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
      'toolhive/guides-vmcp/quickstart',
      'toolhive/guides-vmcp/configuration',
      'toolhive/guides-vmcp/backend-discovery',
      {
        type: 'category',
        label: 'Authentication and authorization',
        description:
          'How to secure vMCP with client authentication, authorization, and backend auth',
        collapsed: false,
        collapsible: false,
        link: {
          type: 'doc',
          id: 'toolhive/guides-vmcp/authentication',
        },
        items: ['toolhive/guides-vmcp/embedded-auth-server-vmcp'],
      },
      'toolhive/guides-vmcp/tool-aggregation',
      'toolhive/guides-vmcp/composite-tools',
      'toolhive/guides-vmcp/optimizer',
      'toolhive/guides-vmcp/code-mode',
      'toolhive/guides-vmcp/failure-handling',
      'toolhive/guides-vmcp/telemetry-and-metrics',
      'toolhive/guides-vmcp/audit-logging',
      'toolhive/guides-vmcp/scaling-and-performance',
      'toolhive/guides-vmcp/local-cli',
    ],
  },

  {
    type: 'category',
    label: 'Registry Server',
    description:
      'How to deploy and use the ToolHive Registry server to discover and access MCP servers and skills',
    link: {
      type: 'doc',
      id: 'toolhive/guides-registry/index',
    },
    items: [
      'toolhive/guides-registry/intro',
      'toolhive/guides-registry/quickstart',
      {
        type: 'category',
        label: 'Deploy the Registry Server',
        link: {
          type: 'doc',
          id: 'toolhive/guides-registry/deployment',
        },
        collapsible: false,
        items: [
          'toolhive/guides-registry/deploy-operator',
          'toolhive/guides-registry/deploy-helm',
          'toolhive/guides-registry/deploy-manual',
        ],
      },
      'toolhive/guides-registry/configuration',
      'toolhive/guides-registry/publish-servers',
      'toolhive/guides-registry/authentication',
      'toolhive/guides-registry/authorization',
      'toolhive/guides-registry/database',
      'toolhive/guides-registry/skills',
      'toolhive/guides-registry/telemetry-metrics',
      'toolhive/guides-registry/audit-logging',
      'toolhive/reference/registry-api',
      'toolhive/reference/registry-schema-upstream',
    ],
  },

  {
    type: 'category',
    label: 'Cloud UI',
    description:
      'How to deploy and use the ToolHive Cloud UI to browse and connect MCP servers',
    link: {
      type: 'doc',
      id: 'toolhive/guides-cloud-ui/index',
    },
    items: [
      'toolhive/guides-cloud-ui/intro',
      'toolhive/guides-cloud-ui/deployment',
      'toolhive/guides-cloud-ui/configuration',
    ],
  },

  {
    type: 'category',
    label: 'MCP server guides',
    description: 'How to configure and use MCP servers for different use cases',
    link: {
      type: 'generated-index',
      slug: 'toolhive/guides-mcp',
      title: 'MCP server usage guides',
      description:
        'These guides provide step-by-step instructions for using various MCP servers with ToolHive. They cover everything from installation to advanced configuration options.',
    },
    items: [{ type: 'autogenerated', dirName: 'toolhive/guides-mcp' }],
  },

  {
    type: 'html',
    value: 'Reference',
    className: 'sidebar-title',
    defaultStyle: false,
  },

  {
    type: 'category',
    label: 'Technical reference',
    link: {
      type: 'doc',
      id: 'toolhive/reference/index',
    },
    collapsible: false,
    collapsed: false,
    items: [
      'toolhive/reference/client-compatibility',
      {
        type: 'doc',
        id: 'toolhive/reference/authz-policy-reference',
        label: 'Authorization policies',
      },
    ],
  },

  'toolhive/contributing',
];

const platformSidebar: SidebarsConfig[string] = [
  'platform/index',

  {
    type: 'html',
    value: 'Set up the platform',
    className: 'sidebar-title',
    defaultStyle: false,
  },

  {
    type: 'category',
    label: 'Platform setup',
    link: {
      type: 'doc',
      id: 'platform/enterprise-platform/index',
    },
    items: [
      'platform/enterprise-platform/deployment',
      'platform/enterprise-platform/distributed-deployments',
      'platform/enterprise-platform/airgap-install',
      'platform/enterprise-platform/verify-artifacts',
      'platform/enterprise-platform/configure-registry-server',
      'platform/enterprise-platform/configure-identity',
    ],
  },

  {
    type: 'html',
    value: 'Govern the platform',
    className: 'sidebar-title',
    defaultStyle: false,
  },

  {
    type: 'category',
    label: 'Enterprise authorization',
    link: {
      type: 'doc',
      id: 'platform/enterprise-authz/index',
    },
    items: [
      'platform/enterprise-authz/intro',
      'platform/enterprise-authz/quickstart-entra',
      'platform/enterprise-authz/namespace-self-service',
      'platform/enterprise-authz/directory-admin',
    ],
  },

  {
    type: 'category',
    label: 'Enterprise Manager',
    link: {
      type: 'doc',
      id: 'platform/enterprise-manager/index',
    },
    items: [
      'platform/enterprise-manager/intro',
      'platform/enterprise-manager/configure',
      {
        type: 'category',
        label: 'Policies',
        link: {
          type: 'doc',
          id: 'platform/enterprise-manager/policies/index',
        },
        items: [
          'platform/enterprise-manager/policies/registry',
          'platform/enterprise-manager/policies/non-registry-servers',
          'platform/enterprise-manager/policies/telemetry',
          'platform/enterprise-manager/policies/ca-certificate',
          'platform/enterprise-manager/policies/build-env',
          'platform/enterprise-manager/policies/desktop-app',
        ],
      },
      'platform/enterprise-manager/degraded-mode',
    ],
  },

  enterpriseCrdSidebar,

  {
    type: 'html',
    value: 'Operate platform clients',
    className: 'sidebar-title',
    defaultStyle: false,
  },

  {
    type: 'category',
    label: 'Enterprise Cloud UI',
    link: {
      type: 'doc',
      id: 'platform/enterprise-cloud-ui/index',
    },
    items: [
      'platform/enterprise-cloud-ui/intro',
      'platform/enterprise-cloud-ui/configure',
      'platform/enterprise-cloud-ui/browse-catalog',
      'platform/enterprise-cloud-ui/ai-assistant',
      {
        type: 'category',
        label: 'Registry management',
        link: {
          type: 'doc',
          id: 'platform/enterprise-cloud-ui/administration/index',
        },
        items: [
          'platform/enterprise-cloud-ui/administration/entries',
          'platform/enterprise-cloud-ui/administration/sources',
          'platform/enterprise-cloud-ui/administration/registries',
        ],
      },
    ],
  },

  {
    type: 'category',
    label: 'Stacklok Desktop',
    link: {
      type: 'doc',
      id: 'platform/enterprise-desktop/index',
    },
    items: [
      'platform/enterprise-desktop/intro',
      {
        type: 'doc',
        id: 'platform/enterprise-desktop/rollout',
        label: 'Rollout',
      },
      'platform/enterprise-desktop/policy-enforcement',
      'platform/enterprise-desktop/deep-links',
    ],
  },

  'platform/enterprise-cli/index',
];

const aiGatewaySidebar: SidebarsConfig[string] = ['ai-gateway/index'];

const resourcesSidebar: SidebarsConfig[string] = [
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
      'toolhive/concepts/embedded-auth-server',
      'toolhive/concepts/vmcp',
      'toolhive/concepts/skills',
    ],
  },

  {
    type: 'category',
    label: 'Integrations',
    description: 'Connect ToolHive with third-party tools and services',
    link: {
      type: 'generated-index',
      slug: 'toolhive/integrations',
      description:
        'Guides for integrating ToolHive with third-party tools and services like OpenTelemetry, HashiCorp Vault, and ngrok.',
    },
    items: [
      'toolhive/integrations/opentelemetry',
      'toolhive/integrations/vault',
      'toolhive/integrations/aws-sts',
      'toolhive/integrations/ingress-ngrok',
      'toolhive/integrations/okta',
      {
        type: 'category',
        label: 'Identity provider integration',
        link: {
          type: 'doc',
          id: 'toolhive/integrations/vmcp-idp-overview',
        },
        items: [
          'toolhive/integrations/vmcp-entra-id',
          'toolhive/integrations/vmcp-okta',
        ],
      },
    ],
  },

  {
    type: 'category',
    label: 'Tutorials',
    description: 'End-to-end tutorials covering multiple ToolHive components',
    link: {
      type: 'generated-index',
      slug: 'toolhive/tutorials',
      description:
        'End-to-end tutorials that span multiple ToolHive components.',
    },
    items: [
      'toolhive/tutorials/custom-registry',
      'toolhive/tutorials/mcp-optimizer',
    ],
  },

  {
    type: 'html',
    value: 'Help',
    className: 'sidebar-title',
    defaultStyle: false,
  },
  'toolhive/faq',
  'toolhive/support',
];

const sidebars: SidebarsConfig = {
  platformSidebar,
  mcpSidebar,
  aiGatewaySidebar,
  resourcesSidebar,
};

export default sidebars;
