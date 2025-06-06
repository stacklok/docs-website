---
title: ToolHive Kubernetes operator
description: Manage MCP servers in Kubernetes with the ToolHive operator
sidebar_position: 1
sidebar_label: Introduction
---

The ToolHive Kubernetes operator manages MCP servers in Kubernetes clusters. It
lets you define MCP servers as Kubernetes resources and automates their
deployment and management.

:::info Experimental

The Kubernetes operator is still under active development and isn't recommended
for production use cases yet. We'd love for you to try it out and send feedback.

See the
[ToolHive Operator quickstart tutorial](../tutorials/toolhive-operator.mdx) to
get started quickly using a local kind cluster.

:::

## Overview

The operator introduces a new Custom Resource Definition (CRD) called
`MCPServer` that represents an MCP server in Kubernetes. When you create an
`MCPServer` resource, the operator automatically:

1. Creates a Deployment to run the MCP server
2. Sets up a Service to expose the MCP server
3. Configures the appropriate permissions and settings
4. Manages the lifecycle of the MCP server

```mermaid
flowchart TB
  subgraph K8s["<h3>Kubernetes cluster</h3>"]
    subgraph K8s1["**Deployment**"]
      Svc1["SSE Proxy<br>Service"] -- http/sse --> Proxy1["SSE Proxy<br>Pod"] -- stdio or http/sse --> MCP1["MCP Server<br>Pod"]
      Proxy1 -.->|creates| MCP1
    end
    subgraph K8s2["**Deployment**"]
      Svc2["SSE Proxy<br>Service"] -- http/sse --> Proxy2["SSE Proxy<br>Pod"] -- stdio or http/sse --> MCP2["MCP Server<br>Pod"]
      Proxy2 -.->|creates| MCP2
    end
    Ingress["Ingress"] -- http/sse --> Svc1 & Svc2
    Operator["ToolHive<br>Operator"] -.->|creates| K8s1 & K8s2
  end

  Client["MCP Client<br>[ex: Copilot]"] -- http/sse --> Ingress
```

## Installation

[Use Helm to install the ToolHive operator](./deploy-operator-helm.md) in your
Kubernetes cluster. Helm simplifies the installation process and lets you manage
the operator using Helm charts.

Once the operator is installed, you can create and manage MCP servers using the
[`MCPServer` custom resource](./run-mcp-k8s.md).
