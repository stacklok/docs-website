# OpenAPI rendering spike

Branch: `spike/openapi-native-sidebar`.

All five APIs use `docusaurus-plugin-openapi-docs` and its theme, pinned to
5.2.0. Redocusaurus and its rendering configuration have been removed.

## Preview

Run `npm run build`, then `npm run serve -- --port 3010 --no-open`.

- ToolHive overview: `/toolhive/reference/api`
- ToolHive endpoint: `/toolhive/reference/api-endpoints/create-a-new-workload`
- Enterprise Manager overview: `/platform/enterprise-platform/enterprise-manager-api`
- Enterprise Manager endpoint: `/platform/reference/enterprise-manager-api/list-users`
- Registry Server overview: `/toolhive/reference/registry-api`
- Connector Gateway overview: `/connector-gateway/api-reference`
- AI Gateway overview: `/ai-gateway/api-reference`

Overview URLs and connection guidance remain in place.
Endpoints appear under collapsed API categories in the owning product sidebar,
with resource groups taken directly from specification tags.

## Generation

Run `npm run generate:api` after a source specification changes. This cleans and
regenerates all five API output directories. Generated MDX, JSON, and sidebar files
are intended to be checked in; do not edit them by hand:

- `docs/toolhive/reference/api-endpoints/`
- `docs/platform/reference/enterprise-manager-api/`
- `docs/toolhive/reference/registry-api-endpoints/`
- `docs/connector-gateway/reference/api-endpoints/`
- `docs/ai-gateway/reference/api-endpoints/`

The script normalizes copies of source specs into ignored `.openapi-inputs/`.
ToolHive retains its localhost base URL. The four service APIs offer an editable
deployment URL variable and a labeled local port-forward server option, without
editing release artifacts in `static/api-specs/`. Builds use the generated pages
without running generation. The upstream release workflow invokes generation
after refreshing ToolHive, Registry Server, or Stacklok Enterprise Platform
specifications. Rendering configuration is shared in
`scripts/lib/openapi-sets.mjs`; generation runs through
`scripts/generate-openapi.mjs`. Each service has a distinct URL variable so
the theme does not carry another service's hostname across references.

## Findings and remaining decisions

- Endpoint pages: ToolHive 77, Enterprise Manager 122, Registry Server 27,
  Connector Gateway 5, and AI Gateway 4.
- The plugin also emits JSON files: 885 generated files in total.
- Native navigation removes the embedded API menu. The request/code example
  panel still occupies a column on desktop and stacks below content on mobile.
- Enterprise Manager's `directory` tag contains 58 endpoints. Consider finer
  resource grouping or a dedicated native API sidebar before adopting this.
- Code samples are limited to curl, JavaScript (Fetch), Node.js (Native),
  Python (Requests), and Go, in that order. The theme remembers a reader's selected language.
- The dark-mode request button uses dark green text on its pale green background.
- Endpoint details expand after client hydration; check any search/export
  requirements before adopting the spike.
- Historical Redoc fragment links need a migration plan before adoption.
- Validate release workflow behavior in CI before merging; the spike has been
  exercised locally only.
