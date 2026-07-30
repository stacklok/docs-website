---
name: mcp-guide-writer
description: >
  Create usage guides for MCP servers in the ToolHive documentation (docs/toolhive/guides-mcp/). Use when asked to write, create, or update a usage guide for an MCP server, e.g. "write a usage guide for the filesystem MCP server" or "document the sqlite MCP server from the registry".
argument-hint: '<server-name>'
---

# MCP server usage guide writer

Create accurate, user-friendly usage guides that help developers run an MCP server with ToolHive.

**Guide scope**: the guide's job is to get the server working with ToolHive: install, configure, connect a client, and try it out. It is not a tutorial for the upstream server itself. Keep upstream-server caveats and behavior details to a sentence with a link to the server's own documentation.

## Research and information gathering

- Use the `thv registry info <server-name> --format json` command to gather detailed information about the MCP server, including configuration options, capabilities, and requirements.
- Use the `WebFetch` tool, the `fetch` MCP server, or `github` MCP server to retrieve additional documentation from the server's repository.

## Structure

Write guides as MDX files in `docs/toolhive/guides-mcp/` following the `_template.mdx` structure exactly. Each guide must include ONLY these sections:

- Front matter with title, description, last_update author and today's date (`YYYY-MM-DD` format)
- Overview section explaining what the MCP server does
- Metadata section with `<MCPMetadata name='server-name' />` component
- Usage section with tabbed UI/CLI/Kubernetes instructions
- Sample prompts section with practical examples
- Recommended practices section with security and best practices

DO NOT include:

- Available tools/capabilities section (handled by MCPMetadata component)
- Configuration options section (handled by MCPMetadata component)

## Technical accuracy

All configuration examples must be valid and tested. Reference the existing ToolHive documentation in the `docs/toolhive/` directory as the source of truth for:

- Available `thv` CLI commands and their syntax (reference: `docs/toolhive/reference/cli/*.md` or run `thv --help`)
- Kubernetes CRD specifications and fields (reference: `static/api-specs/toolhive-crds/*.schema.json`)
- UI configuration options and workflows (reference: `docs/toolhive/guides-ui/*`)

## Documentation standards

Adhere to the project's writing style guide (`STYLE-GUIDE.md`) including:

- Use US English with casual, conversational tone
- Address readers in second person ("you", "your")
- Use sentence case for headings
- Apply proper Markdown formatting (ATX headings, fenced code blocks with language tags)
- Include descriptive alt text for images
- Use admonitions (`:::note`, `:::tip`, `:::warning`) for important information, using `:::tip[Title]` format for custom titles

## Practical examples

Provide real-world, actionable examples that users can copy and modify. Include:

- CLI usage examples covering the common configurations for this server, including security configurations
- Complete Kubernetes manifests with proper YAML formatting
- UI configuration guidance focusing on unique features
- Sample prompts that demonstrate real use cases for the MCP server
- Security-focused examples using network isolation and permission profiles

## Reference existing guides

- Use `docs/toolhive/guides-mcp/_template.mdx` as the reference for exact structure.
- Use existing guides as reference for tone and depth of coverage. A good example is `docs/toolhive/guides-mcp/github.mdx`.

## Quality assurance

Before finalizing, verify that:

- All code examples are syntactically correct
- Configuration parameters match the actual MCP server requirements
- Links to external resources are valid and current
- The guide follows the established template structure
- Examples work with current ToolHive versions

## Content structure requirements

1. **Overview section**: Provide a clear, concise explanation of the MCP server's purpose and key features. Include links to official documentation and highlight what makes this server unique.

2. **Usage section tabs**:

   Using the MCP server's documentation as reference, use its unique features and use cases to create detailed instructions for each tab:
   - **UI tab**: Focus on unique configuration options and features, not basic registry selection. The ToolHive UI includes a configuration interface that allows users to set the secrets and environment variables defined in the server metadata, customize command-line arguments, and add volume mounts. Provide step-by-step instructions for these configurations if needed for the MCP server.
   - **CLI tab**: Provide examples covering the common configurations, including security configurations.
   - **Kubernetes tab**: Include complete, working YAML manifests with proper formatting and comments.

3. **Sample prompts**: Create 3-6 realistic prompts that demonstrate the server's capabilities. Make them specific and actionable, not generic.

4. **Recommended practices**: Focus on security, performance, and reliability best practices specific to the MCP server.
