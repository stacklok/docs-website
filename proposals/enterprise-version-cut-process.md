# Enterprise version cut process

Companion to
[docs-versioning-strategy.md](docs-versioning-strategy.md) -
walks through the concrete process of cutting a versioned docs
snapshot when an Enterprise release is declared.

## Status

Draft - April 2026

## Upstream components and their docs PRs

Each independently-versioned upstream component has a
release-triggered docs PR workflow. When a component cuts a release,
a docs PR is generated containing updated reference content and an
AI-drafted changelog for human review.

| Component repo             | What it covers                | Example release |
| -------------------------- | ----------------------------- | --------------- |
| `toolhive`                 | CLI, API, Kubernetes Operator | v0.21.0         |
| `toolhive-studio`          | Desktop UI app                | v0.32.1         |
| `toolhive-registry-server` | Registry Server               | v1.3.2          |
| `toolhive-cloud-ui`        | Cloud portal                  | v0.7.2          |

Each of these repos produces a docs PR against this docs-website
repo on release. Those PRs update:

- Auto-generated CLI reference pages (toolhive)
- API and CRD specs (toolhive)
- Feature documentation and guides (all components)
- Changelog/release notes content (all components)

## The Enterprise release

The `stacklok-enterprise` repo consolidates the upstream components
at pinned versions and adds enterprise overlays:

- Enterprise Connectors (qualified MCP servers)
- Configuration server (Desktop UI lockdown controls)
- Turnkey IdP integrations (Okta, Entra ID)
- Canonical policy packs
- Enterprise Cloud UI administration

An Enterprise release declares a specific version of each upstream
component. For this walkthrough, we're cutting **Enterprise v1.1**.

## How Enterprise pins upstream versions

Enterprise development continuously syncs and pins the latest
upstream releases. The process is not "declare versions, then
build" - it's more like:

1. Enterprise features are developed iteratively.
2. During that process, Enterprise continuously syncs and pins
   upstream releases.
3. When an Enterprise release is cut, the pinned upstream versions
   are the latest (or very recent) available.

This means that at Enterprise release time, the docs on `main`
should already reflect the pinned component versions because
they're the latest. The happy path is to snapshot `main` HEAD
directly.

### When does forward drift happen?

In rare cases, a component may be rolled back after its docs have
already landed. For example, a late-breaking regression in
toolhive v0.23.0 might force the Enterprise release to pin
v0.22.0 instead, but the v0.23.0 docs PR has already merged to
`main`. In this scenario, `main` documents features the Enterprise
customer doesn't have.

When this happens, a release branch from the right point in
`main`'s history is needed (see the fallback process below).

## Upstream requirement: docs completeness

Whether the snapshot is taken from `main` HEAD (happy path) or
from a release branch (fallback), the version cut captures whatever
docs exist at that point. If a pinned component's docs PR was
merged but incomplete - for example, a new CLI command was added
in toolhive v0.21.0 but the docs PR only updated the
auto-generated reference and skipped the narrative guide - that gap
is baked into the Enterprise snapshot.

This means the release-triggered docs PR for each component
version must be treated as a completeness gate, not just a
reference-update mechanism. Reviewers on each docs PR need to
verify that:

- Auto-generated content (CLI reference, API specs, CRD specs) is
  present and correct.
- New features, changed behaviors, and deprecations are reflected
  in the relevant guides and concept pages.
- Breaking changes have migration guidance.

The quality bar for these docs PRs directly determines the quality
of the Enterprise snapshot. If the upstream docs PR process is
treated as a "we'll fix it later" checkpoint, the Enterprise
version cut inherits that debt with no easy way to pay it down
(since the snapshot is a frozen copy).

For a monthly Enterprise release cadence, this is manageable: the
window between component releases and the Enterprise cut is short,
and docs PRs are small. For a quarterly cadence, the risk
increases: more features accumulate per component release, docs PRs
are larger and take longer to review, and the pressure to cut the
Enterprise release on schedule may conflict with docs completeness.

## Worked example: cutting Enterprise v1.1

### Enterprise v1.1 manifest

```text
stacklok-enterprise v1.1
├── toolhive v0.21.0
├── toolhive-studio v0.32.1
├── toolhive-registry-server v1.3.2
└── toolhive-cloud-ui v0.7.2
```

### Happy path: snapshot from main HEAD

Since Enterprise pins the latest upstream at cut time, `main`
should already reflect all four pinned versions. The typical state
at cut time:

```text
main branch (HEAD)
──────────────────────────────────────────────────

  merge: toolhive v0.21.0 docs PR        ◄── pinned (latest)
  merge: toolhive-studio v0.32.1 docs PR ◄── pinned (latest)
  merge: registry-server v1.3.2 docs PR  ◄── pinned (latest)
  merge: cloud-ui v0.7.2 docs PR         ◄── pinned (latest)
  merge: misc unrelated docs fixes
  ← HEAD
```

`main` HEAD matches the Enterprise manifest. Snapshot directly.

#### 1. Verify all pinned-version docs PRs are merged

Confirm that the release-triggered docs PR for each component
version in the manifest has been merged into `main`.

Checklist:

- [ ] `toolhive` v0.21.0 docs PR - merged
- [ ] `toolhive-studio` v0.32.1 docs PR - merged
- [ ] `toolhive-registry-server` v1.3.2 docs PR - merged
- [ ] `toolhive-cloud-ui` v0.7.2 docs PR - merged

If any pinned-version docs PR is still open or hasn't been
generated yet, that's a blocker.

#### 2. Add enterprise overlay content

Commit enterprise-specific content to `main`:

- Enterprise-only pages (Configuration server guides, IdP
  integration guides, Connectors catalog, policy pack docs, Cloud
  UI administration).
- `:::enterprise` inline admonitions in existing OSS pages where
  Enterprise v1.1 introduces new differentiation.
- Updates to the Enterprise landing page at `/toolhive/enterprise`
  if the feature comparison or pricing has changed.

This content serves double duty: it appears in the Enterprise
snapshot and stays in the OSS rolling latest as upsell content.

#### 3. Sanity-check

Quick review of the docs on `main` against the Enterprise v1.1
manifest. Look for:

- Features documented in latest that aren't in any of the pinned
  component versions.
- Broken links or references to content that doesn't exist yet.
- Enterprise content that references capabilities not in this
  release.

#### 4. Cut the version snapshot

```bash
npx docusaurus docs:version 1.1
```

This creates:

- `versioned_docs/version-1.1/` - a full copy of the `docs/`
  directory
- `versioned_sidebars/version-1.1-sidebars.json` - a snapshot of
  the sidebar configuration
- An entry in `versions.json` for version `1.1`

#### 5. Update Docusaurus config

After cutting the version, add the version-specific config to
`docusaurus.config.ts`:

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

Key settings:

- `lastVersion: 'current'` keeps the `docs/` folder (OSS rolling
  latest) as the default at the root path.
- `path: 'enterprise/1.1'` puts the versioned docs under
  `/enterprise/1.1/toolhive/...` instead of the default
  `/1.1/toolhive/...`.
- `banner: 'none'` suppresses the default "this is an older
  version" banner, which doesn't make sense for an Enterprise
  pinned version.
- `noIndex: true` prevents search engines from indexing versioned
  pages, avoiding duplicate content.

Also add the version dropdown to the navbar (first version cut
only):

```ts title="docusaurus.config.ts (navbar items)"
{
  type: 'docsVersionDropdown',
  position: 'right',
},
```

**Important:** the `versions` config block must not reference a
version until after `docs:version` has been run and `versions.json`
contains it. Docusaurus validates at startup and errors on unknown
versions.

#### 6. Prune old versions if needed

Check whether the N-2 threshold is exceeded. With Enterprise v1.1,
the active versions should be:

| Version              | Status                        |
| -------------------- | ----------------------------- |
| current (OSS latest) | Always active                 |
| 1.1                  | Current Enterprise release    |
| 1.0                  | N-1 (supported)               |
| 0.9                  | N-2 (supported, if it exists) |

If a version older than N-2 exists, remove it:

```bash
# Remove the versioned docs directory
rm -rf versioned_docs/version-0.8

# Remove the versioned sidebar
rm versioned_sidebars/version-0.8-sidebars.json

# Remove the entry from versions.json
# (edit manually or script it)
```

#### 7. Commit and deploy

```bash
git add versioned_docs/version-1.1 \
        versioned_sidebars/version-1.1-sidebars.json \
        versions.json \
        docusaurus.config.ts
git commit -m "Cut Enterprise v1.1 docs snapshot"
```

Open a PR, review, merge, and deploy through the normal pipeline.

### Fallback: release branch for component rollbacks

If a component is rolled back to an older version after its
successor's docs have already landed on `main`, the happy path
doesn't work. For example, a late regression in toolhive v0.22.0
forces a pin to v0.21.0, but the v0.22.0 docs PR has already
merged.

```text
main branch (HEAD)
──────────────────────────────────────────────────

  merge: toolhive v0.21.0 docs PR        ◄── pinned
  merge: toolhive v0.22.0 docs PR        ◄── AHEAD of pin
  ← HEAD
```

In this case:

1. Identify the base commit - the merge of the last pinned-version
   docs PR before the newer version landed.
2. Create a release branch from that commit:
   `git checkout -b enterprise/v1.1 <base-commit>`
3. Add enterprise overlay content on the branch.
4. Cut the version and update config on the branch.
5. Copy the snapshot artifacts back to `main` via PR:

   ```bash
   git checkout main
   git checkout enterprise/v1.1 -- \
       versioned_docs/version-1.1 \
       versioned_sidebars/version-1.1-sidebars.json
   ```

6. Update `versions.json` and `docusaurus.config.ts` on `main`.
7. Prune, commit, and deploy as normal.

## Resulting URL structure

After cutting Enterprise v1.1, the site serves:

| URL path                       | Content                                                 |
| ------------------------------ | ------------------------------------------------------- |
| `/toolhive/...`                | OSS rolling latest (default, indexed by search engines) |
| `/enterprise/1.1/toolhive/...` | Enterprise v1.1 snapshot                                |
| `/enterprise/1.0/toolhive/...` | Enterprise v1.0 snapshot (N-1)                          |

The version dropdown in the navbar shows all active versions,
with the OSS latest as the default selection.

## Validated behavior (spike)

The following was validated on a local dev server using the
Docusaurus config changes described above:

- **OSS latest stays at `/toolhive/...`** - `lastVersion: 'current'`
  keeps the `docs/` folder as the default, served at the root
  route base path. No change to existing OSS URLs.
- **Enterprise version at `/enterprise/1.1/toolhive/...`** - the
  `path: 'enterprise/1.1'` config correctly routes the versioned
  snapshot under the desired prefix.
- **Version dropdown** - the `docsVersionDropdown` navbar item
  renders a dropdown showing "Latest (OSS)" and "Enterprise 1.1".
  Clicking "Enterprise 1.1" navigates to `/enterprise/1.1/toolhive/`.
  Clicking "Latest (OSS)" navigates back to `/toolhive/`.
- **Version badge** - a "Version: Enterprise 1.1" badge appears
  below the breadcrumb on versioned pages, giving clear context.
- **No version banner** - `banner: 'none'` suppresses the default
  "unmaintained version" banner.
- **Sidebar links** - all sidebar links on versioned pages
  correctly use `/enterprise/1.1/toolhive/...` paths.
- **Config ordering constraint** - the `versions` block in the docs
  plugin config must not reference a version until after
  `docs:version` has been run and `versions.json` contains it.
  Docusaurus fails at startup with a validation error otherwise.

## Timeline

### Happy path

```text
Enterprise v1.1 version cut (happy path)
─────────────────────────────────────────────────────────

main branch (time flows down)
│
│  merge: toolhive v0.21.0 docs PR        ◄── latest
│  merge: toolhive-studio v0.32.1 docs PR ◄── latest
│  merge: registry-server v1.3.2 docs PR  ◄── latest
│  merge: cloud-ui v0.7.2 docs PR         ◄── latest
│  ← HEAD (matches Enterprise v1.1 manifest)
│
│
│  Enterprise release declared
│  │
│  ├─ 1. Verify all pinned docs PRs merged ✓
│  ├─ 2. Add enterprise overlays to main
│  ├─ 3. Sanity-check
│  ├─ 4. npx docusaurus docs:version 1.1
│  ├─ 5. Update docusaurus.config.ts
│  ├─ 6. Prune old versions
│  └─ 7. PR, review, merge, deploy
```

### Fallback (component rollback)

```text
Enterprise v1.1 version cut (with rollback)
─────────────────────────────────────────────────────────

main branch (time flows down)
│
│  merge: toolhive v0.21.0 docs PR   ◄── pinned
│  merge: toolhive v0.22.0 docs PR   ◄── AHEAD (rollback)
│  ← HEAD
│
│  Enterprise release declared (pins v0.21.0)
│  │
│  ├─ 1. Identify base commit (v0.21.0 docs PR merge)
│  ├─ 2. Create branch: enterprise/v1.1 from base
│  │       │
│  │       ├─ 3. Add enterprise overlays
│  │       ├─ 4. npx docusaurus docs:version 1.1
│  │       └─ snapshot artifacts ready
│  │
│  ├─ 5. Copy snapshot artifacts to main
│  ├─ 6. Prune old versions
│  └─ 7. PR, review, merge, deploy
```

## Automation opportunities

The version cut can be partially or fully automated as part of the
Enterprise release pipeline in `stacklok-enterprise`:

1. **Trigger:** Enterprise release pipeline reaches the "cut docs"
   stage. The pipeline provides the component version manifest.
2. **Verify:** Script checks that all expected component docs PRs
   (matching the versions in the manifest) have been merged to
   `main` in the docs-website repo. If any are missing or still
   open, the automation blocks and alerts.
3. **Check for drift:** Script compares the pinned versions in the
   manifest against the latest component docs PRs on `main`. If
   `main` is ahead of any pin (a component was rolled back), switch
   to the release branch fallback. Otherwise, proceed with the
   happy path on `main`.
4. **Cut:** Script runs `npx docusaurus docs:version <version>` on
   `main` (happy path) or the release branch (fallback).
5. **Config:** Script updates `docusaurus.config.ts` with the new
   version entry.
6. **PR to main:** Script opens a PR on docs-website with the
   snapshot artifacts, config update, and any version pruning.
7. **Merge and deploy:** Human reviews and merges the PR. Vercel
   deploys automatically.

Step 2 (verify) is the key gate and depends on being able to
reliably identify which docs PR corresponds to which component
version - see open questions below.

## Open questions

- **Component docs PR identification:** How do we reliably match a
  docs PR to a specific component version? This is critical for
  the verification gate (and for the fallback, identifying the base
  commit). Options include PR title conventions, labels, or a
  manifest file in the PR. A structured label like
  `component/toolhive/v0.21.0` would make automated lookups
  straightforward.
- **Partial updates after cut:** If a critical docs fix lands on
  `main` after a version is cut, do we re-cut the version or
  cherry-pick into the `versioned_docs/` directory on `main`? The
  strategy proposal suggests limiting backports to factual errors
  and security content.
