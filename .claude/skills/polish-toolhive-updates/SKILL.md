---
name: polish-toolhive-updates
description: Polish weekly ToolHive update posts (release notes) for publication. Use when reviewing, editing, or improving ToolHive update blog posts in blog/toolhive-updates/. Reviews frontmatter, content structure, benefit framing, and ensures consistent style.
---

# Polish ToolHive Updates

Polish weekly ToolHive update posts to ensure they're benefit-focused, accessible to both open source and commercial audiences, and follow Stacklok documentation standards.

## Context

- **Published weekly** at https://docs.stacklok.com/toolhive/updates
- **Location**: `blog/toolhive-updates/` directory in this repository
- **Format**: Docusaurus blog posts with frontmatter
- **Audience**: Mixed technical audience including open source contributors, enterprise evaluators, and existing commercial users
- **Style guide**: See `STYLE-GUIDE.md` in this repository
- **Examples**: Review existing posts in `blog/toolhive-updates/` for voice consistency

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

1. **Read the entire draft** in `blog/toolhive-updates/[filename].md`
2. **Check existing posts** in `blog/toolhive-updates/` for voice consistency
3. **Reference STYLE-GUIDE.md** for writing conventions
4. **Apply review checklist** (see below)
5. **Make edits directly** to the file
6. **Run formatting/linting**:

   ```bash
   npm run prettier:fix
   npm run eslint:fix
   ```

7. **Test the build**:

   ```bash
   npm run build
   ```

8. **Summarize changes** and explain rationale

## Review Checklist

### Frontmatter

- [ ] **Title**: Thematic and benefit-oriented, not a feature list
  - Good: "Operational monitoring and deployment automation"
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

- [ ] **Section title**: Component name + clear benefit
- [ ] **Opening sentence**: High-level value proposition
- [ ] **Bullet points**: Start with bolded outcome, then explain mechanism
  - Format: `**What it enables** explanation of how it works and why it matters`
- [ ] Technical details provide context but don't obscure benefits
- [ ] Avoid overselling maturity

### Required Closing Section

- [ ] **Always present**: Standard "Getting started" section with repo links
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

- [ToolHive Registry Server](https://github.com/stacklok/toolhive-registry/releases)
- [ToolHive desktop UI](https://github.com/stacklok/toolhive-studio/releases)
- [ToolHive Cloud UI](https://github.com/stacklok/toolhive-cloud-ui/releases)
- [ToolHive runtimes](https://github.com/stacklok/toolhive/releases) (CLI and
  Kubernetes Operator)

You can find all ToolHive documentation on the
[ToolHive documentation site](/toolhive).
```

**Do not modify this section.** It's standardized across all update posts for consistency.

## Workflow

When polishing an update post:

1. **Read the draft** and assess overall tone
2. **Identify issues** using the checklist and common issues guide
3. **Make edits** directly to the file in `blog/toolhive-updates/`
4. **Add closing section** if missing
5. **Run linting and formatting**:

   ```bash
   npm run prettier:fix
   npm run eslint:fix
   ```

6. **Test build**:

   ```bash
   npm run build
   ```

7. **Summarize changes** with rationale:
   - What was changed and why
   - Key improvements made
   - Any concerns or questions

## Example Output Format

When you complete your review, provide:

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

The post now clearly articulates value for both OSS and commercial audiences
while maintaining technical accuracy and honest positioning about maturity.
```

## Testing

After making changes:

```bash
# Format and lint
npm run prettier:fix
npm run eslint:fix

# Verify build works
npm run build
```

All commands must pass before the post is ready for publication.
