// Single source of truth for per-CRD metadata that is not derivable from
// the upstream schema.
//
// To add a new CRD after upstream ships it:
//   1. Add an entry here keyed by its Kind.
//   2. Run `node scripts/generate-crd-pages.mjs` (or let the release workflow
//      do it). The MDX page, sidebar entry, and landing page DocCard are all
//      derived from this file, so you should not need to edit anything else.
//
// Entries are emitted in declaration order within each group, so order this
// file intentionally - most-important resource first.
//
// Fields:
//   slug        - URL segment and MDX filename (without extension).
//   group       - Section on the landing page and in the sidebar.
//   summary     - One-sentence pitch used on DocCards and in the sidebar.
//   description - SEO meta description (frontmatter). 80-150 chars ideal.
//   intro       - Opening prose rendered at the top of the MDX page.
//                 Markdown allowed; cross-CRD links should use relative
//                 paths like [MCPGroup](./mcpgroup.mdx).

export const groupLabels = {
  core: 'Core workloads',
  shared: 'Shared configuration',
};

export const groupOrder = ['core', 'shared'];

export const intros = {
  // Core workloads - ordered from primary resource outward.
  MCPServer: {
    slug: 'mcpserver',
    group: 'core',
    summary: 'Containerized MCP server managed by the operator.',
    description:
      'Schema reference for MCPServer, which defines a containerized MCP server managed by the ToolHive operator.',
    intro:
      '`MCPServer` defines a containerized MCP server managed by the ToolHive Kubernetes operator. The operator watches `MCPServer` resources and reconciles them into a running, proxied MCP server with the configured transport, authentication, telemetry, and tool filtering.',
  },
  MCPRemoteProxy: {
    slug: 'mcpremoteproxy',
    group: 'core',
    summary: 'Proxy a remote MCP server through the operator.',
    description:
      'Schema reference for MCPRemoteProxy, which proxies a remote MCP server through the operator for auth, telemetry, and tool filtering.',
    intro:
      '`MCPRemoteProxy` fronts a remote MCP server (reachable over HTTPS) with the same authentication, telemetry, and tool-filtering features that the operator applies to containerized servers. Use this when you want to apply ToolHive policies to a third-party hosted MCP endpoint.',
  },
  MCPServerEntry: {
    slug: 'mcpserverentry',
    group: 'core',
    summary: 'Declare a remote MCP server as a group member.',
    description:
      'Schema reference for MCPServerEntry, which declares a remote MCP server as a member of an MCPGroup.',
    intro:
      '`MCPServerEntry` declares a remote MCP server as a first-class member of an [MCPGroup](./mcpgroup.mdx) without running a full [MCPRemoteProxy](./mcpremoteproxy.mdx). Entries appear in registry listings and participate in group-scoped aggregations like a [VirtualMCPServer](./virtualmcpserver.mdx).',
  },
  VirtualMCPServer: {
    slug: 'virtualmcpserver',
    group: 'core',
    summary: 'Aggregate multiple backends into a single vMCP endpoint.',
    description:
      'Schema reference for VirtualMCPServer, which aggregates multiple MCP servers into a single virtual endpoint.',
    intro:
      '`VirtualMCPServer` (vMCP) aggregates the backend workloads belonging to an [MCPGroup](./mcpgroup.mdx) into a single endpoint. Clients see one MCP server; the operator handles tool aggregation, conflict resolution, auth, and optional composite tool workflows behind the scenes.',
  },
  MCPRegistry: {
    slug: 'mcpregistry',
    group: 'core',
    summary: 'Deploy a ToolHive Registry Server.',
    description:
      'Schema reference for MCPRegistry, which declares a ToolHive Registry Server deployment managed by the operator.',
    intro:
      '`MCPRegistry` deploys a [ToolHive Registry Server](../../guides-registry/intro.mdx) in the cluster. The operator watches `MCPRegistry` resources and provisions the Registry Server, its PostgreSQL backing, and the configured sources (Git, ConfigMap, URL, or Kubernetes discovery) that populate its catalog of MCP server definitions.',
  },

  // Shared configuration - grouping, then auth, then observability/behavior,
  // then optimizer, then discovery.
  MCPGroup: {
    slug: 'mcpgroup',
    group: 'shared',
    summary: 'Group backend workloads for shared configuration.',
    description:
      'Schema reference for MCPGroup, which groups backend MCP servers, remote proxies, and server entries for shared configuration.',
    intro:
      '`MCPGroup` is a grouping construct for backend workloads. Other resources reference an `MCPGroup` by name to join a shared pool - for example, a [VirtualMCPServer](./virtualmcpserver.mdx) aggregates the tools exposed by every member of its referenced group.',
  },
  MCPOIDCConfig: {
    slug: 'mcpoidcconfig',
    group: 'shared',
    summary: 'Shared OIDC authentication settings.',
    description:
      'Schema reference for MCPOIDCConfig, which configures OIDC-based incoming authentication for MCP servers.',
    intro:
      '`MCPOIDCConfig` defines OIDC authentication settings that can be shared across multiple MCP workloads. [MCPServer](./mcpserver.mdx), [MCPRemoteProxy](./mcpremoteproxy.mdx), and [VirtualMCPServer](./virtualmcpserver.mdx) reference an `MCPOIDCConfig` via `spec.oidcConfigRef` to validate incoming tokens.',
  },
  MCPExternalAuthConfig: {
    slug: 'mcpexternalauthconfig',
    group: 'shared',
    summary: 'External authentication to upstream services.',
    description:
      'Schema reference for MCPExternalAuthConfig, which configures external authentication for MCP servers and proxies.',
    intro:
      '`MCPExternalAuthConfig` configures how an MCP server or proxy authenticates to external services via token exchange or an embedded authorization server. It is referenced by [MCPServer](./mcpserver.mdx), [MCPRemoteProxy](./mcpremoteproxy.mdx), [MCPServerEntry](./mcpserverentry.mdx), and [VirtualMCPServer](./virtualmcpserver.mdx).',
  },
  MCPTelemetryConfig: {
    slug: 'mcptelemetryconfig',
    group: 'shared',
    summary: 'Shared OpenTelemetry tracing, metrics, and logging.',
    description:
      'Schema reference for MCPTelemetryConfig, which configures OpenTelemetry tracing, metrics, and logging for MCP workloads.',
    intro:
      '`MCPTelemetryConfig` defines telemetry settings that can be shared across multiple MCP workloads. [MCPServer](./mcpserver.mdx), [MCPRemoteProxy](./mcpremoteproxy.mdx), and [VirtualMCPServer](./virtualmcpserver.mdx) reference a single `MCPTelemetryConfig` to emit traces and metrics to a common backend.',
  },
  MCPToolConfig: {
    slug: 'mcptoolconfig',
    group: 'shared',
    summary: 'Tool filtering and renaming rules.',
    description:
      'Schema reference for MCPToolConfig, which filters and renames tools exposed by an MCP server.',
    intro:
      '`MCPToolConfig` defines tool-filtering and renaming rules that can be shared across MCP workloads. [MCPServer](./mcpserver.mdx), [MCPRemoteProxy](./mcpremoteproxy.mdx), and [VirtualMCPServer](./virtualmcpserver.mdx) reference an `MCPToolConfig` via `spec.toolConfigRef` to customize the tool surface their clients see.',
  },
  VirtualMCPCompositeToolDefinition: {
    slug: 'virtualmcpcompositetooldefinition',
    group: 'shared',
    summary: 'Composite tool workflow for a VirtualMCPServer.',
    description:
      'Schema reference for VirtualMCPCompositeToolDefinition, which defines a composite tool workflow for a VirtualMCPServer.',
    intro:
      '`VirtualMCPCompositeToolDefinition` defines a reusable composite tool workflow - a sequence of backend tool calls exposed to clients as a single high-level tool. Referenced by a [VirtualMCPServer](./virtualmcpserver.mdx) via `spec.config.compositeToolRefs`.',
  },
  EmbeddingServer: {
    slug: 'embeddingserver',
    group: 'shared',
    summary: 'Local embedding model for the vMCP optimizer.',
    description:
      'Schema reference for EmbeddingServer, which defines a local embedding model deployment used by the vMCP optimizer.',
    intro:
      '`EmbeddingServer` defines a containerized embedding model server managed by the ToolHive operator. The [VirtualMCPServer](./virtualmcpserver.mdx) optimizer references an `EmbeddingServer` to generate vector embeddings for tool discovery.',
  },
};
