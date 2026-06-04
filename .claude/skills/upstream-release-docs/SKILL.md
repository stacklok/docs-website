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

## Execution modes

This skill runs in one of two modes. **The caller signals the mode; absent an explicit unattended signal, assume interactive.** Never infer unattended mode from surrounding context.

**Interactive (default):** a human is present. At decision points that need product context you cannot derive from source (Phase 2 step 4), ask the user. **Never write the `GAPS.md`, `SUMMARY.md`, or `NO_CHANGES.md` artifacts described below in interactive mode**; surface that information conversationally instead. Those files are machine-readable handoff artifacts for an automated caller, and writing them during a local run just litters the repo root.

**Unattended:** no interactive user, for example a CI workflow that invokes `/upstream-release-docs ... in unattended mode`. Never ask clarifying questions; proceed best-effort at every decision point, and route anything genuinely unresolvable into the artifacts below.

### Unattended decision-point behavior

When Phase 2 step 4 would normally ask the user for a major feature's "why", instead:

1. Fetch the PR body and author with `gh pr view <NUMBER> --repo <OWNER>/<REPO> --json title,body,author`. The PR body usually carries the "why" the author wrote at open time: motivation, intended consumers, design decisions.
2. If the PR body references linked issues ("Closes #N", "Fixes #N", "Refs #N"), fetch the likely-context-bearing ones with `gh issue view <N> --repo <OWNER>/<REPO>`.
3. Write the "why"/consumer narrative directly into the relevant page using what you learned. This is best-effort; reviewers refine it later.
4. Defer to `GAPS.md` only when the rationale demonstrably cannot be derived from available sources: the PR points to an internal design doc you cannot access, multiple plausible consumer narratives exist and choosing one would mislead readers, or a release timeline or commitment needs product-team confirmation.

### Artifacts (unattended mode only, written at repo root)

These files are read by the automated caller and spliced into the PR body. The filenames and the repo-root location are a contract with the caller; do not rename or relocate them.

**`GAPS.md`** - only if you genuinely need to defer (see above). An empty `GAPS.md` is worse than none; do not create it if every feature's "why" was resolvable from available sources.

- Include only content gaps a human reviewer must fill. Exclude environment or sandbox limitations (for example, "couldn't run `npm build`"); the PR's CI handles those. Exclude "documented for clarity, not a gap" commentary.
- Each entry must @-mention the PR author, skipping bot authors (`renovate[bot]`, `github-actions[bot]`, `stacklokbot`).
- Each entry must include a paste-ready "Helper prompt for local Claude" referencing the specific file(s), the PR number for context, and the narrow piece of information the human must supply or confirm.

  Entry format:

  ```markdown
  ### <Feature name> (PR <OWNER>/<REPO>#123 by @alice)

  <One paragraph: what's missing and why it couldn't be resolved from available sources.>

  **File(s):** path/to/file.mdx

  **Helper prompt for local Claude:**

  > <Self-contained, paste-ready prompt referencing the file(s), PR number, and the narrow piece of info needed.>
  ```

**`NO_CHANGES.md`** - if the Phase 3 impact map is empty (no doc-relevant changes for this release), write this at repo root with a one-line explanation and stop. Do not hand-edit any file.

**`SUMMARY.md`** - before the final commit, write a concise list of the hand-written doc changes you made. The caller surfaces it as the PR's "Summary of changes" so reviewers see what shipped without reading the diff. Skip it only when you wrote `NO_CHANGES.md` or made zero hand-edits. Keep it to 3-8 bullets, each formatted as one of:

- `Added <what> at <path>` - new pages/sections
- `Updated <what> in <path>` - meaningful prose edits
- `Swept <what> across N files in <area>` - repo-wide renames, apiVersion bumps, etc.
- `Removed <what> from <path>` - deletions

Describe one logical change as one bullet (don't enumerate each file in a sweep), and exclude auto-generated reference files the caller's refresh step updates: describe only your hand-written edits.

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
   - **In unattended mode, do not ask.** Follow the unattended decision-point behavior in [Execution modes](#execution-modes): derive the "why" from the PR body and linked issues, write it best-effort, and defer to `GAPS.md` only when it is genuinely underivable.

5. **Check related repositories**: components often span multiple repos. For example, a server's CRD/operator may live in a different repo than the server itself. When a release changes config structures, API surfaces, or deployment models, check whether related repos (operators, CLIs, client libraries) have also released changes that affect the documentation. Ask the user which repos are related if unclear (in unattended mode, infer related repos from the release notes and proceed best-effort).

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

10. **Inventory the new public surface.** As you read the source and the regenerated reference assets, list every new or changed user-facing symbol the release introduces: CRD/struct fields, enum values, CLI flags and subcommands, env vars, config keys, and API routes. Most are already enumerated in the auto-synced reference assets (CLI `.md`, CRD `*.schema.json`, Swagger YAML) and the diff, so this is mostly transcription, not discovery. This list is the checklist the completeness pass in Phase 5 verifies against. It is the difference between documentation that is _accurate_ and documentation that is _complete_: a release can ship five new config fields, and a section that explains one of them correctly passes every accuracy check while silently omitting the other four.

## Phase 3: Audit Existing Docs

1. Search the documentation codebase for references to affected areas:
   - Config values, env var names, CLI flags
   - Feature names, API paths, version numbers
   - Any terminology that changed

2. **Displacement audit (find what the release makes false, not just what it adds).** This is the step most often skipped, and the skipped result is documentation that adds a correct new section while leaving stale claims that now contradict it. A release PR is a delta: it tells you what was _added_, never which existing sentences that addition _falsifies_. Closing that gap is your job here, not the reviewer's.

   For each new or changed feature, ask: **does it add an alternative, a replacement, a default change, or an additional option for a capability the docs already describe?** If yes, the feature has a _displaced concept_. Audit the displaced concept's vocabulary, not the new feature's:
   - The new feature's terms (the new flag, config key, or feature name) only find where to _add_ content. Search them to place the new section.
   - The displaced concept's terms find where existing prose is now _wrong_. A feature named CIMD that adds a second client-registration mechanism falsifies sentences about the _old_ mechanism (DCR, "Dynamic Client Registration", "register automatically"). Grep for those, not for the new feature name.

   Then sweep the displaced concept's surrounding prose for **exclusivity and temporal language**, the phrasing that silently goes stale when a feature lands:
   - Exclusivity: "only", "the only", "must", "always", "automatically", "the way to", "requires".
   - Temporal/roadmap: "currently implements", "is planned", "not yet", "coming soon", "future release", "for now".
   - Each hit is a candidate contradiction. Read it against the verified new behavior and decide whether it must be revised.

3. **Heed the additive-only smell.** If your planned edit to an existing page only _appends_ a new section and revises no existing sentence (a `+N / -0` diff on a prose page), treat that as a signal, not a success. A newly added capability almost always falsifies an existing "only / default / planned" statement nearby. Reconcile the page you are editing with the section you just added to it, then check sibling pages that cover the same concept.

4. Check the project style guide (CLAUDE.md, STYLE-GUIDE.md, or similar) for conventions.

5. Build an **impact map**, a table with these columns:

   | File | Current text/value | Verified replacement | Change type |
   | --- | --- | --- | --- |
   | path | what exists now | what it should be | update/new/remove/contradiction |

   Use the `contradiction` change type for existing statements the release falsifies (stale exclusivity or roadmap claims). Every contradiction found in the displacement audit must appear as a row. A feature that adds a new section to one page typically produces several `contradiction` rows across sibling pages, not just an `new` row on the page you extended.

6. **Log the impact map** for transparency, then proceed to Phase 4.

## Phase 4: Implementation

Apply the approved changes:

1. **Update existing pages, and prefer extending them over creating new ones.** Edit files using the impact map, preserving the existing writing style and conventions. When a feature _extends_ a capability the docs already cover (a new auth mechanism alongside an existing one, a new flag on a documented command, an additional option on a documented resource), the right move is almost always to add a section to the existing page and reconcile the surrounding prose (see the displacement audit in Phase 3), not to spin up a standalone page. A standalone page for an extension fragments the concept across two locations, duplicates context, and is a common over-documentation failure mode. Reserve new pages for genuinely standalone capabilities (see the next step).

   **But split instead of extending when the section would overload the host page.** "Prefer extending" is a default, not a mandate to cram everything onto one page; the opposite failure is a page that accretes a section every release until it is too dense to scan and breaks progressive disclosure. Graduate the content to its own page, leaving a brief summary and a cross-link behind, when any of these hold:
   - The content is a distinct subject readers would look for by its own name, not a facet of the host page's subject.
   - It has its own full how-to lifecycle (setup, configure, verify, troubleshoot). In this case the _concept_ can stay as a section on the host page while the _guide_ becomes its own page; both can be correct at once.
   - The host page is already long or already covers multiple capabilities, so adding more would bury existing content.

   The test is whether the new content shares the host page's subject and keeps it focused, not extend-versus-new in the abstract.

2. **Create new pages** for genuinely standalone new features that lack existing documentation. Default to documenting new features rather than skipping them, but first confirm the feature is standalone rather than an extension of something already documented (if it extends an existing capability, prefer step 1):

   **Page placement**: the docs are organized by product area under `docs/toolhive/`. Place new content in the correct section:
   - **Product-specific guides** go in the relevant product section (`docs/toolhive/guides-ui/`, `guides-cli/`, `guides-k8s/`, `guides-vmcp/`, `guides-registry/`).
   - **Third-party integration guides** go in `docs/toolhive/integrations/`.
   - **Cross-cutting concepts** go in `docs/toolhive/concepts/`.
   - **Per-MCP-server usage guides** go in `docs/toolhive/guides-mcp/`.
   - **Reference material** goes in `docs/toolhive/reference/`.
   - Check the project's CLAUDE.md "Information architecture" section for the full placement rules.

   **Diataxis separation**: keep document types distinct, but apply this at the right granularity. The rule is that concept and how-to content stay distinguishable, not that every feature gets its own page set. For a genuinely standalone capability, create separate pages per document type rather than one combined page. For a feature that extends existing documentation, a new section of the appropriate type _within_ an existing page is usually correct and preferable to a new page; don't fragment a concept across a new standalone page just to satisfy the separation rule. The page types below describe the content each type should contain, whether it lives on its own page or as a section:
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

   This pass **must extend beyond the files you changed.** Stale claims live in pages the release did not touch, which is exactly why they get missed: per-changed-file verification can never surface a contradiction in a file that has no diff. For every concept introduced or changed this release, re-grep the displaced concept's vocabulary and the exclusivity/temporal phrases from Phase 3 across the entire docs set, and verify each surviving statement against the new source-of-truth behavior. If any page still asserts the old mechanism is the only, default, automatic, or planned-future option, it is a defect even though it is not in your diff. Spawn a verification agent dedicated to this displacement check, separate from the per-file agents.

2. **Verify completeness, not just accuracy.** The pass above confirms that what you wrote is _true_; this pass confirms that what the release _shipped_ is covered. Accurate-but-partial documentation (a correct new section that explains half a feature's surface) passes every accuracy check and is the most common silent failure of this workflow, because nothing in an accuracy review flags an omission. Take the new-public-surface inventory from Phase 2 and confirm each symbol is either:
   - documented in prose (a guide, concept, or reference page mentions and explains it), or
   - consciously deferred, with the reason recorded (auto-generated reference only, hidden/experimental, or a deferral entry).

   Any inventoried symbol that is neither documented nor deferred is a coverage gap: document it, or record why not. Do not let a symbol fall through silently. A section that documents a feature's happy path but omits its flags, enum values, or config knobs is incomplete even when every sentence in it is accurate. For large surfaces, spawn a coverage agent that takes the inventory and the changed/related doc files and returns, per symbol, "documented at `file:line`" or "not found."

3. **Build the site**: run the project's build command to check for broken links, missing references, or build errors.

4. **Run linting**: execute the project's lint/format commands.

5. **Run `/docs-review`**: invoke the docs-review skill on all changed and new files to catch style, structure, and clarity issues. When the review returns, **do not stop or present the findings to the user**. Instead, immediately apply every actionable fix yourself:
   - For primary issues: edit the files to resolve them.
   - For secondary issues and inline suggestions: apply the fixes directly.
   - For items you disagree with (e.g., they conflict with verified source code): do not apply the suggestion, but briefly log each skipped item with a source-verified reason for auditability.
   - After applying fixes, re-run formatting/linting to ensure the fixes are clean.

6. Fix any remaining issues found in the build or lint steps. Re-run validation until clean.

## Phase 6: Handle Review Feedback

When receiving review comments (from humans or automated reviewers):

1. **Verify every review comment against source code** before acting on it. Reviewers can be wrong.

2. If a comment is correct, implement the fix and verify the result.

3. If a comment is incorrect, respond with evidence from the source code. Include the actual code snippet and the file path at the tag.

4. If a comment is ambiguous, check the source code to determine the correct behavior, then respond with your findings.

## Key Principles

- **Triple verification**: verify during deep dive (Phase 2), before finalizing (Phase 5), and when handling reviews (Phase 6)
- **Document what the release falsifies, not just what it adds**: a new capability usually makes prior "only / default / automatic / planned" statements wrong. Audit the _displaced_ concept's vocabulary across the whole docs set, and treat a purely additive (`+N / -0`) prose edit as a smell. The reviewer cannot catch a sin of omission in a zero-deletion diff; the skill must (Phase 3 displacement audit).
- **Transparency**: log the categorized summary (after Phase 1) and impact map (after Phase 3) for auditability, but do not stop; run all phases to completion
- **Respect auto-generated content**: don't manually edit auto-generated files, but always create the surrounding conceptual/guide content that auto-generated reference docs don't provide
- **Separate by Diataxis type, at the right granularity**: keep concept and how-to content distinguishable, but prefer extending an existing page over a new one when the feature extends a documented capability. Reserve new pages for standalone capabilities, and split a section out only when it would overload its host (Phase 4).
- **Verify completeness, not just accuracy**: accuracy checks never catch what you left out. Inventory the release's new public surface in Phase 2 and confirm in Phase 5 that each symbol is documented or consciously deferred. An accurate section that covers only part of a feature's surface is this workflow's most common silent failure.
- **Document the full lifecycle**: if a feature has producer and consumer sides, document both. Always answer "then what?" Readers who follow the docs to completion must not hit a dead end. If consumption tooling isn't built yet, say so explicitly.
- **Ask for context on major features**: don't fabricate the "why" from code alone. Interactive mode asks the user for user stories, PRDs, or RFCs; unattended mode derives it from PR bodies and linked issues, deferring to `GAPS.md` only when genuinely underivable (see [Execution modes](#execution-modes)). Incremental changes proceed autonomously in either mode.
- **Lead with scenarios, not abstractions**: open concept pages with concrete "who is this for and why should they care" scenarios, not abstract definitions
- **Flag gaps honestly**: if consumption tooling, client support, or integration isn't ready yet, say so explicitly rather than omitting the topic
- **Use realistic examples**: guide pages need end-to-end examples with plausible data, exact commands, and expected output, not placeholder values
- **Call out naming conventions**: when a feature introduces naming rules (casing, allowed characters, namespacing), document them explicitly with valid/invalid examples
- **Don't document hidden features**: skip features marked as hidden, experimental, or internal unless explicitly asked
- **Follow existing conventions**: match the project's style guide, writing voice, file structure, and naming patterns
- **Be project-agnostic**: this workflow applies to any upstream project and any docs site. Do not assume specific frameworks, file paths, or tools.
