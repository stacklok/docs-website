---
title: Frequently asked questions
sidebar_label: FAQ
description: Common questions about ToolHive.
---

## General questions

### What is ToolHive?

ToolHive is an open source platform that simplifies the deployment and
management of Model Context Protocol (MCP) servers. It runs MCP servers in
secure, isolated containers and provides tools to manage them easily. You can
run ToolHive as a graphical desktop app, command-line tool, or Kubernetes
operator.

### What is the Model Context Protocol (MCP)?

MCP is a protocol that allows AI applications to connect to external data
sources and tools. It provides a standardized way for AI models to access
real-world context like APIs, source code repositories, databases, and other
systems. Think of it as a bridge between AI models and the external systems
where your data and applications live.

### Do I need to know how to code to use ToolHive?

No. ToolHive includes a graphical interface that doesn't require coding
knowledge. However, some MCP servers may require configuration or secrets, such
as API keys, that you'll need to set up. The ToolHive CLI is more technical but
comes with comprehensive documentation.

### Is ToolHive free to use?

Yes, ToolHive is open source (Apache 2.0 licensed) and free to use. You can find
the source code on GitHub and use it without any licensing fees.

## Using MCP servers

### How do I find available MCP servers?

ToolHive includes a curated registry of verified MCP servers. You can browse
them from the **Registry** tab in the UI or by running `thv registry list` in
the CLI.

### What MCP servers are available?

The registry includes servers for common use cases, such as retrieving content
from the web using the
[GoFetch MCP server](https://github.com/StacklokLabs/gofetch), and for popular
services and platforms like:

- **Atlassian** – Access Jira and Confluence
- **AWS Documentation** – Query AWS service documentation
- **GitHub** – Access repositories, issues, and pull requests
- **Kubernetes** – Interact with Kubernetes clusters via the
  [MKP MCP server](https://github.com/StacklokLabs/mkp)
- **MongoDB**, **PostgreSQL**, **Redis** – Connect to databases
- **Notion** – Connect to Notion workspaces
- And many more

### Can I run MCP servers that aren't in the registry?

Yes. You can run any MCP server from a container image or source package, even
if it's not in the registry. Just provide the image name or package details when
starting the server using the CLI or UI. See the custom MCP server section in
the [UI guide](./guides-ui/run-mcp-servers.mdx#install-a-custom-mcp-server) and
[CLI guide](./guides-cli/run-mcp-servers.mdx#run-a-custom-mcp-server) for more
details.

The Kubernetes operator also supports custom MCP servers that are packaged as
container images.

:::tip

You can use the ToolHive CLI to run a custom MCP server from a source package
once, then export the Docker image for import into your container registry or
Kubernetes cluster to use it with the operator.

:::

## Security and permissions

### Is it safe to run MCP servers?

ToolHive runs MCP servers in isolated containers with minimal default
permissions. Each server runs in its own container with restricted access to
your system and network.

:::tip

For extra security, review the permission profiles and network isolation options
before running new or untrusted MCP servers.

:::

### How does ToolHive handle secrets like API keys?

ToolHive provides secure secrets management:

- Secrets are encrypted and stored securely on your system
- They're passed to MCP servers as environment variables
- Secrets never appear in plaintext in configuration files
- Integration with 1Password is also supported

### Can I control what an MCP server can access?

Yes. ToolHive uses permission profiles to control:

- **File system access** – Which directories the server can read or write
- **Network access** – Which hosts and ports the server can connect to

You can use built-in profiles or create custom ones for specific security
requirements.

### What's network isolation and when should I use it?

Network isolation creates a secure network architecture that filters all
outbound connections from MCP servers. Use the `--isolate-network` flag when
running servers that need strict network controls, especially in enterprise
environments.

## Enterprise and advanced usage

### Can I use ToolHive in my company?

Yes. ToolHive is designed for both individual developers and enterprise teams.
The Kubernetes Operator provides centralized management, security controls, and
integration with existing infrastructure for enterprise deployments.

### How do I deploy ToolHive in Kubernetes?

Use the ToolHive Kubernetes Operator to deploy and manage MCP servers as
Kubernetes resources. See the [Kubernetes guides](./guides-k8s/index.mdx) for
detailed instructions. The Kubernetes operator is currently experimental.

### Can I run my own custom MCP servers?

Yes. You can run custom MCP servers from Docker images or source packages.
ToolHive supports:

- Docker images from public or private registries
- Source packages from package managers like npm, PyPI, or Go modules

### How do I get my MCP server added to the ToolHive registry?

The ToolHive registry has specific
[inclusion criteria](./concepts/registry-criteria.md), such as being open
source, following good security practices, and maintaining code quality. Review
the criteria and
[submit your server for consideration](https://github.com/stacklok/toolhive/issues/new?template=add-an-mcp-server.md).

### Can I use ToolHive behind a corporate firewall?

Yes. ToolHive supports corporate environments with:

- Custom CA certificate configuration for TLS inspection
- Network isolation and permission profiles
- Integration with secret management systems like 1Password

## Getting help

### Where can I get help if I'm stuck?

- **Documentation** – Check the comprehensive guides and reference documentation
- **GitHub Issues** – Report bugs or request features on the
  [ToolHive GitHub repository](https://github.com/stacklok/toolhive/issues)
- **Discord Community** – Join the
  [Stacklok Discord](https://discord.gg/stacklok) for community support
- **Troubleshooting sections** – Each guide includes troubleshooting tips for
  common issues

### How do I report a bug or request a feature?

Open an issue in the appropriate GitHub repository:

- [**ToolHive UI**](https://github.com/stacklok/toolhive-studio/issues) – For
  issues specific to the graphical desktop app
- [**ToolHive CLI & Kubernetes**](https://github.com/stacklok/toolhive/issues) –
  For issues related to the CLI tool or Kubernetes operator

### Is there a community I can join?

Yes! Join the [Stacklok Discord community](https://discord.gg/stacklok) to
connect with other ToolHive users, ask questions, and share your experiences.
There's a dedicated `#toolhive-developers` channel for technical discussions.
