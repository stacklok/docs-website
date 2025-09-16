---
title: Explore the registry
description: How to use the built-in registry to find MCP servers.
---

ToolHive includes a built-in registry of MCP servers with verified
configurations that meet a
[minimum quality standard](../concepts/registry-criteria.md), allowing you to
discover and deploy high-quality tools effortlessly. Simply select one from the
list and run it securely with a single command.

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
thv search <TERM>
```

For example, to locate servers related to GitHub:

```bash
thv search github
```

## View server details

To view detailed information about a specific MCP server, run:

```bash
thv registry info <SERVER_NAME>
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
thv registry info <SERVER_NAME> --format json
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

## Use a custom registry

By default, ToolHive uses a built-in registry of verified MCP servers. You can
configure ToolHive to use a custom registry instead. This is useful for
organizations that want to maintain their own private registry of MCP servers.

The registry is a JSON file that follows the
[ToolHive registry schema](../reference/registry-schema.mdx). Once you configure
a custom registry, ToolHive uses it for all commands that interact with the
registry, such as `thv registry list`, `thv registry info`, and `thv run`.

Refer to the
[built-in registry file](https://github.com/stacklok/toolhive/blob/main/pkg/registry/data/registry.json)
for examples of MCP server entries.

### Set a remote registry URL

To configure ToolHive to use a remote registry, set the registry URL:

```bash
thv config set-registry <URL>
```

For example:

```bash
thv config set-registry https://example.com/registry.json
```

### Set a local registry file

To configure ToolHive to use a local registry, set the registry file:

```bash
thv config set-registry <PATH>
```

### Check the current registry location

To see which registry (URL or path) is currently configured:

```bash
thv config get-registry
```

If no custom registry is configured, this command indicates that the built-in
registry is being used.

### Revert to the built-in registry

To remove the custom registry configuration and revert to using the built-in
registry:

```bash
thv config unset-registry
```

This restores the default behavior of using ToolHive's built-in registry.

## Organize servers with registry groups

Registry groups allow you to organize related MCP servers and run them together
as a cohesive unit. This is particularly useful for creating team-specific
toolkits, workflow-based server collections, or environment-specific
configurations.

:::note

Registry groups are different from [runtime groups](./group-management.md).
Registry groups organize server definitions within registry files, while runtime
groups organize running server instances for access control.

:::

### Group structure

Groups are defined as a top-level array in your custom registry:

```json
{
  "servers": {
    // Individual servers
  },
  "groups": [
    {
      "name": "group-name",
      "description": "Description of what this group provides",
      "servers": {
        "server-name": {
          // Complete server definition
        }
      },
      "remote_servers": {
        "remote-server-name": {
          // Complete remote server definition
        }
      }
    }
  ]
}
```

### Key characteristics

- **Optional**: Groups are entirely optional. Omit the `groups` section if you
  only need individual servers
- **Independent server definitions**: Each group contains complete server
  configurations, not references to top-level servers
- **Self-contained**: Groups can define servers with the same names as top-level
  servers but with different configurations
- **Flexible membership**: The same server can appear in multiple groups with
  different configurations

### Example: Multi-environment groups

Here's an example showing how groups can organize servers for different
purposes:

```json title='registry-with-groups.json'
{
  "$schema": "https://raw.githubusercontent.com/stacklok/toolhive/main/pkg/registry/data/schema.json",
  "version": "1.0.0",
  "last_updated": "2025-08-15T10:00:00Z",
  "servers": {
    "production-fetch": {
      "description": "Production web content fetching server",
      "image": "ghcr.io/stackloklabs/gofetch/server:latest",
      "status": "Active",
      "tier": "Community",
      "transport": "streamable-http",
      "permissions": {
        "network": {
          "outbound": {
            "allow_host": [".company.com"],
            "allow_port": [443]
          }
        }
      }
    }
  },
  "groups": [
    {
      "name": "frontend-dev",
      "description": "Tools for frontend development team",
      "servers": {
        "dev-fetch": {
          "description": "Development web content fetching with broader access",
          "image": "ghcr.io/stackloklabs/gofetch/server:latest",
          "status": "Active",
          "tier": "Community",
          "transport": "streamable-http",
          "permissions": {
            "network": {
              "outbound": {
                "allow_host": ["*"],
                "allow_port": [80, 443]
              }
            }
          }
        }
      }
    },
    {
      "name": "testing-suite",
      "description": "Servers needed for automated testing workflows",
      "servers": {
        "test-fetch": {
          "description": "Restricted fetch server for testing",
          "image": "ghcr.io/stackloklabs/gofetch/server:latest",
          "status": "Active",
          "tier": "Community",
          "transport": "streamable-http",
          "args": ["--timeout", "5s"],
          "permissions": {
            "network": {
              "outbound": {
                "allow_host": ["test.example.com"],
                "allow_port": [443]
              }
            }
          }
        }
      }
    }
  ]
}
```

This registry provides:

- A production-ready `production-fetch` server at the top level
- A `frontend-dev` group with a more permissive `dev-fetch` server
- A `testing-suite` group with a restricted `test-fetch` server

Each server has the same base image but different configurations appropriate for
its use case.

### Run registry groups

You can run entire groups using the group command:

```bash
# Run all servers in the frontend-dev group
thv group run frontend-dev

# Run all servers in the testing-suite group
thv group run testing-suite

# You can also pass environment variables and secrets to group runs
thv group run frontend-dev --env DEV_MODE=true --secret API_KEY=my-secret
```

Groups provide a convenient way to start multiple related servers with a single
command.

## Next steps

See [Run MCP servers](./run-mcp-servers.mdx) to run an MCP server from the
registry.

Learn how to [create a custom MCP registry](../tutorials/custom-registry.mdx).

## Related information

- [`thv registry` command reference](../reference/cli/thv_registry.md)
- [`thv search` command reference](../reference/cli/thv_search.md)
- [`thv config set-registry` command reference](../reference/cli/thv_config_set-registry.md)
- [`thv config get-registry` command reference](../reference/cli/thv_config_get-registry.md)
- [`thv config unset-registry` command reference](../reference/cli/thv_config_unset-registry.md)
