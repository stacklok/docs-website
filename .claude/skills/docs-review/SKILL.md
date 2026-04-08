---
name: docs-review
description: >
  Perform comprehensive editorial reviews of documentation with a tech writer / copyeditor lens. Use when asked to review docs, documentation PRs, or documentation changes - especially net-new documentation or LLM-generated content. Reviews can be for single documents or multiple related documents. Focuses on information architecture, clarity, conciseness, structure, readability, and style. Identifies common LLM writing patterns that harm documentation quality and catches multi-document issues like content duplication or misplaced content.
---

# Documentation Review

Perform critical editorial reviews as a tech writer / copyeditor, focusing on clarity, conciseness, structure, and readability.

## Review Process

1. **Read the document(s) fully** before making observations
2. **Check related documents** if reviewing changes to existing docs or new docs in a doc set
3. **Check for a project style guide** (STYLE-GUIDE.md, CLAUDE.md, or similar)
4. **Verify claims against authoritative sources** - cross-check documented behavior against CLI reference docs, API specs, auto-generated references, and upstream specifications. Note: docs may be drafted ahead of a release, so auto-generated references may lag behind - flag contradictions, not just absences
5. **Walk through as the reader** - mentally follow the page as a user doing the task for the first time. Are prerequisites complete? Can you follow each step in order? Would you have the knowledge needed at each point, or does the page assume something it hasn't established?
6. **Assess information architecture** - document placement, scope, cross-document duplication
7. **Assess overall structure** - TOC length, information flow, Diataxis alignment
8. **Identify specific issues** with concrete examples and line numbers
9. **Provide actionable recommendations** - not just problems, but solutions

## Primary Review Criteria

### Information Architecture

**Document placement and scope** - Check first, as misplaced content is more critical than prose issues:

- **Right document test**: Does content match the document's core purpose?
  - Configuration content doesn't belong in mode-selection guides
  - Operational monitoring isn't discovery-mode-specific
  - Example: "Health checks apply to both modes" → belongs in general config, not mode guide
- **Single source of truth**: Same topic documented in multiple places?
  - Keep detailed content in ONE location
  - Others link to it with brief context
  - Red flag: Same config section in 3+ documents
- **Document scope drift**: Content that doesn't match the title/purpose
  - If removing a section wouldn't hurt the doc's main goal, it probably doesn't belong
- **Missing cross-references**: Related topics should link bidirectionally

**Diataxis document type alignment**:

- **How-to guides**: Should focus on ONE task/problem, not multiple unrelated tasks
- **Tutorials**: Don't mix with reference material or troubleshooting
- **Reference**: Keep conceptual explanations and "why" separate
- **Concepts**: Should explain trade-offs and "when to use" clearly

### Structure and Length

- **TOC test**: If the table of contents fills a screen, the doc is likely too long
- **Heading count**: 20+ headings signals over-segmentation; consolidate
- **Information flow**: Conceptual content (trade-offs, when to use) should come before implementation details, not after
- **Diataxis alignment**: Don't mix tutorials, how-tos, reference, and concepts in one doc without clear separation

### LLM-Generated Content Patterns

Watch for these telltale signs of AI-generated docs that need human intervention:

| Pattern | Problem | Fix |
| --- | --- | --- |
| Excessive lists | Hard to scan, staccato reading | Convert to prose or tables |
| Mirror-image sections | "When to use X" / "When to use Y" as inverted duplicates | Consolidate into comparison table |
| Buried ledes | Key info (e.g., "it's automatic") comes after lengthy preamble | Lead with the most important point |
| Repetitive content | Same info in multiple sections | Deduplicate; single source of truth |
| Over-explaining | Verbose descriptions of obvious things | Trust the reader; cut aggressively |
| Hedging language | "may," "might," "could potentially" | Be direct or remove |
| Hedged lists | "such as," "including," "clients include" when listing supported items | Be definitive: state the full list, or link to a canonical reference |
| Placeholder examples | `my-skill`, `example-org`, `my-app` instead of real values | Use real, working examples from the actual product |
| Features without context | Introduces a flag/option without explaining why a reader would use it | Explain the user benefit and how it connects to concepts the reader already knows |

### Section Structure and Navigation

The docs follow a product-area-based information architecture under `docs/toolhive/`. Check:

- **Self-contained sections**: Product-specific content belongs in its product section (`docs/toolhive/guides-ui/`, `guides-cli/`, `guides-k8s/`, `guides-vmcp/`, `guides-registry/`), not in a shared section.
- **Quickstarts in product sections**: Quickstarts live inside their product section, not in a separate top-level section.
- **Integration placement**: Third-party integration guides (ngrok, Vault, OpenTelemetry, Okta, etc.) belong in `integrations/`, not in a product section.
- **Page ending pattern**: How-to guides and tutorials follow this closing pattern: Next steps > Related information > Troubleshooting (if applicable). "Next steps" contains 1-3 forward links to the next logical pages. Missing "Next steps" is a primary issue.
- **Inbound link coverage for new pages**: When a PR adds a new page, check that it is reachable beyond just the sidebar. New pages need inbound links from related pages (overviews, intros, feature lists, related how-to guides). A page with no inbound links is isolated in the user journey. For major new features, also check whether top-level intro/overview pages should mention the capability.
- **Introduction pages**: Each product section should have an Introduction as the first sidebar child. New sections must follow this pattern.
- **Progressive disclosure**: Core workflows should appear before advanced topics. Check that advanced content isn't mixed in with beginner-facing pages.
- **Forward navigation path**: A reader should be able to follow "Next steps" links from the quickstart through core workflows without relying on the sidebar.

### Clarity and Readability

- **Passive voice**: "Backend discovery occurs" → "vMCP discovers backends"
- **Redundant phrasing**: "uses discovered mode to automatically discover" → "automatically discovers"
- **Unexplained design decisions**: If something seems non-obvious (e.g., why a field is named counterintuitively), the doc should explain it
- **Inconsistent terminology**: Pick one term and use it consistently throughout
- **Ambiguous product terms**: When a product has components with overlapping names (e.g., "Registry" could mean a built-in registry or a Registry Server instance), docs must disambiguate. Readers at different points in their journey have different mental models
- **Prerequisites lacking operational context**: Don't just say "X must be running" - explain practical implications (is it a blocking command that needs a separate terminal? does it need to stay running persistently, or only during specific operations?)
- **Missing cross-references**: Related docs should link to each other. When a how-to page lists supported items (clients, platforms, etc.), link to the canonical reference rather than maintaining an inline list that can drift

### Accuracy and Trustworthiness

Docs that readers can't trust are worse than no docs. Actively verify:

- **Cross-check against reference material**: Does the prose contradict the auto-generated CLI reference, the API spec, or the upstream project's docs? Flag contradictions. Note: docs are often drafted before a release, so auto-generated references may not yet include new features - absence from the reference is not the same as a contradiction. But if an existing reference explicitly describes different behavior (e.g., "by name or OCI reference" when the prose also claims Git support), that's a real conflict to flag
- **Code examples must work**: Could a reader copy-paste this and get the described result? Check for correct syntax, realistic flag combinations, and valid argument values. Placeholder examples (`my-skill`, `example.com`) should be replaced with real, working values wherever possible
- **Feature coverage completeness**: When documenting a new feature, check that the full surface area is covered. Are all subcommands/endpoints mentioned? Are common error states addressed? A how-to that covers the happy path but ignores the most likely failure mode will generate support questions
- **Consistency across the doc set**: Do the same terms, flag names, and behaviors described here match how they're described in related pages? Cross-document inconsistencies (e.g., one page says "space-delimited," another uses comma-separated) erode trust

### Front Matter Descriptions

The `description` field serves double duty: DocCard preview (truncated at ~70-75 characters) and `<meta>` description for SEO (ideally 80-150 characters total). Check for:

- **Front-loading**: The first 70 characters must be a useful standalone summary. If the DocCard cutoff would leave a confusing fragment, the description needs rewriting
- **Filler openers**: Flag descriptions starting with "Learn how to," "Understanding," "A guide to," "This page describes," or similar. Lead with the action or topic
- **Too short** (under 50 characters): Misses SEO value. Expand with concrete detail about what the page covers
- **Too long** (over 160 characters): Will be truncated in search results. Tighten
- **YAML safety**: Unquoted colons (`:`) inside description values break YAML parsing. Flag and suggest rephrasing or quoting

### Accessibility and Formatting

- **Emojis in prose**: Can cause screen reader issues; use sparingly or not at all
- **Long code blocks without context**: Add titles and highlight key lines, stay focused on the concept being explained
- **Tables vs lists**: Tables are better for comparisons; lists for sequences
- **Collapsible sections**: Use for lengthy troubleshooting or optional details

## Output Format

Structure your review as:

```markdown
## Summary

[1-2 sentence overall assessment]

## Primary Issues

### 1. [Issue name]

[Description with specific line numbers] **Ask:** [Concrete action to take]

### 2. [Issue name]

...

## Secondary Issues

| Issue | Recommendation |
| ----- | -------------- |
| ...   | ...            |

## Inline Suggestions

[Note any specific line-level edits to suggest]
```

## Severity Guidelines

**Primary issues** (address before merge):

- Accuracy: documented behavior contradicts CLI reference, API spec, or upstream source
- Accuracy: code examples that won't work if copy-pasted (wrong syntax, nonexistent flags, invalid arguments)
- Information architecture: content in wrong document, cross-document duplication
- Content placed in the wrong section (e.g., product-specific content in Concepts, integration content in a product section)
- Missing "Next steps" section on how-to guides and tutorials
- Structure problems that harm navigation
- Missing explanations for confusing design decisions
- Significantly buried or redundant content

**Secondary issues** (nice to have):

- Minor wording improvements
- Small redundancies within a document
- Style guide adherence

**Skip entirely**:

- Formatting/syntax (let linters handle this)
- Subjective preferences without clear benefit

## Review Checklist

Before finalizing your review, verify:

- [ ] Did you cross-check documented behavior against CLI references, API specs, and upstream sources?
- [ ] Did you walk through the page as a first-time user - can you follow every step in order?
- [ ] Did you verify code examples use correct syntax, valid flags, and real values?
- [ ] Did you check related documents for duplication or misplaced content?
- [ ] For new pages: did you check for sufficient inbound links from related pages (intros, overviews, feature lists)?
- [ ] Did you verify content belongs in the right document?
- [ ] Did you check for a project style guide?
- [ ] Are your recommendations actionable (not just "this is bad")?
- [ ] Did you provide specific line numbers for issues?
- [ ] Did you suggest concrete alternatives, not just problems?
- [ ] Is the review prioritized (primary vs secondary)?
- [ ] Did you acknowledge what works well, not just problems?
