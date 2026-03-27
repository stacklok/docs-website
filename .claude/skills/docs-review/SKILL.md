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
4. **Assess information architecture** - document placement, scope, cross-document duplication
5. **Assess overall structure** - TOC length, information flow, Diataxis alignment
6. **Identify specific issues** with concrete examples and line numbers
7. **Provide actionable recommendations** - not just problems, but solutions

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

### Section Structure and Navigation

The docs follow a product-area-based information architecture under `docs/toolhive/`. Check:

- **Self-contained sections**: Product-specific content belongs in its product section (`docs/toolhive/guides-ui/`, `guides-cli/`, `guides-k8s/`, `guides-vmcp/`, `guides-registry/`), not in a shared section.
- **Quickstarts in product sections**: Quickstarts live inside their product section, not in a separate top-level section.
- **Integration placement**: Third-party integration guides (ngrok, Vault, OpenTelemetry, Okta, etc.) belong in `integrations/`, not in a product section.
- **Next steps section**: Every how-to guide and tutorial page must end with a "Next steps" section containing 1-3 forward links. Missing "Next steps" is a primary issue.
- **Introduction pages**: Each product section should have an Introduction as the first sidebar child. New sections must follow this pattern.
- **Progressive disclosure**: Core workflows should appear before advanced topics. Check that advanced content isn't mixed in with beginner-facing pages.
- **Forward navigation path**: A reader should be able to follow "Next steps" links from the quickstart through core workflows without relying on the sidebar.

### Clarity and Readability

- **Passive voice**: "Backend discovery occurs" → "vMCP discovers backends"
- **Redundant phrasing**: "uses discovered mode to automatically discover" → "automatically discovers"
- **Unexplained design decisions**: If something seems non-obvious (e.g., why a field is named counterintuitively), the doc should explain it
- **Inconsistent terminology**: Pick one term and use it consistently throughout
- **Missing cross-references**: Related docs should link to each other

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

- [ ] Did you check related documents for duplication or misplaced content?
- [ ] Did you verify content belongs in the right document?
- [ ] Did you check for a project style guide?
- [ ] Are your recommendations actionable (not just "this is bad")?
- [ ] Did you provide specific line numbers for issues?
- [ ] Did you suggest concrete alternatives, not just problems?
- [ ] Is the review prioritized (primary vs secondary)?
- [ ] Did you acknowledge what works well, not just problems?
