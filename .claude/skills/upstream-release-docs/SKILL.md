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

```
gh api repos/OWNER/REPO/contents/PATH?ref=TAG
```

Claims from any human-written source (release notes, PR bodies, review comments) may be inaccurate, outdated, or aspirational. The source code at the tag is the single source of truth.

## Input

Parse the argument to extract:

- `OWNER/REPO` — the upstream repository (e.g., `stacklok/toolhive-registry-server`)
- `TAG` (optional) — the release tag (e.g., `v0.6.3`). If omitted, fetch the latest release.

## Phase 1: Discovery

1. Fetch the release:

   ```
   gh release view TAG --repo OWNER/REPO --json tagName,name,body,publishedAt
   ```

   If no tag was provided:

   ```
   gh release view --repo OWNER/REPO --json tagName,name,body,publishedAt
   ```

2. Extract PR numbers from the release notes body (look for `#NNN` patterns or full PR URLs).

3. Categorize changes into:
   - **New features** — entirely new capabilities
   - **Changed defaults** — existing behavior that now works differently
   - **New/changed configuration** — new config options, env vars, CLI flags
   - **Deprecations** — features or options being phased out
   - **API changes** — new/modified endpoints, request/response formats
   - **Bug fixes** — corrections that may affect documented behavior
   - **Internal/infra** — CI, dependencies, refactoring (usually no docs impact)

4. **Present the categorized summary to the user.** Wait for approval before proceeding.

## Phase 2: Deep Dive

For each PR identified in Phase 1 (skip internal/infra unless user requests):

1. Fetch PR details:

   ```
   gh pr view NUMBER --repo OWNER/REPO --json title,body,files
   ```

2. Fetch linked issues if referenced:

   ```
   gh issue view NUMBER --repo OWNER/REPO --json title,body
   ```

3. **Read the actual source code at the release tag** to verify every claim made in the PR description:

   ```
   gh api repos/OWNER/REPO/contents/PATH?ref=TAG
   ```

   The response is base64-encoded; decode it to read the content.

4. Note discrepancies between PR descriptions and actual code. Trust the code.

5. Identify:
   - **Auto-updated content** — files generated from upstream (OpenAPI specs, CLI reference docs, JSON schemas). These should not be manually edited; flag them for automated update instead.
   - **Hidden/experimental features** — look for indicators like `Hidden: true` in CLI command definitions, feature flags, or internal-only annotations. Do not document these unless the user explicitly asks.

## Phase 3: Audit Existing Docs

1. Search the documentation codebase for references to affected areas:
   - Config values, env var names, CLI flags
   - Feature names, API paths, version numbers
   - Any terminology that changed

2. Check the project style guide (CLAUDE.md, STYLE-GUIDE.md, or similar) for conventions.

3. Build an **impact map** — a table with: | File | Current text/value | Verified replacement | Change type | |------|-------------------|---------------------|-------------| | path | what exists now | what it should be | update/new/remove |

4. **Present the impact map to the user.** Wait for approval before implementing.

## Phase 4: Implementation

Apply the approved changes:

1. **Update existing pages** — edit files using the impact map. Preserve the existing writing style and conventions.

2. **Create new pages** if a feature requires dedicated documentation:
   - Follow the project's information architecture framework (e.g., Diataxis: tutorials, how-to guides, reference, concepts)
   - Place the page in the appropriate directory
   - Update sidebar/navigation configuration

3. **Add cross-references** — link new content from related existing pages and vice versa.

4. **Update version references** — bump version numbers in install instructions, compatibility matrices, etc.

5. Do not edit auto-generated files. If they need updating, note this for the user.

## Phase 5: Validation

1. **Re-verify every factual claim** against source code at the tag. This is the third verification pass (after Phase 2 and Phase 4).

2. **Build the site** — run the project's build command to check for broken links, missing references, or build errors.

3. **Run linting** — execute the project's lint/format commands.

4. **Run `/docs-review`** — invoke the docs-review skill on all changed and new files to catch style, structure, and clarity issues. Address its feedback before proceeding.

5. Fix any issues found. Re-run validation until clean.

## Phase 6: Handle Review Feedback

When receiving review comments (from humans or automated reviewers):

1. **Verify every review comment against source code** before acting on it. Reviewers can be wrong.

2. If a comment is correct — implement the fix and verify the result.

3. If a comment is incorrect — respond with evidence from the source code. Include the actual code snippet and the file path at the tag.

4. If a comment is ambiguous — check the source code to determine the correct behavior, then respond with your findings.

## Key Principles

- **Triple verification**: verify during deep dive (Phase 2), before finalizing (Phase 5), and when handling reviews (Phase 6)
- **User checkpoints**: present the categorized summary (after Phase 1) and impact map (after Phase 3) for user approval before implementing
- **Respect auto-generated content**: identify and skip files that are updated by automated processes
- **Don't document hidden features**: skip features marked as hidden, experimental, or internal unless explicitly asked
- **Follow existing conventions**: match the project's style guide, writing voice, file structure, and naming patterns
- **Be project-agnostic**: this workflow applies to any upstream project and any docs site — do not assume specific frameworks, file paths, or tools
