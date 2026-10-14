// Rendering inputs and output locations for release-synchronized API references.
export const openapiSets = [
  {
    id: 'toolhive',
    name: 'ToolHive',
    source: 'static/api-specs/toolhive-api.yaml',
    outputDir: 'docs/toolhive/reference/api-endpoints',
  },
  {
    id: 'enterprise-manager',
    name: 'Enterprise Manager',
    source: 'static/api-specs/enterprise-manager-api.json',
    outputDir: 'docs/platform/reference/enterprise-manager-api',
    localPort: 80,
  },
  {
    id: 'registry',
    urlVariable: 'registryUrl',
    name: 'Registry Server',
    source: 'static/api-specs/toolhive-registry-api.yaml',
    outputDir: 'docs/toolhive/reference/registry-api-endpoints',
    localPort: 8080,
  },
  {
    id: 'connector-gateway',
    urlVariable: 'connectorGatewayUrl',
    name: 'Connector Gateway',
    source: 'static/api-specs/connector-gateway-api.json',
    outputDir: 'docs/connector-gateway/reference/api-endpoints',
    localPort: 8090,
  },
  {
    id: 'ai-gateway',
    urlVariable: 'aiGatewayUrl',
    name: 'AI Gateway management API',
    source: 'static/api-specs/ai-gateway-management-api.yaml',
    outputDir: 'docs/ai-gateway/reference/api-endpoints',
    localPort: 8080,
  },
];

export const openapiConfig = Object.fromEntries(
  openapiSets.map(({ id, source, outputDir }) => [
    id,
    {
      specPath: `.openapi-inputs/${id}.yaml`,
      outputDir,
      downloadUrl: source.replace(/^static/, ''),
      sidebarOptions: { groupPathsBy: 'tag', sidebarCollapsed: true },
    },
  ])
);
