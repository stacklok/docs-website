# Maintain release documentation

Release updates combine generated references with changes to hand-written
documentation. Public ToolHive projects use the Renovate and AI-assisted
workflow described below. Stacklok Enterprise Platform supplies generated
references through a separate release-specific pull request.

## Release configuration

[`upstream-projects.yaml`](../../.github/upstream-projects.yaml) declares the
upstream projects and their reference inputs. Use it to find which release owns
an artifact and where its output belongs.

| Field        | Purpose                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------ |
| `id`, `repo` | Identify the upstream project                                                                    |
| `version`    | Pin the release tracked by Renovate for public projects                                          |
| `docs_paths` | Suggest areas for the authoring skill to investigate; the skill can identify changes elsewhere   |
| `assets`     | Copy files from the release checkout or download release assets, optionally extracting a tarball |
| `crds`       | Declare CRD inputs, schema output directories, generated pages, and landing-page text            |
| `helm`       | Declare chart inputs, generated pages, introductions, related links, and description overrides   |
| `pin_files`  | Apply declared release-tag substitutions to other files, when configured                         |

The public projects with version pins are ToolHive, Registry Server, and
ToolHive Studio. Enterprise Platform has reference declarations but no Renovate
version pin.

## Public-project release workflow

[`renovate.json`](../../renovate.json) watches the public-project version pins
and opens release-update PRs labeled `autogen-docs`. The release rule accepts
stable releases after a one-hour minimum release age. It disables automatic
rebasing and recreation so the documentation workflow can add commits to the
same branch.

The
[Upstream Release Docs workflow](../../.github/workflows/upstream-release-docs.yml)
runs on opened or reopened Renovate PRs that change the project configuration.
Human-authored configuration PRs receive normal review unless you explicitly
dispatch the workflow. Runs are serialized to avoid concurrent authoring on
shared pages.

The workflow performs these stages:

1. Converts the PR to draft, identifies the changed project and release range,
   verifies the previous tag, and checks out the new upstream tag.
2. Copies declared assets, extracts CRD schemas and generates pages, and
   generates Helm values references where configured. For ToolHive, it also
   bundles the upstream registry schema. It commits and pushes the refreshed
   references before the AI sessions begin.
3. Runs the
   [upstream-release-docs skill](../../.claude/skills/upstream-release-docs/SKILL.md)
   to investigate release changes against source and update hand-written docs.
4. Runs a separate editorial session using the
   [docs-review skill](../../.claude/skills/docs-review/SKILL.md). This session
   reviews the authoring changes with fresh context.
5. Applies formatting and lint fixes, declared pin substitutions, and checks for
   AI edits to generated paths. It pushes the resulting commits, summarizes the
   work in the PR body, assigns the release owner, and requests reviews.
6. Marks the PR ready for review after successful completion. A failed run
   leaves it as draft for investigation and retry.

The reviewer-routing helper uses the release owner and the AI session's
`REVIEWERS.json` classification of docs-facing contributors. If that
classification is unusable, it falls back to the contributor candidates. See
[`assign_release_docs_reviewers.py`](../../.github/scripts/assign_release_docs_reviewers.py)
for access handling and reviewer fallbacks.

The [notification workflow](../../.github/workflows/autogen-docs-notify.yml)
follows successful automatic runs on eligible `autogen-docs` Renovate PRs.
Manual bootstrap and retry runs do not trigger that automatic notification path.
Review readiness still depends on the PR, its checks, and human review.

## Review a release PR

1. Confirm the project, previous tag, and new tag in the version change and PR
   summary. Check the workflow result and any warnings about incomplete
   generation, editorial review, or changes to generated paths.
2. Review generated references separately from hand-written changes. Confirm the
   outputs belong to the intended release and inspect unexpected additions,
   removals, or schema changes. Use the
   [reference refresh guide](./references.md) to find the source of a problem.
3. Check the hand-written docs against the released behavior. The AI sessions
   assist authoring and review; they do not replace the release owner's or
   contributor's factual review.
4. Check the final branch's formatting, lint, build, and preview results. The
   workflow can push multiple commits, so assess the checks for the latest PR
   head. Follow the [deployment review guide](../deployment/README.md).
5. After merging, verify production and check search when reference rendering or
   extraction has changed.

## Retry or bootstrap an update

Use the workflow's **Run workflow** form or the GitHub CLI with repository write
access. Choose one mode per dispatch.

To retry an existing open Renovate or `github-actions[bot]` PR:

```bash
gh workflow run upstream-release-docs.yml \
  --repo stacklok/docs-website \
  --ref main \
  -f pr_number='<PR_NUMBER>'
```

To create a release-update PR manually, supply a public-project ID and an
existing upstream release tag:

```bash
gh workflow run upstream-release-docs.yml \
  --repo stacklok/docs-website \
  --ref main \
  -f project_id=toolhive \
  -f new_tag='<RELEASE_TAG>'
```

Bootstrap creates a `manual/upstream-<PROJECT_ID>-<RELEASE_TAG>` branch and PR.
If that branch already exists, retry its PR. The workflow requires exactly one
changed public-project version and a valid previous tag; inspect the first
failing step before changing the pin or dispatching again.

Dispatching starts the workflow asynchronously. Open the Actions run to follow
its progress, then inspect the updated PR and its checks. Workflow retries can
write new commits and replace the generated portion of the PR summary.

## Enterprise Platform reference updates

Enterprise Platform publishes a release-specific reference PR into this public
repository. Its entry in `upstream-projects.yaml` describes the public API, CRD,
and Helm outputs. The publisher runs on the Enterprise Platform side; this
repository does not fetch its private source or track its releases through
Renovate.

Review the delivered references, release provenance supplied by the PR, build,
and preview. Route source corrections to the Enterprise Platform maintainers.
Publisher implementation and access setup belong in the internal repository.

## Next steps

- Use the [reference refresh guide](./references.md) to correct generated
  content at its source.
- Follow [deployment and preview verification](../deployment/README.md) before
  merging and after publication.
