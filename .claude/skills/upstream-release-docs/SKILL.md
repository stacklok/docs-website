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

4. **Log the categorized summary** for transparency, then proceed to Phase 2.

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

3. **Understand the "why"** — for new features, look beyond the code to understand motivation and intended usage:
   - Check linked issues for user stories, acceptance criteria, and "definition of done"
   - Follow references to RFCs, design docs, or PRDs linked from issues or PR descriptions
   - Identify the intended user workflow: who uses this, why, and what happens after?
   - Map the full lifecycle: if the feature has a publish/produce side, identify the consume/discover side too. Document both.
   - If the "why" and consumption story aren't clear from any source, flag this gap — documentation that only covers the API surface without explaining purpose or workflow is incomplete

4. **Read the actual source code at the release tag** to verify every claim made in the PR description:

   ```
   gh api repos/OWNER/REPO/contents/PATH?ref=TAG
   ```

   The response is base64-encoded; decode it to read the content.

5. Note discrepancies between PR descriptions and actual code. Trust the code.

6. Identify:
   - **Auto-generated content** — files generated from upstream (OpenAPI specs, CLI reference docs, JSON schemas). Do not manually edit these; flag them for automated update instead. However, auto-generated reference docs (e.g., API endpoints from a swagger spec) do **not** replace the need for conceptual explanations, guide content, or cross-references in existing pages. A new feature with auto-generated API docs still needs: (1) a conceptual explanation of what it is and why it exists, (2) mentions and cross-references in related existing pages (intro pages, feature lists, related guides), and (3) guide content if the feature has non-trivial workflows. Only skip creating a **duplicate API reference page** — never skip the surrounding documentation.
   - **Hidden/experimental features** — look for indicators like `Hidden: true` in CLI command definitions, feature flags, or internal-only annotations. Do not document these unless the user explicitly asks.

## Phase 3: Audit Existing Docs

1. Search the documentation codebase for references to affected areas:
   - Config values, env var names, CLI flags
   - Feature names, API paths, version numbers
   - Any terminology that changed

2. Check the project style guide (CLAUDE.md, STYLE-GUIDE.md, or similar) for conventions.

3. Build an **impact map** — a table with these columns:

   | File | Current text/value | Verified replacement | Change type       |
   | ---- | ------------------ | -------------------- | ----------------- |
   | path | what exists now    | what it should be    | update/new/remove |

4. **Log the impact map** for transparency, then proceed to Phase 4.

## Phase 4: Implementation

Apply the approved changes:

1. **Update existing pages** — edit files using the impact map. Preserve the existing writing style and conventions.

2. **Create new pages** for new features that lack existing documentation. Default to documenting new features rather than skipping them:

   **Diataxis separation** — create separate pages per document type, not one combined page:
   - **Concept page** (explanation): What is this feature, why does it exist, when would you use it? Lead with concrete scenarios and user personas ("If you maintain a shared MCP registry and want to let teams publish reusable tool bundles..."). Explain relationships to existing features.
   - **Guide page** (how-to): Task-oriented, organized by user goals — not by API endpoint order. Include practical examples: realistic `curl` commands, sample payloads with plausible values, expected responses, and error cases. If a feature has both producer and consumer sides, document both workflows.
   - **Reference page**: Only create if not already auto-generated. If auto-generated API reference exists, link to it instead of duplicating endpoint listings.

   **Consumer workflow** — always document "then what?" after the producer/API side. If a feature has a publish/consume pattern, document how consumers discover and use what was published. If consumption tooling isn't built yet, say so explicitly rather than leaving a gap.

   **Practical examples** — every guide page needs at least one end-to-end example with:
   - Realistic sample data (not `foo`/`bar` placeholders)
   - The exact commands or API calls to run
   - Expected output or response
   - What to do if something goes wrong

   **Naming conventions** — when the feature introduces naming rules (e.g., kebab-case identifiers, camelCase config keys), call these out explicitly with examples of valid and invalid names.

   **Page mechanics:**
   - Place each page in the appropriate directory
   - Update sidebar/navigation configuration
   - Update frontmatter descriptions on all new and modified pages
   - Only skip creating a page that would duplicate auto-generated reference content (e.g., don't manually list API endpoints that are already in a swagger-rendered page)

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
- **Transparency**: log the categorized summary (after Phase 1) and impact map (after Phase 3) for auditability, but do not stop — run all phases to completion
- **Respect auto-generated content**: don't manually edit auto-generated files, but always create the surrounding conceptual/guide content that auto-generated reference docs don't provide
- **Separate by Diataxis type**: never combine concepts and how-to guides in a single page. Create separate pages for each document type.
- **Document the full lifecycle**: if a feature has producer and consumer sides, document both. Always answer "then what?" — don't leave the reader at the API call with no guidance on what happens next.
- **Lead with scenarios, not abstractions**: open concept pages with concrete "who is this for and why should they care" scenarios, not abstract definitions
- **Flag gaps honestly**: if consumption tooling, client support, or integration isn't ready yet, say so explicitly rather than omitting the topic
- **Use realistic examples**: guide pages need end-to-end examples with plausible data, exact commands, and expected output — not placeholder values
- **Call out naming conventions**: when a feature introduces naming rules (casing, allowed characters, namespacing), document them explicitly with valid/invalid examples
- **Don't document hidden features**: skip features marked as hidden, experimental, or internal unless explicitly asked
- **Follow existing conventions**: match the project's style guide, writing voice, file structure, and naming patterns
- **Be project-agnostic**: this workflow applies to any upstream project and any docs site — do not assume specific frameworks, file paths, or tools
