# Scalar API reference spike

Branch: `spike/scalar-api-reference`, based on `main`.
Tracks [issue #1294](https://github.com/stacklok/docs-website/issues/1294).

This evaluates the official `@scalar/docusaurus` plugin (0.8.54) with its
standalone renderer pinned to 1.76.2. Redocusaurus, its configuration, and its CSS
overrides are removed. SWC's JavaScript loader is enabled again.

## Preview

Run `npm run build`, then `npm run serve -- --port 3011 --no-open`.

| API                | Interactive reference                                           |
| ------------------ | --------------------------------------------------------------- |
| ToolHive           | `/toolhive/reference/api/explorer`                              |
| Registry Server    | `/toolhive/reference/registry-api/explorer`                     |
| Enterprise Manager | `/platform/enterprise-platform/enterprise-manager-api/explorer` |
| Connector Gateway  | `/connector-gateway/api-reference/explorer`                     |
| Legacy AI Gateway  | `/ai-gateway/legacy/api-reference/explorer`                     |

Existing API reference pages retain their URLs, sidebar entries, and connection
and authentication guidance. Each links to its interactive reference and the
original OpenAPI download. Each explorer links back to that guidance.
The plugin owns the full-width explorer page, including its API sidebar;
Docusaurus retains the site navbar and footer.

## Configuration and release sync

`src/scalar/references.ts` configures all five APIs. The plugin evaluates each
`content` function at build time, embedding a copy of the checked-in specification
in the route data. It reads the existing release-sync destinations in
`static/api-specs/`, so the normal site build picks up refreshed specifications.
There is no endpoint generation step or generated source to commit. Release-sync
CI has not been exercised on this branch.

The source specifications remain untouched. The renderer offers
`http://localhost:8080` for the documented local connections and an editable
deployment URL. Authentication comes from each specification; no credentials are
prefilled. Authentication persistence and telemetry are disabled. Default font
downloads are disabled so the integration uses the site's fonts.

`proxyUrl: ''` explicitly selects direct browser requests. A mocked browser
request to the legacy AI Gateway's `GET /v1/info` reached
`http://localhost:8080/v1/info` and displayed the mocked response, without a Scalar
proxy. Calls to real deployments still require their authentication and CORS
configuration; no live service requests were tested.

## Evaluation

- All five references render in the production build. The request editor,
  schemas, code samples, and per-reference search are available. Resource
  grouping follows upstream tags.
- Scalar provides its own search. Endpoint text is absent from server-rendered
  HTML, so the current Algolia crawler (`renderJavaScript: false`) cannot index
  it. The existing prose pages remain available to site search.
- The llms plugin initially emitted explorer Markdown containing only site
  navigation and the footer. Explorer routes are now excluded from those exports.
  Endpoint coverage would require a separate OpenAPI-to-Markdown export. The
  original OpenAPI download links remain available.
- Plugin routes have the generic browser title "Stacklok Docs" and no API-specific
  page metadata. A production integration should add metadata.
- Each plugin instance injects its renderer script into every HTML page. With
  five APIs, five identical script tags appear even on ordinary guide pages.
  Browser caching can reuse the download, but each script tag executes. Consider
  loading a single bundled renderer only on reference pages before adoption.
- The renderer is downloaded from jsDelivr at runtime. Pinning the CDN URL makes
  the spike reproducible; self-hosting the bundle would remove that availability
  dependency.
- The official integration exposes flat routes, outside the docs plugin's
  versioning. This checkout has no configured versioned enterprise docs instance.
  Future snapshots need version-specific explorer routes and frozen spec content;
  copying MDX pages alone would retain links to the current explorer.
- Existing page URLs need no redirects. Historical Redoc endpoint fragments do
  need a migration plan: Scalar uses different fragments on the explorer routes.
- Compared with the Palo Alto spike, Scalar needs much less source configuration
  and produces no endpoint files. It retains a separate API navigation and search
  experience, while the Palo Alto plugin generates native documentation pages.

## Local validation

- Node 24; production build and TypeScript check pass.
- Prettier and ESLint pass for changed files; `git diff --check` passes.
- Browser smoke checks rendered all five API titles and request controls.
- Scalar search opens with endpoint results; a mocked direct request succeeds.
- A 390 px mobile viewport has no horizontal overflow on the legacy AI Gateway
  explorer. Desktop and site color-mode controls were checked separately.
- The Kubernetes quickstart has highlighted Bash function tokens with Scalar
  installed, confirming that additional Prism grammars register after Redoc's
  removal.
- Local browser console errors were limited to the unavailable Vercel analytics
  endpoint (`/_vercel/insights/script.js`).

This is a local evaluation, not a production migration recommendation. Search
exports, versioning, metadata, renderer loading, and fragment compatibility need
decisions before adoption.
