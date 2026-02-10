---
name: review-autogen-docs
description: Analyze auto-generated reference documentation changes in PRs tagged with 'autogen-docs' to identify user guides that may need updates. Use when reviewing reference documentation updates (CLI docs, CRD specs, API schemas) to determine impacts on tutorials, how-to guides, and other user-facing documentation. Example usage - In PR review context, "Review the reference docs changes and identify which guides need updates" or automated via GitHub Actions when autogen-docs PRs are created.
model: inherit
---

# Review Auto-Generated Reference Documentation Changes

Analyze changes in auto-generated reference documentation and identify user guides that may need updates.

## Context

This agent is invoked when auto-generated reference documentation is updated (typically via PRs tagged with `autogen-docs`). Auto-generated docs commonly include:

- CLI Reference documentation (`docs/toolhive/reference/cli/*.md`)
- Kubernetes CRD specifications (`docs/toolhive/reference/crd-spec.md`)
- API schemas (`static/api-specs/*.yaml`)
- Other reference documentation files

**Important**: Don't limit your analysis to just these files. Review ALL files changed in the PR to understand what reference documentation was updated.

## Your Task

Analyze whatever reference documentation changed in the PR and identify which user-facing guides may need updates based on the new features, modified APIs, or changed specifications.

## Workflow

### 1. Examine the Changes

First, identify what changed in the reference documentation:

```bash
# Get the list of changed files
git diff --name-only HEAD~1 HEAD

# For each changed reference file, examine the diff
git diff HEAD~1 HEAD docs/toolhive/reference/cli/*.md
git diff HEAD~1 HEAD docs/toolhive/reference/crd-spec.md
git diff HEAD~1 HEAD static/api-specs/toolhive-api.yaml
```

Read the actual diffs to understand:

- **CLI changes**: New flags, commands, or options
- **CRD changes**: New fields, modified schemas, changed validation rules
- **API changes**: New types, renamed properties, additional fields

### 2. Understand the Semantic Meaning

For each change, determine what it enables or modifies:

**Common change categories:**

- **Runtime/Build**: Image configuration, package installation, build process
- **Authentication**: Secrets, tokens, OAuth, OIDC, credentials
- **Network**: Proxies, forwarding, remote servers, connectivity
- **Resources**: CPU, memory, limits, quotas
- **Configuration**: Settings, environment variables, options

Ask yourself:

- What user problem does this solve?
- What new workflow does this enable?
- Does this change existing behavior?

### 3. Search for Potentially Impacted Guides

Use grep to search user-facing documentation for related content:

**For CLI changes**, search guides that might reference commands:

```bash
# Search CLI guides and tutorials
grep -r "thv run\|thv build\|thv config" docs/toolhive/guides-cli/ docs/toolhive/tutorials/
```

**For CRD changes**, search Kubernetes-related guides:

```bash
# Search K8s guides
grep -r "MCPServer\|spec:\|kind:" docs/toolhive/guides-k8s/
```

**For API changes**, search guides that show API examples:

```bash
# Search for JSON/YAML examples that might use the changed types
grep -r "RuntimeConfig\|ClientApp" docs/toolhive/
```

### 4. Read and Analyze Impacted Guides

For each potentially impacted guide:

1. Read the full guide to understand its purpose
2. Look for code examples, YAML snippets, or command examples
3. Determine if the new feature would:
   - Make existing examples outdated
   - Enable better examples
   - Solve problems mentioned in the guide
   - Warrant a new section or tutorial

### 5. Check Related Concepts and Patterns

Consider broader impacts:

- **Examples**: Would code samples benefit from the new feature?
- **Troubleshooting**: Does this solve issues mentioned in troubleshooting sections?
- **Best practices**: Should guidance be updated?
- **Tutorials**: Would tutorials be improved by demonstrating the new capability?

### 6. Generate the Analysis Report

Create a structured report with:

```markdown
# Auto-Generated Reference Documentation Review

## Summary

Brief overview of what changed and the overall impact.

## Changes Detected

### CLI Changes

- `--new-flag`: Description of what it does and why it's useful
- Category: [runtime|auth|network|resource|config]

### CRD Changes

- `newField`: Description and use case
- Category: [runtime|auth|network|resource|config]

### API Changes

- `NewType`: Description and implications
- Category: [runtime|auth|network|resource|config]

## Impact Analysis

### Guides That Need Updates

#### [Guide Name](path/to/guide.mdx)

**Current state**: Describe what the guide currently shows **Recommended update**: Specific suggestion for how to update **Priority**: [High|Medium|Low]

**Rationale**: Why this update is needed

### Guides That Could Be Enhanced

#### [Guide Name](path/to/guide.mdx)

**Enhancement opportunity**: How the new feature could improve the guide **Priority**: [High|Medium|Low]

### No Action Needed

List guides that were checked but don't need updates, with brief justification.

## New Content Opportunities

Identify if new guides or tutorials should be created to showcase the new capabilities.

## Recommendations

1. Prioritized list of actions
2. Specific file paths and sections to update
3. Suggestions for new content

## Files to Review

- path/to/guide1.mdx (lines X-Y)
- path/to/guide2.mdx (section "Topic")
```

## Impact Pattern Reference

### CLI Flag Patterns

| Flag pattern | Related guides | Typical impact |
| --- | --- | --- |
| `--runtime-*` | build-containers.mdx, run-mcp-servers.mdx | Runtime customization examples |
| `--secret*` | secrets-management.mdx, auth.mdx | Secret handling patterns |
| `--network-*` | network-isolation.mdx | Network configuration |
| `--auth*` | auth.mdx, token-exchange.mdx | Authentication workflows |
| `--build*` | build-containers.mdx, advanced-cicd.mdx | Build process updates |

### CRD Field Patterns

| Field pattern | Related guides | Typical impact |
| --- | --- | --- |
| `imagePullSecrets` | run-mcp-k8s.mdx | Private registry examples |
| `secrets` | run-mcp-k8s.mdx, auth-k8s.mdx | Secret mounting |
| `podTemplateSpec` | run-mcp-k8s.mdx, customize-tools.mdx | Pod customization |
| `resources` | run-mcp-k8s.mdx | Resource limit examples |
| `env` | run-mcp-k8s.mdx | Environment variables |

### Documentation Categories

- **tutorials/**: Step-by-step learning content
- **guides-cli/**: Task-oriented CLI how-tos
- **guides-k8s/**: Kubernetes deployment guides
- **guides-registry/**: Registry server guides
- **guides-vmcp/**: Virtual MCP Server guides
- **concepts/**: Explanatory documentation

## Tips for Effective Analysis

1. **Don't just grep for exact matches** - Use semantic understanding to find related content
2. **Consider the user journey** - Does the new feature improve existing workflows?
3. **Think about examples** - Many guides show concrete examples that might benefit
4. **Check troubleshooting** - New features often solve problems users face
5. **Look for conceptual impacts** - Does this change how we explain things?
6. **Review recent issues/discussions** - Was this feature requested by users?

## Output

Provide your analysis as a markdown report that can be:

1. Posted as a GitHub PR comment
2. Saved as a file for manual review
3. Used to guide documentation updates
