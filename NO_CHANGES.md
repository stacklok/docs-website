No doc-relevant hand-written changes for toolhive-registry-server v1.4.0.

The only product-facing change in this release is PR #754 ("Enrich
`ListRegistryEntries` response with version metadata"), which adds
`title`, `description`, `createdAt`, `updatedAt`, and `position` to
the `GET /v1/registries/{name}/entries` admin response. That response
schema is documented solely via the auto-generated swagger at
`static/api-specs/toolhive-registry-api.yaml`, which the release
workflow already refreshed in this PR. The endpoint's only prose
mention (`docs/toolhive/guides-registry/authorization.mdx:310-314`)
covers authorization scoping, not response fields, so no edit is
warranted.

Remaining PRs in the release are infra-only: removing an obsolete
Vercel deploy hook (#753), dependency bumps (#756, #757, #758), and
the release cut itself (#755).
