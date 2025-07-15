---
title: Explore the registry
description: How to use the built-in registry to find MCP servers.
---

ToolHive includes a built-in registry of MCPs with verified configurations,
allowing you to discover and deploy MCP servers effortlessly. Simply select one
from the list and run it securely with a single command.

## Find MCP servers

To list all MCP servers in the ToolHive registry, run:

```bash
thv registry list
```

This command displays a list of servers with their name, description, tier
(official or community), and the number of stars and downloads to help you
identify the most popular and useful servers.

Example output:

```text
NAME           DESCRIPTION                                                    TIER        STARS   PULLS
atlassian      Model Context Protocol (MCP) server for Atlassian product...   Community   2194    7789
elasticsearch  Connect to your Elasticsearch data directly from any MCP ...   Official    305     5429
everything     This MCP server attempts to exercise all the features of ...   Community   56714   10441
fetch          A Model Context Protocol server that provides web content...   Community   56714   9078
filesystem     Node.js server implementing Model Context Protocol (MCP) ...   Community   56714   14041
firecrawl      A powerful web scraping and content extraction MCP server...   Official    3605    7630
git            A Model Context Protocol server for Git repository intera...   Community   56714   7000
github         The GitHub MCP Server provides seamless integration with ...   Official    16578   5000
grafana        A Model Context Protocol (MCP) server for Grafana that pr...   Official    1014    4900
k8s            MKP is a Model Context Protocol (MCP) server for Kubernet...   Community   32      8064

<... trimmed for brevity ...>
```

You can also search by keyword to find servers related to a specific topic or
capability:

```bash
thv search <term>
```

For example, to locate servers related to GitHub:

```bash
thv search github
```

## View server details

To view detailed information about a specific MCP server, run:

```bash
thv registry info <server-name>
```

For example:

```bash
thv registry info github
```

ToolHive provides the server's description, available tools, configuration
options, and other metadata.

By default, ToolHive displays the server's configuration in a human-readable
format. To view the configuration in JSON format, use the `--format` option:

```bash
thv registry info <server-name> --format json
```

### Example output

```yaml {1,11,19,24} showLineNumbers
Name: github
Image: ghcr.io/github/github-mcp-server:latest
Description: The GitHub MCP Server provides seamless integration with GitHub APIs, enabling advanced automation and interaction capabilities for developers and tools
Tier: Official
Status: Active
Transport: stdio
Repository URL: https://github.com/github/github-mcp-server
Has Provenance: Yes
Popularity: 13894 stars, 5000 pulls
Last Updated: 2025-05-20T00:21:46Z
Tools:
  - get_me
  - get_issue
  - create_issue
  - add_issue_comment
  - list_issues
<... trimmed for brevity ...>

Environment Variables:
  - GITHUB_PERSONAL_ACCESS_TOKEN (required): GitHub personal access token with appropriate permissions
  - GH_HOST: GitHub Enterprise Server hostname (optional)
Tags:
  api, create, fork, github, list, pull-request, push, repository, search, update, issues
Permissions:
  Network:
    Allow Transport: tcp
    Allow Host: docs.github.com, github.com
    Allow Port: 443
Example Command:
  thv run github
```

This information helps you understand the server's capabilities, requirements,
and security profile before running it.

- **Server name** (line 1): The server name to use with the
  [`thv run`](../reference/cli/thv_run.md) command
- **Metadata** (lines 2-10): Details about the server, including the image name,
  description, status, transport method, repository URL, whether the server has
  SLSA provenance available for verification, and popularity
- **Tools list** (line 11): The list of tools this MCP server provides
- **Configuration** (line 19): Required and optional environment variables
  needed to run the server
- **Permissions** (line 24): The permission profile applied to the server,
  including file system and network access (see
  [Custom permissions](./custom-permissions.mdx))

## Use a remote registry

By default, ToolHive uses a built-in registry of verified MCP servers. You can
configure ToolHive to use a custom remote registry instead. This is useful for
organizations that want to maintain their own private registry of MCP servers.

### Set a remote registry URL

To configure ToolHive to use a remote registry, set the registry URL:

```bash
thv config set-registry-url <url>
```

For example:

```bash
thv config set-registry-url https://example.com/registry.json
```

The remote registry must be a JSON file that follows the same format as the
[built-in registry](https://github.com/stacklok/toolhive/blob/main/pkg/registry/data/registry.json).
Once you configure a remote registry, all registry commands
([`thv registry list`](../reference/cli/thv_registry_list.md),
[`thv registry info`](../reference/cli/thv_registry_info.md),
[`thv search`](../reference/cli/thv_search.md)) will use the remote registry
instead of the built-in one.

### Check the current registry URL

To see which registry URL is currently configured:

```bash
thv config get-registry-url
```

If no custom registry is configured, this command indicates that the built-in
registry is being used.

### Revert to the built-in registry

To remove the custom registry configuration and revert to using the built-in
registry:

```bash
thv config unset-registry-url
```

This restores the default behavior of using ToolHive's built-in registry.

## Contribute to the registry

If you have an MCP server that you'd like to add to the ToolHive registry, you
can
[open an issue](https://github.com/stacklok/toolhive/issues/new?template=add-an-mcp-server.md)
or submit a pull request to the ToolHive GitHub repository. The ToolHive team
will review your submission and consider adding it to the registry.

Criteria for adding an MCP server to the ToolHive registry are outlined in
[Registry criteria](../concepts/registry-criteria.md). These criteria ensure
that the servers in the registry meet the standards of security, quality, and
usability that ToolHive aims to uphold.

Registry entries are defined in the
[`pkg/registry/data/registry.json`](https://github.com/stacklok/toolhive/blob/main/pkg/registry/data/registry.json)
file in the ToolHive repository.

## Next steps

See [Run MCP servers](./run-mcp-servers.mdx) to run an MCP server from the
registry.

## Related information

- [`thv registry` command reference](../reference/cli/thv_registry.md)
- [`thv search` command reference](../reference/cli/thv_search.md)
- [`thv config set-registry-url` command reference](../reference/cli/thv_config_set-registry-url.md)
- [`thv config get-registry-url` command reference](../reference/cli/thv_config_get-registry-url.md)
- [`thv config unset-registry-url` command reference](../reference/cli/thv_config_unset-registry-url.md)
