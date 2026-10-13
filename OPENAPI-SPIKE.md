# OpenAPI rendering spike

Branch: `spike/openapi-native-sidebar`.

This spike replaces Redocusaurus for the ToolHive and Enterprise Manager APIs
with `docusaurus-plugin-openapi-docs` and its theme, pinned to 5.2.0. Registry
Server, Connector Gateway, and AI Gateway retain Redocusaurus for comparison.

## Preview

Run `npm run build`, then `npm run serve -- --port 3010 --no-open`.

- ToolHive overview: `/toolhive/reference/api`
- ToolHive endpoint: `/toolhive/reference/api-endpoints/create-a-new-workload`
- Enterprise Manager overview: `/platform/enterprise-platform/enterprise-manager-api`
- Enterprise Manager endpoint: `/platform/reference/enterprise-manager-api/list-users`
- Redocusaurus comparison: `/connector-gateway/api-reference`

Overview URLs and Enterprise Manager connection guidance remain in place.
Endpoints appear under collapsed API categories in the owning product sidebar,
with resource groups taken directly from specification tags.

## Generation

Run `npm run generate:api` after a source specification changes. This cleans and
regenerates both API output directories. Generated MDX, JSON, and sidebar files
are intended to be checked in; do not edit them by hand:

- `docs/toolhive/reference/api-endpoints/`
- `docs/platform/reference/enterprise-manager-api/`

The script normalizes copies of source specs into ignored `.openapi-inputs/`.
It preserves the existing Redocusaurus localhost base URL convention without
editing release artifacts in `static/api-specs/`. Builds use the generated pages
without running generation. The upstream release workflow invokes generation
after refreshing ToolHive or Stacklok Enterprise Platform specifications.

## Findings and remaining decisions

- ToolHive generates 77 endpoint pages; Enterprise Manager generates 122.
- The plugin also emits JSON files: 742 generated files in total. Two consecutive
  generations produced identical bytes.
- Native navigation removes the embedded API menu. The request/code example
  panel still occupies a column on desktop and stacks below content on mobile.
- Enterprise Manager's `directory` tag contains 58 endpoints. Consider finer
  resource grouping or a dedicated native API sidebar before adopting this.
- Code samples are limited to curl, JavaScript (Fetch), Python (Requests), and
  Go, in that order. The theme remembers a reader's selected language.
- The dark-mode request button uses dark green text on its pale green background.
- Endpoint details expand after client hydration; check any search/export
  requirements before replacing all API references.
- Historical Redoc fragment links need a migration plan before adoption.
- Validate release workflow behavior in CI before merging; the spike has been
  exercised locally only.
