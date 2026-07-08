// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

/*
 * Hand-written overrides for per-CRD metadata. Every CRD in
 * static/api-specs/toolhive-crds/index.json is published automatically; entries here
 * are improvements over schema-derived defaults, not prerequisites.
 *
 * To improve a CRD's page (or intentionally position a new one on the
 * landing page), add or update its entry and run
 * `node scripts/generate-crd-pages.mjs`.
 *
 * Within each group, overridden entries render in this file's declaration
 * order, then any defaults-only CRDs follow alphabetically by Kind.
 *
 * All fields are optional. Omit any field to inherit the schema-derived
 * default:
 *   slug        - URL segment and MDX filename. Default: Kind.toLowerCase().
 *   group       - Landing-page/sidebar section. Default: 'shared'.
 *   summary     - One-sentence DocCard pitch. Default: first sentence of
 *                 the upstream schema description with the "Foo is the
 *                 Schema for the foos API" boilerplate stripped.
 *   description - SEO meta description (80-150 chars ideal).
 *                 Default: "Schema reference for <Kind>."
 *   intro       - Opening prose at the top of the page. Markdown allowed;
 *                 cross-CRD links should use [Kind](./slug.mdx) form.
 *                 Default: cleaned upstream schema description, or a
 *                 generic fallback if only boilerplate is present upstream.
 *   preferredType - Override the discriminator value used in the generated
 *                 example YAML. Useful when `spec.type` has several enum
 *                 variants and the alphabetical first pick is not the most
 *                 representative. The value must be one of the enum's values
 *                 and the matching sibling block must satisfy admission with
 *                 default placeholders.
 */

export const groupLabels = {
  core: 'Core workloads',
  enterpriseAuthz: 'Enterprise authorization',
  shared: 'Shared configuration',
};

export const groupOrder = ['core', 'enterpriseAuthz', 'shared'];

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
    summary: 'Deploy a ToolHive Registry Server (deprecated).',
    description:
      'Schema reference for MCPRegistry, which declares a ToolHive Registry Server deployment managed by the operator.',
    intro:
      '`MCPRegistry` deploys a [ToolHive Registry Server](../../guides-registry/intro.mdx) in the cluster. The operator watches `MCPRegistry` resources and provisions the Registry Server, its PostgreSQL backing, and the configured sources (Git, ConfigMap, URL, or Kubernetes discovery) that populate its catalog of MCP server definitions.\n\n:::warning[Deprecated]\n\nThe `MCPRegistry` CRD is deprecated and will be removed in a future release. The CRD remains fully functional, but `kubectl` now prints a deprecation warning on apply or get and the operator emits a `Warning` event recommending the [`toolhive-registry-server` Helm chart](https://github.com/stacklok/toolhive-registry-server). For new deployments, see [Deploy with Helm](../../guides-registry/deploy-helm.mdx).\n\n:::',
  },

  // Enterprise authorization - role definition, cluster and namespaced
  // bindings, then per-target policy.
  ClusterPlatformRole: {
    slug: 'clusterplatformrole',
    group: 'enterpriseAuthz',
    summary: 'Cluster-wide role definition for MCP authorization.',
    description:
      'Schema reference for ClusterPlatformRole, which defines what a role can do across MCP products in Stacklok Enterprise.',
    intro:
      '`ClusterPlatformRole` defines what a role can do across the registered platform products. The role is product-agnostic; per-product action vocabularies live under `spec.productActions[]`, keyed by API group. Bind a role to principals with [ClusterPlatformRoleBinding](./clusterplatformrolebinding.mdx) or [PlatformRoleBinding](./platformrolebinding.mdx), and attach it to an MCP target with [ToolhiveAuthorizationPolicy](./toolhiveauthorizationpolicy.mdx).',
  },
  ClusterPlatformRoleBinding: {
    slug: 'clusterplatformrolebinding',
    group: 'enterpriseAuthz',
    summary: 'Cluster-wide binding of a role to IdP principals.',
    description:
      'Schema reference for ClusterPlatformRoleBinding, which maps IdP groups and roles to a ClusterPlatformRole cluster-wide.',
    intro:
      '`ClusterPlatformRoleBinding` maps IdP groups and roles (read from the configured `groups_claim` and `roles_claim` on the incoming JWT) to a [ClusterPlatformRole](./clusterplatformrole.mdx), effective across every namespace. Use [PlatformRoleBinding](./platformrolebinding.mdx) when you want a namespace-scoped grant instead.',
  },
  PlatformRoleBinding: {
    slug: 'platformrolebinding',
    group: 'enterpriseAuthz',
    summary: 'Namespace-scoped binding of a role to IdP principals.',
    description:
      'Schema reference for PlatformRoleBinding, which maps IdP groups and roles to a ClusterPlatformRole within a single namespace.',
    intro:
      '`PlatformRoleBinding` is the namespace-scoped sibling of [ClusterPlatformRoleBinding](./clusterplatformrolebinding.mdx). Namespace owners use it to grant a [ClusterPlatformRole](./clusterplatformrole.mdx) to IdP principals for the [ToolhiveAuthorizationPolicy](./toolhiveauthorizationpolicy.mdx) resources in the same namespace, without involving the cluster admin.',
  },
  ToolhiveAuthorizationPolicy: {
    slug: 'toolhiveauthorizationpolicy',
    group: 'enterpriseAuthz',
    summary: 'Attach roles and deny rules to a specific MCP target.',
    description:
      'Schema reference for ToolhiveAuthorizationPolicy, which attaches roles and deny rules to a specific MCP target.',
    intro:
      '`ToolhiveAuthorizationPolicy` attaches one or more [ClusterPlatformRole](./clusterplatformrole.mdx) bindings to a specific MCP target: an `MCPServer` or `MCPRemoteProxy`. Bindings can be narrowed by rule restrictions or tool-hint filters, and hard `deny` rules compile to Cedar `forbid` and override every grant.',
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
    preferredType: 'inline',
  },
  MCPExternalAuthConfig: {
    slug: 'mcpexternalauthconfig',
    group: 'shared',
    summary: 'External authentication to upstream services.',
    description:
      'Schema reference for MCPExternalAuthConfig, which configures external authentication for MCP servers and proxies.',
    intro:
      '`MCPExternalAuthConfig` configures how an MCP server or proxy authenticates to external services via token exchange or an embedded authorization server. It is referenced by [MCPServer](./mcpserver.mdx), [MCPRemoteProxy](./mcpremoteproxy.mdx), [MCPServerEntry](./mcpserverentry.mdx), and [VirtualMCPServer](./virtualmcpserver.mdx).',
    preferredType: 'embeddedAuthServer',
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
  MCPWebhookConfig: {
    slug: 'mcpwebhookconfig',
    group: 'shared',
    summary: 'Delegate MCP tool authorization to an external webhook.',
    description:
      'Schema reference for MCPWebhookConfig, which configures validating and mutating webhook middleware for MCP servers.',
    intro:
      '`MCPWebhookConfig` defines validating and mutating webhook middleware that intercepts MCP tool calls. [MCPServer](./mcpserver.mdx) references an `MCPWebhookConfig` via `spec.webhookConfigRef` to delegate tool-call authorization or request transformation to an external HTTPS service. This is the Kubernetes equivalent of the CLI [`--webhook-config`](../../guides-cli/webhooks.mdx) flag, configured declaratively as a custom resource.',
  },
  MCPAuthzConfig: {
    slug: 'mcpauthzconfig',
    group: 'shared',
    summary: 'Shared authorization policy decoupled from a specific backend.',
    description:
      'Schema reference for MCPAuthzConfig, which configures backend-agnostic authorization policy for MCP servers and proxies.',
    intro:
      '`MCPAuthzConfig` defines a reusable authorization policy that is decoupled from a particular authorizer backend. [MCPServer](./mcpserver.mdx), [MCPRemoteProxy](./mcpremoteproxy.mdx), and [VirtualMCPServer](./virtualmcpserver.mdx) reference an `MCPAuthzConfig` via `spec.authzConfigRef` (or `spec.incomingAuth.authzConfigRef` on `VirtualMCPServer`), mutually exclusive with the inline `authzConfig` field.\n\nFrom v0.30.1, workload controllers resolve `authzConfigRef` into a runtime authorization config and apply it to the proxy alongside the existing reference-tracking (deletion protection and `status.referencingWorkloads`). For walkthroughs, see [Share policies across resources with MCPAuthzConfig](../../guides-k8s/authorization-k8s.mdx#share-policies-across-resources-with-mcpauthzconfig).\n\n:::note[VirtualMCPServer is Cedar-only]\n\n`VirtualMCPServer.spec.incomingAuth.authzConfigRef` only supports MCPAuthzConfig resources with `spec.type: cedarv1`. Referencing a non-Cedar config (for example, `httpv1`) fails reconciliation with a clear condition message because the vMCP runtime authorization middleware is Cedar-only.\n\n:::',
  },
};
