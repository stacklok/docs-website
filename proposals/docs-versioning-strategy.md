# Docs versioning strategy proposal

## Status

Draft - April 2026

## Problem statement

Stacklok is introducing Stacklok Enterprise, an enterprise
distribution of ToolHive that will be semantically versioned with
support for N-1 and N-2 minor releases. The ToolHive open source
(OSS) documentation currently follows a rolling "latest" model with
no versioning. We need a strategy that:

- Gives Enterprise customers pinned, version-accurate documentation
- Keeps OSS documentation on a rolling latest without friction
- Presents Enterprise features inline with OSS docs as an upsell
  opportunity
- Handles auto-generated reference content (CLI reference, CRD specs,
  API specs) that is produced upstream
- Minimizes maintenance burden across active versions

## Current state

- Single unversioned Docusaurus docs instance at `/`
- ~96 auto-generated CLI reference pages, 5 API/schema spec files,
  and 1 CRD spec page - all generated upstream
- Enterprise landing page exists at `/toolhive/enterprise` with
  feature comparison and CTAs
- No enterprise-specific inline content in existing docs
- No Docusaurus versioning configured

## Proposed approach

### Versioning model

Use Docusaurus's built-in docs versioning with the following mapping:

| Audience                           | Docs state                             | URL path                       |
| ---------------------------------- | -------------------------------------- | ------------------------------ |
| OSS users                          | Rolling latest (unversioned "current") | `/toolhive/...` (default)      |
| Enterprise users on latest release | Most recent versioned snapshot         | `/enterprise/1.2/toolhive/...` |
| Enterprise users on older releases | Older versioned snapshots              | `/enterprise/1.1/toolhive/...` |

- **"Current"** always tracks the OSS rolling latest. This is the
  default path and what search engines index.
- **Versioned snapshots** are cut on each Enterprise minor release
  (e.g., 1.0, 1.1, 1.2).
- **Prune policy:** remove versions older than N-2. At any given time,
  at most 3 Enterprise versions are live (current release + N-1 +
  N-2).

Docusaurus configuration (validated in spike):

```ts title="docusaurus.config.ts (docs plugin options)"
lastVersion: 'current',
versions: {
  current: {
    label: 'Latest (OSS)',
  },
  '1.1': {
    label: 'Enterprise 1.1',
    path: 'enterprise/1.1',
    banner: 'none',
    noIndex: true,
  },
},
```

- `lastVersion: 'current'` keeps the `docs/` folder as the
  default, served at the root route base path (`/`). No change to
  existing OSS URLs.
- `path: 'enterprise/1.1'` routes the versioned snapshot under the
  `/enterprise/1.1/` prefix instead of the default `/1.1/`.
- `banner: 'none'` suppresses the "unmaintained version" banner
  (not appropriate for an Enterprise pinned version).
- `noIndex: true` prevents search engines from indexing versioned
  pages, avoiding duplicate content with the OSS latest.

A `docsVersionDropdown` navbar item renders the version picker.

**Constraint:** the `versions` config block must not reference a
version until after `docs:version` has been run and `versions.json`
contains it. Docusaurus validates at startup and errors on unknown
versions. The version cut and config update must happen in
sequence.

### Enterprise content inline

Enterprise-specific content lives inline alongside OSS docs to serve
as a natural upsell. Two patterns:

**Enterprise-only pages:** added to the docs tree like any other page
and included in every versioned snapshot. Examples based on current
Enterprise differentiation:

- Configuration server setup and administration (enterprise lockdown
  controls for the Desktop UI)
- Turnkey IdP integration guides (Okta, Entra ID) - distinct from
  the generic OIDC/OAuth auth docs in OSS
- Enterprise Cloud UI administration (the full CRUD management
  console)
- Enterprise Connectors catalog and qualification guides
- Canonical policy packs (pre-built read-only, full CRUD, and custom
  Cedar policy sets)

**Enterprise-specific sections within existing pages:** marked with a
custom admonition or component. These appear inline in OSS docs as a
natural upsell, showing Enterprise users what's available and giving
OSS users a reason to upgrade. Examples:

```mdx title="In the Desktop UI guide"
:::enterprise

The Enterprise distribution of the Desktop UI includes a
**configuration server** that lets administrators enforce lockdown
controls across your organization - restricting which MCP servers
can be installed, enforcing approved registries, and managing
update policies centrally.

[Learn more about Stacklok Enterprise](/toolhive/enterprise).

:::
```

```mdx title="In the auth/identity guide"
:::enterprise

Stacklok Enterprise includes turnkey integrations for common
identity providers. Instead of manually configuring OIDC, use the
built-in Okta or Entra ID integration to map IdP groups directly
to ToolHive roles and policy sets.

[Learn more about Stacklok Enterprise](/toolhive/enterprise).

:::
```

```mdx title="In the MCP server management guide"
:::enterprise

Enterprise Connectors are production-ready MCP servers maintained
on the Enterprise release cadence, built on hardened base images
(Chainguard or equivalent), signed with SigStore, and qualified
for target workloads. They include backported security patches and
SBOM/dependency vetting.

[Learn more about Stacklok Enterprise](/toolhive/enterprise).

:::
```

Both patterns snapshot cleanly with Docusaurus versioning - no special
handling needed at version cut time.

### Auto-generated reference content

Auto-generated content (CLI reference, API specs, CRD specs) is
produced upstream and pulled into the docs repo on release.

**CLI reference and API specs:** these are already pulled in per
release. When an Enterprise version is cut, the snapshot captures
whatever reference docs are current at that point.

**CRD specs:** use separate pages per CRD API version (e.g.,
`crd-spec-v1alpha1.md`, `crd-spec-v1beta1.md`) since the upstream
generation has limited customization options and CRD versions may
coexist.

### Version cut process

Enterprise development continuously syncs and pins the latest
upstream releases. When an Enterprise release is cut, the pinned
upstream versions are typically the latest available. This means
`main` already reflects the correct component versions at cut
time, and the snapshot can usually be taken directly from `main`
HEAD.

See [enterprise-version-cut-process.md](enterprise-version-cut-process.md)
for the full worked example and validated process.

**Happy path (most releases):**

1. Verify all pinned-version docs PRs have merged to `main`.
2. Add enterprise overlay content to `main` (enterprise-only
   pages, `:::enterprise` admonitions).
3. Run `npx docusaurus docs:version <version>` on `main`.
4. Add the version-specific Docusaurus config.
5. Prune versions older than N-2.
6. Commit and deploy via PR.

**Fallback - release branch:** if a component is rolled back to an
older version (e.g., a late regression in v0.23.0 forces a pin to
v0.22.0 after v0.23.0 docs have already landed), a release branch
from the right point in `main`'s history is needed. See the
process doc for the branch-based approach.

This is a quality forcing function, not a guarantee of perfection.
The goal is "accurate enough" at cut time, with the understanding
that narrative docs may have minor drift.

**Upstream requirement:** this process depends on each pinned
component version being fully documented before the cut. The
release-triggered docs PR for each component version is the
completeness gate - see the process doc for details.

### Automated docs pipeline integration

A parallel initiative is introducing automated, release-triggered docs
PRs: when an OSS component release is cut, a docs PR is generated
with an AI-drafted changelog and review required from contributors
on that release.

This creates a natural per-component checkpoint. When an Enterprise
release is cut (comprising specific versions of each OSS component),
the docs will have already been reviewed in the context of each
constituent release. This significantly reduces the accuracy gap at
Enterprise version cut time.

The release-triggered docs PR also serves as a potential automation
point for the version snapshot itself - the Enterprise release
pipeline could trigger the `docs:version` command after all component
docs PRs are merged.

## Release cadence impact

| Cadence   | Active versions | Max drift (N-2 to latest) | Maintenance load                                       |
| --------- | --------------- | ------------------------- | ------------------------------------------------------ |
| Monthly   | 3               | ~2 months                 | Low - minimal divergence between versions              |
| Quarterly | 3               | ~6 months                 | Moderate - guides and UI docs may diverge meaningfully |

Starting monthly and moving to quarterly as the product stabilizes.
The quarterly cadence is where cross-version maintenance becomes a
real concern - at that point, the automated docs pipeline and
per-release review process will be critical for keeping versions
accurate.

## Risks and mitigations

**Maintenance burden of versioned snapshots.** Each snapshot is a full
copy of every doc page. A typo fix or security correction must be
patched in up to 4 places (current + 3 versions).

- _Mitigation:_ Prune at N-2 to limit active versions. Automate
  cherry-picking of critical fixes to active versions. Accept that
  non-critical fixes only go into current.

**Docs not matching Enterprise release at cut time.** The Enterprise
release pins specific upstream versions, but docs may describe
features not yet in that release.

- _Mitigation:_ Release-triggered docs PRs reduce the gap. A
  lightweight review checklist at cut time catches obvious issues.
  Perfect accuracy is a non-goal - "useful and mostly correct" is the
  bar.

**Search engine indexing of versioned pages.** Duplicate content
across versions can dilute SEO.

- _Mitigation:_ Set `noIndex: true` in the version config (validated
  in spike). Docusaurus also sets canonical URLs to the latest
  version by default. Verify both are working correctly after the
  first production version cut.

**Build time and repo size growth.** Each version snapshot adds a full
copy of the docs directory.

- _Mitigation:_ Prune at N-2. Monitor build times after first few
  cuts. If repo size becomes an issue, consider moving versioned docs
  to a separate branch or git subtree.

## Implementation phases

### Phase 1: Foundation

- Add the custom `:::enterprise` admonition component.
- Create separate CRD spec pages per API version
  (`crd-spec-v1alpha1.md`, `crd-spec-v1beta1.md`).
- Add initial enterprise-specific inline content to existing pages.

### Phase 2: First version cut

- Follow the release branch process to cut the first Enterprise
  version snapshot (see
  [enterprise-version-cut-process.md](enterprise-version-cut-process.md)).
- Add the `lastVersion`, `versions`, and `docsVersionDropdown`
  config to `docusaurus.config.ts` (config validated in spike -
  see Docusaurus configuration above).
- Suppress the default version banner with `banner: 'none'`.
- Verify URL structure (`/enterprise/<version>/toolhive/...`),
  `noIndex` on versioned pages, and version dropdown navigation.

### Phase 3: Automation

- Integrate version cut into Enterprise release pipeline.
- Automate pruning of versions older than N-2.
- Connect release-triggered docs PRs to version snapshot process.

## Open questions

- **Version label format:** `1.0`, `v1.0`, or `2026.04`? Should align
  with the Enterprise product versioning scheme.
- **Version switcher UX:** ~~Should Enterprise users see a version
  dropdown in the navbar, or is URL-based navigation sufficient?~~
  **Decision: navbar version picker.** The dropdown serves double duty
  as a wayfinding indicator for Enterprise users on pinned versions and
  as a discovery/upsell moment for OSS users who see Enterprise
  versions listed. Docusaurus supports this natively via the
  `docsVersionDropdown` navbar item.
- **Backport policy:** Which types of doc fixes warrant backporting to
  older versions? Suggest limiting to factual errors and security
  content.
- **Enterprise content gating:** ~~Is the inline enterprise content
  purely informational (visible to all, with CTA), or should any of
  it be gated behind authentication?~~ **Decision: no gating.** All
  documentation, including Enterprise-specific content, is public.
  No plans for gated material on the docs site.
