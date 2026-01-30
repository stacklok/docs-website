---
description: Polish weekly ToolHive update posts (release notes) for publication
argument-hint: [filename]
---

# Polish ToolHive Updates

Polish the weekly ToolHive update post in `$ARGUMENTS` to ensure it's benefit-focused, accessible to both open source and commercial audiences, and follows Stacklok documentation standards.

Stacklok is the company behind ToolHive, an open source platform for running and managing Model Context Protocol (MCP) servers easily and securely.

## Usage

```text
/polish-toolhive-updates blog/toolhive-updates/YYYY-MM-DD-updates.mdx
```

Or simply:

```text
/polish-toolhive-updates YYYY-MM-DD-updates.mdx
```

## Context

- **Published weekly** at https://docs.stacklok.com/toolhive/updates
- **Location**: `blog/toolhive-updates/` directory in this repository
- **Format**: Docusaurus blog posts with frontmatter
- **Audience**: Mixed technical audience including open source contributors, enterprise evaluators, and existing commercial users
- **Style guide**: See `STYLE-GUIDE.md` in this repository
- **Examples**: Review existing posts in `blog/toolhive-updates/` for voice consistency

## Guiding Philosophy

**Quality over rigid adherence**: These guidelines aim to catch substantive issues - internal jargon, feature-listing without context, overselling, or unclear language. If a post already communicates benefits clearly and follows the general voice, don't rewrite it to match a template. Focus on fixing problems, not perfecting prose.

## Core Principles

### 1. Benefit-Focused, Not Feature-Lists

Every feature should answer: **"What can I now do that I couldn't before, and why does that matter?"**

**Bad**: "Added API management to Registry Server"

**Good**: "API-based management lets you add, update, or remove registries programmatically—useful for CI/CD pipelines and infrastructure-as-code approaches"

### 2. Honest About Maturity

- Avoid claiming production-readiness prematurely
- Use phrases like "adds more operational capabilities," "moves closer to production readiness," "foundational capabilities"
- Don't oversell—these are incremental improvements showing project momentum

### 3. Accessible Language

- Avoid internal jargon ("productization push," "CRD configuration" without context)
- Explain technical terms when first used
- Focus on outcomes over implementation details
- Keep sentences clear and scannable

### 4. Dual Audience Considerations

- **Open source users**: Care about capabilities, flexibility, standards compliance
- **Commercial evaluators**: Care about enterprise requirements (compliance, operations, automation)
- Frame benefits to resonate with both groups

## Review Process

When you receive a draft update post:

1. **Read the entire draft** in `$ARGUMENTS` (or `blog/toolhive-updates/$ARGUMENTS` if only the filename is provided)
2. **Check existing posts** in `blog/toolhive-updates/` for voice consistency
3. **Reference STYLE-GUIDE.md** for writing conventions
4. **Apply review checklist** (see below) - focus on substantive issues, not stylistic preferences
5. **Make edits ONLY if needed** - if the post is already well-written and benefit-focused, don't change for the sake of changing
6. **Run formatting/linting** if you made changes:

   ```bash
   npm run prettier:fix
   npm run eslint:fix
   ```

7. **Test the build** if you made changes:

   ```bash
   npm run build
   ```

8. **Summarize changes** and explain rationale, OR confirm the post is already in good shape

## Review Checklist

### Frontmatter

- [ ] **Title**: Thematic and benefit-oriented, not a feature list
  - If already benefit-focused, keep it - don't change for the sake of changing
  - Good: "Operational monitoring and deployment automation"
  - Good: "Registry Server scales up, vMCP gains observability"
  - Bad: "vMCP audit logs and health checks, plus Registry API management"
- [ ] **Description**: Concise summary (1 sentence) covering main components
- [ ] **Sidebar label**: Short, scannable version of title

### Opening Paragraph

- [ ] Sets theme/narrative for the week's changes
- [ ] Avoids internal jargon
- [ ] Hints at value without detailed feature lists
- [ ] Includes `{/* truncate */}` comment after opening for blog preview

### Feature Sections

For each major feature/component:

- [ ] **Section title**: Component name + clear benefit (if present)
- [ ] **Opening sentence**: High-level value proposition when possible
- [ ] **Bullet points**: Ideally start with bolded outcome, then explain mechanism
  - Preferred format: `**What it enables** explanation of how it works and why it matters`
  - But flexibility is okay - not every bullet needs this exact format if the benefit is already clear
- [ ] Technical details provide context but don't obscure benefits
- [ ] Avoid overselling maturity

**Important**: Don't over-rotate on benefit-first framing. If a section already communicates value clearly, different bullet styles are acceptable. Focus on fixing actual problems, not imposing a rigid template.

### Required Closing Section

- [ ] **Always present**: Standard "Getting started" section with repo links (see [Standard Closing Section](#standard-closing-section) below)
- [ ] **Never modified**: This section is standardized across all updates

### Technical Accuracy

- [ ] Feature descriptions are technically correct
- [ ] Don't promise capabilities that don't exist yet
- [ ] Note when features are "coming soon" vs. available now

### Style & Formatting

- [ ] Follows STYLE-GUIDE.md conventions
- [ ] Active voice where possible
- [ ] Consistent terminology (check against existing docs and posts)
- [ ] Professional but not corporate-speak
- [ ] Proper Markdown formatting
- [ ] Code blocks use appropriate language identifiers

## Common Issues to Fix

### Issue: Internal Jargon

**Before**: "This week ToolHive continued the productization push"

**After**: "This week ToolHive added features that move closer to production readiness"

### Issue: Feature-First Instead of Benefit-First

**Before**: "Monitor which MCP servers behind vMCP are available and responding"

**After**: "**Health monitoring** tracks which MCP servers behind vMCP are available and responding—the foundation for building alerts and dashboards"

### Issue: Too Much Technical Detail Too Soon

**Before**: "Configure auth settings directly in the Registry CRD rather than managing a separate configuration"

**After**: "**Simplified authentication**: Configure auth settings directly in the Registry CRD instead of managing separate configuration files"

### Issue: Underselling Improvements

**Before**: "The UI can now connect directly to registries via API"

**After**: "The ToolHive UI now connects directly to standards-compliant registry API servers. Instead of importing static JSON snapshots, you get live registry data"

### Issue: Overselling Maturity

**Before**: "vMCP now supports the operational requirements teams need for production"

**After**: "vMCP adds more operational capabilities that teams need for production deployments"

## Standard Closing Section

**Every update post must end with this exact section:**

```markdown
### Getting started

For detailed release notes, check the project repositories:

- [ToolHive Runtimes](https://github.com/stacklok/toolhive/releases) (CLI and Kubernetes Operator)
- [ToolHive Desktop UI](https://github.com/stacklok/toolhive-studio/releases)
- [ToolHive Registry Server](https://github.com/stacklok/toolhive-registry-server/releases)

You can find all ToolHive documentation on the [Stacklok documentation site](/toolhive).
```

**Do not modify this section.** It's standardized across all update posts for consistency.

## Example Output Formats

### When changes are needed

```markdown
## Changes Made

### Frontmatter

- Changed title from "X" to "Y" to focus on benefits rather than features
- Updated description to be more concise and cover all components

### Content

- Reframed vMCP section to lead with operational value
- Added benefit context to Registry Server API management
- Expanded UI section to explain the improvement over static imports

### Formatting

- Ran prettier:fix and eslint:fix
- Verified build passes

## Key Improvements

1. Removed internal jargon ("productization push")
2. Changed feature-first to benefit-first framing throughout
3. Added honest maturity language ("adds more" instead of "now supports")

## Notes

The post now clearly articulates value for both OSS and commercial audiences while maintaining technical accuracy and honest positioning about maturity.
```

### When the post is already in good shape

```markdown
## Review Complete

I've reviewed the post against the checklist and it's already in excellent shape:

### What's Working Well

- **Title and frontmatter**: Benefit-focused and concise
- **Opening paragraph**: Sets clear theme without internal jargon
- **vMCP section**: Strong benefit-first framing with "You can now:" structure
- **Registry Server section**: Clear value propositions
- **Technical accuracy**: Honest about maturity, no overselling
- **Closing section**: Standard format present

### Minor Note

The Registry Server bullets could optionally be reframed with bolded benefits, but the current style already communicates value clearly. No changes needed.

No formatting/linting issues found. The post is ready for publication.
```
