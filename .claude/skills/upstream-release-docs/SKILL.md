---
name: upstream-release-docs
description: >
  Analyze an upstream project's new release, verify changes against source code, and update documentation. Covers discovery, deep-dive into PRs/issues, docs audit, source-verified implementation, and review feedback handling.


argument-hint: '<owner/repo> [tag]'
---

# Upstream Release Documentation

Analyze a new release of an upstream project and update the documentation site to reflect verified changes.

## Core Principle

**Verify everything against source code at the release tag.** Never trust release notes, PR descriptions, PR review comments, or issue descriptions at face value. Always check actual source code using:

```bash
gh api repos/<OWNER>/<REPO>/contents/<PATH>?ref=<TAG>
```

Claims from any human-written source (release notes, PR bodies, review comments) may be inaccurate, outdated, or aspirational. The source code at the tag is the single source of truth.

## Input

Parse the argument to extract:

- `<OWNER>/<REPO>`: the upstream repository (e.g., `stacklok/toolhive-registry-server`)
- `<TAG>` (optional): the release tag (e.g., `v0.6.3`). If omitted, fetch the latest release.

## Output conventions

Any output that may be rendered as a GitHub comment, PR body, or Markdown file in the docs-website repo (progress narration, `SUMMARY.md`, `GAPS.md`, commit messages, PR descriptions) **must** fully qualify references to the upstream repo. GitHub auto-links bare `#NNN` relative to the repo the text lives in, so a bare `#777` in a docs-website comment links to docs-website PR #777, not the upstream PR.

- Refer to upstream PRs and issues as `<OWNER>/<REPO>#NNN` (e.g., `stacklok/toolhive#777`), never bare `#NNN`.
- When the release notes body contains bare `#NNN`, expand them to `<OWNER>/<REPO>#NNN` before echoing them back.
- Full PR/issue URLs are also fine.

## Phase 1: Discovery

1. Fetch the release:

   ```bash
   gh release view <TAG> --repo <OWNER>/<REPO> --json tagName,name,body,publishedAt
   ```

   If no tag was provided:

   ```bash
   gh release view --repo <OWNER>/<REPO> --json tagName,name,body,publishedAt
   ```

2. Extract PR numbers from the release notes body (look for `#NNN` patterns or full PR URLs). When referring to these PRs in any subsequent output, always fully qualify them as `<OWNER>/<REPO>#NNN` (see "Output conventions" above).

3. Categorize changes into:
   - **New features**: entirely new capabilities
   - **Changed defaults**: existing behavior that now works differently
   - **New/changed configuration**: new config options, env vars, CLI flags
   - **Deprecations**: features or options being phased out
   - **API changes**: new/modified endpoints, request/response formats
   - **Bug fixes**: corrections that may affect documented behavior
   - **Internal/infra**: CI, dependencies, refactoring (usually no docs impact)

4. **Log the categorized summary** for transparency, then proceed to Phase 2.

## Phase 2: Deep Dive

For each PR identified in Phase 1 (skip internal/infra unless user requests):

1. Fetch PR details:

   ```bash
   gh pr view <NUMBER> --repo <OWNER>/<REPO> --json title,body,files
   ```

2. Fetch linked issues if referenced:

   ```bash
   gh issue view <NUMBER> --repo <OWNER>/<REPO> --json title,body
   ```

3. **Understand the "why"**: for new features, look beyond the code to understand motivation and intended usage:
   - Check linked issues for user stories, acceptance criteria, and "definition of done"
   - Follow references to RFCs, design docs, or PRDs linked from issues or PR descriptions
   - Identify the intended user workflow: who uses this, why, and what happens after?
   - Map the full lifecycle: if the feature has a publish/produce side, actively search the source code for the consume/discover side. Check CLIs, client libraries, and related repositories. If consumption tooling doesn't exist in this release, note that explicitly. This gap **must** be documented rather than silently omitted.
   - If the "why" and consumption story aren't clear from any source, flag this gap. Documentation that only covers the API surface without explaining purpose or workflow is incomplete

4. **For major new features**: when a change introduces an entirely new capability (not just a config change or incremental addition), the "why" and consumer workflow often cannot be derived from source code alone. In this case, **ask the user for additional context** before writing documentation:
   - Request user stories, PRDs, RFCs, or design documents that explain the motivation and intended usage
   - Ask who the target users are and what workflow they're expected to follow
   - Ask how consumers are expected to discover and use the feature (CLI, IDE extension, API, etc.)
   - Do not attempt to fabricate the "why" or consumer story from code structure alone. This produces documentation that covers the "what" and "how" but misses the perspective and voice that only comes from understanding the product intent
   - Incremental changes (new config options, default changes, annotation additions) can proceed without this step

5. **Check related repositories**: components often span multiple repos. For example, a server's CRD/operator may live in a different repo than the server itself. When a release changes config structures, API surfaces, or deployment models, check whether related repos (operators, CLIs, client libraries) have also released changes that affect the documentation. Ask the user which repos are related if unclear.

6. **Read the actual source code at the release tag** to verify every claim made in the PR description:

   ```bash
   gh api repos/<OWNER>/<REPO>/contents/<PATH>?ref=<TAG>
   ```

   The response is base64-encoded; decode it to read the content.

7. Note discrepancies between PR descriptions and actual code. Trust the code.

8. **Deep-verify behavioral claims**: these are the most common source of documentation inaccuracy. For each feature, verify not just struct definitions but actual runtime behavior:
   - **API routes**: Check the actual route registration code (e.g., `r.Get`, `r.Post`, `r.Delete`), not just handler names. Docs often claim endpoints exist at paths where no handler is registered.
   - **Required fields**: Check validation code (e.g., `if field == ""` checks), not just struct definitions. A field present in a struct is not necessarily required; only fields checked in validation logic are enforced.
   - **Default values**: Check the actual defaulting code or fallback logic, not comments or struct tags. For example, "defaults to main" may actually mean "defaults to the remote's HEAD" in practice.
   - **Precedence rules**: Read the actual `if/else` chain. For example, `if commit != "" { ... } else if branch != "" { ... } else if tag != "" { ... }` means commit > branch > tag, not commit > tag > branch.
   - **Delete/cleanup behavior**: Check whether the code reassigns pointers, cascades deletes, or leaves orphans. Delete behavior is frequently mis-documented.
   - **Query parameters**: Check whether parsed parameters are actually wired to the service layer and database queries. Parameters can be parsed from the URL but silently ignored if no service option or SQL filter exists for them.
   - **Containment/authorization direction**: When documenting subset/superset checks, verify which argument is the caller and which is the resource. Getting the direction wrong produces examples that show the opposite of actual behavior.

9. Identify:
   - **Auto-generated content**: files generated from upstream (OpenAPI specs, CLI reference docs, JSON schemas). Do not manually edit these; flag them for automated update instead. However, auto-generated reference docs (e.g., API endpoints from a swagger spec) do **not** replace the need for conceptual explanations, guide content, or cross-references in existing pages. A new feature with auto-generated API docs still needs: (1) a conceptual explanation of what it is and why it exists, (2) mentions and cross-references in related existing pages (intro pages, feature lists, related guides), and (3) guide content if the feature has non-trivial workflows. Only skip creating a **duplicate API reference page**: never skip the surrounding documentation.
   - **Hidden/experimental features**: look for indicators like `Hidden: true` in CLI command definitions, feature flags, or internal-only annotations. Do not document these unless the user explicitly asks.

## Phase 3: Audit Existing Docs

1. Search the documentation codebase for references to affected areas:
   - Config values, env var names, CLI flags
   - Feature names, API paths, version numbers
   - Any terminology that changed

2. Check the project style guide (CLAUDE.md, STYLE-GUIDE.md, or similar) for conventions.

3. Build an **impact map**, a table with these columns:

   | File | Current text/value | Verified replacement | Change type       |
   | ---- | ------------------ | -------------------- | ----------------- |
   | path | what exists now    | what it should be    | update/new/remove |

4. **Log the impact map** for transparency, then proceed to Phase 4.

## Phase 4: Implementation

Apply the approved changes:

1. **Update existing pages**: edit files using the impact map. Preserve the existing writing style and conventions.

2. **Create new pages** for new features that lack existing documentation. Default to documenting new features rather than skipping them:

   **Page placement**: the docs are organized by product area under `docs/toolhive/`. Place new content in the correct section:
   - **Product-specific guides** go in the relevant product section (`docs/toolhive/guides-ui/`, `guides-cli/`, `guides-k8s/`, `guides-vmcp/`, `guides-registry/`).
   - **Third-party integration guides** go in `docs/toolhive/integrations/`.
   - **Cross-cutting concepts** go in `docs/toolhive/concepts/`.
   - **Per-MCP-server usage guides** go in `docs/toolhive/guides-mcp/`.
   - **Reference material** goes in `docs/toolhive/reference/`.
   - Check the project's CLAUDE.md "Information architecture" section for the full placement rules.

   **Diataxis separation**: create separate pages per document type, not one combined page:
   - **Concept page** (explanation): What is this feature, why does it exist, when would you use it? Lead with concrete scenarios and user personas ("If you maintain a shared MCP registry and want to let teams publish reusable tool bundles..."). Explain relationships to existing features.
   - **Guide page** (how-to): Task-oriented, organized by user goals, not by API endpoint order. Include practical examples: realistic `curl` commands, sample payloads with plausible values, expected responses, and error cases. If a feature has both producer and consumer sides, document both workflows.
   - **Reference page**: Only create if not already auto-generated. If auto-generated API reference exists, link to it instead of duplicating endpoint listings.

   **Consumer workflow**: this is a hard requirement, not optional. For every feature that has a publish/produce side, you **must** answer "then what?" in the documentation. Specifically:
   - How does a consumer discover what was published?
   - How does a consumer install, fetch, or use it?
   - What tooling exists for consumption (CLI commands, IDE extensions, API calls)?
   - If consumption tooling doesn't exist yet, **say so explicitly** in the docs. A single sentence closing the gap is better than silence. Example: "Skill installation via agent clients is planned for a future release; for now, the registry serves as a discovery and distribution layer."
   - Readers who follow the docs to completion must not hit a dead end.

   **Practical examples**: every guide page needs at least one end-to-end example with:
   - Realistic sample data (not `foo`/`bar` placeholders)
   - The exact commands or API calls to run
   - Expected output or response
   - What to do if something goes wrong

   **Naming conventions**: when the feature introduces naming rules (e.g., kebab-case identifiers, camelCase config keys), call these out explicitly with examples of valid and invalid names.

   **Page mechanics:**
   - Place each page in the appropriate product section directory (see "Page placement" above)
   - Update sidebar/navigation configuration in `sidebars.ts`
   - Update frontmatter descriptions on all new and modified pages
   - Add a "Next steps" section at the end of every how-to guide and tutorial page with 1-3 forward links
   - Only skip creating a page that would duplicate auto-generated reference content (e.g., don't manually list API endpoints that are already in a swagger-rendered page)

3. **Add cross-references**: link new content from related existing pages and vice versa.

4. **Update version references**: bump version numbers in install instructions, compatibility matrices, etc.

5. Do not edit auto-generated files. If they need updating, note this for the user.

6. **CRD reference updates**: the Kubernetes CRD reference is partially auto-generated. If the release touches CRDs, know the split:

   **Fully auto-generated** (do not hand-edit):
   - `static/api-specs/crds/*.schema.json` - extracted JSON Schema per CRD
   - `static/api-specs/crds/*.example.yaml` - minimal required-fields YAML example
   - `static/api-specs/crds/index.json` - metadata + cross-reference graph
   - `static/api-specs/crds/sidebar.json` - sidebar fragment consumed by `sidebars.ts`
   - `src/components/CRDReference/schemas.ts` - Kind -> schema index imported by the `<CRDFields>` component
   - `docs/toolhive/reference/crds/*.mdx` - per-CRD pages (including the landing `index.mdx`)

   These come from `scripts/extract-crd-schemas.mjs` + `scripts/generate-crd-pages.mjs`, run by `scripts/update-toolhive-reference.sh`. Regenerating just means re-running the script; do not edit the MDX directly.

   **Hand-written overrides** (`scripts/lib/crd-intros.mjs`): every CRD in `index.json` publishes automatically using schema-derived defaults. Entries in this file override those defaults to polish a page. All fields are optional:
   - `slug`: URL segment and MDX filename. Default: `Kind.toLowerCase()`.
   - `group`: `'core'` or `'shared'`. Default: `'shared'`.
   - `summary`: one-sentence DocCard pitch. Default: first sentence of the cleaned upstream schema description.
   - `description`: SEO meta description (80-150 chars). Default: `"Schema reference for <Kind>."`.
   - `intro`: markdown prose at the top of the page, with inline cross-links using `[Kind](./slug.mdx)` form. Default: the cleaned upstream schema description.

   **When the release adds a new CRD**:
   - The release PR auto-publishes the new CRD with schema-derived defaults and flags it in a `[!NOTE]` block. No blocker.
   - Review the generated page. If the upstream kubebuilder description is thin or the CRD should live in the `core` group or appear higher on the landing page, add an override entry for that Kind to `crd-intros.mjs` and re-run `node scripts/generate-crd-pages.mjs`. Overridden entries render before defaults-only entries within each group, in the order they are declared in the file.
   - Commit the intros change plus the regenerated outputs. You can also land this as a follow-up PR after the release PR merges.

   **When the release modifies an existing CRD**: the schema/example regenerate automatically. If the CRD has no override entry, the intro prose will track the upstream description automatically. If it does have an override entry, update the `intro` only if the CRD's role materially shifted.

## Phase 5: Validation

1. **Re-verify every factual claim** against source code at the tag. This is the third verification pass (after Phase 2 and Phase 4). For large doc sets, spawn parallel verification agents (one per file or topic area) to check all claims concurrently. Each agent should read the doc file and verify every factual claim (struct fields, API routes, defaults, behavioral logic) against the actual source code at the release tag. Collect and resolve any discrepancies before proceeding.

2. **Build the site**: run the project's build command to check for broken links, missing references, or build errors.

3. **Run linting**: execute the project's lint/format commands.

4. **Run `/docs-review`**: invoke the docs-review skill on all changed and new files to catch style, structure, and clarity issues. When the review returns, **do not stop or present the findings to the user**. Instead, immediately apply every actionable fix yourself:
   - For primary issues: edit the files to resolve them.
   - For secondary issues and inline suggestions: apply the fixes directly.
   - For items you disagree with (e.g., they conflict with verified source code): do not apply the suggestion, but briefly log each skipped item with a source-verified reason for auditability.
   - After applying fixes, re-run formatting/linting to ensure the fixes are clean.

5. Fix any remaining issues found in the build or lint steps. Re-run validation until clean.

## Phase 6: Handle Review Feedback

When receiving review comments (from humans or automated reviewers):

1. **Verify every review comment against source code** before acting on it. Reviewers can be wrong.

2. If a comment is correct, implement the fix and verify the result.

3. If a comment is incorrect, respond with evidence from the source code. Include the actual code snippet and the file path at the tag.

4. If a comment is ambiguous, check the source code to determine the correct behavior, then respond with your findings.

## Key Principles

- **Triple verification**: verify during deep dive (Phase 2), before finalizing (Phase 5), and when handling reviews (Phase 6)
- **Transparency**: log the categorized summary (after Phase 1) and impact map (after Phase 3) for auditability, but do not stop; run all phases to completion
- **Respect auto-generated content**: don't manually edit auto-generated files, but always create the surrounding conceptual/guide content that auto-generated reference docs don't provide
- **Separate by Diataxis type**: never combine concepts and how-to guides in a single page. Create separate pages for each document type.
- **Document the full lifecycle**: if a feature has producer and consumer sides, document both. Always answer "then what?" Readers who follow the docs to completion must not hit a dead end. If consumption tooling isn't built yet, say so explicitly.
- **Ask for context on major features**: for entirely new capabilities, don't fabricate the "why" from code alone. Ask the user for user stories, PRDs, or RFCs. Incremental changes can proceed autonomously, but big feature introductions need human input to capture product intent and voice.
- **Lead with scenarios, not abstractions**: open concept pages with concrete "who is this for and why should they care" scenarios, not abstract definitions
- **Flag gaps honestly**: if consumption tooling, client support, or integration isn't ready yet, say so explicitly rather than omitting the topic
- **Use realistic examples**: guide pages need end-to-end examples with plausible data, exact commands, and expected output, not placeholder values
- **Call out naming conventions**: when a feature introduces naming rules (casing, allowed characters, namespacing), document them explicitly with valid/invalid examples
- **Don't document hidden features**: skip features marked as hidden, experimental, or internal unless explicitly asked
- **Follow existing conventions**: match the project's style guide, writing voice, file structure, and naming patterns
- **Be project-agnostic**: this workflow applies to any upstream project and any docs site. Do not assume specific frameworks, file paths, or tools.
